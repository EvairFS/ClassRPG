import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CombatArena } from "@/components/CombatArena";
import { Loader2, ShieldAlert } from "lucide-react";

interface CombatMission {
  id: string;
  title: string;
  hp: number;
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
  }[];
  xpReward?: number;
  xp?: number;
}

export const Route = createFileRoute("/combat/$missionId")({
  component: CombatPage,
});

function CombatPage() {
  const { missionId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 📡 Busca as missões e filtra a correta
  const {
    data: mission,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mission", missionId],
    queryFn: async () => {
      // 🛠️ Directiva '@ts-expect-error' removida, já que a API aceita o parâmetro nativamente!
      const response = await api.getMissions(missionId);

      const foundMission = response.find((m) => m.id === missionId);

      if (!foundMission) return null;

      return foundMission as unknown as CombatMission;
    },
  });

  // 💾 Salva o resultado do combate seguindo a tipagem do back-end
  const completeMissionMutation = useMutation({
    mutationFn: async (payload: { status: "completed" | "failed"; xpEarned: number }) => {
      return api.finishMissionCombat(missionId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions-list"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      navigate({ to: "/missions" });
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
      onVictory={() => {
        alert("🏆 Vitória! Você derrotou o Boss e coletou a recompensa!");

        const xpReward = mission.xpReward || mission.xp || 100;

        completeMissionMutation.mutate({
          status: "completed",
          xpEarned: xpReward,
        });
      }}
      onDefeat={() => {
        alert("💀 Derrota! Seu HP chegou a zero. Estude os conceitos e tente novamente!");

        completeMissionMutation.mutate({
          status: "failed",
          xpEarned: 0,
        });
      }}
      onFlee={() => {
        alert("🏳️ Você fugiu do combate e voltou para a taverna.");
        navigate({ to: "/missions" });
      }}
    />
  );
}
