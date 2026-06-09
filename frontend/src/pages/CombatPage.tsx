import { CombatArena } from "@/components/CombatArena";
import { useNavigate, useParams } from "react-router-dom"; // Ou do Next.js se estiver usando

export function CombatPage() {
  const navigate = useNavigate();
  const { missionId } = useParams(); // Pega o ID da missão pela URL

  // 📡 Aqui você usaria o useQuery do TanStack para buscar os dados reais da API
  // const { data: mission } = useQuery({ queryKey: ["mission", missionId], queryFn: ... });

  // Mock de dados para você testar visualmente agora:
  const mockBoss = {
    title: "O Despertar do Scrum Master",
    hp: 120,
    questions: [
      {
        text: "Qual o papel principal do Scrum Master?",
        options: [
          "Cobrar tarefas e dar ordens",
          "Remover impedimentos e blindar o time",
          "Escrever todo o código do sistema",
          "Definir o preço do produto",
        ],
        correctIndex: 1,
      },
      // Adicione mais perguntas aqui...
    ],
  };

  return (
    <CombatArena
      bossName={mockBoss.title}
      initialBossHp={mockBoss.hp}
      questions={mockBoss.questions}
      onVictory={() => {
        alert("🏆 Vitória! Você derrotou o Boss e ganhou XP!");
        navigate("/dashboard"); // Volta pro mapa de missões
      }}
      onDefeat={() => {
        alert("💀 Derrota! Seu HP chegou a zero. Tente estudar mais e volte depois!");
        navigate("/dashboard");
      }}
      onFlee={() => {
        alert("🏳️ Você fugiu do combate com segurança.");
        navigate("/dashboard");
      }}
    />
  );
}
