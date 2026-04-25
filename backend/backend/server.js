const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("./db");
let OpenAI = null;

try {
  OpenAI = require("openai");
} catch {
  OpenAI = null;
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "track_local_dev_secret";
const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];
const configuredOrigins = String(process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json());

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const money = (value) => Number(value || 0);
const demoNote = "demo-seed";

const formatDatabaseError = (err) => {
  if (!err) {
    return "Unknown database error";
  }

  const fields = [
    err.name,
    err.message,
    err.code && `code=${err.code}`,
    err.errno && `errno=${err.errno}`,
    err.detail && `detail=${err.detail}`,
    err.hint && `hint=${err.hint}`,
    err.address && `address=${err.address}`,
    err.port && `port=${err.port}`,
  ].filter(Boolean);

  if (Array.isArray(err.errors) && err.errors.length > 0) {
    const nested = err.errors.map((item) => formatDatabaseError(item)).join(" | ");
    fields.push(`errors=[${nested}]`);
  }

  if (err.cause) {
    fields.push(`cause=${formatDatabaseError(err.cause)}`);
  }

  return fields.join(" | ");
};

const createToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const authRequired = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ error: "Please login first." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [
      decoded.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found. Please login again." });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    res.status(401).json({ error: "Your login expired. Please login again." });
  }
};

const ensureTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_name VARCHAR(120) NOT NULL,
      balance NUMERIC(12,2) NOT NULL DEFAULT 0,
      account_type VARCHAR(50) NOT NULL DEFAULT 'Cash',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
      title VARCHAR(160) NOT NULL,
      category VARCHAR(80) NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
      transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category VARCHAR(80) NOT NULL,
      limit_amount NUMERIC(12,2) NOT NULL,
      month INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
      year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(128) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(120) NOT NULL,
      method_type VARCHAR(50) NOT NULL DEFAULT 'Card',
      last_four VARCHAR(8),
      is_primary BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      budget_alerts BOOLEAN NOT NULL DEFAULT true,
      weekly_summary BOOLEAN NOT NULL DEFAULT true,
      large_transactions BOOLEAN NOT NULL DEFAULT false,
      bill_reminders BOOLEAN NOT NULL DEFAULT true,
      new_login BOOLEAN NOT NULL DEFAULT true,
      promotions BOOLEAN NOT NULL DEFAULT false,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scheduled_payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
      title VARCHAR(160) NOT NULL,
      category VARCHAR(80) NOT NULL DEFAULT 'Bills',
      amount NUMERIC(12,2) NOT NULL,
      frequency VARCHAR(40) NOT NULL DEFAULT 'Monthly',
      next_date DATE NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(40)");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(40) NOT NULL DEFAULT 'Free'");
};

const ensureDefaultAccounts = async (userId) => {
  const existing = await pool.query("SELECT id FROM accounts WHERE user_id = $1 LIMIT 1", [
    userId,
  ]);

  if (existing.rows.length > 0) return;

  await pool.query(
    `INSERT INTO accounts (user_id, account_name, balance, account_type)
     VALUES ($1, 'Cash Wallet', 0, 'Cash'),
            ($1, 'Main Bank Account', 0, 'Bank'),
            ($1, 'Card Account', 0, 'Card')`,
    [userId]
  );
};

