import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import XPBar from "@/components/XPBar";
import BadgeCard from "@/components/BadgeCard";
import ActivityCard from "@/components/ActivityCard";
import RankingTable from "@/components/RankingTable";
import LevelUpModal from "@/components/LevelUpModal";
import { getLevelInfo } from "@/lib/gamification";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/api";

const StudentDashboard = () => {
  const navigate = useNavigate();
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
        <main className="container mx-auto px-4 py-8 max-w-3xl">
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
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="text-center py-12">
            <p className="text-red-400">Erro ao carregar dados do aluno</p>
          </div>
        </main>
      </div>
    );
  }

  const info = getLevelInfo(student.xp);

  const handleSubmit = async (activityId: string) => {
    try {
      const activity = activities.find((a) => a.id === activityId);
      if (!activity) return;

      await api.submitActivity(activityId, token!);
      setXpPopup({ amount: activity.xpReward, visible: true });
      setTimeout(() => setXpPopup({ amount: 0, visible: false }), 1500);

      // Simulate level up for demo
      if (activityId === "1") {
        setTimeout(() => setShowLevelUp(true), 1600);
      }
    } catch (error) {
      console.error("Failed to submit activity", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType="student" />

      <main className="container mx-auto px-4 py-8 max-w-3xl relative">
        {/* XP Popup */}
        {xpPopup.visible && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <span className="font-display text-5xl text-accent animate-xp-pop">
              +{xpPopup.amount} XP
            </span>
          </div>
        )}

        {/* XP Bar - Fixed feel */}
        <section className="mb-12 animate-fade-up">
          <div className="border border-border bg-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 border-2 border-accent flex items-center justify-center font-body font-semibold text-lg text-accent">
                {student.avatar}
              </div>
              <div>
                <h2 className="font-display text-lg text-foreground tracking-wider uppercase">
                  {student.name}
                </h2>
                <p className="text-sm text-accent font-display">{student.xp} XP Total</p>
              </div>
            </div>
            <XPBar xp={student.xp} size="lg" />
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-12 animate-fade-up stagger-1" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-xl text-foreground tracking-widest uppercase mb-6 border-b border-border pb-3">
            Conquistas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <BadgeCard key={achievement.id} badge={achievement} />
            ))}
          </div>
        </section>

        {/* Activities */}
        <section className="mb-12 animate-fade-up stagger-2" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-xl text-foreground tracking-widest uppercase mb-6 border-b border-border pb-3">
            Atividades
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
        <section className="animate-fade-up stagger-3" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-xl text-foreground tracking-widest uppercase mb-6 border-b border-border pb-3">
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
