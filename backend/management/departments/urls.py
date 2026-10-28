from django.urls import path
from .views import DepartmentListView, DepartmentCreateView, DepartmentDetailView

urlpatterns = [
    path('', DepartmentListView.as_view(), name='department_list'),
    path('create/', DepartmentCreateView.as_view(), name='department_create'),
    path('<int:pk>/', DepartmentDetailView.as_view(), name='department_detail'),
]