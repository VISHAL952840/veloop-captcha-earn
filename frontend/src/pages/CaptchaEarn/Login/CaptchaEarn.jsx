import { useEffect, useState } from "react";
import api from "../../services/api";

function CaptchaEarn() {
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCaptcha = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/captcha/current", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("CAPTCHA response:", response.data);

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

  if (loading) {
    return <h2>Loading CAPTCHA...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>CAPTCHA Earn</h1>

      <p>{captcha.question}</p>

      <img
        src={captcha.captchaImage}
        alt="CAPTCHA"
        width="320"
      />

      <div>
        {captcha.options.map((option) => (
          <button key={option}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CaptchaEarn;