import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

const adapter = new PrismaPg(pool, {
  schema: "public",
});

export const prisma = new PrismaClient({ adapter } as any);
export const db = prisma;

export async function q<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(text, params ?? []);
  return result.rows || [];
}

export async function qOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await pool.query(text, params ?? []);
  return result.rows[0] ?? null;
}

export const pool_legacy = {
  query: async (text: string, params: any[] = []) => {
    return pool.query(text, params);
  },
  end: async () => {
    await pool.end();
  },
};