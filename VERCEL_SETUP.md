# ClassRPG Deploy na Vercel - Guia de Configuração

## ✅ Arquivos Corrigidos

### 1. ✓ `frontend/vercel.json` (CRIADO)
- Adicionadas rewrites para SPA (Single Page Application)
- Garante que rotas como `/student`, `/teacher` funcionem sem 404

### 2. ✓ `frontend/src/api.ts` (ATUALIZADO)
```typescript
// Antes (hardcoded):
const BASE_URL = "http://localhost:3001/api";

// Depois (dinâmico):
const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:3001/api";
```
- Agora usa variável de ambiente `VITE_API_BASE`
- Fallback para localhost em desenvolvimento

### 3. ✓ `frontend/.env.production` (CRIADO)
- Contém URL do backend para produção
- **⚠️ PRECISA SER ATUALIZADO** com a URL real do seu backend

### 4. ✓ `backend/vercel.json` (JÁ ESTAVA CORRETO)
- Configuração de deploy já está correta

### 5. ✓ `backend/server.js` (JÁ ESTAVA CORRETO)
- Export e condicional para Vercel já estão corretos

---

## 🔧 Próximas Etapas (IMPORTANTE)

### Passo 1: Descobrir a URL do Backend na Vercel

1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique no seu projeto de backend (`classrpg-backend` ou similar)
3. Vá em **Deployments**
4. Copie a URL da produção (exemplo: `https://classrpg-backend.vercel.app`)

### Passo 2: Atualizar `frontend/.env.production`

Abra o arquivo criado em `frontend/.env.production` e atualize:

```
VITE_API_BASE=https://SEU_BACKEND.vercel.app/api
```

**Substitua `SEU_BACKEND.vercel.app` pela URL real copiada acima.**

### Passo 3: Configurar Variáveis de Ambiente no Backend (Vercel)

No painel da Vercel do seu backend:

1. Vá em **Settings** → **Environment Variables**
2. Adicione/atualize:

```
NODE_ENV = production
DATABASE_URL = postgresql://...  (URL do Supabase)
JWT_SECRET = seu-secret-forte
CORS_ORIGIN = https://SEU_FRONTEND.vercel.app
PGSSLMODE = require
```

**Substitua `SEU_FRONTEND.vercel.app` pela URL real do seu frontend.**

### Passo 4: Fazer Commit e Push

```bash
git add frontend/vercel.json frontend/.env.production frontend/src/api.ts
git commit -m "fix: configurar deploy Vercel - corrigir 404 e API base URL"
git push origin main
```

### Passo 5: Aguardar Deploy

- Vercel detectará as mudanças e fará redeploy automático de ambos os projetos
- Ou clique em **Redeploy** manualmente em cada projeto

---

## ✅ Checklist de Verificação

Após o deploy:

- [ ] Acessar `/student` diretamente na URL do frontend - sem 404
- [ ] Acessar `/teacher` diretamente - sem 404
- [ ] Fazer login - sem erros de CORS
- [ ] Dashboard carrega com dados reais da API
- [ ] URL do backend no DevTools (F12 → Network) mostra `https://SEU_BACKEND.vercel.app/api/...`

---

## 🐛 Testando Localmente

Antes de fazer push, você pode testar localmente:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Acesse [http://localhost:8081](http://localhost:8081) e teste o login.

---

## 📝 URLs Finais Esperadas

```
Frontend:  https://classrpg-web.vercel.app
Backend:   https://classrpg-backend.vercel.app
API:       https://classrpg-backend.vercel.app/api
Database:  Supabase PostgreSQL
```

---

## ❓ Se Ainda Houver Erros

### Erro: "CORS error"
- Verificar que `CORS_ORIGIN` no backend inclui a URL do frontend
- Exemplo: `https://classrpg-web.vercel.app`

### Erro: "Backend returns 404"
- Verificar que `VITE_API_BASE` está correto em `.env.production`
- Verificar que o backend está respondendo em `https://SEU_BACKEND.vercel.app/api/health`

### Erro: "Frontend shows 404 on /student"
- Verificar que `frontend/vercel.json` existe com rewrites corretos
- Fazer redeploy manual do frontend

---

**Última atualização:** 1 de junho de 2026
