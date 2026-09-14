import { useLocation, useNavigate } from "react-router-dom";

function CodingEvaluation() {
  const location = useLocation();
  const navigate = useNavigate();

  const evaluations = location.state?.evaluations || [];
  const domain = location.state?.domain || "Java";

  const parsedEvaluations = evaluations.map((item) => {
    try {
      return JSON.parse(item.evaluation);
    } catch (error) {
      return {};
    }
  });

  const total = parsedEvaluations.length;

  const calculateAverage = (field) => {
    if (total === 0) return 0;

    return Math.round(
      parsedEvaluations.reduce(
        (sum, item) => sum + (item[field] || 0),
        0
      ) / total
    );
  };

  const correctness = calculateAverage(
    "correctness_score"
  );

  const logic = calculateAverage(
    "logic_score"
  );

  const codeQuality = calculateAverage(
    "code_quality_score"
  );

  const overall = calculateAverage(
    "overall_score"
  );

  const completed = total >= 3;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "60px auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1>
        Coding Round Completed 🎉
      </h1>

      <h2>
        Final Coding Evaluation
      </h2>

      <p>
        <strong>Domain:</strong> {domain}
      </p>

      {/* ===========================
          Overall Summary
          =========================== */}

      <div
        style={{
          marginTop: "30px",
          padding: "25px",
          border: "1px solid #ccc",
          borderRadius: "12px",
        }}
      >
        <h2>Overall Coding Score</h2>

        <h1>
          {overall} / 100
        </h1>

        <p>
          <strong>Correctness:</strong>{" "}
          {correctness} / 100
        </p>

        <p>
          <strong>Logic:</strong>{" "}
          {logic} / 100
        </p>

        <p>
          <strong>Code Quality:</strong>{" "}
          {codeQuality} / 100
        </p>
      </div>

      {/* ===========================
          Completion Status
          =========================== */}

      {completed ? (
        <h2
          style={{
            color: "#22c55e",
            marginTop: "30px",
          }}
        >
          ✅ All 3 Coding Questions Completed
        </h2>
      ) : (
        <h2
          style={{
            color: "#ef4444",
            marginTop: "30px",
          }}
        >
          ⚠️ Coding Round Incomplete
        </h2>
      )}

      {/* ===========================
          Question-wise Results
          =========================== */}

      <h2
        style={{
          marginTop: "40px",
        }}
      >
        Question-wise Results
      </h2>

      {parsedEvaluations.map(
        (item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "12px",
              margin: "20px auto",
              padding: "20px",
              textAlign: "left",
            }}
          >
            <h3>
              Coding Question {index + 1}
            </h3>

            <p>
              <strong>
                Correctness:
              </strong>{" "}
              {item.correctness_score || 0}
            </p>

            <p>
              <strong>
                Logic:
              </strong>{" "}
              {item.logic_score || 0}
            </p>

            <p>
              <strong>
                Code Quality:
              </strong>{" "}
              {item.code_quality_score || 0}
            </p>

            <p>
              <strong>
                Overall:
              </strong>{" "}
              {item.overall_score || 0}
            </p>

            <p>
              <strong>
                AI Feedback:
              </strong>{" "}
              {item.feedback ||
                "No feedback available."}
            </p>
          </div>
        )
      )}

      {/* ===========================
          Reports Button
          =========================== */}

      <button
        onClick={() =>
          navigate("/reports")
        }
        style={{
          marginTop: "30px",
          padding: "12px 30px",
          cursor: "pointer",
        }}
      >
        View All Reports
      </button>
    </div>
  );
}

export default CodingEvaluation;