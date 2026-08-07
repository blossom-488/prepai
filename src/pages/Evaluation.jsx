import { useLocation, useNavigate } from "react-router-dom";

function Evaluation() {
  const navigate = useNavigate();
  const location = useLocation();

  const evaluations = location.state?.evaluations || [];

  const parsedEvaluations = evaluations.map((item) => {
    try {
      return JSON.parse(item.evaluation);
    } catch (error) {
      return {};
    }
  });

  const total = parsedEvaluations.length;

  const technical =
    total > 0
      ? Math.round(
          parsedEvaluations.reduce(
            (sum, item) => sum + (item.technical_score || 0),
            0
          ) / total
        )
      : 0;

  const communication =
    total > 0
      ? Math.round(
          parsedEvaluations.reduce(
            (sum, item) => sum + (item.communication || 0),
            0
          ) / total
        )
      : 0;

  const confidence =
    total > 0
      ? Math.round(
          parsedEvaluations.reduce(
            (sum, item) => sum + (item.confidence || 0),
            0
          ) / total
        )
      : 0;

  const overall =
    total > 0
      ? Math.round(
          parsedEvaluations.reduce(
            (sum, item) => sum + (item.overall_score || 0),
            0
          ) / total
        )
      : 0;

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "80px",
      }}
    >
      <h1>Interview Completed 🎉</h1>

      <h2>Evaluation Summary</h2>

      <p>Technical Score : {technical} / 100</p>
      <p>Communication : {communication} / 100</p>
      <p>Confidence : {confidence} / 100</p>
      <p>Overall Score : {overall} / 100</p>

      <h2 style={{ marginTop: "30px" }}>Question-wise Feedback</h2>

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
            <strong>Technical:</strong> {item.technical_score}
          </p>

          <p>
            <strong>Communication:</strong> {item.communication}
          </p>

          <p>
            <strong>Confidence:</strong> {item.confidence}
          </p>

          <p>
            <strong>Overall:</strong> {item.overall_score}
          </p>

          <p>
            <strong>Feedback:</strong> {item.feedback}
          </p>
        </div>
      ))}

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