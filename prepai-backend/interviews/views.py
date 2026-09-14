import os
import json

from collections import defaultdict

from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .gemini_service import (
    evaluate_answer,
    evaluate_code_image,
)
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
# Round 2 Questions
# ==========================

JAVA_ROUND_2 = [
    "Explain method overloading and method overriding with examples.",
    "What is the difference between an interface and an abstract class?",
    "Explain Java Collections and the difference between ArrayList and LinkedList.",
    "What is multithreading in Java and how does synchronization work?",
    "Explain the difference between == and equals() in Java."
]

PYTHON_ROUND_2 = [
    "Explain the difference between shallow copy and deep copy in Python.",
    "What are decorators and generators in Python?",
    "Explain Python exception handling and custom exceptions.",
    "What is the Global Interpreter Lock (GIL)?",
    "Explain list comprehension and when you would use it."
]

SQL_ROUND_2 = [
    "Explain INNER JOIN, LEFT JOIN and FULL OUTER JOIN with examples.",
    "What are indexes and how do they improve query performance?",
    "Explain subqueries and correlated subqueries.",
    "What are transactions and ACID properties?",
    "How would you optimize a slow SQL query?"
]

JAVASCRIPT_ROUND_2 = [
    "Explain event bubbling and event capturing.",
    "What is the JavaScript event loop?",
    "Explain promises, async and await.",
    "What is hoisting in JavaScript?",
    "Explain closures with a practical example."
]

REACT_ROUND_2 = [
    "Explain the React component lifecycle.",
    "What is the difference between controlled and uncontrolled components?",
    "Explain React Context and when you would use it.",
    "What is React.memo and when is it useful?",
    "Explain how React reconciliation works."
]

HR_ROUND_2 = [
    "Describe a difficult situation you faced and how you handled it.",
    "Tell me about a time you worked successfully in a team.",
    "How do you handle criticism or negative feedback?",
    "Tell me about a mistake you made and what you learned from it.",
    "How would you handle a conflict with a teammate?"
]


# ==========================
# Coding Questions - Round 3
# ==========================

CODING_QUESTIONS = {
    "Java": [
        "Write a Java program to check whether a given number is prime.",
        "Write a Java program to find the largest element in an integer array.",
        "Write a Java program to reverse a string without using a built-in reverse function."
    ],

    "Python": [
        "Write a Python program to check whether a given number is prime.",
        "Write a Python program to find the largest element in a list.",
        "Write a Python program to reverse a string without using slicing."
    ],

    "SQL": [
        "Write an SQL query to find the second-highest salary from an Employee table.",
        "Write an SQL query to find employees whose salary is greater than the average salary.",
        "Write an SQL query to find the number of employees in each department."
    ],

    "JavaScript": [
        "Write a JavaScript function to check whether a number is prime.",
        "Write a JavaScript function to find the largest number in an array.",
        "Write a JavaScript function to reverse a string."
    ],

    "React": [
        "Write a React component that displays a list of users.",
        "Write a React component with a counter using useState.",
        "Write a React component that fetches and displays data using useEffect."
    ],

    "HR": [
        "Write pseudocode for handling a customer complaint from start to resolution.",
        "Write pseudocode for organizing tasks according to priority.",
        "Write pseudocode for checking whether a candidate meets basic job requirements."
    ]
}


# ==========================
# Get Interview Questions
# ==========================

@api_view(["GET"])
def questions(request):

    domain = request.GET.get("domain")

    try:
        round_number = int(
            request.GET.get("round", 1)
        )
    except (TypeError, ValueError):
        round_number = 1

    if round_number == 1:

        question_sets = {
            "Java": JAVA_QUESTIONS,
            "Python": PYTHON_QUESTIONS,
            "SQL": SQL_QUESTIONS,
            "JavaScript": JAVASCRIPT_QUESTIONS,
            "React": REACT_QUESTIONS,
            "HR": HR_QUESTIONS,
        }

    elif round_number == 2:

        question_sets = {
            "Java": JAVA_ROUND_2,
            "Python": PYTHON_ROUND_2,
            "SQL": SQL_ROUND_2,
            "JavaScript": JAVASCRIPT_ROUND_2,
            "React": REACT_ROUND_2,
            "HR": HR_ROUND_2,
        }

    else:
        return Response([])

    return Response(
        question_sets.get(domain, [])
    )


