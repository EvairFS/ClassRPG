import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LevelUpModalProps {
  isOpen: boolean;
  oldLevel: string;
  newLevel: string;
  onClose: () => void;
}

const LevelUpModal = ({ isOpen, oldLevel, newLevel, onClose }: LevelUpModalProps) => {
  const [phase, setPhase] = useState<"beam" | "crack" | "etch" | "done">("beam");

  useEffect(() => {
    if (!isOpen) {
      setPhase("beam");
      return;
    }
    setPhase("beam");
    const t1 = setTimeout(() => setPhase("crack"), 800);
    const t2 = setTimeout(() => setPhase("etch"), 1300);
    const t3 = setTimeout(() => setPhase("done"), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-0.5 h-full bg-primary animate-beam origin-top" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 p-12 max-w-md text-center">
        <p className="text-xs text-muted-foreground font-body tracking-widest uppercase">Evolução de Nível</p>

        {(phase === "crack" || phase === "beam") && (
          <h2 className={`font-display text-3xl text-foreground tracking-widest uppercase ${phase === "crack" ? "animate-crack" : ""}`}>
            {oldLevel}
          </h2>
        )}

        {(phase === "etch" || phase === "done") && (
          <h2 className="font-display text-4xl text-accent tracking-widest uppercase animate-etch">
            {newLevel}
          </h2>
        )}

        {phase === "done" && (
          <Button variant="default" size="lg" onClick={onClose} className="mt-4 uppercase tracking-widest font-display text-sm">
            Prosseguir
          </Button>
        )}
      </div>
    </div>
  );
};

export default LevelUpModal;
