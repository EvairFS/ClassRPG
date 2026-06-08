import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ActivityCard from "@/components/ActivityCard";
import RankingTable from "@/components/RankingTable";
import { getLevelInfo } from "@/lib/gamification";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Users, BookOpen, TrendingUp } from "lucide-react";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated } = useCurrentUser();

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Estado para o formulário
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    xp_reward: 0,
    deadline: "",
  });

  if (!isAuthenticated || user?.role !== "teacher") {
    navigate("/");
    return null;
  }

  // Fetch dashboard data
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard", "teacher", user?.id],
    queryFn: () => api.getTeacherDashboard(user!.id, token!),
    enabled: !!token && !!user?.id,
  });

  // Função para criar atividade
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createActivity(formData, token!);
      // Atualiza a tela automaticamente após criar
      queryClient.invalidateQueries({ queryKey: ["dashboard", "teacher", user?.id] });
      setShowModal(false);
      setFormData({ title: "", description: "", xp_reward: 0, deadline: "" });
      alert("Atividade criada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar atividade.");
    }
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userType="teacher" />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  const students = dashboard?.students || [];
  const activities = dashboard?.activities || [];

  const avgXp =
    students.length > 0
      ? Math.round(students.reduce((sum: number, s: any) => sum + s.xp, 0) / students.length)
      : 0;

  const stats = [
    { label: "Total de Alunos", value: students.length, icon: Users },
    { label: "Atividades Criadas", value: activities.length, icon: BookOpen },
    { label: "XP Médio da Turma", value: avgXp, icon: TrendingUp },
  ];

  const selectedStudentData = selectedStudent
    ? students.find((s: any) => s.id === selectedStudent)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType="teacher" />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 animate-fade-up">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <stat.icon size={20} strokeWidth={1.5} className="text-primary" />
                <span className="text-xs text-muted-foreground font-body tracking-wide uppercase">
                  {stat.label}
                </span>
              </div>
              <p className="font-display text-3xl text-accent">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Actions */}
        <section className="mb-12 animate-fade-up stagger-1" style={{ animationFillMode: "both" }}>
          <div className="flex justify-between items-center mb-6 border-b border-border pb-3">
            <h2 className="font-display text-xl text-foreground tracking-widest uppercase">
              Atividades
            </h2>
            <Button
              onClick={() => setShowModal(true)}
              className="uppercase tracking-widest font-display text-xs"
            >
              Nova Atividade
            </Button>
          </div>
          <div className="space-y-3">
            {activities.map((activity: any) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>

        {/* Ranking */}
        <section className="mb-12 animate-fade-up stagger-2" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-xl text-foreground tracking-widest uppercase mb-6 border-b border-border pb-3">
            Ranking da Turma
          </h2>
          <RankingTable students={students} />
        </section>

        {/* ... (O restante da seção de estudantes permanece igual) ... */}

        {/* Create Activity Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90">
            <div className="border border-border bg-card p-8 w-full max-w-md mx-4 animate-fade-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg tracking-widest uppercase text-foreground">
                  Nova Atividade
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleCreateActivity}>
                <div>
                  <label className="text-xs text-muted-foreground font-body block mb-2">
                    Título
                  </label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-secondary border-border text-foreground font-body"
                    placeholder="Nome da atividade"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-body block mb-2">
                    Descrição
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-secondary border border-border text-foreground font-body p-3 text-sm min-h-[80px]"
                    placeholder="Descreva a atividade..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-body block mb-2">XP</label>
                    <Input
                      required
                      type="number"
                      value={formData.xp_reward}
                      onChange={(e) =>
                        setFormData({ ...formData, xp_reward: Number(e.target.value) })
                      }
                      className="bg-secondary border-border text-foreground font-body"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-body block mb-2">
                      Prazo
                    </label>
                    <Input
                      required
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="bg-secondary border-border text-foreground font-body"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full uppercase">
                  Criar Atividade
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
