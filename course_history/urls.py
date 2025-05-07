from django.urls import re_path
from course_history import views

urlpatterns = [
    re_path(r"^transcript/upload/$", views.TranscriptUploadView.as_view(), name="transcript_upload"),
]