# ==========================
# Check Round Status
# ==========================

@api_view(["GET"])
def round_status(request):

    session_id = request.GET.get("session_id")

    if not session_id:
        return Response({
            "round_1": {
                "score": 0,
                "passed": False
            },
            "round_2": {
                "score": 0,
                "passed": False
            },
            "round_3": {
                "unlocked": False
            }
        })

    PASSING_SCORE = 60

    results = InterviewResult.objects.filter(
        session_id=session_id
    )

    round_1_results = results.filter(
        round_number=1
    )

    round_2_results = results.filter(
        round_number=2
    )

    round_1_score = 0
    round_2_score = 0

    if round_1_results.exists():

        round_1_score = round(
            sum(
                result.overall_score
                for result in round_1_results
            )
            /
            round_1_results.count()
        )

    if round_2_results.exists():

        round_2_score = round(
            sum(
                result.overall_score
                for result in round_2_results
            )
            /
            round_2_results.count()
        )

    round_1_passed = (
        round_1_results.count() >= 5
        and round_1_score >= PASSING_SCORE
    )

    round_2_passed = (
        round_2_results.count() >= 5
        and round_2_score >= PASSING_SCORE
    )

    return Response({

        "round_1": {
            "score": round_1_score,
            "passed": round_1_passed
        },

        "round_2": {
            "score": round_2_score,
            "passed": round_2_passed,
            "unlocked": round_1_passed
        },

        "round_3": {
            "unlocked": round_2_passed
        }
    })


# ==========================
# Upload Audio + Whisper + Gemini
# ==========================

@api_view(["POST"])
def upload_audio(request):

    audio = request.FILES.get("audio")

    if not audio:

        return Response(
            {
                "message": "No audio file received"
            },
            status=400
        )

    question = request.POST.get(
        "question"
    )

    domain = request.POST.get(
        "domain"
    )

    session_id = request.POST.get(
        "session_id"
    )

    try:

        round_number = int(
            request.POST.get(
                "round",
                1
            )
        )

    except (TypeError, ValueError):

        round_number = 1

    # ==========================
    # Only Round 1 / Round 2
    # ==========================

    if round_number not in [1, 2]:

        return Response(
            {
                "message":
                    "Audio is only supported for Round 1 and Round 2."
            },
            status=400
        )

    # ==========================
    # Check Round Access
    # ==========================

    PASSING_SCORE = 60

    if round_number == 2:

        round_1_results = InterviewResult.objects.filter(
            session_id=session_id,
            round_number=1
        )

        if round_1_results.count() < 5:

            return Response(
                {
                    "message":
                        "Round 1 must be completed before Round 2."
                },
                status=403
            )

        round_1_score = round(

            sum(
                result.overall_score
                for result in round_1_results
            )
            /
            round_1_results.count()
        )

        if round_1_score < PASSING_SCORE:

            return Response(
                {
                    "message":
                        "Round 1 was not cleared.",
                    "score":
                        round_1_score
                },
                status=403
            )

    # ==========================
    # Create Upload Folder
    # ==========================

    upload_dir = os.path.join(
        settings.BASE_DIR,
        "uploads"
    )

    os.makedirs(
        upload_dir,
        exist_ok=True
    )

    # ==========================
    # Save Audio
    # ==========================

    file_path = os.path.join(
        upload_dir,
        audio.name
    )

    with open(
        file_path,
        "wb+"
    ) as destination:

        for chunk in audio.chunks():

            destination.write(chunk)

    # ==========================
    # Speech → Text
    # ==========================

    print(
        "\n=============================="
    )

    print(
        "STEP 1 : Starting Whisper"
    )

    print(
        "=============================="
    )

    transcript = transcribe_audio(
        file_path
    )

    print(
        "\n=============================="
    )

    print(
        "STEP 2 : Whisper Finished"
    )

    print(
        "=============================="
    )

    print(
        "Transcript:",
        transcript
    )

    # ==========================
    # Gemini Evaluation
    # ==========================

    print(
        "\n=============================="
    )

    print(
        "STEP 3 : Starting Gemini"
    )

    print(
        "=============================="
    )

    gemini_result = evaluate_answer(
        question,
        transcript
    )

    print(
        "\n=============================="
    )

    print(
        "STEP 4 : Gemini Finished"
    )

    print(
        "=============================="
    )

    try:

        result = json.loads(
            gemini_result
        )

    except json.JSONDecodeError:

        return Response(
            {
                "message":
                    "Gemini returned an invalid evaluation."
            },
            status=500
        )

    # ==========================
    # Save Result
    # ==========================

    InterviewResult.objects.create(

        session_id=session_id,

        domain=domain,

        round_number=round_number,

        question=question,

        transcript=transcript,

        technical_score=result[
            "technical_score"
        ],

        communication=result[
            "communication"
        ],

        confidence=result[
            "confidence"
        ],

        overall_score=result[
            "overall_score"
        ],

        feedback=result[
            "feedback"
        ],
    )

    print(
        "\n=============================="
    )

    print(
        "STEP 5 : Saved Successfully"
    )

    print(
        "==============================\n"
    )

    # ==========================
    # Check Current Round
    # ==========================

    round_results = InterviewResult.objects.filter(
        session_id=session_id,
        round_number=round_number
    )

    round_score = round(

        sum(
            result.overall_score
            for result in round_results
        )
        /
        round_results.count()
    )

    round_completed = (
        round_results.count() >= 5
    )

    round_passed = (
        round_completed
        and round_score >= PASSING_SCORE
    )

    return Response({

        "message":
            "Audio uploaded successfully!",

        "filename":
            audio.name,

        "transcript":
            transcript,

        "evaluation":
            gemini_result,

        "round_number":
            round_number,

        "round_score":
            round_score,

        "round_completed":
            round_completed,

        "round_passed":
            round_passed,

        "next_round_unlocked":
            (
                round_passed
                and round_number < 3
            )
    })