const ensureNotificationPreferences = async (userId) => {
  await pool.query(
    `INSERT INTO notification_preferences (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
};

const accountDelta = (type, amount) => (type === "income" ? money(amount) : -money(amount));

const formatTransaction = (row) => ({
  id: row.id,
  user_id: row.user_id,
  account_id: row.account_id,
  account_name: row.account_name,
  title: row.title,
  category: row.category,
  amount: money(row.amount),
  transaction_type: row.transaction_type,
  type: row.transaction_type,
  transaction_date: row.transaction_date,
  date: row.transaction_date,
  note: row.note || "",
  created_at: row.created_at,
});

const dateDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

const getFinanceContext = async (userId) => {
  const summary = await pool.query(
    `SELECT
       COALESCE((SELECT SUM(balance) FROM accounts WHERE user_id = $1), 0) AS total_balance,
       COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
       COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
     FROM transactions
     WHERE user_id = $1`,
    [userId]
  );

  const recent = await pool.query(
    `SELECT t.*, a.account_name
     FROM transactions t
     LEFT JOIN accounts a ON a.id = t.account_id
     WHERE t.user_id = $1
     ORDER BY t.transaction_date DESC, t.id DESC
     LIMIT 8`,
    [userId]
  );

  const budgets = await pool.query(
    `SELECT b.category, b.limit_amount, b.month, b.year,
            COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) AS spent_amount
     FROM budgets b
     LEFT JOIN transactions t
       ON t.user_id = b.user_id
      AND LOWER(t.category) = LOWER(b.category)
      AND EXTRACT(MONTH FROM t.transaction_date) = b.month
      AND EXTRACT(YEAR FROM t.transaction_date) = b.year
     WHERE b.user_id = $1
     GROUP BY b.id
     ORDER BY b.category`,
    [userId]
  );

  const categories = await pool.query(
    `SELECT category, SUM(amount) AS total
     FROM transactions
     WHERE user_id = $1 AND transaction_type = 'expense'
     GROUP BY category
     ORDER BY total DESC`,
    [userId]
  );

  const summaryRow = summary.rows[0];

  return {
    totalBalance: money(summaryRow.total_balance),
    totalIncome: money(summaryRow.total_income),
    totalExpenses: money(summaryRow.total_expenses),
    netSavings: money(summaryRow.total_income) - money(summaryRow.total_expenses),
    recentTransactions: recent.rows.map(formatTransaction),
    budgets: budgets.rows.map((row) => ({
      category: row.category,
      limit_amount: money(row.limit_amount),
      spent_amount: money(row.spent_amount),
      month: row.month,
      year: row.year,
    })),
    categorySummary: categories.rows.map((row) => ({
      category: row.category,
      total: money(row.total),
    })),
  };
};

const fallbackAiReply = (message, context) => {
  const originalQuestion = String(message || "").trim();
  const question = originalQuestion.toLowerCase();
  const topCategory = context.categorySummary[0];
  const overBudget = context.budgets.find((item) => item.spent_amount > item.limit_amount);
  const savingsRate =
    context.totalIncome > 0
      ? Math.round((context.netSavings / context.totalIncome) * 100)
      : 0;

  const arithmeticExpression = originalQuestion
    .replace(/what is|calculate|solve|=/gi, "")
    .replace(/[?]/g, "")
    .trim();

  if (/^(hi|hello|hey|yo|sup)\b/.test(question)) {
    return "Hi. Ask me anything. I can answer app and finance questions right now, and I can answer fully general questions once an OpenAI API key is added to the backend .env file.";
  }

  if (/(what can you do|help|how do i use|how to use)/.test(question)) {
    return "You can ask about your TRACK spending, budgets, savings, accounts, transactions, or simple general questions. For full open-ended AI answers on any topic, add OPENAI_API_KEY to backend/backend/.env and restart the backend.";
  }

  if (/^[\d\s+\-*/().%]+$/.test(arithmeticExpression) && /[+\-*/%]/.test(arithmeticExpression)) {
    try {
      const result = Function(`"use strict"; return (${arithmeticExpression});`)();
      if (Number.isFinite(result)) {
        return `${arithmeticExpression} = ${Number(result.toFixed(8)).toString()}`;
      }
    } catch {
      // Fall through to the regular assistant response.
    }
  }

  const isFinanceQuestion =
    /budget|spend|expense|save|saving|income|balance|transaction|money|account|category|bill|payment|finance|financial/.test(
      question
    );

  if (!isFinanceQuestion) {
    return "I can route any question to a real AI model, but this backend is currently running without OPENAI_API_KEY, so I only have offline app/finance/simple-math answers. Add OPENAI_API_KEY to backend/backend/.env, restart the backend, and I will answer general questions normally.";
  }

  let reply = `Based on your TRACK data, your balance is MYR ${context.totalBalance.toFixed(
    2
  )}, income is MYR ${context.totalIncome.toFixed(2)}, expenses are MYR ${context.totalExpenses.toFixed(
    2
  )}, and net savings are MYR ${context.netSavings.toFixed(2)}.`;

  if (question.includes("budget")) {
    if (overBudget) {
      reply += ` Your ${overBudget.category} budget is over limit by MYR ${(
        overBudget.spent_amount - overBudget.limit_amount
      ).toFixed(2)}. Reduce spending there first.`;
    } else {
      reply += " Your budgets are currently under control. Keep checking categories weekly.";
    }
  } else if (question.includes("spend") || question.includes("expense")) {
    reply += topCategory
      ? ` Your highest spending category is ${topCategory.category} at MYR ${topCategory.total.toFixed(
          2
        )}. Start there if you want to cut costs.`
      : " You do not have expense transactions yet.";
  } else if (question.includes("save") || question.includes("saving")) {
    reply +=
      context.netSavings > 0
        ? ` Your savings rate is about ${savingsRate}%. Move part of the surplus to Savings before spending it.`
        : " You are not saving yet because expenses are higher than income. Reduce flexible spending first.";
  } else {
    reply += topCategory
      ? ` Watch ${topCategory.category}, because it is your biggest expense category.`
      : " Add more transactions so I can give better advice.";
  }

  return reply;
};

const buildAiPrompt = (message, context) => {
  const recent = context.recentTransactions
    .map(
      (item) =>
        `- ${item.date?.toISOString ? item.date.toISOString().slice(0, 10) : String(item.date).slice(0, 10)}: ${item.title}, ${item.category}, ${item.type}, MYR ${item.amount.toFixed(2)}`
    )
    .join("\n");
  const budgets = context.budgets
    .map(
      (item) =>
        `- ${item.category}: spent MYR ${item.spent_amount.toFixed(2)} of MYR ${item.limit_amount.toFixed(2)}`
    )
    .join("\n");

  return `You are Track AI, a helpful general-purpose assistant inside a student finance manager app called TRACK.
Answer the user's question directly, even when it is not about finance.
If the question is about the user's finances, use the PostgreSQL finance context below.
If the question is not about finance, do not force a finance answer; answer normally.
Keep answers clear, practical, and concise unless the user asks for detail.

Balance: MYR ${context.totalBalance.toFixed(2)}
Income: MYR ${context.totalIncome.toFixed(2)}
Expenses: MYR ${context.totalExpenses.toFixed(2)}
Net savings: MYR ${context.netSavings.toFixed(2)}

Recent transactions:
${recent || "- No recent transactions"}

Budgets:
${budgets || "- No budgets"}

User question: ${message}`;
};

const seedDemoDataForUser = async (userId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const accountSeeds = [
      ["Cash Wallet", 176.3, "Cash"],
      ["Main Bank Account", 3110.1, "Bank"],
      ["Card Account", 1111.6, "Card"],
    ];
    const accountIds = {};

    for (const [name, balance, type] of accountSeeds) {
      const existing = await client.query(
        "SELECT id FROM accounts WHERE user_id = $1 AND account_name = $2 LIMIT 1",
        [userId, name]
      );

      if (existing.rows[0]) {
        await client.query(
          "UPDATE accounts SET balance = $1, account_type = $2 WHERE id = $3",
          [balance, type, existing.rows[0].id]
        );
        accountIds[name] = existing.rows[0].id;
      } else {
        const result = await client.query(
          `INSERT INTO accounts (user_id, account_name, balance, account_type)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [userId, name, balance, type]
        );
        accountIds[name] = result.rows[0].id;
      }
    }

    await client.query("DELETE FROM transactions WHERE user_id = $1 AND note = $2", [
      userId,
      demoNote,
    ]);

    const transactions = [
      ["Monthly Salary", "Salary", 4500, "income", "Main Bank Account", 11],
      ["Freelance Website Project", "Salary", 1200, "income", "Main Bank Account", 8],
      ["Dividend Income", "Investment", 350, "income", "Main Bank Account", 6],
      ["Nasi Lemak Breakfast", "Food", 8.5, "expense", "Cash Wallet", 10],
      ["Grab Ride to KLCC", "Transport", 24, "expense", "Card Account", 9],
      ["TNB Electricity Bill", "Bills", 187.5, "expense", "Main Bank Account", 8],
      ["Lunch at Pavilion", "Food", 45.5, "expense", "Card Account", 7],
      ["Netflix and Spotify", "Entertainment", 42.9, "expense", "Card Account", 7],
      ["Guardian Pharmacy", "Health", 67.8, "expense", "Cash Wallet", 6],
      ["Uniqlo Work Attire", "Shopping", 245.9, "expense", "Card Account", 5],
      ["Touch n Go Reload", "Transport", 100, "expense", "Cash Wallet", 4],
      ["ASB Investment Top Up", "Investment", 500, "expense", "Main Bank Account", 3],
      ["Emergency Fund Transfer", "Savings", 1000, "expense", "Main Bank Account", 2],
      ["Water Bill", "Bills", 28.4, "expense", "Main Bank Account", 1],
    ];

    for (const [title, category, amount, type, accountName, daysAgo] of transactions) {
      await client.query(
        `INSERT INTO transactions
         (user_id, account_id, title, category, amount, transaction_type, transaction_date, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          accountIds[accountName],
          title,
          category,
          amount,
          type,
          dateDaysAgo(daysAgo),
          demoNote,
        ]
      );
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    await client.query(
      "DELETE FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3",
      [userId, month, year]
    );

    const budgets = [
      ["Food", 600],
      ["Transport", 300],
      ["Shopping", 400],
      ["Bills", 300],
      ["Entertainment", 200],
      ["Health", 200],
      ["Investment", 800],
      ["Savings", 1200],
    ];

    for (const [category, limit] of budgets) {
      await client.query(
        `INSERT INTO budgets (user_id, category, limit_amount, month, year)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, category, limit, month, year]
      );
    }

    await client.query("DELETE FROM payment_methods WHERE user_id = $1", [userId]);
    await client.query(
      `INSERT INTO payment_methods (user_id, name, method_type, last_four, is_primary)
       VALUES ($1, 'Maybank', 'Savings', '4821', true),
              ($1, 'CIMB Bank', 'Current', '2934', false),
              ($1, 'Cash', 'Cash', null, false)`,
      [userId]
    );

    await client.query("DELETE FROM scheduled_payments WHERE user_id = $1", [userId]);
    await client.query(
      `INSERT INTO scheduled_payments
       (user_id, account_id, title, category, amount, frequency, next_date, status)
       VALUES ($1, $2, 'TNB Electricity', 'Bills', 187.50, 'Monthly', $5, 'Active'),
              ($1, $2, 'Water Bill', 'Bills', 28.40, 'Monthly', $6, 'Active'),
              ($1, $4, 'Netflix and Spotify', 'Entertainment', 42.90, 'Monthly', $7, 'Active'),
              ($1, $3, 'ASB Investment', 'Investment', 500.00, 'Monthly', $8, 'Paused')`,
      [
        userId,
        accountIds["Main Bank Account"],
        accountIds["Main Bank Account"],
        accountIds["Card Account"],
        dateDaysAgo(-14),
        dateDaysAgo(-18),
        dateDaysAgo(-16),
        dateDaysAgo(-17),
      ]
    );

    await client.query(
      `INSERT INTO notification_preferences (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET
         budget_alerts = true,
         weekly_summary = true,
         large_transactions = false,
         bill_reminders = true,
         new_login = true,
         promotions = false,
         updated_at = CURRENT_TIMESTAMP`,
      [userId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

ensureTables()
  .then(() => console.log("Database tables are ready"))
  .catch((err) => {
    console.error("DATABASE SETUP ERROR:", formatDatabaseError(err));
    if (err?.stack) {
      console.error(err.stack);
    }
  });

app.get("/", (req, res) => {
  res.json({ message: "TRACK backend is running" });
});

app.post("/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const duplicate = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (duplicate.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    await ensureDefaultAccounts(result.rows[0].id);
    console.log("REGISTER SUCCESS:", email);
    res.status(201).json({ message: "Account created successfully.", user: publicUser(result.rows[0]) });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    await ensureDefaultAccounts(user.id);
    await ensureNotificationPreferences(user.id);
    console.log("LOGIN SUCCESS:", email);
    res.json({ message: "Login successful.", token: createToken(user), user: publicUser(user) });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

app.post("/forgot-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ error: "Email is required." });

    const userResult = await pool.query("SELECT id, email FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "No account was found with that email." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userResult.rows[0].id, token, expiresAt]
    );

    console.log("PASSWORD RESET TOKEN:", token);
    res.json({
      message: "Reset request created. For local testing, use the token returned below.",
      resetToken: token,
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err.message);
    res.status(500).json({ error: "Could not create reset request." });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const token = String(req.body.token || "").trim();
    const password = String(req.body.password || "");

    if (!token || !password) {
      return res.status(400).json({ error: "Token and new password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const resetResult = await pool.query(
      `SELECT * FROM password_resets
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    );

    if (resetResult.rows.length === 0) {
      return res.status(400).json({ error: "Reset token is invalid or expired." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      resetResult.rows[0].user_id,
    ]);
    await pool.query("UPDATE password_resets SET used = true WHERE id = $1", [
      resetResult.rows[0].id,
    ]);

    res.json({ message: "Password updated successfully. You can login now." });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err.message);
    res.status(500).json({ error: "Could not reset password." });
  }
});

app.get("/me", authRequired, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.get("/profile", authRequired, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, phone, plan, created_at FROM users WHERE id = $1",
    [req.user.id]
  );
  res.json({ user: result.rows[0] });
});

app.put("/profile", authRequired, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();

    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }

    const result = await pool.query(
      `UPDATE users
       SET name = $1, phone = $2
       WHERE id = $3
       RETURNING id, name, email, phone, plan, created_at`,
      [name, phone, req.user.id]
    );

    res.json({ user: result.rows[0], message: "Profile updated." });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err.message);
    res.status(500).json({ error: "Could not update profile." });
  }
});

app.post("/profile/plan", authRequired, async (req, res) => {
  try {
    const plan = String(req.body.plan || "Pro").trim();
    const result = await pool.query(
      "UPDATE users SET plan = $1 WHERE id = $2 RETURNING id, name, email, phone, plan, created_at",
      [plan, req.user.id]
    );
    res.json({ user: result.rows[0], message: `Plan updated to ${plan}.` });
  } catch (err) {
    console.error("UPDATE PLAN ERROR:", err.message);
    res.status(500).json({ error: "Could not update plan." });
  }
});

app.get("/notifications/preferences", authRequired, async (req, res) => {
  await ensureNotificationPreferences(req.user.id);
  const result = await pool.query(
    `SELECT budget_alerts, weekly_summary, large_transactions,
            bill_reminders, new_login, promotions
     FROM notification_preferences
     WHERE user_id = $1`,
    [req.user.id]
  );
  const row = result.rows[0];
  res.json({
    settings: {
      budgetAlerts: row.budget_alerts,
      weeklySummary: row.weekly_summary,
      largeTransactions: row.large_transactions,
      billReminders: row.bill_reminders,
      newLogin: row.new_login,
      promotions: row.promotions,
    },
  });
});

app.put("/notifications/preferences", authRequired, async (req, res) => {
  try {
    const settings = req.body.settings || {};
    const result = await pool.query(
      `INSERT INTO notification_preferences
       (user_id, budget_alerts, weekly_summary, large_transactions, bill_reminders, new_login, promotions)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         budget_alerts = EXCLUDED.budget_alerts,
         weekly_summary = EXCLUDED.weekly_summary,
         large_transactions = EXCLUDED.large_transactions,
         bill_reminders = EXCLUDED.bill_reminders,
         new_login = EXCLUDED.new_login,
         promotions = EXCLUDED.promotions,
         updated_at = CURRENT_TIMESTAMP
       RETURNING budget_alerts, weekly_summary, large_transactions, bill_reminders, new_login, promotions`,
      [
        req.user.id,
        Boolean(settings.budgetAlerts),
        Boolean(settings.weeklySummary),
        Boolean(settings.largeTransactions),
        Boolean(settings.billReminders),
        Boolean(settings.newLogin),
        Boolean(settings.promotions),
      ]
    );
    const row = result.rows[0];
    res.json({
      message: "Notification preferences saved.",
      settings: {
        budgetAlerts: row.budget_alerts,
        weeklySummary: row.weekly_summary,
        largeTransactions: row.large_transactions,
        billReminders: row.bill_reminders,
        newLogin: row.new_login,
        promotions: row.promotions,
      },
    });
  } catch (err) {
    console.error("SAVE NOTIFICATIONS ERROR:", err.message);
    res.status(500).json({ error: "Could not save notification preferences." });
  }
});

app.get("/accounts", authRequired, async (req, res) => {
  const result = await pool.query(
    `SELECT id, account_name AS name, balance, account_type, created_at
     FROM accounts WHERE user_id = $1 ORDER BY id`,
    [req.user.id]
  );
  res.json({ accounts: result.rows.map((row) => ({ ...row, balance: money(row.balance) })) });
});

app.post("/accounts", authRequired, async (req, res) => {
  try {
    const name = String(req.body.name || req.body.account_name || "").trim();
    const accountType = String(req.body.account_type || "Bank").trim();
    const balance = money(req.body.balance);

    if (!name) return res.status(400).json({ error: "Account name is required." });

    const result = await pool.query(
      `INSERT INTO accounts (user_id, account_name, balance, account_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, account_name AS name, balance, account_type, created_at`,
      [req.user.id, name, balance, accountType]
    );

    res.status(201).json({ account: { ...result.rows[0], balance: money(result.rows[0].balance) } });
  } catch (err) {
    console.error("CREATE ACCOUNT ERROR:", err.message);
    res.status(500).json({ error: "Could not create account." });
  }
});

app.delete("/accounts/:id", authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM accounts WHERE id = $1 AND user_id = $2 RETURNING id",
      [Number(req.params.id), req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Account not found." });
    }

    res.json({ message: "Account deleted." });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err.message);
    res.status(500).json({ error: "Could not delete account." });
  }
});

app.get("/payment-methods", authRequired, async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, method_type, last_four, is_primary, created_at
     FROM payment_methods
     WHERE user_id = $1
     ORDER BY is_primary DESC, id`,
    [req.user.id]
  );
  res.json({ methods: result.rows });
});

app.post("/payment-methods", authRequired, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const methodType = String(req.body.method_type || "Card").trim();
    const lastFour = String(req.body.last_four || "").trim().slice(-4);

    if (!name) return res.status(400).json({ error: "Payment method name is required." });

    const result = await pool.query(
      `INSERT INTO payment_methods (user_id, name, method_type, last_four, is_primary)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, name, method_type, last_four, is_primary, created_at`,
      [req.user.id, name, methodType, lastFour || null]
    );

    res.status(201).json({ method: result.rows[0] });
  } catch (err) {
    console.error("CREATE PAYMENT METHOD ERROR:", err.message);
    res.status(500).json({ error: "Could not add payment method." });
  }
});

app.put("/payment-methods/:id/primary", authRequired, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE payment_methods SET is_primary = false WHERE user_id = $1", [
      req.user.id,
    ]);
    const result = await client.query(
      `UPDATE payment_methods
       SET is_primary = true
       WHERE id = $1 AND user_id = $2
       RETURNING id, name, method_type, last_four, is_primary, created_at`,
      [Number(req.params.id), req.user.id]
    );
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Payment method not found." });
    }
    await client.query("COMMIT");
    res.json({ method: result.rows[0], message: "Primary payment method updated." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PRIMARY PAYMENT METHOD ERROR:", err.message);
    res.status(500).json({ error: "Could not update primary payment method." });
  } finally {
    client.release();
  }
});

app.delete("/payment-methods/:id", authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM payment_methods WHERE id = $1 AND user_id = $2 RETURNING id",
      [Number(req.params.id), req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payment method not found." });
    }
    res.json({ message: "Payment method removed." });
  } catch (err) {
    console.error("DELETE PAYMENT METHOD ERROR:", err.message);
    res.status(500).json({ error: "Could not remove payment method." });
  }
});

