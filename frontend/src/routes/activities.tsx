import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { AppShell } from "@/components/layout/AppShell";
import { DifficultyBadge } from "@/components/gamification/DifficultyBadge";
import type { ActivityItem } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock, Trophy } from "lucide-react";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Atividades — ClassRPG" },
      { name: "description", content: "Acompanhe suas atividades por matéria e status." },
    ],
  }),
  component: ActivitiesPage,
});

const STATUSES: { value: ActivityItem["status"] | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "submitted", label: "Entregues" },
  { value: "graded", label: "Avaliadas" },
];

function ActivitiesPage() {
  const [status, setStatus] = useState<ActivityItem["status"] | "all">("all");
  const [subject, setSubject] = useState<string>("all");

  const { data: activities = [] } = useQuery(
    ["activities"],
    api.getActivities,
    {
      retry: false,
      staleTime: 1000 * 60,
    }
  );

  const subjects = useMemo(
    () => ["all", ...Array.from(new Set(activities.map((a: any) => a.subject)))],
    [activities],
  );

  const list = activities.filter(
    (a: any) =>
      (status === "all" || a.status === status) && (subject === "all" || a.subject === subject),
  );

  return (
    <AppShell role="student" title="Atividades">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Suas batalhas pendentes</h2>
            <p className="text-sm text-muted-foreground">{list.length} atividade(s) encontradas</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-0.5">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                    status === s.value
                      ? "bg-gradient-to-r from-primary/30 to-secondary/20 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground outline-none"
            >
              {subjects.map((s) => (
                <option key={s} value={s} className="bg-background">
                  {s === "all" ? "Todas as matérias" : s}
                </option>
              ))}
            </select>
          </div>
        </header>

        <ul className="space-y-3">
          {list.map((a: any, i: number) => (
            <li key={a.id} className={`animate-fade-up stagger-${(i % 5) + 1}`}>
              <Link
                to="/activity/$id"
                params={{ id: a.id }}
                className="glass group flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:glow-primary"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {a.subject}
                    </span>
                    <DifficultyBadge value={a.difficulty} />
                  </div>
                  <h3 className="mt-2 truncate text-base font-semibold text-foreground">
                    {a.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.description}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-4">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                    <Trophy className="size-3.5" />+{a.xpReward} XP
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    {new Date(a.deadline).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <StatusBadge status={a.status} grade={a.grade} />
                  <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status, grade }: { status: ActivityItem["status"]; grade?: number }) {
  if (status === "graded")
    return (
      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
        Nota {grade}
      </span>
    );
  if (status === "submitted")
    return (
      <span className="rounded-full border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-[11px] font-semibold text-secondary">
        Entregue
      </span>
    );
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground">
      Pendente
    </span>
  );
}
