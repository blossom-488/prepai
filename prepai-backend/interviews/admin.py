from django.contrib import admin
from .models import InterviewResult


@admin.register(InterviewResult)
class InterviewResultAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "domain",
        "technical_score",
        "communication",
        "confidence",
        "overall_score",
        "created_at",
    )

    search_fields = ("domain", "question", "transcript")
    list_filter = ("domain", "created_at")