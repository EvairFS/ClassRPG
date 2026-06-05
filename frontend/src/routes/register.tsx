import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { setAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({ component: RegisterPage });

const schema = z.object({
  name: z.string().min(3, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role: z.enum(["student", "teacher"]),
  classroom: z.string().optional(),
  subject: z.string().optional(),
});
type V = z.infer<typeof schema>;

function RegisterPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { register, handleSubmit, formState, watch } = useForm<V>({
    resolver: zodResolver(schema),
    defaultValues: { role: "student" },
  });
  const role = watch("role");

  const onSubmit = async (values: V) => {
    setSubmitError(null);
    setPending(true);
    try {
      const { token, user } = await api.register(values);
      setAuth({ token, user });
      navigate({ to: user.role === "teacher" ? "/teacher" : "/student" });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Não foi possível criar sua conta.";
      setSubmitError(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title="Crie sua conta de aventureiro"
      subtitle="Comece a ganhar XP e desbloquear conquistas hoje mesmo."
      side={<p className="text-center text-sm text-muted-foreground">Já tem conta? <Link to="/" className="font-semibold text-primary hover:underline">Entrar</Link></p>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(["student", "teacher"] as const).map((r) => (
            <label
              key={r}
              className={
                "cursor-pointer rounded-lg px-3 py-2 text-center text-xs font-medium transition " +
                (role === r
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <input type="radio" value={r} className="hidden" {...register("role")} />
              {r === "student" ? "Sou aluno" : "Sou professor"}
            </label>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" placeholder="Seu nome" {...register("name")} />
          {formState.errors.name && <p className="text-xs text-rose-300">{formState.errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="voce@escola.com" {...register("email")} />
          {formState.errors.email && <p className="text-xs text-rose-300">{formState.errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
          {formState.errors.password && <p className="text-xs text-rose-300">{formState.errors.password.message}</p>}
        </div>
        {role === "student" ? (
          <div className="space-y-1.5">
            <Label htmlFor="classroom">Turma (opcional)</Label>
            <Input id="classroom" placeholder="9º Ano A" {...register("classroom")} />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="subject">Disciplina (opcional)</Label>
            <Input id="subject" placeholder="Matemática" {...register("subject")} />
          </div>
        )}
        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Criando conta…
            </span>
          ) : (
            "Criar conta"
          )}
        </Button>
        {submitError && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-center text-xs text-rose-300">
            {submitError}
          </p>
        )}
      </form>
    </AuthLayout>
  );
}