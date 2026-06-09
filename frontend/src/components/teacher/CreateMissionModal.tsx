import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { X, Loader2 } from "lucide-react";

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

interface ActivityItem {
  id: string;
  title: string;
  questions: Question[];
}

interface CreateMissionPayload {
  title: string;
  description: string;
  type: string;
  difficulty: string;
  xpReward: number;
  deadline: string;
  activityId: string;
  total: number;
  progress: number;
}

interface CreateMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMissionModal({ isOpen, onClose }: CreateMissionModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("challenge");
  const [difficulty, setDifficulty] = useState("medium");
  const [xpReward, setXpReward] = useState(100);
  const [deadline, setDeadline] = useState("");
  const [activityId, setActivityId] = useState("");

  // 1️⃣ Alterado para usar o método mapeado no seu SDK em vez de api.get()
  const { data: activities } = useQuery<ActivityItem[]>({
    queryKey: ["activities-list"],
    queryFn: async (): Promise<ActivityItem[]> => {
      const response = await api.getActivities();

      // 💡 SOLUÇÃO: Forçamos o cast do tipo global do SDK para o tipo local expandido
      return response as unknown as ActivityItem[];
    },
    enabled: isOpen,
  });

  // 2️⃣ Alterado para usar o método de criação mapeado no seu SDK em vez de api.post()
  const createMissionMutation = useMutation({
    mutationFn: async (data: CreateMissionPayload) => {
      return api.createMission(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      onClose();
      setTitle("");
      setDescription("");
      setActivityId("");
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityId) {
      alert("Por favor, selecione ou crie uma atividade com questionário primeiro!");
      return;
    }

    const selectedActivity = activities?.find((a) => a.id === activityId);

    createMissionMutation.mutate({
      title,
      description,
      type,
      difficulty,
      xpReward,
      deadline,
      activityId,
      total: selectedActivity?.questions?.length || 1,
      progress: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl text-white flex flex-col">
        <header className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">Aventura</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="size-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Nome da Missão</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: A Forja do Código Limpo"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-sky-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">
              Descrição / Lore da Missão
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o lore ou o objetivo dessa aventura de estudos..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-sky-500 outline-none h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                <option value="easy">Fácil (Iniciante)</option>
                <option value="medium">Média (Pleno)</option>
                <option value="hard">Difícil (Sênior)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400">Recompensa (XP)</label>
              <input
                type="number"
                required
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400">Prazo de Entrega</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80 mt-2">
            <label className="text-xs font-mono uppercase text-amber-400 block mb-1">
              Vincular Questionário Ativo
            </label>
            <select
              required
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 outline-none"
            >
              <option value="">-- Selecione uma Atividade --</option>
              {activities?.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.title} ({act.questions?.length || 0} perguntas)
                </option>
              ))}
            </select>
          </div>

          <footer className="flex justify-end gap-3 pt-4 border-t border-slate-800/60 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMissionMutation.isPending}
              className="px-5 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {createMissionMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Publicar Missão
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
