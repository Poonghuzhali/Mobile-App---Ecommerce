from django.urls import path

from .views import BannerListView, CategoryListView, HomeView, ProductDetailView, ProductListView, SearchView

urlpatterns = [
    path("home/", HomeView.as_view()),
    path("categories/", CategoryListView.as_view()),
    path("banners/", BannerListView.as_view()),
    path("products/", ProductListView.as_view()),
    path("products/<int:pk>/", ProductDetailView.as_view()),
    path("search/", SearchView.as_view()),
]
