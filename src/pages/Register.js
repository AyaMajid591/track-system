import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../authService";
import "./Login.css";

const mantisBg = process.env.PUBLIC_URL + "/mantis.jpg";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await registerUser({ name, email, password });
      localStorage.setItem("track_user_email", email.trim().toLowerCase());
      navigate("/login");
    } catch (err) {
      setError(err.message || "Register failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
};

  return (
    <div
      className="login-page"
      style={{
        "--login-bg": "url(" + mantisBg + ")",
      }}
    >
      <div className="login-overlay"></div>

      <div className="login-card">
        <div className="login-badge">TRACK SYSTEM</div>
        <h1>Sign Up</h1>
        <p className="login-subtitle">
          Create your account to start using TRACK.
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleRegister} className="login-form">
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Create your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="bottom-text">
          Already have an account?{" "}
          <button
            type="button"
            className="text-link"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
