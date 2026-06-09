import React, { useState } from "react";
import { useCreateActivity, useCreateMission } from "@/hooks/useTeacherActions";
import type { Difficulty, Mission } from "@/types";

type MissionType = Mission["type"];

export const TeacherManagement: React.FC = () => {
  const createActivityMutation = useCreateActivity();
  const createMissionMutation = useCreateMission();

  // 📝 Estados da Atividade (Sincronizados com ActivityItem)
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activitySubject, setActivitySubject] = useState("");
  const [activityDifficulty, setActivityDifficulty] = useState<Difficulty>("Easy");
  const [activityXp, setActivityXp] = useState(100);
  const [activityDeadline, setActivityDeadline] = useState("");

  // 🏰 Estados da Missão (Sincronizados com Mission)
  const [missionTitle, setMissionTitle] = useState("");
  const [missionDescription, setMissionDescription] = useState("");
  const [missionType, setMissionType] = useState<MissionType>("daily");
  const [missionDifficulty, setMissionDifficulty] = useState<Difficulty>("Medium");
  const [missionXpReward, setMissionXpReward] = useState(250);
  const [missionDeadline, setMissionDeadline] = useState("");
  const [missionTotal, setMissionTotal] = useState(1);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !activityTitle.trim() ||
      !activityDescription.trim() ||
      !activitySubject.trim() ||
      !activityDeadline
    ) {
      alert("Por favor, preencha todos os campos da atividade.");
      return;
    }

    createActivityMutation.mutate(
      {
        title: activityTitle,
        description: activityDescription,
        subject: activitySubject,
        difficulty: activityDifficulty,
        xpReward: Number(activityXp),
        deadline: new Date(activityDeadline).toISOString(),
      },
      {
        onSuccess: () => {
          setActivityTitle("");
          setActivityDescription("");
          setActivitySubject("");
          setActivityDifficulty("Easy");
          setActivityXp(100);
          setActivityDeadline("");
          alert("📝 Atividade criada com sucesso!");
        },
      },
    );
  };

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionTitle.trim() || !missionDescription.trim() || !missionDeadline) {
      alert("Por favor, preencha todos os campos da missão.");
      return;
    }

    createMissionMutation.mutate(
      {
        title: missionTitle,
        description: missionDescription,
        type: missionType,
        difficulty: missionDifficulty,
        xpReward: Number(missionXpReward),
        deadline: new Date(missionDeadline).toISOString(),
        total: Number(missionTotal),
      },
      {
        onSuccess: () => {
          setMissionTitle("");
          setMissionDescription("");
          setMissionType("daily");
          setMissionDifficulty("Medium");
          setMissionXpReward(250);
          setMissionDeadline("");
          setMissionTotal(1);
          alert("🏰 Missão/Masmorra criada com sucesso!");
        },
      },
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-slate-900 text-white min-h-screen rounded-xl方">
      <header className="border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-amber-400">Painel do Mestre (Professor)</h1>
        <p className="text-slate-400 text-sm">
          Forje novas atividades e eriga masmorras lendárias para seus alunos.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORMULÁRIO DE ATIVIDADE */}
        <section className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4 shadow-xl">
          <h2 className="text-xl font-semibold text-purple-400 flex items-center gap-2 border-b border-slate-700 pb-2">
            📝 Criar Nova Atividade
          </h2>
          <form onSubmit={handleCreateActivity} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Título da Atividade
              </label>
              <input
                type="text"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                className="mt-1 w-full p-2.5 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-purple-500"
                placeholder="Ex: Entrega do Diagrama de Classes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Matéria / Conteúdo</label>
              <input
                type="text"
                value={activitySubject}
                onChange={(e) => setActivitySubject(e.target.value)}
                className="mt-1 w-full p-2.5 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-purple-500"
                placeholder="Ex: Análise e Desenvolvimento"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Instruções / Descrição
              </label>
              <textarea
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                className="mt-1 w-full p-2.5 h-20 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Explique o que deve ser submetido..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Dificuldade</label>
                <select
                  value={activityDifficulty}
                  onChange={(e) => setActivityDifficulty(e.target.value as Difficulty)}
                  className="mt-1 w-full p-2.5 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-purple-500"
                >
                  <option value="Easy">Fácil (Easy)</option>
                  <option value="Medium">Médio (Medium)</option>
                  <option value="Hard">Difícil (Hard)</option>
                  <option value="Epic">Épico (Epic)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Recompensa XP</label>
                <input
                  type="number"
                  value={activityXp}
                  onChange={(e) => setActivityXp(Number(e.target.value))}
                  className="mt-1 w-full p-2.5 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Prazo Final</label>
                <input
                  type="date"
                  value={activityDeadline}
                  onChange={(e) => setActivityDeadline(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-purple-500 text-slate-300"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={createActivityMutation.isPending}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 font-semibold rounded transition disabled:opacity-50 mt-2"
            >
              {createActivityMutation.isPending ? "Forjando..." : "Lançar Atividade"}
            </button>
          </form>
        </section>

        {/* FORMULÁRIO DE MISSÃO */}
        <section className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4 shadow-xl">
          <h2 className="text-xl font-semibold text-rose-400 flex items-center gap-2 border-b border-slate-700 pb-2">
            🏰 Criar Nova Missão (Masmorra)
          </h2>
          <form onSubmit={handleCreateMission} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">Nome da Missão</label>
              <input
                type="text"
                value={missionTitle}
                onChange={(e) => setMissionTitle(e.target.value)}
                className="mt-1 w-full p-2.5 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-rose-500"
                placeholder="Ex: Ataque Crítico ao Legado de Código Antigo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Contexto RPG / Narrativa
              </label>
              <textarea
                value={missionDescription}
                onChange={(e) => setMissionDescription(e.target.value)}
                className="mt-1 w-full p-2.5 h-20 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-rose-500 resize-none"
                placeholder="Dê uma imersão de RPG ao objetivo de estudos..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Tipo da Missão</label>
                <select
                  value={missionType}
                  onChange={(e) => setMissionType(e.target.value as MissionType)}
                  className="mt-1 w-full p-2.5 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-rose-500"
                >
                  <option value="daily">Diária (Daily)</option>
                  <option value="weekly">Semanal (Weekly)</option>
                  <option value="special">Especial (Special)</option>
                  <option value="challenge">Desafio (Challenge)</option>
                  <option value="event">Evento (Event)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Dificuldade</label>
                <select
                  value={missionDifficulty}
                  onChange={(e) => setMissionDifficulty(e.target.value as Difficulty)}
                  className="mt-1 w-full p-2.5 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-rose-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Epic">Epic</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Recompensa XP</label>
                <input
                  type="number"
                  value={missionXpReward}
                  onChange={(e) => setMissionXpReward(Number(e.target.value))}
                  className="mt-1 w-full p-2.5 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Meta Objetivos (Total)
                </label>
                <input
                  type="number"
                  value={missionTotal}
                  onChange={(e) => setMissionTotal(Number(e.target.value))}
                  className="mt-1 w-full p-2.5 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-rose-500"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Data Expiração</label>
                <input
                  type="date"
                  value={missionDeadline}
                  onChange={(e) => setMissionDeadline(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded bg-slate-950 border border-slate-700 focus:outline-none focus:border-rose-500 text-slate-300"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={createMissionMutation.isPending}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 font-semibold rounded transition disabled:opacity-50 mt-2"
            >
              {createMissionMutation.isPending ? "Invocando Masmorra..." : "Invocar Masmorra"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
