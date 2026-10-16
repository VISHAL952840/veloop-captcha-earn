import { useState } from "react";
import api from "../../services/api";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      onLogin();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">

        <div className="login-brand">
          <div className="login-logo">V</div>

          <h1>VELoop</h1>
          <p>Rewards Platform</p>
        </div>

        <div className="login-card">

          <div className="login-header">
            <span className="login-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>
              Complete secure CAPTCHA challenges and earn rewards.
            </p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <div className="login-footer">
            <span>Secure authentication</span>
            <span>•</span>
            <span>JWT Protected</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;