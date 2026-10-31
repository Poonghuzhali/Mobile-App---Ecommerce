from django import forms

from catalog.models import Category, Product
from orders.models import Order


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = (
            "category",
            "name",
            "description",
            "price",
            "discount_price",
            "stock",
            "sku",
            "is_featured",
            "is_active",
        )


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ("name", "icon", "image", "is_active")


class OrderStatusForm(forms.ModelForm):
    message = forms.CharField(required=False, widget=forms.TextInput(attrs={"placeholder": "Optional note for customer"}))

    class Meta:
        model = Order
        fields = ("status",)
