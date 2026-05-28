import { useState } from "react";
import Navbar from "@/components/Navbar";
import ActivityCard from "@/components/ActivityCard";
import RankingTable from "@/components/RankingTable";
import { MOCK_ACTIVITIES, MOCK_STUDENTS } from "@/data/mockData";
import { getLevelInfo } from "@/lib/gamification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Users, BookOpen, TrendingUp } from "lucide-react";

const TeacherDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const avgXp = Math.round(MOCK_STUDENTS.reduce((sum, s) => sum + s.xp, 0) / MOCK_STUDENTS.length);

  const stats = [
    { label: "Total de Alunos", value: MOCK_STUDENTS.length, icon: Users },
    { label: "Atividades Criadas", value: MOCK_ACTIVITIES.length, icon: BookOpen },
    { label: "XP Médio da Turma", value: avgXp, icon: TrendingUp },
  ];

  const student = selectedStudent ? MOCK_STUDENTS.find((s) => s.id === selectedStudent) : null;

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
                <span className="text-xs text-muted-foreground font-body tracking-wide uppercase">{stat.label}</span>
              </div>
              <p className="font-display text-3xl text-accent">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Actions */}
        <section className="mb-12 animate-fade-up stagger-1" style={{ animationFillMode: "both" }}>
          <div className="flex justify-between items-center mb-6 border-b border-border pb-3">
            <h2 className="font-display text-xl text-foreground tracking-widest uppercase">Atividades</h2>
            <Button onClick={() => setShowModal(true)} className="uppercase tracking-widest font-display text-xs">
              Nova Atividade
            </Button>
          </div>
          <div className="space-y-3">
            {MOCK_ACTIVITIES.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>

        {/* Ranking */}
        <section className="mb-12 animate-fade-up stagger-2" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-xl text-foreground tracking-widest uppercase mb-6 border-b border-border pb-3">
            Ranking da Turma
          </h2>
          <RankingTable students={MOCK_STUDENTS} />
        </section>

        {/* Student Progress */}
        <section className="animate-fade-up stagger-3" style={{ animationFillMode: "both" }}>
          <h2 className="font-display text-xl text-foreground tracking-widest uppercase mb-6 border-b border-border pb-3">
            Progresso Individual
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
            {MOCK_STUDENTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s.id)}
                className={`border p-3 text-center transition-colors ${
                  selectedStudent === s.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="w-8 h-8 mx-auto border border-border flex items-center justify-center text-xs font-body mb-1 text-foreground">
                  {s.avatar}
                </div>
                <span className="text-xs font-body text-foreground block truncate">{s.name}</span>
              </button>
            ))}
          </div>
          {student && (
            <div className="border border-border bg-card p-6 animate-fade-up">
              <h3 className="font-display text-lg text-foreground tracking-wider uppercase mb-2">{student.name}</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-accent font-display text-2xl">{student.xp}</p>
                  <p className="text-xs text-muted-foreground font-body">XP Total</p>
                </div>
                <div>
                  <p className="text-foreground font-display text-2xl">{getLevelInfo(student.xp).level}</p>
                  <p className="text-xs text-muted-foreground font-body">Nível</p>
                </div>
                <div>
                  <p className="text-foreground font-display text-2xl">{student.badges.filter(b => b.earned).length}</p>
                  <p className="text-xs text-muted-foreground font-body">Conquistas</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Create Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90">
          <div className="border border-border bg-card p-8 w-full max-w-md mx-4 animate-fade-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg tracking-widest uppercase text-foreground">Nova Atividade</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
              <div>
                <label className="text-xs text-muted-foreground font-body block mb-2">Título</label>
                <Input className="bg-secondary border-border text-foreground font-body" placeholder="Nome da atividade" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-body block mb-2">Descrição</label>
                <textarea
                  className="w-full bg-secondary border border-border text-foreground font-body p-3 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Descreva a atividade..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-body block mb-2">Recompensa XP</label>
                  <Input type="number" className="bg-secondary border-border text-foreground font-body" placeholder="50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-body block mb-2">Prazo</label>
                  <Input type="date" className="bg-secondary border-border text-foreground font-body" />
                </div>
              </div>
              <Button type="submit" className="w-full uppercase tracking-widest font-display text-xs" size="lg">
                Criar Atividade
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;