from .models import ExpenseCategory, Expense
from rest_framework import serializers
from django.utils import timezone

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id','name','description','created_at','updated_at']
        read_only_fields = ['created_at','updated_at']
        
class CreateCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['name','description']

    def create(self, validated_data):
        return ExpenseCategory.objects.create(**validated_data)

class ExpenseSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    
    class Meta: 
        model = Expense
        fields = ['id','employee', 'employee_name','category','amount','description','receipt','status','expense_date','created_at','updated_at']
        read_only_fields = ['created_at','updated_at','status','employee', 'employee_name']
        
    def validate(self, attrs):
        expense_date = attrs.get('expense_date')
        
        if expense_date and expense_date > timezone.now().date():
            raise serializers.ValidationError({'expense_date': 'Expense date cannot be in the future'})

        return attrs    

class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['category','amount','description','receipt','expense_date']

    def validate(self, attrs):
        expense_date = attrs.get('expense_date')
        amount = attrs.get('amount')

        if expense_date and expense_date > timezone.now().date():
            raise serializers.ValidationError({'expense_date': 'Expense date cannot be in the future'})
        
        if amount and amount < 1:
            raise serializers.ValidationError({'amount': 'Amount must be at least 1'})

        return attrs

