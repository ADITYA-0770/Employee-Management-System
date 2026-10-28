from django.urls import path
from .views import PayslipListView, PayslipPDFView

urlpatterns = [
    path('', PayslipListView.as_view(), name='payslip_list'),
    path('<int:id>/pdf/', PayslipPDFView.as_view(), name='payslip_pdf'),
]