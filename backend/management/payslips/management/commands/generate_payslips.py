from django.core.management.base import BaseCommand
from employees.models import Employee
from payslips.utils import calculate_and_generate_payslip
import datetime

class Command(BaseCommand):
    help = 'Generates payslips for all active employees for the specified month and year.'

    def add_arguments(self, parser):
        parser.add_argument('--month', type=int, help='Month (1-12) to generate payslips for. Defaults to last month.')
        parser.add_argument('--year', type=int, help='Year to generate payslips for. Defaults to year of last month.')

    def handle(self, *args, **options):
        today = datetime.date.today()
        # Default to previous month if not provided
        first_day_of_current_month = today.replace(day=1)
        last_month_date = first_day_of_current_month - datetime.timedelta(days=1)
        
        month = options['month'] or last_month_date.month
        year = options['year'] or last_month_date.year

        self.stdout.write(f"Generating payslips for {month}/{year}...")
        
        active_employees = Employee.objects.filter(status='active')
        count = 0
        
        for employee in active_employees:
            payslip = calculate_and_generate_payslip(employee, month, year)
            if payslip:
                self.stdout.write(self.style.SUCCESS(f"Generated payslip for {employee.user.email}"))
                count += 1
            else:
                self.stdout.write(self.style.WARNING(f"Payslip already exists for {employee.user.email}"))
                
        self.stdout.write(self.style.SUCCESS(f"Successfully generated {count} new payslips."))
