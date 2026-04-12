import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiRequest } from "../authService";

function ProfileDetails() {
  const navigate = useNavigate();

  const [pressedBtn, setPressedBtn] = useState("");
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("Aya");
  const [email, setEmail] = useState("ayariahi954@gmail.com");
  const [phone, setPhone] = useState("+60 123 456 789");
  const [plan, setPlan] = useState("Free");

  useEffect(() => {
    apiRequest("/profile")
      .then((data) => {
        setFullName(data.user.name || "");
        setEmail(data.user.email || "");
        setPhone(data.user.phone || "");
        setPlan(data.user.plan || "Free");
      })
      .catch((err) => setMessage(err.message || "Could not load profile"));
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 2200);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const profileCard = {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
    marginBottom: "20px",
  };

  const infoCard = {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
    marginBottom: "18px",
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    color: "white",
    padding: "14px 16px",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.06em",
    opacity: 0.78,
    marginBottom: "8px",
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
    marginTop: "6px",
    transition: "all 0.12s ease",
    transform: pressedBtn === "save" ? "scale(0.98)" : "scale(1)",
    boxShadow: "0 0 22px rgba(168,85,247,0.28)",
  };

  const deleteButtonStyle = {
    background: "rgba(239,68,68,0.14)",
    border: "1px solid rgba(248,113,113,0.45)",
    color: "#fca5a5",
    borderRadius: "12px",
    padding: "10px 18px",
    fontWeight: "800",
    cursor: "pointer",
    transition: "all 0.12s ease",
    transform: pressedBtn === "delete" ? "scale(0.97)" : "scale(1)",
  };

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

      <div style={profileCard}>
        <div
          style={{
            width: "96px",
            height: "96px",
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: "linear-gradient(180deg, #d8b4fe, #9333ea)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "42px",
            fontWeight: "900",
            color: "white",
            boxShadow: "0 0 30px rgba(168,85,247,0.35)",
          }}
        >
          {(fullName || "U").charAt(0).toUpperCase()}
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "42px",
            fontWeight: "900",
            lineHeight: 1,
            marginBottom: "8px",
          }}
        >
          {fullName || "User"}
        </div>

        <div
          style={{
            textAlign: "center",
            opacity: 0.82,
            fontSize: "16px",
            marginBottom: "14px",
          }}
        >
          {email}
        </div>

        <div style={{ textAlign: "center" }}>
          <span
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(52,211,153,0.35)",
              color: "#86efac",
              fontWeight: "800",
              fontSize: "13px",
            }}
          >
            {plan} Plan • Active
          </span>
        </div>
      </div>

      <div style={infoCard}>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "900",
            marginBottom: "18px",
          }}
        >
          Personal Information
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div style={labelStyle}>FULL NAME</div>
          <input
            style={inputStyle}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div style={labelStyle}>EMAIL ADDRESS</div>
          <input
            style={inputStyle}
            value={email}
            readOnly
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <div style={labelStyle}>PHONE NUMBER</div>
          <input
            style={inputStyle}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button
          style={saveButtonStyle}
          onMouseDown={() => setPressedBtn("save")}
          onMouseUp={() => {
            setPressedBtn("");
            apiRequest("/profile", {
              method: "PUT",
              body: JSON.stringify({ name: fullName, phone }),
            })
              .then(() => setMessage("Changes saved successfully!"))
              .catch((err) => setMessage(err.message || "Could not save profile"));
          }}
          onMouseLeave={() => setPressedBtn("")}
        >
          Save Changes →
        </button>
      </div>

      <div
        style={{
          background: "rgba(239,68,68,0.07)",
          border: "1px solid rgba(248,113,113,0.35)",
          borderRadius: "20px",
          padding: "18px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#f87171",
              fontWeight: "900",
              fontSize: "18px",
              marginBottom: "4px",
            }}
          >
            Delete Account
          </div>
          <div style={{ color: "rgba(255,255,255,0.78)" }}>
            Permanently remove all your data
          </div>
        </div>

        <button
          style={deleteButtonStyle}
          onMouseDown={() => setPressedBtn("delete")}
          onMouseUp={() => {
            setPressedBtn("");
            setMessage("⚠️ Delete action clicked");
          }}
          onMouseLeave={() => setPressedBtn("")}
        >
          Delete
        </button>
      </div>
    </>
  );
}

export default ProfileDetails;
