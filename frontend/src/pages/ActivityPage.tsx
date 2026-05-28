import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import LevelUpModal from "@/components/LevelUpModal";
import { Button } from "@/components/ui/button";
import { api } from "@/api";
import { getLevelInfo } from "@/lib/gamification";
import { ArrowLeft } from "lucide-react";

const ActivityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [showXpPop, setShowXpPop] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const { data: activity, isLoading } = useQuery(
    ["activity", id],
    () => api.getActivity(id!),
    {
      retry: false,
      staleTime: 1000 * 60,
    }
  );

  const { data: currentStudent } = useQuery(
    ["currentStudent"],
    api.getCurrentStudent,
    {
      retry: false,
      staleTime: 1000 * 60,
    }
  );

  const info = getLevelInfo(currentStudent?.xp || 0);

  if (isLoading || !activity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Carregando atividade...</p>
      </div>
    );
  }

  const handleSubmit = () => {
    setSubmitted(true);
    setShowXpPop(true);
    setTimeout(() => setShowXpPop(false), 1500);
    if (activity.id === "4") {
      setTimeout(() => setShowLevelUp(true), 1600);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType="student" />

      <main className="container mx-auto px-4 py-8 max-w-2xl relative">
        {showXpPop && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <span className="font-display text-5xl text-accent animate-xp-pop">
              +{activity.xpReward} XP
            </span>
          </div>
        )}

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-body text-sm">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </button>

        <div className="border border-border bg-card p-8 animate-fade-up">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className={`text-xs font-body px-2 py-1 border mb-3 inline-block ${
                activity.status === "completed" ? "border-border text-muted-foreground" : "border-primary text-primary"
              }`}>
                {activity.status === "completed" ? "Concluída" : activity.status === "active" ? "Ativa" : "Pendente"}
              </span>
              <h1 className="font-display text-xl tracking-wider text-foreground uppercase mt-2">{activity.title}</h1>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl text-accent">+{activity.xpReward}</p>
              <p className="text-xs text-muted-foreground font-body">XP de recompensa</p>
            </div>
          </div>

          <p className="text-foreground font-body leading-relaxed mb-6">{activity.description}</p>

          <div className="border-t border-border pt-4 flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-body">
              Prazo: {new Date(activity.deadline).toLocaleDateString("pt-BR")}
            </span>

            {!submitted && activity.status !== "completed" ? (
              <Button onClick={handleSubmit} className="uppercase tracking-widest font-display text-xs" size="lg">
                Entregar Atividade
              </Button>
            ) : (
              <span className="text-accent font-display text-sm tracking-wider">✓ Entregue</span>
            )}
          </div>
        </div>
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

export default ActivityPage;
