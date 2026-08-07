import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const [stats, setStats] = useState({
    total_interviews: 0,
    average_score: 0,
    highest_score: 0,
    best_domain: "N/A",
  });

  // Fetch Welcome Message
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.log(err));
  }, []);

  // Fetch Dashboard Statistics
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard/")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.log(err));
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
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

export default Dashboard;