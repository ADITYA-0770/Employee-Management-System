from django.db import models

class Leave(models.Model):
      employee = models.ForeignKey("employees.employee", on_delete=models.CASCADE, related_name="leaves")
      LEAVE_TYPE_CHOICES = [
      ("paid", "Paid Leave"),
      ("sick", "Sick Leave"),
      ("unpaid", "Unpaid Leave"),
      ("half_day", "Half Day"),
     ]
      leave_type = models.CharField(max_length=20, choices = LEAVE_TYPE_CHOICES)
      start_date = models.DateField()
      end_date = models.DateField()
      reason = models.TextField(max_length=100)
      STATUS_CHOICES = [
      ("pending", "Pending"),
      ("approved", "Approved"),
      ("rejected", "Rejected"),
      ]
      status = models.CharField(max_length=20, choices = STATUS_CHOICES, default="pending")
      created_at = models.DateTimeField(auto_now_add=True)
      updated_at = models.DateTimeField(auto_now=True)

      def __str__(self):
          return f"{self.employee} - {self.leave_type}"
