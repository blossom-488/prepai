import "../styles/domain.css";
import { Link } from "react-router-dom";

function Domain() {
  const domains = [
    "Java",
    "Python",
    "SQL",
    "JavaScript",
    "React",
    "HR"
  ];

  return (
    <div className="domain-page">
      <h1>Select Interview Domain</h1>

      <p>Choose your preferred interview domain to begin.</p>

      <div className="domain-grid">
        {domains.map((domain) => (
          <Link
            key={domain}
            to="/interview"
            state={{ domain }}
            className="domain-card"
          >
            {domain}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Domain;