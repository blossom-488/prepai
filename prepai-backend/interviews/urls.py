from django.urls import path
from .views import (
    questions,
    upload_audio,
    interview_reports,
    dashboard_stats,
    test_gemini,
)

urlpatterns = [
    path("questions/", questions),
    path("upload-audio/", upload_audio),
    path("reports/", interview_reports),
    path("dashboard/", dashboard_stats),
    path("test-gemini/", test_gemini),
]