from django.db import models


class InterviewResult(models.Model):

    # Groups all questions into one interview session
    session_id = models.CharField(max_length=100)

    # Selected interview domain
    domain = models.CharField(max_length=50)

    # Interview round
    # 1 = Screening Round
    # 2 = Advanced Technical Round
    # 3 = Coding Round
    round_number = models.IntegerField(default=1)

    question = models.TextField()

    transcript = models.TextField()

    technical_score = models.IntegerField()

    communication = models.IntegerField()

    confidence = models.IntegerField()

    overall_score = models.IntegerField()

    feedback = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"{self.session_id} | "
            f"Round {self.round_number} | "
            f"{self.domain} - "
            f"{self.created_at.strftime('%d-%m-%Y %H:%M')}"
        )