app.get("/transactions", authRequired, async (req, res) => {
  const result = await pool.query(
    `SELECT t.*, a.account_name
     FROM transactions t
     LEFT JOIN accounts a ON a.id = t.account_id
     WHERE t.user_id = $1
     ORDER BY t.transaction_date DESC, t.id DESC`,
    [req.user.id]
  );
  res.json({ transactions: result.rows.map(formatTransaction) });
});

app.post("/transactions", authRequired, async (req, res) => {
  const client = await pool.connect();
  try {
    const accountId = req.body.account_id ? Number(req.body.account_id) : null;
    const title = String(req.body.title || "").trim();
    const category = String(req.body.category || "Other").trim();
    const amount = Math.abs(money(req.body.amount));
    const type = String(req.body.transaction_type || req.body.type || "").toLowerCase();
    const date = req.body.transaction_date || req.body.date || new Date().toISOString().slice(0, 10);
    const note = String(req.body.note || "");

    if (!title || !amount || !["income", "expense"].includes(type)) {
      return res.status(400).json({ error: "Title, amount, and type are required." });
    }

    await client.query("BEGIN");

    if (accountId) {
      const account = await client.query(
        "SELECT id FROM accounts WHERE id = $1 AND user_id = $2",
        [accountId, req.user.id]
      );
      if (account.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Account not found." });
      }
    }

    const result = await client.query(
      `INSERT INTO transactions
       (user_id, account_id, title, category, amount, transaction_type, transaction_date, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, accountId, title, category, amount, type, date, note]
    );

    if (accountId) {
      await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [
        accountDelta(type, amount),
        accountId,
      ]);
    }

    await client.query("COMMIT");
    console.log("TRANSACTION CREATED:", result.rows[0].id);
    res.status(201).json({ transaction: formatTransaction(result.rows[0]) });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("CREATE TRANSACTION ERROR:", err.message);
    res.status(500).json({ error: "Could not create transaction." });
  } finally {
    client.release();
  }
});

app.put("/transactions/:id", authRequired, async (req, res) => {
  const client = await pool.connect();
  try {
    const id = Number(req.params.id);
    const oldResult = await client.query(
      "SELECT * FROM transactions WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    if (oldResult.rows.length === 0) return res.status(404).json({ error: "Transaction not found." });

    const old = oldResult.rows[0];
    const accountId = req.body.account_id ? Number(req.body.account_id) : null;
    const title = String(req.body.title || "").trim();
    const category = String(req.body.category || "Other").trim();
    const amount = Math.abs(money(req.body.amount));
    const type = String(req.body.transaction_type || req.body.type || "").toLowerCase();
    const date = req.body.transaction_date || req.body.date;
    const note = String(req.body.note || "");

    if (!title || !amount || !["income", "expense"].includes(type) || !date) {
      return res.status(400).json({ error: "Title, amount, type, and date are required." });
    }

    await client.query("BEGIN");

    if (old.account_id) {
      await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [
        accountDelta(old.transaction_type, old.amount),
        old.account_id,
      ]);
    }

    const result = await client.query(
      `UPDATE transactions
       SET account_id = $1, title = $2, category = $3, amount = $4,
           transaction_type = $5, transaction_date = $6, note = $7
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [accountId, title, category, amount, type, date, note, id, req.user.id]
    );

    if (accountId) {
      await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [
        accountDelta(type, amount),
        accountId,
      ]);
    }

    await client.query("COMMIT");
    res.json({ transaction: formatTransaction(result.rows[0]) });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("UPDATE TRANSACTION ERROR:", err.message);
    res.status(500).json({ error: "Could not update transaction." });
  } finally {
    client.release();
  }
});

