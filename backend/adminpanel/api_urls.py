from django.urls import path

from .api_views import (
    AdminCustomerDetailView,
    AdminCustomerListView,
    AdminOrderDetailView,
    AdminOrderListView,
    AdminOrderStatusView,
    AdminProductDetailView,
    AdminProductListView,
    AdminStatsView,
)

urlpatterns = [
    path("stats/", AdminStatsView.as_view()),
    path("customers/", AdminCustomerListView.as_view()),
    path("customers/<int:pk>/", AdminCustomerDetailView.as_view()),
    path("orders/", AdminOrderListView.as_view()),
    path("orders/<int:pk>/", AdminOrderDetailView.as_view()),
    path("orders/<int:pk>/status/", AdminOrderStatusView.as_view()),
    path("products/", AdminProductListView.as_view()),
    path("products/<int:pk>/", AdminProductDetailView.as_view()),
]
