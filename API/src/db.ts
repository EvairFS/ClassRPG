import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

// ── Adapter obrigatório no Prisma 7 ──
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// 1. Instancia o cliente do Prisma com adapter
export const prisma = new PrismaClient({ adapter });

// 2. Cria o apelido 'db' apontando para o Prisma
export const db = prisma;

/**
 * Função 'q' — retorna array de resultados
 */
export async function q<T = any>(text: string, ...params: any[]): Promise<T[]> {
  const result = await prisma.$queryRawUnsafe<any>(text, ...params);
  return result || [];
}

/**
 * Função 'qOne' — retorna primeiro registro ou null
 */
export async function qOne<T = any>(text: string, ...params: any[]): Promise<T | null> {
  const result = await prisma.$queryRawUnsafe<any>(text, ...params);
  if (Array.isArray(result) && result.length > 0) {
    return result[0] as T;
  }
  return null;
}

// 3. Pool legado para compatibilidade
export const pool_legacy = {
  query: async (text: string, params: any[] = []) => {
    return prisma.$queryRawUnsafe(text, ...params);
  },
  end: async () => {
    await prisma.$disconnect();
  },
};