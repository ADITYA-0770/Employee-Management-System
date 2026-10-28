from django.utils import timezone
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Announcements
from .serializers import AnnouncementSerializers, CreateAnnouncementSerializer, AnnouncementDetailSerializer
from employees.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated

class AnnouncementList(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            # Check if user is an admin (is_staff covers superusers who might not be in an 'admin' group)
            if request.user.is_staff or request.user.groups.filter(name__iexact='admin').exists():
                announcements = Announcements.objects.all()
            else:
                announcements = Announcements.objects.filter(
                    status='published',
                    publish_at__lte=timezone.now()
                ).filter(
                    Q(expires_at__isnull=True) | Q(expires_at__gte=timezone.now())
                )
            
            # Check if the FILTERED list is empty
            if announcements.exists():
                serializer = AnnouncementSerializers(announcements, many = True)
                return Response({'success' : True,'status_code' : 200,'data' : serializer.data}, status = status.HTTP_200_OK)
            else:
                return Response({'success' : False,'status_code' : 404,'message' : 'No announcements found'}, status = status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success' : False,'status_code' : 500,'message' : str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateAnnouncement(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        try:
            serializer = CreateAnnouncementSerializer(data = request.data)
            if serializer.is_valid():
                serializer.save(date=timezone.now().date())
                return Response({'success' : True,'status_code' : 201,'data' : serializer.data}, status = status.HTTP_201_CREATED)
            return Response({'success' : False,'status_code' : 400,'message' : 'Invalid data','errors' : serializer.errors}, status = status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'success' : False,
                'status_code' : 500,
                'message' : str(e)
            }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class AnnouncementUpdate(APIView):
    permission_classes = [IsAdminUser]
    def patch(self, request, id):
        try:
            announcements = Announcements.objects.filter(id = id).first()
            if not announcements:
                return Response({
                    'success' : False,
                    'status_code' : 404,
                    'message' : 'Announcement not found'
                }, status = status.HTTP_404_NOT_FOUND)
            serializer = CreateAnnouncementSerializer(announcements, data = request.data, partial = True)
            if serializer.is_valid():
                serializer.save()
                return Response({'success' : True,'status_code' : 200, 'data' : serializer.data}, status = status.HTTP_200_OK)
            return Response({ 'success' : False,'status_code' : 400,'message' : 'Invalid data','errors' : serializer.errors}, status = status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'success' : False,'status_code' : 500,'message' : str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, id):
        try: 
            announcement = Announcements.objects.filter(id = id).first()
            if not announcement:
                return Response({'success' : False,'status_code' : 404,'message' : 'Announcement not found'}, status = status.HTTP_404_NOT_FOUND)
            announcement.delete()
            return Response({'success' : True,'status_code' : 200,'message' : 'Announcement deleted successfully'}, status = status.HTTP_200_OK)
        except Exception as e:
            return Response({'success' : False,'status_code' : 500,'message' : str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
 

class AnnouncementDetail(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        try: 
            if request.user.is_staff or request.user.groups.filter(name__iexact='admin').exists():
                announcement = Announcements.objects.filter(id = id).first()
            else:
                announcement = Announcements.objects.filter(
                    id=id,
                    publish_at__lte=timezone.now()
                ).filter(
                    Q(expires_at__isnull=True) | Q(expires_at__gte=timezone.now())
                ).first()
                
            if not announcement:
                return Response({'success' : False,'status_code' : 404,'message' : 'Announcement not found'}, status = status.HTTP_404_NOT_FOUND)
            serializer = AnnouncementDetailSerializer(announcement)
            return Response({'success' : True,'status_code' : 200,'data' : serializer.data}, status = status.HTTP_200_OK)
        except Exception as e:
            return Response({'success' : False,'status_code' : 500,'message' : str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)