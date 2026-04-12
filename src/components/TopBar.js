function TopBar({ title, subtitle, rightAction }) {
  const row = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  };

  const searchWrap = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  };

  const searchBox = {
    width: "260px",
    maxWidth: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "12px 16px",
    color: "white",
    outline: "none",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
  };

  const actionButton = {
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    border: "none",
    color: "white",
    fontWeight: 700,
    padding: "12px 18px",
    borderRadius: "16px",
    cursor: "pointer",
    boxShadow: "0 0 18px rgba(236,72,153,0.28)",
  };

  return (
    <div style={row}>
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "34px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
          }}
        >
          {title}
        </h1>
        <div style={{ marginTop: "4px", opacity: 0.75 }}>{subtitle}</div>
      </div>

      <div style={searchWrap}>
        <input type="text" placeholder="Search..." style={searchBox} />
        {rightAction ? (
          rightAction
        ) : (
          <button style={actionButton}>+ New Transaction</button>
        )}
      </div>
    </div>
  );
}

export default TopBar;