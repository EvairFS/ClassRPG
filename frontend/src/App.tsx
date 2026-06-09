import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Importa a árvore de rotas gerada pelo TanStack Router
import { routeTree } from "./routeTree.gen";

// 🛡️ Configuração do QueryClient protegida contra loops e HTTP 429
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // Considera os dados frescos por 30s
      refetchOnWindowFocus: false, // Evita requests ao clicar na janela
      refetchOnReconnect: false, // Evita disparos se a rede oscilar
      retry: (failureCount, error: unknown) => {
        const err = error as { response?: { status?: number }; status?: number };
        const status = err?.response?.status || err?.status;
        if (status === 429 || status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

// 💡 SOLUÇÃO: injetamos o queryClient no bloco 'context' exigido pelo router
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

// Registra o router no TypeScript para tipagem estática dos links
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;
