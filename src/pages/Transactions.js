
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../authService";
import useResponsive from "../hooks/useResponsive";

const categories = [
  "All",
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Salary",
  "Investment",
  "Savings",
  "Other",
];

const formatMoney = (value) =>
  "MYR " +
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Transactions() {
  const { isMobile, isLargeMobile, isTablet, isPhone } = useResponsive();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setError("");
      const [txData, accountData] = await Promise.all([
        apiRequest("/transactions"),
        apiRequest("/accounts"),
      ]);
      setTransactions(txData.transactions || []);
      setAccounts(accountData.accounts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pageStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 20% 0%, rgba(168,85,247,0.42), transparent 35%), radial-gradient(circle at 85% 15%, rgba(236,72,153,0.28), transparent 35%), #0b1026",
    color: "white",
    padding: isMobile ? "16px 12px" : isLargeMobile ? "20px 14px" : isTablet ? "22px 18px" : "28px 32px",
    fontFamily: "Poppins, sans-serif",
  };

  const glassCard = {
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    backdropFilter: "blur(18px)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35), 0 0 28px rgba(168,85,247,0.12)",
  };

  const modalInput = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  };

  const topButton = {
    background: "linear-gradient(90deg, #9333ea, #ec4899)",
    border: "none",
    color: "white",
    borderRadius: "8px",
    padding: "12px 18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(236,72,153,0.35)",
  };

  const chipStyle = (active) => ({
    background: active ? "linear-gradient(90deg, #9333ea, #ec4899)" : "rgba(255,255,255,0.06)",
    border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.08)",
    color: "white",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  });

  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          String(item.account_name || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedCategory, searchTerm, transactions]);

  const totalIncome = filteredTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = filteredTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const openCreateModal = () => {
    setEditingTransaction({
      id: null,
      title: "",
      category: "Food",
      account_id: accounts[0]?.id || "",
      transaction_date: new Date().toISOString().slice(0, 10),
      amount: "",
      transaction_type: "expense",
      note: "",
    });
  };

  const openEditModal = (item) => {
    setEditingTransaction({
      ...item,
      transaction_date: item.date?.slice(0, 10) || item.transaction_date?.slice(0, 10),
    });
  };

  const handleChange = (field, value) => {
    setEditingTransaction((prev) => ({ ...prev, [field]: value }));
  };

  const saveTransaction = async () => {
    try {
      setError("");
      const body = {
        title: editingTransaction.title,
        category: editingTransaction.category,
        account_id: editingTransaction.account_id || null,
        amount: Number(editingTransaction.amount),
        transaction_type: editingTransaction.transaction_type,
        transaction_date: editingTransaction.transaction_date,
        note: editingTransaction.note,
      };

      if (editingTransaction.id) {
        await apiRequest(`/transactions/${editingTransaction.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setMessage("Transaction updated successfully.");
      } else {
        await apiRequest("/transactions", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setMessage("Transaction added successfully.");
      }

      setEditingTransaction(null);
      await loadData();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await apiRequest(`/transactions/${id}`, { method: "DELETE" });
      setMessage("Transaction deleted.");
      await loadData();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={pageStyle}>
      {message && (
        <div style={{ position: "fixed", top: 22, right: 22, zIndex: 1200, background: "#4ade80", color: "#07140a", padding: "14px 18px", borderRadius: "8px", fontWeight: 800 }}>
          {message}
        </div>
      )}

      {editingTransaction && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={() => setEditingTransaction(null)}>
          <div style={{ width: "100%", maxWidth: "640px", background: "linear-gradient(180deg, rgba(44,24,82,0.96), rgba(23,17,56,0.96))", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "24px", padding: "24px", boxShadow: "0 0 40px rgba(168,85,247,0.35)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 800 }}>{editingTransaction.id ? "Edit Transaction" : "New Transaction"}</div>
                <div style={{ opacity: 0.72 }}>Saved to PostgreSQL</div>
              </div>
              <button style={topButton} onClick={() => setEditingTransaction(null)}>Close</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              <button style={{ ...topButton, flex: 1, background: editingTransaction.transaction_type === "expense" ? "linear-gradient(90deg, #fb7185, #fda4af)" : "rgba(255,255,255,0.08)" }} onClick={() => handleChange("transaction_type", "expense")}>Expense</button>
              <button style={{ ...topButton, flex: 1, background: editingTransaction.transaction_type === "income" ? "linear-gradient(90deg, #4ade80, #86efac)" : "rgba(255,255,255,0.08)", color: editingTransaction.transaction_type === "income" ? "#08110a" : "white" }} onClick={() => handleChange("transaction_type", "income")}>Income</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <input style={modalInput} placeholder="Title" value={editingTransaction.title} onChange={(e) => handleChange("title", e.target.value)} />
              <input style={modalInput} placeholder="Amount" type="number" value={editingTransaction.amount} onChange={(e) => handleChange("amount", e.target.value)} />
              <select style={modalInput} value={editingTransaction.account_id || ""} onChange={(e) => handleChange("account_id", e.target.value)}>
                <option value="">No account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
              <input style={modalInput} type="date" value={editingTransaction.transaction_date} onChange={(e) => handleChange("transaction_date", e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
              {categories.filter((cat) => cat !== "All").map((cat) => (
                <button key={cat} style={chipStyle(editingTransaction.category === cat)} onClick={() => handleChange("category", cat)}>
                  {cat}
                </button>
              ))}
            </div>

            <input style={{ ...modalInput, marginBottom: "14px" }} placeholder="Note optional" value={editingTransaction.note || ""} onChange={(e) => handleChange("note", e.target.value)} />
            <button style={{ ...topButton, width: "100%" }} onClick={saveTransaction}>
              {editingTransaction.id ? "Update Transaction" : "Add Transaction"}
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: isPhone ? "stretch" : "center", flexDirection: isPhone ? "column" : "row", marginBottom: "18px", gap: "14px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "34px", fontWeight: "800" }}>Transactions</div>
            <div style={{ opacity: 0.7, marginTop: "4px" }}>Real database transactions</div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", width: isPhone ? "100%" : "auto", flexDirection: isMobile ? "column" : "row" }}>
            <input style={{ width: isPhone ? "100%" : "240px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "white", padding: "12px 14px", outline: "none" }} placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button style={{ ...topButton, width: isMobile ? "100%" : "auto" }} onClick={openCreateModal}>+ New Transaction</button>
          </div>
        </div>

        {error && <div style={{ ...glassCard, padding: "16px", marginBottom: "16px", color: "#fda4af" }}>{error}</div>}
        {loading && <div style={{ ...glassCard, padding: "16px" }}>Loading transactions...</div>}

        {!loading && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isLargeMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: "16px", marginBottom: "18px" }}>
              <div style={{ ...glassCard, padding: "20px" }}>
                <div style={{ opacity: 0.7 }}>Total Income</div>
                <div style={{ marginTop: "8px", fontSize: "20px", fontWeight: 800, color: "#86efac" }}>{formatMoney(totalIncome)}</div>
              </div>
              <div style={{ ...glassCard, padding: "20px" }}>
                <div style={{ opacity: 0.7 }}>Total Expenses</div>
                <div style={{ marginTop: "8px", fontSize: "20px", fontWeight: 800, color: "#fda4af" }}>{formatMoney(totalExpenses)}</div>
              </div>
              <div style={{ ...glassCard, padding: "20px" }}>
                <div style={{ opacity: 0.7 }}>Net</div>
                <div style={{ marginTop: "8px", fontSize: "20px", fontWeight: 800, color: "#e9d5ff" }}>{formatMoney(totalIncome - totalExpenses)}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
              {categories.map((cat) => (
                <button key={cat} style={chipStyle(selectedCategory === cat)} onClick={() => setSelectedCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ ...glassCard, padding: "18px", overflowX: isPhone ? "visible" : "auto" }}>
              {isPhone ? (
                <div style={{ display: "grid", gap: "12px" }}>
                  {filteredTransactions.length === 0 && <div style={{ padding: "18px", opacity: 0.75 }}>No transactions found.</div>}
                  {filteredTransactions.map((item) => (
                    <div key={item.id} style={{ padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontWeight: 800, marginBottom: "6px" }}>{item.title}</div>
                      <div style={{ fontSize: "13px", opacity: 0.72, marginBottom: "10px" }}>{item.note || item.category}</div>
                      <div style={{ display: "grid", gap: "6px", fontSize: "14px" }}>
                        <div>Category: {item.category}</div>
                        <div>Account: {item.account_name || "No account"}</div>
                        <div>Date: {item.date?.slice(0, 10)}</div>
                        <div style={{ fontWeight: 800, color: item.type === "income" ? "#86efac" : "#fda4af" }}>
                          Amount: {item.type === "income" ? "+" : "-"}{formatMoney(item.amount)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                        <button style={chipStyle(false)} onClick={() => openEditModal(item)}>Edit</button>
                        <button style={chipStyle(false)} onClick={() => deleteTransaction(item.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
              <div style={{ minWidth: isTablet ? "720px" : "880px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px", gap: "12px", opacity: 0.65, fontSize: "12px", padding: "0 12px 10px" }}>
                  <div>Title</div>
                  <div>Category</div>
                  <div>Account</div>
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Actions</div>
                </div>

                {filteredTransactions.length === 0 && <div style={{ padding: "18px", opacity: 0.75 }}>No transactions found.</div>}
                {filteredTransactions.map((item) => (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px", gap: "12px", alignItems: "center", padding: "14px 12px", borderRadius: "16px", marginBottom: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.title}</div>
                      <div style={{ fontSize: "12px", opacity: 0.65 }}>{item.note}</div>
                    </div>
                    <div>{item.category}</div>
                    <div>{item.account_name || "No account"}</div>
                    <div>{item.date?.slice(0, 10)}</div>
                    <div style={{ fontWeight: 800, color: item.type === "income" ? "#86efac" : "#fda4af" }}>
                      {item.type === "income" ? "+" : "-"}{formatMoney(item.amount)}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={chipStyle(false)} onClick={() => openEditModal(item)}>Edit</button>
                      <button style={chipStyle(false)} onClick={() => deleteTransaction(item.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Transactions;
