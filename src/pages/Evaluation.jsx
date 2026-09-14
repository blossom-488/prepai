import { useLocation, useNavigate } from "react-router-dom";

function Evaluation() {
  const navigate = useNavigate();
  const location = useLocation();

  const evaluations = location.state?.evaluations || [];
  const domain = location.state?.domain || "Java";
  const round = location.state?.round || 1;
  const sessionId = location.state?.sessionId;

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

  const technical = calculateAverage("technical_score");
  const communication = calculateAverage("communication");
  const confidence = calculateAverage("confidence");
  const overall = calculateAverage("overall_score");

  const passed = total >= 5 && overall >= 60;

  // ===========================
  // Start Next Round
  // ===========================

  const startNextRound = () => {
    if (round === 1 && passed) {
      navigate("/interview", {
        state: {
          domain,
          round: 2,
          sessionId,
        },
      });
    } else if (round === 2 && passed) {
      navigate("/coding", {
        state: {
          domain,
          round: 3,
          sessionId,
        },
      });
    }
  };

  // ===========================
  // Page Heading
  // ===========================

  const getRoundTitle = () => {
    if (round === 1) return "Round 1 Completed 🎉";
    if (round === 2) return "Round 2 Completed 🎉";
    return "Interview Completed 🎉";
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "60px",
        paddingBottom: "50px",
      }}
    >
      <h1>{getRoundTitle()}</h1>

      <h2>
        Round {round} Evaluation Summary
      </h2>

      <p>
        <strong>Domain:</strong> {domain}
      </p>

      <p>Technical Score : {technical} / 100</p>
      <p>Communication : {communication} / 100</p>
      <p>Confidence : {confidence} / 100</p>
      <p>Overall Score : {overall} / 100</p>

      {/* ===========================
          Pass / Fail Message
          =========================== */}

      {round === 1 && (
        <div style={{ marginTop: "30px" }}>
          {passed ? (
            <>
              <h2 style={{ color: "#22c55e" }}>
                🎉 Round 1 Passed!
              </h2>

              <p>
                Your average score is {overall}/100.
                You have unlocked Round 2.
              </p>

              <button
                onClick={startNextRound}
                style={{
                  marginTop: "15px",
                  padding: "12px 25px",
                  cursor: "pointer",
                }}
              >
                Start Round 2 →
              </button>
            </>
          ) : (
            <>
              <h2 style={{ color: "#ef4444" }}>
                ❌ Round 1 Not Passed
              </h2>

              <p>
                You need an average score of at least
                60/100 to unlock Round 2.
              </p>
            </>
          )}
        </div>
      )}

      {round === 2 && (
        <div style={{ marginTop: "30px" }}>
          {passed ? (
            <>
              <h2 style={{ color: "#22c55e" }}>
                🎉 Round 2 Passed!
              </h2>

              <p>
                Your average score is {overall}/100.
                You have unlocked the Coding Round.
              </p>

              <button
                onClick={startNextRound}
                style={{
                  marginTop: "15px",
                  padding: "12px 25px",
                  cursor: "pointer",
                }}
              >
                Start Round 3 – Coding →
              </button>
            </>
          ) : (
            <>
              <h2 style={{ color: "#ef4444" }}>
                ❌ Round 2 Not Passed
              </h2>

              <p>
                You need an average score of at least
                60/100 to unlock Round 3.
              </p>
            </>
          )}
        </div>
      )}

      {/* ===========================
          Question-wise Feedback
          =========================== */}

      <h2 style={{ marginTop: "40px" }}>
        Question-wise Feedback
      </h2>

      {parsedEvaluations.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            margin: "20px auto",
            padding: "15px",
            width: "70%",
          }}
        >
          <h3>Question {index + 1}</h3>

          <p>
            <strong>Technical:</strong>{" "}
            {item.technical_score}
          </p>

          <p>
            <strong>Communication:</strong>{" "}
            {item.communication}
          </p>

          <p>
            <strong>Confidence:</strong>{" "}
            {item.confidence}
          </p>

          <p>
            <strong>Overall:</strong>{" "}
            {item.overall_score}
          </p>

          <p>
            <strong>Feedback:</strong>{" "}
            {item.feedback}
          </p>
        </div>
      ))}

      {/* ===========================
          Reports
          =========================== */}

      <button
        onClick={() => navigate("/reports")}
        style={{
          marginTop: "20px",
          padding: "12px 25px",
          cursor: "pointer",
        }}
      >
        View Reports
      </button>
    </div>
  );
}

export default Evaluation;