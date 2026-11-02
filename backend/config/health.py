import os

from django.http import JsonResponse


def health(_request):
    """Render health check — no database (deploy can succeed before migrate)."""
    return JsonResponse({"status": "ok"})


def root(_request):
    """Landing page — bare domain has no HTML storefront."""
    return JsonResponse(
        {
            "app": "Vexo Cart API",
            "deploy_commit": os.environ.get("RENDER_GIT_COMMIT", "").strip() or None,
            "message": "Backend is running. Use the mobile app or links below.",
            "links": {
                "health": "/api/health/",
                "register": "/register/",
                "email_status": "/api/auth/email-status/",
                "catalog_home": "/api/catalog/home/",
                "staff_portal": "/portal/",
                "staff_login": "/portal/login/",
            },
        }
    )
