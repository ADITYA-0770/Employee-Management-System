from .serializers import DepartmentSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView     
from rest_framework.permissions import IsAuthenticated
from .models import Department
from employees.permissions import IsAdminUser


class DepartmentListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        department = Department.objects.all()
        if(department.exists()):
            serializer = DepartmentSerializer(department, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response([], status=status.HTTP_200_OK)

class DepartmentCreateView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)    
        if serializer.is_valid():
            serializer.save()
            return Response({"data":serializer.data, "message": "Department created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DepartmentDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            department = Department.objects.get(pk=pk)
            serializer = DepartmentSerializer(department)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Department.DoesNotExist:
            return Response({"message": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
        
    def put(self, request, pk):
        try:
            department = Department.objects.get(pk=pk)
            serializer = DepartmentSerializer(department, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"data":serializer.data, "message": "Department updated successfully"}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Department.DoesNotExist:
            return Response({"message": "Department not found"}, status=status.HTTP_404_NOT_FOUND)   


    def delete(self, request, pk):
        try:
            department = Department.objects.get(pk=pk)
            department.delete()
            return Response({"message": "Department deleted successfully"}, status=status.HTTP_200_OK)
        except Department.DoesNotExist:
            return Response({"message": "Department not found"}, status=status.HTTP_404_NOT_FOUND)    