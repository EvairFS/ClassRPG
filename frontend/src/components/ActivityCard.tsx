import { Activity } from "@/data/mockData";
import { Button } from "@/components/ui/button";

interface ActivityCardProps {
  activity: Activity;
  onSubmit?: (id: string) => void;
  showSubmit?: boolean;
}

const ActivityCard = ({ activity, onSubmit, showSubmit = false }: ActivityCardProps) => {
  const statusStyles: Record<string, string> = {
    pending: "border-primary",
    active: "border-accent",
    completed: "border-border opacity-70",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    active: "Ativa",
    completed: "Concluída",
  };

  return (
    <div className={`border bg-card p-5 ${statusStyles[activity.status]} transition-all duration-300`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-display text-sm tracking-wider text-foreground uppercase">{activity.title}</h3>
        <span className={`text-xs font-body px-2 py-1 border ${
          activity.status === "completed" ? "border-border text-muted-foreground" :
          activity.status === "active" ? "border-accent text-accent" :
          "border-primary text-primary"
        }`}>
          {statusLabels[activity.status]}
        </span>
      </div>
      <p className="text-sm text-muted-foreground font-body mb-4">{activity.description}</p>
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <span className="text-accent font-display text-sm">+{activity.xpReward} XP</span>
          <span className="text-xs text-muted-foreground font-body">
            Prazo: {new Date(activity.deadline).toLocaleDateString("pt-BR")}
          </span>
        </div>
        {showSubmit && activity.status !== "completed" && (
          <Button variant="default" size="sm" onClick={() => onSubmit?.(activity.id)}>
            Entregar
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;
