from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Employee
        fields = ['id', 'user', 'employee_name', 'email', 'employee_id', 'phone', 'gender', 'date_of_birth', 'photo', 'department', 'designation', 'salary', 'joining_date', 'address', 'city', 'state', 'country', 'pincode', 'status', 'created_at', 'updated_at' ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'employee_name', 'email']


class CreateEmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['user','employee_id', 'phone', 'gender', 'date_of_birth', 'photo', 'department', 'designation', 'salary', 'joining_date', 'address', 'city', 'state', 'country', 'pincode', 'status']

    def validate_user(self, user):
        if Employee.objects.filter(user=user).exists():
            raise serializers.ValidationError(
                "This user already has an employee profile."
            )
        return user


class EmployeeProfileSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [ 'id', 'user','employee_id','phone','gender','date_of_birth','photo','department','department_name','designation','salary','joining_date','address','city','state','country','pincode','status','created_at','updated_at',]
        
        read_only_fields = [ 'id','user','employee_id','department','designation','salary','joining_date','status','created_at','updated_at',]
       
