import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  delta?: number;
  icon: LucideIcon;
  tint?: "primary" | "secondary" | "accent" | "muted";
  className?: string;
}

const TINTS: Record<NonNullable<StatsCardProps["tint"]>, string> = {
  primary: "from-primary/30 to-primary/0 text-primary",
  secondary: "from-secondary/25 to-secondary/0 text-secondary",
  accent: "from-accent/30 to-accent/0 text-accent",
  muted: "from-white/10 to-white/0 text-foreground",
};

export function StatsCard({ label, value, delta, icon: Icon, tint = "primary", className }: StatsCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className={cn("glass relative overflow-hidden rounded-2xl p-5", className)}>
      <div className={cn("pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gradient-to-br blur-2xl", TINTS[tint])} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{value}</p>
          {delta !== undefined && (
            <p className={cn("mt-1 inline-flex items-center gap-1 text-xs font-medium", positive ? "text-emerald-300" : "text-rose-300")}>
              {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {positive ? "+" : ""}
              {delta}% vs. semana
            </p>
          )}
        </div>
        <div className={cn("rounded-xl border border-white/10 bg-white/5 p-2.5", TINTS[tint])}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}