import axios from "axios";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CombatArena } from "@/components/CombatArena";
import { useMemo } from "react";

type ApiQuestion = {
  id: string;
  mission_id: string;
  statement: string;
  options: string[];
  correct_index: number;
  damage: number;
};

type MissionData = {
  id: string;
  title: string;
  description?: string;
  monster_hp: number;
  xp_reward: number;
  gold_reward: number;
  type: string;
  difficulty: string;
  questions: ApiQuestion[];
};

type ApiResponse = {
  data: MissionData;
};

export function CombatPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { missionId } = useParams({ strict: false });

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mission", missionId],
    queryFn: async () => {
      const res = await axios.get<ApiResponse>(`https://classrpg-api-26wl.onrender.com/api/missions/${missionId}`);
      return res.data;
    },
    enabled: !!missionId,
  });

  if (!missionId || isLoading) {
    return (
      <div className="text-white min-h-screen bg-slate-950 flex items-center justify-center font-medium tracking-wide">
        ⚔️ Carregando batalha e invocando monstros...
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="text-red-500 min-h-screen bg-slate-950 flex items-center justify-center font-bold">
        ❌ Erro ao carregar missão nos pergaminhos do reino.
      </div>
    );
  }

  const mission = response.data;

  if (!mission.questions || mission.questions.length === 0) {
    return (
      <div className="text-yellow-500 min-h-screen bg-slate-950 flex items-center justify-center font-bold">
        ⚠️ Esta missão está vazia e sem perigos cadastrados.
      </div>
    );
  }

  const questions = useMemo(() => {
    if (!mission?.questions) return [];
    return mission.questions.map((q) => ({
      ...q,
      text: q.statement, // Caso o CombatArena use .text
      statement: q.statement, // Caso o CombatArena use .statement
      title: q.statement, // Caso o CombatArena use .title
      correctIndex: q.correct_index,
    }));
  }, [mission?.questions]);

  // Função única consolidada para salvar progresso no PostgreSQL
  const handleVictory = async () => {
    try {
      await axios.post(
        `https://classrpg-api-26wl.onrender.com/api/missions/${missionId}/complete`,
        {},
        {
          // headers: { Authorization: `Bearer ${token}` } // Caso use autenticação futuramente
        },
      );

      // Invalida os caches do TanStack Query para atualizar instantaneamente o HUD principal do aluno
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["student"] });
    } catch (err) {
      console.error("Erro ao salvar recompensas nas profundezas do banco:", err);
    } finally {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <CombatArena
      bossName={mission.title}
      initialBossHp={Number(mission.monster_hp)}
      questions={questions}
      xpReward={Number(mission.xp_reward)}
      goldReward={Number(mission.gold_reward)}
      onVictory={handleVictory}
      onDefeat={() => navigate({ to: "/dashboard" })}
      onFlee={() => navigate({ to: "/dashboard" })}
    />
  );
}
