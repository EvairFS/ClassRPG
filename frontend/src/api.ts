// Note: response types are inferred from the API; import specific types as needed.

const BASE_URL = import.meta.env.VITE_API_BASE ?? (typeof window !== "undefined" ? "/api" : "http://localhost:3001");

/**
 * Extracts the token from the auth response (stored for subsequent requests).
 */
function getAuthHeaders(): Record<string, string> {
  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        return { Authorization: `Bearer ${parsed.token}` };
      }
    }
  } catch {
    // Ignore parse errors
  }

  if (import.meta.env.DEV) {
    return { "X-User-Id": "s3" };
  }

  return {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options?.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Erro ${res.status}`);
  }

  const body = await res.json();

  // New response format: { data: T, meta?: ... }
  if (body && typeof body === "object" && "data" in body) {
    return body.data as T;
  }

  // Legacy flat response format
  return body as T;
}

// ---- Auth ----
export const api = {
  login: (email: string, password: string) =>
    request<{ user: { id: string; name: string; email: string; role: string }; token: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // ---- Students ----
  getStudents: () => request<any[]>("/students"),
  getStudent: (id: string) => request<any>(`/students/${id}`),
  getCurrentStudent: () => request<any>("/students/me/current"),

  // ---- Teachers ----
  getTeachers: () => request<any[]>("/teachers"),
  getTeacher: (id: string) => request<any>(`/teachers/${id}`),
  getCurrentTeacher: () => request<any>("/teachers/me/current"),

  // ---- Activities ----
  getActivities: () => request<any[]>("/activities"),
  getActivity: (id: string) => request<any>(`/activities/${id}`),
  createActivity: (data: any) =>
    request<any>("/activities", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitActivity: (id: string, submission?: string) =>
    request<any>(`/activities/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ submission }),
    }),

  // ---- Missions ----
  getMissions: () => request<any[]>("/missions"),
  getMission: (id: string) => request<any>(`/missions/${id}`),

  // ---- Achievements ----
  getAchievements: () => request<any[]>("/achievements"),

  // ---- Notifications ----
  getNotifications: () => request<any[]>("/notifications"),
  markNotificationRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, { method: "PATCH" }),

  // ---- Teams ----
  getTeams: () => request<any[]>("/teams"),
  getTeam: (id: string) => request<any>(`/teams/${id}`),

  // ---- Ranking ----
  getRanking: () => request<{ rank: number; student: any }[]>("/ranking"),

  // ---- Charts ----
  getStudentPerfWeek: () => request<any[]>("/charts/student-perf-week"),
  getClassEngagement: () => request<any[]>("/charts/class-engagement"),
  getPlatformGrowth: () => request<any[]>("/charts/platform-growth"),
  getSkillsRadar: () => request<any[]>("/charts/skills-radar"),

  // ---- Dashboards ----
  getStudentDashboard: () => request<any>("/dashboard/student"),
  getTeacherDashboard: () => request<any>("/dashboard/teacher"),
};