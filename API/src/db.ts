import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
export const db = prisma;

/**
 * Função 'q' — recebe array de params, retorna array de resultados
 */
export async function q<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await prisma.$queryRawUnsafe<any>(text, ...(params ?? []));
  return result || [];
}

/**
 * Função 'qOne' — recebe array de params, retorna primeiro ou null
 */
export async function qOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await prisma.$queryRawUnsafe<any>(text, ...(params ?? []));
  if (Array.isArray(result) && result.length > 0) {
    return result[0] as T;
  }
  return null;
}

export const pool_legacy = {
  query: async (text: string, params: any[] = []) => {
    return prisma.$queryRawUnsafe(text, ...params);
  },
  end: async () => {
    await prisma.$disconnect();
  },
};