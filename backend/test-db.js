import "dotenv/config";
import pg from "pg";
import { DB } from "./src/config.js";

const pool = new pg.Pool({
  host: DB.host,
  port: DB.port,
  user: DB.user,
  password: DB.password,
  database: DB.database,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

async function main() {
  try {
    const result = await pool.query("SELECT 1 AS status");
    console.log("✅ Database connection successful.");
    console.log("   Result:", result.rows[0]);

    const sample = await pool.query("SELECT COUNT(*) AS students_count FROM students");
    console.log(`   Students table rows: ${sample.rows[0].students_count}`);
  } catch (error) {
    console.error("🔥 Database connection failed:", error.message || error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
