# Fase 2 — Páginas internas do ClassRPG

Adicionar as 8 rotas funcionais que faltam, mais um Custom404 global, mantendo a base do ZIP, o design system (oklch dark + glass) e os componentes já criados (`XPBar`, `MissionCard`, `AchievementCard`, `RankingTable`, charts, `AppShell`, etc.). Tudo segue mockado (sem backend).

## Rotas a criar (`src/routes/`)

1. **`ranking.tsx`** → `/ranking` (aluno)
   - Filtros: turma, escola, período (Semana / Mês / Geral)
   - Pódio Top 3 (cards destacados com patente + XP)
   - `RankingTable` completo com paginação visual
   - Card lateral "Sua posição" com delta de subida/queda

2. **`missions.tsx`** → `/missions` (aluno)
   - Tabs: Diárias / Semanais / Especiais / Eventos / Desafios
   - Grid de `MissionCard` filtrado por status (disponível, em andamento, concluída, expirada)
   - Barra de XP semanal acumulada no topo

3. **`activities.tsx`** → `/activities` (aluno)
   - Lista de atividades por matéria com `DifficultyBadge`
   - Filtros: status (pendente, enviada, avaliada), matéria
   - Cada item linka para `/activity/$id`

4. **`activity.$id.tsx`** → `/activity/:id` (aluno)
   - Detalhe da atividade: enunciado, anexos mock, prazo, recompensa
   - Editor de resposta (textarea) + botão "Enviar"
   - Estado pós-envio: nota mock + feedback do professor + animação de XP ganho

5. **`achievements.tsx`** → `/achievements` (aluno)
   - Grid de `AchievementCard` agrupado por raridade (common → legendary)
   - Filtro: conquistadas / bloqueadas / todas
   - Header com progresso global (X de Y conquistas)

6. **`teams.tsx`** → `/teams` (aluno)
   - Card da equipe atual (emblema, membros, XP coletivo)
   - Ranking de equipes da escola
   - Lista de membros com mini-perfis e contribuição individual

7. **`reports.tsx`** → `/reports` (professor)
   - KPIs: engajamento médio, missões concluídas, XP distribuído
   - `ProgressChart`, `EngagementChart`, `SkillsRadar`, `GrowthChart`
   - Tabela de alunos com performance + botão "Exportar" (mock)

8. **`notifications.tsx`** → `/notifications` (todos os papéis)
   - Lista cronológica de `MOCK_NOTIFICATIONS`
   - Filtros por tipo (xp, missão, conquista, sistema, feedback)
   - Ações: marcar como lida / marcar todas / limpar

## 404 global

- Substituir o `NotFoundComponent` genérico em `src/routes/__root.tsx` por um **Custom404** com tema ClassRPG: ilustração "missão não encontrada", botão "Voltar ao QG" (link `/student`), microcopy gamificada.

## Ajustes no AppShell

Hoje todos os itens da sidebar apontam para a mesma rota (`/student`, `/teacher`, `/admin`). Corrigir o mapa `NAV` para usar as rotas reais:

- **student**: `/student`, `/missions`, `/activities`, `/ranking`, `/achievements`, `/teams`, `/notifications`
- **teacher**: `/teacher`, `/activities`, `/missions`, `/reports`, `/notifications`
- **admin**: `/admin`, `/reports`, `/notifications`

Active state passa a ser baseado em `path === item.to` (não mais índice fixo). Sino de notificações no header também vira `<Link to="/notifications">`.

## Mock data — extensões em `src/data/mockData.ts`

- `MOCK_ACTIVITIES`: ~8 atividades (matérias variadas, status mistos, 1–2 já avaliadas com feedback)
- `MOCK_TEAMS_DETAILED`: equipes com lista de membros (ids) + XP semanal
- Garantir `MOCK_MISSIONS` cobre todos os tipos (`daily`, `weekly`, `special`, `event`, `challenge`)
- `MOCK_NOTIFICATIONS` já existe; expandir para ~10 itens cobrindo todos os tipos

## Detalhes técnicos

- Cada rota: `createFileRoute("/<path>")` + `head()` próprio (title + description PT-BR) + `errorComponent` (reuso do padrão do `__root`) + `notFoundComponent` quando aplicável
- Páginas envoltas em `<AppShell role="..." title="...">`
- Tipos novos (`Activity` detalhada com `feedback`, `submission`) adicionados em `src/types/index.ts`
- Componentes reutilizáveis criados se necessário: `NotificationItem`, `TeamCard`, `ActivityListItem`, `Podium` (Top 3)
- Sem novas dependências; usa Recharts/shadcn/lucide já instalados
- `routeTree.gen.ts` é regenerado automaticamente pelo plugin Vite

## Fora de escopo (fica para Fase 3)

- Backend real / Lovable Cloud
- Páginas de admin específicas (escolas, professores, alunos)
- Página de perfil editável, configurações, sistema de XP em tempo real