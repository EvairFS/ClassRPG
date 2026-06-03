import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Carregando dados…" }: { label?: string }) {
  return (
    <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl p-10 text-center">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  label = "Não foi possível carregar os dados",
}: {
  error?: unknown;
  onRetry?: () => void;
  label?: string;
}) {
  const message =
    error instanceof Error ? error.message : "Tente novamente em instantes.";
  return (
    <div className="glass mx-auto flex max-w-md flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30">
        <AlertTriangle className="size-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button
          size="sm"
          onClick={onRetry}
          className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

export function SkeletonBlock({ className = "h-24" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] ${className}`}
    />
  );
}