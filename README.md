# ⚔️ ClassRPG

Plataforma web de gamificação educacional. Transforma a rotina de sala de aula em um RPG — alunos ganham XP, sobem de nível, completam missões e competem no ranking enquanto realizam atividades escolares.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Frontend](#frontend)
- [Backend](#backend)
- [Banco de Dados](#banco-de-dados)
- [Deploy](#deploy)

---

## Visão Geral

O ClassRPG é um monorepo com duas aplicações independentes: um frontend em React e um backend em Node.js/Express, conectados a um banco PostgreSQL (Supabase).

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
├── data/mockData.ts        ← Dados de desenvolvimento
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

### Tema visual

Visual dark com estética RPG definido via variáveis CSS no `@theme` do Tailwind v4:

- **Background:** azul-escuro quase preto
- **Primary:** azul vibrante (ações, botões)
- **Accent:** dourado (XP, destaques, conquistas)
- **Border-radius:** `0px` — visual quadrado/angular
- **Animações:** `xp-fill` (barra de XP), `xp-pop` (número flutuante +XP), `fade-up`, `beam-reveal`

### Lógica de gamificação (`lib/gamification.ts`)

Toda a lógica de progressão fica desacoplada dos componentes:

- **Nível:** `floor(xp / 250) + 1` — a cada 250 XP sobe um nível
- **Patente:** calculada por faixas de XP, cada uma com nome e cor
- **Dificuldades:** Easy / Medium / Hard / Epic com multiplicadores 1×, 1.5×, 2× e 3×
- **Raridade de conquistas:** common, rare, epic, legendary

### Variável de ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_BASE` | URL base da API (ex: `https://classrpg-api.vercel.app/api`) |

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
backend/
├── server.js               ← Entry point, monta middlewares e rotas
└── src/
    ├── config.js           ← Variáveis de ambiente
    ├── db.js               ← Pool de conexão e helpers de query
    ├── middleware/
    │   ├── auth.js         ← JWT: requireAuth, optionalAuth, requireRole
    │   ├── errorHandler.js ← Tratamento centralizado de erros
    │   └── validate.js     ← Validação com Zod
    ├── routes/             ← Um arquivo por recurso
    └── utils/
        ├── errors.js       ← Classes de erro customizadas
        ├── pagination.js   ← Parsing de ?page= e ?limit=
        └── response.js     ← Helpers success(), created(), paginated()
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
| `PGSSLMODE` | `require` para conexões SSL |

---

## Banco de Dados

PostgreSQL com 9 tabelas:

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

## Deploy

O projeto é hospedado na **Vercel** como dois projetos separados.

### Frontend

- **Root Directory:** `frontend`
- **Framework:** Vite
- **Variável obrigatória:** `VITE_API_BASE` apontando para a URL do backend

### Backend

- **Root Directory:** `backend`
- **Framework:** Other
- **Variáveis obrigatórias:** `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV`, `PGSSLMODE`

> O banco de dados permanece no **Supabase** (PostgreSQL). Apenas as aplicações rodam na Vercel.
