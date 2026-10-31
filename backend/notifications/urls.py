from django.urls import path

from .views import MarkAllNotificationsReadView, MarkNotificationReadView, NotificationListView

urlpatterns = [
    path("", NotificationListView.as_view()),
    path("<int:pk>/read/", MarkNotificationReadView.as_view()),
    path("read-all/", MarkAllNotificationsReadView.as_view()),
]
