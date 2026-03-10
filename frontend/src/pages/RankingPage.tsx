import Navbar from "@/components/Navbar";
import RankingTable from "@/components/RankingTable";
import { MOCK_STUDENTS, CURRENT_STUDENT } from "@/data/mockData";

const RankingPage = () => {
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
          <RankingTable students={MOCK_STUDENTS} currentUserId={CURRENT_STUDENT.id} />
        </section>
      </main>
    </div>
  );
};

export default RankingPage;
