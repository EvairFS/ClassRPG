import pg from "pg";
import { DATABASE_URL } from "./config.js";

if (!DATABASE_URL) {
  console.error("❌ Erro grave: DATABASE_URL não foi encontrada no arquivo .env!");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // ◄ Isso desativa a exigência de certificado local e permite conectar na Supabase
  },
  max: 10, // Máximo de conexões simultâneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10 segundos de limite para conectar
});

// Função qOne que suas rotas (ex: auth.js linha 29) usam para buscar um único registro
export const qOne = async (text, params) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows[0]; // Retorna apenas a primeira linha encontrada
  } finally {
    client.release(); // Devolve a conexão para o pooler da Supabase
  }
};

// Caso alguma rota use uma busca de várias linhas (ex: listar alunos)
export const qAll = async (text, params) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows; // Retorna todas as linhas
  } finally {
    client.release();
  }
};

export default pool;