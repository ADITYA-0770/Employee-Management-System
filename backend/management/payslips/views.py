from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from .models import Payslip
from employees.models import Employee
from .serializers import PayslipSerializer
import calendar

class PayslipListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        is_admin = request.user.is_superuser or request.user.is_staff or request.user.groups.filter(name__iexact="Admin").exists()
        if is_admin:
            payslips = Payslip.objects.all().order_by('-year', '-month')
            serializer = PayslipSerializer(payslips, many=True)
            return Response(serializer.data)
        
        try:
            employee = Employee.objects.get(user=request.user)
            payslips = Payslip.objects.filter(employee=employee).order_by('-year', '-month')
            serializer = PayslipSerializer(payslips, many=True)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response({'detail': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)


class PayslipPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            payslip = Payslip.objects.get(id=id)
            is_admin = request.user.is_superuser or request.user.is_staff or request.user.groups.filter(name__iexact="Admin").exists()
            employee = Employee.objects.filter(user=request.user).first()
            
            # Authorization check
            if not is_admin and (not employee or payslip.employee != employee):
                return Response({'detail': 'Not authorized to view this payslip.'}, status=status.HTTP_403_FORBIDDEN)
                
            template = get_template('payslips/payslip_template.html')
            
            month_name = calendar.month_name[payslip.month]
            total_earnings = payslip.basic_salary + payslip.allowances
            
            context = {
                'payslip': payslip,
                'month': month_name,
                'total_earnings': total_earnings
            }
            html = template.render(context)
            
            response = HttpResponse(content_type='application/pdf')
            # attachment; forces download in most browsers. Use inline; to display in browser.
            response['Content-Disposition'] = f'attachment; filename="payslip_{payslip.employee.employee_id}_{month_name}_{payslip.year}.pdf"'
            
            # Create PDF
            pisa_status = pisa.CreatePDF(html, dest=response)
            
            if pisa_status.err:
                return Response({'detail': 'Failed to generate PDF'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            return response
            
        except Employee.DoesNotExist:
            return Response({'detail': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        except Payslip.DoesNotExist:
            return Response({'detail': 'Payslip not found'}, status=status.HTTP_404_NOT_FOUND)
