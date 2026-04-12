import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiRequest } from "../authService";

const formatMoney = (value) =>
  "MYR " +
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Statistics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/analytics")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const pageStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 20% 0%, rgba(168,85,247,0.42), transparent 35%), radial-gradient(circle at 85% 15%, rgba(236,72,153,0.28), transparent 35%), #0b1026",
    color: "white",
    padding: "28px 32px",
    fontFamily: "Poppins, sans-serif",
  };

  const glassCard = {
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    backdropFilter: "blur(18px)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35), 0 0 28px rgba(168,85,247,0.12)",
  };

  const summaryCard = (accent) => ({
    ...glassCard,
    padding: "20px",
    borderRadius: "18px",
    boxShadow: "0 14px 40px rgba(0,0,0,0.35), 0 0 24px " + accent,
  });

  const chartData = data?.monthly?.length ? data.monthly : [{ name: "No data", income: 0, expense: 0 }];
  const categoryData = data?.categorySummary?.length
    ? data.categorySummary.map((item) => ({ name: item.category, value: item.total }))
    : [{ name: "No expenses", value: 1 }];
  const colors = ["#86efac", "#fda4af", "#c4b5fd", "#67e8f9", "#f9a8d4", "#fde047"];

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "34px", fontWeight: "800" }}>Analytics</div>
          <div style={{ opacity: 0.7, marginTop: "4px" }}>Charts built from your real transaction data</div>
        </div>

        {loading && <div style={{ ...glassCard, padding: "20px" }}>Loading analytics...</div>}
        {error && <div style={{ ...glassCard, padding: "20px", color: "#fda4af" }}>{error}</div>}

        {data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "18px" }}>
              <div style={summaryCard("rgba(74,222,128,0.35)")}>
                <div style={{ opacity: 0.7 }}>Total Income</div>
                <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800, color: "#86efac" }}>{formatMoney(data.summary.total_income)}</div>
              </div>
              <div style={summaryCard("rgba(251,113,133,0.35)")}>
                <div style={{ opacity: 0.7 }}>Total Expenses</div>
                <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800, color: "#fda4af" }}>{formatMoney(data.summary.total_expenses)}</div>
              </div>
              <div style={summaryCard("rgba(168,85,247,0.35)")}>
                <div style={{ opacity: 0.7 }}>Net Savings</div>
                <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800, color: "#e9d5ff" }}>{formatMoney(data.summary.net_savings)}</div>
              </div>
              <div style={summaryCard("rgba(34,211,238,0.25)")}>
                <div style={{ opacity: 0.7 }}>Savings Rate</div>
                <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800, color: "#67e8f9" }}>{data.summary.savings_rate}%</div>
              </div>
            </div>

            <div style={{ ...glassCard, padding: "22px", marginBottom: "18px" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Income vs Expenses</div>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                    <YAxis stroke="rgba(255,255,255,0.45)" />
                    <Tooltip />
                    <Line type="monotone" dataKey="income" stroke="#86efac" strokeWidth={4} />
                    <Line type="monotone" dataKey="expense" stroke="#fda4af" strokeWidth={4} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div style={{ ...glassCard, padding: "22px" }}>
                <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Spending Breakdown</div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={105}>
                        {categoryData.map((_, index) => (
                          <Cell key={index} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ ...glassCard, padding: "22px" }}>
                <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Expense by Category</div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
                      <YAxis stroke="rgba(255,255,255,0.45)" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Statistics;
