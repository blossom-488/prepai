import os
import json
from google import genai


# ===========================
# Gemini Client
# ===========================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# ===========================
# Evaluate Interview Answer
# ===========================

def evaluate_answer(question, answer):

    prompt = f"""
You are an AI technical interviewer.

Question:
{question}

Candidate Answer:
{answer}

Evaluate the candidate's answer.

Return ONLY valid JSON.
Do not use markdown.
Do not use ```json.
Do not add any text before or after the JSON.

The JSON must have exactly this structure:

{{
    "technical_score": 0,
    "communication": 0,
    "confidence": 0,
    "overall_score": 0,
    "feedback": "Short feedback"
}}

Rules:
- technical_score must be a number from 0 to 100
- communication must be a number from 0 to 100
- confidence must be a number from 0 to 100
- overall_score must be a number from 0 to 100
- feedback must be a short string
"""

    try:

        print("STEP 3: Starting Gemini")

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        print("STEP 4: Gemini response received")

        # Safely get Gemini response
        result = (response.text or "").strip()

        print("Gemini raw response:", result)

        # Check for empty response
        if not result:
            raise ValueError("Gemini returned an empty response.")

        # Remove markdown code fences if Gemini adds them
        if result.startswith("```"):
            result = result.replace("```json", "")
            result = result.replace("```", "")
            result = result.strip()

        # Validate JSON before returning
        json.loads(result)

        print("Gemini returned valid JSON")

        return result

    except Exception as e:

        print("Gemini evaluation error:", str(e))

        # Always return valid JSON
        # so views.py does not crash at json.loads()
        fallback_result = {
            "technical_score": 0,
            "communication": 0,
            "confidence": 0,
            "overall_score": 0,
            "feedback": "Unable to evaluate the answer at this time."
        }

        return json.dumps(fallback_result)
