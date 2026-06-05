import type { Difficulty, Patent } from "@/types";

export const PATENTS: { name: Patent; minXp: number; color: string }[] = [
  { name: "Novato", minXp: 0, color: "oklch(0.7 0.025 250)" },
  { name: "Aprendiz", minXp: 500, color: "oklch(0.73 0.13 215)" },
  { name: "Guerreiro Acadêmico", minXp: 1500, color: "oklch(0.62 0.22 296)" },
  { name: "Mestre Estratégico", minXp: 3500, color: "oklch(0.85 0.165 88)" },
  { name: "Lenda da Turma", minXp: 7000, color: "oklch(0.78 0.2 28)" },
];

export const LEVEL_STEP = 250;

export function getLevelInfo(xp: number) {
  const level = Math.floor(xp / LEVEL_STEP) + 1;
  const currentLevelXp = (level - 1) * LEVEL_STEP;
  const nextLevelXp = level * LEVEL_STEP;
  const inLevel = xp - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;
  const progress = Math.min(100, (inLevel / needed) * 100);
  return { level, inLevel, needed, progress, currentLevelXp, nextLevelXp };
}

export function getPatent(xp: number) {
  let current = PATENTS[0];
  let next: (typeof PATENTS)[number] | undefined;
  for (let i = 0; i < PATENTS.length; i++) {
    if (xp >= PATENTS[i].minXp) {
      current = PATENTS[i];
      next = PATENTS[i + 1];
    }
  }
  return { current, next };
}

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; color: string; bg: string; multiplier: number }
> = {
  Easy: {
    label: "Fácil",
    color: "text-emerald-300",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    multiplier: 1,
  },
  Medium: {
    label: "Médio",
    color: "text-secondary",
    bg: "bg-secondary/10 border-secondary/30",
    multiplier: 1.5,
  },
  Hard: {
    label: "Difícil",
    color: "text-accent",
    bg: "bg-accent/10 border-accent/30",
    multiplier: 2,
  },
  Epic: {
    label: "Épico",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/40",
    multiplier: 3,
  },
};

export const RARITY_META = {
  common: { label: "Comum", color: "text-muted-foreground", ring: "ring-white/10" },
  rare: { label: "Raro", color: "text-secondary", ring: "ring-secondary/40" },
  epic: { label: "Épico", color: "text-primary", ring: "ring-primary/50" },
  legendary: { label: "Lendário", color: "text-accent", ring: "ring-accent/60" },
} as const;