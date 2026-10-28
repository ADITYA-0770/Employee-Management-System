from django.urls import path
from .views import CheckInView, CheckOutView, AttendanceHistoryView, TodayAttendanceView, AdminAttendanceListView, AdminAttendanceDetailView, AdminAttendanceCorrectionView, AdminAttendanceSessionCorrectionView

urlpatterns = [
    path('checkin/', CheckInView.as_view(), name = "check-in"),
    path('checkout/', CheckOutView.as_view(), name = "check-out"),
    path('history/', AttendanceHistoryView.as_view(), name = "attendance-history"),
    path('today/', TodayAttendanceView.as_view(), name = "today-attendance"),
    path('admin/all/', AdminAttendanceListView.as_view(), name = "admin-attendance"),
    path('admin/<int:pk>/', AdminAttendanceDetailView.as_view(), name = "admin-attendance-detail"),
    path('admin/<int:pk>/correction/', AdminAttendanceCorrectionView.as_view(), name = "admin-attendance-correction"),
    path('admin/session/<int:pk>/correction/', AdminAttendanceSessionCorrectionView.as_view(), name = "admin-session-correction"),
]
