import { getLevelInfo, getPatent } from "@/lib/gamification";
import { cn } from "@/lib/utils";

interface XPBarProps {
  xp: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showPatent?: boolean;
  className?: string;
}

export function XPBar({
  xp,
  size = "md",
  showLabel = true,
  showPatent = false,
  className,
}: XPBarProps) {
  const info = getLevelInfo(xp);
  const { current, next } = getPatent(xp);
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Nv. {info.level}</span>
            {showPatent && (
              <span
                className="rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                style={{ color: current.color, borderColor: current.color }}
              >
                {current.name}
              </span>
            )}
          </div>
          <span className="tabular-nums text-muted-foreground">
            {info.inLevel}/{info.needed} XP
            {next && (
              <span className="ml-2 text-[10px] text-muted-foreground/70">
                → {next.name}
              </span>
            )}
          </span>
        </div>
      )}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-inset ring-white/5",
          heights[size],
        )}
      >
        <div
          className="animate-xp-fill relative h-full rounded-full"
          style={{
            width: `${info.progress}%`,
            background:
              "linear-gradient(90deg, oklch(0.65 0.23 296), oklch(0.78 0.14 215))",
            boxShadow: "0 0 18px oklch(0.6 0.22 296 / .55)",
          }}
        >
          <span
            className="absolute inset-y-0 right-0 w-12 -skew-x-12 bg-white/30 mix-blend-overlay"
            style={{ animation: "shine 2.6s ease-in-out infinite" }}
          />
        </div>
      </div>
    </div>
  );
}