import "./Navbar.css";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        
        {/* Logo */}
        <div
          className="logo"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          Prep<span>AI</span>
        </div>

        {/* Navigation Links */}
        <ul className="nav-links">

          <li>
            <button
              className="nav-btn"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              Home
            </button>
          </li>

          <li>
            <button
              className="nav-btn"
              onClick={() => scrollToSection("about")}
            >
              About
            </button>
          </li>

          <li>
            <button
              className="nav-btn"
              onClick={() => scrollToSection("contact")}
            >
              Contact
            </button>
          </li>

        </ul>

        {/* Login Button */}
        <button
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

      </div>
    </nav>
  );
}

export default Navbar;