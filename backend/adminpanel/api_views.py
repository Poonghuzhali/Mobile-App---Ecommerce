from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product
from orders.models import Order

from .api_serializers import (
    AdminCustomerSerializer,
    AdminOrderSerializer,
    AdminOrderStatusUpdateSerializer,
    AdminProductSerializer,
    AdminProductUpdateSerializer,
)
from .order_services import update_order_status
from .permissions import IsStaffUser

User = get_user_model()


class AdminStatsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        orders = Order.objects.all()
        return Response(
            {
                "order_count": orders.count(),
                "customer_count": User.objects.filter(is_staff=False).count(),
                "low_stock_count": Product.objects.filter(stock__lte=5, is_active=True).count(),
                "total_sales": str(
                    orders.filter(payment_status__in=["paid", "pending"]).aggregate(s=Sum("total"))["s"] or Decimal("0")
                ),
            }
        )


class AdminCustomerListView(generics.ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminCustomerSerializer
    pagination_class = None

    def get_queryset(self):
        return User.objects.filter(is_staff=False).annotate(order_count=Count("orders")).order_by("-date_joined")


class AdminCustomerDetailView(generics.RetrieveAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminCustomerSerializer
    pagination_class = None

    def get_queryset(self):
        return User.objects.filter(is_staff=False).annotate(order_count=Count("orders"))


class AdminOrderListView(generics.ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminOrderSerializer
    pagination_class = None

    def get_queryset(self):
        qs = Order.objects.select_related("user").prefetch_related("items", "status_history").order_by("-created_at")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class AdminOrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminOrderSerializer

    def get_queryset(self):
        return Order.objects.select_related("user").prefetch_related("items", "status_history")


class AdminOrderStatusView(APIView):
    permission_classes = [IsStaffUser]

    def patch(self, request, pk):
        order = Order.objects.filter(pk=pk).select_related("user").first()
        if not order:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminOrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        update_order_status(
            order=order,
            new_status=serializer.validated_data["status"],
            message=serializer.validated_data.get("message", ""),
        )
        order.refresh_from_db()
        return Response(AdminOrderSerializer(order).data)


class AdminProductListView(generics.ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminProductSerializer
    pagination_class = None

    def get_queryset(self):
        return Product.objects.select_related("category").order_by("-updated_at")


class AdminProductDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsStaffUser]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return Product.objects.select_related("category")

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return AdminProductUpdateSerializer
        return AdminProductSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = AdminProductUpdateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminProductSerializer(instance).data)