app.delete("/transactions/:id", authRequired, async (req, res) => {
  const client = await pool.connect();
  try {
    const id = Number(req.params.id);
    await client.query("BEGIN");
    const result = await client.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Transaction not found." });
    }

    const tx = result.rows[0];
    if (tx.account_id) {
      await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [
        accountDelta(tx.transaction_type, tx.amount),
        tx.account_id,
      ]);
    }

    await client.query("COMMIT");
    res.json({ message: "Transaction deleted." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DELETE TRANSACTION ERROR:", err.message);
    res.status(500).json({ error: "Could not delete transaction." });
  } finally {
    client.release();
  }
});

app.get("/budgets", authRequired, async (req, res) => {
  const result = await pool.query(
    `SELECT b.id, b.category, b.limit_amount, b.month, b.year, b.created_at,
            COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) AS spent_amount
     FROM budgets b
     LEFT JOIN transactions t
       ON t.user_id = b.user_id
      AND LOWER(t.category) = LOWER(b.category)
      AND EXTRACT(MONTH FROM t.transaction_date) = b.month
      AND EXTRACT(YEAR FROM t.transaction_date) = b.year
     WHERE b.user_id = $1
     GROUP BY b.id
     ORDER BY b.year DESC, b.month DESC, b.category`,
    [req.user.id]
  );

  res.json({
    budgets: result.rows.map((row) => ({
      ...row,
      limit_amount: money(row.limit_amount),
      spent_amount: money(row.spent_amount),
    })),
  });
});

