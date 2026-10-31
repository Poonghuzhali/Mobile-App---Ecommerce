from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Address, WishlistItem
from .otp import mark_otp_used, verify_otp

User = get_user_model()


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accept email or username in the `username` field (SimpleJWT default)."""

    def validate(self, attrs):
        login = (attrs.get("username") or "").strip()
        if login:
            if "@" in login:
                user = User.objects.filter(email__iexact=login.lower()).first()
            else:
                user = User.objects.filter(username__iexact=login).first()
            if user:
                attrs["username"] = user.get_username()
        return super().validate(attrs)


class RegisterSendOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Email already registered.")
        return email


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True, min_length=6, max_length=6)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "phone", "password", "password_confirm", "otp")

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Email already registered.")
        return email

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        otp_record = verify_otp(attrs["email"], attrs["otp"])
        if not otp_record:
            raise serializers.ValidationError({"otp": "Invalid or expired OTP. Request a new code."})
        attrs["_otp_record"] = otp_record
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        validated_data.pop("otp")
        otp_record = validated_data.pop("_otp_record")
        password = validated_data.pop("password")
        validated_data["email"] = validated_data["email"].strip().lower()
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        mark_otp_used(otp_record)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "phone", "avatar", "is_staff")
        read_only_fields = ("id", "username", "email", "is_staff")


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id",
            "label",
            "full_name",
            "phone",
            "line1",
            "line2",
            "city",
            "state",
            "postal_code",
            "country",
            "is_default",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs):
        required = ["full_name", "phone", "line1", "city", "state", "postal_code"]
        for field in required:
            if field in attrs and not str(attrs[field]).strip():
                raise serializers.ValidationError({field: "This field is required."})
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        if validated_data.get("is_default") or not user.addresses.exists():
            validated_data["is_default"] = True
        address = Address.objects.create(user=user, **validated_data)
        if address.is_default:
            user.addresses.exclude(pk=address.pk).update(is_default=False)
        return address

    def update(self, instance, validated_data):
        address = super().update(instance, validated_data)
        if address.is_default:
            address.user.addresses.exclude(pk=address.pk).update(is_default=False)
        return address


class WishlistItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_price = serializers.DecimalField(source="product.effective_price", max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem
        fields = ("id", "product_id", "product_name", "product_price", "product_image", "created_at")
        read_only_fields = fields

    def get_product_image(self, obj):
        request = self.context.get("request")
        url = obj.product.primary_image_url
        if url and request:
            return request.build_absolute_uri(url)
        return url
