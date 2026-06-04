import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";

// Inicializa o cliente do Prisma
export const prisma = new PrismaClient();

// Configuração do Pool do pg (raw queries) usando as variáveis de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = {
  /**
   * Executa uma query simples no banco de dados (Tipado para remover erro 7006)
   */
  async query(text: string, params?: any[]) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log opcional para debug em desenvolvimento
    if (process.env.NODE_ENV !== "production") {
      console.log("executed query", { text, duration, rows: res.rowCount });
    }
    
    return res;
  },

  /**
   * Retorna um único cliente do pool se precisar gerenciar transações manuais
   */
  async getClient() {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);
    
    return {
      // Tipando também o client interno caso use em outro lugar
      query: (text: string, params?: any[]) => query(text, params),
      release
    };
  }
};