import { useEffect, useState } from "react";

export interface CurrentUser {
  id: string;
  email: string;
  role: "student" | "teacher";
  name: string;
}

export interface UseCurrentUserReturn {
  user: CurrentUser | null;
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        const { token: t, user: u } = JSON.parse(stored);
        setToken(t);
        setUser(u);
      } catch {
        localStorage.removeItem("auth");
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
    setToken(null);
  };

  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    logout,
  };
}
