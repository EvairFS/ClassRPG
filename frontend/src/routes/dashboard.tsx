import { createFileRoute, redirect } from "@tanstack/react-router"; // 💡 Adicionamos o redirect aqui

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {
    // 🛡️ O TanStack Router intercepta o usuário ANTES da página carregar
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/",
        replace: true, // Evita que o usuário volte para o dashboard clicando no botão "Voltar" do navegador
      });
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  return <div>Bem-vindo ao Dashboard!</div>;
}
