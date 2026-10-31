from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "unit_price", "quantity", "line_total")


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ("status", "message", "created_at")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "user", "status", "payment_method", "total", "created_at")
    list_filter = ("status", "payment_method", "payment_status")
    search_fields = ("order_number", "user__email", "user__username")
    inlines = [OrderItemInline, OrderStatusHistoryInline]


admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(OrderItem)
admin.site.register(OrderStatusHistory)
