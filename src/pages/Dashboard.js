import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { apiRequest } from "../authService";

const formatMoney = (value) =>
  "MYR " +
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasDashboardData = (result) =>
    Boolean(
      result?.accounts?.length ||
        result?.recentTransactions?.length ||
        result?.categorySummary?.length ||
        result?.monthly?.length
    );

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        let result = await apiRequest("/dashboard");

        // Seed a brand-new account once so the dashboard is not empty on first login.
        if (!hasDashboardData(result)) {
          await apiRequest("/api/demo/seed", { method: "POST" });
          result = await apiRequest("/dashboard");
        }

        setData(result);
      } catch (err) {
        setError(err.message);
        if (err.message.toLowerCase().includes("login")) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const pageStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 20% 0%, rgba(168,85,247,0.5), transparent 40%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.4), transparent 40%), #0b1026",
    color: "white",
    padding: "28px 32px",
    fontFamily: "Poppins, sans-serif",
  };

  const glassBig = {
    background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(99,102,241,0.08))",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(18px)",
    borderRadius: "24px",
    boxShadow: "0 0 60px rgba(168,85,247,0.25), inset 0 0 30px rgba(255,255,255,0.05)",
  };

  const darkCard = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    borderRadius: "18px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  };

  const statCard = {
    ...darkCard,
    padding: "18px",
    minHeight: "110px",
  };

  const navButton = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  };

  const quickButton = (bg) => ({
    ...darkCard,
    background: bg,
    padding: "18px 14px",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: "700",
    minHeight: "92px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  });

  const accountCard = (color) => ({
    ...darkCard,
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    borderLeft: "4px solid " + color,
    marginBottom: "12px",
  });

  const transactionRow = {
    ...darkCard,
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  };

  const chartData = data?.monthly?.length
    ? data.monthly
    : [{ name: "No data", income: 0, expense: 0 }];
  const categoryData = data?.categorySummary?.length
    ? data.categorySummary.map((item) => ({ name: item.category, value: item.total }))
    : [{ name: "No expenses", value: 1 }];
  const COLORS = ["#22c55e", "#38bdf8", "#a855f7", "#f97316", "#fb7185", "#fde047"];

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.10)",
              marginBottom: "16px",
              fontSize: "13px",
            }}
          >
            Track System
          </div>

          <h1 style={{ fontSize: "46px", lineHeight: 1.05, margin: 0, fontWeight: 800 }}>
            Financial Dashboard
          </h1>
          <p style={{ maxWidth: "720px", opacity: 0.82, lineHeight: 1.7 }}>
            Live balance, income, expenses, accounts, transactions, and category activity from your PostgreSQL data.
          </p>
        </div>

        {loading && <div style={{ ...glassBig, padding: "22px" }}>Loading dashboard...</div>}
        {error && <div style={{ ...glassBig, padding: "22px", color: "#fda4af" }}>{error}</div>}

        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "20px" }}>
            <div>
              <div style={{ ...glassBig, padding: "22px", marginBottom: "20px" }}>
                <div style={{ fontSize: "13px", opacity: 0.78, marginBottom: "10px" }}>
                  OVERALL BALANCE
                </div>
                <div style={{ fontSize: "44px", fontWeight: 800, marginBottom: "18px" }}>
                  {formatMoney(data.summary.total_balance)}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  <div style={statCard}>
                    <div style={{ opacity: 0.7, fontSize: "13px", marginBottom: "10px" }}>Income</div>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#4ade80" }}>
                      {formatMoney(data.summary.total_income)}
                    </div>
                  </div>
                  <div style={statCard}>
                    <div style={{ opacity: 0.7, fontSize: "13px", marginBottom: "10px" }}>Expenses</div>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#fb7185" }}>
                      {formatMoney(data.summary.total_expenses)}
                    </div>
                  </div>
                  <div style={statCard}>
                    <div style={{ opacity: 0.7, fontSize: "13px", marginBottom: "10px" }}>Net</div>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#c4b5fd" }}>
                      {formatMoney(data.summary.total_income - data.summary.total_expenses)}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "22px", height: "220px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" />
                      <Tooltip
                        contentStyle={{
                          background: "#1a1440",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Area dataKey="income" stroke="#4ade80" fill="rgba(74,222,128,0.25)" strokeWidth={3} />
                      <Area dataKey="expense" stroke="#fb7185" fill="rgba(251,113,133,0.25)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ ...glassBig, padding: "22px" }}>
                  <div style={{ fontSize: "13px", opacity: 0.78, marginBottom: "14px" }}>ACCOUNTS</div>
                  {data.accounts.map((account, index) => (
                    <div key={account.id} style={accountCard(COLORS[index % COLORS.length])} onClick={() => navigate("/accounts")}>
                      <div>
                        <div style={{ fontSize: "18px", fontWeight: 800 }}>{account.name}</div>
                        <div style={{ opacity: 0.72, fontSize: "13px", marginTop: "4px" }}>{account.account_type}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: "18px" }}>{formatMoney(account.balance)}</div>
                    </div>
                  ))}
                </div>

                <div style={{ ...glassBig, padding: "22px" }}>
                  <div style={{ fontSize: "13px", opacity: 0.78, marginBottom: "14px" }}>SPENDING BREAKDOWN</div>
                  <div style={{ height: "210px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                          {categoryData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ ...glassBig, padding: "22px", marginBottom: "20px" }}>
                <div style={{ fontSize: "13px", opacity: 0.78, marginBottom: "14px" }}>QUICK ACTIONS</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
                  <div style={quickButton("linear-gradient(180deg, rgba(59,130,246,0.22), rgba(17,24,67,0.88))")} onClick={() => navigate("/transactions")}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>+</div>
                    Add Transaction
                  </div>
                  <div style={quickButton("linear-gradient(180deg, rgba(34,197,94,0.22), rgba(17,24,67,0.88))")} onClick={() => navigate("/accounts")}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>💳</div>
                    Accounts
                  </div>
                  <div style={quickButton("linear-gradient(180deg, rgba(236,72,153,0.22), rgba(17,24,67,0.88))")} onClick={() => navigate("/statistics")}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>📊</div>
                    Statistics
                  </div>
                  <div style={quickButton("linear-gradient(180deg, rgba(168,85,247,0.22), rgba(17,24,67,0.88))")} onClick={() => navigate("/budgets")}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>◎</div>
                    Budgets
                  </div>
                </div>
              </div>

              <div style={{ ...glassBig, padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ fontSize: "13px", opacity: 0.78 }}>RECENT TRANSACTIONS</div>
                  <button style={navButton} onClick={() => navigate("/transactions")}>View all</button>
                </div>

                {data.recentTransactions.length === 0 && <div style={{ opacity: 0.75 }}>No transactions yet.</div>}
                {data.recentTransactions.map((item) => (
                  <div key={item.id} style={transactionRow}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.title}</div>
                      <div style={{ opacity: 0.72, fontSize: "13px", marginTop: "4px" }}>
                        {item.date?.slice(0, 10)} • {item.account_name || "No account"} • {item.category}
                      </div>
                    </div>
                    <div style={{ color: item.type === "income" ? "#4ade80" : "#fb7185", fontWeight: 800 }}>
                      {item.type === "income" ? "+" : "-"}{formatMoney(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
