import type { Student } from "@/types";
import { XPBar } from "./XPBar";
import { PatentBadge } from "./PatentBadge";
import { Flame, Sparkles, Trophy } from "lucide-react";

export function ProfileHeader({ student }: { student: Student }) {
  return (
    <div className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8">
      <div className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 size-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/60 to-secondary/60 text-2xl font-bold text-white ring-1 ring-white/20">
          {student.avatar}
          <span className="absolute -bottom-2 right-1 grid size-7 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground ring-2 ring-background">
            {student.level}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-semibold text-foreground md:text-2xl">
              Olá, {student.name.split(" ")[0]} 👋
            </h2>
            <PatentBadge xp={student.xp} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{student.classroom} · {student.email}</p>
          <div className="mt-4 max-w-xl">
            <XPBar xp={student.xp} size="lg" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <Mini label="XP total" value={student.xp.toLocaleString("pt-BR")} icon={Trophy} tint="text-accent" />
          <Mini label="Sequência" value={`${student.streak}d`} icon={Flame} tint="text-rose-300" />
          <Mini label="Missões" value={student.missionsCompleted} icon={Sparkles} tint="text-primary" />
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, icon: Icon, tint }: { label: string; value: string | number; icon: React.ElementType; tint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
      <Icon className={`mx-auto mb-1 size-4 ${tint}`} />
      <p className="text-base font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}