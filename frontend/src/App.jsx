import { useEffect, useState } from "react";
import CaptchaEarn from "./pages/CaptchaEarn/CaptchaEarn";
import Login from "./pages/Login/Login";
import api from "./services/api";
import "./App.css";
import History from "./pages/History/History";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [gems, setGems] = useState(0);

  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const fetchWallet = async () => {
    try {
      const response = await api.get("/wallet");
      setGems(response.data.gems);
    } catch (error) {
      console.error("Wallet fetch error:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchWallet();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
      />
    );
  }

  return (
    <div>
     <header className="app-navbar">
  <div className="brand-section">
    <div className="brand-logo">
      V
    </div>

    <div>
      <h2>VELoop</h2>
      <span>Rewards Platform</span>
    </div>
  </div>

 <div className="navbar-right">
  <div className="wallet-badge">
    <span className="wallet-icon">💎</span>

    <div>
      <span className="wallet-label">Balance</span>
      <strong>{gems} Gems</strong>
    </div>
  </div>

  <button
    className="logout-button"
    onClick={() => {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
    }}
  >
    Logout
  </button>
</div>
</header>

      <CaptchaEarn onBalanceUpdate={setGems}
        onHistoryUpdate={() =>
        setHistoryRefreshKey((prev) => prev + 1) } />
      <History  refreshKey={historyRefreshKey} />
    </div>
  );
}

export default App;