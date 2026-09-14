import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      {/* Hero Section */}

      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "70px",
            color: "#ffffff",
            marginBottom: "20px",
          }}
        >
          PrepAI
        </h1>

        <p
          style={{
            fontSize: "24px",
            color: "#cbd5e1",
            marginBottom: "35px",
          }}
        >
          Your Intelligent Interview Companion
        </p>

        <button
          onClick={() => navigate("/login")}
          style={{
            background: "#22d3ee",
            color: "#050816",
            padding: "15px 35px",
            fontSize: "18px",
            borderRadius: "10px",
            fontWeight: "600",
          }}
        >
          🚀 Get Started
        </button>
      </section>

      {/* About */}

      <section
        id="about"
        style={{
          minHeight: "100vh",
          padding: "120px 12%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h2
          style={{
            fontSize: "42px",
            color: "#22d3ee",
            marginBottom: "30px",
          }}
        >
          About PrepAI
        </h2>

        <p
          style={{
            fontSize: "20px",
            lineHeight: "2",
            color: "#cbd5e1",
          }}
        >
          PrepAI is an AI-powered interview preparation platform designed to
          help students practice technical interviews through voice-based mock
          interviews.
          <br />
          <br />
          It uses OpenAI Whisper to convert speech into text and Gemini AI to
          evaluate answers based on technical knowledge, communication skills,
          confidence, and overall performance.
          <br />
          <br />
          Users can also track interview history, AI feedback, dashboard
          analytics, and detailed reports to monitor their progress and improve
          interview performance.
        </p>
      </section>

      {/* How It Works */}

      <section
        style={{
          padding: "100px 12%",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#22d3ee",
            fontSize: "42px",
            marginBottom: "50px",
          }}
        >
          How It Works
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "25px",
          }}
        >
          <div
            style={{
              background: "#111827",
              padding: "35px",
              borderRadius: "15px",
            }}
          >
            <h1>🎤</h1>

            <h3>Voice Interview</h3>

            <p style={{ color: "#cbd5e1" }}>
              Answer interview questions using your microphone.
            </p>
          </div>

          <div
            style={{
              background: "#111827",
              padding: "35px",
              borderRadius: "15px",
            }}
          >
            <h1>🤖</h1>

            <h3>AI Evaluation</h3>

            <p style={{ color: "#cbd5e1" }}>
              Gemini AI evaluates your technical knowledge and communication
              skills.
            </p>
          </div>

          <div
            style={{
              background: "#111827",
              padding: "35px",
              borderRadius: "15px",
            }}
          >
            <h1>📊</h1>

            <h3>Reports</h3>

            <p style={{ color: "#cbd5e1" }}>
              View interview history, scores, and AI-generated feedback.
            </p>
          </div>

          <div
            style={{
              background: "#111827",
              padding: "35px",
              borderRadius: "15px",
            }}
          >
            <h1>🏆</h1>

            <h3>Dashboard Analytics</h3>

            <p style={{ color: "#cbd5e1" }}>
              Track your performance using smart dashboard statistics.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}

      <section
        id="contact"
        style={{
          minHeight: "100vh",
          padding: "120px 12%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#22d3ee",
            fontSize: "48px",
            marginBottom: "20px",
          }}
        >
          Contact Us
        </h2>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "22px",
            marginBottom: "35px",
          }}
        >
          We'd love to hear from you.
        </p>

        <h3
          style={{
            fontSize: "30px",
            color: "#ffffff",
          }}
        >
          📧 rosyblossom488@gmail.com
        </h3>

        <p
          style={{
            color: "#64748b",
            marginTop: "80px",
            fontSize: "18px",
          }}
        >
          © 2026 PrepAI | Built using React • Django • Whisper • Gemini AI
        </p>
      </section>
    </>
  );
}

export default Home;