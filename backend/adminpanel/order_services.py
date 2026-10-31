from notifications.models import Notification
from orders.models import Order, OrderStatusHistory


def update_order_status(*, order: Order, new_status: str, message: str = "") -> Order:
    old_status = order.status
    if new_status == old_status:
        if message.strip():
            OrderStatusHistory.objects.create(order=order, status=order.status, message=message.strip())
        return order
    order.status = new_status
    order.save(update_fields=["status", "updated_at"])
    OrderStatusHistory.objects.create(order=order, status=new_status, message=message.strip())
    Notification.objects.create(
        user=order.user,
        title="Order status updated",
        body=f"Order {order.order_number} is now {order.get_status_display()}. {message}".strip(),
        notification_type=Notification.Type.ORDER,
        order=order,
    )
    return order
