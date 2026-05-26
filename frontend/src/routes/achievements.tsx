import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AchievementCard } from "@/components/gamification/AchievementCard";
import { MOCK_ACHIEVEMENTS } from "@/data/mockData";
import { RARITY_META } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/types";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Conquistas — ClassRPG" },
      { name: "description", content: "Sua coleção de troféus acadêmicos." },
    ],
  }),
  component: AchievementsPage,
});

const FILTERS = ["Todas", "Conquistadas", "Bloqueadas"] as const;
const RARITY_ORDER: Achievement["rarity"][] = ["legendary", "epic", "rare", "common"];

function AchievementsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Todas");
  const total = MOCK_ACHIEVEMENTS.length;
  const earned = MOCK_ACHIEVEMENTS.filter((a) => a.earned).length;

  const list = MOCK_ACHIEVEMENTS.filter((a) =>
    filter === "Todas" ? true : filter === "Conquistadas" ? a.earned : !a.earned,
  );

  return (
    <AppShell role="student" title="Conquistas">
      <div className="space-y-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 right-0 size-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Galeria de troféus
              </p>
              <h2 className="mt-1 text-2xl font-bold text-foreground">
                {earned} <span className="text-muted-foreground">de</span> {total} conquistas
              </h2>
              <p className="text-sm text-muted-foreground">
                Continue jogando para desbloquear todas!
              </p>
            </div>
            <div className="flex-1 min-w-[200px] max-w-sm">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent via-primary to-secondary"
                  style={{ width: `${(earned / total) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-right text-xs text-muted-foreground">
                {Math.round((earned / total) * 100)}% completo
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-medium transition",
                filter === f
                  ? "border-primary/40 bg-gradient-to-r from-primary/20 to-secondary/10 text-foreground"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {RARITY_ORDER.map((rarity) => {
          const group = list.filter((a) => a.rarity === rarity);
          if (group.length === 0) return null;
          const meta = RARITY_META[rarity];
          return (
            <section key={rarity} className="space-y-3">
              <header className="flex items-center gap-2">
                <Sparkles className={cn("size-4", meta.color)} />
                <h3 className={cn("text-sm font-semibold uppercase tracking-wider", meta.color)}>
                  {meta.label}
                </h3>
                <span className="text-xs text-muted-foreground">({group.length})</span>
              </header>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {group.map((a) => (
                  <AchievementCard key={a.id} a={a} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
