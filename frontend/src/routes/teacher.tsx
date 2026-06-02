import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/gamification/StatsCard";
import { RankingTable } from "@/components/gamification/RankingTable";
import { EngagementChart } from "@/components/charts/EngagementChart";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { MissionCard } from "@/components/gamification/MissionCard";
import {
  CLASS_ENGAGEMENT, CURRENT_TEACHER, MOCK_ACTIVITIES, MOCK_MISSIONS, MOCK_STUDENTS, STUDENT_PERF_WEEK,
} from "@/data/mockData";
import { Award, BookOpen, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/gamification/DifficultyBadge";

export const Route = createFileRoute("/teacher")({ component: TeacherDashboard });

function TeacherDashboard() {
  const t = CURRENT_TEACHER;
  const avgXp = Math.round(MOCK_STUDENTS.reduce((s, x) => s + x.xp, 0) / MOCK_STUDENTS.length);
  return (
    <AppShell role="teacher" title={`Olá, Profa. ${t.name.split(" ")[0]}`}>
      <div className="space-y-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8 animate-fade-up">
          <div className="pointer-events-none absolute -top-20 right-0 size-72 rounded-full bg-secondary/25 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Painel do Professor</p>
              <h2 className="mt-1 text-2xl font-bold text-foreground">{t.subject} · Turmas {t.classes.join(" e ")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.studentsCount} alunos · 4 missões ativas · 12 atividades em andamento</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-white/15 bg-white/5 text-foreground hover:bg-white/10">Nova missão</Button>
              <Button className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90">Criar atividade</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard label="Alunos ativos" value={t.studentsCount} delta={8} icon={Users} tint="primary" />
          <StatsCard label="Entregas" value={142} delta={14} icon={BookOpen} tint="secondary" />
          <StatsCard label="XP médio" value={avgXp.toLocaleString("pt-BR")} delta={6} icon={Award} tint="accent" />
          <StatsCard label="Feedbacks" value={37} delta={-3} icon={MessageSquare} tint="muted" />
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
              {MOCK_MISSIONS.slice(0, 4).map((m) => <MissionCard key={m.id} mission={m} />)}
            </div>
          </section>
          <aside className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Top alunos</h2>
            <RankingTable students={MOCK_STUDENTS} compact />
          </aside>
        </div>

        <section className="glass rounded-2xl p-5">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Atividades em avaliação</h2>
            <span className="text-xs text-muted-foreground">{MOCK_ACTIVITIES.length} itens</span>
          </header>
          <ul className="divide-y divide-white/5">
            {MOCK_ACTIVITIES.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.subject} · Prazo {new Date(a.deadline).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <DifficultyBadge value={a.difficulty} />
                  <span className="text-xs font-semibold text-accent">+{a.xpReward} XP</span>
                  <Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-foreground hover:bg-white/10">Avaliar</Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}