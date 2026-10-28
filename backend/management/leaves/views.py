from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .serializers import LeaveSerializer, LeaveCreateSerializer, LeaveStatusSerializer
from employees.models import Employee
from rest_framework import status
from employees.permissions import IsAdminUser
from .models import Leave

class LeaveApplyView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = LeaveCreateSerializer(data=request.data)
        if serializer.is_valid():
            try : 
                employee = Employee.objects.get(user = request.user)
            except Employee.DoesNotExist:
                return Response({'message':'Employee not found'}, status = status.HTTP_404_NOT_FOUND)
            leave = serializer.save(employee = employee )
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class MyLeavesListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            leaves = Leave.objects.filter(employee=employee)
            serializer = LeaveSerializer(leaves, many = True)
            return Response(serializer.data, status = status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({'message':'Employee not found'}, status = status.HTTP_404_NOT_FOUND)
        

class MyLeavesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            leave = Leave.objects.get(id = id, employee__user=request.user)
            serializer = LeaveSerializer(leave)
            return Response(serializer.data, status = status.HTTP_200_OK)
        except Leave.DoesNotExist:
            return Response({'message':'Leave not found'}, status = status.HTTP_404_NOT_FOUND)

    def delete(self, request, id):
        try: 
            leave = Leave.objects.get(id = id, employee__user = request.user)
            if leave.status == 'pending':
                leave.delete()
                return Response({'message':'Leave deleted successfully'}, status = status.HTTP_200_OK)
            else:
                return Response({'message':'Leave is already approved or rejected'}, status = status.HTTP_400_BAD_REQUEST)
        except Leave.DoesNotExist:
            return Response({'message':'Leave not found'}, status = status.HTTP_404_NOT_FOUND)
           

#Admin Side

class AdminLeaveListView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        leaves = Leave.objects.all()
        serializer = LeaveSerializer(leaves, many = True)
        return Response(serializer.data, status = status.HTTP_200_OK)

class AdminLeaveView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request, id):
        try:
            leave = Leave.objects.get(id = id)
            serializer = LeaveSerializer(leave)
            return Response(serializer.data, status = status.HTTP_200_OK)
        except Leave.DoesNotExist:
            return Response({'message':'Leave not found'}, status = status.HTTP_404_NOT_FOUND)
    
    def patch(self, request, id):
        try:
            leave = Leave.objects.get(id = id)
            serializer = LeaveStatusSerializer(leave, data = request.data, partial = True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status = status.HTTP_200_OK)
            return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
        except Leave.DoesNotExist:
            return Response({'message':'Leave not found'}, status = status.HTTP_404_NOT_FOUND)