import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import LevelUpModal from "@/components/LevelUpModal";
import { Button } from "@/components/ui/button";
import { getLevelInfo } from "@/lib/gamification";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/api";
import { ArrowLeft, Check, X } from "lucide-react";

// Interface para as submissões pendentes do professor (evita o uso de 'any')
interface PendingSubmission {
  submission_id: string;
  activity_id: string;
  student_name: string;
  classroom: string;
  submission: string;
}

// Mutate payload type para a avaliação do mestre
interface GradePayload {
  submissionId: string;
  evaluation: "correct" | "wrong";
  feedback?: string;
}

const ActivityPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated } = useCurrentUser();

  const [answer, setAnswer] = useState("");
  const [showXpPop, setShowXpPop] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const isTeacher = user?.role === "teacher";

  // ── 🚨 REGRAS DOS HOOKS: TODOS OS HOOKS DEVEM FICAR NO TOPO, SEM NENHUM 'RETURN' ANTES DELES ──

  // 1. Busca dados da Atividade
  const {
    data: activityData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activity", id],
    queryFn: () => api.getActivity(id || "", token || ""),
    enabled: !!id && !!token,
  });

  // 2. Busca perfil do Aluno (Apenas se não for professor)
  const { data: student } = useQuery({
    queryKey: ["student", user?.id],
    queryFn: () => api.getStudent(user?.id || "", token || ""),
    enabled: !!user?.id && !!token && !isTeacher,
  });

  // 3. Busca submissões globais pendentes (Apenas se for professor)
  const { data: pendingSubmissions, refetch: refetchPending } = useQuery<PendingSubmission[]>({
    queryKey: ["pendingSubmissions"],
    queryFn: async () => {
      const res = await fetch(`/api/activities/submissions/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      return json.data;
    },
    enabled: isTeacher && !!token,
  });

  // 4. Mutation: Aluno envia resposta
  const submitMutation = useMutation({
    mutationFn: (textAnswer: string) => {
      return fetch(`/api/activities/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ submission: textAnswer }),
      }).then((res) => res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["activity", id] });

      if (data?.data?.xpEarned > 0) {
        setShowXpPop(true);
        setTimeout(() => setShowXpPop(false), 1500);
      }
    },
  });

  // 5. Mutation: Professor avalia resposta
  const gradeMutation = useMutation({
    mutationFn: ({ submissionId, evaluation, feedback }: GradePayload) => {
      return fetch(`/api/activities/submissions/${submissionId}/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ evaluation, feedback }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      refetchPending();
    },
  });

  // Cast seguro do objeto da atividade para estender as propriedades dinâmicas do banco
  const activity = activityData as
    | (typeof activityData & {
        student_status?: string;
        feedback?: string;
        submission?: string;
      })
    | undefined;

  // Efeito para preencher a resposta salva anteriormente
  useEffect(() => {
    if (activity?.submission) {
      setAnswer(activity.submission);
    }
  }, [activity]);

  // ── 🛡️ CLÁUSULAS DE RETORNO (APENAS APÓS TODOS OS HOOKS SEREM DECLARADOS) ──

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userType={isTeacher ? "teacher" : "student"} />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <p className="text-center text-muted-foreground font-body">Carregando...</p>
        </main>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Atividade não encontrada.</p>
      </div>
    );
  }

  // Filtra as submissões desta atividade específica
  const currentActivityPendencies =
    pendingSubmissions?.filter((sub) => String(sub.activity_id) === String(id)) || [];

  const info = student ? getLevelInfo(student.xp) : null;
  const currentStatus = activity.student_status || activity.status;

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType={isTeacher ? "teacher" : "student"} />

      <main className="container mx-auto px-4 py-8 max-w-2xl relative">
        {showXpPop && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <span className="font-display text-5xl text-accent animate-xp-pop">
              +{activity.xpReward} XP
            </span>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-body text-sm"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </button>

        {/* Card de Detalhes da Atividade */}
        <div className="border border-border bg-card p-8 animate-fade-up mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              {!isTeacher && (
                <span
                  className={`text-xs font-body px-2 py-1 border mb-3 inline-block ${
                    currentStatus === "correct"
                      ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                      : currentStatus === "pending"
                        ? "border-amber-500 text-amber-400 bg-amber-950/20"
                        : currentStatus === "wrong"
                          ? "border-destructive text-destructive bg-destructive/10"
                          : "border-primary text-primary"
                  }`}
                >
                  {currentStatus === "correct"
                    ? "Aprovada"
                    : currentStatus === "pending"
                      ? "Aguardando Correção"
                      : currentStatus === "wrong"
                        ? "Recusada (Refazer)"
                        : "Não Entregue"}
                </span>
              )}

              <h1 className="font-display text-xl tracking-wider text-foreground uppercase mt-2">
                {activity.title}
              </h1>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl text-accent">+{activity.xpReward}</p>
              <p className="text-xs text-muted-foreground font-body">XP de Recompensa</p>
            </div>
          </div>

          <p className="text-foreground font-body leading-relaxed mb-6">{activity.description}</p>

          {currentStatus === "wrong" && activity.feedback && (
            <div className="border border-destructive/50 bg-destructive/5 p-4 mb-6 font-body text-sm text-foreground">
              <strong className="text-destructive block mb-1">💬 Feedback do Professor:</strong>"
              {activity.feedback}"
            </div>
          )}

          {/* Área do Aluno */}
          {!isTeacher && (
            <div className="border-t border-border pt-6 mt-6">
              <label className="block font-display text-xs tracking-wider uppercase text-muted-foreground mb-2">
                Sua Resposta da Atividade:
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Insira sua resposta completa aqui..."
                disabled={currentStatus === "pending" || currentStatus === "correct"}
                className="w-full h-32 p-3 bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary resize-none mb-4 disabled:opacity-60"
              />

              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-body">
                  Prazo: {new Date(activity.deadline).toLocaleDateString("pt-BR")}
                </span>

                {currentStatus !== "pending" && currentStatus !== "correct" ? (
                  <Button
                    onClick={() => submitMutation.mutate(answer)}
                    className="uppercase tracking-widest font-display text-xs"
                    size="lg"
                    disabled={submitMutation.isPending || !answer.trim()}
                  >
                    {submitMutation.isPending
                      ? "Enviando..."
                      : currentStatus === "wrong"
                        ? "Reenviar Atividade"
                        : "Entregar Atividade"}
                  </Button>
                ) : currentStatus === "correct" ? (
                  <span className="text-emerald-400 font-display text-sm tracking-wider flex items-center gap-1">
                    <Check size={16} /> Concluída
                  </span>
                ) : (
                  <span className="text-amber-400 font-display text-sm tracking-wider flex items-center gap-1 animate-pulse">
                    ⏳ Resposta Pendente
                  </span>
                )}
              </div>
            </div>
          )}

          {isTeacher && (
            <div className="border-t border-border pt-4">
              <span className="text-xs text-muted-foreground font-body">
                Prazo configurado: {new Date(activity.deadline).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}
        </div>

        {/* Área do Professor */}
        {isTeacher && (
          <div className="animate-fade-up">
            <h2 className="font-display text-xs tracking-widest uppercase text-muted-foreground mb-4">
              📥 Respostas Pendentes de Alunos ({currentActivityPendencies.length})
            </h2>

            {currentActivityPendencies.length === 0 ? (
              <div className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground font-body">
                Nenhuma pendência encontrada para esta atividade. Tudo limpo!
              </div>
            ) : (
              <div className="space-y-4">
                {currentActivityPendencies.map((sub) => (
                  <div key={sub.submission_id} className="border border-border bg-card p-5">
                    <div className="flex justify-between items-center mb-3 border-b border-border/50 pb-2">
                      <span className="font-body text-sm font-semibold text-foreground">
                        {sub.student_name}
                      </span>
                      <span className="text-xs text-muted-foreground font-body bg-secondary px-2 py-0.5 border border-border">
                        {sub.classroom}
                      </span>
                    </div>

                    <p className="text-foreground font-body text-sm whitespace-pre-wrap bg-background p-3 border border-border mb-4">
                      {sub.submission}
                    </p>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 uppercase tracking-wider text-[10px] font-display"
                        disabled={gradeMutation.isPending}
                        onClick={() => {
                          const fb = prompt("Motivo da recusa (Obrigatório para o aluno refazer):");
                          if (fb)
                            gradeMutation.mutate({
                              submissionId: sub.submission_id,
                              evaluation: "wrong",
                              feedback: fb,
                            });
                        }}
                      >
                        <X size={12} className="mr-1" /> Recusar / Refazer
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white uppercase tracking-wider text-[10px] font-display"
                        disabled={gradeMutation.isPending}
                        onClick={() => {
                          const fb = prompt("Feedback positivo (Opcional):") || undefined;
                          gradeMutation.mutate({
                            submissionId: sub.submission_id,
                            evaluation: "correct",
                            feedback: fb,
                          });
                        }}
                      >
                        <Check size={12} className="mr-1" /> Aprovar e Dar XP
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {info && (
        <LevelUpModal
          isOpen={showLevelUp}
          oldLevel={`Nível ${info.level}`}
          newLevel="Campeão"
          onClose={() => setShowLevelUp(false)}
        />
      )}
    </div>
  );
};

export default ActivityPage;
