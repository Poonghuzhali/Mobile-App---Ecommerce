import os
from pathlib import Path

from django.conf import settings
from dotenv import load_dotenv


def _clean(value: str) -> str:
    return value.strip().strip('"').strip("'").lstrip("\ufeff")


def get_resend_config() -> tuple[str, str]:
    """Resend key/from from backend/.env (reloaded so OTP works after .env edits without restart)."""
    env_path = Path(settings.BASE_DIR) / ".env"
    if env_path.is_file():
        load_dotenv(env_path, override=True)
    key = _clean(os.getenv("RESEND_API_KEY", ""))
    if not key:
        key = _clean(getattr(settings, "RESEND_API_KEY", ""))
    from_email = _clean(os.getenv("RESEND_FROM_EMAIL", "")) or _clean(
        getattr(settings, "RESEND_FROM_EMAIL", "")
    )
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
