import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/gamification/StatsCard";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { EngagementChart } from "@/components/charts/EngagementChart";
import {
  CLASS_ENGAGEMENT, MOCK_TEACHERS, MOCK_TEAMS, PLATFORM_GROWTH,
} from "@/data/mockData";
import { Building2, CheckCircle2, GraduationCap, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({ component: AdminDashboard });

function AdminDashboard() {
  const pending = MOCK_TEACHERS.filter((t) => t.status === "pending");
  return (
    <AppShell role="admin" title="Visão geral da plataforma">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard label="Escolas ativas" value={36} delta={12} icon={Building2} tint="primary" />
          <StatsCard label="Alunos" value="3.520" delta={18} icon={Users} tint="secondary" />
          <StatsCard label="Professores" value={232} delta={9} icon={GraduationCap} tint="accent" />
          <StatsCard label="Aprovações pend." value={pending.length} icon={CheckCircle2} tint="muted" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="xl:col-span-2 glass rounded-2xl p-5">
            <header className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Crescimento da plataforma</h2>
              <p className="text-xs text-muted-foreground">Últimos 5 meses</p>
            </header>
            <GrowthChart data={PLATFORM_GROWTH} />
          </section>
          <section className="glass rounded-2xl p-5">
            <header className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Engajamento global</h2>
              <p className="text-xs text-muted-foreground">Atividade média</p>
            </header>
            <EngagementChart data={CLASS_ENGAGEMENT} />
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 glass rounded-2xl p-5">
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Professores</h2>
              <span className="text-xs text-muted-foreground">{MOCK_TEACHERS.length} cadastrados</span>
            </header>
            <ul className="divide-y divide-white/5">
              {MOCK_TEACHERS.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-xs font-semibold text-foreground ring-1 ring-white/10">
                      {t.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.subject} · {t.studentsCount} alunos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] ${
                      t.status === "active" ? "border-emerald-500/30 text-emerald-300" : "border-accent/40 text-accent"
                    }`}>
                      {t.status === "active" ? "Ativo" : "Pendente"}
                    </span>
                    {t.status === "pending" && (
                      <>
                        <Button size="sm" className="h-7 bg-gradient-to-r from-primary to-secondary px-2 text-white hover:opacity-90">
                          <CheckCircle2 className="mr-1 size-3" /> Aprovar
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 border-white/15 bg-white/5 px-2 text-muted-foreground hover:text-foreground">
                          <XCircle className="mr-1 size-3" /> Recusar
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass rounded-2xl p-5">
            <header className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Top equipes</h2>
              <p className="text-xs text-muted-foreground">Ranking de XP coletivo</p>
            </header>
            <ul className="space-y-3">
              {MOCK_TEAMS.map((t, i) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-2xl">{t.emblem}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.members} membros</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-accent">{t.xp.toLocaleString("pt-BR")}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">#{i + 1}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}