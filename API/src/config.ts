import dotenv from "dotenv";

// Carrega as variáveis do arquivo .env para o process.env
dotenv.config();

// 💡 Tratamos a porta para garantir que ela seja exportada como um número válido
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// 🔐 Chave secreta do JWT com um fallback seguro para ambiente de desenvolvimento
export const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_super_segura_do_class_rpg";

// 🌍 Ambiente atual do Node (development, production, test)
export const NODE_ENV = process.env.NODE_ENV || "development";

// 🗄️ URL de conexão do PostgreSQL
export const DATABASE_URL = process.env.DATABASE_URL;

// 🛡️ Validação Crítica: Impede que a API suba em produção se esquecerem do banco de dados
if (!DATABASE_URL && NODE_ENV === "production") {
  throw new Error("🚨 ERRO CRÍTICO: A variável DATABASE_URL precisa ser definida no ambiente de produção!");
}