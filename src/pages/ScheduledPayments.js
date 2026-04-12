import { useNavigate } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import { apiRequest } from "../authService";

function ScheduledPayments() {
  const navigate = useNavigate();
  const [pressedBtn, setPressedBtn] = useState("");
  const [message, setMessage] = useState("");

  const [payments, setPayments] = useState([]);

  const formatPayment = (item) => ({
    id: item.id,
    title: item.title,
    subtitle:
      item.frequency +
      " - Next: " +
      String(item.next_date || "").slice(0, 10) +
      (item.account_name ? " • " + item.account_name : ""),
    amount:
      "-MYR " +
      Number(item.amount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    status: item.status,
    icon: item.category === "Entertainment" ? "📦" : item.category === "Investment" ? "📄" : "⚡",
    iconBg:
      item.category === "Entertainment"
        ? "linear-gradient(180deg, #f9a8d4, #c084fc)"
        : item.category === "Investment"
        ? "linear-gradient(180deg, #dbeafe, #93c5fd)"
        : "linear-gradient(180deg, #818cf8, #6366f1)",
  });

  const loadPayments = useCallback(async () => {
    try {
      const data = await apiRequest("/scheduled-payments");
      setPayments((data.payments || []).map(formatPayment));
    } catch (err) {
      setMessage(err.message || "Could not load scheduled payments");
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 2200);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const topButton = {
    background: "linear-gradient(90deg, #9333ea, #ec4899)",
    border: "none",
    color: "white",
    borderRadius: "14px",
    padding: "12px 18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(236,72,153,0.35)",
  };

  const card = {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
  };

  const rowStyle = (key) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    padding: "16px 18px",
    borderRadius: "18px",
    marginBottom: "14px",
    background:
      pressedBtn === key
        ? "rgba(168,85,247,0.10)"
        : "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.12s ease",
    transform: pressedBtn === key ? "scale(0.985)" : "scale(1)",
  });

  const iconWrap = (bg) => ({
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  });

  const addButton = {
    width: "100%",
    background: "linear-gradient(90deg, #f0abfc, #c084fc, #8b5cf6)",
    border: "none",
    color: "white",
    borderRadius: "16px",
    padding: "16px 18px",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.12s ease",
    transform: pressedBtn === "add" ? "scale(0.985)" : "scale(1)",
    boxShadow: "0 0 22px rgba(168,85,247,0.28)",
  };

  const statusStyle = (status) => ({
    color: status === "Active" ? "#86efac" : "#d1d5db",
    fontSize: "12px",
    fontWeight: "800",
    marginTop: "4px",
  });

  const addPayment = async () => {
    try {
      await apiRequest("/scheduled-payments", {
        method: "POST",
        body: JSON.stringify({
          title: "New Scheduled Payment",
          category: "Bills",
          amount: 50,
          frequency: "Monthly",
          next_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
            .toISOString()
            .slice(0, 10),
        }),
      });
      await loadPayments();
      setMessage("Scheduled payment created");
    } catch (err) {
      setMessage(err.message || "Could not create scheduled payment");
    }
  };

  return (
    <>
      {message && (
        <div
          style={{
            marginBottom: "16px",
            padding: "14px",
            borderRadius: "14px",
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#4ade80",
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: "28px", fontWeight: "900" }}>Settings</div>
          <div style={{ opacity: 0.76, fontSize: "14px", fontWeight: "600" }}>
            April 2026
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            style={{
              width: "240px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "14px",
              color: "white",
              padding: "12px 14px",
              outline: "none",
            }}
            placeholder="Search..."
          />
          <button style={topButton}>+ New Transaction</button>
        </div>
      </div>

      <button
        onClick={() => navigate("/profile")}
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
        ← Back to Settings
      </button>

      <div style={{ marginBottom: "18px" }}>
        <div
          style={{
            fontSize: "46px",
            fontWeight: "900",
            lineHeight: 1,
            marginBottom: "10px",
          }}
        >
          Scheduled Payments
        </div>
        <div style={{ opacity: 0.82, fontSize: "18px" }}>
          Bills and recurring expenses tracked automatically.
        </div>
      </div>

      <div style={card}>
        {payments.map((item) => (
          <div
            key={item.id}
            style={rowStyle("row-" + item.id)}
            onMouseDown={() => setPressedBtn("row-" + item.id)}
            onMouseUp={() => setPressedBtn("")}
            onMouseLeave={() => setPressedBtn("")}
            onDoubleClick={async () => {
              await apiRequest(`/scheduled-payments/${item.id}`, { method: "DELETE" });
              await loadPayments();
              setMessage(item.title + " deleted");
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={iconWrap(item.iconBg)}>{item.icon}</div>

              <div>
                <div
                  style={{
                    fontWeight: "900",
                    fontSize: "20px",
                    marginBottom: "4px",
                  }}
                >
                  {item.title}
                </div>
                <div style={{ opacity: 0.78, fontSize: "15px" }}>
                  {item.subtitle}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  color: "#fda4af",
                  fontWeight: "900",
                  fontSize: "18px",
                }}
              >
                {item.amount}
              </div>
              <div style={statusStyle(item.status)}>{item.status}</div>
            </div>
          </div>
        ))}

        <button
          style={addButton}
          onMouseDown={() => setPressedBtn("add")}
          onMouseUp={() => {
            setPressedBtn("");
            addPayment();
          }}
          onMouseLeave={() => setPressedBtn("")}
        >
          + Schedule New Payment
        </button>
      </div>
    </>
  );
}

export default ScheduledPayments;
