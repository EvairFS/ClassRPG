import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import RankingTable from "@/components/RankingTable";
import { api } from "@/api";

const RankingPage = () => {
  const { data: ranking = [] } = useQuery(
    ["ranking"],
    api.getRanking,
    {
      retry: false,
      staleTime: 1000 * 60,
    }
  );

  const { data: currentStudent } = useQuery(
    ["currentStudent"],
    api.getCurrentStudent,
    {
      retry: false,
      staleTime: 1000 * 60,
    }
  );

  const students = ranking.map((item: any) => item.student) || [];
  const currentUserId = currentStudent?.id || "";

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
          <RankingTable students={students} currentUserId={currentUserId} />
        </section>
      </main>
    </div>
  );
};

export default RankingPage;
