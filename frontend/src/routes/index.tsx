import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Shield, User } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: LoginPage });

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
type FormValues = z.infer<typeof schema>;

const ROLES = [
  { id: "student", label: "Aluno", icon: User, to: "/student" },
  { id: "teacher", label: "Professor", icon: GraduationCap, to: "/teacher" },
  { id: "admin", label: "Admin", icon: Shield, to: "/admin" },
] as const;

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<(typeof ROLES)[number]>(ROLES[0]);
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "carla@classrpg.io", password: "123456" },
  });

  const onSubmit = () => navigate({ to: role.to });

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
          className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
        >
          Entrar como {role.label}
        </Button>
      </form>
    </AuthLayout>
  );
}
