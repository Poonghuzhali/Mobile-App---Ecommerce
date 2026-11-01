from django.urls import path

from .views import (
    AddressDetailView,
    AddressListCreateView,
    EmailStatusView,
    ForgotPasswordView,
    LogoutView,
    ProfileView,
    RegisterSendOtpView,
    RegisterView,
    ResetPasswordView,
    WishlistView,
)

urlpatterns = [
    path("email-status/", EmailStatusView.as_view()),
    path("register/send-otp/", RegisterSendOtpView.as_view()),
    path("register/", RegisterView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("forgot-password/", ForgotPasswordView.as_view()),
    path("reset-password/", ResetPasswordView.as_view()),
    path("profile/", ProfileView.as_view()),
    path("addresses/", AddressListCreateView.as_view()),
    path("addresses/<int:pk>/", AddressDetailView.as_view()),
    path("wishlist/", WishlistView.as_view()),
]
