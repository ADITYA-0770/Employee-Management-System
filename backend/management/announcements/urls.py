from django.urls import path
from .views import AnnouncementList, CreateAnnouncement, AnnouncementUpdate, AnnouncementDetail

urlpatterns = [
    path('', AnnouncementList.as_view()),
    path('create/', CreateAnnouncement.as_view()),
    path('<int:id>/', AnnouncementUpdate.as_view()),
    path('update/<int:id>/', AnnouncementUpdate.as_view()),
    path('detail/<int:id>/', AnnouncementDetail.as_view()),
]