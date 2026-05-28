import type { Achievement as BadgeType } from "@/types";
import { Star, Shield, Sword, Crown, Flame, Eye } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  star: Star,
  shield: Shield,
  sword: Sword,
  crown: Crown,
  flame: Flame,
  eye: Eye,
};

interface BadgeCardProps {
  badge: BadgeType;
}

const BadgeCard = ({ badge }: BadgeCardProps) => {
  const Icon = iconMap[badge.icon] || Star;

  return (
    <div
      className={`border p-4 flex flex-col items-center gap-2 text-center transition-all duration-300 ${
        badge.earned
          ? "border-accent bg-card hover:border-primary"
          : "border-border bg-secondary opacity-50"
      }`}
    >
      <div className={`p-3 ${badge.earned ? "text-accent" : "text-muted-foreground"}`}>
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h4 className="font-display text-xs tracking-wider text-foreground">{badge.name}</h4>
      <p className="text-xs text-muted-foreground font-body">{badge.description}</p>
      {badge.earned && badge.earnedAt && (
        <span className="text-[10px] text-accent font-body">
          Conquistado em {new Date(badge.earnedAt).toLocaleDateString("pt-BR")}
        </span>
      )}
    </div>
  );
};

export default BadgeCard;
