import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.login(email, password, userType);
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: response.token,
          user: response.user,
        }),
      );
      navigate(userType === "student" ? "/student" : "/teacher");
    } catch (err) {
      setError("E-mail ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-12">
          <img
            src="/logo.png"
            alt="ClassRPG Logo"
            className="h-21 w-21 object-contain mix-blend-screen mx-auto mb-0"
          />
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
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full uppercase tracking-widest font-display text-xs"
              size="lg"
              disabled={loading}
            >
              {loading ? "Carregando..." : "Entrar na Aventura"}
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
