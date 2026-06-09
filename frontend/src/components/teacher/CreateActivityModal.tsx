import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Plus, Trash2, X, Loader2 } from "lucide-react";

interface QuestionForm {
  text: string;
  options: string[];
  correctIndex: number;
}

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateActivityModal({ isOpen, onClose }: CreateActivityModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { text: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);

  const createActivityMutation = useMutation({
    mutationFn: async (data: unknown) => {
      return api.createActivity(data);
    },
    onSuccess: () => {
      // Invalida a lista de atividades para atualizar o select do outro modal automaticamente
      queryClient.invalidateQueries({ queryKey: ["activities-list"] });
      onClose();

      // ... (seus estados de limpar formulário se houverem, ex: setTitle(""))
    },
  });

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", "", ""], correctIndex: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = val;
    setQuestions(updated);
  };

  const handleCorrectIndexChange = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctIndex = oIndex;
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.some((q) => !q.text.trim())) return;
    createActivityMutation.mutate({ title, questions });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl text-white flex flex-col">
        <header className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            📝 Criar Novo Questionário
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="size-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Título da Atividade
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Simulado Prático de UML & Scrum"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none transition"
            />
          </div>

          <div className="border-t border-slate-800/60 pt-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300 font-mono uppercase">
                Perguntas (Combates)
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="size-3.5" /> Adicionar Questão
              </button>
            </div>

            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-4 relative"
              >
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="absolute top-4 right-4 text-rose-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}

                <div className="space-y-1.5 pr-8">
                  <span className="text-xs font-bold text-amber-500/80 font-mono">
                    Questão {qIndex + 1}
                  </span>
                  <input
                    type="text"
                    required
                    value={question.text}
                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                    placeholder="Enunciado da pergunta acadêmica..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:border-amber-500 outline-none transition"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Alternativas (Marque a correta)
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {question.options.map((option, oIndex) => (
                      <div
                        key={oIndex}
                        className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800"
                      >
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctIndex === oIndex}
                          onChange={() => handleCorrectIndexChange(qIndex, oIndex)}
                          className="accent-amber-500 size-4 cursor-pointer"
                        />
                        <input
                          type="text"
                          required
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Alternativa ${String.fromCharCode(65 + oIndex)}`}
                          className="w-full bg-transparent border-none text-sm outline-none text-slate-300 placeholder:text-slate-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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
