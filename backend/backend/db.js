const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = String(process.env.DATABASE_URL || "").trim();
const hasDatabaseUrl = Boolean(databaseUrl);

const sharedPoolOptions = {
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
};

const neonSsl =
  process.env.PGSSLMODE === "disable"
    ? false
    : {
        rejectUnauthorized: false,
      };

const pool = hasDatabaseUrl
  ? new Pool({
      ...sharedPoolOptions,
      connectionString: databaseUrl,
      ssl: neonSsl,
    })
  : new Pool({
      ...sharedPoolOptions,
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: isProduction
        ? {
            rejectUnauthorized: false,
          }
        : false,
    });

pool.on("error", (err) => {
  console.error("DATABASE POOL ERROR:", err);
});

module.exports = pool;
