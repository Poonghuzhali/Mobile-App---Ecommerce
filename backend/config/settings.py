import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env", override=True)

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-dev-key-change-in-production")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,10.0.2.2").split(",") if h.strip()]
_render_host = os.getenv("RENDER_EXTERNAL_HOSTNAME", "").strip()
if _render_host and _render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(_render_host)
if DEBUG and os.getenv("ALLOWED_HOSTS") is None:
    ALLOWED_HOSTS = ["*"]

CSRF_TRUSTED_ORIGINS = [
    o.strip()
    for o in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
    if o.strip()
]
if _render_host:
    CSRF_TRUSTED_ORIGINS.append(f"https://{_render_host}")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "accounts",
    "catalog",
    "orders",
    "notifications",
    "adminpanel",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "adminpanel.context_processors.admin_branding",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

_database_url = os.getenv("DATABASE_URL", "").strip()
if _database_url:
    import dj_database_url

    DATABASES = {
        "default": dj_database_url.config(
            default=_database_url,
            conn_max_age=600,
            ssl_require=os.getenv("DATABASE_SSL_REQUIRE", "false").lower() == "true",
        )
    }
elif os.getenv("USE_MYSQL", "false").lower() == "true":
    import pymysql

    pymysql.install_as_MySQLdb()
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.getenv("DB_NAME", "ecommerce_db"),
            "USER": os.getenv("DB_USER", "root"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "127.0.0.1"),
            "PORT": os.getenv("DB_PORT", "3306"),
            "OPTIONS": {"charset": "utf8mb4"},
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = os.getenv("STATIC_URL", "/static/")
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": (
            "whitenoise.storage.CompressedStaticFilesStorage"
            if not DEBUG
            else "django.contrib.staticfiles.storage.StaticFilesStorage"
        )
    },
}

MEDIA_URL = os.getenv("MEDIA_URL", "/media/")
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOW_ALL_ORIGINS = DEBUG or os.getenv("CORS_ALLOW_ALL", "").lower() == "true"
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19006",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=12),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

LOGIN_URL = "/portal/login/"
LOGIN_REDIRECT_URL = "/portal/"
LOGOUT_REDIRECT_URL = "/portal/login/"

APP_DISPLAY_NAME = os.getenv("APP_DISPLAY_NAME", "Vexo Cart")
EMAIL_OTP_EXPIRE_MINUTES = int(os.getenv("EMAIL_OTP_EXPIRE_MINUTES", "10"))
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "False").lower() == "true"
def _env_clean(key: str, default: str = "") -> str:
    value = os.getenv(key, default)
    return value.strip().strip('"').strip("'").lstrip("\ufeff")


EMAIL_HOST_USER = _env_clean("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = _env_clean("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = _env_clean("DEFAULT_FROM_EMAIL")

RESEND_API_KEY = _env_clean("RESEND_API_KEY")
RESEND_FROM_EMAIL = _env_clean("RESEND_FROM_EMAIL") or f"{APP_DISPLAY_NAME} <onboarding@resend.dev>"

_smtp_ready = bool(EMAIL_HOST and EMAIL_HOST_USER and EMAIL_HOST_PASSWORD)
_resend_ready = bool(RESEND_API_KEY)
if os.getenv("EMAIL_BACKEND"):
    EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "")
elif _smtp_ready:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

if not DEFAULT_FROM_EMAIL:
    if _resend_ready:
        DEFAULT_FROM_EMAIL = RESEND_FROM_EMAIL
    elif EMAIL_HOST_USER:
        DEFAULT_FROM_EMAIL = f"{APP_DISPLAY_NAME} <{EMAIL_HOST_USER}>"
    else:
        DEFAULT_FROM_EMAIL = f"{APP_DISPLAY_NAME} <noreply@vexocart.local>"

RAZORPAY_KEY_ID = _env_clean("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = _env_clean("RAZORPAY_KEY_SECRET")
# When True, only rzp_test_* keys enable Razorpay (no live payments).
RAZORPAY_TEST_MODE_ONLY = os.getenv("RAZORPAY_TEST_MODE_ONLY", "True").lower() == "true"
