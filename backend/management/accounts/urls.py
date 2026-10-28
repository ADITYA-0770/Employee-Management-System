from django.urls import path
from .views import RegisterView, LoginView, UserProfile, UserListView

urlpatterns = [
  path('register/', RegisterView.as_view(), name='register'),
  path('login/', LoginView.as_view(), name='login'),
  path("profile/", UserProfile.as_view(), name="profile"),
  path("users/", UserListView.as_view(), name="users"),
]