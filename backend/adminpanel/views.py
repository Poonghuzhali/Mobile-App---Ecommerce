from datetime import timedelta
from decimal import Decimal

from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from accounts.models import User
from catalog.models import Category, Product
from notifications.models import Notification
from orders.models import Order, OrderStatusHistory
from .forms import CategoryForm, OrderStatusForm, ProductForm


def staff_required(view):
    return login_required(user_passes_test(lambda u: u.is_staff)(view))


@staff_required
def dashboard(request):
    today = timezone.now().date()
    week_ago = today - timedelta(days=6)
    orders = Order.objects.all()
    stats = {
        "total_sales": orders.filter(payment_status__in=["paid", "pending"]).aggregate(s=Sum("total"))["s"] or Decimal("0"),
        "order_count": orders.count(),
        "customer_count": User.objects.filter(is_staff=False).count(),
        "low_stock": Product.objects.filter(stock__lte=5, is_active=True).count(),
    }
    daily_sales = (
        orders.filter(created_at__date__gte=week_ago)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(total=Sum("total"), count=Count("id"))
        .order_by("day")
    )
    recent_orders = orders.select_related("user")[:8]
    return render(
        request,
        "adminpanel/dashboard.html",
        {"stats": stats, "daily_sales": list(daily_sales), "recent_orders": recent_orders},
    )


@staff_required
def orders_list(request):
    status_filter = request.GET.get("status")
    qs = Order.objects.select_related("user").order_by("-created_at")
    if status_filter:
        qs = qs.filter(status=status_filter)
    return render(
        request,
        "adminpanel/orders.html",
        {"orders": qs, "status_filter": status_filter, "status_choices": Order.Status.choices},
    )


@staff_required
def order_detail(request, pk):
    order = get_object_or_404(Order.objects.prefetch_related("items", "status_history"), pk=pk)
    form = OrderStatusForm(instance=order)
    if request.method == "POST":
        form = OrderStatusForm(request.POST, instance=order)
        if form.is_valid():
            old_status = Order.objects.get(pk=pk).status
            order = form.save()
            message = request.POST.get("message", "")
            if order.status != old_status:
                OrderStatusHistory.objects.create(order=order, status=order.status, message=message)
                Notification.objects.create(
                    user=order.user,
                    title="Order status updated",
                    body=f"Order {order.order_number} is now {order.get_status_display()}. {message}".strip(),
                    notification_type=Notification.Type.ORDER,
                    order=order,
                )
            messages.success(request, "Order updated.")
            return redirect("adminpanel_order_detail", pk=pk)
    return render(request, "adminpanel/order_detail.html", {"order": order, "form": form})


@staff_required
def customers_list(request):
    customers = User.objects.filter(is_staff=False).annotate(order_count=Count("orders")).order_by("-date_joined")
    return render(request, "adminpanel/customers.html", {"customers": customers})


@staff_required
def customer_detail(request, pk):
    customer = get_object_or_404(User, pk=pk, is_staff=False)
    orders = customer.orders.order_by("-created_at")
    return render(request, "adminpanel/customer_detail.html", {"customer": customer, "orders": orders})


@staff_required
def products_list(request):
    products = Product.objects.select_related("category").order_by("-updated_at")
    return render(request, "adminpanel/products.html", {"products": products})


@staff_required
def product_form(request, pk=None):
    product = get_object_or_404(Product, pk=pk) if pk else None
    form = ProductForm(request.POST or None, instance=product)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Product saved.")
        return redirect("adminpanel_products")
    return render(request, "adminpanel/product_form.html", {"form": form, "product": product})


@staff_required
def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == "POST":
        product.delete()
        messages.success(request, "Product deleted.")
        return redirect("adminpanel_products")
    return render(request, "adminpanel/product_confirm_delete.html", {"product": product})


@staff_required
def categories_list(request):
    categories = Category.objects.annotate(product_count=Count("products")).order_by("name")
    return render(request, "adminpanel/categories.html", {"categories": categories})


@staff_required
def category_form(request, pk=None):
    category = get_object_or_404(Category, pk=pk) if pk else None
    form = CategoryForm(request.POST or None, request.FILES or None, instance=category)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Category saved.")
        return redirect("adminpanel_categories")
    return render(request, "adminpanel/category_form.html", {"form": form, "category": category})


@staff_required
def category_delete(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == "POST":
        if category.products.exists():
            messages.error(request, "Cannot delete category with products.")
            return redirect("adminpanel_categories")
        category.delete()
        messages.success(request, "Category deleted.")
        return redirect("adminpanel_categories")
    return render(request, "adminpanel/category_confirm_delete.html", {"category": category})


@staff_required
def sales_report(request):
    orders = Order.objects.filter(payment_status__in=["paid", "pending"]).order_by("-created_at")
    by_status = orders.values("status").annotate(count=Count("id"), revenue=Sum("total"))
    return render(request, "adminpanel/sales_report.html", {"orders": orders[:100], "by_status": by_status})
