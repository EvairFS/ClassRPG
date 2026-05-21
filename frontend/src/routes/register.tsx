import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register")({ component: RegisterPage });

const schema = z.object({
  name: z.string().min(3, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
type V = z.infer<typeof schema>;

function RegisterPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<V>({ resolver: zodResolver(schema) });
  return (
    <AuthLayout
      title="Crie sua conta de aventureiro"
      subtitle="Comece a ganhar XP e desbloquear conquistas hoje mesmo."
      side={<p className="text-center text-sm text-muted-foreground">Já tem conta? <Link to="/" className="font-semibold text-primary hover:underline">Entrar</Link></p>}
    >
      <form onSubmit={handleSubmit(() => navigate({ to: "/student" }))} className="space-y-4">
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
        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90">
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  );
}