app.post("/budgets", authRequired, async (req, res) => {
  try {
    const category = String(req.body.category || "").trim();
    const limitAmount = money(req.body.limit_amount);
    const now = new Date();
    const month = Number(req.body.month || now.getMonth() + 1);
    const year = Number(req.body.year || now.getFullYear());

    if (!category || !limitAmount) {
      return res.status(400).json({ error: "Category and limit amount are required." });
    }

    const result = await pool.query(
      `INSERT INTO budgets (user_id, category, limit_amount, month, year)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, category, limitAmount, month, year]
    );

    res.status(201).json({ budget: { ...result.rows[0], limit_amount: money(result.rows[0].limit_amount) } });
  } catch (err) {
    console.error("CREATE BUDGET ERROR:", err.message);
    res.status(500).json({ error: "Could not create budget." });
  }
});

app.put("/budgets/:id", authRequired, async (req, res) => {
  try {
    const category = String(req.body.category || "").trim();
    const limitAmount = money(req.body.limit_amount);
    const month = Number(req.body.month);
    const year = Number(req.body.year);

    if (!category || !limitAmount || !month || !year) {
      return res.status(400).json({ error: "Category, limit, month, and year are required." });
    }

    const result = await pool.query(
      `UPDATE budgets
       SET category = $1, limit_amount = $2, month = $3, year = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [category, limitAmount, month, year, Number(req.params.id), req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Budget not found." });
    }

    res.json({ budget: { ...result.rows[0], limit_amount: money(result.rows[0].limit_amount) } });
  } catch (err) {
    console.error("UPDATE BUDGET ERROR:", err.message);
    res.status(500).json({ error: "Could not update budget." });
  }
});

app.delete("/budgets/:id", authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id",
      [Number(req.params.id), req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Budget not found." });
    }
    res.json({ message: "Budget deleted." });
  } catch (err) {
    console.error("DELETE BUDGET ERROR:", err.message);
    res.status(500).json({ error: "Could not delete budget." });
  }
});

