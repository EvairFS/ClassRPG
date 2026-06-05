import { cn } from "@/lib/utils";
import { getPatent } from "@/lib/gamification";
import { Shield } from "lucide-react";

export function PatentBadge({ xp, className }: { xp: number; className?: string }) {
  const { current } = getPatent(xp);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
        className,
      )}
      style={{ color: current.color, borderColor: current.color + "55", background: current.color + "12" }}
    >
      <Shield className="size-3.5" />
      {current.name}
    </span>
  );
}