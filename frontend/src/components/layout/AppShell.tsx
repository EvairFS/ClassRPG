import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Search,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CURRENT_STUDENT, MOCK_NOTIFICATIONS } from "@/data/mockData";
import type { UserRole } from "@/types";

interface AppShellProps {
  role: UserRole;
  title: string;
  children: ReactNode;
}

const NAV: Record<UserRole, { to: string; label: string; icon: React.ElementType }[]> = {
  student: [
    { to: "/student", label: "Painel", icon: LayoutDashboard },
    { to: "/missions", label: "Missões", icon: Target },
    { to: "/activities", label: "Atividades", icon: Swords },
    { to: "/ranking", label: "Ranking", icon: Trophy },
    { to: "/achievements", label: "Conquistas", icon: Sparkles },
    { to: "/teams", label: "Equipes", icon: Users },
    { to: "/notifications", label: "Notificações", icon: Bell },
  ],
  teacher: [
    { to: "/teacher", label: "Painel", icon: LayoutDashboard },
    { to: "/activities", label: "Atividades", icon: Swords },
    { to: "/missions", label: "Missões", icon: Target },
    { to: "/reports", label: "Relatórios", icon: BarChart3 },
    { to: "/notifications", label: "Notificações", icon: Bell },
  ],
  admin: [
    { to: "/admin", label: "Visão geral", icon: LayoutDashboard },
    { to: "/reports", label: "Relatórios", icon: BarChart3 },
    { to: "/notifications", label: "Notificações", icon: Bell },
  ],
};

const ROLE_LABEL: Record<UserRole, string> = {
  student: "Aluno",
  teacher: "Professor",
  admin: "Administrador",
};

export function AppShell({ role, title, children }: AppShellProps) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = NAV[role];
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/5 bg-sidebar/70 backdrop-blur-xl md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-white/5 px-5">
          <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white">
            <Swords className="size-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">ClassRPG</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {ROLE_LABEL[role]}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {items.map((item) => {
            const active = path === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-gradient-to-r from-primary/20 to-secondary/10 text-foreground ring-1 ring-primary/30"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <item.icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Próximo desafio
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">Boss bimestral</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Em 11 dias · +900 XP</p>
          <Link
            to="/student"
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Preparar-se
          </Link>
        </div>
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 text-[11px] font-semibold ring-1 ring-white/15">
              {role === "student" ? CURRENT_STUDENT.avatar : role === "teacher" ? "RV" : "AD"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {role === "student" ? CURRENT_STUDENT.name : role === "teacher" ? "Renata V." : "Admin"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">{ROLE_LABEL[role]}</p>
            </div>
          </div>
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <LogOut className="size-4" />
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/5 bg-background/70 px-4 backdrop-blur-xl md:px-8">
          <h1 className="text-base font-semibold text-foreground md:text-lg">{title}</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground sm:flex">
              <Search className="size-3.5" />
              <input
                placeholder="Buscar missões, alunos..."
                className="w-56 bg-transparent outline-none placeholder:text-muted-foreground/60"
              />
              <kbd className="rounded border border-white/10 px-1 text-[10px] text-muted-foreground/70">⌘K</kbd>
            </div>
            <Link to="/notifications" className="relative inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:text-foreground">
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                  {unread}
                </span>
              )}
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}