import logging
from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from catalog.models import Product
from notifications.models import Notification
from .models import Cart, CartItem, Order, OrderItem, OrderStatusHistory
from .payment_utils import cart_checkout_totals


class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    unit_price = serializers.DecimalField(source="product.effective_price", max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    primary_image = serializers.SerializerMethodField()
    stock = serializers.IntegerField(source="product.stock", read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "product_id", "product_name", "quantity", "unit_price", "subtotal", "primary_image", "stock")

    def get_primary_image(self, obj):
        request = self.context.get("request")
        url = obj.product.primary_image_url
        if url and request:
            return request.build_absolute_uri(url)
        return url


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "items", "total", "item_count", "updated_at")


class CartItemWriteSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate(self, attrs):
        product = Product.objects.filter(pk=attrs["product_id"], is_active=True).first()
        if not product:
            raise serializers.ValidationError({"product_id": "Product not found."})
        if attrs["quantity"] > product.stock:
            raise serializers.ValidationError({"quantity": f"Only {product.stock} in stock."})
        attrs["product"] = product
        return attrs


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "unit_price", "quantity", "line_total")


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ("status", "message", "created_at")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "status",
            "payment_method",
            "payment_status",
            "subtotal",
            "shipping_fee",
            "total",
            "shipping_address",
            "notes",
            "payment_reference",
            "items",
            "status_history",
            "created_at",
            "updated_at",
        )


class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
    gateway_transaction_id = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        user = self.context["request"].user
        address = user.addresses.filter(pk=attrs["address_id"]).first()
        if not address:
            raise serializers.ValidationError({"address_id": "Address not found."})
        cart = getattr(user, "cart", None)
        if not cart or not cart.items.exists():
            raise serializers.ValidationError({"cart": "Cart is empty."})
        attrs["address"] = address
        attrs["cart"] = cart
        if attrs["payment_method"] == Order.PaymentMethod.GATEWAY and not attrs.get("gateway_transaction_id"):
            raise serializers.ValidationError({"gateway_transaction_id": "Required for gateway payments."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        cart = validated_data["cart"]
        address = validated_data["address"]
        payment_method = validated_data["payment_method"]
        notes = validated_data.get("notes", "")

        subtotal, shipping_fee, total = cart_checkout_totals(cart)

        payment_status = Order.PaymentStatus.PENDING
        if payment_method == Order.PaymentMethod.GATEWAY:
            payment_status = Order.PaymentStatus.PAID

        order = Order.objects.create(
            user=user,
            payment_method=payment_method,
            payment_status=payment_status,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            total=total,
            shipping_address={
                "label": address.label,
                "full_name": address.full_name,
                "phone": address.phone,
                "line1": address.line1,
                "line2": address.line2,
                "city": address.city,
                "state": address.state,
                "postal_code": address.postal_code,
                "country": address.country,
            },
            notes=notes,
            payment_reference=validated_data.get("gateway_transaction_id") or "",
        )

        for item in cart.items.select_related("product"):
            product = item.product
            if item.quantity > product.stock:
                raise serializers.ValidationError({"cart": f"Insufficient stock for {product.name}."})
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                unit_price=product.effective_price,
                quantity=item.quantity,
                line_total=product.effective_price * item.quantity,
            )
            product.stock -= item.quantity
            product.save(update_fields=["stock"])

        cart.items.all().delete()
        OrderStatusHistory.objects.create(order=order, status=Order.Status.PLACED, message="Order placed successfully")
        Notification.objects.create(
            user=user,
            title="Order confirmed",
            body=f"Your order {order.order_number} has been placed.",
            notification_type=Notification.Type.ORDER,
            order=order,
        )
        if user.email:
            from accounts.email_service import send_order_confirmation

            try:
                send_order_confirmation(to_email=user.email, order=order)
            except Exception:
                logging.getLogger(__name__).exception("Order confirmation email failed for %s", order.order_number)
        return order
