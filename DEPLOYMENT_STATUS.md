# ClassRPG - Vercel Deployment Status

**Data:** Junho 2026  
**Status:** ✅ PRONTO PARA DEPLOY

---

## ✅ Completado Nesta Sessão

### Frontend
- [x] Corrigido `vercel.json` - SPA rewrites para client-side routing
- [x] Atualizado `api.ts` - API base URL dinâmica via `VITE_API_BASE`
- [x] Criado `.env.production` - Template para URL do backend

### Backend  
- [x] Confirmado `vercel.json` - Está correto
- [x] Confirmado `server.js` - Exports e condicional Vercel OK
- [x] Atualizado `.env.example` - Agora inclui URLs Vercel

### Migrações Anteriores
- [x] Tailwind CSS v4 com @tailwindcss/postcss
- [x] Removido Admin do login (mantém Student/Teacher)
- [x] MockData removido - API real integrada
- [x] Todas as páginas usando dados reais do backend
- [x] Autenticação JWT implementada

---

## 🔧 Configuração Necessária (IMPORTANTE)

### Seu Backend URL (Vercel)
Você precisa:
1. Acessar [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Ir para seu projeto backend
3. Copiar a URL de produção (ex: `https://classrpg-backend.vercel.app`)
4. Atualizar `frontend/.env.production`:
   ```
   VITE_API_BASE=https://SEU_BACKEND.vercel.app/api
   ```

### Variáveis de Ambiente (Vercel Dashboard)

**Backend** (`Settings → Environment Variables`):
```
NODE_ENV = production
DATABASE_URL = postgresql://... (Supabase)
JWT_SECRET = seu-secret-forte
CORS_ORIGIN = https://SEU_FRONTEND.vercel.app
PGSSLMODE = require
```

**Frontend** (Vercel pode detectar `.env.production` automaticamente):
```
VITE_API_BASE = https://SEU_BACKEND.vercel.app/api
```

---

## 📋 Checklist Final

- [ ] Atualizar `frontend/.env.production` com URL real do backend
- [ ] Configurar variáveis de ambiente no dashboard Vercel (backend)
- [ ] Fazer commit: `git add . && git commit -m "fix: vercel deployment configuration"`
- [ ] Push: `git push origin main`
- [ ] Aguardar deploy automático (~2-5 min cada projeto)
- [ ] Testar frontend: acessar `/student` sem 404
- [ ] Testar login: verificar chamada API em DevTools

---

## 🧪 Teste Local (Antes de Push)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
VITE_API_BASE=http://localhost:3001/api npm run dev
```

Login em http://localhost:8081 com credenciais de teste do banco.

---

## 📊 Arquitetura Atual

```
ClassRPG (Monorepo)
│
├─ Frontend (React 19 + TypeScript + Vite)
│  ├ Vercel
│  ├ vercel.json ✓
│  ├ .env.production ✓
│  └ src/api.ts (dinâmico) ✓
│
├─ Backend (Express + PostgreSQL)
│  ├ Vercel
│  ├ vercel.json ✓
│  ├ server.js (exports Vercel) ✓
│  └ src/config.js (env vars) ✓
│
└─ Database: Supabase PostgreSQL
```

---

## ⚠️ Possíveis Problemas & Soluções

| Problema | Solução |
|----------|---------|
| Frontend: 404 em `/student` | Confirmar `vercel.json` existe com rewrites |
| Frontend: CORS error ao fazer login | Verificar `CORS_ORIGIN` no backend Vercel |
| Frontend: API retorna 404 | Verificar `VITE_API_BASE` correto em `.env.production` |
| Backend: DATABASE_URL vazio | Adicionar `DATABASE_URL` em Vercel Environment Variables |
| Backend: JWT error no login | Verificar `JWT_SECRET` configurado no Vercel |

---

**Próximo passo:** Atualizar `VITE_API_BASE` com sua URL real e fazer push! 🚀
