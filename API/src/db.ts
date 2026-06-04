import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // @ts-ignore

// ── Prisma com adapter pg (Prisma 7) ──
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

// ── Helper shortcuts para queries raw ──
export const q = async (text: string, params?: any[]) => {
  const res = await pool.query(text, params);
  return res.rows;
};

export const qOne = async (text: string, params?: any[]) => {
  const res = await pool.query(text, params);
  return res.rows[0] || null;
};

export const db = {
  async query(text: string, params?: any[]) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV !== "production") {
      console.log("executed query", { text, duration, rows: res.rowCount });
    }

    return res;
  },

  async getClient() {
    const client = await pool.connect();
    return {
      query: (text: string, params?: any[]) => client.query(text, params),
      release: client.release.bind(client),
    };
  },
};