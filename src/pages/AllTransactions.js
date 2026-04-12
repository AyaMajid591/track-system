import { useNavigate } from "react-router-dom";

function AllAccountTransactions() {
  const navigate = useNavigate();

  const box = {
    background: "linear-gradient(180deg, rgba(44,24,82,0.9), rgba(23,17,56,0.9))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "18px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.35)",
  };

  const items = [
    { icon: "⚡", title: "Water Bill", sub: "Bills & Utilities • 2026-04-07", amount: "-28.40", color: "#fda4af" },
    { icon: "🏠", title: "Fixed Deposit", sub: "Savings • 2026-04-07 • Emergency fund", amount: "-1,000.00", color: "#fda4af" },
    { icon: "📄", title: "ASB Investment", sub: "Investment • 2026-04-06 • Monthly top-up", amount: "-500.00", color: "#fda4af" },
    { icon: "📄", title: "Dividend Income", sub: "Investment • 2026-04-05 • KLCI dividend", amount: "+350.00", color: "#86efac" },
    { icon: "⚡", title: "TNB Electricity Bill", sub: "Bills & Utilities • 2026-04-03 • March usage", amount: "-187.50", color: "#fda4af" },
    { icon: "🚗", title: "Grab Ride to KLCC", sub: "Transport • 2026-04-02", amount: "-24.00", color: "#fda4af" },
    { icon: "💼", title: "Monthly Salary", sub: "Salary • 2026-04-01 • April payroll", amount: "+4,500.00", color: "#86efac" },
  ];

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
            7 total • tap any to view detail
          </div>
        </div>

        {items.map((item) => (
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

export default AllAccountTransactions;