app.get("/budgets/category/:category", authRequired, async (req, res) => {
  try {
    const rawCategory = decodeURIComponent(req.params.category || "");
    const category = rawCategory
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
    const normalizedCategory = category.toLowerCase().includes("bill") ? "Bills" : category;
    const now = new Date();
    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());

    const budget = await pool.query(
      `SELECT b.*,
              COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) AS spent_amount
       FROM budgets b
       LEFT JOIN transactions t
         ON t.user_id = b.user_id
        AND LOWER(t.category) = LOWER(b.category)
        AND EXTRACT(MONTH FROM t.transaction_date) = b.month
        AND EXTRACT(YEAR FROM t.transaction_date) = b.year
       WHERE b.user_id = $1 AND LOWER(b.category) = LOWER($2)
         AND b.month = $3 AND b.year = $4
       GROUP BY b.id
       LIMIT 1`,
      [req.user.id, normalizedCategory, month, year]
    );

    const transactions = await pool.query(
      `SELECT t.*, a.account_name
       FROM transactions t
       LEFT JOIN accounts a ON a.id = t.account_id
       WHERE t.user_id = $1 AND LOWER(t.category) = LOWER($2)
         AND t.transaction_type = 'expense'
         AND EXTRACT(MONTH FROM t.transaction_date) = $3
         AND EXTRACT(YEAR FROM t.transaction_date) = $4
       ORDER BY t.transaction_date DESC, t.id DESC`,
      [req.user.id, normalizedCategory, month, year]
    );

    const byDay = await pool.query(
      `SELECT TO_CHAR(transaction_date, 'DD Mon') AS day,
              SUM(amount) AS value
       FROM transactions
       WHERE user_id = $1 AND LOWER(category) = LOWER($2)
         AND transaction_type = 'expense'
         AND EXTRACT(MONTH FROM transaction_date) = $3
         AND EXTRACT(YEAR FROM transaction_date) = $4
       GROUP BY transaction_date
       ORDER BY transaction_date`,
      [req.user.id, normalizedCategory, month, year]
    );

    const budgetRow =
      budget.rows[0] ||
      {
        category: normalizedCategory,
        limit_amount: 0,
        spent_amount: transactions.rows.reduce((sum, item) => sum + money(item.amount), 0),
        month,
        year,
      };

    res.json({
      budget: {
        ...budgetRow,
        limit_amount: money(budgetRow.limit_amount),
        spent_amount: money(budgetRow.spent_amount),
      },
      transactions: transactions.rows.map(formatTransaction),
      chart: byDay.rows.map((row) => ({ day: row.day, value: money(row.value) })),
    });
  } catch (err) {
    console.error("BUDGET DETAIL ERROR:", err.message);
    res.status(500).json({ error: "Could not load budget detail." });
  }
});

