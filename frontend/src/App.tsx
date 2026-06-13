// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth"; // 💡 Importe o seu hook reativo

import { routeTree } from "./routeTree.gen";

// 🛡️ Configuração protetora do QueryClient contra loops
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 429 || error?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

// Inicializamos o roteador apenas com a "casca" do contexto para o TypeScript
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined!, // 💡 Será injetado dinamicamente abaixo
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  const auth = useAuth(); // 💡 Lê o estado de autenticação reativo (com hydrated, token, etc.)

  // Evita flashes de tela e redirecionamentos errados enquanto lê o localStorage pela primeira vez
  if (!auth.hydrated) {
    return null; // Ou um esqueleto/loading spinner global elegante
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* 💡 A MÁGICA ACONTECE AQUI: Passamos o 'auth' reativo para o contexto do router */}
        <RouterProvider router={router} context={{ auth }} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
