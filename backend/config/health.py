from django.http import JsonResponse


def health(_request):
    """Render health check — no database (deploy can succeed before migrate)."""
    return JsonResponse({"status": "ok"})


def root(_request):
    """Landing page — bare domain has no HTML storefront."""
    return JsonResponse(
        {
            "app": "Vexo Cart API",
            "message": "Backend is running. Use the mobile app or links below.",
            "links": {
                "health": "/api/health/",
                "catalog_home": "/api/catalog/home/",
                "staff_portal": "/portal/",
                "staff_login": "/portal/login/",
            },
        }
    )
