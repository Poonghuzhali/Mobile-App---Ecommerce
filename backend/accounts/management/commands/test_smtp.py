import smtplib
import ssl

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand, CommandError

from accounts.email_service import send_email
from accounts.email_utils import delivery_configured, resend_configured, smtp_configured, uses_console_email_backend


def _gmail_hints() -> str:
    return (
        "Gmail SMTP checklist:\n"
        "  1. Turn ON 2-Step Verification on the Google account.\n"
        "  2. Create an App Password: Google Account -> Security -> App passwords -> Mail.\n"
        "  3. Put that 16-character App Password in EMAIL_HOST_PASSWORD (NOT your normal Gmail password).\n"
        "  4. EMAIL_HOST_USER must match the same Gmail address.\n"
        "  5. If port 587 fails, try in .env: EMAIL_PORT=465, EMAIL_USE_SSL=True, EMAIL_USE_TLS=False\n"
        "  6. Restart Django after editing .env."
    )


def _resend_hints() -> str:
    return (
        "Resend checklist:\n"
        "  1. RESEND_API_KEY from https://resend.com/api-keys in backend/.env\n"
        "  2. RESEND_FROM_EMAIL (default: Vexo Cart <onboarding@resend.dev>)\n"
        "  3. Until you verify a domain, onboarding@resend.dev only delivers to your Resend signup email.\n"
        "  4. Restart Django after editing .env."
    )


class Command(BaseCommand):
    help = "Send a test email (Resend or SMTP from .env)"

    def add_arguments(self, parser):
        parser.add_argument("to_email", type=str, help="Recipient email address")

    def _try_ssl465(self, to_email: str) -> bool:
        if settings.EMAIL_HOST != "smtp.gmail.com":
            return False
        context = ssl.create_default_context()
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context, timeout=30) as server:
                server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                msg = (
                    f"From: {settings.DEFAULT_FROM_EMAIL}\r\n"
                    f"To: {to_email}\r\n"
                    f"Subject: {settings.APP_DISPLAY_NAME} - SMTP test (SSL 465)\r\n\r\n"
                    "If you received this, OTP and order emails will work."
                )
                server.sendmail(settings.EMAIL_HOST_USER, [to_email], msg.encode("utf-8"))
            return True
        except Exception:
            return False

    def handle(self, *args, **options):
        to_email = options["to_email"].strip()
        if not delivery_configured():
            raise CommandError(
                "No email provider configured. Set RESEND_API_KEY or SMTP EMAIL_* vars in backend/.env, then restart Django."
            )

        if resend_configured():
            self.stdout.write(f"Provider: Resend (from {settings.RESEND_FROM_EMAIL})")
            try:
                send_email(
                    subject=f"{settings.APP_DISPLAY_NAME} - email test",
                    message="If you received this, OTP and order emails will work.",
                    to_email=to_email,
                )
            except Exception as exc:
                raise CommandError(f"Resend send failed: {exc}\n\n{_resend_hints()}") from exc
            self.stdout.write(self.style.SUCCESS(f"Test email sent to {to_email} via Resend. Check inbox and spam."))
            return

        if uses_console_email_backend():
            raise CommandError("Still using console email backend. Configure Resend or SMTP in .env, then restart Django.")
        if not smtp_configured():
            raise CommandError("SMTP is incomplete. Set EMAIL_HOST, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD in .env")

        pwd = settings.EMAIL_HOST_PASSWORD
        if "@" in pwd or len(pwd) < 16:
            self.stdout.write(
                self.style.WARNING(
                    "Warning: EMAIL_HOST_PASSWORD should be a 16-character Google App Password, not your login password."
                )
            )

        self.stdout.write(f"Backend: {settings.EMAIL_BACKEND}")
        self.stdout.write(f"Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT} TLS={settings.EMAIL_USE_TLS} SSL={settings.EMAIL_USE_SSL}")
        self.stdout.write(f"User: {settings.EMAIL_HOST_USER}")

        try:
            send_mail(
                subject=f"{settings.APP_DISPLAY_NAME} - SMTP test",
                message="If you received this, OTP and order emails will work.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(f"Test email sent to {to_email}. Check inbox and spam."))
            return
        except smtplib.SMTPAuthenticationError as exc:
            raise CommandError(f"Authentication failed: {exc}\n\n{_gmail_hints()}") from exc
        except smtplib.SMTPServerDisconnected as exc:
            self.stdout.write(self.style.ERROR(f"Connection closed during login: {exc}"))
        except OSError as exc:
            raise CommandError(f"Network error: {exc}\n\n{_gmail_hints()}") from exc

        self.stdout.write("Retrying with Gmail SSL on port 465...")
        if self._try_ssl465(to_email):
            self.stdout.write(
                self.style.SUCCESS(
                    "Test email sent via port 465. Update backend/.env: EMAIL_PORT=465, EMAIL_USE_SSL=True, EMAIL_USE_TLS=False"
                )
            )
            return

        raise CommandError(f"Could not send test email.\n\n{_gmail_hints()}")
