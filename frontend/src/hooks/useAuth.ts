import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { clearAuth, getAuth, type AuthState } from "@/lib/auth";

/**
 * SSR-safe auth hook. Always returns null on the server / first render,
 * then re-reads localStorage after mount. Subscribes to cross-tab and
 * in-app auth changes via the `classrpg:auth-change` event.
 */
export function useAuth() {
  const [auth, setAuthState] = useState<AuthState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthState(getAuth());
    setHydrated(true);
    const onChange = () => setAuthState(getAuth());
    window.addEventListener("classrpg:auth-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("classrpg:auth-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    navigate({ to: "/" });
  }, [navigate]);

  return {
    user: auth?.user ?? null,
    token: auth?.token ?? null,
    isAuthenticated: !!auth?.token,
    hydrated,
    logout,
  };
}
