from django.urls import path

from .views import TeamAPIView, MiningAPIView, WalletsAPIView, HomeAPIView

urlpatterns = [
    path('team/', TeamAPIView.as_view()),
    path('mining/', MiningAPIView.as_view()),
    path('wallets/', WalletsAPIView.as_view()),
    path('home/', HomeAPIView.as_view())
]
