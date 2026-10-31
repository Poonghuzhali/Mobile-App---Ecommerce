import uuid

from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem, Order
from .payment_utils import cart_checkout_totals
from .razorpay_client import (
    get_razorpay_client,
    get_razorpay_credentials,
    razorpay_configured,
    razorpay_public_config,
)
from .serializers import CartItemWriteSerializer, CartSerializer, CheckoutSerializer, OrderSerializer


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    def get(self, request):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart, context={"request": request}).data)

    def post(self, request):
        serializer = CartItemWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_or_create_cart(request.user)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]
        item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={"quantity": quantity})
        if not created:
            item.quantity = min(product.stock, item.quantity + quantity)
            item.save()
        return Response(CartSerializer(cart, context={"request": request}).data, status=status.HTTP_200_OK)

    def patch(self, request):
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity")
        if not product_id or quantity is None:
            return Response({"detail": "product_id and quantity required."}, status=status.HTTP_400_BAD_REQUEST)
        cart = get_or_create_cart(request.user)
        item = cart.items.filter(product_id=product_id).select_related("product").first()
        if not item:
            return Response({"detail": "Item not in cart."}, status=status.HTTP_404_NOT_FOUND)
        if int(quantity) <= 0:
            item.delete()
        else:
            if int(quantity) > item.product.stock:
                return Response({"quantity": f"Max {item.product.stock} available."}, status=status.HTTP_400_BAD_REQUEST)
            item.quantity = int(quantity)
            item.save()
        return Response(CartSerializer(cart, context={"request": request}).data)

    def delete(self, request):
        product_id = request.data.get("product_id") or request.query_params.get("product_id")
        cart = get_or_create_cart(request.user)
        deleted, _ = cart.items.filter(product_id=product_id).delete()
        if not deleted:
            return Response({"detail": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CartSerializer(cart, context={"request": request}).data)


class CheckoutView(APIView):
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items", "status_history")


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    lookup_field = "pk"

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items", "status_history")


class PaymentGatewayMockView(APIView):
    """Legacy mock — use Razorpay endpoints when configured."""

    def post(self, request):
        if razorpay_configured():
            return Response(
                {"detail": "Use /orders/payment/razorpay/create-order/ and complete checkout via Razorpay."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        card_number = request.data.get("card_number", "").replace(" ", "")
        if len(card_number) < 12:
            return Response({"detail": "Invalid card number."}, status=status.HTTP_400_BAD_REQUEST)
        if card_number.endswith("0000"):
            return Response({"detail": "Payment declined."}, status=status.HTTP_402_PAYMENT_REQUIRED)
        txn = f"TXN-{card_number[-4:]}-{request.user.id}"
        return Response({"transaction_id": txn, "status": "success"})


class RazorpayConfigView(APIView):
    """Whether Razorpay checkout is available (test-mode-only by default)."""

    def get(self, request):
        return Response(razorpay_public_config())


class RazorpayCreateOrderView(APIView):
    """Create a Razorpay order for the current cart total (in paise)."""

    def post(self, request):
        if not razorpay_configured():
            return Response(
                {"detail": "Razorpay test checkout is not available. Use rzp_test_* keys in backend/.env."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        cart = get_or_create_cart(request.user)
        if not cart.items.exists():
            return Response({"cart": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)
        _, _, total = cart_checkout_totals(cart)
        amount_paise = int(total * 100)
        if amount_paise < 100:
            return Response({"detail": "Order amount is too small for online payment."}, status=status.HTTP_400_BAD_REQUEST)
        client = get_razorpay_client()
        receipt = f"vexo-{cart.pk}-{uuid.uuid4().hex[:8]}"
        rz_order = client.order.create(
            {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": receipt[:40],
                "notes": {"user_id": str(request.user.pk), "cart_id": str(cart.pk)},
            }
        )
        user = request.user
        display_name = f"{user.first_name} {user.last_name}".strip() or user.username
        key_id, _ = get_razorpay_credentials()
        payload = {
            "key_id": key_id,
            "razorpay_order_id": rz_order["id"],
            "amount": amount_paise,
            "currency": "INR",
            "description": f"{settings.APP_DISPLAY_NAME} purchase",
            "prefill": {
                "name": display_name,
                "email": user.email or "",
                "contact": user.phone or "",
            },
        }
        if key_id.startswith("rzp_test_"):
            payload["test_payment_hints"] = {
                "upi": "success@razorpay",
                "domestic_card": "5267 3181 8797 5449",
                "international_cards": (
                    "Not supported on default Indian Razorpay test accounts. "
                    "Use UPI or the domestic test card above, or enable International Cards in the Razorpay Dashboard."
                ),
            }
        return Response(payload)


class RazorpayCheckoutCompleteView(APIView):
    """Verify Razorpay payment signature and place the order."""

    def post(self, request):
        if not razorpay_configured():
            return Response(
                {"detail": "Razorpay test checkout is not available. Use rzp_test_* keys in backend/.env."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        payment_id = (request.data.get("razorpay_payment_id") or "").strip()
        order_id = (request.data.get("razorpay_order_id") or "").strip()
        signature = (request.data.get("razorpay_signature") or "").strip()
        address_id = request.data.get("address_id")
        if not payment_id or not order_id or not signature or not address_id:
            return Response({"detail": "razorpay_payment_id, razorpay_order_id, razorpay_signature, and address_id are required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from razorpay.errors import SignatureVerificationError

            get_razorpay_client().utility.verify_payment_signature(
                {
                    "razorpay_order_id": order_id,
                    "razorpay_payment_id": payment_id,
                    "razorpay_signature": signature,
                }
            )
        except SignatureVerificationError:
            return Response({"detail": "Payment verification failed."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({"detail": "Could not verify payment.", "error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        serializer = CheckoutSerializer(
            data={
                "address_id": address_id,
                "payment_method": Order.PaymentMethod.GATEWAY,
                "gateway_transaction_id": payment_id,
                "notes": request.data.get("notes", ""),
            },
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
