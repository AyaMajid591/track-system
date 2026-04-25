import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../authService";
import useResponsive from "../hooks/useResponsive";

function Budgets() {
  const navigate = useNavigate();
  const { isMobile, isLargeMobile, isTablet, isPhone } = useResponsive();
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("Food");
  const [limitAmount, setLimitAmount] = useState("");
  const [error, setError] = useState("");

  const loadBudgets = async () => {
    try {
      const data = await apiRequest("/budgets");
      setBudgets(data.budgets || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const card = {
    background: "linear-gradient(180deg, rgba(44,24,82,0.9), rgba(23,17,56,0.9))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "18px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
  };

  const input = {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
  };

  const button = {
    background: "linear-gradient(90deg, #9333ea, #ec4899)",
    border: "none",
    color: "white",
    borderRadius: "8px",
    padding: "12px 16px",
    fontWeight: "800",
    cursor: "pointer",
  };

  const addBudget = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await apiRequest("/budgets", {
        method: "POST",
        body: JSON.stringify({ category, limit_amount: Number(limitAmount) }),
      });
      setLimitAmount("");
      await loadBudgets();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteBudget = async (id) => {
    try {
      await apiRequest(`/budgets/${id}`, { method: "DELETE" });
      await loadBudgets();
    } catch (err) {
      setError(err.message);
    }
  };

  const BudgetCard = ({ item }) => {
    const spent = Number(item.spent_amount || 0);
    const limit = Number(item.limit_amount || 0);
    const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

    return (
      <div
        style={{ ...card, cursor: "pointer" }}
        onClick={() => navigate("/budget/" + item.category.toLowerCase().replace(/\s+/g, "-"))}
      >
        <div style={{ fontWeight: "800", fontSize: "18px" }}>{item.category}</div>
        <div style={{ opacity: 0.6, fontSize: "13px" }}>Month {item.month}, {item.year}</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px" }}>
          <div>
            <div style={{ opacity: 0.6, fontSize: "12px" }}>Spent</div>
            <div style={{ fontWeight: "700" }}>MYR {spent.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ opacity: 0.6, fontSize: "12px" }}>Budget</div>
            <div style={{ fontWeight: "700" }}>MYR {limit.toFixed(2)}</div>
          </div>
        </div>
        <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "6px", marginTop: "12px", overflow: "hidden" }}>
          <div style={{ width: percent + "%", height: "100%", background: percent >= 90 ? "#fb7185" : "#a78bfa", borderRadius: "6px" }} />
        </div>
        <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "6px" }}>
          {Math.round(percent)}% used · MYR {(limit - spent).toFixed(2)} left
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteBudget(item.id);
          }}
          style={{
            marginTop: "12px",
            background: "rgba(244,63,94,0.14)",
            border: "1px solid rgba(251,113,133,0.45)",
            color: "#fda4af",
            borderRadius: "8px",
            padding: "8px 10px",
            cursor: "pointer",
            fontWeight: "800",
          }}
        >
          Delete
        </button>
      </div>
    );
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "28px", fontWeight: "800" }}>Budgets</div>
          <div style={{ opacity: 0.6 }}>Budget usage calculated from expense transactions</div>
        </div>
      </div>

      {error && <div style={{ ...card, color: "#fda4af", marginBottom: 18 }}>{error}</div>}

      <form onSubmit={addBudget} style={{ ...card, marginBottom: 20, display: "grid", gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr auto", gap: 12 }}>
        <select style={input} value={category} onChange={(e) => setCategory(e.target.value)}>
          {["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Salary", "Investment", "Savings", "Other"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <input style={input} placeholder="Monthly limit" type="number" value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)} />
        <button style={{ ...button, width: isPhone ? "100%" : "auto" }}>Add Budget</button>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isLargeMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: "18px" }}>
        {budgets.length === 0 && <div style={{ ...card, opacity: 0.75 }}>No budgets yet. Add one above.</div>}
        {budgets.map((item) => (
          <BudgetCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}

export default Budgets;
