from django.utils import timezone
from rest_framework import serializers
from .models import Announcements

class AnnouncementSerializers(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Announcements
        fields = ['id', 'title', 'description', 'date', 'publish_at', 'expires_at', 'status']
        read_only_fields = ['status']
        
    def get_status(self, obj):
        if obj.status == "draft":
            return "draft"
        now = timezone.now()
        if obj.publish_at > now:
            return "draft"
        elif obj.expires_at and obj.expires_at < now:
            return "expired"
        else:
            return obj.status or "published"
    


class CreateAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcements
        fields = ['title', 'description', 'publish_at', 'expires_at', 'status']

    def validate(self, attrs):
        publish_Date = attrs.get('publish_at')
        expires_at = attrs.get('expires_at')
        if publish_Date and expires_at and publish_Date >= expires_at:
            raise serializers.ValidationError("Publish date cannot be greater than or equal to expires date")
        return attrs

class AnnouncementDetailSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Announcements
        fields = ['id', 'title', 'description', 'publish_at', 'expires_at', 'status']
        
    def get_status(self, obj):
        if obj.status == "draft":
            return "draft"
        now = timezone.now()
        if obj.publish_at > now:
            return "draft"
        elif obj.expires_at and obj.expires_at < now:
            return "expired"
        else:
            return obj.status or "published"