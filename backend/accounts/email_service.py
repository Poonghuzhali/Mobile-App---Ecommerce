import logging

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from .email_utils import get_resend_config

logger = logging.getLogger(__name__)


def _from_email() -> str:
    api_key, from_email = get_resend_config()
    if api_key:
        return from_email
    return getattr(settings, "DEFAULT_FROM_EMAIL", "Vexo Cart <noreply@vexocart.local>")


def _send_via_resend(*, api_key: str, from_email: str, subject: str, text: str, to_email: str) -> None:
    import resend
    from resend.exceptions import ResendError

    resend.api_key = api_key
    try:
        resend.Emails.send(
            {
                "from": from_email,
                "to": [to_email],
                "subject": subject,
                "text": text,
            }
        )
    except ResendError as exc:
        raise RuntimeError(f"Resend rejected the email: {exc}") from exc


def send_email(*, subject: str, message: str, to_email: str) -> None:
    """Send transactional mail via Resend when configured, otherwise Django SMTP/console."""
    api_key, from_email = get_resend_config()
    if api_key:
        _send_via_resend(
            api_key=api_key,
            from_email=from_email,
            subject=subject,
            text=message,
            to_email=to_email,
        )
        return
    send_mail(subject, message, _from_email(), [to_email], fail_silently=False)


def send_registration_otp(*, to_email: str, otp_code: str) -> None:
    subject = f"{settings.APP_DISPLAY_NAME} - Your verification code"
    message = render_to_string(
        "accounts/email/registration_otp.txt",
        {"otp_code": otp_code, "app_name": settings.APP_DISPLAY_NAME, "valid_minutes": settings.EMAIL_OTP_EXPIRE_MINUTES},
    )
    send_email(subject=subject, message=message, to_email=to_email)


def send_order_confirmation(*, to_email: str, order) -> None:
    subject = f"Order confirmed — {order.order_number}"
    message = render_to_string(
        "accounts/email/order_confirmation.txt",
        {
            "app_name": settings.APP_DISPLAY_NAME,
            "order": order,
            "items": order.items.all(),
            "user": order.user,
        },
    )
    send_email(subject=subject, message=message, to_email=to_email)


def send_password_reset(*, to_email: str, reset_link: str, token: str) -> None:
    subject = f"{settings.APP_DISPLAY_NAME} — password reset"
    message = (
        f"Use this link to reset your password:\n{reset_link}\n\n"
        f"Or enter this token in the app:\n{token}\n"
    )
    send_email(subject=subject, message=message, to_email=to_email)
