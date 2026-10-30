from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import CategorySerializer,CreateCategorySerializer, ExpenseCreateSerializer, ExpenseSerializer 
from .models import ExpenseCategory, Expense
from employees.permissions import IsAdminUser
from employees.models import Employee

class CategoryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        categories = ExpenseCategory.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
class CreateCategoryView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        serializer = CreateCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateCategoryView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request, id):
        try:
            category = ExpenseCategory.objects.get(id=id)
        except ExpenseCategory.DoesNotExist:
            return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        return self.patch(request, id)

    def patch(self, request, id):
        try:
            category = ExpenseCategory.objects.get(id=id)
        except ExpenseCategory.DoesNotExist:
            return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try:
            category = ExpenseCategory.objects.get(id=id)
        except ExpenseCategory.DoesNotExist:
            return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        category.delete()
        return Response({'detail': 'Category deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

class ExpenseCreate(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def post(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            serializer = ExpenseCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(employee=employee)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Employee.DoesNotExist:
            return Response({'detail': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

class ExpenseList(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        is_admin = request.user.is_superuser or request.user.is_staff or request.user.groups.filter(name__iexact="Admin").exists()
        if is_admin:
            expenses = Expense.objects.all()
            serializer = ExpenseSerializer(expenses, many=True, context={'request': request})
            return Response(serializer.data)
        try: 
            employee = Employee.objects.get(user=request.user)
            expenses = Expense.objects.filter(employee=employee)
            serializer = ExpenseSerializer(expenses, many=True, context={'request': request})
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response({'detail': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

class ExpenseUpdate(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get(self, request, id):
        try:
            expense = Expense.objects.get(id=id)
        except Expense.DoesNotExist:
            return Response({'detail': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseSerializer(expense, context={'request': request})
        return Response(serializer.data)

    def put(self, request, id):
        return self.patch(request, id)

    def patch(self, request, id):
        try:
            expense = Expense.objects.get(id=id)
        except Expense.DoesNotExist:
            return Response({'detail': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseSerializer(expense, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try:
            expense = Expense.objects.get(id=id)
        except Expense.DoesNotExist:
            return Response({'detail': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
            
        if expense.status != 'pending':
            return Response({'detail': 'Expense cannot be deleted because it is not in pending state'}, status=status.HTTP_400_BAD_REQUEST)
        expense.delete()
        return Response({'detail': 'Expense successfully Deleted'}, status=status.HTTP_204_NO_CONTENT)

class ExpenseStatusUpdate(APIView):
    # Only users in the "Admin" group can access this view
    permission_classes = [IsAdminUser]

    def patch(self, request, id):
        try:
            expense = Expense.objects.get(id=id)
        except Expense.DoesNotExist:
            return Response({'detail': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('status')
        if new_status not in ['approved', 'rejected']:
            return Response({'detail': 'Invalid status. Must be "approved" or "rejected".'}, status=status.HTTP_400_BAD_REQUEST)
        
        if expense.status == 'approved' or expense.status == 'rejected':
            return Response({'detail': 'Expense cannot be updated because it is already approved or rejected'}, status=status.HTTP_400_BAD_REQUEST)
        
        expense.status = new_status
        expense.save()
        
        serializer = ExpenseSerializer(expense, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)