import type { Student } from "@/types";
import { cn } from "@/lib/utils";
import { Crown, Trophy } from "lucide-react";
import { PatentBadge } from "./PatentBadge";

interface Props {
  students: Student[];
  currentUserId?: string;
  compact?: boolean;
}

export function RankingTable({ students, currentUserId, compact = false }: Props) {
  const sorted = [...students].sort((a, b) => b.xp - a.xp);
  const list = compact ? sorted.slice(0, 6) : sorted;
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className={cn(
        "grid items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
        compact ? "grid-cols-[2rem_1fr_4rem]" : "grid-cols-[2.5rem_1fr_8rem_6rem]",
      )}>
        <span>#</span>
        <span>Aluno</span>
        {!compact && <span>Patente</span>}
        <span className="text-right">XP</span>
      </div>
      <ul>
        {list.map((s, i) => {
          const isMe = s.id === currentUserId;
          const top = i < 3;
          return (
            <li key={s.id} className={cn(
              "grid items-center gap-3 px-4 py-3 transition-colors",
              compact ? "grid-cols-[2rem_1fr_4rem]" : "grid-cols-[2.5rem_1fr_8rem_6rem]",
              i !== 0 && "border-t border-white/5",
              isMe && "bg-primary/10",
              "hover:bg-white/5",
            )}>
              <span className={cn(
                "inline-flex size-7 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                i === 0 && "bg-accent/20 text-accent",
                i === 1 && "bg-white/10 text-foreground",
                i === 2 && "bg-secondary/15 text-secondary",
                !top && "text-muted-foreground",
              )}>
                {i === 0 ? <Crown className="size-3.5" /> : i + 1}
              </span>
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-[11px] font-semibold text-foreground ring-1 ring-white/10">
                  {s.avatar}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {s.name}
                    {isMe && <span className="ml-2 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">você</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{s.classroom}</p>
                </div>
              </div>
              {!compact && <PatentBadge xp={s.xp} />}
              <span className="inline-flex items-center justify-end gap-1 text-right text-sm font-semibold tabular-nums text-foreground">
                <Trophy className="size-3 text-accent/80" />
                {s.xp.toLocaleString("pt-BR")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}