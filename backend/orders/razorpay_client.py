import os
from pathlib import Path

from django.conf import settings


def _clean(value: str) -> str:
    return value.strip().strip('"').strip("'").lstrip("\ufeff")


def get_razorpay_credentials() -> tuple[str, str]:
    """Read Razorpay keys from backend/.env (reload so edits apply without restart)."""
    env_path = Path(settings.BASE_DIR) / ".env"
    if env_path.is_file():
        from dotenv import load_dotenv

        load_dotenv(env_path, override=True)
    key_id = _clean(os.getenv("RAZORPAY_KEY_ID", "")) or _clean(getattr(settings, "RAZORPAY_KEY_ID", ""))
    key_secret = _clean(os.getenv("RAZORPAY_KEY_SECRET", "")) or _clean(getattr(settings, "RAZORPAY_KEY_SECRET", ""))
    return key_id, key_secret


def razorpay_is_test_key(key_id: str) -> bool:
    return key_id.startswith("rzp_test_")


def razorpay_test_mode_only() -> bool:
    return getattr(settings, "RAZORPAY_TEST_MODE_ONLY", True)


def razorpay_allowed() -> bool:
    """Razorpay is usable: keys set, and test-only policy satisfied."""
    key_id, key_secret = get_razorpay_credentials()
    if not key_id or not key_secret:
        return False
    if razorpay_test_mode_only() and not razorpay_is_test_key(key_id):
        return False
    return True


def razorpay_configured() -> bool:
    return razorpay_allowed()


def razorpay_public_config() -> dict:
    key_id, key_secret = get_razorpay_credentials()
    test_only = razorpay_test_mode_only()
    is_test = razorpay_is_test_key(key_id) if key_id else False
    keys_present = bool(key_id and key_secret)
    enabled = keys_present and (not test_only or is_test)
    return {
        "enabled": enabled,
        "test_mode": enabled and is_test,
        "test_mode_only": test_only,
    }


def get_razorpay_client():
    import razorpay

    key_id, key_secret = get_razorpay_credentials()
    if not key_id or not key_secret:
        raise RuntimeError("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env")
    if razorpay_test_mode_only() and not razorpay_is_test_key(key_id):
        raise RuntimeError("Live Razorpay keys are disabled. Use rzp_test_* keys or set RAZORPAY_TEST_MODE_ONLY=False.")
    return razorpay.Client(auth=(key_id, key_secret))
