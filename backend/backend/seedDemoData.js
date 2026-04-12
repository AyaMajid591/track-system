const bcrypt = require("bcrypt");
const pool = require("./db");

const demoEmail = process.env.DEMO_USER_EMAIL || "demo@track.local";
const demoPassword = process.env.DEMO_USER_PASSWORD || "password123";
const demoName = process.env.DEMO_USER_NAME || "Demo User";
const demoNote = "demo-seed";

const dateDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
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

const getOrCreateDemoUser = async () => {
  const existing = await pool.query("SELECT id, email FROM users WHERE email = $1", [
    demoEmail,
  ]);

  if (existing.rows[0]) {
    await pool.query("UPDATE users SET name = $1, phone = $2 WHERE id = $3", [
      demoName,
      "+60 123 456 789",
      existing.rows[0].id,
    ]);
    return existing.rows[0];
  }

  const hashedPassword = await bcrypt.hash(demoPassword, 10);
  const created = await pool.query(
    "INSERT INTO users (name, email, password, phone, plan) VALUES ($1, $2, $3, $4, 'Free') RETURNING id, email",
    [demoName, demoEmail, hashedPassword, "+60 123 456 789"]
  );

  return created.rows[0];
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
        const created = await client.query(
          `INSERT INTO accounts (user_id, account_name, balance, account_type)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [userId, name, balance, type]
        );
        accountIds[name] = created.rows[0].id;
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

const main = async () => {
  await ensureTables();
  const user = await getOrCreateDemoUser();
  await seedDemoDataForUser(user.id);
  console.log("Demo data ready.");
  console.log(`Login email: ${demoEmail}`);
  console.log(`Login password: ${demoPassword}`);
};

main()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
