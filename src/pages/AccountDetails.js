import { useNavigate, useParams } from "react-router-dom";

function AccountDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const accountMap = {
    maybank: {
      title: "Maybank Savings",
      subtitle: "Maybank Berhad - Savings Account",
      amount: "3,110.10",
      accountNumber: "** 4821",
      bg: "linear-gradient(135deg,#d97706,#f59e0b)",
      totalIn: "4,850.00",
      totalOut: "1,739.90",
      transactions: "7",
      netFlow: "3,110.10",
      items: [
        { icon: "⚡", title: "Water Bill", sub: "Bills & Utilities • 2026-04-07", amount: "-28.40", color: "#fda4af" },
        { icon: "🏠", title: "Fixed Deposit", sub: "Savings • 2026-04-07 • Emergency fund", amount: "-1,000.00", color: "#fda4af" },
        { icon: "📄", title: "ASB Investment", sub: "Investment • 2026-04-06 • Monthly top-up", amount: "-500.00", color: "#fda4af" },
        { icon: "📄", title: "Dividend Income", sub: "Investment • 2026-04-05 • KLCI dividend", amount: "+350.00", color: "#86efac" },
        { icon: "⚡", title: "TNB Electricity Bill", sub: "Bills & Utilities • 2026-04-03 • March usage", amount: "-187.50", color: "#fda4af" },
        { icon: "🚗", title: "Grab Ride to KLCC", sub: "Transport • 2026-04-02", amount: "-24.00", color: "#fda4af" },
        { icon: "💼", title: "Monthly Salary", sub: "Salary • 2026-04-01 • April payroll", amount: "+4,500.00", color: "#86efac" },
      ],
    },
    cimb: {
      title: "CIMB Clicks",
      subtitle: "CIMB Bank - Main Account",
      amount: "1,111.60",
      accountNumber: "** 2934",
      bg: "linear-gradient(135deg,#0284c7,#2563eb)",
      totalIn: "1,200.00",
      totalOut: "88.40",
      transactions: "4",
      netFlow: "1,111.60",
      items: [
        { icon: "🍜", title: "Lunch at Pavilion", sub: "Food & Dining • 2026-04-06", amount: "-45.50", color: "#fda4af" },
        { icon: "🎬", title: "Netflix + Spotify", sub: "Entertainment • 2026-04-05", amount: "-42.90", color: "#fda4af" },
        { icon: "🛍️", title: "Uniqlo Haul", sub: "Shopping • 2026-04-04", amount: "-245.90", color: "#fda4af" },
        { icon: "💼", title: "Freelance Project", sub: "Salary • 2026-04-01", amount: "+1,200.00", color: "#86efac" },
      ],
    },
    cash: {
      title: "Cash Wallet",
      subtitle: "Physical Wallet",
      amount: "176.30",
      accountNumber: "Physical",
      bg: "linear-gradient(135deg,#15803d,#22c55e)",
      totalIn: "300.00",
      totalOut: "123.70",
      transactions: "3",
      netFlow: "176.30",
      items: [
        { icon: "🚗", title: "Touch n Go Reload", sub: "Transport • 2026-04-05", amount: "-100.00", color: "#fda4af" },
        { icon: "💊", title: "Guardian Pharmacy", sub: "Health • 2026-04-04", amount: "-67.80", color: "#fda4af" },
        { icon: "🍜", title: "Nasi Lemak Breakfast", sub: "Food & Dining • 2026-04-01", amount: "-8.50", color: "#fda4af" },
      ],
    },
  };

  const data = accountMap[id] || accountMap.maybank;

  const box = {
    background: "linear-gradient(180deg, rgba(44,24,82,0.9), rgba(23,17,56,0.9))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "18px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.35)",
  };

  const statCard = {
    ...box,
    minHeight: "110px",
  };

  const months = [
    { label: "Oct", height: 8 },
    { label: "Nov", height: 8 },
    { label: "Dec", height: 8 },
    { label: "Jan", height: 8 },
    { label: "Feb", height: 8 },
    { label: "Mar", height: 8 },
    { label: "Apr", height: 120 },
  ];

  return (
    <>
      <div style={{ marginBottom: "18px" }}>
        <div style={{ fontSize: "28px", fontWeight: "800" }}>Accounts</div>
        <div style={{ opacity: 0.6 }}>April 2026</div>
      </div>

      <button
        onClick={() => navigate("/accounts")}
        style={{
          background: "none",
          border: "none",
          color: "white",
          opacity: 0.75,
          marginBottom: "14px",
          cursor: "pointer",
          padding: 0,
        }}
      >
        ← Back to Accounts
      </button>

      <div
        style={{
          background: data.bg,
          borderRadius: "26px",
          padding: "24px",
          color: "white",
          marginBottom: "18px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-20px",
            top: "-10px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ fontSize: "34px", fontWeight: "800", lineHeight: 1 }}>
              {data.title}
            </div>
            <div style={{ marginTop: "6px", opacity: 0.9 }}>{data.subtitle}</div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.18)",
              borderRadius: "999px",
              padding: "8px 14px",
              fontWeight: "700",
            }}
          >
            Active
          </div>
        </div>

        <div style={{ marginTop: "22px", fontSize: "12px", opacity: 0.85, fontWeight: "700" }}>
          CURRENT BALANCE
        </div>
        <div style={{ fontSize: "24px", marginTop: "8px", fontWeight: "800" }}>MYR</div>
        <div style={{ fontSize: "54px", fontWeight: "800", lineHeight: 1 }}>{data.amount}</div>

        <div style={{ marginTop: "14px", opacity: 0.95 }}>
          ● Account number: {data.accountNumber}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <div style={statCard}>
          <div style={{ fontSize: "20px", marginBottom: "10px" }}>↙️</div>
          <div style={{ fontSize: "16px", fontWeight: "800" }}>MYR</div>
          <div style={{ fontSize: "34px", fontWeight: "800", lineHeight: 1 }}>
            {data.totalIn}
          </div>
          <div style={{ marginTop: "8px", opacity: 0.75 }}>Total In</div>
        </div>

        <div style={statCard}>
          <div style={{ fontSize: "20px", marginBottom: "10px" }}>↗️</div>
          <div style={{ fontSize: "16px", fontWeight: "800" }}>MYR</div>
          <div style={{ fontSize: "34px", fontWeight: "800", lineHeight: 1 }}>
            {data.totalOut}
          </div>
          <div style={{ marginTop: "8px", opacity: 0.75 }}>Total Out</div>
        </div>

        <div style={statCard}>
          <div style={{ fontSize: "20px", marginBottom: "10px" }}>▣</div>
          <div style={{ fontSize: "34px", fontWeight: "800", lineHeight: 1 }}>
            {data.transactions}
          </div>
          <div style={{ marginTop: "8px", opacity: 0.75 }}>Transactions</div>
        </div>

        <div style={statCard}>
          <div style={{ fontSize: "20px", marginBottom: "10px" }}>⚖</div>
          <div style={{ fontSize: "16px", fontWeight: "800" }}>MYR</div>
          <div style={{ fontSize: "34px", fontWeight: "800", lineHeight: 1 }}>
            {data.netFlow}
          </div>
          <div style={{ marginTop: "8px", opacity: 0.75 }}>Net Flow</div>
        </div>
      </div>

      <div style={{ ...box, marginBottom: "18px" }}>
        <div style={{ fontSize: "22px", fontWeight: "800", marginBottom: "4px" }}>
          Monthly Net Flow
        </div>
        <div style={{ opacity: 0.7, marginBottom: "18px" }}>
          Income minus expenses per month
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "14px",
            height: "180px",
          }}
        >
          {months.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: item.height + "px",
                  borderRadius: "10px",
                  background: "linear-gradient(180deg, #bbf7d0, #86efac)",
                  boxShadow: item.label === "Apr" ? "0 10px 24px rgba(134,239,172,0.25)" : "none",
                }}
              />
              <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.7 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={box}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "22px", fontWeight: "800" }}>All Transactions</div>
          <div style={{ opacity: 0.75, fontSize: "13px" }}>
            {data.items.length} total • tap any to view detail
          </div>
        </div>

        {data.items.map((item) => (
          <div
            key={item.title}
            style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr auto auto",
              gap: "14px",
              alignItems: "center",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.04)",
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.08)",
                fontSize: "18px",
              }}
            >
              {item.icon}
            </div>

            <div>
              <div style={{ fontWeight: "700", marginBottom: "4px" }}>{item.title}</div>
              <div style={{ opacity: 0.68, fontSize: "13px" }}>{item.sub}</div>
            </div>

            <div style={{ color: item.color, fontWeight: "800", fontSize: "18px" }}>
              {item.amount}
            </div>

            <div style={{ opacity: 0.45, fontWeight: "800" }}>›</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default AccountDetails;