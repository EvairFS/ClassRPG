import { Student } from "@/types";
import { getLevelInfo } from "@/lib/gamification";

interface RankingTableProps {
  students: Student[];
  currentUserId?: string;
  compact?: boolean;
}

const RankingTable = ({ students, currentUserId, compact = false }: RankingTableProps) => {
  const sorted = [...students].sort((a, b) => b.xp - a.xp);
  const displayed = compact ? sorted.slice(0, 5) : sorted;

  return (
    <div className="w-full">
      {!compact && (
        <div className="flex justify-center gap-4 mb-8 items-end">
          {sorted.length >= 2 && <PodiumSlot student={sorted[1]} position={2} height="h-24" />}
          {sorted.length >= 1 && <PodiumSlot student={sorted[0]} position={1} height="h-32" />}
          {sorted.length >= 3 && <PodiumSlot student={sorted[2]} position={3} height="h-20" />}
        </div>
      )}
      <div className="border border-border">
        <div className="grid grid-cols-[3rem_1fr_6rem_6rem] md:grid-cols-[4rem_1fr_8rem_8rem] bg-secondary px-4 py-3 text-xs font-display tracking-wider text-muted-foreground uppercase">
          <span>#</span>
          <span>Aventureiro</span>
          <span className="text-right">Nível</span>
          <span className="text-right">XP</span>
        </div>
        {displayed.map((student, i) => {
          const info = getLevelInfo(student.xp);
          const isCurrentUser = student.id === currentUserId;
          const isTop3 = i < 3;
          return (
            <div
              key={student.id}
              className={`grid grid-cols-[3rem_1fr_6rem_6rem] md:grid-cols-[4rem_1fr_8rem_8rem] px-4 py-3 border-t border-border items-center transition-colors ${
                isCurrentUser ? "bg-primary/10 border-l-2 border-l-primary" : ""
              }`}
            >
              <span
                className={`font-display text-sm ${isTop3 ? "text-accent" : "text-muted-foreground"}`}
              >
                {i + 1}
              </span>
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center text-xs font-body font-semibold border ${
                    isTop3 ? "border-accent text-accent" : "border-border text-foreground"
                  }`}
                >
                  {student.avatar}
                </div>
                <span
                  className={`font-body text-sm ${isTop3 && !compact ? "text-accent" : "text-foreground"}`}
                >
                  {student.name}
                </span>
              </div>
              <span className="text-right text-xs text-muted-foreground font-body">
                {info.name}
              </span>
              <span
                className={`text-right font-display text-sm ${isTop3 ? "text-accent" : "text-foreground"}`}
              >
                {student.xp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function PodiumSlot({
  student,
  position,
  height,
}: {
  student: Student;
  position: number;
  height: string;
}) {
  const colors = {
    1: "border-accent text-accent",
    2: "border-muted-foreground text-muted-foreground",
    3: "border-muted-foreground text-muted-foreground",
  };
  const posColors = colors[position as 1 | 2 | 3];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-12 h-12 flex items-center justify-center border-2 font-body font-semibold text-sm ${posColors}`}
      >
        {student.avatar}
      </div>
      <span className={`font-body text-xs ${position === 1 ? "text-accent" : "text-foreground"}`}>
        {student.name}
      </span>
      <div
        className={`w-20 ${height} border-t-2 ${posColors} bg-secondary flex items-center justify-center`}
      >
        <span className={`font-display text-2xl ${posColors}`}>{position}º</span>
      </div>
    </div>
  );
}

export default RankingTable;
