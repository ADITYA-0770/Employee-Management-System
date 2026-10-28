import calendar
from datetime import date
from decimal import Decimal
from .models import Payslip
from attendance.models import Attendance
from leaves.models import Leave

def get_days_in_month(month, year):
    return calendar.monthrange(year, month)[1]

def calculate_and_generate_payslip(employee, month, year):
    # Check if a payslip for this month/year already exists
    if Payslip.objects.filter(employee=employee, month=month, year=year).exists():
        return None

    days_in_month = get_days_in_month(month, year)
    daily_salary = Decimal(employee.salary) / Decimal(days_in_month)
    
    # 1. Absences and Half-days from Attendance
    attendances = Attendance.objects.filter(
        employee=employee,
        date__year=year,
        date__month=month
    )
    absent_days = attendances.filter(status='Absent').count()
    half_days = attendances.filter(status__iexact='half day').count()

    # 2. Unpaid Leaves
    start_of_month = date(year, month, 1)
    end_of_month = date(year, month, days_in_month)
    
    unpaid_leaves = Leave.objects.filter(
        employee=employee,
        status='approved',
        leave_type='unpaid',
        start_date__lte=end_of_month,
        end_date__gte=start_of_month
    )
    
    unpaid_leave_days = 0
    for leave in unpaid_leaves:
        overlap_start = max(leave.start_date, start_of_month)
        overlap_end = min(leave.end_date, end_of_month)
        if overlap_end >= overlap_start:
            unpaid_leave_days += (overlap_end - overlap_start).days + 1
            
    # Calculate deductions
    deduction_days = Decimal(absent_days) + (Decimal(half_days) * Decimal('0.5')) + Decimal(unpaid_leave_days)
    
    if deduction_days > days_in_month:
        deduction_days = Decimal(days_in_month)
        
    deductions = deduction_days * daily_salary
    
    basic_salary = Decimal(employee.salary)
    allowances = Decimal('0.00')
    net_salary = basic_salary - deductions + allowances
    
    payslip = Payslip.objects.create(
        employee=employee,
        month=month,
        year=year,
        basic_salary=round(basic_salary, 2),
        allowances=round(allowances, 2),
        deductions=round(deductions, 2),
        net_salary=round(net_salary, 2)
    )
    return payslip
