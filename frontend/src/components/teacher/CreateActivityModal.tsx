import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { X, Loader2 } from "lucide-react";

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateActivityModal({ isOpen, onClose }: CreateActivityModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // 📝 Estados alinhados estritamente com as colunas da tabela 'activities'
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [xpReward, setXpReward] = useState("100");
  const [deadline, setDeadline] = useState("");
  const [instructions, setInstructions] = useState("");

  const createActivityMutation = useMutation({
    mutationFn: async (data: unknown) => {
      return api.createActivity(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities-list"] });

      // Limpa o formulário após salvar com sucesso
      setTitle("");
      setDescription("");
      setSubject("");
      setDifficulty("Medium");
      setXpReward("100");
      setDeadline("");
      setInstructions("");

      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    // 🛠️ Payload limpo para a tabela 'activities' (Sem array de perguntas)
    const payload = {
      title,
      description,
      subject,
      difficulty, // Enviando as strings esperadas pelo ENUM do back-end
      xpReward: Number(xpReward),
      deadline: deadline ? new Date(deadline).toISOString() : new Date().toISOString(),
      instructions,
      teacher: user?.id,
    };

    createActivityMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl text-white flex flex-col">
        <header className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            📝 Criar Nova Atividade Dissertativa
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="size-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* Título */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Título da Atividade *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Resenha Crítica sobre Arquitetura MVC"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none transition"
            />
          </div>

          {/* Matéria e Recompensa de XP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Matéria / Disciplina *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Recompensa de XP *
              </label>
              <input
                type="number"
                required
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none transition"
              />
            </div>
          </div>

          {/* Dificuldade e Prazo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Dificuldade *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none transition bg-slate-950"
              >
                <option value="Easy">Fácil</option>
                <option value="Medium">Médio</option>
                <option value="Hard">Difícil</option>
                <option value="Epic">Épico</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Prazo de Entrega (Deadline) *
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none transition text-slate-400"
              />
            </div>
          </div>

          {/* Descrição Básica */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Descrição curta
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve introdução sobre os objetivos da entrega..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none transition"
            />
          </div>

          {/* Instruções */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Enunciado / Instruções da Atividade
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Escreva detalhadamente o que o aluno deve redigir na caixa de texto..."
              rows={4}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none transition resize-none"
            />
          </div>

          <footer className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createActivityMutation.isPending}
              className="px-5 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {createActivityMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Salvar Atividade
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
