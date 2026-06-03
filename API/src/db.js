import pg from "pg";
import { DATABASE_URL } from "./config.js";

if (!DATABASE_URL) {
  console.error("❌ Erro grave: DATABASE_URL não foi encontrada no arquivo .env!");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 🌟 A função 'q' que estava faltando para o seu auth.js!
export const q = async (text, params) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows; // Retorna todas as linhas encontradas
  } finally {
    client.release();
  }
};

// A função 'qOne' para buscar apenas um registro único (como um usuário pelo e-mail)
export const qOne = async (text, params) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows[0]; // Retorna apenas a primeira linha
  } finally {
    client.release();
  }
};

// Deixamos o qAll aqui também por garantia, caso outro arquivo use
export const qAll = q;

export default pool;