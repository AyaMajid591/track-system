import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiRequest } from "../authService";


function Notifications() {
  const navigate = useNavigate();
  const [pressedBtn, setPressedBtn] = useState("");
  const [message, setMessage] = useState("");

  const [settings, setSettings] = useState({
    budgetAlerts: true,
    weeklySummary: true,
    largeTransactions: false,
    billReminders: true,
    newLogin: true,
    promotions: false,
  });

  useEffect(() => {
    apiRequest("/notifications/preferences")
      .then((data) => setSettings(data.settings))
      .catch((err) => setMessage(err.message || "Could not load preferences"));
  }, []);

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
    padding: "0",
    overflow: "hidden",
    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
    marginBottom: "18px",
  };

  const saveButtonStyle = {
    width: "100%",
    background: "linear-gradient(90deg, #a855f7, #7c3aed, #9333ea)",
    border: "none",
    color: "white",
    borderRadius: "16px",
    padding: "16px 18px",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.12s ease",
    transform: pressedBtn === "save" ? "scale(0.98)" : "scale(1)",
    boxShadow: "0 0 22px rgba(168,85,247,0.28)",
  };

  const toggleTrack = {
    width: "48px",
    height: "28px",
    borderRadius: "999px",
    position: "relative",
    transition: "all 0.2s ease",
    cursor: "pointer",
    flexShrink: 0,
  };

  const toggleThumb = {
    position: "absolute",
    top: "3px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "white",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  };

  const rowStyle = (key) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 22px",
    borderBottom:
      key !== "promotions" ? "1px solid rgba(255,255,255,0.07)" : "none",
    background: pressedBtn === key ? "rgba(168,85,247,0.08)" : "transparent",
    transition: "all 0.12s ease",
  });

  const toggleSetting = (key) => {
    setPressedBtn(key);
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setTimeout(() => setPressedBtn(""), 120);
  };

  const savePreferences = async () => {
    try {
      await apiRequest("/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify({ settings }),
      });
      setMessage("Notification preferences saved!");
    } catch (err) {
      setMessage(err.message || "Could not save preferences");
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
          <div
            style={{ opacity: 0.76, fontSize: "14px", fontWeight: "600" }}
          >
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
          Notifications
        </div>
        <div style={{ opacity: 0.82, fontSize: "18px" }}>
          Choose what alerts and reminders you want to receive.
        </div>
      </div>

      <div style={card}>
        <div style={rowStyle("budgetAlerts")}>
          <div>
            <div
              style={{
                fontWeight: "900",
                fontSize: "17px",
                marginBottom: "4px",
              }}
            >
              Budget Alerts
            </div>
            <div style={{ opacity: 0.75, fontSize: "15px" }}>
              Notify when approaching budget limit
            </div>
          </div>

          <div
            onClick={() => toggleSetting("budgetAlerts")}
            style={{
              ...toggleTrack,
              background: settings.budgetAlerts
                ? "linear-gradient(90deg, #a855f7, #9333ea)"
                : "rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                ...toggleThumb,
                left: settings.budgetAlerts ? "23px" : "3px",
              }}
            />
          </div>
        </div>

        <div style={rowStyle("weeklySummary")}>
          <div>
            <div
              style={{
                fontWeight: "900",
                fontSize: "17px",
                marginBottom: "4px",
              }}
            >
              Weekly Summary
            </div>
            <div style={{ opacity: 0.75, fontSize: "15px" }}>
              Get a weekly spending recap
            </div>
          </div>

          <div
            onClick={() => toggleSetting("weeklySummary")}
            style={{
              ...toggleTrack,
              background: settings.weeklySummary
                ? "linear-gradient(90deg, #a855f7, #9333ea)"
                : "rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                ...toggleThumb,
                left: settings.weeklySummary ? "23px" : "3px",
              }}
            />
          </div>
        </div>

        <div style={rowStyle("largeTransactions")}>
          <div>
            <div
              style={{
                fontWeight: "900",
                fontSize: "17px",
                marginBottom: "4px",
              }}
            >
              Large Transactions
            </div>
            <div style={{ opacity: 0.75, fontSize: "15px" }}>
              Alert for transactions over RM 200
            </div>
          </div>

          <div
            onClick={() => toggleSetting("largeTransactions")}
            style={{
              ...toggleTrack,
              background: settings.largeTransactions
                ? "linear-gradient(90deg, #a855f7, #9333ea)"
                : "rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                ...toggleThumb,
                left: settings.largeTransactions ? "23px" : "3px",
              }}
            />
          </div>
        </div>

        <div style={rowStyle("billReminders")}>
          <div>
            <div
              style={{
                fontWeight: "900",
                fontSize: "17px",
                marginBottom: "4px",
              }}
            >
              Bill Reminders
            </div>
            <div style={{ opacity: 0.75, fontSize: "15px" }}>
              Remind 3 days before due date
            </div>
          </div>

          <div
            onClick={() => toggleSetting("billReminders")}
            style={{
              ...toggleTrack,
              background: settings.billReminders
                ? "linear-gradient(90deg, #a855f7, #9333ea)"
                : "rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                ...toggleThumb,
                left: settings.billReminders ? "23px" : "3px",
              }}
            />
          </div>
        </div>

        <div style={rowStyle("newLogin")}>
          <div>
            <div
              style={{
                fontWeight: "900",
                fontSize: "17px",
                marginBottom: "4px",
              }}
            >
              New Login
            </div>
            <div style={{ opacity: 0.75, fontSize: "15px" }}>
              Security alert for new device logins
            </div>
          </div>

          <div
            onClick={() => toggleSetting("newLogin")}
            style={{
              ...toggleTrack,
              background: settings.newLogin
                ? "linear-gradient(90deg, #a855f7, #9333ea)"
                : "rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                ...toggleThumb,
                left: settings.newLogin ? "23px" : "3px",
              }}
            />
          </div>
        </div>

        <div style={rowStyle("promotions")}>
          <div>
            <div
              style={{
                fontWeight: "900",
                fontSize: "17px",
                marginBottom: "4px",
              }}
            >
              Promotions
            </div>
            <div style={{ opacity: 0.75, fontSize: "15px" }}>
              Tips, offers, and product updates
            </div>
          </div>

          <div
            onClick={() => toggleSetting("promotions")}
            style={{
              ...toggleTrack,
              background: settings.promotions
                ? "linear-gradient(90deg, #a855f7, #9333ea)"
                : "rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                ...toggleThumb,
                left: settings.promotions ? "23px" : "3px",
              }}
            />
          </div>
        </div>
      </div>

      <button
        style={saveButtonStyle}
        onMouseDown={() => setPressedBtn("save")}
        onMouseUp={() => {
          setPressedBtn("");
          savePreferences();
        }}
        onMouseLeave={() => setPressedBtn("")}
      >
        Save Preferences →
      </button>
    </>
  );
}

export default Notifications;
