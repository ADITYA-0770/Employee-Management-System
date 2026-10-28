from django.urls import path
from .views import LeaveApplyView, MyLeavesView, MyLeavesListView, AdminLeaveListView, AdminLeaveView

urlpatterns = [
    path('apply/',LeaveApplyView.as_view(), name='apply_leave'),
    path('',MyLeavesListView.as_view(), name='my_leaves_list'),
    path('<int:id>/',MyLeavesView.as_view(), name='my_leaves_by_id'),

    #Admin
    path('admin/',AdminLeaveListView.as_view(), name='admin_leaves_list'),
    path('admin/<int:id>/',AdminLeaveView.as_view(), name='admin_leaves_by_id'),
]
