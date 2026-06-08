import type { Mission } from "@/types";
import { DifficultyBadge } from "./DifficultyBadge";
import { Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJoinMission } from "@/hooks/useMissions"; // 🌟 Importando o hook de mutação

const TYPE_LABEL: Record<Mission["type"], string> = {
  daily: "Diária",
  weekly: "Semanal",
  special: "Especial",
  event: "Evento",
  challenge: "Desafio",
};

export function MissionCard({ mission, className }: { mission: Mission; className?: string }) {
  const { mutate: joinMission, isPending } = useJoinMission(); // ⚔️ Inicializando a mutação

  const pct = Math.min(100, (mission.progress / mission.total) * 100);
  const completed = mission.status?.toLowerCase() === "completed";
  const inProgress =
    mission.status?.toLowerCase() === "active" || mission.status?.toUpperCase() === "IN_PROGRESS";

  // Lógica do clique do botão baseado no estado atual da missão
  const handleAction = () => {
    if (!mission.status) {
      joinMission(mission.id);
    } else if (inProgress) {
      // 🛡️ Próximo passo: Abrir o modal ou tela de combate
      console.log("Abrindo arena de combate para a missão:", mission.id);
    }
  };

  return (
    <div
      className={cn(
        "glass group relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5 hover:glow-primary flex flex-col justify-between h-full",
        className,
      )}
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {TYPE_LABEL[mission.type]}
          </span>
          <DifficultyBadge value={mission.difficulty} />
        </div>
        <h3 className="text-base font-semibold leading-snug text-foreground">{mission.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{mission.description}</p>

        {/* Só exibe a barra de progresso se o aluno já tiver aceitado a missão */}
        {mission.status && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span className="tabular-nums">
                {mission.progress}/{mission.total}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: completed
                    ? "linear-gradient(90deg, oklch(0.78 0.18 150), oklch(0.85 0.165 88))"
                    : "linear-gradient(90deg, oklch(0.65 0.23 296), oklch(0.78 0.14 215))",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="mt-4 flex items-center justify-between text-xs mb-4">
          <span className="inline-flex items-center gap-1 text-accent">
            <Trophy className="size-3.5" />+{mission.xpReward} XP
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3.5" />
            {new Date(mission.deadline).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>

        {/* 🌟 NOVO: Botão Dinâmico de Ação de RPG */}
        <button
          onClick={handleAction}
          disabled={isPending || completed}
          className={cn(
            "w-full py-2 px-4 rounded-xl text-sm font-bold transition-all border",
            !mission.status &&
              "bg-primary border-primary-hover text-primary-foreground hover:opacity-90",
            inProgress &&
              "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20",
            completed &&
              "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 opacity-70 cursor-not-allowed",
          )}
        >
          {isPending && "Entrando na Masmorra..."}
          {!isPending && !mission.status && "Aceitar Missão ⚔️"}
          {!isPending && inProgress && "Ir para o Combate 🛡️"}
          {!isPending && completed && "Missão Cumprida 🎉"}
        </button>
      </div>
    </div>
  );
}
