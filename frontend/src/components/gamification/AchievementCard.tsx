import type { Achievement } from "@/types";
import { RARITY_META } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { Brain, Crown, Flame, Lock, Sparkles, Swords, Users } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  sparkles: Sparkles, flame: Flame, swords: Swords, brain: Brain, crown: Crown, users: Users,
};

export function AchievementCard({ a }: { a: Achievement }) {
  const Icon = ICONS[a.icon] ?? Sparkles;
  const r = RARITY_META[a.rarity];
  return (
    <div className={cn(
      "glass relative flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition",
      a.earned ? `ring-1 ${r.ring}` : "opacity-70",
    )}>
      <div className={cn(
        "relative mb-1 grid size-14 place-items-center rounded-full border border-white/10",
        a.earned ? "bg-white/5" : "bg-white/[0.02]",
      )}>
        {a.earned ? <Icon className={cn("size-7", r.color)} /> : <Lock className="size-6 text-muted-foreground/60" />}
      </div>
      <p className="text-sm font-semibold text-foreground">{a.name}</p>
      <p className="text-xs leading-snug text-muted-foreground">{a.description}</p>
      <span className={cn("text-[10px] font-semibold uppercase tracking-wider", r.color)}>{r.label}</span>
      {!a.earned && a.progress !== undefined && (
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div className="h-full bg-primary/70" style={{ width: `${a.progress}%` }} />
        </div>
      )}
    </div>
  );
}