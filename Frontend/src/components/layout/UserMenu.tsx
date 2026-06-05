import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react"; // Um ícone legal para o botão

export function UserMenu() {
  const { logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Remove o token de requisição do navegador
    localStorage.removeItem("token"); 
    
    // 2. Atualiza o estado global (muda isAuthenticated para false)
    logout(); 
    
    // 3. Manda o usuário de volta para a tela de login raiz ("/")
    navigate({ to: "/" });
  };

  return (
    <Button 
      onClick={handleLogout} 
      variant="ghost" 
      className="text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 gap-2 text-sm"
    >
      <LogOut className="size-4" />
      Deslogar
    </Button>
  );
}
