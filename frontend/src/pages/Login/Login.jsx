import { useState } from "react";
import api from "../../services/api";
import "./Login.css";

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Register new user
        const response = await api.post("/auth/register", {
          name,
          email,
          password,
        });

        localStorage.setItem("token", response.data.token);

        setSuccess("Account created successfully!");

        onLogin();
      } else {
        // Login existing user
        const response = await api.post("/auth/login", {
          email,
          password,
        });

        localStorage.setItem("token", response.data.token);

        onLogin();
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          (isRegister
            ? "Registration failed. Please try again."
            : "Login failed. Please check your credentials.")
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setSuccess("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
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
            <span className="login-eyebrow">
              {isRegister ? "GET STARTED" : "WELCOME BACK"}
            </span>

            <h2>
              {isRegister
                ? "Create your account"
                : "Sign in to your account"}
            </h2>

            <p>
              {isRegister
                ? "Create an account and start earning rewards."
                : "Complete secure CAPTCHA challenges and earn rewards."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {isRegister && (
              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

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
                minLength={6}
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label>Confirm Password</label>

                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {success && (
              <div className="login-success">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? isRegister
                  ? "Creating account..."
                  : "Signing in..."
                : isRegister
                ? "Create Account"
                : "Sign In"}
            </button>

          </form>

          <div className="login-switch">
            <span>
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}
            </span>

            <button
              type="button"
              onClick={switchMode}
              className="login-switch-button"
            >
              {isRegister ? "Sign In" : "Create Account"}
            </button>
          </div>

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