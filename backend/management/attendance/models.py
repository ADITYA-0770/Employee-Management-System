from django.db import models
from employees.models import Employee

class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete = models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=20, choices = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Leave', 'Leave'),
        ('half day', 'Half Day'),
    ])
    total_working_time = models.DurationField(null = True)
    created_at = models.DateTimeField(auto_now_add= True)
    updated_at = models.DateTimeField(auto_now= True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "date"],
                name="unique_employee_attendance_per_day"
            )
        ]

    def __str__(self):
        return f"{self.employee.user.first_name} - {self.date} - {self.status}"

class AttendanceSession(models.Model):
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE, related_name='sessions')
    checkin_time = models.DateTimeField(null = True)
    checkout_time = models.DateTimeField(null = True)
    duration = models.DurationField(null = True)
    session_number = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.attendance.employee.user.first_name} - {self.attendance.date} - {self.checkin_time} to {self.checkout_time}"
    