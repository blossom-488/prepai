import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [message] = useState("Welcome to PrepAI 🚀");

  const [stats, setStats] = useState({
    total_interviews: 0,
    average_score: 0,
    highest_score: 0,
    best_domain: "N/A",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Dashboard Statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://genuine-courtesy-production-64fd.up.railway.app/api/dashboard/"
        );

        if (!response.ok) {
          throw new Error(`Dashboard API failed: ${response.status}`);
        }

        const data = await response.json();

        setStats(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);

        setError(
          "Unable to load dashboard statistics. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const cardStyle = {
    background: "#111827",
    padding: "25px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
    transition: "0.3s ease",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        background: "#050816",
        minHeight: "100vh",
        padding: "40px",
        textAlign: "center",
        color: "white",
      }}
    >
      {/* Heading */}

      <h1
        style={{
          color: "#22d3ee",
          fontSize: "48px",
          marginBottom: "10px",
        }}
      >
        🚀 PrepAI Dashboard
      </h1>

      <h3
        style={{
          color: "#d1d5db",
          marginBottom: "40px",
        }}
      >
        {message}
      </h3>

      {/* Loading */}

      {loading && (
        <p
          style={{
            color: "#facc15",
            fontSize: "18px",
            marginBottom: "30px",
          }}
        >
          ⏳ Loading your interview statistics...
        </p>
      )}

      {/* Error */}

      {!loading && error && (
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto 30px",
            background: "#1f2937",
            padding: "20px",
            borderRadius: "12px",
            color: "#f87171",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Dashboard Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
          gap: "25px",
          marginBottom: "50px",
        }}
      >
        {/* Total Interviews */}

        <div
          style={cardStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-8px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{
              color: "#ffffff",
              marginBottom: "15px",
            }}
          >
            📋 Total Interviews
          </h2>

          <h1
            style={{
              color: "#3b82f6",
              fontSize: "48px",
            }}
          >
            {stats.total_interviews}
          </h1>
        </div>

        {/* Average */}

        <div
          style={cardStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-8px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{
              color: "#ffffff",
              marginBottom: "15px",
            }}
          >
            ⭐ Average Score
          </h2>

          <h1
            style={{
              color: "#facc15",
              fontSize: "48px",
            }}
          >
            {stats.average_score}
          </h1>
        </div>

        {/* Highest */}

        <div
          style={cardStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-8px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{
              color: "#ffffff",
              marginBottom: "15px",
            }}
          >
            🏆 Highest Score
          </h2>

          <h1
            style={{
              color: "#22c55e",
              fontSize: "48px",
            }}
          >
            {stats.highest_score}
          </h1>
        </div>

        {/* Best Domain */}

        <div
          style={cardStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-8px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{
              color: "#ffffff",
              marginBottom: "15px",
            }}
          >
            💻 Top Performing Domain
          </h2>

          <h1
            style={{
              color: "#a855f7",
              fontSize: "42px",
            }}
          >
            {stats.best_domain}
          </h1>
        </div>
      </div>

      {/* Buttons */}

      <button
        onClick={() => navigate("/domain")}
        style={{
          background: "#06b6d4",
          color: "white",
          padding: "15px 30px",
          border: "none",
          borderRadius: "10px",
          fontSize: "17px",
          margin: "10px",
          cursor: "pointer",
        }}
      >
        🎤 Start Interview
      </button>

      <button
        onClick={() => navigate("/reports")}
        style={{
          background: "#10b981",
          color: "white",
          padding: "15px 30px",
          border: "none",
          borderRadius: "10px",
          fontSize: "17px",
          margin: "10px",
          cursor: "pointer",
        }}
      >
        📊 Reports
      </button>

      <button
        onClick={() => navigate("/")}
        style={{
          background: "#ef4444",
          color: "white",
          padding: "15px 30px",
          border: "none",
          borderRadius: "10px",
          fontSize: "17px",
          margin: "10px",
          cursor: "pointer",
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

export default Dashboard;
