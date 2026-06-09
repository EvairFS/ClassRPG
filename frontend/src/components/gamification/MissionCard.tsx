import type { Mission } from "@/types";
import { DifficultyBadge } from "./DifficultyBadge";
import { Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJoinMission } from "@/hooks/useMissions";
import { useNavigate } from "@tanstack/react-router";

const TYPE_LABEL: Record<Mission["type"], string> = {
  daily: "Diária",
  weekly: "Semanal",
  special: "Especial",
  event: "Evento",
  challenge: "Desafio",
};

// EXPORT NOMEADO GARANTIDO: Alinhado com o que o roteador e as páginas esperam
export function MissionCard({ mission, className }: { mission: Mission; className?: string }) {
  const { mutate: joinMission, isPending } = useJoinMission();
  const navigate = useNavigate();

  const pct = Math.min(100, (mission.progress / mission.total) * 100);
  const completed = mission.status?.toLowerCase() === "completed";
  const inProgress =
    mission.status?.toLowerCase() === "active" || mission.status?.toUpperCase() === "IN_PROGRESS";

  const handleAction = () => {
    if (!mission.status) {
      joinMission(mission.id);
    } else if (inProgress) {
      // Navegação segura para a Arena de Combate passando o ID da missão
      navigate({
        to: "/combat/$missionId",
        params: { missionId: mission.id },
      });
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

        {/* Barra de progresso baseada no estado da missão */}
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
