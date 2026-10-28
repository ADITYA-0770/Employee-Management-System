from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from departments.models import Department
from employees.models import Employee  
from leaves.models import Leave 
from attendance.models import Attendance, AttendanceSession



admin.site.register(CustomUser, UserAdmin)
admin.site.register(Department)
admin.site.register(Employee)
admin.site.register(Leave)
admin.site.register(Attendance)
admin.site.register(AttendanceSession)