app.get("/scheduled-payments", authRequired, async (req, res) => {
  const result = await pool.query(
    `SELECT sp.*, a.account_name
     FROM scheduled_payments sp
     LEFT JOIN accounts a ON a.id = sp.account_id
     WHERE sp.user_id = $1
     ORDER BY sp.next_date, sp.id`,
    [req.user.id]
  );
  res.json({ payments: result.rows.map((row) => ({ ...row, amount: money(row.amount) })) });
});

app.post("/scheduled-payments", authRequired, async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const category = String(req.body.category || "Bills").trim();
    const amount = Math.abs(money(req.body.amount));
    const frequency = String(req.body.frequency || "Monthly").trim();
    const nextDate = req.body.next_date || req.body.nextDate;
    const accountId = req.body.account_id ? Number(req.body.account_id) : null;

    if (!title || !amount || !nextDate) {
      return res.status(400).json({ error: "Title, amount, and next date are required." });
    }

    const result = await pool.query(
      `INSERT INTO scheduled_payments
       (user_id, account_id, title, category, amount, frequency, next_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active')
       RETURNING *`,
      [req.user.id, accountId, title, category, amount, frequency, nextDate]
    );

    res.status(201).json({ payment: { ...result.rows[0], amount: money(result.rows[0].amount) } });
  } catch (err) {
    console.error("CREATE SCHEDULED PAYMENT ERROR:", err.message);
    res.status(500).json({ error: "Could not create scheduled payment." });
  }
});

