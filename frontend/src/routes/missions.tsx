import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { MissionCard } from "@/components/gamification/MissionCard";
import { api, type BattleReportItem } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ErrorState, LoadingState } from "@/components/common/QueryState";
import type { Mission } from "@/types";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Zap,
  FileText,
  Frown,
  Smile,
  Brain,
  Award,
} from "lucide-react";

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

  // 📋 Estados do Relatório de Combates
  const [reportData, setReportData] = useState<BattleReportItem[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);

  // 📊 CÁLCULO DE MÉTRICAS EM TEMPO REAL
  const stats = useMemo(() => {
    if (!reportData || reportData.length === 0) return null;

    const questionMap: Record<string, { total: number; correct: number }> = {};
    const studentMap: Record<
      string,
      { total: number; correct: number; classroom: string; name: string }
    > = {};

    // Agrupa acertos e erros por questão e por aluno
    reportData.forEach((log) => {
      // 1. Processa Questões
      if (!questionMap[log.questionStatement]) {
        questionMap[log.questionStatement] = { total: 0, correct: 0 };
      }
      questionMap[log.questionStatement].total += 1;
      if (log.isCorrect) questionMap[log.questionStatement].correct += 1;

      // 2. Processa Alunos
      if (!studentMap[log.studentId]) {
        studentMap[log.studentId] = {
          total: 0,
          correct: 0,
          classroom: log.classroom,
          // 🛡️ LOCAL CORRETO DA BLINDAGEM: Lê tanto camelCase quanto snake_case da API
          name: log.studentName || log.student_name || `Recruta #${log.studentId.slice(0, 4)}`,
        };
      }
      studentMap[log.studentId].total += 1;
      if (log.isCorrect) studentMap[log.studentId].correct += 1;
    });

    // Variáveis para encontrar os extremos
    let easiestQuestion = "";
    let easiestQuestionRate = -1;
    let hardestQuestion = "";
    let hardestQuestionRate = 2;

    let easiestStudentName = "";
    let easiestStudentClass = "";
    let easiestStudentRate = -1;
    let hardestStudentName = "";
    let hardestStudentClass = "";
    let hardestStudentRate = 2;

    // Varre questões para descobrir mais fácil e mais difícil
    Object.entries(questionMap).forEach(([statement, data]) => {
      const rate = data.correct / data.total;
      if (rate > easiestQuestionRate) {
        easiestQuestionRate = rate;
        easiestQuestion = statement;
      }
      if (rate < hardestQuestionRate) {
        hardestQuestionRate = rate;
        hardestQuestion = statement;
      }
    });

    // Varre alunos para descobrir quem teve maior facilidade e maior dificuldade
    Object.entries(studentMap).forEach(([_, data]) => {
      const rate = data.correct / data.total;
      if (rate > easiestStudentRate) {
        easiestStudentRate = rate;
        easiestStudentName = data.name;
        easiestStudentClass = data.classroom;
      }
      if (rate < hardestStudentRate) {
        hardestStudentRate = rate;
        hardestStudentName = data.name;
        hardestStudentClass = data.classroom;
      }
    });

    return {
      hardestQuestion,
      hardestQuestionPercent: Math.round((1 - hardestQuestionRate) * 100), // taxa de erro
      easiestQuestion,
      easiestQuestionPercent: Math.round(easiestQuestionRate * 100), // taxa de acerto
      bestStudent: easiestStudentName, // Exibe o nome real mapeado
      bestStudentClass: easiestStudentClass,
      bestStudentPercent: Math.round(easiestStudentRate * 100),
      worstStudent: hardestStudentName, // Exibe o nome real mapeado
      worstStudentClass: hardestStudentClass,
      worstStudentPercent: Math.round((1 - hardestStudentRate) * 100), // taxa de erro do aluno
    };
  }, [reportData]);

  // Função para buscar os dados quando o professor clicar
  const handleOpenReport = async (e: React.MouseEvent, missionId: string) => {
    e.preventDefault();
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

  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  return (
    <AppShell role={shellRole} title="Missões">
      <div className="space-y-6">
        {/* Card do Acumulado */}
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

        {/* Abas */}
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

        {/* Lista de Missões */}
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
                <MissionCard mission={m} />

                {isTeacher && (
                  <button
                    type="button"
                    onClick={(e) => handleOpenReport(e, m.id)}
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

      {/* 📊 MODAL POP-UP DO RELATÓRIO DE COMBATE */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 max-w-5xl w-full max-h-[85vh] overflow-y-auto border border-purple-500/30 shadow-2xl shadow-purple-950/20">
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
                type="button"
                onClick={() => setIsReportOpen(false)}
                className="text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 size-8 rounded-lg font-medium transition flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* 📈 PAINEL DE METRICAS KPI */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Card Questão Mais Difícil */}
                <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-red-400 font-semibold text-xs uppercase tracking-wider">
                    <Brain className="size-4" /> Questão Mais Difícil
                  </div>
                  <p
                    className="text-sm font-medium mt-2 text-slate-200 line-clamp-2"
                    title={stats.hardestQuestion}
                  >
                    "{stats.hardestQuestion}"
                  </p>
                  <span className="text-xs text-red-400 font-bold mt-1">
                    🔥 {stats.hardestQuestionPercent}% de Erros
                  </span>
                </div>

                {/* Card Questão Mais Fácil */}
                <div className="bg-green-950/20 border border-green-500/20 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-green-400 font-semibold text-xs uppercase tracking-wider">
                    <Award className="size-4" /> Questão Mais Fácil
                  </div>
                  <p
                    className="text-sm font-medium mt-2 text-slate-200 line-clamp-2"
                    title={stats.easiestQuestion}
                  >
                    "{stats.easiestQuestion}"
                  </p>
                  <span className="text-xs text-green-400 font-bold mt-1">
                    ✨ {stats.easiestQuestionPercent}% de Acertos
                  </span>
                </div>

                {/* Card Aluno Maior Dificuldade */}
                <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <Frown className="size-4" /> Maior Dificuldade
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-bold text-slate-200">{stats.worstStudent}</p>
                    <p className="text-xs text-muted-foreground">
                      Turma: {stats.worstStudentClass}
                    </p>
                  </div>
                  <span className="text-xs text-amber-400 font-bold mt-1">
                    🛡️ {stats.worstStudentPercent}% de Erros
                  </span>
                </div>

                {/* Card Aluno Maior Facilidade */}
                <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
                    <Smile className="size-4" /> Maior Facilidade
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-bold text-slate-200">{stats.bestStudent}</p>
                    <p className="text-xs text-muted-foreground">Turma: {stats.bestStudentClass}</p>
                  </div>
                  <span className="text-xs text-blue-400 font-bold mt-1">
                    🏆 {stats.bestStudentPercent}% de Acertos
                  </span>
                </div>
              </div>
            )}

            {/* Tabela de Logs */}
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
