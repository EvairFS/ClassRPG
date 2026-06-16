import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { DifficultyBadge } from "@/components/gamification/DifficultyBadge";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { ErrorState, LoadingState } from "@/components/common/QueryState";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Sparkles,
  Trophy,
  User,
  X,
  Check,
} from "lucide-react";

// Interface para as submissões pendentes que o professor vai listar
interface PendingSubmission {
  submission_id: string;
  activity_id: string;
  student_name: string;
  classroom: string;
  submission: string;
}

// Payload para a mutation de avaliação do professor
interface GradePayload {
  submissionId: string;
  evaluation: "correct" | "wrong";
  feedback?: string;
}

export const Route = createFileRoute("/activity/$id")({
  head: () => ({
    meta: [
      { title: "Atividade — ClassRPG" },
      { name: "description", content: "Detalhes da atividade e gerenciamento." },
    ],
  }),
  component: ActivityDetail,
});

function ActivityDetail() {
  const { id } = Route.useParams();
  const { user, hydrated, isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const isTeacher = user?.role === "teacher";

  // 1. Busca dados da Atividade
  const {
    data: activity,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["activity", id],
    queryFn: () => api.getActivity(id),
    enabled: hydrated && isAuthenticated,
  });

  // 2. Busca submissões globais pendentes (Apenas se for professor)
  const { data: pendingSubmissions, refetch: refetchPending } = useQuery<PendingSubmission[]>({
    queryKey: ["pendingSubmissions"],
    queryFn: async () => {
      // 🚀 Agora apontando corretamente para o Render!
      const res = await fetch(
        `https://classrpg-api-26wl.onrender.com/api/activities/submissions/pending`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        },
      );
      const json = await res.json();

      // 🛡️ Linha de segurança: se o json for o array bruto, usa ele. Se tiver .data, usa o .data.
      return Array.isArray(json) ? json : json.data || [];
    },
    enabled: hydrated && isAuthenticated && isTeacher,
  });

  const [answer, setAnswer] = useState("");
  const [xpGained, setXpGained] = useState<number | null>(null);

  // Mutation: Aluno envia resposta
  const submit = useMutation({
    mutationFn: () => api.submitActivity(id, answer, user?.id),
    onSuccess: (res) => {
      setXpGained(res.xpEarned);
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["activity", id] });
      qc.invalidateQueries({ queryKey: ["dashboard", "student"] });
      qc.invalidateQueries({ queryKey: ["ranking"] });
    },
  });

  // Mutation: Professor avalia resposta do aluno
  const gradeMutation = useMutation({
    mutationFn: async ({ submissionId, evaluation, feedback }: GradePayload) => {
      // Adicionado o domínio correto do Render antes da rota
      const res = await fetch(
        `https://classrpg-api-26wl.onrender.com/api/activities/submissions/${submissionId}/grade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ evaluation, feedback }),
        },
      );
      return res.json();
    },
    onSuccess: () => {
      refetchPending();
      qc.invalidateQueries({ queryKey: ["activity", id] });
    },
  });

  if (!hydrated || isLoading) {
    return (
      <AppShell role={isTeacher ? "teacher" : "student"} title="Atividade">
        <LoadingState />
      </AppShell>
    );
  }

  if (isError || !activity) {
    const isNotFound = error instanceof ApiError && error.status === 404;
    return (
      <AppShell role={isTeacher ? "teacher" : "student"} title="Atividade">
        {isNotFound ? (
          <div className="glass rounded-3xl p-10 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">404</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              Atividade "{id}" não encontrada
            </h2>
            <Link
              to="/activities"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <ArrowLeft className="size-4" />
              Ver todas as atividades
            </Link>
          </div>
        ) : (
          <ErrorState error={error} onRetry={() => refetch()} />
        )}
      </AppShell>
    );
  }

  const isSubmitted = activity.status !== "pending" || submit.isSuccess;
  const isGraded = activity.status === "graded";
  const currentText = answer || activity.submission || "";

  // Filtra as pendências apenas para esta atividade dinâmica ($id)
  const currentActivityPendencies =
    pendingSubmissions?.filter((sub) => String(sub.activity_id) === String(id)) || [];

  return (
    <AppShell role={isTeacher ? "teacher" : "student"} title={activity.title}>
      <div className="space-y-6">
        <Link
          to="/activities"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Voltar para atividades
        </Link>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Bloco principal de detalhes comuns */}
            <article className="glass rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {activity.subject}
                </span>
                <DifficultyBadge value={activity.difficulty} />
                {activity.teacher && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="size-3" />
                    {activity.teacher}
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold text-foreground">{activity.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>

              {activity.instructions && (
                <div className="mt-6">
                  <h2 className="mb-2 text-sm font-semibold text-foreground">Instruções</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {activity.instructions}
                  </p>
                </div>
              )}

              {activity.attachments && activity.attachments.length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-2 text-sm font-semibold text-foreground">Anexos</h2>
                  <ul className="space-y-2">
                    {activity.attachments.map((f: { name: string; size: string }) => (
                      <li
                        key={f.name}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                      >
                        <span className="inline-flex items-center gap-2 text-foreground">
                          <FileText className="size-4 text-secondary" />
                          {f.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{f.size}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* VIEW DO ALUNO: Aparece apenas se não for professor */}
              {!isTeacher && (
                <div className="mt-8 border-t border-white/5 pt-6">
                  <h2 className="mb-2 text-sm font-semibold text-foreground">
                    {isGraded ? "Sua entrega" : "Sua resposta"}
                  </h2>
                  <textarea
                    value={currentText}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={isSubmitted}
                    placeholder="Digite sua resposta aqui..."
                    rows={8}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-foreground outline-none transition focus:border-primary/40 disabled:opacity-70"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Paperclip className="size-3.5" />
                      Anexar arquivo (mock)
                    </span>
                    {!isSubmitted ? (
                      <Button
                        onClick={() => submit.mutate()}
                        disabled={!currentText.trim() || submit.isPending}
                        className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 disabled:opacity-60"
                      >
                        {submit.isPending ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            Enviando…
                          </span>
                        ) : (
                          "Enviar resposta"
                        )}
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 className="size-3.5" />
                        {isGraded ? "Atividade avaliada" : "Entrega registrada"}
                      </span>
                    )}
                  </div>
                  {submit.isError && (
                    <p className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-center text-xs text-rose-300">
                      {submit.error instanceof Error ? submit.error.message : "Falha ao enviar."}
                    </p>
                  )}
                </div>
              )}
            </article>

            {/* FEEDBACK DO ALUNO */}
            {!isTeacher && (isGraded || submit.isSuccess) && (
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/5 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">
                    +{xpGained ?? activity.xpReward} XP conquistados!
                  </span>
                </div>
                {activity.feedback && (
                  <div className="mt-3 flex items-start gap-2">
                    <MessageSquare className="mt-0.5 size-4 text-secondary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">{activity.teacher}:</span>{" "}
                      {activity.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW DO PROFESSOR: Lista de Entregas Pendentes dos Alunos */}
            {isTeacher && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  📥 Respostas Pendentes dos Alunos ({currentActivityPendencies.length})
                </h2>

                {currentActivityPendencies.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
                    Nenhuma entrega pendente para avaliar nesta missão. Tudo limpo! Mestre! 🛡️
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentActivityPendencies.map((sub) => (
                      <div
                        key={sub.submission_id}
                        className="glass rounded-2xl p-5 border border-white/5 space-y-4"
                      >
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <span className="text-sm font-bold text-foreground inline-flex items-center gap-2">
                            <User className="size-4 text-primary" />
                            {sub.student_name}
                          </span>
                          <span className="text-[10px] uppercase font-mono tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/10 text-muted-foreground">
                            {sub.classroom}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground bg-black/20 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                          {sub.submission}
                        </p>

                        <div className="flex gap-3 justify-end pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-rose-400 border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300 text-xs font-semibold"
                            disabled={gradeMutation.isPending}
                            onClick={() => {
                              const fb = prompt(
                                "Motivo da recusa (Obrigatório para o aluno refazer):",
                              );
                              if (fb)
                                gradeMutation.mutate({
                                  submissionId: sub.submission_id,
                                  evaluation: "wrong",
                                  feedback: fb,
                                });
                            }}
                          >
                            <X size={14} className="mr-1" /> Recusar / Refazer
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                            disabled={gradeMutation.isPending}
                            onClick={() => {
                              const fb =
                                prompt("Feedback positivo para o herói (Opcional):") || undefined;
                              gradeMutation.mutate({
                                submissionId: sub.submission_id,
                                evaluation: "correct",
                                feedback: fb,
                              });
                            }}
                          >
                            <Check size={14} className="mr-1" /> Aprovar e Dar XP
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barra Lateral Comum */}
          <aside className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Recompensa</p>
              <p className="mt-1 inline-flex items-center gap-1 text-2xl font-bold text-accent">
                <Trophy className="size-5" />+{activity.xpReward} XP
              </p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Prazo</p>
              <p className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-foreground">
                <Clock className="size-4 text-secondary" />
                {new Date(activity.deadline).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                })}
              </p>
            </div>
            {!isTeacher && isGraded && (
              <div className="glass rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Nota</p>
                <p className="mt-1 text-3xl font-bold text-emerald-300 tabular-nums">
                  {activity.grade}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
