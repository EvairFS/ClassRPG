import dotenv from "dotenv";

// Carrega as variáveis do arquivo .env
dotenv.config();

export const NODE_ENV: string = process.env.NODE_ENV || "development";
export const PORT: number = Number(process.env.PORT) || 3000;
export const DATABASE_URL: string | undefined = process.env.DATABASE_URL;
export const USE_DB_SSL: boolean = process.env.USE_DB_SSL === "true";

// Configuração estática do banco de dados
export const DB = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "classrpg",
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT) || 5432,
};