import os
import json

from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .gemini_service import evaluate_answer
from .speech_to_text import transcribe_audio
from .models import InterviewResult


# ==========================
# Interview Questions
# ==========================

JAVA_QUESTIONS = [
    "What is Java?",
    "Explain OOP concepts.",
    "What is JVM?",
    "Difference between JDK and JRE?",
    "Explain Exception Handling."
]

PYTHON_QUESTIONS = [
    "What is Python?",
    "What are Lists and Tuples?",
    "Explain Dictionaries.",
    "What is a Lambda Function?",
    "Explain Exception Handling."
]

SQL_QUESTIONS = [
    "What is SQL?",
    "Difference between WHERE and HAVING?",
    "Explain JOINs.",
    "What is a Primary Key?",
    "What is Normalization?"
]
JAVASCRIPT_QUESTIONS = [
    "What is JavaScript?",
    "Explain let, var and const.",
    "What are closures?",
    "What is the DOM?",
    "Explain promises."
]

REACT_QUESTIONS = [
    "What is React?",
    "What is JSX?",
    "Explain useState.",
    "Explain useEffect.",
    "What are props?"
]

HR_QUESTIONS = [
    "Tell me about yourself.",
    "Why should we hire you?",
    "What are your strengths?",
    "Where do you see yourself in five years?",
    "Why do you want this job?"
]


# ==========================
# Get Interview Questions
# ==========================


@api_view(["GET"])
def questions(request):

    domain = request.GET.get("domain")

    if domain == "Java":
        return Response(JAVA_QUESTIONS)

    elif domain == "Python":
        return Response(PYTHON_QUESTIONS)

    elif domain == "SQL":
        return Response(SQL_QUESTIONS)

    elif domain == "JavaScript":
        return Response(JAVASCRIPT_QUESTIONS)

    elif domain == "React":
        return Response(REACT_QUESTIONS)

    elif domain == "HR":
        return Response(HR_QUESTIONS)

    return Response([])

# ==========================
# Upload Audio + Whisper + Gemini
# ==========================

@api_view(["POST"])
def upload_audio(request):

    audio = request.FILES.get("audio")

    if not audio:
        return Response(
            {"message": "No audio file received"},
            status=400
        )

    # Get data from React
    question = request.POST.get("question")
    domain = request.POST.get("domain")
    session_id = request.POST.get("session_id")

    # Create uploads folder
    upload_dir = os.path.join(settings.BASE_DIR, "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    # Save audio
    file_path = os.path.join(upload_dir, audio.name)

    with open(file_path, "wb+") as destination:
        for chunk in audio.chunks():
            destination.write(chunk)

    # ==========================
    # DEBUGGING
    # ==========================

    print("\n==============================")
    print("STEP 1 : Starting Whisper")
    print("==============================")

    # Speech → Text
    transcript = transcribe_audio(file_path)

    print("\n==============================")
    print("STEP 2 : Whisper Finished")
    print("==============================")
    print("Transcript:", transcript)

    print("\n==============================")
    print("STEP 3 : Starting Gemini")
    print("==============================")

    # Gemini Evaluation
    gemini_result = evaluate_answer(question, transcript)

    print("\n==============================")
    print("STEP 4 : Gemini Finished")
    print("==============================")

    # Convert JSON string → Dictionary
    result = json.loads(gemini_result)

    print("\n==============================")
    print("STEP 5 : Saving Result")
    print("==============================")

    # Save Interview Result
    InterviewResult.objects.create(
    session_id=session_id,
    domain=domain,
    question=question,
    transcript=transcript,
    technical_score=result["technical_score"],
    communication=result["communication"],
    confidence=result["confidence"],
    overall_score=result["overall_score"],
    feedback=result["feedback"],
)
    print("\n==============================")
    print("STEP 6 : Saved Successfully")
    print("==============================\n")

    return Response({
        "message": "Audio uploaded successfully!",
        "filename": audio.name,
        "transcript": transcript,
        "evaluation": gemini_result
    })


# ==========================
# Get Interview Reports
# ==========================

@api_view(["GET"])
def interview_reports(request):

    reports = InterviewResult.objects.all().order_by("-created_at")

    data = []

    for report in reports:
        data.append({
            "id": report.id,
            "domain": report.domain,
            "question": report.question,
            "technical_score": report.technical_score,
            "communication": report.communication,
            "confidence": report.confidence,
            "overall_score": report.overall_score,
            "feedback": report.feedback,
            "date": report.created_at.strftime("%d %b %Y %I:%M %p"),
        })

    return Response(data)


# ==========================
# Dashboard Statistics
# ==========================

from collections import defaultdict


@api_view(["GET"])
def dashboard_stats(request):

    reports = InterviewResult.objects.all()

    # No interviews yet
    if not reports.exists():
        return Response({
            "total_interviews": 0,
            "average_score": 0,
            "highest_score": 0,
            "best_domain": "N/A"
        })

    # Group questions by interview session
    sessions = defaultdict(list)

    for report in reports:
        sessions[report.session_id].append(report)

    total_interviews = len(sessions)

    interview_scores = []
    domain_scores = defaultdict(list)

    for session_reports in sessions.values():

        avg_score = round(
            sum(r.overall_score for r in session_reports) /
            len(session_reports)
        )

        interview_scores.append(avg_score)

        domain = session_reports[0].domain
        domain_scores[domain].append(avg_score)

    average_score = round(sum(interview_scores) / len(interview_scores))

    highest_score = max(interview_scores)

    best_domain = max(
        domain_scores,
        key=lambda d: sum(domain_scores[d]) / len(domain_scores[d])
    )

    return Response({
        "total_interviews": total_interviews,
        "average_score": average_score,
        "highest_score": highest_score,
        "best_domain": best_domain,
    })
# ==========================
# Test Gemini
# ==========================

@api_view(["GET"])
def test_gemini(request):

    question = "What is Java?"

    answer = (
        "Java is an object-oriented programming language "
        "used to build web, desktop, and mobile applications."
    )

    result = evaluate_answer(question, answer)

    return Response({
        "gemini_response": result
    })