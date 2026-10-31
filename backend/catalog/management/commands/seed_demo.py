from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from catalog.models import Banner, Category, Product

User = get_user_model()

# name, category, price, discount, stock, featured, cover, gallery extras
SAMPLE_PRODUCTS = [
    (
        "Wireless Noise-Cancel Headphones",
        "Electronics",
        4999,
        3999,
        25,
        True,
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85",
        [
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=900&q=85",
            "https://images.unsplash.com/photo-1583394838336-acd9777362f7?w=900&q=85",
        ],
    ),
    (
        "Minimalist Leather Watch",
        "Fashion",
        3499,
        None,
        40,
        True,
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85",
        ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=900&q=85"],
    ),
    (
        "Smart Fitness Band Pro",
        "Electronics",
        2999,
        2499,
        60,
        True,
        "https://images.unsplash.com/photo-1575311373937-040b8e1a5bf7?w=900&q=85",
        ["https://images.unsplash.com/photo-1555616263-9d2734a9fe43?w=900&q=85"],
    ),
    (
        "Organic Skincare Set",
        "Beauty",
        1899,
        1599,
        35,
        False,
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=85",
        ["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=85"],
    ),
    (
        "Premium Running Shoes",
        "Sports",
        5999,
        4799,
        18,
        True,
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85",
        [
            "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=900&q=85",
            "https://images.unsplash.com/photo-1606107557195-0a029567a4cb?w=900&q=85",
        ],
    ),
    (
        "Ceramic Coffee Mug Set",
        "Home",
        899,
        None,
        100,
        False,
        "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=900&q=85",
        [],
    ),
    (
        "Bluetooth Speaker Mini",
        "Electronics",
        2199,
        1799,
        45,
        True,
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=85",
        ["https://images.unsplash.com/photo-1606226837851-aa3b3bb3e6e9?w=900&q=85"],
    ),
    (
        "Yoga Mat Ultra Grip",
        "Sports",
        1299,
        None,
        55,
        False,
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=900&q=85",
        [],
    ),
    (
        "Denim Jacket Classic",
        "Fashion",
        2799,
        2299,
        22,
        True,
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=85",
        ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=900&q=85"],
    ),
    (
        "LED Desk Lamp",
        "Home",
        1599,
        1299,
        30,
        False,
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=85",
        ["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&q=85"],
    ),
]

class Command(BaseCommand):
    help = "Seed demo categories, products, banners, and admin user"

    def handle(self, *args, **options):
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={"email": "admin@luxecart.local", "is_staff": True, "is_superuser": True},
        )
        if created:
            admin.set_password("Admin@12345")
            admin.save()
            self.stdout.write("Created admin (admin / Admin@12345)")

        categories = {}
        for name, icon in [
            ("Electronics", "hardware-chip-outline"),
            ("Fashion", "shirt-outline"),
            ("Beauty", "sparkles-outline"),
            ("Sports", "fitness-outline"),
            ("Home", "home-outline"),
        ]:
            cat, _ = Category.objects.get_or_create(name=name, defaults={"icon": icon})
            categories[name] = cat

        for idx, row in enumerate(SAMPLE_PRODUCTS):
            name, cat_name, price, discount, stock, featured, cover, gallery = row
            sku = f"SKU-{1000 + idx}"
            Product.objects.update_or_create(
                sku=sku,
                defaults={
                    "name": name,
                    "category": categories[cat_name],
                    "description": f"Premium quality {name.lower()} with fast delivery and easy returns.",
                    "price": Decimal(str(price)),
                    "discount_price": Decimal(str(discount)) if discount else None,
                    "stock": stock,
                    "is_featured": featured,
                    "is_active": True,
                    "rating": Decimal("4.6"),
                    "cover_image_url": cover,
                    "gallery_urls": gallery,
                },
            )

        Banner.objects.get_or_create(
            title="Summer Luxe Sale",
            defaults={
                "subtitle": "Up to 40% off on featured picks",
                "gradient_start": "#6366F1",
                "gradient_end": "#EC4899",
                "link_category": categories["Fashion"],
                "sort_order": 1,
            },
        )
        Banner.objects.get_or_create(
            title="Tech Essentials",
            defaults={
                "subtitle": "Headphones, bands & more",
                "gradient_start": "#0EA5E9",
                "gradient_end": "#6366F1",
                "link_category": categories["Electronics"],
                "sort_order": 2,
            },
        )
        self.stdout.write(self.style.SUCCESS("Demo data seeded with product images."))
