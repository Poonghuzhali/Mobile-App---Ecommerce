import logging
import secrets
import smtplib

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from catalog.models import Product
from .models import Address, PasswordResetToken, WishlistItem
from .email_service import send_password_reset, send_registration_otp
from .email_utils import delivery_mode, resend_configured, smtp_configured, uses_console_email_backend
from .otp import create_and_store_otp
from .serializers import (
    AddressSerializer,
    EmailOrUsernameTokenObtainPairSerializer,
    RegisterSendOtpSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    WishlistItemSerializer,
)

User = get_user_model()


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class RegisterSendOtpView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSendOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        if not delivery_configured() and not settings.DEBUG:
            return Response(
                {
                    "detail": (
                        "Email is not configured on the server. Add RESEND_API_KEY and RESEND_FROM_EMAIL "
                        "in Render → vexo-cart-api → Environment, then redeploy. "
                        "With onboarding@resend.dev, OTP only delivers to your Resend account email until you verify a domain."
                    ),
                    "delivery": "none",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        code = create_and_store_otp(email)
        console_mode = uses_console_email_backend()
        try:
            send_registration_otp(to_email=email, otp_code=code)
            if console_mode:
                logging.getLogger(__name__).warning(
                    "REGISTRATION OTP for %s → %s (console email — not sent to inbox)",
                    email,
                    code,
                )
        except (smtplib.SMTPAuthenticationError, smtplib.SMTPServerDisconnected) as exc:
            logging.getLogger(__name__).exception("OTP email failed for %s", email)
            return Response(
                {
                    "detail": (
                        "Gmail rejected the server login. Use a 16-character Google App Password in "
                        "backend/.env (not your normal Gmail password), or set RESEND_API_KEY instead."
                    ),
                    "error": str(exc),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as exc:
            logging.getLogger(__name__).exception("OTP email failed for %s", email)
            hint = (
                "Check RESEND_API_KEY and RESEND_FROM_EMAIL in backend/.env. "
                "With onboarding@resend.dev you can only send to your Resend account email until you verify a domain."
                if resend_configured()
                else "See backend/EMAIL_SETUP.md and restart Django."
            )
            return Response(
                {"detail": f"Could not send email. {hint}", "error": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if console_mode and settings.DEBUG and not smtp_configured() and not resend_configured():
            return Response(
                {
                    "detail": (
                        "Email is not configured for inbox delivery. Run backend\\setup-email.ps1 on your PC, "
                        "restart Django, then try again. Dev code below is for testing only."
                    ),
                    "email": email,
                    "delivery": "console",
                    "dev_otp": code,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "detail": "Verification code sent to your email. Check inbox and spam folder.",
                "email": email,
                "delivery": delivery_mode(),
            },
            status=status.HTTP_200_OK,
        )


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"detail": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Logged out successfully."})


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response({"email": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(email__iexact=email).first()
        if user:
            token = secrets.token_urlsafe(32)
            PasswordResetToken.objects.create(user=user, token=token)
            reset_link = f"ecommerce://reset-password?token={token}"
            try:
                send_password_reset(to_email=user.email, reset_link=reset_link, token=token)
            except Exception:
                logging.getLogger(__name__).exception("Password reset email failed for %s", user.email)
        return Response({"detail": "If the email exists, reset instructions were sent."})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token", "").strip()
        password = request.data.get("password", "")
        if len(password) < 8:
            return Response({"password": "Minimum 8 characters."}, status=status.HTTP_400_BAD_REQUEST)
        reset = PasswordResetToken.objects.filter(token=token, used=False).select_related("user").first()
        if not reset:
            return Response({"token": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        user = reset.user
        user.set_password(password)
        user.save()
        reset.used = True
        reset.save()
        return Response({"detail": "Password updated successfully."})


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    pagination_class = None

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class WishlistView(APIView):
    def get(self, request):
        items = WishlistItem.objects.filter(user=request.user).select_related("product")
        serializer = WishlistItemSerializer(items, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        product_id = request.data.get("product_id")
        if not product_id:
            return Response({"product_id": "Required."}, status=status.HTTP_400_BAD_REQUEST)
        product = Product.objects.filter(pk=product_id, is_active=True).first()
        if not product:
            return Response({"product_id": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        item, created = WishlistItem.objects.get_or_create(user=request.user, product=product)
        serializer = WishlistItemSerializer(item, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request):
        product_id = request.data.get("product_id") or request.query_params.get("product_id")
        deleted, _ = WishlistItem.objects.filter(user=request.user, product_id=product_id).delete()
        if not deleted:
            return Response({"detail": "Not in wishlist."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
