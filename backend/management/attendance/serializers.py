from rest_framework import serializers
from .models import Attendance, AttendanceSession
from employees.models import Employee

class SimpleEmployeeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'name', 'email']

    def get_name(self, obj):
        if not obj or not obj.user:
            return ""
        full_name = obj.user.get_full_name().strip()
        if full_name:
            return full_name
        return obj.user.email or obj.employee_id

class AttendanceSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSession
        fields = ['id', 'checkin_time', 'checkout_time', 'duration', 'session_number']
        read_only_fields = ['id', 'checkin_time', 'checkout_time','duration', 'session_number']

class AttendanceSerializer(serializers.ModelSerializer):
    sessions = AttendanceSessionSerializer(read_only=True, many=True)
    class Meta :
        model = Attendance
        fields = ['id', 'employee', 'date', 'status', 'total_working_time', 'created_at', 'updated_at', 'sessions']
        read_only_fields = ['id', 'employee', 'created_at', 'updated_at', 'total_working_time', 'status', 'sessions']

class AdminAttendanceSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSession
        fields = ['id', 'checkin_time', 'checkout_time', 'duration', 'session_number']
        read_only_fields = ['id','duration', 'session_number']

    def validate(self, attrs):
        checkin_time = attrs.get('checkin_time', self.instance.checkin_time)
        checkout_time = attrs.get('checkout_time', self.instance.checkout_time)
        
        if checkin_time and checkout_time:
            if checkout_time <= checkin_time:
                raise serializers.ValidationError({
                    'checkout_time':
                        'Checkout time must be after check-in time.'
                })
        return attrs

class AdminAttendanceSerializer(serializers.ModelSerializer):
    employee = SimpleEmployeeSerializer(read_only=True)
    sessions = AdminAttendanceSessionSerializer(read_only=True, many=True)
    class Meta :
        model = Attendance
        fields = ['id', 'employee', 'date', 'status', 'total_working_time', 'created_at', 'updated_at', 'sessions']
        read_only_fields = ['id', 'employee', 'created_at', 'updated_at', 'total_working_time', 'date']


class AdminAttendanceCorrectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ["id", "status"]
        read_only_fields = ["id"]

    def validate_status(self, value):
        valid_statuses = {
            "Present",
            "Absent",
            "Leave",
            "half day",
        }

        if value not in valid_statuses:
            raise serializers.ValidationError(
                "Invalid attendance status."
            )

        return value



