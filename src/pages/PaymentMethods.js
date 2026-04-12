import { useNavigate } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import { apiRequest } from "../authService";

function PaymentMethods() {
  const navigate = useNavigate();
  const [pressedBtn, setPressedBtn] = useState("");
  const [message, setMessage] = useState("");

  const [methods, setMethods] = useState([]);

  const formatMethod = (item) => ({
    id: item.id,
    name: item.name,
    subtitle: item.method_type + (item.last_four ? " •••• " + item.last_four : ""),
    icon: item.method_type === "Cash" ? "💵" : item.method_type === "Savings" ? "🏦" : "💳",
    iconBg:
      item.method_type === "Cash"
        ? "linear-gradient(180deg, #bfdbfe, #93c5fd)"
        : item.method_type === "Savings"
        ? "linear-gradient(180deg, #f5d0fe, #c084fc)"
        : "linear-gradient(180deg, #60a5fa, #2563eb)",
    primary: item.is_primary,
  });

  const loadMethods = useCallback(async () => {
    try {
      const data = await apiRequest("/payment-methods");
      setMethods((data.methods || []).map(formatMethod));
    } catch (err) {
      setMessage(err.message || "Could not load payment methods");
    }
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

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

  const methodRow = (key) => ({
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

  const removeButton = (active) => ({
    background: active
      ? "rgba(244,63,94,0.20)"
      : "rgba(244,63,94,0.14)",
    border: "1px solid rgba(251,113,133,0.45)",
    color: "#fda4af",
    borderRadius: "10px",
    width: "34px",
    height: "34px",
    cursor: "pointer",
    fontWeight: "900",
    transition: "all 0.12s ease",
    transform: active ? "scale(0.94)" : "scale(1)",
  });

  const makePrimary = async (id) => {
    try {
      await apiRequest(`/payment-methods/${id}/primary`, { method: "PUT" });
      await loadMethods();
      setMessage("Primary payment method updated!");
    } catch (err) {
      setMessage(err.message || "Could not update payment method");
    }
  };

  const removeMethod = async (id, name) => {
    try {
      await apiRequest(`/payment-methods/${id}`, { method: "DELETE" });
      await loadMethods();
      setMessage(name + " removed");
    } catch (err) {
      setMessage(err.message || "Could not remove payment method");
    }
  };

  const addMethod = async () => {
    try {
      const next = methods.length + 1;
      await apiRequest("/payment-methods", {
        method: "POST",
        body: JSON.stringify({
          name: "New Card " + next,
          method_type: "Card",
          last_four: String(4000 + next),
        }),
      });
      await loadMethods();
      setMessage("Payment method added");
    } catch (err) {
      setMessage(err.message || "Could not add payment method");
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
          Payment Methods
        </div>
        <div style={{ opacity: 0.82, fontSize: "18px" }}>
          Your linked cards and bank accounts.
        </div>
      </div>

      <div style={card}>
        {methods.map((item) => (
          <div
            key={item.id}
            style={methodRow("row-" + item.id)}
            onMouseDown={() => setPressedBtn("row-" + item.id)}
            onMouseUp={() => setPressedBtn("")}
            onMouseLeave={() => setPressedBtn("")}
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
                  {item.name}
                </div>
                <div style={{ opacity: 0.78, fontSize: "15px" }}>
                  {item.subtitle}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {item.primary ? (
                <div
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "rgba(16,185,129,0.16)",
                    border: "1px solid rgba(52,211,153,0.35)",
                    color: "#86efac",
                    fontWeight: "800",
                    fontSize: "12px",
                  }}
                >
                  Primary
                </div>
              ) : (
                <button
                  onClick={() => makePrimary(item.id)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "white",
                    borderRadius: "10px",
                    padding: "8px 10px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  Set Primary
                </button>
              )}

              <button
                onMouseDown={() => setPressedBtn("remove-" + item.id)}
                onMouseUp={() => {
                  setPressedBtn("");
                  removeMethod(item.id, item.name);
                }}
                onMouseLeave={() => setPressedBtn("")}
                style={removeButton(pressedBtn === "remove-" + item.id)}
              >
                X
              </button>
            </div>
          </div>
        ))}

        <button
          style={addButton}
          onMouseDown={() => setPressedBtn("add")}
          onMouseUp={() => {
            setPressedBtn("");
            addMethod();
          }}
          onMouseLeave={() => setPressedBtn("")}
        >
          + Add Payment Method
        </button>
      </div>
    </>
  );
}

export default PaymentMethods;
