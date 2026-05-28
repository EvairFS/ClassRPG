import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import { Crown, Flame, Shield, Trophy, Users } from "lucide-react";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Equipes — ClassRPG" },
      { name: "description", content: "Forme alianças e domine o ranking coletivo." },
    ],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  const { data: teams = [] } = useQuery(["teams"], api.getTeams, {
      retry: false,
    staleTime: 1000 * 60,
  });

  const { data: currentStudent } = useQuery(["currentStudent"], api.getCurrentStudent, {
      retry: false,
      staleTime: 1000 * 60,
  });

  const { data: students = [] } = useQuery(["students"], api.getStudents, {
    retry: false,
    staleTime: 1000 * 60,
  });

  const myTeam = teams.find((t: any) => t.id === currentStudent?.teamId) ?? teams[0];
  const ranking = [...teams].sort((a: any, b: any) => b.xp - a.xp);
  const myTeamMembers = (myTeam?.memberIds ?? [])
    .map((id: string) => students.find((s: any) => s.id === id))
    .filter((s: any): s is any => !!s)
    .sort((a: any, b: any) => b.xp - a.xp);

  return (
    <AppShell role="student" title="Equipes">
      <div className="space-y-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8">
          <div className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-0 size-72 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div className="grid size-24 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-primary/50 to-secondary/50 text-5xl ring-1 ring-white/20">
              {myTeam?.emblem}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Sua equipe</p>
              <h2 className="mt-1 text-2xl font-bold text-foreground">{myTeam?.name}</h2>
              {myTeam?.motto && (
                <p className="mt-1 text-sm italic text-muted-foreground">"{myTeam.motto}"</p>
              )}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Mini label="Membros" value={myTeam?.members} icon={Users} tint="text-primary" />
                <Mini
                  label="XP total"
                  value={myTeam?.xp.toLocaleString("pt-BR")}
                  icon={Trophy}
                  tint="text-accent"
                />
                <Mini
                  label="Semana"
                  value={`+${myTeam?.weeklyXp?.toLocaleString("pt-BR") ?? 0}`}
                  icon={Flame}
                  tint="text-rose-300"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Ranking de equipes</h3>
              <span className="text-xs text-muted-foreground">{ranking.length} alianças</span>
            </header>
            <ul className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              {ranking.map((t, i) => {
                const isMine = t.id === myTeam.id;
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "grid grid-cols-[2.5rem_3rem_1fr_6rem_6rem] items-center gap-3 px-4 py-3 transition",
                      i !== 0 && "border-t border-white/5",
                      isMine && "bg-primary/10",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-7 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                        i === 0 ? "bg-accent/20 text-accent" : "text-muted-foreground",
                    )}>
                      {i === 0 ? <Crown className="size-3.5" /> : i + 1}
                    </span>
                    <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 text-xl ring-1 ring-white/10">
                      {t.emblem}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {t.name}
                        {isMine && (
                          <span className="ml-2 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            sua
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.members} membros</p>
                    </div>
                    <span className="text-right text-xs text-secondary tabular-nums">
                      +{t.weeklyXp?.toLocaleString("pt-BR")} XP
                    </span>
                    <span className="text-right text-sm font-bold text-foreground tabular-nums">
                      {t.xp.toLocaleString("pt-BR")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">Companheiros de batalha</h3>
            <ul className="space-y-2">
              {myTeamMembers.map((s) => {
                const isMe = s.id === currentStudent?.id;
                return (
                  <li
                    key={s.id}
                    className={cn(
                      "glass flex items-center gap-3 rounded-xl p-3",
                      isMe && "ring-1 ring-primary/40",
                    )}
                  >
                    <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 text-xs font-bold text-white ring-1 ring-white/10">
                      {s.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {s.name}
                        {isMe && <span className="ml-1.5 text-[10px] text-primary">(você)</span>}
                      </p>
                      <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Shield className="size-3" />
                        Nível {s.level}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-accent tabular-nums">
                      {s.xp.toLocaleString("pt-BR")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Mini({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
      <Icon className={`mx-auto mb-1 size-4 ${tint}`} />
      <p className="text-base font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}