import pg from "pg";
import { DB } from "./config.js";
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString)

const pool = new pg.Pool({
  host: DB.host,
  port: DB.port,
  user: DB.user,
  password: DB.password,
  database: DB.database,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.query("SELECT 1").catch((err) => {
  console.error("⚠️  Database connection failed:", err.message);
  console.error("   Make sure PostgreSQL is running and the database exists.");
});

/**
 * Execute a query and return the rows.
 */
export function q(text, params) {
  return pool.query(text, params).then((r) => r.rows);
}

/**
 * Execute a query and return a single row, or null.
 */
export async function qOne(text, params) {
  const rows = await q(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute a query with count (for pagination).
 * Returns { rows, count }.
 */
export async function qWithCount(text, params, countText, countParams) {
  const [rows, countResult] = await Promise.all([
    q(text, params),
    q(countText || `SELECT COUNT(*) FROM (${text}) AS sub`, countParams || params),
  ]);
  return { rows, total: parseInt(countResult[0].count, 10) };
}

/**
 * Get a client from the pool for transactions.
 */
export function getClient() {
  return pool.connect();
}

export default sql
export default pool;