import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest } from "../authService";

const formatMoney = (value) =>
  "MYR " +
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function BudgetDetails() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/budgets/category/" + encodeURIComponent(slug))
      .then(setData)
      .catch((err) => setError(err.message));
  }, [slug]);

  const card = {
    background: "linear-gradient(180deg, rgba(44,24,82,0.9), rgba(23,17,56,0.9))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  };

  const budget = data?.budget;
  const spent = Number(budget?.spent_amount || 0);
  const limit = Number(budget?.limit_amount || 0);
  const remaining = limit - spent;
  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

  return (
    <>
      <button
        onClick={() => navigate("/budgets")}
        style={{
          background: "none",
          border: "none",
          color: "white",
          opacity: 0.82,
          fontWeight: "700",
          cursor: "pointer",
          marginBottom: "16px",
          padding: 0,
        }}
      >
        ← Back to Budgets
      </button>

      {error && <div style={{ ...card, color: "#fda4af" }}>{error}</div>}
      {!data && !error && <div style={card}>Loading budget details...</div>}

      {data && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "34px", fontWeight: "900" }}>{budget.category} Budget</div>
            <div style={{ opacity: 0.7 }}>Real spending from PostgreSQL transactions</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "18px" }}>
            <div style={card}>
              <div style={{ opacity: 0.7 }}>Budget</div>
              <div style={{ fontSize: "24px", fontWeight: "900", marginTop: 8 }}>{formatMoney(limit)}</div>
            </div>
            <div style={card}>
              <div style={{ opacity: 0.7 }}>Spent</div>
              <div style={{ fontSize: "24px", fontWeight: "900", marginTop: 8, color: "#fda4af" }}>{formatMoney(spent)}</div>
            </div>
            <div style={card}>
              <div style={{ opacity: 0.7 }}>Remaining</div>
              <div style={{ fontSize: "24px", fontWeight: "900", marginTop: 8, color: remaining >= 0 ? "#86efac" : "#fda4af" }}>
                {formatMoney(remaining)}
              </div>
            </div>
          </div>

          <div style={{ ...card, marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <strong>{Math.round(percent)}% used</strong>
              <span>{formatMoney(spent)} / {formatMoney(limit)}</span>
            </div>
            <div style={{ height: 10, borderRadius: 8, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: percent + "%", background: percent >= 90 ? "#fb7185" : "#a78bfa" }} />
            </div>
          </div>

          <div style={{ ...card, marginBottom: "18px" }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Spending by Day</div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chart}>
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Transactions</div>
            {data.transactions.length === 0 && <div style={{ opacity: 0.7 }}>No transactions in this category yet.</div>}
            {data.transactions.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{item.title}</div>
                  <div style={{ opacity: 0.65, fontSize: 13 }}>
                    {String(item.date).slice(0, 10)} • {item.account_name || "No account"}
                  </div>
                </div>
                <div style={{ color: "#fda4af", fontWeight: 900 }}>-{formatMoney(item.amount)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default BudgetDetails;
