import React, { useState } from "react";
import { Swords, Backpack, LogOut, Heart, Trophy, Skull, Star, Coins, Flame } from "lucide-react";
import { api } from "../api";

interface Question {
  id: string;
  statement: string;
  options: string[];
  correct_index: number;
  correctIndex?: number;
  [key: string]: unknown;
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
type AnimationState = "IDLE" | "HIT_BOSS" | "HURT_PLAYER";

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
  const [animation, setAnimation] = useState<AnimationState>("IDLE");

  if (!questions || questions.length === 0) {
    return (
      <div className="text-white min-h-screen bg-stone-950 flex items-center justify-center font-mono tracking-wider">
        ⚔️ Adentrando o covil da criatura...
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const bossHpPercent = (bossHp / initialBossHp) * 100;
  const computedDamage = Math.ceil(initialBossHp / questions.length);

  const handleSelectOption = async (index: number) => {
    if (animation !== "IDLE") return;

    try {
      let token = "";

      // 🎯 1. Busca a chave real identificada no Local Storage
      const authData = localStorage.getItem("classrpg.auth");

      // 📦 2. Extrai o token de dentro do objeto JSON descriptografado
      if (authData) {
        try {
          const parsedAuth = JSON.parse(authData);
          token = parsedAuth?.token || "";
        } catch {
          // Ignora erro de parse interno se houver corrupção
        }
      }

      // 🛡️ Fallback preventivo caso o ambiente mude ou use chaves legadas
      if (!token) {
        token = localStorage.getItem("token") || "";
      }

      // 🔥 LOG DE SEGURANÇA ATUALIZADO
      console.log("🔑 [ARENA AUTH] Token localizado:", token ? "Sim ✅" : "Não ❌ (String Vazia)");

      if (!token) {
        alert(
          "🚨 Sessão expirada ou inválida! Por favor, refaça o login para computar suas respostas.",
        );
        return;
      }

      // Dispara a requisição para a API enviando o token correto
      const response = (await api.answerQuestion(currentQuestion.id, index, token)) as unknown;

      // Desembrulha respostas tanto diretas quanto envelopadas em .data (Axios fallback)
      const backendResult = (response as any)?.data || response;

      const { correct, damage_dealt, mission_completed } = backendResult;

      if (correct) {
        const danoAplicado = damage_dealt || computedDamage;
        const newBossHp = Math.max(0, bossHp - danoAplicado);

        setBossHp(newBossHp);
        setAnimation("HIT_BOSS");

        setTimeout(() => {
          setAnimation("IDLE");

          if (mission_completed || newBossHp === 0) {
            setResult("VICTORY");
            return;
          }

          if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          }
          setPhase("MENU");
        }, 600);
      } else {
        const newPlayerHp = Math.max(0, playerHp - 25);

        setPlayerHp(newPlayerHp);
        setAnimation("HURT_PLAYER");

        setTimeout(() => {
          setAnimation("IDLE");

          if (newPlayerHp === 0) {
            setResult("DEFEAT");
            return;
          }

          if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          }
          setPhase("MENU");
        }, 600);
      }
    } catch (error) {
      console.error("🚨 Erro detectado no fluxo da arena:", error);
      alert(
        "Não foi possível enviar sua resposta. Verifique a conexão com o servidor ou se sua sessão expirou.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col select-none relative antialiased font-sans">
      <style>{`
        @keyframes rpg-boss-hit {
          0% { transform: scale(1) translateX(0); filter: brightness(1) saturate(1); }
          15% { transform: scale(0.9) translateX(-25px) rotate(-5deg); filter: brightness(2) saturate(0.5) hue-rotate(-20deg); }
          30% { transform: scale(0.9) translateX(25px) rotate(5deg); filter: brightness(2) saturate(0.5) hue-rotate(-20deg); }
          45% { transform: translateX(-15px); }
          60% { transform: translateX(15px); }
          100% { transform: scale(1) translateX(0); filter: brightness(1) saturate(1); }
        }
        @keyframes ogre-lunge {
          0% { transform: translateY(0) scale(1); }
          20% { transform: translateY(-20px) scale(1.05); }
          50% { transform: translateY(70px) scale(1.4); filter: drop-shadow(0 40px 30px rgba(0,0,0,1)); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes rpg-screen-shake {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-8px, 6px); }
          30% { transform: translate(8px, -6px); }
          50% { transform: translate(-6px, -5px); }
          70% { transform: translate(6px, 5px); }
          90% { transform: translate(-3px, 2px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes dungeon-flicker {
          0%, 100% { transform: scale(1); opacity: 0.85; filter: drop-shadow(0 0 4px #f59e0b); }
          50% { transform: scale(1.15) rotate(3deg); opacity: 1; filter: drop-shadow(0 0 12px #ef4444); }
          75% { transform: scale(0.95) rotate(-2deg); opacity: 0.8; filter: drop-shadow(0 0 6px #d97706); }
        }
        @keyframes fog-drift {
          0% { transform: translateX(-15px); opacity: 0.2; }
          50% { transform: translateX(15px); opacity: 0.5; }
          100% { transform: translateX(-15px); opacity: 0.2; }
        }
        .animate-rpg-hit { animation: rpg-boss-hit 0.6s ease-in-out forwards; }
        .animate-ogre-lunge { animation: ogre-lunge 0.6s ease-in-out forwards; }
        .animate-rpg-shake { animation: rpg-screen-shake 0.5s ease-in-out forwards; }
        .animate-torch-fire { animation: dungeon-flicker 0.4s infinite alternate ease-in-out; }
        .animate-dungeon-fog { animation: fog-drift 5s infinite ease-in-out; }
      `}</style>

      {/* ── OVERLAY: Vitória ── */}
      {result === "VICTORY" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-md p-4">
          <div className="bg-stone-900 border-2 border-amber-500 rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl shadow-amber-500/10">
            <div className="size-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-bounce">
              <Trophy className="size-10 text-amber-400" />
            </div>
            <div className="text-center">
              <p className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-1">
                Missão Concluída
              </p>
              <h2 className="text-2xl font-bold text-white">{bossName} derrotado!</h2>
            </div>
            <div className="w-full bg-stone-950 border border-stone-800 rounded-2xl divide-y divide-stone-850">
              <div className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2 text-stone-300">
                  <Star className="size-4 text-amber-400 fill-amber-400" />
                  <span className="font-mono text-sm">Experiência</span>
                </div>
                <span className="font-mono font-bold text-amber-400">+{xpReward} XP</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2 text-stone-300">
                  <Coins className="size-4 text-yellow-400" />
                  <span className="font-mono text-sm">Ouro</span>
                </div>
                <span className="font-mono font-bold text-yellow-400">+{goldReward} 🪙</span>
              </div>
            </div>
            <button
              onClick={onVictory}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black font-mono uppercase tracking-wider rounded-xl transition-all shadow-lg text-sm"
            >
              Coletar Recompensas →
            </button>
          </div>
        </div>
      )}

      {/* ── OVERLAY: Derrota ── */}
      {result === "DEFEAT" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-md p-4">
          <div className="bg-stone-900 border-2 border-rose-500 rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl shadow-rose-500/10">
            <div className="size-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Skull className="size-10 text-rose-400" />
            </div>
            <div className="text-center">
              <p className="text-xs font-mono text-rose-500 uppercase tracking-widest mb-1">
                Derrota na Masmorra
              </p>
              <h2 className="text-2xl font-bold text-white">Seu HP chegou a zero</h2>
              <p className="text-stone-400 text-sm mt-1">
                Revise os tomos de estudo e tente novamente!
              </p>
            </div>
            <button
              onClick={onDefeat}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black font-mono uppercase tracking-wider rounded-xl transition-all text-sm"
            >
              Bater em Retirada →
            </button>
          </div>
        </div>
      )}

      {/* ── TOPO: HUD de HP do Chefe ── */}
      <header className="w-full px-4 pt-4 z-20">
        <div className="max-w-2xl mx-auto bg-stone-900 border-2 border-stone-800 rounded-2xl px-4 py-3 shadow-xl bg-gradient-to-b from-stone-900 to-stone-950">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono font-black text-red-500 text-xs md:text-sm uppercase tracking-widest flex items-center gap-1.5">
              💀 CHEFE: {bossName}
            </span>
            <span className="font-mono text-xs md:text-sm font-bold text-red-400">
              {bossHp} <span className="text-stone-600 font-normal">/ {initialBossHp} HP</span>
            </span>
          </div>
          <div className="w-full bg-stone-950 h-4 rounded-full overflow-hidden border border-stone-800 p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${bossHpPercent}%`,
                background:
                  bossHpPercent > 50
                    ? "linear-gradient(90deg, #dc2626, #ef4444)"
                    : bossHpPercent > 25
                      ? "linear-gradient(90deg, #ea580c, #f97316)"
                      : "linear-gradient(90deg, #991b1b, #b91c1c)",
              }}
            />
          </div>
        </div>
      </header>

      {/* ── MEIO: CENÁRIO DA MASMORRA ── */}
      <div
        className={`flex-1 max-w-2xl w-full mx-auto flex flex-col justify-end items-center relative overflow-hidden bg-stone-950 border-x-2 border-stone-800 min-h-[340px] shadow-[inset_0_0_100px_rgba(0,0,0,1)] transition-all duration-300
          ${animation === "HURT_PLAYER" ? "animate-rpg-shake shadow-[inset_0_0_90px_rgba(185,28,28,0.6)] border-red-950" : ""}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(87,74,64,0.3)_0%,_transparent_75%)] pointer-events-none z-0"></div>
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(0,0,0,0.6)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.6)_2px,transparent_2px)] bg-[size:32px_16px] pointer-events-none z-0"></div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-80 h-60 rounded-t-full border-4 border-stone-900 bg-gradient-to-b from-stone-950 to-stone-900/40 opacity-70 shadow-[0_15px_30px_rgba(0,0,0,0.9)] z-0 flex items-center justify-center">
          <div className="w-64 h-48 rounded-t-full bg-stone-950 border-4 border-stone-950 shadow-[inset_0_20px_40px_rgba(0,0,0,1)] opacity-95"></div>
        </div>
        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-stone-950 via-stone-900 to-stone-800/60 border-r border-stone-900 shadow-xl z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-stone-950 via-stone-900 to-stone-800/60 border-l border-stone-900 shadow-xl z-10 pointer-events-none"></div>

        <div className="absolute top-16 left-12 flex flex-col items-center z-10">
          <div className="relative">
            <div className="absolute -inset-2 bg-amber-500/20 rounded-full blur-md animate-torch-fire"></div>
            <Flame className="size-6 text-amber-500 fill-amber-500 animate-torch-fire filter drop-shadow-[0_0_6px_#f59e0b]" />
          </div>
          <div className="w-1.5 h-4 bg-stone-800 border border-stone-950 rounded-b shadow-md -mt-1"></div>
          <div className="w-3 h-1 bg-stone-700 border border-stone-950 rounded-xs"></div>
        </div>

        <div className="absolute top-16 right-12 flex flex-col items-center z-10">
          <div className="relative">
            <div className="absolute -inset-2 bg-amber-500/20 rounded-full blur-md animate-torch-fire"></div>
            <Flame className="size-6 text-amber-500 fill-amber-500 animate-torch-fire filter drop-shadow-[0_0_6px_#f59e0b]" />
          </div>
          <div className="w-1.5 h-4 bg-stone-800 border border-stone-950 rounded-b shadow-md -mt-1"></div>
          <div className="w-3 h-1 bg-stone-700 border border-stone-950 rounded-xs"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-stone-950 via-stone-900 to-stone-900/20 border-t-2 border-stone-900 z-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.8)_50%)] bg-[size:48px_100%] [transform:perspective(140px)_rotateX(55deg)]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-transparent to-stone-950"></div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 h-12 bg-gradient-to-t from-stone-900/0 via-stone-600/5 to-stone-900/0 mix-blend-screen pointer-events-none z-10 animate-dungeon-fog"></div>

        <div className="flex flex-col items-center z-20 relative pb-6">
          <div className="mb-6 px-3 py-1 rounded-md border border-stone-800 bg-stone-950/90 backdrop-blur-xs shadow-xl">
            <span className="text-xs font-black font-mono tracking-widest text-stone-400 italic">
              TURNO {currentQuestionIndex + 1}
            </span>
          </div>

          <div
            className={`flex flex-col items-center gap-2 relative select-none
            ${animation === "HIT_BOSS" ? "animate-rpg-hit" : ""}
            ${animation === "HURT_PLAYER" ? "animate-ogre-lunge" : "hover:scale-105 transition-transform"}`}
          >
            <span className="text-xs font-mono font-bold text-red-400 bg-stone-950/95 px-2 py-0.5 rounded border border-stone-800 shadow-md">
              Nível {questions.length}
            </span>

            <div className="text-8xl md:text-9xl filter drop-shadow-[0_25px_20px_rgba(0,0,0,1)] relative py-2 transition-all duration-300">
              🧌
              {animation === "HIT_BOSS" && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl font-black text-yellow-400 font-mono drop-shadow-[0_5px_8px_rgba(0,0,0,1)] animate-bounce">
                  -{computedDamage}⚔️
                </span>
              )}
            </div>
            <div className="h-3 w-24 bg-black/95 rounded-full blur-[3px] mt-1 shadow-2xl"></div>
          </div>
        </div>
      </div>

      {/* ── BAIXO: HUD do Aluno + Caixa de Comandos RPG ── */}
      <footer className="w-full mt-auto z-20">
        <div className="px-4 pb-3">
          <div className="max-w-2xl mx-auto bg-stone-900 border-2 border-stone-800 rounded-2xl px-4 py-2.5 shadow-lg bg-gradient-to-b from-stone-900 to-stone-950">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Heart className="size-4 fill-rose-500 text-rose-500 animate-pulse" />
                <span className="font-mono text-stone-300 text-xs md:text-sm font-bold uppercase tracking-wider">
                  Sua Energia (Herói)
                </span>
              </div>
              <span className="font-mono text-xs md:text-sm font-bold text-rose-400">
                {playerHp} <span className="text-stone-600 font-normal">/ 100 HP</span>
              </span>
            </div>
            <div className="w-full bg-stone-950 h-3.5 rounded-full overflow-hidden border border-stone-800 p-0.5">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${playerHp}%`,
                  background:
                    playerHp > 50
                      ? "linear-gradient(90deg, #e11d48, #f43f5e)"
                      : playerHp > 25
                        ? "linear-gradient(90deg, #ea580c, #f97316)"
                        : "linear-gradient(90deg, #991b1b, #b91c1c)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-stone-850 bg-stone-900 px-4 py-5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-2xl mx-auto min-h-[150px] flex flex-col justify-center">
            {phase === "MENU" && (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPhase("ATTACK")}
                  className="flex flex-col items-center justify-center py-4 bg-stone-950 border-2 border-stone-800 rounded-xl hover:border-amber-500 hover:bg-stone-900 group transition-all active:scale-95 shadow-md"
                >
                  <Swords className="size-6 text-amber-500 group-hover:scale-110 transition-transform mb-1.5" />
                  <span className="font-bold uppercase tracking-widest font-mono text-2xs md:text-xs text-stone-300 group-hover:text-amber-400">
                    Atacar
                  </span>
                </button>
                <button
                  onClick={() => setPhase("ITEMS")}
                  className="flex flex-col items-center justify-center py-4 bg-stone-950 border-2 border-stone-800 rounded-xl hover:border-cyan-500 hover:bg-stone-900 group transition-all active:scale-95 shadow-md"
                >
                  <Backpack className="size-6 text-cyan-500 group-hover:scale-110 transition-transform mb-1.5" />
                  <span className="font-bold uppercase tracking-widest font-mono text-2xs md:text-xs text-stone-300 group-hover:text-cyan-400">
                    Itens
                  </span>
                </button>
                <button
                  onClick={onFlee}
                  className="flex flex-col items-center justify-center py-4 bg-stone-950 border-2 border-stone-800 rounded-xl hover:border-rose-500 hover:bg-stone-900 group transition-all active:scale-95 shadow-md"
                >
                  <LogOut className="size-6 text-rose-500 group-hover:scale-110 transition-transform mb-1.5" />
                  <span className="font-bold uppercase tracking-widest font-mono text-2xs md:text-xs text-stone-300 group-hover:text-rose-400">
                    Fugir
                  </span>
                </button>
              </div>
            )}

            {phase === "ATTACK" && (
              <div className="space-y-4">
                <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-850 shadow-inner">
                  <span className="text-amber-500 font-mono text-2xs uppercase tracking-widest block mb-1 font-bold">
                    📜 Conjure sua Magia (Responda Corretamente):
                  </span>
                  <p className="text-stone-200 text-xs md:text-sm font-medium leading-relaxed">
                    {currentQuestion?.statement || "Carregando enigma..."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQuestion?.options.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={animation !== "IDLE"}
                      onClick={() => handleSelectOption(idx)}
                      className="p-3 bg-stone-950 border border-stone-850 rounded-xl text-left text-xs md:text-sm hover:border-amber-500 hover:bg-stone-900/60 transition-all flex items-center gap-2 active:scale-[0.99] group text-stone-300 hover:text-white disabled:opacity-50 shadow-sm"
                    >
                      <span className="w-5 h-5 shrink-0 bg-stone-900 border border-stone-800 rounded text-amber-500 font-mono text-2xs font-bold flex items-center justify-center group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{option}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPhase("MENU")}
                  disabled={animation !== "IDLE"}
                  className="inline-block text-2xs font-mono uppercase tracking-wider text-stone-500 hover:text-stone-300 underline underline-offset-4 transition disabled:opacity-30"
                >
                  ← Mudar Estratégia (Voltar)
                </button>
              </div>
            )}

            {phase === "ITEMS" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-stone-800 pb-1.5">
                  <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                    💼 Alforge de Itens
                  </span>
                  <button
                    onClick={() => setPhase("MENU")}
                    className="text-2xs font-mono uppercase tracking-wider text-stone-500 hover:text-stone-300 underline transition"
                  >
                    ← Voltar
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button className="p-3 bg-stone-950 border border-stone-850 rounded-xl flex items-center justify-between text-xs md:text-sm opacity-30 cursor-not-allowed text-stone-400">
                    <span className="flex items-center gap-1.5">🧪 Elixir de Dica</span>
                    <span className="text-3xs font-mono bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800 text-stone-500">
                      x0
                    </span>
                  </button>
                  <button className="p-3 bg-stone-950 border border-stone-850 rounded-xl flex items-center justify-between text-xs md:text-sm opacity-30 cursor-not-allowed text-stone-400">
                    <span className="flex items-center gap-1.5">❤️ Poção de Vida</span>
                    <span className="text-3xs font-mono bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800 text-stone-500">
                      x0
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
