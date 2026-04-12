import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../authService";
import "./Login.css";

const mantisBg = process.env.PUBLIC_URL + "/mantis.jpg";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email.");
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    setResetToken("");
    setIsSubmitting(true);

    try {
      const data = await requestPasswordReset({ email });
      setMessage(data.message || "Reset request created successfully.");
      setResetToken(data.resetToken || "");
    } catch (err) {
      setError(err.message || "Could not create reset request.");
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
        <h1>Forgot Password</h1>
        <p className="login-subtitle">
          Enter your email and we will send you a reset link.
        </p>

        {error && <div className="login-error">{error}</div>}

        {message && (
          <div
            className="login-error"
            style={{
              color: "#86efac",
              borderColor: "rgba(34,197,94,0.3)",
              background: "rgba(34,197,94,0.12)",
            }}
          >
            {message}
            {resetToken && (
              <div style={{ marginTop: "8px", wordBreak: "break-all" }}>
                Local reset token: {resetToken}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleReset} className="login-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating request..." : "Send Reset Link"}
          </button>
        </form>

        <p className="bottom-text">
          Back to{" "}
          <button
            type="button"
            className="text-link"
            onClick={() => navigate("/")}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
