import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CombatArena } from "@/components/CombatArena";
import { Loader2, ShieldAlert } from "lucide-react";

interface CombatMission {
  id: string;
  title: string;
  hp: number;
  xpReward: number;
  goldReward: number;
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
  }[];
}

export const Route = createFileRoute("/combat/$missionId")({
  component: CombatPage,
});

function CombatPage() {
  const { missionId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: mission,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mission", missionId],
    queryFn: async () => {
      const response = await api.getMissionCombat(missionId);
      return response as unknown as CombatMission;
    },
  });

  const completeMissionMutation = useMutation({
    mutationFn: async (payload: { status: "completed" | "failed"; xpEarned: number }) => {
      return api.finishMissionCombat(missionId, payload);
    },
    onSuccess: () => {
      // Invalida a lista de missões para aparecer "concluída" na tela de missões
      queryClient.invalidateQueries({ queryKey: ["missions-list"] });
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="size-10 text-amber-500 animate-spin" />
        <p className="font-mono text-sm text-slate-400">Entrando na masmorra...</p>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 gap-4">
        <div className="bg-slate-900 border border-rose-900/50 p-6 rounded-2xl max-w-md text-center space-y-3 shadow-xl">
          <ShieldAlert className="size-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-rose-400 font-mono">ERRO DE CONEXÃO</h3>
          <p className="text-sm text-slate-400">
            Não foi possível invocar este Boss. Verifique se a missão ainda está ativa.
          </p>
          <button
            onClick={() => navigate({ to: "/missions" })}
            className="w-full py-2 bg-slate-950 border border-slate-800 rounded-xl hover:text-rose-400 transition text-sm font-mono"
          >
            Voltar para as Missões
          </button>
        </div>
      </div>
    );
  }

  return (
    <CombatArena
      bossName={mission.title}
      initialBossHp={mission.hp}
      questions={mission.questions}
      xpReward={mission.xpReward ?? 0}
      goldReward={mission.goldReward ?? 0}
      onVictory={() => {
        // Salva vitória no backend e invalida cache de missões
        completeMissionMutation.mutate({
          status: "completed",
          xpEarned: mission.xpReward ?? 0,
        });
        // Navega para o painel
        navigate({ to: "/student" });
      }}
      onDefeat={() => {
        completeMissionMutation.mutate({ status: "failed", xpEarned: 0 });
        navigate({ to: "/student" });
      }}
      onFlee={() => {
        navigate({ to: "/missions" });
      }}
    />
  );
}
