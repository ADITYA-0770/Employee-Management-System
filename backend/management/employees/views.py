from django.shortcuts import render
from .serializers import CreateEmployeeSerializer, EmployeeSerializer, EmployeeProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Employee
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminUser


class EmployeeListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        employee = Employee.objects.all()
        serializer = EmployeeSerializer(employee, many=True)
        return Response(serializer.data, status = status.HTTP_200_OK)


class EmployeeCreateView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        serializer = CreateEmployeeSerializer(data = request.data)
        if(serializer.is_valid()):
            serializer.save()
            return Response({'data':serializer.data, 'message': 'Employee created successfully'}, status = status.HTTP_201_CREATED)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)


class EmployeeDetailView(APIView):
    def get_permissions(self):
       if self.request.method == "GET":
           return [IsAuthenticated()]
       else:
           return [IsAdminUser()]

    def get(self, request, id):
        try:
            employee = Employee.objects.get(id = id)
            serializer = EmployeeSerializer(employee)
            return Response(serializer.data, status = status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({'message':'Employee not found'}, status = status.HTTP_404_NOT_FOUND)


    def put(self, request, id):
        try:
            employee = Employee.objects.get(id = id)
            serializer = EmployeeSerializer(employee, data = request.data,  partial=True)
            if(serializer.is_valid()):
                serializer.save()
                return Response({"data":serializer.data, "message": "Employee updated successfully"}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Employee.DoesNotExist:
            return Response({'message':'Employee not found'}, status = status.HTTP_404_NOT_FOUND)

    
    def delete(self, request, id):
        try:
            employee = Employee.objects.get(id = id)
            employee.delete()
            return Response({'message':'Employee deleted'}, status = status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({'message':'Employee not found'}, status = status.HTTP_404_NOT_FOUND)


class EmployeeProfile(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        
            try:
                employee = Employee.objects.get(user = request.user)
                serializer = EmployeeProfileSerializer(employee)
                return Response(serializer.data, status = status.HTTP_200_OK)
            except Employee.DoesNotExist:
                return Response({'message':'Employee not found'}, status = status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        try :
            employee = Employee.objects.get(user = request.user)
            serializer = EmployeeProfileSerializer(employee, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message":"Profile updated successfully", "data":serializer.data}, status = status.HTTP_200_OK)
            return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
        except Employee.DoesNotExist:
            return Response({'message':'Employee not found'}, status = status.HTTP_404_NOT_FOUND)
      