import { Link, useLocation, useNavigate } from "react-router-dom";
import { getLevelInfo } from "@/lib/gamification";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import XPBar from "@/components/XPBar";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";

interface NavbarProps {
  userType: "student" | "teacher";
}

const Navbar = ({ userType }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch current student/teacher data
  const { data: currentData } = useQuery({
    queryKey: [userType === "student" ? "student" : "teacher", user?.id],
    queryFn: () =>
      userType === "student" ? api.getStudent(user!.id, token!) : api.getTeacher(user!.id, token!),
    enabled: !!user?.id && !!token,
  });

  const info = currentData && "xp" in currentData ? getLevelInfo(currentData.xp) : null;
  const avatar = currentData?.avatar || user?.name?.charAt(0) || "?";
  const name = currentData?.name || user?.name || "";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const studentLinks = [
    { to: "/student", label: "Painel" },
    { to: "/ranking", label: "Ranking" },
  ];

  const teacherLinks = [
    { to: "/teacher", label: "Painel" },
    { to: "/ranking", label: "Ranking" },
  ];

  const links = userType === "student" ? studentLinks : teacherLinks;

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to={userType === "student" ? "/student" : "/teacher"}
            className="flex items-center gap-0"
          >
            <img
              src="/logo.png"
              alt="ClassRPG Logo"
              className="h-16 w-16 object-contain mix-blend-screen"
            />
            <span className="font-display text-lg tracking-widest text-accent uppercase">
              ClassRPG
            </span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-body text-sm tracking-wide transition-colors ${
                  location.pathname === link.to ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {userType === "student" && currentData && "xp" in currentData && (
              <div className="w-48">
                <XPBar xp={currentData.xp} showLabel={false} size="sm" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-border flex items-center justify-center text-xs font-body font-semibold text-foreground">
                {avatar}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-body text-foreground">{name}</span>
                {userType === "student" && info && (
                  <span className="text-[10px] text-muted-foreground font-body">
                    Nv. {info.level} — {info.name}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block font-body text-sm ${
                  location.pathname === link.to ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {userType === "student" && currentData && "xp" in currentData && (
              <div className="pt-2">
                <XPBar xp={currentData.xp} size="sm" />
              </div>
            )}
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="text-sm text-muted-foreground font-body"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
