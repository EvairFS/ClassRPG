import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCard } from "@/components/gamification/StatsCard";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { EngagementChart } from "@/components/charts/EngagementChart";
import { SkillsRadar } from "@/components/charts/SkillsRadar";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, Download, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Relatórios — ClassRPG" },
      { name: "description", content: "Indicadores de engajamento, XP e performance das turmas." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: api.getStudents });
  
  const { data: classEngagement = [] } = useQuery({ 
    queryKey: ["chart-engagement"], 
    queryFn: () => fetch("/api/charts/class-engagement").then(res => res.json()) 
  });
  const { data: platformGrowth = [] } = useQuery({ 
    queryKey: ["chart-growth"], 
    queryFn: () => fetch("/api/charts/platform-growth").then(res => res.json()) 
  });

  const top = [...students].sort((a, b) => b.xp - a.xp).slice(0, 8);
  const studentCount = students.length || 1;
  const totalXp = students.reduce((s, x) => s + x.xp, 0);
  const avgXp = Math.round(totalXp / studentCount);

  return (
    <AppShell role="teacher" title="Relatórios">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Painel analítico</h2>
            <p className="text-sm text-muted-foreground">Métricas consolidadas das suas turmas</p>
          </div>
          <Button variant="outline" className="border-white/15 bg-white/5 text-foreground hover:bg-white/10">
            <Download className="mr-2 size-4" />
            Exportar CSV
          </Button>
        </header>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard label="Engajamento" value="87%" delta={4} icon={Sparkles} tint="primary" />
          <StatsCard label="Missões/aluno" value={18} delta={9} icon={BookOpen} tint="secondary" />
          <StatsCard label="XP distribuído" value={totalXp.toLocaleString("pt-BR")} delta={12} icon={Award} tint="accent" />
          <StatsCard label="Alunos ativos" value={students.length} delta={6} icon={Users} tint="muted" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="xl:col-span-2 glass rounded-2xl p-5">
            <header className="mb-4">
              <h3 className="text-base font-semibold text-foreground">Engajamento semanal</h3>
              <p className="text-xs text-muted-foreground">Alunos ativos × entregas</p>
            </header>
            <EngagementChart data={classEngagement} />
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="glass rounded-2xl p-5">
            <header className="mb-4">
              <h3 className="text-base font-semibold text-foreground">XP médio diário</h3>
            </header>
            <ProgressChart data={[]} />
          </section>
          <section className="xl:col-span-2 glass rounded-2xl p-5">
            <header className="mb-4">
              <h3 className="text-base font-semibold text-foreground">Crescimento histórico</h3>
              <p className="text-xs text-muted-foreground">Alunos, escolas e professores ativos</p>
            </header>
            <GrowthChart data={platformGrowth} />
          </section>
        </div>

        <section className="glass rounded-2xl p-5">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-foreground">Top performers</h3>
              <p className="text-xs text-muted-foreground">XP médio da turma: {avgXp.toLocaleString("pt-BR")}</p>
            </div>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 font-semibold">Aluno</th>
                  <th className="py-2 font-semibold">Turma</th>
                  <th className="py-2 text-right font-semibold">XP</th>
                  <th className="py-2 text-right font-semibold">Missões</th>
                  <th className="py-2 text-right font-semibold">Sequência</th>
                </tr>
              </thead>
              <tbody>
                {top.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-[11px] font-semibold text-white ring-1 ring-white/10">
                          {s.avatar}
                        </div>
                        <span className="font-medium text-foreground">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{s.classroom}</td>
                    <td className="py-3 text-right font-semibold tabular-nums text-accent">{s.xp.toLocaleString("pt-BR")}</td>
                    <td className="py-3 text-right tabular-nums text-foreground">{s.missionsCompleted}</td>
                    <td className="py-3 text-right tabular-nums text-rose-300">{s.streak}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}