from django.db.models import Q
from django_filters import rest_framework as filters
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Banner, Category, Product
from .serializers import BannerSerializer, CategorySerializer, ProductDetailSerializer, ProductListSerializer


class ProductFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    category = filters.NumberFilter(field_name="category_id")
    in_stock = filters.BooleanFilter(method="filter_in_stock")

    class Meta:
        model = Product
        fields = ["category", "is_featured"]

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset


class ProductListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductListSerializer
    queryset = Product.objects.filter(is_active=True).select_related("category").prefetch_related("images")
    filterset_class = ProductFilter
    search_fields = ["name", "description", "category__name"]
    ordering_fields = ["price", "created_at", "rating", "name"]
    ordering = ["-created_at"]


class ProductDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductDetailSerializer
    queryset = Product.objects.filter(is_active=True).select_related("category").prefetch_related("images")
    lookup_field = "pk"


class CategoryListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CategorySerializer
    queryset = Category.objects.filter(is_active=True)


class BannerListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = BannerSerializer
    queryset = Banner.objects.filter(is_active=True).select_related("link_category")


class HomeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(
            {
                "banners": BannerSerializer(
                    Banner.objects.filter(is_active=True)[:5], many=True, context={"request": request}
                ).data,
                "categories": CategorySerializer(
                    Category.objects.filter(is_active=True)[:12], many=True, context={"request": request}
                ).data,
                "featured_products": ProductListSerializer(
                    Product.objects.filter(is_active=True, is_featured=True)[:8],
                    many=True,
                    context={"request": request},
                ).data,
            }
        )


class SearchView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductListSerializer

    def get_queryset(self):
        q = self.request.query_params.get("q", "").strip()
        category = self.request.query_params.get("category")
        qs = Product.objects.filter(is_active=True).select_related("category").prefetch_related("images")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q) | Q(category__name__icontains=q))
        if category:
            qs = qs.filter(category_id=category)
        return qs
