import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  LogOut,
  Search,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
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
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAuthenticated, hydrated, logout } = useAuth();

  const currentRole = user?.role || role;
  const items = NAV[currentRole];

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      navigate({ to: "/", replace: true });
    }
  }, [hydrated, isAuthenticated, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    navigate({ to: "/", replace: true });
  };

  const initials =
    (user?.name ?? "")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || (currentRole === "teacher" ? "PR" : currentRole === "admin" ? "AD" : "AL");

  // 🔔 Busca de notificações (Corrigido para 0 argumentos)
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
  const unread = (notifications ?? []).filter((n) => !n.read).length;

  // 🎯 DADOS DINÂMICOS (Corrigido para 0 argumentos)
  const { data: dashboardData } = useQuery({
    queryKey: ["studentDashboard"],
    queryFn: () => api.getStudentDashboard(),
    enabled: isAuthenticated && currentRole === "student",
    staleTime: 30_000,
  });

  // Hack temporário para o TS aceitar a propriedade dinâmica sem quebrar o build
  const studentDashboard = dashboardData as any;

  if (hydrated && !isAuthenticated) {
    return null;
  }

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
              {ROLE_LABEL[currentRole]}
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
                <item.icon
                  className={cn(
                    "size-4",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 🎯 PRÓXIMO DESAFIO REAL E DINÂMICO (Usa a variável com bypass do TS) */}
        {currentRole === "student" && studentDashboard?.proximoDesafio && (
          <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Próximo desafio
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {studentDashboard.proximoDesafio.titulo}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {studentDashboard.proximoDesafio.diasRestantes} · +
              {studentDashboard.proximoDesafio.xpReward} XP
            </p>
            <Link
              to="/missions"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              Preparar-se
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 text-[11px] font-semibold ring-1 ring-white/15">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {hydrated ? (user?.name ?? "Visitante") : "…"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {ROLE_LABEL[currentRole]}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            className="text-muted-foreground transition hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
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
              <kbd className="rounded border border-white/10 px-1 text-[10px] text-muted-foreground/70">
                ⌘K
              </kbd>
            </div>
            <Link
              to="/notifications"
              className="relative inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:text-foreground"
            >
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
