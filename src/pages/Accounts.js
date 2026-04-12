import { useEffect, useState } from "react";
import { apiRequest } from "../authService";

const formatMoney = (value) =>
  "MYR " +
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [accountType, setAccountType] = useState("Bank");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [accountData, txData] = await Promise.all([
        apiRequest("/accounts"),
        apiRequest("/transactions"),
      ]);
      setAccounts(accountData.accounts || []);
      setTransactions((txData.transactions || []).slice(0, 5));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const panel = {
    background: "linear-gradient(180deg, rgba(44,24,82,0.9), rgba(23,17,56,0.9))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  };

  const accountCard = (bg) => ({
    background: bg,
    borderRadius: "24px",
    padding: "22px",
    minHeight: "190px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.10)",
  });

  const input = {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
  };

  const button = {
    background: "linear-gradient(90deg, #9333ea, #ec4899)",
    border: "none",
    color: "white",
    borderRadius: "8px",
    padding: "12px 16px",
    fontWeight: "800",
    cursor: "pointer",
  };

  const addAccount = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await apiRequest("/accounts", {
        method: "POST",
        body: JSON.stringify({ name, balance: Number(balance || 0), account_type: accountType }),
      });
      setName("");
      setBalance("");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteAccount = async (id) => {
    try {
      setError("");
      await apiRequest(`/accounts/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const colors = [
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#2563eb,#0284c7)",
    "linear-gradient(135deg,#22c55e,#15803d)",
    "linear-gradient(135deg,#9333ea,#ec4899)",
  ];

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "28px", fontWeight: "800" }}>Accounts</div>
        <div style={{ opacity: 0.6 }}>Balances from PostgreSQL</div>
      </div>

      {error && <div style={{ ...panel, color: "#fda4af", marginBottom: 18 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "18px", marginBottom: "20px" }}>
        {accounts.map((account, index) => (
          <div key={account.id} style={accountCard(colors[index % colors.length])}>
            <div>{account.account_type}</div>
            <div>
              <div>{account.name}</div>
              <div style={{ fontSize: "34px", fontWeight: "800" }}>{formatMoney(account.balance)}</div>
              <button
                onClick={() => deleteAccount(account.id)}
                style={{
                  marginTop: "12px",
                  background: "rgba(244,63,94,0.14)",
                  border: "1px solid rgba(251,113,133,0.45)",
                  color: "#fecdd3",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontWeight: "800",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={addAccount} style={{ ...panel, marginBottom: 20, display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr auto", gap: 12 }}>
        <input style={input} placeholder="Account name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={input} placeholder="Opening balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
        <select style={input} value={accountType} onChange={(e) => setAccountType(e.target.value)}>
          <option>Bank</option>
          <option>Cash</option>
          <option>Card</option>
          <option>Savings</option>
        </select>
        <button style={button}>Add Account</button>
      </form>

      <div style={panel}>
        <div style={{ fontSize: "20px", fontWeight: "800", marginBottom: "10px" }}>Recent Transactions</div>
        {transactions.length === 0 && <div style={{ opacity: 0.7 }}>No transactions yet.</div>}
        {transactions.map((item) => (
          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "48px 1fr auto", gap: "14px", alignItems: "center", padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.04)", marginBottom: "10px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(139,92,246,0.3)" }}>
              {item.type === "income" ? "+" : "-"}
            </div>
            <div>
              <div style={{ fontWeight: "700" }}>{item.title}</div>
              <div style={{ opacity: 0.6, fontSize: "13px" }}>{item.date?.slice(0, 10)} • {item.account_name || "No account"}</div>
            </div>
            <div style={{ color: item.type === "income" ? "#86efac" : "#fda4af", fontWeight: "800" }}>
              {item.type === "income" ? "+" : "-"}{formatMoney(item.amount)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Accounts;
