import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RankingTable from "@/components/RankingTable";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/api";

const RankingPage = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useCurrentUser();

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const { data: ranking, isLoading } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => api.getRanking(token!),
    enabled: !!token,
  });

  const students = ranking?.students || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userType="student" />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType="student" />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <section className="animate-fade-up">
          <h1 className="font-display text-2xl text-foreground tracking-widest uppercase mb-2 text-center">
            Ranking dos Aventureiros
          </h1>
          <p className="text-center text-sm text-muted-foreground font-body mb-10">
            Os maiores guerreiros do conhecimento
          </p>
          <RankingTable students={students} currentUserId={user!.id} />
        </section>
      </main>
    </div>
  );
};

export default RankingPage;
