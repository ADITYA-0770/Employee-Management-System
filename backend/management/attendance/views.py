from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone
from attendance.models import Attendance, AttendanceSession
from attendance.serializers import AttendanceSessionSerializer, AttendanceSerializer, AdminAttendanceSerializer, AdminAttendanceSessionSerializer, AdminAttendanceCorrectionSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from employees.models import Employee
from datetime import timedelta
from employees.permissions import IsAdminUser
from attendance.services import close_lingering_sessions

class CheckInView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):    
        try:
            employee = Employee.objects.get(user = request.user)
            close_lingering_sessions(employee)
            current_time = timezone.now()
            today = current_time.date()
            attendance, created = Attendance.objects.get_or_create(employee =  employee, date = today, defaults={'status': 'Present'})
            
            
            active_session = AttendanceSession.objects.filter(attendance = attendance, checkout_time__isnull=True).first()
            
            if active_session:
                return Response({
                    'status': 'error',
                    'message': 'You have already checked in'
                }, status = status.HTTP_400_BAD_REQUEST)
            
            session = AttendanceSession.objects.create(
                session_number = attendance.sessions.count() + 1,
                attendance = attendance,
                checkin_time = current_time,
            )
            serializer = AttendanceSessionSerializer(session)

            return Response(
                {
                    "status": "success",
                    "message": "Checked in successfully.",
                    "session_id": session.id,
                    "checkin_time": session.checkin_time
                },
                status=status.HTTP_201_CREATED
            )
            
        except Employee.DoesNotExist:
            return Response({"status": "error", "message": "Employee not found"}, status = status.HTTP_404_NOT_FOUND)

class CheckOutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            employee = Employee.objects.get(user = request.user)
            current_time = timezone.now()
            today = current_time.date()
            attendance = Attendance.objects.get(employee = employee, date = today)
            active_session = AttendanceSession.objects.filter(attendance = attendance, checkout_time__isnull=True).first()
            if not active_session:
                return Response({
                    'status': 'error',
                    'message': 'You have not checked in yet'
                }, status = status.HTTP_400_BAD_REQUEST)

            active_session.checkout_time = current_time
            calculate_duration = active_session.checkout_time - active_session.checkin_time
            active_session.duration = calculate_duration
            active_session.save()
            
            if attendance.total_working_time is None:
                attendance.total_working_time = calculate_duration
            else:
                attendance.total_working_time += calculate_duration
            attendance.save()

            total_seconds = int(attendance.total_working_time.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            formatted_time = f"{hours:02}:{minutes:02}:{seconds:02}"

            serializer = AttendanceSessionSerializer(active_session)
            return Response(
                {
                    "status" : "success",
                    "message": "Checked out successfully",
                    "session" : serializer.data,
                    "total_working_time" : formatted_time
                }, status = status.HTTP_200_OK)
            
        except Employee.DoesNotExist:
            return Response({"status": "error", "message": "Employee not found"}, status = status.HTTP_404_NOT_FOUND)

        except Attendance.DoesNotExist:
            return Response({"status": "error", "message": "Attendance not found"}, status = status.HTTP_404_NOT_FOUND)

class AttendanceHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            employee = Employee.objects.get(user = request.user)
            close_lingering_sessions(employee)
            attendance = Attendance.objects.filter(employee = employee)
            serializer = AttendanceSerializer(attendance, many = True)
            
            total_working_time = timedelta()
            for att in attendance:
                if att.total_working_time:
                    total_working_time += att.total_working_time
            
            total_seconds = int(total_working_time.total_seconds())
            hours, remainder = divmod(total_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            formatted_time = f"{hours:02}:{minutes:02}:{seconds:02}"



            return Response({"status": "success", 
                            "attendance": serializer.data,
                            "overall_total_working_time": formatted_time}, status = status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({"status": "error", "message": "Employee not found"}, status = status.HTTP_404_NOT_FOUND)


class TodayAttendanceView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            employee = Employee.objects.get(user = request.user)
            close_lingering_sessions(employee)
            attendance = Attendance.objects.filter(employee = employee, date = timezone.now().date())
            serializer = AttendanceSerializer(attendance, many = True)
            return Response({"status": "success", "attendance": serializer.data}, status = status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({"status": "error", "message": "Employee not found"}, status = status.HTTP_404_NOT_FOUND)

class AdminAttendanceListView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        try:
            close_lingering_sessions()
            attendance = Attendance.objects.all()
            
            employee_id = request.query_params.get('employee')
            date = request.query_params.get('date')
            status_filter = request.query_params.get('status')
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            if employee_id:
                attendance = attendance.filter(employee__employee_id=employee_id)
            if date:
                attendance = attendance.filter(date=date)
            if status_filter:
                attendance = attendance.filter(status__iexact=status_filter)
            if start_date and end_date:
                attendance = attendance.filter(date__range=[start_date, end_date])
            elif start_date:
                attendance = attendance.filter(date__gte=start_date)
            elif end_date:
                attendance = attendance.filter(date__lte=end_date)

            serializer = AdminAttendanceSerializer(attendance, many = True)
            return Response({"status": "success", "attendance": serializer.data}, status = status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminAttendanceDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            attendance = Attendance.objects.get(pk=pk)
            serializer = AdminAttendanceSerializer(attendance)
            return Response({"status": "success", "attendance": serializer.data}, status=status.HTTP_200_OK)
        except Attendance.DoesNotExist:
            return Response({"status": "error", "message": "Attendance record not found"}, status=status.HTTP_404_NOT_FOUND)

class AdminAttendanceCorrectionView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            attendance = Attendance.objects.get(pk = pk)
            serializer = AdminAttendanceCorrectionSerializer(attendance, data = request.data, partial = True)

            if serializer.is_valid():
               serializer.save()
               return Response({
                'status': 'Success',
                'message': 'Attendance Status corrected successfully',
                'attendance': AdminAttendanceSerializer(attendance).data
               }, status = status.HTTP_200_OK)
            return Response({'status': 'Error', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Attendance.DoesNotExist:
            return Response({'status': 'Error', 'message': 'Attendance not found'}, status=status.HTTP_404_NOT_FOUND)
    

class AdminAttendanceSessionCorrectionView(APIView):
    permission_classes = [IsAdminUser]
    
    def patch(self, request, pk):
        try:
            session = AttendanceSession.objects.get(pk=pk)
            attendance = session.attendance
            
            serializer = AdminAttendanceSessionSerializer(session, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                if session.checkin_time and session.checkout_time:
                    
                    session.duration = (session.checkout_time - session.checkin_time)
                    session.save()
                
                total = timedelta()
                for s in attendance.sessions.all():
                    if s.duration:
                        total += s.duration
                
                attendance.total_working_time = total
                attendance.save()
                
                return Response({"status": "success", "message": "Session corrected successfully", "attendance": AdminAttendanceSerializer(attendance).data}, status=status.HTTP_200_OK)
            return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except AttendanceSession.DoesNotExist:
            return Response({"status": "error", "message": "Session not found"}, status=status.HTTP_404_NOT_FOUND)