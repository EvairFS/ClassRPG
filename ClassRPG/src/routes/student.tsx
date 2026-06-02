import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileHeader } from "@/components/gamification/ProfileHeader";
import { StatsCard } from "@/components/gamification/StatsCard";
import { MissionCard } from "@/components/gamification/MissionCard";
import { AchievementCard } from "@/components/gamification/AchievementCard";
import { RankingTable } from "@/components/gamification/RankingTable";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { SkillsRadar } from "@/components/charts/SkillsRadar";
import {
  CURRENT_STUDENT, MOCK_ACHIEVEMENTS, MOCK_ACTIVITIES, MOCK_MISSIONS, MOCK_STUDENTS,
  STUDENT_PERF_WEEK, STUDENT_SKILLS_RADAR,
} from "@/data/mockData";
import { DifficultyBadge } from "@/components/gamification/DifficultyBadge";
import { Bell, Flame, Sparkles, Target, Trophy } from "lucide-react";

export const Route = createFileRoute("/student")({ component: StudentDashboard });

function StudentDashboard() {
  const me = CURRENT_STUDENT;
  const myRank = [...MOCK_STUDENTS].sort((a, b) => b.xp - a.xp).findIndex((s) => s.id === me.id) + 1;
  return (
    <AppShell role="student" title="Painel do Aventureiro">
      <div className="space-y-6">
        <div className="animate-fade-up"><ProfileHeader student={me} /></div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard label="XP total" value={me.xp.toLocaleString("pt-BR")} delta={12} icon={Trophy} tint="accent" />
          <StatsCard label="Posição" value={`#${myRank}`} delta={2} icon={Sparkles} tint="primary" />
          <StatsCard label="Sequência" value={`${me.streak}d`} delta={5} icon={Flame} tint="secondary" />
          <StatsCard label="Missões ativas" value={MOCK_MISSIONS.filter(m => m.status === "in_progress").length} icon={Target} tint="muted" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="xl:col-span-2 glass rounded-2xl p-5">
            <header className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Progresso de XP — Semana</h2>
                <p className="text-xs text-muted-foreground">Acompanhe sua evolução diária</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-muted-foreground">7d</span>
            </header>
            <ProgressChart data={STUDENT_PERF_WEEK} />
          </section>
          <section className="glass rounded-2xl p-5">
            <h2 className="mb-3 text-base font-semibold text-foreground">Habilidades</h2>
            <SkillsRadar data={STUDENT_SKILLS_RADAR} />
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="xl:col-span-2 space-y-3">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Missões ativas</h2>
              <a className="text-xs text-secondary hover:underline" href="#">Ver todas</a>
            </header>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {MOCK_MISSIONS.slice(0, 4).map((m, i) => (
                <div key={m.id} className={`animate-fade-up stagger-${i + 1}`}>
                  <MissionCard mission={m} />
                </div>
              ))}
            </div>
          </section>
          <aside className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Top da turma</h2>
            <RankingTable students={MOCK_STUDENTS} currentUserId={me.id} compact />
          </aside>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 glass rounded-2xl p-5">
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Atividades pendentes</h2>
              <span className="text-xs text-muted-foreground">{MOCK_ACTIVITIES.length} totais</span>
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
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] ${
                      a.status === "graded" ? "border-emerald-500/30 text-emerald-300" :
                      a.status === "submitted" ? "border-secondary/40 text-secondary" :
                      "border-white/10 text-muted-foreground"
                    }`}>
                      {a.status === "graded" ? `Nota ${a.grade}` : a.status === "submitted" ? "Entregue" : "Pendente"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="glass rounded-2xl p-5">
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Conquistas recentes</h2>
              <Bell className="size-4 text-muted-foreground" />
            </header>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_ACHIEVEMENTS.slice(0, 4).map((a) => (
                <AchievementCard key={a.id} a={a} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}