import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { X, Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface QuestionInput {
  text: string;
  options: string[];
  correctIndex: number;
  damage: number;
}

// ⚔️ Atualizada para aceitar as variações que enviamos ao backend
interface CreateMissionPayload {
  title: string;
  description: string;
  type: string;
  difficulty: string;
  deadline: string;

  // Variações de HP
  monsterHp: number;
  hp?: number;
  monster_hp?: number;

  // Variações de Recompensas
  xpReward: number;
  xp_reward?: number;
  goldReward: number;
  gold_reward?: number;

  // Variações dentro do array de perguntas
  questions: Array<{
    text: string;
    statement?: string;
    options: string[];
    correctIndex: number;
    correct_index?: number;
    damage: number;
  }>;
}

// 🛡️ Interface que define as propriedades do Modal
interface CreateMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMissionModal({ isOpen, onClose }: CreateMissionModalProps) {
  const queryClient = useQueryClient();

  // Estados da Missão / Monstro
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("challenge");
  const [difficulty, setDifficulty] = useState("medium"); // 🔄 Voltou para minúsculo
  const [xpReward, setXpReward] = useState(100);
  const [goldReward, setGoldReward] = useState(50);
  const [monsterHp, setMonsterHp] = useState(100);
  const [deadline, setDeadline] = useState("");

  // ⚔️ Estado Dinâmico para as Perguntas do Combate
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { text: "", options: ["", "", "", ""], correctIndex: 0, damage: 25 },
  ]);

  // Mutação para enviar os dados para o Back-end
  const createMissionMutation = useMutation({
    mutationFn: async (data: CreateMissionPayload) => {
      return api.createMission(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions-list"] });
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("challenge");
    setDifficulty("medium"); // 🔄 Voltou para minúsculo
    setXpReward(100);
    setGoldReward(50);
    setMonsterHp(100);
    setDeadline("");
    setQuestions([{ text: "", options: ["", "", "", ""], correctIndex: 0, damage: 25 }]);
  };

  // Funções para manipular as perguntas dinamicamente
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], correctIndex: 0, damage: 25 },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) return; // Obriga a ter pelo menos uma pergunta
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // 🛠️ Alterado de 'unknown' para 'any' para evitar chatices de tipagem do TS ao mesclar string/number
  const handleQuestionChange = (index: number, field: keyof QuestionInput, value: unknown) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasEmptyFields = questions.some(
      (q) => !q.text.trim() || q.options.some((opt) => !opt.trim()),
    );

    if (hasEmptyFields) {
      alert("Por favor, preencha todas as perguntas e alternativas!");
      return;
    }

    // ⚔️ Enviando o payload mapeado para o que o seu backend espera
    createMissionMutation.mutate({
      title,
      description,
      type,
      difficulty,

      // Envia as variações de HP
      hp: monsterHp,
      monsterHp: monsterHp,
      monster_hp: monsterHp,

      // Envia as variações de XP e Gold
      xpReward,
      xp_reward: xpReward,
      goldReward,
      gold_reward: goldReward,

      deadline: deadline ? new Date(deadline).toISOString() : new Date().toISOString(),

      // Mapeia as perguntas
      questions: questions.map((q) => ({
        text: q.text,
        statement: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        correct_index: q.correctIndex,
        damage: q.damage,
      })),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl text-white flex flex-col max-h-[90vh]">
        {/* Header fixo */}
        <header className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
              ⚔️ Forjar Nova Missão Lendária
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Defina o monstro e o pergaminho de perguntas que os heróis enfrentarão.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="size-5" />
          </button>
        </header>

        {/* Corpo com Scroll */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {/* Seção 1: Dados do Monstro / Missão */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase text-sky-500 font-bold tracking-wider border-b border-slate-800 pb-1">
              1. Informações da Aventura
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400">
                Nome da Missão / Nome do Boss
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Validador Cifrado de Strings"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400">
                Lore / Descrição da Missão
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Um dragão de código legado despertou na rota de produção. Use seus conhecimentos em estruturas condicionais para destruí-lo!"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-sky-500 outline-none h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-400">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none"
                >
                  <option value="challenge">Desafio</option>
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="special">Especial</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-400">Dificuldade</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none"
                >
                  {/* 🔄 Os values voltaram a ser minúsculos para passar na API */}
                  <option value="easy">Fácil (Iniciante)</option>
                  <option value="medium">Média (Pleno)</option>
                  <option value="hard">Difícil (Sênior)</option>
                  <option value="epic">Épica (Tech Lead)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-400">Prazo Final</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-rose-400">HP do Monstro</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={monsterHp}
                  onChange={(e) => setMonsterHp(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-rose-400 font-bold outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-amber-400">
                  Recompensa (XP)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-amber-400 font-bold outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-yellow-500">
                  Moedas de Ouro
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={goldReward}
                  onChange={(e) => setGoldReward(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-yellow-500 font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Perguntas Dinâmicas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <h3 className="text-sm font-mono uppercase text-emerald-500 font-bold tracking-wider">
                2. Pergaminho de Questões
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg hover:bg-emerald-500 hover:text-slate-950 transition flex items-center gap-1"
              >
                <Plus className="size-3.5" /> Adicionar Pergunta
              </button>
            </div>

            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4 relative group"
              >
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition"
                    title="Remover pergunta"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-xs flex items-center justify-center font-mono font-bold text-slate-400">
                    {qIndex + 1}
                  </span>
                  <input
                    type="text"
                    required
                    value={question.text}
                    onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                    placeholder="Enunciado da pergunta do combate..."
                    className="flex-1 bg-transparent border-b border-slate-800 focus:border-emerald-500 outline-none text-sm pb-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pl-8">
                  {question.options.map((option, oIndex) => {
                    const isCorrect = question.correctIndex === oIndex;
                    return (
                      <div
                        key={oIndex}
                        className={`flex items-center gap-2 border rounded-lg p-2 transition ${
                          isCorrect
                            ? "bg-emerald-950/20 border-emerald-500/50"
                            : "bg-slate-950/60 border-slate-800/80 focus-within:border-slate-700"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleQuestionChange(qIndex, "correctIndex", oIndex)}
                          className={`p-0.5 rounded-md transition ${isCorrect ? "text-emerald-400" : "text-slate-600 hover:text-slate-400"}`}
                          title="Marcar como resposta correta"
                        >
                          <CheckCircle2 className="size-4.5" />
                        </button>
                        <input
                          type="text"
                          required
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Alternativa ${String.fromCharCode(65 + oIndex)}`}
                          className="w-full bg-transparent outline-none text-xs text-slate-300"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="pl-8 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 uppercase">Dano por Erro:</span>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={question.damage}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "damage", Number(e.target.value))
                      }
                      className="w-16 p-1 bg-slate-950 border border-slate-800 rounded font-bold text-center text-rose-400 outline-none"
                    />
                    <span className="text-slate-500">HP do Aluno</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>

        {/* Footer fixo */}
        <footer className="p-4 border-t border-slate-800/60 bg-slate-900 rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={createMissionMutation.isPending}
            className="px-5 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {createMissionMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Conjurar Missão no Mural
          </button>
        </footer>
      </div>
    </div>
  );
}
