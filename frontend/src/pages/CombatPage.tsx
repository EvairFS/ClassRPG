import axios from "axios";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CombatArena } from "@/components/CombatArena";
// Se o seu projeto usa um hook para pegar o usuário logado, importe-o aqui:
// import { useCurrentUser } from "@/hooks/useCurrentUser";

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

  // Se o seu backend precisar identificar o aluno pelo token, descomente a linha abaixo:
  // const { user, token } = useCurrentUser();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mission", missionId],
    queryFn: async () => {
      const res = await axios.get<ApiResponse>(`http://localhost:3001/api/missions/${missionId}`);
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

  const questions = mission.questions.map((q) => ({
    ...q,
    text: q.statement,
    correctIndex: q.correct_index,
  }));

  const handleVictory = async () => {
    try {
      // Agora essa rota vai responder com 200 OK!
      await axios.post(`http://localhost:3001/api/missions/${missionId}/finish`);

      // Limpa o cache do React Query para o painel atualizar o Ouro na hora
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["student"] });
    } catch (err) {
      console.error("Erro ao salvar recompensas no banco:", err);
    } finally {
      navigate({ to: "/dashboard" });
    }
  };

  // 🔥 Função que faz a mágica acontecer no PostgreSQL ao vencer
  const handleVictory = async () => {
    try {
      // Faz o disparo para a rota do seu servidor atualizar o ouro/XP
      await axios.post(
        `http://localhost:3001/api/missions/${missionId}/complete`,
        {
          // studentId: user?.id // Envie o ID se o seu backend pedir no body
        },
        {
          // headers: { Authorization: `Bearer ${token}` } // Envie o token se sua rota for protegida
        },
      );

      // Avisa o React Query para limpar o cache antigo do painel
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["student"] });
    } catch (err) {
      console.error("Erro ao salvar recompensas no banco:", err);
    } finally {
      // Garante o retorno do usuário para o painel atualizado
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <CombatArena
      bossName={mission.title}
      initialBossHp={Number(mission.monster_hp)}
      questions={questions}
      // Injeta os dados dinâmicos do banco na Arena
      xpReward={Number(mission.xp_reward)}
      goldReward={Number(mission.gold_reward)}
      // Passa a função de salvamento
      onVictory={handleVictory}
      onDefeat={() => navigate({ to: "/dashboard" })}
      onFlee={() => navigate({ to: "/dashboard" })}
    />
  );
}
