import os
from pathlib import Path

from django.conf import settings
from dotenv import load_dotenv


def _clean(value: str) -> str:
    return value.strip().strip('"').strip("'").lstrip("\ufeff")


def get_resend_config() -> tuple[str, str]:
    """Resend key/from — process env (Render) first, then Django settings, then backend/.env."""
    key = _clean(os.environ.get("RESEND_API_KEY", ""))
    from_email = _clean(os.environ.get("RESEND_FROM_EMAIL", ""))
    if not key:
        key = _clean(getattr(settings, "RESEND_API_KEY", ""))
    if not from_email:
        from_email = _clean(getattr(settings, "RESEND_FROM_EMAIL", ""))
    env_path = Path(settings.BASE_DIR) / ".env"
    if env_path.is_file():
        load_dotenv(env_path, override=False)
        if not key:
            key = _clean(os.getenv("RESEND_API_KEY", ""))
        if not from_email:
            from_email = _clean(os.getenv("RESEND_FROM_EMAIL", ""))
    if not from_email:
        from_email = f"{settings.APP_DISPLAY_NAME} <onboarding@resend.dev>"
    return key, from_email


def resend_configured() -> bool:
    return bool(get_resend_config()[0])


def smtp_configured() -> bool:
    return bool(settings.EMAIL_HOST and settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD)


def delivery_configured() -> bool:
    return resend_configured() or smtp_configured()


def uses_console_email_backend() -> bool:
    if delivery_configured():
        return False
    return "console" in settings.EMAIL_BACKEND.lower()


def delivery_mode() -> str:
    if resend_configured():
        return "resend"
    if smtp_configured():
        return "smtp"
    return "console"


def resend_uses_test_sender() -> bool:
    _, from_email = get_resend_config()
    return "onboarding@resend.dev" in from_email.lower()


def get_resend_signup_email() -> str:
    email = _clean(os.environ.get("RESEND_SIGNUP_EMAIL", ""))
    if not email:
        email = _clean(getattr(settings, "RESEND_SIGNUP_EMAIL", ""))
    return email.strip().lower()


def resend_recipient_allowed(to_email: str) -> tuple[bool, str | None]:
    """With Resend test sender, OTP only reaches RESEND_SIGNUP_EMAIL (or any inbox after domain verify)."""
    if not resend_configured() or not resend_uses_test_sender():
        return True, None
    allowed = get_resend_signup_email()
    if not allowed:
        return True, None
    if to_email.strip().lower() == allowed:
        return True, None
    return False, (
        f"While using onboarding@resend.dev, OTP is only sent to {allowed} "
        f"(set RESEND_SIGNUP_EMAIL on Render to your Resend account email). "
        f"You entered {to_email.strip().lower()}. To use any email, verify a domain at resend.com/domains "
        f"and set RESEND_FROM_EMAIL to that domain."
    )
