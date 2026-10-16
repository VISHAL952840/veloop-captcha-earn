import { useEffect, useState } from "react";
import api from "../../services/api";
import "./CaptchaEarn.css";

function CaptchaEarn({ onBalanceUpdate, onHistoryUpdate }) {
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [newLoading, setNewLoading] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [error, setError] = useState("");

  const fetchCaptcha = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.get("/captcha/current");

      setCaptcha(response.data);
    } catch (error) {
      console.error("CAPTCHA error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load CAPTCHA."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleOptionClick = async (selectedOption) => {
    if (verifying || result) {
      return;
    }

    try {
      setVerifying(true);
      setError("");

      const response = await api.post("/captcha/verify", {
        challengeId: captcha.challengeId,
        selectedOption,
      });

      if (response.data.balance !== undefined) {
        onBalanceUpdate(response.data.balance);
      }

      setResult(response.data);
    } catch (error) {
      console.error("Verification error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to verify CAPTCHA."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleClaim = async () => {
    if (!result || claiming) {
      return;
    }

    try {
      setClaiming(true);
      setError("");

      const response = await api.post("/captcha/claim", {
        challengeId: captcha.challengeId,
      });

      console.log("Claim response:", response.data);

      setShowAd(true);
    } catch (error) {
      console.error("Claim error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to claim reward."
      );
    } finally {
      setClaiming(false);
    }
  };

  const handleAdComplete = () => {
    setAdCompleted(true);

    onHistoryUpdate();

    setTimeout(() => {
      setShowAd(false);
      setAdCompleted(false);
      handleNewCaptcha();
    }, 1200);
  };

  const handleNewCaptcha = async () => {
    if (newLoading || !captcha) {
      return;
    }

    try {
      setNewLoading(true);
      setError("");

      const response = await api.post("/captcha/new", {
        oldChallengeId: captcha.challengeId,
      });

      setCaptcha(response.data);
      setResult(null);
    } catch (error) {
      console.error("New CAPTCHA error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create new CAPTCHA."
      );
    } finally {
      setNewLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="captcha-page">
        <div className="captcha-container">
          <div className="loading-card">
            <div className="loader"></div>
            <h2>Loading CAPTCHA...</h2>
            <p>Please wait while we prepare your challenge.</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !captcha) {
    return (
      <main className="captcha-page">
        <div className="captcha-container">
          <div className="error-card">
            <h2>Something went wrong</h2>
            <p>{error}</p>

            <button
              className="primary-button"
              onClick={fetchCaptcha}
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="captcha-page">
      <div className="captcha-container">

        {/* Header */}
        <section className="page-heading">
          <div>
            <span className="eyebrow">VELoop Rewards</span>
            <h1>Complete CAPTCHA & Earn</h1>
            <p>
              Solve the challenge correctly and earn Gems.
            </p>
          </div>

          <div className="security-badge">
            <span>●</span>
            Secure Challenge
          </div>
        </section>

        {/* Main CAPTCHA Card */}
        <section className="captcha-card">

          <div className="captcha-card-header">
            <div>
              <span className="step-label">CURRENT CHALLENGE</span>
              <h2>Verify the CAPTCHA</h2>
            </div>

            <div className="reward-badge">
              💎 Earn Gems
            </div>
          </div>

          <div className="captcha-content">

            <div className="captcha-image-wrapper">
              <img
                src={captcha.captchaImage}
                alt="CAPTCHA challenge"
                className="captcha-image"
              />
            </div>

            <div className="captcha-question">
              <p>
                {captcha.question ||
                  "Select the correct CAPTCHA option."}
              </p>
            </div>

            {verifying && (
              <div className="checking-box">
                <div className="loader small"></div>

                <div>
                  <strong>Checking your answer...</strong>
                  <span>
                    Securely verifying with VELoop
                  </span>
                </div>
              </div>
            )}

            {!result && !verifying && (
              <div className="options-grid">
                {captcha.options.map((option, index) => (
                  <button
                    key={option}
                    className="captcha-option"
                    onClick={() =>
                      handleOptionClick(option)
                    }
                    disabled={verifying}
                  >
                    <span className="option-number">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span className="option-value">
                      {option}
                    </span>

                    <span className="option-arrow">
                      →
                    </span>
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="inline-error">
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div
                className={`result-card ${
                  result.result === "CORRECT"
                    ? "success"
                    : "failed"
                }`}
              >
                <div className="result-icon">
                  {result.result === "CORRECT"
                    ? "✓"
                    : "×"}
                </div>

                <div className="result-content">
                  <h2>
                    {result.result === "CORRECT"
                      ? "Correct Answer!"
                      : "Incorrect Answer"}
                  </h2>

                  <p>{result.message}</p>

                  {result.result === "CORRECT" && (
                    <div className="reward-display">
                      <span>Reward earned</span>
                      <strong>
                        +{result.reward} 💎
                      </strong>
                    </div>
                  )}

                  {result.balance !== undefined && (
                    <div className="balance-display">
                      Current balance:{" "}
                      <strong>
                        💎 {result.balance}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {result && (
              <div className="result-actions">

                {result.result === "CORRECT" && (
                  <button
                    className="primary-button"
                    onClick={handleClaim}
                    disabled={claiming || newLoading}
                  >
                    {claiming
                      ? "Claiming..."
                      : "Claim Reward"}
                  </button>
                )}

                <button
                  className="secondary-button"
                  onClick={handleNewCaptcha}
                  disabled={claiming || newLoading}
                >
                  {newLoading
                    ? "Loading..."
                    : "No Thanks"}
                </button>

              </div>
            )}

          </div>
        </section>

        {/* Information */}
        <section className="info-row">
          <div className="info-item">
            <span>🔒</span>
            <div>
              <strong>Secure Verification</strong>
              <p>
                Your answer is verified by our backend.
              </p>
            </div>
          </div>

          <div className="info-item">
            <span>💎</span>
            <div>
              <strong>Earn Rewards</strong>
              <p>
                Correct challenges earn Gems.
              </p>
            </div>
          </div>

          <div className="info-item">
            <span>⚡</span>
            <div>
              <strong>Quick Challenges</strong>
              <p>
                Complete challenges in seconds.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Mock Rewarded Ad */}
      {showAd && (
        <div className="ad-overlay">
          <div className="mock-ad">

            {!adCompleted ? (
              <>
                <div className="ad-label">
                  DEMO ADVERTISEMENT
                </div>

                <div className="ad-icon">
                  ▶
                </div>

                <h2>Reward is ready</h2>

                <p>
                  Complete this demo advertisement
                  to continue.
                </p>

                <button
                  className="primary-button"
                  onClick={handleAdComplete}
                >
                  Complete Demo Ad
                </button>
              </>
            ) : (
              <>
                <div className="success-ad-icon">
                  ✓
                </div>

                <h2>Reward completed!</h2>

                <p>
                  Preparing your next CAPTCHA...
                </p>
              </>
            )}

          </div>
        </div>
      )}

    </main>
  );
}

export default CaptchaEarn;