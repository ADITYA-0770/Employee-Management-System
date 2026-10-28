from django.urls import path
from .views import EmployeeListView, EmployeeCreateView, EmployeeDetailView, EmployeeProfile

urlpatterns = [
    path('', EmployeeListView.as_view(), name='employee_list'),
    path('create/', EmployeeCreateView.as_view(), name='employee_create'),
    path('<int:id>/', EmployeeDetailView.as_view(), name='employee_detail'),
    path('profile/', EmployeeProfile.as_view(), name='employee_profile'),
]