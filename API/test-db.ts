import { prisma } from "./src/db.js"; // Importa o cliente Prisma corrigido

async function testConnection() {
  console.log("🔄 Testando conexão com o banco de dados via Prisma...");
  
  try {
    // Executa uma query simples usando o Prisma para validar o banco
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Conexão com o banco de dados via Prisma bem-sucedida!");
  } catch (err: unknown) {
    console.error("❌ Erro ao conectar no banco de dados com Prisma:");
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();