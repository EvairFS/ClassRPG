import React, { useState } from "react";
import { Swords, Backpack, LogOut, ShieldAlert, Heart, Zap } from "lucide-react";

// Tipagem básica para testes
interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

interface CombatArenaProps {
  bossName: string;
  initialBossHp: number;
  questions: Question[];
  onVictory: () => void;
  onDefeat: () => void;
  onFlee: () => void;
}

type CombatPhase = "MENU" | "ATTACK" | "ITEMS";

export function CombatArena({
  bossName,
  initialBossHp,
  questions,
  onVictory,
  onDefeat,
  onFlee,
}: CombatArenaProps) {
  // Estados do Combate
  const [phase, setPhase] = useState<CombatPhase>("MENU");
  const [bossHp, setBossHp] = useState(initialBossHp);
  const [playerHp, setPlayerHp] = useState(100); // Vida do aluno
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  // 1. Ação: ATACAR (Validar Resposta)
  const handleSelectOption = (index: number) => {
    if (index === currentQuestion.correctIndex) {
      // Acertou! Causa dano no Boss
      const damage = Math.ceil(initialBossHp / questions.length);
      const newBossHp = Math.max(0, bossHp - damage);
      setBossHp(newBossHp);

      if (newBossHp === 0) return onVictory();
    } else {
      // Errou! O Boss contra-ataca o Player
      const newPlayerHp = Math.max(0, playerHp - 25);
      setPlayerHp(newPlayerHp);

      if (newPlayerHp === 0) return onDefeat();
    }

    // Avança para a próxima pergunta se houver, ou volta pro menu
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    setPhase("MENU");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 select-none">
      {/* 🏟️ ARENA DE BATALHA (HUD dos Status) */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Status do Aluno / Jogador */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-slate-300 font-mono">HERÓI (VOCÊ)</span>
            <span className="flex items-center gap-1 text-rose-500 font-bold font-mono">
              <Heart className="size-4 fill-rose-500" /> {playerHp}/100
            </span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${playerHp}%` }}
            />
          </div>
        </div>

        {/* Status do Boss / Missão */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-amber-400 font-mono">👾 {bossName}</span>
            <span className="flex items-center gap-1 text-amber-500 font-bold font-mono">
              <Zap className="size-4 fill-amber-500" /> {bossHp}/{initialBossHp}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${(bossHp / initialBossHp) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 🎮 CAIXA DE AÇÕES / MENU DE TURNOS */}
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 min-h-[200px] flex flex-col justify-center">
        {/* FASE 1: MENU PRINCIPAL DE ESCOLHAS */}
        {phase === "MENU" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <button
              onClick={() => setPhase("ATTACK")}
              className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-xl hover:border-amber-500 hover:bg-slate-900 group transition"
            >
              <Swords className="size-8 text-amber-500 group-hover:scale-110 transition mb-2" />
              <span className="font-bold uppercase tracking-wider font-mono text-sm">Atacar</span>
            </button>

            <button
              onClick={() => setPhase("ITEMS")}
              className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-xl hover:border-cyan-500 hover:bg-slate-900 group transition"
            >
              <Backpack className="size-8 text-cyan-500 group-hover:scale-110 transition mb-2" />
              <span className="font-bold uppercase tracking-wider font-mono text-sm">Itens</span>
            </button>

            <button
              onClick={onFlee}
              className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-xl hover:border-rose-500 hover:bg-slate-900 group transition"
            >
              <LogOut className="size-8 text-rose-500 group-hover:scale-110 transition mb-2" />
              <span className="font-bold uppercase tracking-wider font-mono text-sm">Fugir</span>
            </button>
          </div>
        )}

        {/* FASE 2: OPÇÃO ATACAR (RELAÇÃO COM O QUIZ) */}
        {phase === "ATTACK" && (
          <div className="space-y-4 w-full">
            <div className="text-slate-300 font-medium mb-2 text-lg">
              <span className="text-amber-500 font-mono text-sm block mb-1">
                PREPARE SEU GOLPE:
              </span>
              {currentQuestion?.text || "Carregando pergunta..."}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion?.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left text-sm hover:border-amber-500 hover:bg-slate-950/40 transition font-sans"
                >
                  <span className="text-amber-500 font-mono mr-2">
                    {String.fromCharCode(65 + idx)})
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FASE 3: OPÇÃO ITENS (MOCHILA INVENTÁRIO) */}
        {phase === "ITEMS" && (
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-cyan-400 font-mono font-bold text-sm">
                SUA MOCHILA DE CONSUMÍVEIS
              </span>
              <button
                onClick={() => setPhase("MENU")}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Voltar
              </button>
            </div>
            {/* Mock de itens para visualização */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-sm opacity-50 cursor-not-allowed">
                <span>🧪 Elixir de Dica (Elimina 1 alternativa errada)</span>
                <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-500">x0</span>
              </button>
              <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-sm opacity-50 cursor-not-allowed">
                <span>❤️ Poção de HP (Recupera 25 de Vida)</span>
                <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-500">x0</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
