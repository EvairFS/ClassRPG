import React, { useState } from "react";
import { Swords, Backpack, LogOut, Heart, Trophy, Skull, Star, Coins } from "lucide-react";

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

interface CombatArenaProps {
  bossName: string;
  initialBossHp: number;
  questions: Question[];
  xpReward: number;
  goldReward: number;
  onVictory: () => void;
  onDefeat: () => void;
  onFlee: () => void;
}

type CombatPhase = "MENU" | "ATTACK" | "ITEMS";
type CombatResult = null | "VICTORY" | "DEFEAT";

export function CombatArena({
  bossName,
  initialBossHp,
  questions = [],
  xpReward,
  goldReward,
  onVictory,
  onDefeat,
  onFlee,
}: CombatArenaProps) {
  const [phase, setPhase] = useState<CombatPhase>("MENU");
  const [bossHp, setBossHp] = useState(initialBossHp);
  const [playerHp, setPlayerHp] = useState(100);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState<CombatResult>(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-white min-h-screen bg-slate-950 flex items-center justify-center">
        Carregando perguntas...
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const bossHpPercent = (bossHp / initialBossHp) * 100;

  const handleSelectOption = (index: number) => {
    if (index === currentQuestion.correctIndex) {
      const damage = Math.ceil(initialBossHp / questions.length);
      const newBossHp = Math.max(0, bossHp - damage);
      setBossHp(newBossHp);
      if (newBossHp === 0) {
        setResult("VICTORY");
        return;
      }
    } else {
      const newPlayerHp = Math.max(0, playerHp - 25);
      setPlayerHp(newPlayerHp);
      if (newPlayerHp === 0) {
        setResult("DEFEAT");
        return;
      }
    }
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    setPhase("MENU");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col select-none relative">
      {/* ── OVERLAY: Vitória ── */}
      {result === "VICTORY" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-5 shadow-2xl shadow-amber-500/10">
            <div className="size-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="size-10 text-amber-400" />
            </div>
            <div className="text-center">
              <p className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-1">
                Missão Concluída
              </p>
              <h2 className="text-2xl font-bold text-white">{bossName} derrotado!</h2>
            </div>
            <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl divide-y divide-slate-800">
              <div className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Star className="size-4 text-amber-400 fill-amber-400" />
                  <span className="font-mono text-sm">Experiência</span>
                </div>
                <span className="font-mono font-bold text-amber-400">+{xpReward} XP</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Coins className="size-4 text-yellow-400" />
                  <span className="font-mono text-sm">Ouro</span>
                </div>
                <span className="font-mono font-bold text-yellow-400">+{goldReward} 🪙</span>
              </div>
            </div>
            <button
              onClick={onVictory}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono uppercase tracking-wider rounded-xl transition text-sm"
            >
              Voltar ao Painel →
            </button>
          </div>
        </div>
      )}

      {/* ── OVERLAY: Derrota ── */}
      {result === "DEFEAT" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-5 shadow-2xl shadow-rose-500/10">
            <div className="size-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Skull className="size-10 text-rose-400" />
            </div>
            <div className="text-center">
              <p className="text-xs font-mono text-rose-500 uppercase tracking-widest mb-1">
                Derrota
              </p>
              <h2 className="text-2xl font-bold text-white">Seu HP chegou a zero</h2>
              <p className="text-slate-400 text-sm mt-1">Estude os conceitos e tente novamente!</p>
            </div>
            <button
              onClick={onDefeat}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono uppercase tracking-wider rounded-xl transition text-sm"
            >
              Voltar ao Painel →
            </button>
          </div>
        </div>
      )}

      {/* ── TOPO: Boss HP ── */}
      <div className="w-full px-4 pt-4">
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono font-bold text-amber-400 text-sm uppercase tracking-wide">
              👾 {bossName}
            </span>
            <span className="font-mono text-sm font-bold text-amber-500">
              {bossHp}
              <span className="text-slate-500 font-normal"> / {initialBossHp}</span>
            </span>
          </div>
          <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${bossHpPercent}%`,
                background:
                  bossHpPercent > 50
                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                    : bossHpPercent > 25
                      ? "linear-gradient(90deg, #f97316, #fb923c)"
                      : "linear-gradient(90deg, #ef4444, #f87171)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── MEIO: Sprite ── */}
      <div className="flex-1 flex items-center justify-center">
        <span className="text-8xl opacity-20 select-none">👾</span>
      </div>

      {/* ── BAIXO: Player HP + Ações ── */}
      <div className="w-full">
        <div className="px-4 pb-3">
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="size-4 fill-rose-500 text-rose-500" />
                <span className="font-mono text-slate-300 text-sm font-bold uppercase tracking-wide">
                  Herói (Você)
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-rose-400">
                {playerHp}
                <span className="text-slate-500 font-normal"> / 100</span>
              </span>
            </div>
            <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${playerHp}%`,
                  background:
                    playerHp > 50
                      ? "linear-gradient(90deg, #f43f5e, #fb7185)"
                      : playerHp > 25
                        ? "linear-gradient(90deg, #f97316, #fb923c)"
                        : "linear-gradient(90deg, #dc2626, #ef4444)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 bg-slate-900 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            {phase === "MENU" && (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPhase("ATTACK")}
                  className="flex flex-col items-center justify-center py-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-amber-500 hover:bg-slate-900 group transition"
                >
                  <Swords className="size-7 text-amber-500 group-hover:scale-110 transition mb-1" />
                  <span className="font-bold uppercase tracking-wider font-mono text-xs">
                    Atacar
                  </span>
                </button>
                <button
                  onClick={() => setPhase("ITEMS")}
                  className="flex flex-col items-center justify-center py-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-cyan-500 hover:bg-slate-900 group transition"
                >
                  <Backpack className="size-7 text-cyan-500 group-hover:scale-110 transition mb-1" />
                  <span className="font-bold uppercase tracking-wider font-mono text-xs">
                    Itens
                  </span>
                </button>
                <button
                  onClick={onFlee}
                  className="flex flex-col items-center justify-center py-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-rose-500 hover:bg-slate-900 group transition"
                >
                  <LogOut className="size-7 text-rose-500 group-hover:scale-110 transition mb-1" />
                  <span className="font-bold uppercase tracking-wider font-mono text-xs">
                    Fugir
                  </span>
                </button>
              </div>
            )}

            {phase === "ATTACK" && (
              <div className="space-y-3">
                <div>
                  <span className="text-amber-500 font-mono text-xs uppercase tracking-widest block mb-1">
                    Prepare seu golpe:
                  </span>
                  <p className="text-slate-200 text-sm font-medium leading-snug">
                    {currentQuestion?.text || "Carregando pergunta..."}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentQuestion?.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left text-sm hover:border-amber-500 hover:bg-slate-900 transition"
                    >
                      <span className="text-amber-500 font-mono mr-2 text-xs">
                        {String.fromCharCode(65 + idx)})
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPhase("MENU")}
                  className="text-xs text-slate-500 hover:text-slate-300 underline transition"
                >
                  ← Voltar
                </button>
              </div>
            )}

            {phase === "ITEMS" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest">
                    Mochila
                  </span>
                  <button
                    onClick={() => setPhase("MENU")}
                    className="text-xs text-slate-500 hover:text-slate-300 underline transition"
                  >
                    ← Voltar
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-sm opacity-40 cursor-not-allowed">
                    <span>🧪 Elixir de Dica</span>
                    <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-500">
                      x0
                    </span>
                  </button>
                  <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-sm opacity-40 cursor-not-allowed">
                    <span>❤️ Poção de HP</span>
                    <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-500">
                      x0
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
