import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../authService";

function AIAssistant() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I’m your AI finance assistant in Track System. I can help you with budgeting, expense analysis, and financial advice. What would you like to know?"
    }
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    const currentInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const data = await apiRequest("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: currentInput }),
      });
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: err.message || "I could not read your finance data right now." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #8b1cf7 0%, #5b21b6 20%, #1e1b4b 55%, #0b1026 100%)",
    color: "white",
    padding: "24px",
    fontFamily: "Poppins, sans-serif"
  };

  const topButton = {
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "white",
    padding: "10px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "600",
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 14px rgba(168,85,247,0.35)"
  };

  const glassCard = {
    background: "rgba(22, 30, 78, 0.82)",
    borderRadius: "22px",
    padding: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 0 20px rgba(162, 89, 255, 0.28)"
  };

  return (
    <div style={pageStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginBottom: "20px"
        }}
      >
        <button style={topButton} onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>
        <button style={topButton} onClick={() => navigate("/transactions")}>
          Transactions
        </button>
        <button style={topButton} onClick={() => navigate("/statistics")}>
          Statistics
        </button>
        <button style={topButton} onClick={() => navigate("/profile")}>
          Profile
        </button>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "20px"
        }}
      >
        {/* LEFT PANEL */}
        <div style={glassCard}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              background: "linear-gradient(180deg,#f5b6ff,#d946ef)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              marginBottom: "14px"
            }}
          >
            🤖
          </div>

          <h2 style={{ marginBottom: "8px" }}>AI Assistant</h2>
          <p style={{ opacity: 0.8, lineHeight: 1.6, fontSize: "14px" }}>
            Ask about budgeting, savings, expenses, categories, and spending habits.
          </p>

          <div style={{ marginTop: "20px" }}>
            <div style={{ ...glassCard, marginBottom: "12px", padding: "14px" }}>
              <strong>Quick Help</strong>
              <p style={{ marginTop: "8px", opacity: 0.75, fontSize: "13px" }}>
                Budget tips
              </p>
            </div>

            <div style={{ ...glassCard, marginBottom: "12px", padding: "14px" }}>
              <strong>Quick Help</strong>
              <p style={{ marginTop: "8px", opacity: 0.75, fontSize: "13px" }}>
                Expense analysis
              </p>
            </div>

            <div style={{ ...glassCard, padding: "14px" }}>
              <strong>Quick Help</strong>
              <p style={{ marginTop: "8px", opacity: 0.75, fontSize: "13px" }}>
                Saving advice
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT CHAT PANEL */}
        <div
          style={{
            ...glassCard,
            display: "flex",
            flexDirection: "column",
            minHeight: "75vh"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              paddingBottom: "14px",
              borderBottom: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  background: "linear-gradient(180deg,#f4b6ff,#d946ef)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px"
                }}
              >
                ✨
              </div>
              <div>
                <div style={{ fontWeight: "800", fontSize: "18px" }}>
                  Track AI Assistant
                </div>
                <div style={{ color: "#7CFF9C", fontSize: "12px" }}>● Online</div>
              </div>
            </div>

            <div style={{ opacity: 0.7 }}>Smart Finance Helper</div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              paddingRight: "6px"
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "70%",
                  background:
                    msg.sender === "user"
                      ? "linear-gradient(90deg, #9333EA, #EC4899)"
                      : "linear-gradient(180deg, rgba(202,73,255,0.95), rgba(118,44,255,0.9))",
                  borderRadius: "18px",
                  padding: "14px 16px",
                  boxShadow: "0 0 18px rgba(217,70,239,0.25)",
                  lineHeight: 1.5
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              gap: "10px",
              alignItems: "center"
            }}
          >
            <input
              type="text"
              placeholder="Ask me about finance..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)",
                outline: "none",
                background: "rgba(255,255,255,0.08)",
                color: "white"
              }}
            />

            <button
              onClick={sendMessage}
              disabled={isSending}
              style={{
                background: "linear-gradient(90deg, #9333EA, #EC4899)",
                border: "none",
                padding: "14px 20px",
                borderRadius: "16px",
                color: "white",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 0 12px rgba(236,72,153,0.35)"
              }}
            >
              {isSending ? "Thinking..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
