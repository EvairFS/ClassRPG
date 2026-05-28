import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import XPBar from "@/components/XPBar";
import BadgeCard from "@/components/BadgeCard";
import ActivityCard from "@/components/ActivityCard";
import RankingTable from "@/components/RankingTable";
import LevelUpModal from "@/components/LevelUpModal";
import { api } from "@/api";
import { CURRENT_STUDENT, MOCK_ACTIVITIES, MOCK_STUDENTS } from "@/data/mockData";
import { getLevelInfo } from "@/lib/gamification";

const StudentDashboard = () => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpPopup, setXpPopup] = useState<{ amount: number; visible: boolean }>({ amount: 0, visible: false });

  const { data: currentStudent, isLoading: isStudentLoading, isError: isStudentError } = useQuery(
    ["currentStudent"],
    api.getCurrentStudent,
    {
      retry: false,
      staleTime: 1000 * 60,
    }
  );

  const { data: students, isLoading: isStudentsLoading } = useQuery(["students"], api.getStudents, {
    retry: false,
    staleTime: 1000 * 60,
  });

  const { data: activities, isLoading: isActivitiesLoading } = useQuery(
    ["activities"],
    api.getActivities,
    {
      retry: false,
      staleTime: 1000 * 60,
    }
  );

  const me = currentStudent || {
    id: "",
    name: "Carregando...",
    avatar: "?",
    xp: 0,
  };
  const studentList = students || [];
  const activityList = activities || MOCK_ACTIVITIES;
  const info = getLevelInfo(me.xp);

  const handleSubmit = (activityId: string) => {
    const activity = MOCK_ACTIVITIES.find((a) => a.id === activityId);
    if (!activity) return;
    setXpPopup({ amount: activity.xpReward, visible: true });
    setTimeout(() => setXpPopup({ amount: 0, visible: false }), 1500);
    // Simulate level up for demo
    if (activityId === "1") {
      setTimeout(() => setShowLevelUp(true), 1600);
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
                {me.avatar}
              </div>
              <div>
                <h2 className="font-display text-lg text-foreground tracking-wider uppercase">{me.name}</h2>
                <p className="text-sm text-accent font-display">{me.xp} XP Total</p>
              </div>
            </div>
            <XPBar xp={me.xp} size="lg" />
          </div>
        </section>

        {/* Badges */}
        <section className="mb-12 animate-fade-up stagger-1" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-xl text-foreground tracking-widest uppercase mb-6 border-b border-border pb-3">
            Conquistas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MOCK_BADGES.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </section>

        {/* Activities */}
        <section className="mb-12 animate-fade-up stagger-2" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-xl text-foreground tracking-widest uppercase mb-6 border-b border-border pb-3">
            Atividades
          </h2>
          <div className="space-y-3">
            {activityList.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} showSubmit onSubmit={handleSubmit} />
            ))}
          </div>
        </section>

        {/* Ranking */}
        <section className="animate-fade-up stagger-3" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-xl text-foreground tracking-widest uppercase mb-6 border-b border-border pb-3">
            Ranking da Classe
          </h2>
          <RankingTable students={studentList} currentUserId={me.id} compact />
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
