import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from .models import EmailOTP


def _hash_otp(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def generate_otp_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def create_and_store_otp(email: str, purpose: str = EmailOTP.Purpose.REGISTER) -> str:
    email = email.strip().lower()
    code = generate_otp_code()
    expires = timezone.now() + timedelta(minutes=settings.EMAIL_OTP_EXPIRE_MINUTES)
    EmailOTP.objects.filter(email=email, purpose=purpose, is_used=False).update(is_used=True)
    EmailOTP.objects.create(email=email, purpose=purpose, otp_hash=_hash_otp(code), expires_at=expires)
    return code


def verify_otp(email: str, code: str, purpose: str = EmailOTP.Purpose.REGISTER) -> EmailOTP | None:
    email = email.strip().lower()
    record = (
        EmailOTP.objects.filter(email=email, purpose=purpose, is_used=False, expires_at__gte=timezone.now())
        .order_by("-created_at")
        .first()
    )
    if not record:
        return None
    if record.otp_hash != _hash_otp(code.strip()):
        return None
    return record


def mark_otp_used(record: EmailOTP) -> None:
    record.is_used = True
    record.save(update_fields=["is_used"])
