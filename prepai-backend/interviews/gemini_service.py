import os
import json
from google import genai
from google.genai import types


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

        result = (response.text or "").strip()

        print("Gemini raw response:", result)

        if not result:
            raise ValueError("Gemini returned an empty response.")

        if result.startswith("```"):
            result = result.replace("```json", "")
            result = result.replace("```", "")
            result = result.strip()

        json.loads(result)

        print("Gemini returned valid JSON")

        return result

    except Exception as e:

        print("Gemini evaluation error:", str(e))

        fallback_result = {
            "technical_score": 0,
            "communication": 0,
            "confidence": 0,
            "overall_score": 0,
            "feedback": "Unable to evaluate the answer at this time."
        }

        return json.dumps(fallback_result)


# ===========================
# Evaluate Code Image
# ===========================

def evaluate_code_image(question, image_bytes, mime_type):

    prompt = f"""
You are an expert technical interviewer evaluating a candidate's coding solution.

Coding Question:
{question}

The candidate has uploaded an image/photo/screenshot containing their code.

Carefully inspect the code in the image.

Evaluate the candidate's solution based on:

1. Correctness
2. Logic and approach
3. Code quality
4. Time and space complexity
5. Whether the solution actually solves the given problem

If the code is handwritten, read it carefully.

If the image is unclear or the code cannot be read reliably, mention that in the feedback and give an appropriate lower score.

Return ONLY valid JSON.
Do not use markdown.
Do not use ```json.
Do not add any text before or after the JSON.

The JSON must have exactly this structure:

{{
    "correctness_score": 0,
    "logic_score": 0,
    "code_quality_score": 0,
    "overall_score": 0,
    "feedback": "Short feedback about the submitted code"
}}

Rules:
- correctness_score must be a number from 0 to 100
- logic_score must be a number from 0 to 100
- code_quality_score must be a number from 0 to 100
- overall_score must be a number from 0 to 100
- feedback must be a short string
- Do not invent code that is not visible in the image
- Evaluate only what can reasonably be determined from the uploaded image
"""

    try:

        print("CODE STEP 1: Starting Gemini code-image evaluation")

        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type=mime_type
        )

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[
                prompt,
                image_part,
            ]
        )

        print("CODE STEP 2: Gemini code evaluation received")

        result = (response.text or "").strip()

        print("Gemini code evaluation:", result)

        if not result:
            raise ValueError(
                "Gemini returned an empty response for code evaluation."
            )

        if result.startswith("```"):
            result = result.replace("```json", "")
            result = result.replace("```", "")
            result = result.strip()

        json.loads(result)

        print("Gemini returned valid code evaluation JSON")

        return result

    except Exception as e:

        print(
            "Gemini code evaluation error:",
            str(e)
        )

        fallback_result = {
            "correctness_score": 0,
            "logic_score": 0,
            "code_quality_score": 0,
            "overall_score": 0,
            "feedback": "Unable to evaluate the submitted code at this time."
        }

        return json.dumps(fallback_result)