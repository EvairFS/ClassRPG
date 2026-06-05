import { cn } from "@/lib/utils";
import { DIFFICULTY_META } from "@/lib/gamification";
import type { Difficulty } from "@/types";
import { Flame, Sparkles, Swords, Zap } from "lucide-react";

const ICONS: Record<Difficulty, React.ElementType> = {
  Easy: Sparkles,
  Medium: Zap,
  Hard: Flame,
  Epic: Swords,
};

export function DifficultyBadge({ value, className }: { value: Difficulty; className?: string }) {
  const meta = DIFFICULTY_META[value];
  const Icon = ICONS[value];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        meta.bg,
        meta.color,
        className,
      )}
    >
      <Icon className="size-3" />
      {meta.label}
    </span>
  );
}