import "dotenv/config";
import { defineConfig, env } from "prisma/config"; // 💡 Importado o 'env' nativo do Prisma

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"), // ✨ Sem a necessidade de @ts-ignore
  },
  migrations: {
    // ⚔️ npx garante a execução correta tanto local (Windows) quanto no Render (Linux)
    seed: "npx ts-node ./prisma/seed.ts", 
  },
});