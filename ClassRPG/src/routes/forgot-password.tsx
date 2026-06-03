import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPasswordPage });
const schema = z.object({ email: z.string().email("E-mail inválido") });

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: { email: string }) => {
    setSubmitError(null);
    setPending(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Falha ao enviar.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar acesso"
      subtitle="Enviamos um link mágico para você voltar à jornada."
      side={<p className="text-center text-sm text-muted-foreground">Lembrou? <Link to="/" className="font-semibold text-primary hover:underline">Entrar</Link></p>}
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <CheckCircle2 className="size-8 text-emerald-300" />
          <p className="text-sm text-foreground">Se este e-mail existir, o link foi enviado.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="voce@escola.com" {...register("email")} />
            {formState.errors.email && <p className="text-xs text-rose-300">{formState.errors.email.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Enviando…
              </span>
            ) : (
              "Enviar link de recuperação"
            )}
          </Button>
          {submitError && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-center text-xs text-rose-300">
              {submitError}
            </p>
          )}
        </form>
      )}
    </AuthLayout>
  );
}