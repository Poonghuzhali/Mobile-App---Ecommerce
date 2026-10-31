from django.contrib.auth import get_user_model
from rest_framework import serializers

from catalog.models import Product
from orders.models import Order
from orders.serializers import OrderSerializer

User = get_user_model()


class AdminCustomerSerializer(serializers.ModelSerializer):
    order_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "phone", "date_joined", "order_count")


class AdminOrderSerializer(OrderSerializer):
    customer_email = serializers.EmailField(source="user.email", read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + ("customer_email", "customer_name")

    def get_customer_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name or obj.user.username


class AdminOrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)
    message = serializers.CharField(required=False, allow_blank=True, max_length=255)


class AdminProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "sku",
            "category",
            "category_name",
            "price",
            "discount_price",
            "effective_price",
            "stock",
            "is_active",
            "is_featured",
        )


class AdminProductUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ("stock", "price", "discount_price", "is_active", "is_featured")
