import { NavLink } from "react-router-dom";

function Sidebar() {
  const wrapper = {
    padding: "22px 18px",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(7, 5, 20, 0.55)",
    backdropFilter: "blur(16px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const brandCard = {
    background:
      "linear-gradient(180deg, rgba(168,85,247,0.22), rgba(99,102,241,0.08))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "22px",
    padding: "18px",
    boxShadow: "0 0 30px rgba(168,85,247,0.18)",
    marginBottom: "24px",
  };

  const menu = [
    { label: "Dashboard", path: "/dashboard", icon: "⌂" },
    { label: "Transactions", path: "/transactions", icon: "☰" },
    { label: "Analytics", path: "/statistics", icon: "◫" },
    { label: "Accounts", path: "/accounts", icon: "▣" },
    { label: "Budgets", path: "/budgets", icon: "◌" },
    { label: "Settings", path: "/profile", icon: "⚙" },
    { label: "AI Assistant", path: "/ai-assistant", icon: "✦" },
  ];

  const getLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "16px",
    marginBottom: "10px",
    background: isActive
      ? "linear-gradient(90deg, rgba(147,51,234,0.9), rgba(236,72,153,0.88))"
      : "rgba(255,255,255,0.03)",
    border: isActive
      ? "1px solid rgba(255,255,255,0.15)"
      : "1px solid rgba(255,255,255,0.05)",
    color: "white",
    fontWeight: 600,
    boxShadow: isActive ? "0 0 20px rgba(236,72,153,0.28)" : "none",
    transition: "all 0.25s ease",
  });

  const userBox = {
    marginTop: "18px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "18px",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const avatar = {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #c084fc, #ec4899)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  };

  return (
    <aside style={wrapper}>
      <div>
        <div style={brandCard}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              boxShadow: "0 0 18px rgba(236,72,153,0.35)",
              marginBottom: "14px",
            }}
          >
            💎
          </div>

          <div style={{ fontSize: "30px", fontWeight: 800, lineHeight: 1 }}>
            Track
          </div>
          <div style={{ fontSize: "15px", opacity: 0.8, marginTop: "6px" }}>
            Smart Finance Manager
          </div>
        </div>

        <nav>
          {menu.map((item) => (
            <NavLink key={item.path} to={item.path} style={getLinkStyle}>
              <span style={{ width: "18px", textAlign: "center" }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={userBox}>
        <div style={avatar}>A</div>
        <div>
          <div style={{ fontWeight: 700 }}>Aya</div>
          <div style={{ fontSize: "13px", opacity: 0.7 }}>Free Plan</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;