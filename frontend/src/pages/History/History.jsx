import { useEffect, useState } from "react";
import api from "../../services/api";
import "./History.css";

function History({ refreshKey }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/history");

        setTransactions(response.data.transactions || []);
      } catch (error) {
        console.error("History error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load transaction history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [refreshKey]);

  if (loading) {
    return (
      <section className="history-section">
        <div className="history-header">
          <div>
            <span className="history-eyebrow">
              ACCOUNT ACTIVITY
            </span>
            <h2>Transaction History</h2>
          </div>
        </div>

        <div className="history-loading">
          <div className="history-loader"></div>
          <p>Loading your transactions...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="history-section">
        <div className="history-header">
          <div>
            <span className="history-eyebrow">
              ACCOUNT ACTIVITY
            </span>
            <h2>Transaction History</h2>
          </div>
        </div>

        <div className="history-error">
          <strong>Unable to load history</strong>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="history-section">
      {/* Header */}
      <div className="history-header">
        <div>
          <span className="history-eyebrow">
            ACCOUNT ACTIVITY
          </span>

          <h2>Transaction History</h2>

          <p>
            Track your CAPTCHA rewards and wallet activity.
          </p>
        </div>

        <div className="transaction-count">
          {transactions.length}{" "}
          {transactions.length === 1
            ? "Transaction"
            : "Transactions"}
        </div>
      </div>

      {/* Empty State */}
      {transactions.length === 0 ? (
        <div className="history-empty">
          <div className="empty-icon">💎</div>

          <h3>No transactions yet</h3>

          <p>
            Complete your first CAPTCHA challenge to
            start earning Gems.
          </p>
        </div>
      ) : (
        <div className="transaction-list">
          {transactions.map((transaction) => (
            <div
              className="transaction-card"
              key={transaction.transactionId}
            >
              <div className="transaction-left">
                <div className="transaction-icon">
                  💎
                </div>

                <div className="transaction-info">
                  <h3>CAPTCHA Reward</h3>

                  <p>
                    {new Date(
                      transaction.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="transaction-middle">
                <span>Balance</span>

                <strong>
                  {transaction.balanceBefore}
                  {" → "}
                  {transaction.balanceAfter}
                </strong>
              </div>

              <div className="transaction-right">
                <strong className="reward-amount">
                  +{transaction.amount} 💎
                </strong>

                <span
                  className={`transaction-status ${
                    transaction.status?.toLowerCase()
                  }`}
                >
                  {transaction.status}
                </span>
              </div>

              <div className="transaction-id">
                <span>Transaction ID</span>

                <code>
                  {transaction.transactionId}
                </code>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default History;