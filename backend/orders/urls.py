from django.urls import path

from .views import (
    CartView,
    CheckoutView,
    OrderDetailView,
    OrderListView,
    PaymentGatewayMockView,
    RazorpayCheckoutCompleteView,
    RazorpayConfigView,
    RazorpayCreateOrderView,
)

urlpatterns = [
    path("cart/", CartView.as_view()),
    path("checkout/", CheckoutView.as_view()),
    path("payment/gateway/", PaymentGatewayMockView.as_view()),
    path("payment/razorpay/config/", RazorpayConfigView.as_view()),
    path("payment/razorpay/create-order/", RazorpayCreateOrderView.as_view()),
    path("payment/razorpay/complete/", RazorpayCheckoutCompleteView.as_view()),
    path("", OrderListView.as_view()),
    path("<int:pk>/", OrderDetailView.as_view()),
]
