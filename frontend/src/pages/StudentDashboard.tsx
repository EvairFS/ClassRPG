import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BadgeCard from "@/components/BadgeCard";
import ActivityCard from "@/components/ActivityCard";
import RankingTable from "@/components/RankingTable";
import LevelUpModal from "@/components/LevelUpModal";

// 🌟 Importando os novos componentes gamificados que você criou
import { ProfileHeader } from "@/components/gamification/ProfileHeader";
import { StatsCard } from "@/components/gamification/StatsCard";
import { getLevelInfo } from "@/lib/gamification";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/api";

// 🪙 Ícones do Lucide para os Cards Grandes de estatísticas
import { Coins, Trophy, Flame, Target } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated } = useCurrentUser();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpPopup, setXpPopup] = useState<{ amount: number; visible: boolean }>({
    amount: 0,
    visible: false,
  });

  // Redirect if not authenticated
  if (!isAuthenticated || user?.role !== "student") {
    navigate("/");
    return null;
  }

  // Fetch student dashboard data
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard", "student", user.id],
    queryFn: () => api.getStudentDashboard(user.id, token!),
    enabled: !!token && !!user.id,
  });

  // Fetch ranking
  const { data: ranking, isLoading: rankingLoading } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => api.getRanking(token!),
    enabled: !!token,
  });

  if (dashboardLoading || rankingLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userType="student" />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  const student = dashboard?.student;
  const activities = dashboard?.activities || [];
  const achievements = dashboard?.achievements || [];
  const students = ranking?.students || [];

  if (!student) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userType="student" />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <p className="text-red-400">Erro ao carregar dados do aluno</p>
          </div>
        </main>
      </div>
    );
  }

  const info = getLevelInfo(student.xp);

  // 🎯 Posição calculada em tempo real com base no array do ranking real
  const posicaoNoRanking = students.findIndex((s) => s.id === student.id) + 1;

  const handleSubmit = async (activityId: string) => {
    try {
      const activity = activities.find((a) => a.id === activityId);
      if (!activity) return;

      // 1. Envia o ID real (UUID ou número) para a sua rota do banco atualizar as tabelas
      await api.submitActivity(activityId, token!);

      // 2. 🔥 CORREÇÃO DE RECOMPENSA: Lê de forma segura o XP real que a rota retornou do banco
      const xpGanho = (activity as any).xp_reward || activity.xpReward || 0;

      // 3. Exibe o feedback visual na tela com o valor real injetado
      setXpPopup({ amount: xpGanho, visible: true });
      setTimeout(() => setXpPopup({ amount: 0, visible: false }), 1500);

      // 4. 🔥 ATUALIZAÇÃO REPRODUTÍVEL: Invalida o cache do React Query para renovar os dados de XP/Ouro na tela na hora
      queryClient.invalidateQueries({ queryKey: ["dashboard", "student", user.id] });
      queryClient.invalidateQueries({ queryKey: ["ranking"] });

      // Gatilho dinâmico para o modal de Level Up se o XP atual superou o limite do nível
      if (activityId === "1" || student.xp + xpGanho >= info.nextLevelXp) {
        setTimeout(() => setShowLevelUp(true), 1600);
      }
    } catch (error) {
      console.error("Failed to submit activity", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar userType="student" />

      {/* Aumentei levemente para max-w-4xl para acomodar melhor a fileira de 4 cards grandes */}
      <main className="container mx-auto px-4 py-8 max-w-4xl relative flex flex-col gap-6">
        {/* XP Popup Dinâmico */}
        {xpPopup.visible && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <span className="font-display text-5xl text-accent animate-xp-pop drop-shadow-[0_0_15px_rgba(var(--accent),0.6)]">
              +{xpPopup.amount} XP
            </span>
          </div>
        )}

        {/* 🌟 NOVO BANNER SUPERIOR: Substituindo o bloco antigo pelo ProfileHeader dinâmico */}
        <ProfileHeader student={student} />

        {/* 🌟 NOVO GRID DE CARDS GRANDES: Integrando os StatsCards com os dados reais do banco */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 animate-fade-up stagger-1">
          <StatsCard
            label="Ouro Acumulado"
            value={`🪙 ${(student as any).gold ?? 0}`}
            icon={Coins}
            tint="gold"
          />
          <StatsCard
            label="Posição Geral"
            value={posicaoNoRanking > 0 ? `#${posicaoNoRanking}` : "—"}
            icon={Trophy}
            tint="secondary"
          />
          <StatsCard
            label="Sequência"
            value={`${student.streak ?? 0} dias`}
            icon={Flame}
            tint="accent"
          />
          <StatsCard
            label="Missões Ativas"
            value={activities.filter((a) => !a.completed).length || activities.length}
            icon={Target}
            tint="primary"
          />
        </div>

        {/* Achievements */}
        <section className="animate-fade-up stagger-2 mt-4" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-lg font-semibold tracking-wider text-foreground uppercase mb-4 border-b border-white/10 pb-2">
            Conquistas Desbloqueadas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <BadgeCard key={achievement.id} badge={achievement} />
            ))}
          </div>
        </section>

        {/* Activities */}
        <section className="animate-fade-up stagger-3" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-lg font-semibold tracking-wider text-foreground uppercase mb-4 border-b border-white/10 pb-2">
            Atividades em Andamento
          </h2>
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                showSubmit
                onSubmit={handleSubmit}
              />
            ))}
          </div>
        </section>

        {/* Ranking */}
        <section className="animate-fade-up stagger-4" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-lg font-semibold tracking-wider text-foreground uppercase mb-4 border-b border-white/10 pb-2">
            Ranking da Classe
          </h2>
          <RankingTable students={students} currentUserId={student.id} compact />
        </section>
      </main>

      <LevelUpModal
        isOpen={showLevelUp}
        oldLevel={info.name}
        newLevel="Campeão"
        onClose={() => setShowLevelUp(false)}
      />
    </div>
  );
};

export default StudentDashboard;
