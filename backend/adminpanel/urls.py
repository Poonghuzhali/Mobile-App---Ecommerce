from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

urlpatterns = [
    path("login/", auth_views.LoginView.as_view(template_name="adminpanel/login.html"), name="adminpanel_login"),
    path("logout/", auth_views.LogoutView.as_view(), name="adminpanel_logout"),
    path("", views.dashboard, name="adminpanel_dashboard"),
    path("orders/", views.orders_list, name="adminpanel_orders"),
    path("orders/<int:pk>/", views.order_detail, name="adminpanel_order_detail"),
    path("customers/", views.customers_list, name="adminpanel_customers"),
    path("customers/<int:pk>/", views.customer_detail, name="adminpanel_customer_detail"),
    path("products/", views.products_list, name="adminpanel_products"),
    path("products/new/", views.product_form, name="adminpanel_product_new"),
    path("products/<int:pk>/edit/", views.product_form, name="adminpanel_product_edit"),
    path("products/<int:pk>/delete/", views.product_delete, name="adminpanel_product_delete"),
    path("categories/", views.categories_list, name="adminpanel_categories"),
    path("categories/new/", views.category_form, name="adminpanel_category_new"),
    path("categories/<int:pk>/edit/", views.category_form, name="adminpanel_category_edit"),
    path("categories/<int:pk>/delete/", views.category_delete, name="adminpanel_category_delete"),
    path("reports/sales/", views.sales_report, name="adminpanel_sales_report"),
]
