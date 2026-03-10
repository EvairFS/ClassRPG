import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"student" | "teacher">("student");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(userType === "student" ? "/student" : "/teacher");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-accent tracking-widest mb-3">
            ClassRPG
          </h1>
          <p className="text-muted-foreground font-body text-sm tracking-wide">
            Sua jornada pelo conhecimento começa aqui
          </p>
        </div>

        <div className="border border-border bg-card p-8">
          <div className="flex mb-8 border border-border">
            <button
              onClick={() => setUserType("student")}
              className={`flex-1 py-3 text-xs font-display tracking-widest uppercase transition-colors ${
                userType === "student"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Estudante
            </button>
            <button
              onClick={() => setUserType("teacher")}
              className={`flex-1 py-3 text-xs font-display tracking-widest uppercase transition-colors ${
                userType === "teacher"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Professor
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs text-muted-foreground font-body tracking-wide block mb-2">
                E-mail
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aventureiro@classrpg.com"
                className="bg-secondary border-border text-foreground font-body"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body tracking-wide block mb-2">
                Senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-secondary border-border text-foreground font-body"
              />
            </div>
            <Button type="submit" className="w-full uppercase tracking-widest font-display text-xs" size="lg">
              Entrar na Aventura
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground font-body mt-6 tracking-wide">
          "O conhecimento é a arma mais poderosa."
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
