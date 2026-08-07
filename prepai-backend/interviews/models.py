from django.db import models


class InterviewResult(models.Model):

    # Groups all 5 questions into one interview session
    session_id = models.CharField(max_length=100)

    domain = models.CharField(max_length=50)

    question = models.TextField()

    transcript = models.TextField()

    technical_score = models.IntegerField()

    communication = models.IntegerField()

    confidence = models.IntegerField()

    overall_score = models.IntegerField()

    feedback = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.session_id} | {self.domain} - {self.created_at.strftime('%d-%m-%Y %H:%M')}"