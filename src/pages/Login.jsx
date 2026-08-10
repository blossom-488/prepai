import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://genuine-courtesy-production-64fd.up.railway.app/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Welcome to PrepAI 🚀",
          text: data.message,
          background: "#111827",
          color: "#ffffff",
          confirmButtonColor: "#22d3ee",
          confirmButtonText: "Continue",
        });

        navigate("/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message,
          background: "#111827",
          color: "#ffffff",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Something went wrong. Please try again.",
        background: "#111827",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
      });
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>PrepAI</h1>

        <p className="tagline">Login to Continue</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p>
          Don't have an account?{" "}
          <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
