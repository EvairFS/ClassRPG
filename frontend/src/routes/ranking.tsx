import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RankingTable } from "@/components/gamification/RankingTable";
import { PatentBadge } from "@/components/gamification/PatentBadge";
import { CURRENT_STUDENT, MOCK_STUDENTS } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { ArrowUp, Crown, Medal, Trophy } from "lucide-react";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking — ClassRPG" },
      { name: "description", content: "Veja quem lidera a batalha do conhecimento." },
    ],
  }),
  component: RankingPage,
});

const PERIODS = ["Semana", "Mês", "Geral"] as const;
const SCOPES = ["Minha turma", "Escola", "Brasil"] as const;

function RankingPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Semana");
  const [scope, setScope] = useState<(typeof SCOPES)[number]>("Minha turma");
  const sorted = [...MOCK_STUDENTS].sort((a, b) => b.xp - a.xp);
  const top3 = sorted.slice(0, 3);
  const myIndex = sorted.findIndex((s) => s.id === CURRENT_STUDENT.id);

  return (
    <AppShell role="student" title="Ranking">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Salão dos campeões</h2>
            <p className="text-sm text-muted-foreground">Quem está dominando esta {period.toLowerCase()}?</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SegmentedGroup options={SCOPES} value={scope} onChange={setScope} />
            <SegmentedGroup options={PERIODS} value={period} onChange={setPeriod} />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {top3.map((s, i) => (
            <PodiumCard key={s.id} student={s} place={i + 1} />
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <RankingTable students={sorted} currentUserId={CURRENT_STUDENT.id} />
          <aside className="glass relative overflow-hidden rounded-2xl p-5">
            <div className="pointer-events-none absolute -top-16 right-0 size-40 rounded-full bg-primary/25 blur-3xl" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Sua posição</p>
            <p className="mt-1 text-4xl font-bold text-foreground">#{myIndex + 1}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
              <ArrowUp className="size-3" />
              +2 posições esta semana
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>XP {period.toLowerCase()}</span>
                <span className="font-semibold text-foreground">{CURRENT_STUDENT.xp.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Falta para o top 3</span>
                <span className="font-semibold text-accent">+{Math.max(0, top3[2].xp - CURRENT_STUDENT.xp + 1).toLocaleString("pt-BR")} XP</span>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
              Dica: missões épicas dão até 3x mais XP. Acelere sua subida!
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function SegmentedGroup<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-0.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition",
            value === o ? "bg-gradient-to-r from-primary/30 to-secondary/20 text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function PodiumCard({ student, place }: { student: (typeof MOCK_STUDENTS)[number]; place: number }) {
  const meta = [
    { icon: Crown, label: "1º Campeão", tint: "from-accent/40 to-accent/0 text-accent" },
    { icon: Trophy, label: "2º Mestre", tint: "from-white/15 to-white/0 text-foreground" },
    { icon: Medal, label: "3º Aprendiz", tint: "from-secondary/30 to-secondary/0 text-secondary" },
  ][place - 1];
  const Icon = meta.icon;
  return (
    <div className={cn("glass relative overflow-hidden rounded-2xl p-5", place === 1 && "ring-1 ring-accent/40 glow-primary")}>
      <div className={cn("pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-gradient-to-br blur-2xl", meta.tint)} />
      <div className="flex items-center gap-3">
        <div className={cn("grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5", meta.tint.split(" ").pop())}>
          <Icon className="size-5" />
        </div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{meta.label}</div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/40 to-secondary/40 text-sm font-bold text-white ring-1 ring-white/15">
          {student.avatar}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-foreground">{student.name}</p>
          <p className="truncate text-xs text-muted-foreground">{student.classroom}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <PatentBadge xp={student.xp} />
        <span className="text-lg font-bold tabular-nums text-foreground">{student.xp.toLocaleString("pt-BR")} XP</span>
      </div>
    </div>
  );
}