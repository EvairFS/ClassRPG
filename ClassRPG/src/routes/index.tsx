import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Loader2, Shield, User } from "lucide-react";
import { useState, useEffect } from "react"; // 💡 Importado useEffect
import { api, ApiError } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth"; // 💡 Importado o hook de autenticação

export const Route = createFileRoute("/")({ component: LoginPage });

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
type FormValues = z.infer<typeof schema>;

const ROLES = [
  { id: "student", label: "Aluno", icon: User },
  { id: "teacher", label: "Professor", icon: GraduationCap },
  { id: "admin", label: "Admin", icon: Shield },
] as const;

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, hydrated, user } = useAuth(); // 💡 Resgata o estado global de autenticação
  const [role, setRole] = useState<(typeof ROLES)[number]>(ROLES[0]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  // 💡 REDIRECIONAMENTO AUTOMÁTICO: Se já estiver logado, barra a tela de login e joga pro painel
  useEffect(() => {
    if (hydrated && isAuthenticated && user) {
      const dest =
        user.role === "teacher"
          ? "/teacher"
          : user.role === "admin"
            ? "/admin"
            : "/student";
      navigate({ to: dest });
    }
  }, [isAuthenticated, hydrated, user, navigate]);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    setPending(true);
    try {
      const { token, user } = await api.login(values.email, values.password);
      setAuth({ token, user });
      const dest =
        user.role === "teacher"
          ? "/teacher"
          : user.role === "admin"
            ? "/admin"
            : "/student";
      navigate({ to: dest });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Não foi possível entrar. Tente novamente.";
      setSubmitError(msg);
    } finally {
      setPending(false);
    }
  };

  // Se o app já carregou e o usuário está logado, evita dar um "flash" visual do formulário antes de redirecionar
  if (hydrated && isAuthenticated) {
    return null; 
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta, aventureiro"
      subtitle="Entre para continuar sua jornada de XP e missões."
      side={
        <p className="text-center text-sm text-muted-foreground">
          Novo por aqui?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Crie sua conta
          </Link>
        </p>
      }
    >
      <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const active = r.id === role.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r)}
              className={
                "inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition " +
                (active
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <Icon className="size-3.5" />
              {r.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="voce@escola.com" {...register("email")} />
          {formState.errors.email && (
            <p className="text-xs text-rose-300">{formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link to="/forgot-password" className="text-xs text-secondary hover:underline">
              Esqueci a senha
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
          {formState.errors.password && (
            <p className="text-xs text-rose-300">{formState.errors.password.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Entrando…
            </span>
          ) : (
            `Entrar como ${role.label}`
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
