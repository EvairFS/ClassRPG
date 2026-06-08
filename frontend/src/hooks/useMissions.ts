import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useJoinMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      return await api.joinMission(missionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
    onError: (error: unknown) => {
      // 🌟 Correção do ESLint: Tratando o erro como 'unknown' com segurança
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro ao entrar na missão.");
      }
    },
  });
};
