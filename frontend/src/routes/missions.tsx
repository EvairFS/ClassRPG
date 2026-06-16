import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { MissionCard } from "@/components/gamification/MissionCard";
import { api, type BattleReportItem } from "@/lib/api"; // Centralizado no seu lib/api
import { useAuth } from "@/hooks/useAuth";
import { ErrorState, LoadingState } from "@/components/common/QueryState";
import type { Mission } from "@/types";
import { cn } from "@/lib/utils";
import { Calendar, Sparkles, Swords, Target, Trophy, Zap, FileText } from "lucide-react";

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
  const { hydrated, isAuthenticated, token, user } = useAuth();

  // 📋 Estados do Relatório de Combates (Movidos para dentro do componente)
  const [reportData, setReportData] = useState<BattleReportItem[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);

  // Função para buscar os dados quando o professor clicar
  const handleOpenReport = async (missionId: string) => {
    try {
      setLoadingReportId(missionId);
      const data = await api.getMissionReport(missionId);
      setReportData(data);
      setIsReportOpen(true);
    } catch (error) {
      alert("Não foi possível carregar o relatório de combate.");
    } finally {
      setLoadingReportId(null);
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["missions"],
    queryFn: () => api.getMissions(token!),
    enabled: hydrated && isAuthenticated && !!token,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const missions = data ?? [];
  const weeklyXp = missions
    .filter((m) => m.status === "completed")
    .reduce((acc, m) => acc + m.xpReward, 0);
  const list = tab === "all" ? missions : missions.filter((m) => m.type === tab);

  // Validações de renderização do shell baseadas no papel logado
  const shellRole = user?.role === "teacher" ? "teacher" : "student";

  if (!hydrated || isLoading) {
    return (
      <AppShell role={shellRole} title="Missões">
        <LoadingState />
      </AppShell>
    );
  }
  if (isError) {
    return (
      <AppShell role={shellRole} title="Missões">
        <ErrorState error={error} onRetry={() => refetch()} />
      </AppShell>
    );
  }

  // Descobre se quem está logado é professor/admin
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  return (
    <AppShell role={shellRole} title="Missões">
      <div className="space-y-6">
        {/* Card do Acumulado (Só faz sentido visual para estudantes, mas mantido) */}
        <div className="glass-strong relative overflow-hidden rounded-3xl p-6">
          <div className="pointer-events-none absolute -top-20 right-0 size-72 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Acumulado da semana
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {weeklyXp.toLocaleString("pt-BR")} XP
              </p>
              <p className="text-xs text-muted-foreground">de 2.000 XP — meta semanal</p>
            </div>
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full animate-xp-fill rounded-full bg-linear-to-r from-primary to-secondary"
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
              <div
                key={m.id}
                className={cn(
                  "flex flex-col gap-2 p-1 rounded-2xl animate-fade-up",
                  `stagger-${(i % 5) + 1}`,
                )}
              >
                {/* O card padrão da missão */}
                <MissionCard mission={m} />

                {/* 🔒 BOTÃO TRAVADO EXCLUSIVAMENTE PARA PROFESSORES */}
                {isTeacher && (
                  <button
                    onClick={() => handleOpenReport(m.id)}
                    disabled={loadingReportId === m.id}
                    className="w-full mt-1 border border-purple-500/30 bg-purple-950/20 hover:bg-purple-600 hover:text-white text-purple-300 font-semibold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <FileText className="size-3.5" />
                    {loadingReportId === m.id ? "Carregando..." : "Ver Relatório de Batalha"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📊 MODAL DO RELATÓRIO DE COMBATE */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-purple-500/30 shadow-2xl shadow-purple-950/20">
            {/* Header do Modal */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                  📊 Registro de Combates da Missão
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Histórico de respostas enviados pelos alunos nesta missão
                </p>
              </div>
              <button
                onClick={() => setIsReportOpen(false)}
                className="text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 size-8 rounded-lg font-medium transition flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-muted-foreground bg-slate-900/60 text-xs font-semibold tracking-wider uppercase">
                    <th className="p-4">Turma</th>
                    <th className="p-4">Enunciado da Questão</th>
                    <th className="p-4">Ação / Resultado</th>
                    <th className="p-4">Data e Hora</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-muted-foreground">
                        ⚔️ Nenhum aluno atacou este monstro ainda.
                      </td>
                    </tr>
                  ) : (
                    reportData.map((log) => (
                      <tr
                        key={log.logId}
                        className="border-b border-slate-900 hover:bg-white/[0.01] transition-all"
                      >
                        <td className="p-4 font-mono font-bold text-purple-400">{log.classroom}</td>
                        <td
                          className="p-4 text-slate-300 max-w-xs truncate"
                          title={log.questionStatement}
                        >
                          {log.questionStatement}
                        </td>
                        <td className="p-4">
                          {log.isCorrect ? (
                            <span className="inline-flex items-center bg-green-500/10 text-green-400 px-2 py-0.5 rounded-md font-bold border border-green-500/20">
                              💥 ACERTOU
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md font-bold border border-red-500/20">
                              🛡️ ERROU
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
