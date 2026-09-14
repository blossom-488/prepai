from django.urls import path

from .views import (
    questions,
    upload_audio,
    upload_code,
    interview_reports,
    dashboard_stats,
    test_gemini,
    round_status,
    coding_questions,
)

urlpatterns = [
    path("questions/", questions),
    path("upload-audio/", upload_audio),
    path("upload-code/", upload_code),
    path("reports/", interview_reports),
    path("dashboard/", dashboard_stats),
    path("test-gemini/", test_gemini),
    path("round-status/", round_status),
    path("coding-questions/", coding_questions),
]