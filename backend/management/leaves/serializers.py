from rest_framework import serializers
from .models import Leave

class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    
    class Meta:
        model = Leave
        fields = ['id','employee', 'employee_name', 'leave_type','start_date', 'end_date', 'reason', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id','employee', 'employee_name', 'created_at', 'updated_at', 'status']

class LeaveCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = ['leave_type', 'start_date', 'end_date','reason']
    
    def validate(self, attrs):
        if attrs['end_date'] < attrs['start_date']:
            raise serializers.ValidationError("End date must be after start date")
        return attrs
        

class LeaveStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = ['id', 'status']
        read_only_fields = ['id']

    def validate_status(self, value):
        if self.instance.status != 'pending':
            raise serializers.ValidationError("Only pending leaves can be approved or rejected.")
        
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError("Status must be either approved or rejected.")
        
        return value
