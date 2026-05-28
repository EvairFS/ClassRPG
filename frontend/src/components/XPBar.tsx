import { getLevelInfo } from "@/lib/gamification";

interface XPBarProps {
  xp: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const XPBar = ({ xp, showLabel = true, size = "md" }: XPBarProps) => {
  const info = getLevelInfo(xp);
  const heights = { sm: "h-2", md: "h-4", lg: "h-6" };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="font-display text-sm tracking-widest text-foreground uppercase">
            Nível {info.level} — {info.name}
          </span>
          {info.nextLevelName && (
            <span className="text-xs text-muted-foreground font-body">
              {info.xpInLevel}/{info.xpForNext} XP para {info.nextLevelName}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-secondary ${heights[size]} relative overflow-hidden`}>
        <div
          className={`${heights[size]} bg-primary animate-xp-fill`}
          style={{ width: `${info.progress}%` }}
        />
        {size === "lg" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-body font-semibold text-primary-foreground drop-shadow">
              {Math.round(info.progress)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default XPBar;
