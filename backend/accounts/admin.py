from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Address, PasswordResetToken, User, WishlistItem


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("Extra", {"fields": ("phone", "avatar")}),)
    list_display = ("username", "email", "phone", "is_staff", "date_joined")


admin.site.register(Address)
admin.site.register(WishlistItem)
admin.site.register(PasswordResetToken)
