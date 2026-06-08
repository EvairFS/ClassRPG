import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // @ts-ignore
    url: process.env.DATABASE_URL,
  },
  migrations: {
    // ⚔️ Adicionado o 'npx' na frente para o Windows encontrar o executor local
    seed: "npx ts-node ./prisma/seed.ts", 
  },
})