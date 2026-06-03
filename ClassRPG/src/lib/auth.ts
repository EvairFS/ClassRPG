// Client-only auth token storage. Safe to call on the server (returns null).

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin";
}

export interface AuthState {
  token: string;
  user: AuthUser;
}

const STORAGE_KEY = "classrpg.auth";

export function getAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed?.token || !parsed?.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("classrpg:auth-change"));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("classrpg:auth-change"));
}

export function getToken(): string | null {
  return getAuth()?.token ?? null;
}