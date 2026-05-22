import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MOCK_NOTIFICATIONS } from "@/data/mockData";
import type { NotificationItem } from "@/types";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck, MessageSquare, Settings, Sparkles, Target, Trophy, Trash2 } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notificações — ClassRPG" },
      { name: "description", content: "Avisos de XP, missões, conquistas e feedbacks." },
    ],
  }),
  component: NotificationsPage,
});

const FILTERS: { value: NotificationItem["type"] | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "xp", label: "XP" },
  { value: "mission", label: "Missões" },
  { value: "achievement", label: "Conquistas" },
  { value: "feedback", label: "Feedback" },
  { value: "system", label: "Sistema" },
];

const ICONS: Record<NotificationItem["type"], React.ElementType> = {
  xp: Trophy,
  mission: Target,
  achievement: Sparkles,
  feedback: MessageSquare,
  system: Settings,
};

const TINT: Record<NotificationItem["type"], string> = {
  xp: "text-accent bg-accent/10 border-accent/30",
  mission: "text-secondary bg-secondary/10 border-secondary/30",
  achievement: "text-primary bg-primary/10 border-primary/30",
  feedback: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  system: "text-muted-foreground bg-white/5 border-white/10",
};

function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationItem["type"] | "all">("all");
  const [items, setItems] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const list = useMemo(
    () => (filter === "all" ? items : items.filter((n) => n.type === filter)),
    [filter, items],
  );
  const unread = items.filter((n) => !n.read).length;

  return (
    <AppShell role="student" title="Notificações">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="inline-flex items-center gap-2 text-xl font-semibold text-foreground">
              <Bell className="size-5 text-secondary" />
              Central de avisos
            </h2>
            <p className="text-sm text-muted-foreground">
              {unread} não lidas · {items.length} no total
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <CheckCheck className="size-3.5" />
              Marcar tudo como lida
            </button>
            <button
              onClick={() => setItems([])}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-rose-300"
            >
              <Trash2 className="size-3.5" />
              Limpar
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-medium transition",
                filter === f.value
                  ? "border-primary/40 bg-gradient-to-r from-primary/20 to-secondary/10 text-foreground"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Bell className="mx-auto mb-3 size-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">Tudo em dia, aventureiro. Nada para ler aqui.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {list.map((n) => {
              const Icon = ICONS[n.type];
              return (
                <li
                  key={n.id}
                  onClick={() =>
                    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
                  }
                  className={cn(
                    "glass group flex cursor-pointer items-start gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5",
                    !n.read && "ring-1 ring-primary/30",
                  )}
                >
                  <div className={cn("grid size-10 shrink-0 place-items-center rounded-xl border", TINT[n.type])}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{n.title}</p>
                      {!n.read && <span className="size-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{n.body}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground/80">{n.createdAt}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}