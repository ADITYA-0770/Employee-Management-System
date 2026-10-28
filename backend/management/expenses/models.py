from django.db import models
from employees.models import Employee

class ExpenseCategory(models.Model):
    name = models.CharField(unique=True,max_length=100)
    description = models.TextField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Expense(models.Model):
    employee = models.ForeignKey(Employee,on_delete=models.CASCADE,related_name='expenses')
    category = models.ForeignKey(ExpenseCategory,on_delete=models.SET_NULL,related_name='expenses',null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(max_length=200)
    receipt = models.FileField(upload_to='receipts',null=True,blank=True)
    status = models.CharField(max_length=20,choices=[
        ('pending','Pending'),
        ('approved','Approved'),
        ('rejected','Rejected'),
    ],default='pending')
    expense_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.user.email}"
