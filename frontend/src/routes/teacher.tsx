import { useState } from "react"; // 👈 Adicionado useState
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/gamification/StatsCard";
import { RankingTable } from "@/components/gamification/RankingTable";
import { EngagementChart } from "@/components/charts/EngagementChart";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { MissionCard } from "@/components/gamification/MissionCard";
import { CLASS_ENGAGEMENT, STUDENT_PERF_WEEK } from "@/data/mockData";
import { Award, BookOpen, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/gamification/DifficultyBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ErrorState, LoadingState } from "@/components/common/QueryState";

// 👈 Importação dos novos modais funcionais
import { CreateActivityModal } from "@/components/teacher/CreateActivityModal";
import { CreateMissionModal } from "@/components/teacher/CreateMissionModal";

export const Route = createFileRoute("/teacher")({ component: TeacherDashboard });

function TeacherDashboard() {
  const { user, isAuthenticated, hydrated } = useAuth();

  // 👈 Estados para controle de abertura dos modais
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);

  const {
    data: dash,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", "teacher"],
    queryFn: api.getTeacherDashboard,
    enabled: hydrated && isAuthenticated,
  });

  const { data: missions } = useQuery({
    queryKey: ["missions", user?.id], // Boa prática: inclua o ID na chave para o cache não misturar dados
    queryFn: () => api.getMissions(user?.id ?? ""),
    enabled: hydrated && isAuthenticated && !!user?.id, // Só roda se tiver o ID do user em mãos
  });

  if (!hydrated || isLoading) {
    return (
      <AppShell role="teacher" title="Painel do Professor">
        <LoadingState label="Carregando painel…" />
      </AppShell>
    );
  }
  if (isError || !dash) {
    return (
      <AppShell role="teacher" title="Painel do Professor">
        <ErrorState error={error} onRetry={() => refetch()} />
      </AppShell>
    );
  }

  const t = dash.teachers.find((x) => x.id === user?.id) ?? dash.currentTeacher ?? dash.teachers[0];

  if (!t) {
    return (
      <AppShell role="teacher" title="Painel do Professor">
        <ErrorState label="Nenhum professor cadastrado ainda." />
      </AppShell>
    );
  }

  const obterNomeProfessor = () => {
    const nomeCompleto = user?.name || t?.name || "Docente";
    return nomeCompleto.split(" ")[0];
  };

  const avgXp = dash.stats.averageXp;

  return (
    <AppShell role="teacher" title={`Olá, Profa. ${obterNomeProfessor()}`}>
      <div className="space-y-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8 animate-fade-up">
          <div className="pointer-events-none absolute -top-20 right-0 size-72 rounded-full bg-secondary/25 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Painel do Professor
              </p>
              <h2 className="mt-1 text-2xl font-bold text-foreground">
                {t.subject} · Turmas {(t.classes ?? []).join(" e ") || "—"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {dash.stats.totalStudents} alunos ·{" "}
                {(missions ?? []).filter((m: { status: string }) => m.status !== "expired").length}{" "}
                {dash.stats.totalActivities} atividades
              </p>
            </div>
            <div className="flex gap-2">
              {/* 🎯 Botão Nova Missão Configurado */}
              <Button
                variant="outline"
                className="border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                onClick={() => setIsMissionModalOpen(true)}
              >
                Nova missão
              </Button>
              {/* 🎯 Botão Criar Atividade Configurado */}
              <Button
                className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                onClick={() => setIsActivityModalOpen(true)}
              >
                Criar atividade
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            label="Alunos ativos"
            value={dash.stats.totalStudents}
            delta={8}
            icon={Users}
            tint="primary"
          />
          <StatsCard
            label="Entregas"
            value={dash.activities.filter((a) => a.status !== "pending").length}
            delta={14}
            icon={BookOpen}
            tint="secondary"
          />
          <StatsCard
            label="XP médio"
            value={avgXp.toLocaleString("pt-BR")}
            delta={6}
            icon={Award}
            tint="accent"
          />
          <StatsCard
            label="Avaliadas"
            value={dash.activities.filter((a) => a.status === "graded").length}
            icon={MessageSquare}
            tint="muted"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="xl:col-span-2 glass rounded-2xl p-5">
            <header className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Engajamento das turmas</h2>
              <p className="text-xs text-muted-foreground">Últimas 6 semanas</p>
            </header>
            <EngagementChart data={CLASS_ENGAGEMENT} />
          </section>
          <section className="glass rounded-2xl p-5">
            <header className="mb-4">
              <h2 className="text-base font-semibold text-foreground">XP médio diário</h2>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </header>
            <ProgressChart data={STUDENT_PERF_WEEK} />
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="xl:col-span-2 space-y-3">
            <h2 className="text-base font-semibold text-foreground">Missões publicadas</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(missions ?? []).slice(0, 4).map((m) => (
                <MissionCard key={m.id} mission={m} />
              ))}
            </div>
          </section>
          <aside className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Top alunos</h2>
            <RankingTable students={[...dash.students].sort((a, b) => b.xp - a.xp)} compact />
          </aside>
        </div>

        <section className="glass rounded-2xl p-5">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Atividades em avaliação</h2>
            <span className="text-xs text-muted-foreground">{dash.activities.length} itens</span>
          </header>
          <ul className="divide-y divide-white/5">
            {dash.activities.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.subject} · Prazo {new Date(a.deadline).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <DifficultyBadge value={a.difficulty} />
                  <span className="text-xs font-semibold text-accent">+{a.xpReward} XP</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                  >
                    Avaliar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 🛠️ Renderização de sobreposição dos modais gerenciados pelo estado */}
      <CreateActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
      />
      <CreateMissionModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
      />
    </AppShell>
  );
}
