import axios from "axios";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CombatArena } from "@/components/CombatArena";

// Formato que vem do banco de dados
type ApiQuestion = {
  id: string;
  mission_id: string;
  statement: string; // no banco é "statement", não "text"
  options: string[];
  correct_index: number; // no banco é "correct_index", não "correctIndex"
  damage: number;
};

// Formato da missão que vem da API
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

// O success() do backend envolve tudo em { data: ... }
type ApiResponse = {
  data: MissionData;
};

export function CombatPage() {
  const navigate = useNavigate();
  const { missionId } = useParams({ strict: false });

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mission", missionId],
    queryFn: async () => {
      const res = await axios.get<ApiResponse>(`http://localhost:30001/api/missions/${missionId}`);
      return res.data;
    },
    enabled: !!missionId,
  });

  if (!missionId || isLoading) {
    return (
      <div className="text-white min-h-screen bg-slate-950 flex items-center justify-center">
        Carregando batalha...
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="text-red-500 min-h-screen bg-slate-950 flex items-center justify-center">
        Erro ao carregar missão.
      </div>
    );
  }

  const mission = response.data;

  if (!mission.questions || mission.questions.length === 0) {
    return (
      <div className="text-yellow-500 min-h-screen bg-slate-950 flex items-center justify-center">
        Esta missão não tem perguntas cadastradas.
      </div>
    );
  }

  // Converte o formato do banco para o formato que o CombatArena espera
  const questions = mission.questions.map((q) => ({
    ...q,
    text: q.statement, // statement → text
    correctIndex: q.correct_index, // correct_index → correctIndex
  }));

  return (
    <CombatArena
      bossName={mission.title}
      initialBossHp={Number(mission.monster_hp)}
      questions={questions}
      onVictory={() => navigate({ to: "/dashboard" })}
      onDefeat={() => navigate({ to: "/dashboard" })}
      onFlee={() => navigate({ to: "/dashboard" })}
    />
  );
}
