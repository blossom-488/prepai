import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "../styles/interview.css";
import { startRecording, stopRecording } from "../utils/recorder";

function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedDomain = location.state?.domain || "Java";
  const [sessionId] = useState(() => crypto.randomUUID());

  // ===========================
  // States
  // ===========================

  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [timeLeft, setTimeLeft] = useState(60);

  const [recording, setRecording] = useState(false);

  const [loading, setLoading] = useState(false);

  const [uploaded, setUploaded] = useState(false);

  const [evaluations, setEvaluations] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);

  // ===========================
  // Current Question
  // ===========================

  const currentQuestion =
    currentQuestions[questionIndex] || "Loading Question...";

  // ===========================
  // Fetch Questions
  // ===========================

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
       const response = await fetch(
  `https://genuine-courtesy-production-64fd.up.railway.app/api/questions/?domain=${selectedDomain}`
);

        const data = await response.json();

        setCurrentQuestions(data);
      } catch (error) {
        console.error(error);

        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Unable to fetch interview questions.",
          background: "#111827",
          color: "#ffffff",
          confirmButtonColor: "#ef4444",
        });
      }
    };

    fetchQuestions();
  }, [selectedDomain]);

  // ===========================
  // Timer
  // ===========================

  useEffect(() => {
  if (currentQuestions.length === 0) return;

  // Stop timer if recording is not running
  if (!timerRunning) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        setTimerRunning(false);
        return 0;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timerRunning, questionIndex, currentQuestions.length]);

  // ===========================
  // Start Recording
  // ===========================

  const handleStart = async () => {
    try {
      await startRecording();

      setRecording(true);
      setTimerRunning(true);

      Swal.fire({
        icon: "info",
        title: "Recording Started",
        text: "Start answering the question.",
        timer: 1200,
        showConfirmButton: false,
        background: "#111827",
        color: "#ffffff",
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Microphone Access Denied",
        text: "Please allow microphone permission.",
        background: "#111827",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // ===========================
  // Stop Recording
  // ===========================

  const handleStop = async () => {
    try {
      const audio = await stopRecording();

      setRecording(false);
      setTimerRunning(false);

      const formData = new FormData();

      formData.append("audio", audio, "recording.webm");
      formData.append("question", currentQuestion);
      formData.append("domain", selectedDomain);
      formData.append("session_id", sessionId);

      setLoading(true);

     const response = await fetch(
  "https://genuine-courtesy-production-64fd.up.railway.app/api/upload-audio/",
  {
    method: "POST",
    body: formData,
  }
);

      const data = await response.json();

      setLoading(false);

      setUploaded(true);

      setEvaluations((prev) => [...prev, data]);

      Swal.fire({
        icon: "success",
        title: "Evaluation Completed",
        text: "AI has evaluated your answer successfully.",
        timer: 1500,
        showConfirmButton: false,
        background: "#111827",
        color: "#ffffff",
      });
          } catch (error) {
      setLoading(false);

      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Unable to upload your answer. Please try again.",
        background: "#111827",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // ===========================
  // Next Question
  // ===========================

  const nextQuestion = () => {
    if (!uploaded) {
      Swal.fire({
        icon: "warning",
        title: "Answer Required",
        text: "Please record and submit your answer first.",
        background: "#111827",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
      });

      return;
    }

    if (questionIndex < currentQuestions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      setTimeLeft(60);
      setUploaded(false);
    } else {
      navigate("/evaluation", {
        state: {
          evaluations,
        },
      });
    }
  };

  // ===========================
  // UI
  // ===========================

  return (
    <div className="interview-page">
      <h1>PrepAI Interview</h1>

      <h2 className="timer">
        ⏰ Time Left : {timeLeft}s
      </h2>

      <p className="domain">
        <strong>Domain:</strong> {selectedDomain}
      </p>

      <div className="question-box">
        <h2>
          Question {questionIndex + 1} of {currentQuestions.length}
        </h2>

        <p>{currentQuestion}</p>
      </div>

      {loading && (
        <h3
          style={{
            color: "#f59e0b",
            marginTop: "20px",
          }}
        >
          🤖 AI is evaluating your answer...
        </h3>
      )}

      {!loading && uploaded && (
        <h3
          style={{
            color: "#22c55e",
            marginTop: "20px",
          }}
        >
          ✅ Evaluation Completed
        </h3>
      )}

      <div className="buttons">
        <button
          onClick={handleStart}
          disabled={recording || loading}
        >
          🎤 Start Recording
        </button>

        <button
          onClick={handleStop}
          disabled={!recording || loading}
        >
          🛑 Stop Recording
        </button>

        <button
          onClick={nextQuestion}
          disabled={!uploaded || loading}
        >
          {questionIndex < currentQuestions.length - 1
            ? "Next Question"
            : "Finish Interview"}
        </button>
      </div>

      <div className="progress">
        <p>Interview Progress</p>

        <progress
          value={questionIndex + 1}
          max={currentQuestions.length || 1}
        ></progress>

        <span>
          {currentQuestions.length > 0
            ? Math.round(
                ((questionIndex + 1) /
                  currentQuestions.length) *
                  100
              )
            : 0}
          %
        </span>
      </div>
    </div>
  );
}

export default Interview;