app.put("/scheduled-payments/:id", authRequired, async (req, res) => {
  try {
    const status = String(req.body.status || "Active").trim();
    const result = await pool.query(
      `UPDATE scheduled_payments
       SET status = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, Number(req.params.id), req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Scheduled payment not found." });
    res.json({ payment: { ...result.rows[0], amount: money(result.rows[0].amount) } });
  } catch (err) {
    console.error("UPDATE SCHEDULED PAYMENT ERROR:", err.message);
    res.status(500).json({ error: "Could not update scheduled payment." });
  }
});

app.delete("/scheduled-payments/:id", authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM scheduled_payments WHERE id = $1 AND user_id = $2 RETURNING id",
      [Number(req.params.id), req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Scheduled payment not found." });
    res.json({ message: "Scheduled payment deleted." });
  } catch (err) {
    console.error("DELETE SCHEDULED PAYMENT ERROR:", err.message);
    res.status(500).json({ error: "Could not delete scheduled payment." });
  }
});

app.post("/demo/seed", authRequired, async (req, res) => {
  try {
    await seedDemoDataForUser(req.user.id);
    const context = await getFinanceContext(req.user.id);
    console.log("DEMO DATA SEEDED FOR USER:", req.user.email);
    res.json({
      message: "Demo accounts, transactions, and budgets were added for this user.",
      summary: {
        total_balance: context.totalBalance,
        total_income: context.totalIncome,
        total_expenses: context.totalExpenses,
        net_savings: context.netSavings,
      },
    });
  } catch (err) {
    console.error("DEMO SEED ERROR:", err.message);
    res.status(500).json({ error: "Could not seed demo data." });
  }
});

app.post("/api/demo/seed", authRequired, async (req, res) => {
  try {
    await seedDemoDataForUser(req.user.id);
    const context = await getFinanceContext(req.user.id);
    res.json({
      message: "Demo accounts, transactions, and budgets were added for this user.",
      summary: {
        total_balance: context.totalBalance,
        total_income: context.totalIncome,
        total_expenses: context.totalExpenses,
        net_savings: context.netSavings,
      },
    });
  } catch (err) {
    console.error("API DEMO SEED ERROR:", err.message);
    res.status(500).json({ error: "Could not seed demo data." });
  }
});

app.get("/dashboard", authRequired, async (req, res) => {
  const userId = req.user.id;
  const summary = await pool.query(
    `SELECT
       COALESCE((SELECT SUM(balance) FROM accounts WHERE user_id = $1), 0) AS total_balance,
       COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
       COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
     FROM transactions
     WHERE user_id = $1`,
    [userId]
  );
  const accounts = await pool.query(
    "SELECT id, account_name AS name, balance, account_type FROM accounts WHERE user_id = $1 ORDER BY id",
    [userId]
  );
  const recent = await pool.query(
    `SELECT t.*, a.account_name
     FROM transactions t
     LEFT JOIN accounts a ON a.id = t.account_id
     WHERE t.user_id = $1
     ORDER BY t.transaction_date DESC, t.id DESC
     LIMIT 5`,
    [userId]
  );
  const category = await pool.query(
    `SELECT category, SUM(amount) AS total
     FROM transactions
     WHERE user_id = $1 AND transaction_type = 'expense'
     GROUP BY category
     ORDER BY total DESC`,
    [userId]
  );
  const monthly = await pool.query(
    `SELECT TO_CHAR(transaction_date, 'DD Mon') AS name,
            transaction_date AS day,
            SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE user_id = $1
       AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'
     GROUP BY transaction_date, name
     ORDER BY transaction_date`,
    [userId]
  );

  res.json({
    summary: {
      total_balance: money(summary.rows[0].total_balance),
      total_income: money(summary.rows[0].total_income),
      total_expenses: money(summary.rows[0].total_expenses),
    },
    accounts: accounts.rows.map((row) => ({ ...row, balance: money(row.balance) })),
    recentTransactions: recent.rows.map(formatTransaction),
    categorySummary: category.rows.map((row) => ({ category: row.category, total: money(row.total) })),
    monthly: monthly.rows.map((row) => ({
      name: row.name,
      income: money(row.income),
      expense: money(row.expense),
    })),
  });
});

app.get("/analytics", authRequired, async (req, res) => {
  const dashboardReq = { ...req };
  const summary = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
       COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
     FROM transactions WHERE user_id = $1`,
    [dashboardReq.user.id]
  );
  const category = await pool.query(
    `SELECT category, SUM(amount) AS total
     FROM transactions
     WHERE user_id = $1 AND transaction_type = 'expense'
     GROUP BY category
     ORDER BY total DESC`,
    [dashboardReq.user.id]
  );
  const monthly = await pool.query(
    `SELECT TO_CHAR(transaction_date, 'DD Mon') AS name,
            transaction_date AS day,
            SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE user_id = $1
       AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'
     GROUP BY transaction_date, name
     ORDER BY transaction_date`,
    [dashboardReq.user.id]
  );

  const totalIncome = money(summary.rows[0].total_income);
  const totalExpenses = money(summary.rows[0].total_expenses);
  res.json({
    summary: {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_savings: totalIncome - totalExpenses,
      savings_rate: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0,
    },
    categorySummary: category.rows.map((row) => ({ category: row.category, total: money(row.total) })),
    monthly: monthly.rows.map((row) => ({ name: row.name, income: money(row.income), expense: money(row.expense) })),
  });
});

const handleAiChat = async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (message.length > 600) {
      return res.status(400).json({ error: "Message is too long. Keep it under 600 characters." });
    }

    const context = await getFinanceContext(req.user.id);
    const prompt = buildAiPrompt(message, context);

    if (process.env.OPENAI_API_KEY && OpenAI) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt,
      });

      const reply = response.output_text || fallbackAiReply(message, context);
      return res.json({ reply, source: "openai" });
    }

    res.json({ reply: fallbackAiReply(message, context), source: "fallback" });
  } catch (err) {
    console.error("AI CHAT ERROR:", err.message);
    res.status(500).json({ error: "Could not generate assistant response." });
  }
};

app.post("/api/ai/chat", authRequired, handleAiChat);
app.post("/ai-assistant", authRequired, handleAiChat);

const server = app.listen(PORT, () => {
  console.log(`TRACK backend running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other server or change PORT in backend/backend/.env.`);
    return;
  }

  console.error("SERVER ERROR:", err.message);
});
