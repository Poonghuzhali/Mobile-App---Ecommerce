from django.http import JsonResponse


def health(_request):
    """Render health check — no database (deploy can succeed before migrate)."""
    return JsonResponse({"status": "ok"})
