# ⚔️ ClassRPG

Plataforma web de gamificação educacional. Transforma a rotina de sala de aula em um RPG — alunos ganham XP, sobem de nível, completam missões e competem no ranking enquanto realizam atividades escolares.

🌐 **Demo:** [classrpg.classrpg.workers.dev](https://classrpg.classrpg.workers.dev/) · **API:** [class-rpg-t11x.vercel.app/api/health](https://class-rpg-t11x.vercel.app/api/health)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Como rodar localmente](#como-rodar-localmente)
- [Banco de Dados](#banco-de-dados)
- [Frontend](#frontend)
- [Backend](#backend)
- [Deploy](#deploy)

---

## Visão Geral

O ClassRPG é um monorepo com duas aplicações independentes: um frontend em React e um backend em Node.js/Express, conectados a um banco PostgreSQL hospedado no Supabase.

```
ClassRPG/
├── frontend/   ← React 19 + TypeScript + Vite
└── backend/    ← Node.js + Express + PostgreSQL
```

**Fluxo principal:** o aluno acessa a plataforma, visualiza suas atividades como quests, submete respostas e recebe XP automaticamente. O XP acumulado sobe o nível e desbloqueia patentes. As equipes acumulam XP coletivo e competem no ranking semanal. Professores têm um painel separado para acompanhar o progresso da turma.

**Sistema de patentes:**

| Patente | XP mínimo |
|---|---|
| Novato | 0 |
| Aprendiz | 500 |
| Guerreiro Acadêmico | 1.500 |
| Mestre Estratégico | 3.500 |
| Lenda da Turma | 7.000 |

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (local ou Supabase)

### 1. Clone o repositório

```bash
git clone https://github.com/EvairFS/ClassRPG.git
cd ClassRPG
```

### 2. Configure o Backend

```bash
cd backend
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://usuario:senha@localhost:5432/classrpg
JWT_SECRET=sua_chave_secreta
CORS_ORIGIN=http://localhost:5173
PGSSLMODE=disable
```

Instale as dependências e inicie:

```bash
npm install
npm run dev
```

A API estará disponível em `http://localhost:3001`.

### 3. Configure o Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

### Usuários de teste

| Perfil | E-mail | Senha |
|---|---|---|
| Aluno | `aluno@classrpg.com` | `aluno123` |
| Professor | `prof@classrpg.com` | `professor123` |

> Para criar esses usuários, rode o script `backend/seed_test_users.sql` no seu banco.

---

## Banco de Dados

PostgreSQL com 10 tabelas. O schema completo está em `backend/schema.sql`.

### Configurar o banco

**Opção 1 — Supabase (recomendado para produção)**

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Acesse **SQL Editor** e execute o conteúdo de `backend/schema.sql`
3. Copie a **Connection String (pooler)** e use como `DATABASE_URL`

**Opção 2 — PostgreSQL local**

```bash
psql -U postgres -c "CREATE DATABASE classrpg;"
psql -U postgres -d classrpg -f backend/schema.sql
```

**Opção 3 — Docker**

```bash
docker run --name classrpg-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=classrpg \
  -p 5432:5432 -d postgres:16
```

### Tabelas

| Tabela | Descrição |
|---|---|
| `users` | Credenciais de login (email + senha bcrypt + role) |
| `students` | Perfil gamificado: XP, nível, patente, streak |
| `teachers` | Perfil do professor: matéria, turmas, status |
| `teams` | Equipes com XP coletivo e XP semanal |
| `team_members` | Pivô N:N alunos ↔ equipes |
| `achievements` | Conquistas com raridade |
| `student_achievements` | Progresso de cada aluno em cada conquista |
| `missions` | Missões diárias/semanais/especiais com XP reward |
| `activities` | Tarefas escolares com dificuldade, prazo e nota |
| `notifications` | Notificações por usuário (XP, missão, conquista, sistema) |

---

## Frontend

### Stack

| Tecnologia | Versão | Função |
|---|---|---|
| React | 19 | Base da aplicação |
| TypeScript | 5 | Tipagem estática |
| Vite | 7 | Bundler |
| Tailwind CSS | 4 | Estilização utilitária |
| shadcn/ui (Radix) | — | Componentes acessíveis |
| react-router-dom | 6 | Roteamento |
| TanStack React Query | 5 | Cache e fetching de dados |
| react-hook-form + zod | — | Formulários com validação |
| recharts | — | Gráficos |
| lucide-react | — | Ícones |

### Estrutura

```
frontend/src/
├── api.ts                  ← Todos os calls HTTP centralizados
├── types/index.ts          ← Tipagem global (Student, Teacher, Mission…)
├── lib/
│   ├── gamification.ts     ← Lógica de XP, níveis e patentes
│   └── utils.ts            ← Helpers (cn)
├── pages/                  ← Páginas da aplicação
├── components/
│   ├── ui/                 ← Primitivos do shadcn
│   ├── layout/             ← AppShell e AuthLayout
│   ├── gamification/       ← XPBar, ProfileHeader, MissionCard…
│   └── charts/             ← Gráficos com recharts
└── index.css               ← Tema visual dark RPG
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_BASE` | URL base da API (ex: `https://class-rpg-t11x.vercel.app/api`) |

---

## Backend

### Stack

| Tecnologia | Função |
|---|---|
| Node.js (ESM) + Express | Servidor HTTP |
| PostgreSQL (`pg`) | Banco de dados |
| JSON Web Token | Autenticação |
| bcryptjs | Hash de senhas |
| zod | Validação de entrada |
| helmet | Headers de segurança |
| express-rate-limit | Rate limiting |

### Estrutura

```
API/
├── server.ts               ← Entry point, monta middlewares e rotas
├── schema.sql              ← DDL completo do banco
└── src/
    ├── config.ts           ← Variáveis de ambiente
    ├── db.ts               ← Pool de conexão e helpers de query
    ├── middleware/
    │   ├── auth.ts         ← JWT: requireAuth, optionalAuth, requireRole
    │   ├── errorHandler.ts ← Tratamento centralizado de erros
    │   └── validate.ts     ← Validação com Zod
    ├── routes/             ← Um arquivo por recurso
    └── utils/
        ├── errors.ts       ← Classes de erro customizadas
        ├── pagination.ts   ← Parsing de ?page= e ?limit=
        └── response.ts     ← Helpers success(), created(), paginated()
```

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/login` | Autenticação, retorna JWT |
| POST | `/api/register` | Cria usuário (aluno ou professor) |
| GET | `/api/students` | Lista alunos com conquistas |
| GET | `/api/teachers` | Lista professores |
| GET | `/api/activities` | Lista atividades |
| POST | `/api/activities/:id/submit` | Submete atividade e concede XP |
| GET | `/api/missions` | Lista missões |
| GET | `/api/achievements` | Lista conquistas |
| GET | `/api/notifications` | Lista notificações do usuário |
| GET | `/api/teams` | Lista equipes |
| GET | `/api/ranking` | Ranking de alunos e equipes |
| GET | `/api/dashboard/student` | Dados agregados do dashboard do aluno |
| GET | `/api/dashboard/teacher` | Dados agregados do dashboard do professor |
| GET | `/api/health` | Health check |

### Autenticação

JWT com expiração de 7 dias. O payload contém `{ id, email, role, name }`.

- **`requireAuth`** — obrigatório; retorna 401 se o token estiver ausente ou inválido
- **`optionalAuth`** — não falha se não houver token
- **`requireRole(...roles)`** — RBAC: verifica se `req.user.role` está na lista permitida

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `JWT_SECRET` | Chave secreta para assinar tokens |
| `CORS_ORIGIN` | URL do frontend (ex: `https://classrpg.vercel.app`) |
| `NODE_ENV` | `production` em produção |
| `PGSSLMODE` | `require` para conexões SSL (Supabase) |

---

## Deploy

O projeto é hospedado na **Vercel** como dois projetos separados, com banco no **Supabase**.

### Frontend

- **Root Directory:** `frontend`
- **Framework:** Vite
- **Variável obrigatória:** `VITE_API_BASE` apontando para a URL do backend

### Backend

- **Root Directory:** `backend`
- **Framework:** Other
- **Variáveis obrigatórias:** `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV`, `PGSSLMODE`

---

## Licença

MIT © [EvairFS](https://github.com/EvairFS)