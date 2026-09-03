import os
import json

from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .gemini_service import evaluate_answer
from .speech_to_text import transcribe_audio
from .speaker_detection import detect_multiple_speakers
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
# Upload Audio + Voice Check
# + Whisper + Gemini
# ==========================

@api_view(["POST"])
def upload_audio(request):

    audio = request.FILES.get("audio")

    if not audio:
        return Response(
            {"message": "No audio file received"},
            status=400
        )

    # ==========================
    # Get data from React
    # ==========================

    question = request.POST.get("question")
    domain = request.POST.get("domain")
    session_id = request.POST.get("session_id")

    # ==========================
    # Create uploads folder
    # ==========================

    upload_dir = os.path.join(settings.BASE_DIR, "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    # ==========================
    # Save audio
    # ==========================

    file_path = os.path.join(upload_dir, audio.name)

    with open(file_path, "wb+") as destination:
        for chunk in audio.chunks():
            destination.write(chunk)

    # ==========================
    # STEP 1
    # Check for Multiple Voices
    # ==========================

    print("\n==============================")
    print("STEP 1 : Checking for Multiple Voices")
    print("==============================")

    try:
        multiple_speakers = detect_multiple_speakers(file_path)

    except Exception as e:
        print("Speaker detection error:", str(e))

        return Response(
            {
                "error": "VOICE_DETECTION_ERROR",
                "message": "Unable to verify the number of speakers. Please try recording again."
            },
            status=500
        )

    # ==========================
    # Multiple Voices Detected
    # ==========================

    if multiple_speakers:

        print("❌ Multiple voices detected!")

        return Response(
            {
                "error": "MULTIPLE_VOICES_DETECTED",
                "message": (
                    "Multiple voices detected. "
                    "Only one person is allowed to speak at a time. "
                    "Please try recording again."
                )
            },
            status=400
        )

    print("✅ Single speaker detected.")

    # ==========================
    # STEP 2
    # Speech → Text
    # ==========================

    print("\n==============================")
    print("STEP 2 : Starting Whisper")
    print("==============================")

    transcript = transcribe_audio(file_path)

    print("\n==============================")
    print("STEP 3 : Whisper Finished")
    print("==============================")

    print("Transcript:", transcript)

    # ==========================
    # STEP 3
    # Gemini Evaluation
    # ==========================

    print("\n==============================")
    print("STEP 4 : Starting Gemini")
    print("==============================")

    gemini_result = evaluate_answer(
        question,
        transcript
    )

    print("\n==============================")
    print("STEP 5 : Gemini Finished")
    print("==============================")

    # ==========================
    # Convert JSON string
    # → Dictionary
    # ==========================

    try:
        result = json.loads(gemini_result)

    except json.JSONDecodeError:

        print("❌ Gemini returned invalid JSON")

        return Response(
            {
                "error": "GEMINI_RESPONSE_ERROR",
                "message": "Unable to process the interview evaluation."
            },
            status=500
        )

    # ==========================
    # STEP 4
    # Save Interview Result
    # ==========================

    print("\n==============================")
    print("STEP 6 : Saving Result")
    print("==============================")

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
    print("STEP 7 : Saved Successfully")
    print("==============================\n")

    # ==========================
    # Return Response
    # ==========================

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
            "date": report.created_at.strftime(
                "%d %b %Y %I:%M %p"
            ),
        })

    return Response(data)


# ==========================
# Dashboard Statistics
# ==========================

from collections import defaultdict


@api_view(["GET"])
def dashboard_stats(request):

    reports = InterviewResult.objects.all()

    # ==========================
    # No interviews yet
    # ==========================

    if not reports.exists():

        return Response({
            "total_interviews": 0,
            "average_score": 0,
            "highest_score": 0,
            "best_domain": "N/A"
        })

    # ==========================
    # Group questions by
    # interview session
    # ==========================

    sessions = defaultdict(list)

    for report in reports:
        sessions[report.session_id].append(report)

    total_interviews = len(sessions)

    interview_scores = []

    domain_scores = defaultdict(list)

    for session_reports in sessions.values():

        avg_score = round(
            sum(
                r.overall_score
                for r in session_reports
            )
            /
            len(session_reports)
        )

        interview_scores.append(avg_score)

        domain = session_reports[0].domain

        domain_scores[domain].append(avg_score)

    # ==========================
    # Dashboard calculations
    # ==========================

    average_score = round(
        sum(interview_scores)
        /
        len(interview_scores)
    )

    highest_score = max(interview_scores)

    best_domain = max(
        domain_scores,
        key=lambda d:
            sum(domain_scores[d])
            /
            len(domain_scores[d])
    )

    # ==========================
    # Return Dashboard Data
    # ==========================

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

    result = evaluate_answer(
        question,
        answer
    )

    return Response({
        "gemini_response": result
    })
