import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPasswordPage });
const schema = z.object({ email: z.string().email("E-mail inválido") });

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState } = useForm<{ email: string }>({ resolver: zodResolver(schema) });
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
        <form onSubmit={handleSubmit(() => setSent(true))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="voce@escola.com" {...register("email")} />
            {formState.errors.email && <p className="text-xs text-rose-300">{formState.errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90">
            Enviar link de recuperação
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}