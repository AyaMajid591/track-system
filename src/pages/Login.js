import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, saveRememberedEmail } from "../authService";
import "./Login.css";

const mantisBg = process.env.PUBLIC_URL + "/mantis.jpg";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(localStorage.getItem("track_user_email") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(Boolean(localStorage.getItem("track_user_email")));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const data = await loginUser({ email, password });
      saveRememberedEmail(data.user.email, rememberMe);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div
   className="login-page"
   style={{
    "--login-bg": "url(" + mantisBg + ")"
   }}
  >
      <div className="login-overlay"></div>

      <div className="login-card">
        <div className="login-badge">TRACK SYSTEM</div>
        <h1>Login</h1>
        <p className="login-subtitle">
          Sign in to continue to your smart finance manager.
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="login-row">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>

            <button
              type="button"
              className="text-link"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="bottom-text">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="text-link"
            onClick={() => navigate("/register")}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
