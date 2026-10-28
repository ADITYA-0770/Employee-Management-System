from enum import unique
from django.db import models

class Announcements(models.Model):
    title = models.CharField(unique=True, max_length=100)
    description = models.TextField()
    date = models.DateField()
    STATUS_CHOICES = [ ("draft", "Draft"), ("published", "Published"), ("expired", "Expired")]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    publish_at = models.DateTimeField()
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

