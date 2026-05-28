import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { AppShell } from "@/components/layout/AppShell";
import { MissionCard } from "@/components/gamification/MissionCard";
import type { Mission } from "@/types";
import { cn } from "@/lib/utils";
import { Calendar, Sparkles, Swords, Target, Trophy, Zap } from "lucide-react";

export const Route = createFileRoute("/missions")({
  head: () => ({
    meta: [
      { title: "Missões — ClassRPG" },
      { name: "description", content: "Aceite missões diárias, semanais e épicas para ganhar XP." },
    ],
  }),
  component: MissionsPage,
});

const TABS: { value: Mission["type"] | "all"; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "Todas", icon: Sparkles },
  { value: "daily", label: "Diárias", icon: Calendar },
  { value: "weekly", label: "Semanais", icon: Target },
  { value: "special", label: "Especiais", icon: Zap },
  { value: "event", label: "Eventos", icon: Swords },
  { value: "challenge", label: "Desafios", icon: Trophy },
];

function MissionsPage() {
  const [tab, setTab] = useState<Mission["type"] | "all">("all");

  const { data: missions = [] } = useQuery(
    ["missions"],
    api.getMissions,
    {
      retry: false,
      staleTime: 1000 * 60,
    }
  );

  const weeklyXp = missions
    .filter((m: any) => m.status === "completed")
    .reduce((acc: number, m: any) => acc + m.xpReward, 0) + 540;
  const list = tab === "all" ? missions : missions.filter((m: any) => m.type === tab);

  return (
    <AppShell role="student" title="Missões">
      <div className="space-y-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-6">
          <div className="pointer-events-none absolute -top-20 right-0 size-72 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Acumulado da semana</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{weeklyXp.toLocaleString("pt-BR")} XP</p>
              <p className="text-xs text-muted-foreground">de 2.000 XP — meta semanal</p>
            </div>
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full animate-xp-fill rounded-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${Math.min(100, (weeklyXp / 2000) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-right text-xs text-muted-foreground">
                Faltam {Math.max(0, 2000 - weeklyXp).toLocaleString("pt-BR")} XP
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition",
                  active
                    ? "border-primary/40 bg-gradient-to-r from-primary/20 to-secondary/10 text-foreground"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {list.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
            Nenhuma missão dessa categoria por aqui. Aguarde novas batalhas!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((m, i) => (
              <div key={m.id} className={`animate-fade-up stagger-${(i % 5) + 1}`}>
                <MissionCard mission={m} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}