import type { ReactNode } from "react";
import { Swords } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
  side,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  side?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="ring-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[1100px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[700px] rounded-full bg-secondary/20 blur-[140px]" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-stretch gap-10 px-6 py-10 lg:grid-cols-2">
        {/* Hero side */}
        <div className="hidden flex-col justify-between lg:flex">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
              <Swords className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">ClassRPG</span>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight text-foreground">
              Transforme a sala de aula em uma <span className="text-gradient-primary">jornada épica</span>.
            </h2>
            <p className="max-w-md text-base text-muted-foreground">
              Missões, XP, patentes e rankings em tempo real para uma educação mais
              engajadora — desenvolvida com qualidade SaaS para escolas modernas.
            </p>
            <div className="flex flex-wrap gap-2">
              {["XP em tempo real", "Missões diárias", "Ranking ao vivo", "Conquistas épicas"].map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-foreground/80">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground/70">© ClassRPG · feito para escolas, professores e aventureiros do saber</div>
        </div>

        {/* Form side */}
        <div className="flex items-center justify-center">
          <div className="glass-strong w-full max-w-md rounded-3xl p-7 shadow-2xl md:p-9">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white">
                <Swords className="size-4" />
              </div>
              <span className="font-bold text-foreground">ClassRPG</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
            {side && <div className="mt-6 border-t border-white/10 pt-5">{side}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}