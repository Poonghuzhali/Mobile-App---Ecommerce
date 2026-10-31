from django.contrib import admin

from .models import Banner, Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "is_featured", "is_active")
    list_filter = ("category", "is_featured", "is_active")
    search_fields = ("name", "sku")
    inlines = [ProductImageInline]


admin.site.register(Category)
admin.site.register(Banner)
admin.site.register(ProductImage)
