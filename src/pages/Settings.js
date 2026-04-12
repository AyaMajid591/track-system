import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AppShell from "../components/AppShell";

function Settings() {
  const navigate = useNavigate();
  const [pressedCard, setPressedCard] = useState("");

  const pageCard = {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "26px",
    padding: "18px",
    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
  };

  const infoBox = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "18px",
    padding: "18px",
  };

  const menuCard = (key, active) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    padding: "16px 18px",
    borderRadius: "18px",
    marginBottom: "12px",
    cursor: "pointer",
    transition: "all 0.12s ease",
    transform: pressedCard === key ? "scale(0.98)" : "scale(1)",
    background: active
      ? "linear-gradient(90deg, rgba(251,146,60,0.22), rgba(236,72,153,0.18))"
      : "rgba(255,255,255,0.04)",
    border: active
      ? "1px solid rgba(255,255,255,0.16)"
      : "1px solid rgba(255,255,255,0.06)",
    boxShadow: active ? "0 0 18px rgba(236,72,153,0.12)" : "none",
  });

  const iconWrap = (bg) => ({
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  });

  const openPage = (key, path) => {
    setPressedCard(key);
    setTimeout(() => {
      setPressedCard("");
      navigate(path);
    }, 120);
  };

  return (
    <AppShell title="Settings" subtitle="April 2026">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "22px",
          alignItems: "start",
        }}
      >
        <div style={pageCard}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: "999px",
              background: "rgba(168,85,247,0.18)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "12px",
              fontWeight: "800",
              marginBottom: "14px",
            }}
          >
            Account Info
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div style={infoBox}>
              <div style={{ opacity: 0.72, fontSize: "12px", fontWeight: "800", marginBottom: "8px" }}>
                Current Plan
              </div>
              <div style={{ fontSize: "42px", fontWeight: "900", lineHeight: 1 }}>Pro</div>
              <div style={{ opacity: 0.8 }}>Track Pro subscription</div>
            </div>

            <div style={infoBox}>
              <div style={{ opacity: 0.72, fontSize: "12px", fontWeight: "800", marginBottom: "8px" }}>
                Member Since
              </div>
              <div style={{ fontSize: "42px", fontWeight: "900", lineHeight: 1 }}>2026</div>
              <div style={{ opacity: 0.8 }}>April account</div>
            </div>
          </div>

          <div style={infoBox}>
            <div style={{ opacity: 0.72, fontSize: "12px", fontWeight: "800", marginBottom: "14px" }}>
              Personal Overview
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "14px",
                padding: "14px 16px",
                marginBottom: "12px",
              }}
            >
              <div style={{ opacity: 0.65, fontSize: "12px", marginBottom: "4px" }}>Full Name</div>
              <div style={{ fontWeight: "700" }}>Aya</div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "14px",
                padding: "14px 16px",
                marginBottom: "12px",
              }}
            >
              <div style={{ opacity: 0.65, fontSize: "12px", marginBottom: "4px" }}>Email</div>
              <div style={{ fontWeight: "700" }}>ayariahi954@gmail.com</div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "14px",
                padding: "14px 16px",
              }}
            >
              <div style={{ opacity: 0.65, fontSize: "12px", marginBottom: "4px" }}>Phone</div>
              <div style={{ fontWeight: "700" }}>+60 123 456 789</div>
            </div>
          </div>
        </div>

        <div style={pageCard}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "18px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: "linear-gradient(180deg, #f5d0fe, #d8b4fe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#5b21b6",
                fontWeight: "900",
              }}
            >
              A
            </div>

            <div>
              <div style={{ fontWeight: "900", fontSize: "24px", lineHeight: 1 }}>Aya</div>
              <div style={{ opacity: 0.75 }}>Smart Finance Manager</div>
            </div>
          </div>

          <div
            onClick={() => openPage("profile", "/profile-details")}
            style={menuCard("profile", true)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={iconWrap("linear-gradient(180deg, #7dd3fc, #38bdf8)")}>👤</div>
              <div>
                <div style={{ fontWeight: "800" }}>Profile</div>
                <div style={{ opacity: 0.7, fontSize: "13px" }}>Personal information and account data</div>
              </div>
            </div>
            <div>›</div>
          </div>

          <div
            onClick={() => openPage("notifications", "/notifications")}
            style={menuCard("notifications", false)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={iconWrap("linear-gradient(180deg, #f9a8d4, #fb7185)")}>🔔</div>
              <div>
                <div style={{ fontWeight: "800" }}>Notifications</div>
                <div style={{ opacity: 0.7, fontSize: "13px" }}>Alerts and reminders</div>
              </div>
            </div>
            <div>›</div>
          </div>

          <div
            onClick={() => openPage("payment", "/payment-methods")}
            style={menuCard("payment", false)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={iconWrap("linear-gradient(180deg, #a7f3d0, #6ee7b7)")}>💳</div>
              <div>
                <div style={{ fontWeight: "800" }}>Payment Methods</div>
                <div style={{ opacity: 0.7, fontSize: "13px" }}>Cards and bank accounts</div>
              </div>
            </div>
            <div>›</div>
          </div>

          <div
            onClick={() => openPage("scheduled", "/scheduled-payments")}
            style={menuCard("scheduled", false)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={iconWrap("linear-gradient(180deg, #ddd6fe, #c4b5fd)")}>📅</div>
              <div>
                <div style={{ fontWeight: "800" }}>Scheduled Payments</div>
                <div style={{ opacity: 0.7, fontSize: "13px" }}>Bills and recurring payments</div>
              </div>
            </div>
            <div>›</div>
          </div>

          <div
            onClick={() => openPage("pro", "/get-pro")}
            style={menuCard("pro", false)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={iconWrap("linear-gradient(180deg, #fdba74, #f59e0b)")}>👑</div>
              <div>
                <div style={{ fontWeight: "800" }}>Get Pro</div>
                <div style={{ opacity: 0.7, fontSize: "13px" }}>Upgrade to premium features</div>
              </div>
            </div>
            <div>›</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default Settings;