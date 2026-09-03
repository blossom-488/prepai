import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Reports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://genuine-courtesy-production-64fd.up.railway.app/api/reports/"
        );

        if (!response.ok) {
          throw new Error(`Reports API failed: ${response.status}`);
        }

        const data = await response.json();

        setReports(data);
      } catch (err) {
        console.error("Reports fetch error:", err);

        setError(
          "Unable to load interview reports. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050816",
        padding: "40px",
        color: "white",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          color: "#22d3ee",
          fontSize: "48px",
        }}
      >
        📊 PrepAI Reports
      </h1>

      <h3
        style={{
          color: "#cbd5e1",
          marginBottom: "40px",
        }}
      >
        Interview History
      </h3>

      {/* Loading */}
      {loading && (
        <h2
          style={{
            color: "#f59e0b",
          }}
        >
          ⏳ Loading Reports...
        </h2>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          style={{
            maxWidth: "650px",
            margin: "30px auto",
            background: "#1f2937",
            padding: "25px",
            borderRadius: "15px",
            color: "#f87171",
          }}
        >
          <h2>⚠️ Unable to Load Reports</h2>

          <p>{error}</p>

          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#ef4444",
              color: "white",
              padding: "12px 25px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Reports */}
      {!loading && !error && reports.length === 0 && (
        <h2
          style={{
            color: "#cbd5e1",
          }}
        >
          No Reports Found
        </h2>
      )}

      {/* Reports */}
      {!loading &&
        !error &&
        reports.length > 0 &&
        reports.map((report) => (
          <div
            key={report.id}
            style={{
              maxWidth: "750px",
              margin: "30px auto",
              background: "#111827",
              padding: "30px",
              borderRadius: "18px",
              boxShadow: "0 8px 20px rgba(0,0,0,.4)",
              textAlign: "left",
            }}
          >
            <h2
              style={{
                color: "#22d3ee",
                marginBottom: "10px",
              }}
            >
              💻 {report.domain} Interview
            </h2>

            <h3
              style={{
                color: "#cbd5e1",
                marginBottom: "20px",
                fontWeight: "500",
                lineHeight: "1.5",
              }}
            >
              ❓ {report.question}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <p>
                <strong>⭐ Technical:</strong>{" "}
                {report.technical_score}
              </p>

              <p>
                <strong>💬 Communication:</strong>{" "}
                {report.communication}
              </p>

              <p>
                <strong>🎯 Confidence:</strong>{" "}
                {report.confidence}
              </p>

              <p>
                <strong>🏆 Overall:</strong>{" "}
                {report.overall_score}
              </p>
            </div>

            <p>
              <strong>📅 Date:</strong> {report.date}
            </p>

            <br />

            <h3
              style={{
                color: "#22d3ee",
              }}
            >
              AI Feedback
            </h3>

            <div
              style={{
                background: "#1e293b",
                padding: "18px",
                borderRadius: "10px",
                marginTop: "10px",
                lineHeight: "1.8",
                color: "#e2e8f0",
              }}
            >
              {report.feedback}
            </div>
          </div>
        ))}

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          background: "#06b6d4",
          color: "white",
          padding: "15px 35px",
          border: "none",
          borderRadius: "10px",
          fontSize: "18px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        ⬅ Back to Dashboard
      </button>
    </div>
  );
}

export default Reports;
