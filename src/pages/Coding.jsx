import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Coding() {
  const location = useLocation();
  const navigate = useNavigate();

  const domain = location.state?.domain || "Java";
  const sessionId = location.state?.sessionId;

  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [evaluations, setEvaluations] = useState([]);

  // Keeps the latest evaluations available
  // so the final question is not lost during navigation.
  const evaluationsRef = useRef([]);

  // ===========================
  // Fetch Coding Questions
  // ===========================

  useEffect(() => {
    const fetchCodingQuestions = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/coding-questions/?domain=${domain}&session_id=${sessionId}`
        );

        if (!response.ok) {
          const errorText = await response.text();

          console.error(
            "Coding questions error:",
            response.status,
            errorText
          );

          let message = "Unable to load coding questions.";

          try {
            const errorData = JSON.parse(errorText);

            if (errorData.message) {
              message = errorData.message;
            }
          } catch (error) {
            // Ignore invalid JSON
          }

          throw new Error(message);
        }

        const data = await response.json();

        setQuestions(data);
      } catch (error) {
        console.error(
          "Fetch coding questions error:",
          error
        );

        Swal.fire({
          icon: "error",
          title: "Round 3 Locked",
          text:
            error.message ||
            "Unable to load the coding round.",
          background: "#111827",
          color: "#ffffff",
          confirmButtonColor: "#ef4444",
        }).then(() => {
          navigate("/reports");
        });
      }
    };

    if (sessionId) {
      fetchCodingQuestions();
    } else {
      Swal.fire({
        icon: "error",
        title: "Session Not Found",
        text:
          "Your interview session could not be found.",
        background: "#111827",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      }).then(() => {
        navigate("/domain");
      });
    }
  }, [domain, sessionId, navigate]);

  // ===========================
  // File Selection
  // ===========================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Image",
        text:
          "Please upload a JPG, PNG, or WEBP image.",
        background: "#111827",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
      });

      event.target.value = "";
      return;
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Image Too Large",
        text:
          "Please upload an image smaller than 10 MB.",
        background: "#111827",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
      });

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setSubmitted(false);

    // Release previous preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);
  };

  // ===========================
  // Upload Code
  // ===========================

  const handleUpload = async () => {
    if (!selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "Code Image Required",
        text:
          "Please upload a photo or screenshot of your code.",
        background: "#111827",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
      });

      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "code_image",
        selectedFile
      );

      formData.append(
        "question",
        currentQuestion
      );

      formData.append(
        "domain",
        domain
      );

      formData.append(
        "session_id",
        sessionId
      );

      // Send the code image to the upload-code endpoint
      const response = await fetch(
        "http://127.0.0.1:8000/api/upload-code/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Code upload error:",
          response.status,
          errorText
        );

        let message =
          "Unable to evaluate your code.";

        try {
          const errorData = JSON.parse(errorText);

          if (errorData.message) {
            message = errorData.message;
          }
        } catch (error) {
          // Ignore invalid JSON
        }

        throw new Error(message);
      }

      const data = await response.json();

      // ===========================
      // IMPORTANT:
      // Keep the latest evaluation in a ref
      // so the third result is not lost.
      // ===========================

      const updatedEvaluations = [
        ...evaluationsRef.current,
        data,
      ];

      evaluationsRef.current =
        updatedEvaluations;

      setEvaluations(updatedEvaluations);

      setSubmitted(true);

      Swal.fire({
        icon: "success",
        title: "Code Evaluated 🎉",
        text:
          "AI has evaluated your submitted code.",
        timer: 1500,
        showConfirmButton: false,
        background: "#111827",
        color: "#ffffff",
      });
    } catch (error) {
      console.error(
        "Code evaluation error:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Evaluation Failed",
        text:
          error.message ||
          "Unable to evaluate your code.",
        background: "#111827",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // Next Coding Question
  // ===========================

  const nextQuestion = () => {
    if (!submitted) {
      Swal.fire({
        icon: "warning",
        title: "Submit Your Code",
        text:
          "Please upload your code before moving to the next question.",
        background: "#111827",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
      });

      return;
    }

    if (
      questionIndex <
      questions.length - 1
    ) {
      setQuestionIndex(
        (prev) => prev + 1
      );

      setSelectedFile(null);
      setPreview(null);
      setSubmitted(false);
    } else {
      // Finish Coding Round
      navigate("/coding-evaluation", {
        state: {
          evaluations:
            evaluationsRef.current,
          domain,
          sessionId,
        },
      });
    }
  };

  // ===========================
  // Current Question
  // ===========================

  const currentQuestion =
    questions[questionIndex] ||
    "Loading coding question...";

  // ===========================
  // UI
  // ===========================

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "50px auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1>
        Round 3 – Coding Challenge 💻
      </h1>

      <p>
        <strong>Domain:</strong>{" "}
        {domain}
      </p>

      <div
        style={{
          marginTop: "30px",
          padding: "25px",
          border: "1px solid #ccc",
          borderRadius: "12px",
        }}
      >
        <h2>
          Question {questionIndex + 1} of{" "}
          {questions.length}
        </h2>

        <p
          style={{
            fontSize: "18px",
            lineHeight: "1.6",
          }}
        >
          {currentQuestion}
        </p>
      </div>

      <div
        style={{
          marginTop: "30px",
        }}
      >
        <h3>
          📷 Upload a photo or screenshot of your code
        </h3>

        <p>
          You can upload handwritten code,
          a screenshot, or a clear photo.
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={
            loading || submitted
          }
        />
      </div>

      {preview && (
        <div
          style={{
            marginTop: "25px",
          }}
        >
          <h3>Code Preview</h3>

          <img
            src={preview}
            alt="Code preview"
            style={{
              maxWidth: "100%",
              maxHeight: "500px",
              border: "1px solid #ccc",
              borderRadius: "10px",
            }}
          />
        </div>
      )}

      {loading && (
        <h3
          style={{
            marginTop: "25px",
            color: "#f59e0b",
          }}
        >
          🤖 AI is analyzing your code...
        </h3>
      )}

      {submitted && !loading && (
        <h3
          style={{
            marginTop: "25px",
            color: "#22c55e",
          }}
        >
          ✅ Code Evaluated Successfully
        </h3>
      )}

      <div
        style={{
          marginTop: "30px",
        }}
      >
        <button
          onClick={handleUpload}
          disabled={
            !selectedFile ||
            loading ||
            submitted
          }
          style={{
            padding: "12px 25px",
            marginRight: "10px",
            cursor:
              !selectedFile ||
              loading ||
              submitted
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading
            ? "Evaluating..."
            : "Upload & Evaluate"}
        </button>

        <button
          onClick={nextQuestion}
          disabled={
            !submitted ||
            loading
          }
          style={{
            padding: "12px 25px",
            cursor:
              !submitted ||
              loading
                ? "not-allowed"
                : "pointer",
          }}
        >
          {questionIndex <
          questions.length - 1
            ? "Next Coding Question"
            : "Finish Coding Round"}
        </button>
      </div>

      <div
        style={{
          marginTop: "35px",
        }}
      >
        <p>
          Coding Round Progress
        </p>

        <progress
          value={questionIndex + 1}
          max={
            questions.length || 1
          }
        />

        <p>
          {questions.length > 0
            ? Math.round(
                ((questionIndex + 1) /
                  questions.length) *
                  100
              )
            : 0}
          %
        </p>
      </div>
    </div>
  );
}

export default Coding;
