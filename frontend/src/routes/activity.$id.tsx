import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DifficultyBadge } from "@/components/gamification/DifficultyBadge";
import { MOCK_ACTIVITIES } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, FileText, MessageSquare, Paperclip, Sparkles, Trophy, User } from "lucide-react";

export const Route = createFileRoute("/activity/$id")({
  head: () => ({
    meta: [
      { title: "Atividade — ClassRPG" },
      { name: "description", content: "Detalhes da atividade e envio da resposta." },
    ],
  }),
  loader: ({ params }) => {
    const activity = MOCK_ACTIVITIES.find((a) => a.id === params.id);
    if (!activity) throw notFound();
    return { activity };
  },
  notFoundComponent: () => {
    const { id } = Route.useParams();
    return (
      <AppShell role="student" title="Atividade">
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">404</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Atividade "{id}" não encontrada</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ela pode ter expirado ou sido removida.</p>
          <Link
            to="/activities"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <ArrowLeft className="size-4" />
            Ver todas as atividades
          </Link>
        </div>
      </AppShell>
    );
  },
  component: ActivityDetail,
});

function ActivityDetail() {
  const { activity } = Route.useLoaderData();
  const [answer, setAnswer] = useState(activity.submission ?? "");
  const [submittedNow, setSubmittedNow] = useState(false);
  const isSubmitted = activity.status !== "pending" || submittedNow;
  const isGraded = activity.status === "graded";

  return (
    <AppShell role="student" title={activity.title}>
      <div className="space-y-6">
        <Link to="/activities" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Voltar para atividades
        </Link>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
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
                <p className="text-sm leading-relaxed text-muted-foreground">{activity.instructions}</p>
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

            <div className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                {isGraded ? "Sua entrega" : "Sua resposta"}
              </h2>
              <textarea
                value={answer}
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
                    onClick={() => setSubmittedNow(true)}
                    disabled={!answer.trim()}
                    className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                  >
                    Enviar resposta
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                    <CheckCircle2 className="size-3.5" />
                    {isGraded ? "Atividade avaliada" : "Entrega registrada"}
                  </span>
                )}
              </div>
            </div>

            {(isGraded || submittedNow) && (
              <div className="mt-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/5 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">
                    +{activity.xpReward} XP conquistados!
                  </span>
                </div>
                {activity.feedback && (
                  <div className="mt-3 flex items-start gap-2">
                    <MessageSquare className="mt-0.5 size-4 text-secondary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">{activity.teacher}:</span> {activity.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </article>

          <aside className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Recompensa</p>
              <p className="mt-1 inline-flex items-center gap-1 text-2xl font-bold text-accent">
                <Trophy className="size-5" />
                +{activity.xpReward} XP
              </p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Prazo</p>
              <p className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-foreground">
                <Clock className="size-4 text-secondary" />
                {new Date(activity.deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
              </p>
            </div>
            {isGraded && (
              <div className="glass rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Nota</p>
                <p className="mt-1 text-3xl font-bold text-emerald-300 tabular-nums">{activity.grade}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}