# ==========================
# Coding Questions
# ==========================

@api_view(["GET"])
def coding_questions(request):

    domain = request.GET.get(
        "domain"
    )

    session_id = request.GET.get(
        "session_id"
    )

    if not session_id:

        return Response(
            {
                "message":
                    "Session ID is required."
            },
            status=400
        )

    # ==========================
    # Verify Round 2
    # ==========================

    round_2_results = InterviewResult.objects.filter(
        session_id=session_id,
        round_number=2
    )

    if round_2_results.count() < 5:

        return Response(
            {
                "message":
                    "Round 2 must be completed before Round 3."
            },
            status=403
        )

    round_2_score = round(

        sum(
            result.overall_score
            for result in round_2_results
        )
        /
        round_2_results.count()
    )

    if round_2_score < 60:

        return Response(
            {
                "message":
                    "Round 2 was not cleared.",
                "score":
                    round_2_score
            },
            status=403
        )

    return Response(
        CODING_QUESTIONS.get(
            domain,
            []
        )
    )


# ==========================
# Upload Code Image
# ==========================

@api_view(["POST"])
def upload_code(request):

    code_image = request.FILES.get(
        "code_image"
    )

    if not code_image:

        return Response(
            {
                "message":
                    "No code image received."
            },
            status=400
        )

    question = request.POST.get(
        "question"
    )

    domain = request.POST.get(
        "domain"
    )

    session_id = request.POST.get(
        "session_id"
    )

    if not question or not domain or not session_id:

        return Response(
            {
                "message":
                    "Question, domain and session ID are required."
            },
            status=400
        )

    # ==========================
    # Verify Round 2
    # ==========================

    round_2_results = InterviewResult.objects.filter(
        session_id=session_id,
        round_number=2
    )

    if round_2_results.count() < 5:

        return Response(
            {
                "message":
                    "Round 2 must be completed before Round 3."
            },
            status=403
        )

    round_2_score = round(

        sum(
            result.overall_score
            for result in round_2_results
        )
        /
        round_2_results.count()
    )

    if round_2_score < 60:

        return Response(
            {
                "message":
                    "Round 2 was not cleared.",
                "score":
                    round_2_score
            },
            status=403
        )

    # ==========================
    # Validate Image
    # ==========================

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    if code_image.content_type not in allowed_types:

        return Response(
            {
                "message":
                    "Please upload a JPG, PNG or WEBP image."
            },
            status=400
        )

    # ==========================
    # Read Image
    # ==========================

    try:

        image_bytes = code_image.read()

        if not image_bytes:

            return Response(
                {
                    "message":
                        "The uploaded image is empty."
                },
                status=400
            )

        # ==========================
        # Gemini Code Evaluation
        # ==========================

        gemini_result = evaluate_code_image(

            question,

            image_bytes,

            code_image.content_type
        )

        result = json.loads(
            gemini_result
        )

    except json.JSONDecodeError:

        return Response(
            {
                "message":
                    "Gemini returned an invalid code evaluation."
            },
            status=500
        )

    except Exception as e:

        print(
            "Code upload error:",
            str(e)
        )

        return Response(
            {
                "message":
                    "Unable to evaluate the submitted code."
            },
            status=500
        )

    # ==========================
    # Save Coding Result
    # ==========================

    InterviewResult.objects.create(

        session_id=session_id,

        domain=domain,

        round_number=3,

        question=question,

        transcript="Code submitted as an image.",

        technical_score=result[
            "correctness_score"
        ],

        communication=result[
            "code_quality_score"
        ],

        confidence=result[
            "logic_score"
        ],

        overall_score=result[
            "overall_score"
        ],

        feedback=result[
            "feedback"
        ],
    )

    # ==========================
    # Coding Round Progress
    # ==========================

    round_3_results = InterviewResult.objects.filter(
        session_id=session_id,
        round_number=3
    )

    coding_score = round(

        sum(
            result.overall_score
            for result in round_3_results
        )
        /
        round_3_results.count()
    )

    coding_completed = (
        round_3_results.count() >= 3
    )

    return Response({

        "message":
            "Code submitted successfully.",

        "evaluation":
            gemini_result,

        "round_number":
            3,

        "coding_score":
            coding_score,

        "coding_completed":
            coding_completed,

        "questions_completed":
            round_3_results.count()
    })


