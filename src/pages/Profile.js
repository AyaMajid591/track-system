import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../authService";
import useResponsive from "../hooks/useResponsive";

function Profile() {
  const navigate = useNavigate();
  const { isMobile, isLargeMobile, isTablet, isPhone } = useResponsive();
  const [user, setUser] = useState(null);

  useEffect(() => {
    apiRequest("/profile")
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  const pageStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 50% 0%, #8b1cf7 0%, #5b21b6 18%, #1e1b4b 45%, #0b1026 100%)",
    color: "white",
    padding: isMobile ? "16px 12px" : isLargeMobile ? "18px 14px" : isTablet ? "22px 18px" : "28px 32px",
    fontFamily: "Poppins, sans-serif",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflowX: "hidden",
  };

  const navButton = {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    padding: "10px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "600",
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 14px rgba(168,85,247,0.25)",
  };

  const glassBig = {
    background: "linear-gradient(180deg, rgba(236,72,153,0.18), rgba(99,102,241,0.08))",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 0 35px rgba(192, 38, 211, 0.28)",
    backdropFilter: "blur(14px)",
    borderRadius: "30px",
  };

  const darkCard = {
    background: "rgba(17, 24, 67, 0.88)",
    border: "1px solid rgba(255,255,255,0.07)",
    boxShadow: "0 0 20px rgba(99, 102, 241, 0.18)",
    borderRadius: "22px",
  };

  const smallStat = {
    ...darkCard,
    padding: "18px",
    minHeight: "110px",
  };

  const rowCard = {
    ...darkCard,
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    marginBottom: "14px",
    transition: "0.2s ease",
    minWidth: 0,
  };

  const iconWrap = (bg) => ({
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "14px",
    boxShadow: "0 0 16px rgba(255,255,255,0.12)",
    flexShrink: 0,
    fontSize: "20px",
  });

  return (
    <div style={pageStyle}>
      <div
        style={{
          width: "100%",
          maxWidth: isPhone ? "100%" : "1400px",
          minWidth: 0,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isPhone ? "repeat(2, minmax(0, 1fr))" : "repeat(4, auto)",
            justifyContent: isPhone ? "stretch" : "flex-end",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <button style={{ ...navButton, width: isPhone ? "100%" : "auto", minWidth: 0, padding: isPhone ? "10px 12px" : navButton.padding }} onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <button style={{ ...navButton, width: isPhone ? "100%" : "auto", minWidth: 0, padding: isPhone ? "10px 12px" : navButton.padding }} onClick={() => navigate("/transactions")}>
            Transactions
          </button>
          <button style={{ ...navButton, width: isPhone ? "100%" : "auto", minWidth: 0, padding: isPhone ? "10px 12px" : navButton.padding }} onClick={() => navigate("/statistics")}>
            Statistics
          </button>
          <button style={{ ...navButton, width: isPhone ? "100%" : "auto", minWidth: 0, padding: isPhone ? "10px 12px" : navButton.padding }} onClick={() => navigate("/ai-assistant")}>
            AI Assistant
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isPhone ? "1fr" : isTablet ? "1fr" : "1.1fr 1.2fr",
            gap: isPhone ? "16px" : "28px",
            alignItems: "start",
            width: "100%",
            minWidth: 0,
          }}
        >
          {/* LEFT SIDE */}
          <div style={{ width: "100%", minWidth: 0 }}>
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  marginBottom: "16px",
                  fontSize: isPhone ? "12px" : "13px",
                  opacity: 0.95,
                }}
              >
                Account Center
              </div>

              <h1
                style={{
                  fontSize: isMobile ? "34px" : isLargeMobile ? "42px" : "52px",
                  lineHeight: 1.02,
                  margin: 0,
                  marginBottom: "14px",
                  fontWeight: 800,
                  letterSpacing: "-1px",
                }}
              >
                Profile
                <br />
                Settings
              </h1>

              <p
                style={{
                  maxWidth: "560px",
                  fontSize: isPhone ? "14px" : "17px",
                  lineHeight: 1.7,
                  opacity: 0.82,
                  margin: 0,
                }}
              >
                Manage your account, subscription, notifications, payment methods,
                and premium features in one place with a polished web dashboard experience.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
                gap: isPhone ? "12px" : "16px",
                marginBottom: "22px",
              }}
            >
              <div style={smallStat}>
                <div style={{ opacity: 0.7, fontSize: "13px", marginBottom: "10px" }}>
                  Current Plan
                </div>
                <div style={{ fontSize: isPhone ? "24px" : "28px", fontWeight: 800 }}>{user?.plan || "Free"}</div>
                <div style={{ marginTop: "8px", color: "#a7f3d0", fontSize: "13px" }}>
                  Ready for upgrade
                </div>
              </div>

              <div style={smallStat}>
                <div style={{ opacity: 0.7, fontSize: "13px", marginBottom: "10px" }}>
                  Member Since
                </div>
                <div style={{ fontSize: isPhone ? "24px" : "28px", fontWeight: 800 }}>
                  {user?.created_at ? new Date(user.created_at).getFullYear() : "2026"}
                </div>
                <div style={{ marginTop: "8px", color: "#c4b5fd", fontSize: "13px" }}>
                  Active account
                </div>
              </div>
            </div>

            <div
              style={{
                ...glassBig,
                padding: isPhone ? "16px" : "22px",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: "13px", opacity: 0.78, marginBottom: "10px" }}>
                PROFILE OVERVIEW
              </div>

              <div
                style={{
                  ...darkCard,
                  padding: "18px",
                  marginBottom: "14px",
                }}
              >
                <div style={{ fontSize: "14px", opacity: 0.7 }}>Full Name</div>
                <div style={{ fontSize: isPhone ? "18px" : "22px", fontWeight: 700, marginTop: "6px", wordBreak: "break-word" }}>
                  {user?.name || "User"}
                </div>
              </div>

              <div
                style={{
                  ...darkCard,
                  padding: "18px",
                  marginBottom: "14px",
                }}
              >
                <div style={{ fontSize: "14px", opacity: 0.7 }}>Email</div>
                <div style={{ fontSize: isPhone ? "15px" : "18px", fontWeight: 600, marginTop: "6px", wordBreak: "break-word" }}>
                  {user?.email || ""}
                </div>
              </div>

              <div
                style={{
                  ...darkCard,
                  padding: "18px",
                }}
              >
                <div style={{ fontSize: "14px", opacity: 0.7 }}>Phone</div>
                <div style={{ fontSize: isPhone ? "15px" : "18px", fontWeight: 600, marginTop: "6px", wordBreak: "break-word" }}>
                  {user?.phone || "Not set"}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              ...glassBig,
              padding: isPhone ? "16px" : "26px",
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isPhone ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isPhone ? "stretch" : "flex-start",
                gap: isPhone ? "12px" : 0,
                marginBottom: "18px",
                minWidth: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "18px",
                    background: "linear-gradient(180deg,#ffd0ff,#ec4899)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    marginRight: "14px",
                    boxShadow: "0 0 18px rgba(236,72,153,0.35)",
                    flexShrink: 0,
                  }}
                >
                  💮
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: isPhone ? "24px" : "32px", fontWeight: 800, lineHeight: 1, wordBreak: "break-word" }}>
                    {user?.name || "Track User"}
                  </div>
                  <div style={{ opacity: 0.75, marginTop: "6px", fontSize: isPhone ? "13px" : "14px" }}>
                    Smart Finance Manager
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                👤
              </div>
            </div>

            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
                fontSize: "12px",
                marginBottom: "18px",
              }}
            >
              • {user?.plan || "Free"} Plan
            </div>

            <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "8px" }}>
              PREMIUM
            </div>

            <div
              onClick={() => navigate("/get-pro")}
              style={{
                ...rowCard,
                background:
                  "linear-gradient(90deg, rgba(255,174,0,0.22), rgba(236,72,153,0.18))",
                flexDirection: isPhone ? "column" : "row",
                alignItems: isPhone ? "flex-start" : "center",
                gap: isPhone ? "12px" : "0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                <div style={iconWrap("linear-gradient(180deg,#ffb347,#f59e0b)")}>
                  🔒
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: isPhone ? "16px" : "18px" }}>Get Pro</div>
                  <div style={{ opacity: 0.72, fontSize: "13px", marginTop: "4px" }}>
                    Unlock premium finance tools
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", alignSelf: isPhone ? "stretch" : "auto", width: isPhone ? "100%" : "auto", justifyContent: isPhone ? "space-between" : "flex-start" }}>
                <span
                  style={{
                    background: "linear-gradient(90deg,#fde047,#f59e0b)",
                    color: "#111827",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  Pro
                </span>
                <span style={{ fontSize: "20px" }}>›</span>
              </div>
            </div>

            <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "8px", marginTop: "18px" }}>
              ACCOUNT
            </div>

            <div style={{ ...rowCard, flexDirection: isPhone ? "column" : "row", alignItems: isPhone ? "flex-start" : "center", gap: isPhone ? "12px" : "0" }} onClick={() => navigate("/profile-details")}>
              <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                <div style={iconWrap("linear-gradient(180deg,#7dd3fc,#38bdf8)")}>👤</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: isPhone ? "16px" : "18px" }}>Profile</div>
                  <div style={{ opacity: 0.72, fontSize: "13px", marginTop: "4px" }}>
                    {user?.name || "User"}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: "20px", alignSelf: isPhone ? "stretch" : "auto", textAlign: isPhone ? "right" : "left" }}>›</span>
            </div>

            <div style={{ ...rowCard, flexDirection: isPhone ? "column" : "row", alignItems: isPhone ? "flex-start" : "center", gap: isPhone ? "12px" : "0" }} onClick={() => navigate("/notifications")}>
              <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                <div style={iconWrap("linear-gradient(180deg,#f9a8d4,#ec4899)")}>🔔</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: isPhone ? "16px" : "18px" }}>Notifications</div>
                  <div style={{ opacity: 0.72, fontSize: "13px", marginTop: "4px" }}>
                    Alerts and reminders
                  </div>
                </div>
              </div>
              <span style={{ fontSize: "20px", alignSelf: isPhone ? "stretch" : "auto", textAlign: isPhone ? "right" : "left" }}>›</span>
            </div>

            <div style={{ ...rowCard, flexDirection: isPhone ? "column" : "row", alignItems: isPhone ? "flex-start" : "center", gap: isPhone ? "12px" : "0" }} onClick={() => navigate("/payment-methods")}>
              <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                <div style={iconWrap("linear-gradient(180deg,#86efac,#22c55e)")}>💳</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: isPhone ? "16px" : "18px" }}>Payment Methods</div>
                  <div style={{ opacity: 0.72, fontSize: "13px", marginTop: "4px" }}>
                    Cards and accounts
                  </div>
                </div>
              </div>
              <span style={{ fontSize: "20px", alignSelf: isPhone ? "stretch" : "auto", textAlign: isPhone ? "right" : "left" }}>›</span>
            </div>

            <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "8px", marginTop: "18px" }}>
              FEATURES
            </div>

            <div style={{ ...rowCard, flexDirection: isPhone ? "column" : "row", alignItems: isPhone ? "flex-start" : "center", gap: isPhone ? "12px" : "0" }} onClick={() => navigate("/scheduled-payments")}>
              <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                <div style={iconWrap("linear-gradient(180deg,#c4b5fd,#8b5cf6)")}>📅</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: isPhone ? "16px" : "18px" }}>Scheduled Payments</div>
                  <div style={{ opacity: 0.72, fontSize: "13px", marginTop: "4px" }}>
                    Bills and recurring payments
                  </div>
                </div>
              </div>
              <span style={{ fontSize: "20px", alignSelf: isPhone ? "stretch" : "auto", textAlign: isPhone ? "right" : "left" }}>›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
