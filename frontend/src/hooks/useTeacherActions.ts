import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api"; // 🌟 Caminho corrigido!

export const useCreateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => {
      return await api.createMission(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "teacher"] });
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro ao criar a missão.");
      }
    },
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => {
      return await api.createActivity(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "teacher"] });
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro ao criar a atividade.");
      }
    },
  });
};