# ==========================
# Get Interview Reports
# ==========================

@api_view(["GET"])
def interview_reports(request):

    reports = InterviewResult.objects.all().order_by(
        "-created_at"
    )

    data = []

    for report in reports:

        data.append({

            "id":
                report.id,

            "domain":
                report.domain,

            "round_number":
                report.round_number,

            "question":
                report.question,

            "technical_score":
                report.technical_score,

            "communication":
                report.communication,

            "confidence":
                report.confidence,

            "overall_score":
                report.overall_score,

            "feedback":
                report.feedback,

            "date":
                report.created_at.strftime(
                    "%d %b %Y %I:%M %p"
                ),
        })

    return Response(data)


# ==========================
# Dashboard Statistics
# ==========================

@api_view(["GET"])
def dashboard_stats(request):

    reports = InterviewResult.objects.all()

    if not reports.exists():

        return Response({

            "total_interviews":
                0,

            "average_score":
                0,

            "highest_score":
                0,

            "best_domain":
                "N/A"
        })

    sessions = defaultdict(list)

    for report in reports:

        sessions[
            report.session_id
        ].append(report)

    total_interviews = len(
        sessions
    )

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

        interview_scores.append(
            avg_score
        )

        domain = session_reports[0].domain

        domain_scores[
            domain
        ].append(
            avg_score
        )

    average_score = round(

        sum(interview_scores)
        /
        len(interview_scores)
    )

    highest_score = max(
        interview_scores
    )

    best_domain = max(

        domain_scores,

        key=lambda d:
        sum(domain_scores[d])
        /
        len(domain_scores[d])
    )

    return Response({

        "total_interviews":
            total_interviews,

        "average_score":
            average_score,

        "highest_score":
            highest_score,

        "best_domain":
            best_domain,
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

        "gemini_response":
            result
    })