from django.urls import path
from .views import (
    CategoryView,
    CreateCategoryView,
    UpdateCategoryView,
    ExpenseList,
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseStatusUpdate
)

urlpatterns = [
    path('category/', CategoryView.as_view(), name='category'),
    path('category/create/', CreateCategoryView.as_view(), name='create_category'),
    path('category/update/<int:id>/', UpdateCategoryView.as_view(), name='update_category'),
    path('category/<int:id>/', UpdateCategoryView.as_view(), name='category_detail'),
    path('', ExpenseList.as_view(), name='expense_list'),
    path('create/', ExpenseCreate.as_view(), name='expense_create'),
    path('update/<int:id>/', ExpenseUpdate.as_view(), name='expense_update'),
    path('<int:id>/', ExpenseUpdate.as_view(), name='expense_detail'),
    path('status/<int:id>/', ExpenseStatusUpdate.as_view(), name='expense_status_update'),
]
