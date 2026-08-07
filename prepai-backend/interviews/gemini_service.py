import os
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def evaluate_answer(question, answer):
    prompt = f"""
You are an AI technical interviewer.

Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer and return ONLY valid JSON in this format:

{{
    "technical_score": 0-100,
    "communication": 0-100,
    "confidence": 0-100,
    "overall_score": 0-100,
    "feedback": "Short feedback"
}}
"""

    response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents=prompt,
)

    return response.text