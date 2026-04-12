import { useState, useEffect } from "react";
import { apiRequest } from "../authService";

function GetPro() {
  const [pressedBtn, setPressedBtn] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 2000);
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

  const heroCard = {
    background:
      "radial-gradient(circle at top, rgba(168,85,247,0.28), transparent 42%), linear-gradient(180deg, rgba(44,24,82,0.96), rgba(23,17,56,0.96))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "42px 28px 34px",
    textAlign: "center",
    boxShadow: "0 22px 60px rgba(0,0,0,0.35), 0 0 30px rgba(168,85,247,0.16)",
    marginBottom: "22px",
  };

  const pricingGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "22px",
    alignItems: "stretch",
  };

  const priceCard = (variant) => ({
    background:
      variant === "pro"
        ? "linear-gradient(180deg, rgba(116,33,255,0.95), rgba(177,61,255,0.88))"
        : variant === "yearly"
        ? "linear-gradient(180deg, rgba(87,56,14,0.95), rgba(170,119,24,0.9))"
        : "linear-gradient(180deg, rgba(58,49,130,0.6), rgba(34,28,79,0.82))",
    border:
      variant === "yearly"
        ? "1px solid rgba(251,191,36,0.42)"
        : variant === "pro"
        ? "1px solid rgba(255,255,255,0.18)"
        : "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "24px 22px 22px",
    boxShadow:
      variant === "pro"
        ? "0 0 28px rgba(192,132,252,0.3)"
        : variant === "yearly"
        ? "0 0 28px rgba(251,191,36,0.18)"
        : "0 0 18px rgba(168,85,247,0.08)",
    position: "relative",
    overflow: "hidden",
    minHeight: "560px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  });

  const featureTable = {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    overflow: "hidden",
    marginBottom: "22px",
  };

  const benefitBox = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "22px 18px",
    textAlign: "center",
  };

  const finalCard = {
    background: "linear-gradient(180deg, rgba(111,61,255,0.52), rgba(74,29,169,0.55))",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "28px",
    padding: "32px 24px",
    textAlign: "center",
    boxShadow: "0 0 24px rgba(168,85,247,0.14)",
  };

  const buttonStyle = (type) => ({
    width: "100%",
    background:
      type === "yellow"
        ? "linear-gradient(90deg, #fde047, #fbbf24)"
        : type === "light"
        ? "linear-gradient(90deg, #f0abfc, #e9d5ff)"
        : "linear-gradient(90deg, #9333ea, #ec4899)",
    color: type === "yellow" ? "#3b2a00" : type === "light" ? "#4c1d95" : "white",
    border: "none",
    padding: "14px 18px",
    borderRadius: "16px",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.12s ease",
    transform:
      (type === "yellow" && pressedBtn === "yearly") ||
      (type === "light" && pressedBtn === "free") ||
      (type === "pro" && pressedBtn === "pro")
        ? "scale(0.97)"
        : "scale(1)",
    boxShadow:
      type === "yellow"
        ? "0 0 18px rgba(251,191,36,0.28)"
        : "0 0 18px rgba(236,72,153,0.22)",
  });

  const tableCell = {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };

  const updatePlan = async (plan) => {
    try {
      await apiRequest("/profile/plan", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      setMessage(plan + " plan selected successfully!");
    } catch (err) {
      setMessage(err.message || "Could not update plan");
    }
  };

  const freeFeatures = [
    "Up to 50 transactions/mo",
    "3 accounts",
    "Basic categories",
    "Manual entry only",
    "Standard support",
    "AI Assistant",
    "Unlimited transactions",
    "Budget alerts",
    "Export to CSV",
    "Multi-currency",
    "Custom categories",
  ];

  const proFeatures = [
    "Unlimited transactions",
    "5 accounts",
    "All categories",
    "AI Assistant (Claude)",
    "Budget tracking & alerts",
    "Export to CSV/Excel",
    "Multi-currency",
    "Custom categories",
    "Priority support",
    "Advanced analytics",
  ];

  const yearlyFeatures = [
    "Everything in Pro",
    "2 months free",
    "Early access to features",
    "Dedicated support",
    "Family sharing (up to 5)",
    "Financial reports PDF",
    "Tax summary export",
  ];

  const comparisonRows = [
    ["Transactions per month", "50", "Unlimited", "Unlimited"],
    ["Connected accounts", "3", "5", "5"],
    ["AI Financial Assistant", "×", "✓", "✓"],
    ["Budget tracking", "Basic", "Advanced", "Advanced"],
    ["Analytics & charts", "Basic", "Full", "Full"],
    ["Export CSV / Excel", "×", "✓", "✓"],
    ["Multi-currency", "×", "✓", "✓"],
    ["Custom categories", "×", "✓", "✓"],
    ["Budget alerts / notifications", "×", "✓", "✓"],
    ["PDF financial reports", "×", "×", "✓"],
    ["Tax summary export", "×", "×", "✓"],
    ["Family sharing", "×", "×", "Up to 5"],
    ["Support", "Standard", "Priority", "Dedicated"],
  ];

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
        <div style={{ opacity: 0.76, fontSize: "14px", fontWeight: "600" }}>April 2026</div>

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

      <div style={heroCard}>
        <div style={{ fontSize: "46px", marginBottom: "8px" }}>👑</div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "999px",
            background: "rgba(147,51,234,0.28)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "13px",
            fontWeight: "800",
            marginBottom: "16px",
          }}
        >
          • MONY PRO
        </div>

        <div
          style={{
            fontSize: "60px",
            lineHeight: 0.95,
            fontWeight: "900",
            letterSpacing: "-0.04em",
            maxWidth: "860px",
            margin: "0 auto 18px",
          }}
        >
          Your finances,
          <br />
          supercharged
        </div>

        <div
          style={{
            opacity: 0.88,
            fontSize: "22px",
            lineHeight: 1.55,
            maxWidth: "980px",
            margin: "0 auto",
          }}
        >
          Unlock AI-powered insights, unlimited tracking, multi-currency support
          <br />
          and premium features built for serious savers.
        </div>
      </div>

      <div style={pricingGrid}>
        <div style={priceCard("free")}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "800", marginBottom: "18px" }}>FREE</div>
            <div style={{ fontSize: "62px", fontWeight: "900", lineHeight: 0.9 }}>RM</div>
            <div style={{ fontSize: "82px", fontWeight: "900", lineHeight: 0.95 }}>0</div>
            <div style={{ fontSize: "22px", opacity: 0.9, marginBottom: "22px" }}>/month</div>

            <div style={{ display: "grid", gap: "12px", fontSize: "16px" }}>
              {freeFeatures.map((item, i) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    opacity: i < 5 ? 1 : 0.35,
                  }}
                >
                  <span style={{ color: i < 5 ? "#c4b5fd" : "rgba(255,255,255,0.25)", fontWeight: "900" }}>
                    {i < 5 ? "✓" : "×"}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            style={buttonStyle("light")}
            onMouseDown={() => setPressedBtn("free")}
            onMouseUp={() => {
              setPressedBtn("");
              updatePlan("Free");
            }}
            onMouseLeave={() => setPressedBtn("")}
          >
            ✓ Current Plan
          </button>
        </div>

        <div style={priceCard("pro")}>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: "800" }}>PRO</div>
              <div
                style={{
                  background: "rgba(255,255,255,0.18)",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "800",
                }}
              >
                Most Popular
              </div>
            </div>

            <div style={{ fontSize: "62px", fontWeight: "900", lineHeight: 0.9 }}>RM</div>
            <div style={{ fontSize: "82px", fontWeight: "900", lineHeight: 0.95 }}>19</div>
            <div style={{ fontSize: "22px", opacity: 0.95, marginBottom: "22px" }}>/month</div>

            <div style={{ display: "grid", gap: "12px", fontSize: "16px" }}>
              {proFeatures.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: "#f0abfc", fontWeight: "900" }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            style={buttonStyle("pro")}
            onMouseDown={() => setPressedBtn("pro")}
            onMouseUp={() => {
              setPressedBtn("");
              updatePlan("Pro");
            }}
            onMouseLeave={() => setPressedBtn("")}
          >
            Get Pro →
          </button>
        </div>

        <div style={priceCard("yearly")}>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#fde047" }}>PRO YEARLY</div>
              <div
                style={{
                  background: "rgba(253,224,71,0.22)",
                  color: "#fff08a",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "800",
                }}
              >
                Save 30%
              </div>
            </div>

            <div style={{ fontSize: "62px", fontWeight: "900", lineHeight: 0.9, color: "#fde047" }}>RM</div>
            <div style={{ fontSize: "82px", fontWeight: "900", lineHeight: 0.95, color: "#fde047" }}>159</div>
            <div style={{ fontSize: "22px", color: "#fff7b2", marginBottom: "8px" }}>/year</div>
            <div style={{ fontSize: "15px", color: "#fff2a6", marginBottom: "22px", fontWeight: "700" }}>
              ≈ RM 13.25/month • save RM 69/yr
            </div>

            <div style={{ display: "grid", gap: "12px", fontSize: "16px", color: "rgba(255,244,170,0.88)" }}>
              {yearlyFeatures.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: "#fde047", fontWeight: "900" }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            style={buttonStyle("yellow")}
            onMouseDown={() => setPressedBtn("yearly")}
            onMouseUp={() => {
              setPressedBtn("");
              updatePlan("Yearly");
            }}
            onMouseLeave={() => setPressedBtn("")}
          >
            Get Yearly →
          </button>
        </div>
      </div>

      <div style={featureTable}>
        <div
          style={{
            padding: "20px 20px 10px",
            fontSize: "24px",
            fontWeight: "900",
          }}
        >
          Full Feature Comparison
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
          <thead>
            <tr>
              <th style={{ ...tableCell, textAlign: "left", opacity: 0.78 }}>FEATURE</th>
              <th style={{ ...tableCell, textAlign: "center", opacity: 0.78 }}>FREE</th>
              <th style={{ ...tableCell, textAlign: "center", opacity: 0.78 }}>PRO</th>
              <th style={{ ...tableCell, textAlign: "center", opacity: 0.9, color: "#fde047" }}>YEARLY</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row[0]}>
                <td style={{ ...tableCell, fontWeight: "700" }}>{row[0]}</td>
                <td style={{ ...tableCell, textAlign: "center" }}>{row[1]}</td>
                <td style={{ ...tableCell, textAlign: "center" }}>{row[2]}</td>
                <td style={{ ...tableCell, textAlign: "center", color: "#fde047", fontWeight: "700" }}>
                  {row[3]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "18px",
          marginBottom: "22px",
        }}
      >
        <div style={benefitBox}>
          <div style={{ fontSize: "34px", marginBottom: "10px" }}>🔒</div>
          <div style={{ fontWeight: "800", fontSize: "20px", marginBottom: "6px" }}>Bank-level Security</div>
          <div style={{ opacity: 0.75, lineHeight: 1.5 }}>256-bit SSL encryption</div>
        </div>

        <div style={benefitBox}>
          <div style={{ fontSize: "34px", marginBottom: "10px" }}>⚡</div>
          <div style={{ fontWeight: "800", fontSize: "20px", marginBottom: "6px" }}>Instant Activation</div>
          <div style={{ opacity: 0.75, lineHeight: 1.5 }}>Start in under 60 seconds</div>
        </div>

        <div style={benefitBox}>
          <div style={{ fontSize: "34px", marginBottom: "10px" }}>🔁</div>
          <div style={{ fontWeight: "800", fontSize: "20px", marginBottom: "6px" }}>Cancel Anytime</div>
          <div style={{ opacity: 0.75, lineHeight: 1.5 }}>No contracts, no hassle</div>
        </div>

        <div style={benefitBox}>
          <div style={{ fontSize: "34px", marginBottom: "10px" }}>💬</div>
          <div style={{ fontWeight: "800", fontSize: "20px", marginBottom: "6px" }}>24/7 Support</div>
          <div style={{ opacity: 0.75, lineHeight: 1.5 }}>Real humans, fast replies</div>
        </div>
      </div>

      <div style={finalCard}>
        <div
          style={{
            fontSize: "52px",
            fontWeight: "900",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            marginBottom: "16px",
          }}
        >
          Ready to take control of your
          <br />
          money?
        </div>

        <div style={{ opacity: 0.84, fontSize: "20px", marginBottom: "22px" }}>
          Join thousands of Malaysians who trust Mony Pro to manage their finances.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "12px",
          }}
        >
          <button
            style={{
              ...buttonStyle("light"),
              width: "260px",
            }}
            onMouseDown={() => setPressedBtn("free")}
            onMouseUp={() => {
              setPressedBtn("");
              updatePlan("Pro");
            }}
            onMouseLeave={() => setPressedBtn("")}
          >
            Get Pro — RM 19/mo →
          </button>

          <button
            style={{
              ...buttonStyle("yellow"),
              width: "300px",
            }}
            onMouseDown={() => setPressedBtn("yearly")}
            onMouseUp={() => {
              setPressedBtn("");
              updatePlan("Yearly");
            }}
            onMouseLeave={() => setPressedBtn("")}
          >
            Get Yearly — RM 159/yr 🔥
          </button>
        </div>

        <div style={{ opacity: 0.6, fontSize: "14px" }}>
          Cancel anytime • Secure payment via Stripe • Malaysian ringgit pricing
        </div>
      </div>
    </>
  );
}

export default GetPro;
