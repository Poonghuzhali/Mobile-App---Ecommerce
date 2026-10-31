from rest_framework import serializers

from .models import Banner, Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "icon", "image_url")

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "url", "is_primary", "alt_text")

    def get_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "category",
            "category_name",
            "price",
            "discount_price",
            "effective_price",
            "stock",
            "is_featured",
            "rating",
            "primary_image",
        )

    def get_primary_image(self, obj):
        request = self.context.get("request")
        url = obj.primary_image_url
        if not url:
            return None
        if str(url).startswith("http"):
            return url
        if request:
            return request.build_absolute_uri(url)
        return url


class ProductDetailSerializer(ProductListSerializer):
    images = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ("description", "sku", "images", "created_at")

    def get_images(self, obj):
        request = self.context.get("request")
        uploaded = ProductImageSerializer(obj.images.all(), many=True, context=self.context).data
        if uploaded:
            return uploaded
        urls = []
        if obj.cover_image_url:
            urls.append(obj.cover_image_url)
        urls.extend([u for u in (obj.gallery_urls or []) if u not in urls])
        result = []
        for i, url in enumerate(urls):
            full = url
            if url and not str(url).startswith("http") and request:
                full = request.build_absolute_uri(url)
            result.append({"id": i, "url": full, "is_primary": i == 0, "alt_text": obj.name})
        return result


class BannerSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    category_id = serializers.IntegerField(source="link_category_id", read_only=True)

    class Meta:
        model = Banner
        fields = (
            "id",
            "title",
            "subtitle",
            "image_url",
            "gradient_start",
            "gradient_end",
            "category_id",
        )

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
