import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/combat/$missionId")({
  component: CombatScreen,
});

function CombatScreen() {
  // 🌟 Captura o ID da missão vindo da URL de forma 100% tipada pelo TanStack
  const { missionId } = Route.useParams();

  // Estados simulados para o combate rodar lindamente na UI
  const [bossHp, setBossHp] = useState(450);
  const maxBossHp = 500;
  const [playerHp, setPlayerHp] = useState(100);
  const [combatLog, setCombatLog] = useState<string[]>([
    "Você adentrou a masmorra. O Boss está aguardando seu movimento!",
  ]);

  const handleAttack = () => {
    if (bossHp <= 0 || playerHp <= 0) return;

    // Turno do Aluno (Ataque Crítico)
    const playerDamage = Math.floor(Math.random() * 40) + 20;
    const newBossHp = Math.max(0, bossHp - playerDamage);
    setBossHp(newBossHp);

    const logs = [`⚔️ Você desferiu um ataque de Refatoração e causou ${playerDamage} de dano!`];

    if (newBossHp <= 0) {
      logs.push("🎉 VITÓRIA! Você derrotou o Boss e conquistou a masmorra!");
      setCombatLog((prev) => [...logs, ...prev]);
      return;
    }

    // Turno do Boss (Contra-ataque do Bug)
    const bossDamage = Math.floor(Math.random() * 15) + 10;
    const newPlayerHp = Math.max(0, playerHp - bossDamage);
    setPlayerHp(newPlayerHp);

    logs.push(`👹 O Boss contra-atacou com um Bug de Compilação e causou ${bossDamage} de dano.`);

    if (newPlayerHp <= 0) {
      logs.push("💀 Você foi derrotado! Revise seu código e tente novamente.");
    }

    setCombatLog((prev) => [...logs, ...prev]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-slate-950 text-white min-h-screen rounded-xl border border-slate-800">
      <header className="text-center border-b border-slate-800 pb-4">
        <span className="text-xs bg-rose-900/50 text-rose-400 border border-rose-700/50 px-2.5 py-1 rounded-full font-mono">
          MISSÃO ID: {missionId}
        </span>
        <h1 className="text-3xl font-extrabold text-amber-400 mt-2">Arena de Combate</h1>
      </header>

      {/* ÁREA DOS COMBATENTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-900 p-6 rounded-lg border border-slate-800">
        {/* PLAYER */}
        <div className="space-y-2 text-center md:text-left">
          <div className="text-lg font-bold text-sky-400">🛡️ Seu Herói</div>
          <div className="w-full bg-slate-950 rounded-full h-5 border border-slate-700 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-400 h-full transition-all duration-300"
              style={{ width: `${playerHp}%` }}
            />
          </div>
          <div className="text-sm font-mono text-slate-400">{playerHp} / 100 HP</div>
        </div>

        {/* BOSS */}
        <div className="space-y-2 text-center md:text-right">
          <div className="text-lg font-bold text-rose-500">👹 Chefe da Masmorra</div>
          <div className="w-full bg-slate-950 rounded-full h-5 border border-slate-700 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-600 to-red-500 h-full transition-all duration-300"
              style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
            />
          </div>
          <div className="text-sm font-mono text-slate-400">
            {bossHp} / {maxBossHp} HP
          </div>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="flex justify-center py-4">
        <button
          onClick={handleAttack}
          disabled={bossHp <= 0 || playerHp <= 0}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 font-bold text-lg rounded-lg shadow-lg hover:shadow-red-900/30 transition transform hover:-translate-y-0.5 disabled:opacity-40 disabled:transform-none"
        >
          {bossHp <= 0 ? "🏆 Vitória!" : playerHp <= 0 ? "💀 Derrotado" : "⚔️ Desferir Ataque"}
        </button>
      </div>

      {/* HISTÓRICO DE COMBATE */}
      <section className="bg-slate-900 rounded-lg p-4 border border-slate-800 space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 border-b border-slate-800 pb-1 font-mono">
          LOG DE COMBATE
        </h3>
        <div className="h-44 overflow-y-auto space-y-1.5 text-sm font-mono pr-2">
          {combatLog.map((log, index) => (
            <p
              key={index}
              className={`p-2 rounded ${
                log.includes("⚔️")
                  ? "bg-sky-950/40 text-sky-300 border-l-2 border-sky-500"
                  : log.includes("👹")
                    ? "bg-rose-950/40 text-rose-300 border-l-2 border-rose-500"
                    : log.includes("🎉")
                      ? "bg-amber-950/50 text-amber-300 border-l-2 border-amber-500 font-bold"
                      : "bg-slate-950/60 text-slate-300"
              }`}
            >
              {log}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
