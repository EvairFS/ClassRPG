import { clearAuth, getToken } from "./auth";
import type {
  Achievement,
  ActivityItem,
  Mission,
  NotificationItem,
  Student,
  Teacher,
  Team,
} from "@/types";

const BASE_URL =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:3001/api";

// ── snake_case → camelCase deep transform ──────────────────────────────
const snakeToCamel = (key: string) => key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

function camelize<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) return input.map((v) => camelize(v)) as unknown as T;
  if (input && typeof input === "object" && input.constructor === Object) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[snakeToCamel(k)] = camelize(v);
    }
    return out as T;
  }
  return input as T;
}

// ── HTTP error type ────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// ── Request core ───────────────────────────────────────────────────────
interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Skip auth header even if a token exists (login, register). */
  anonymous?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (!opts.anonymous) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body != null ? JSON.stringify(opts.body) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      `Não foi possível conectar à API em ${BASE_URL}. Verifique se o backend está rodando.`,
      0,
      "NETWORK",
    );
  }

  // 401 → clear session and bounce to login (client-only)
  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.location.replace("/");
    }
    throw new ApiError("Sessão expirada. Faça login novamente.", 401, "UNAUTHORIZED");
  }

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      // Non-JSON body — leave as null
    }
  }

  if (!res.ok) {
    const errObj = payload as { error?: string; code?: string } | null;
    throw new ApiError(errObj?.error ?? `Erro ${res.status}`, res.status, errObj?.code);
  }

  // Backend wraps every success as { data, meta? }
  const envelope = (payload ?? {}) as { data?: unknown };
  return camelize<T>(envelope.data);
}

// ── Response shapes ────────────────────────────────────────────────────
export interface LoginResponse {
  token: string;
  user: { id: string; email: string; name: string; role: "student" | "teacher" | "admin" };
}

export interface StudentDashboard {
  currentStudent: Student;
  students: Student[];
  activities: ActivityItem[];
  missions: Mission[];
  achievements: Achievement[];
  notifications: NotificationItem[];
  teams: Team[];
  ranking: { rank: number; student: Student }[];
}

export interface TeacherDashboard {
  students: Student[];
  activities: ActivityItem[];
  teachers: Teacher[];
  currentTeacher: Teacher | null;
  stats: { totalStudents: number; totalActivities: number; averageXp: number };
}

export interface SubmitActivityResponse {
  activity: ActivityItem;
  student: Student;
  xpEarned: number;
}

interface Question {
  id: string | number;
  text: string;
  options: string[];
  correctIndex: number;
}

interface MissionWithQuestions {
  id: string;
  title: string;
  xpReward: number;
  questions: Question[];
}

// ── Public API surface ─────────────────────────────────────────────────
export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<LoginResponse>("/login", {
      method: "POST",
      body: { email, password },
      anonymous: true,
    }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    role: "student" | "teacher";
    classroom?: string;
    subject?: string;
  }) =>
    request<LoginResponse>("/register", {
      method: "POST",
      body: data,
      anonymous: true,
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/forgot-password", {
      method: "POST",
      body: { email },
      anonymous: true,
    }),

  me: () => request<AuthUserResponse | null>("/user/me"),

  // Dashboards (aggregated)
  getStudentDashboard: () => request<StudentDashboard>("/dashboard/student"),
  getTeacherDashboard: () => request<TeacherDashboard>("/dashboard/teacher"),

  // Resource lists
  getActivities: () => request<ActivityItem[]>("/activities"),
  getActivity: (id: string) => request<ActivityItem>(`/activities/${id}`),
  submitActivity: (id: string, submission: string, studentId?: string) =>
    request<SubmitActivityResponse>(`/activities/${id}/submit`, {
      method: "POST",
      body: { submission, studentId },
    }),

  joinMission: (missionId: string) =>
    request<unknown>(`/missions/${missionId}/join`, {
      method: "POST",
    }),
  getMissions: (p0: string) => request<Mission[]>("/missions"),
  getAchievements: () => request<Achievement[]>("/achievements"),
  getTeams: () => request<Team[]>("/teams"),
  getRanking: () => request<{ rank: number; student: Student }[]>("/ranking"),

  getNotifications: () => request<NotificationItem[]>("/notifications"),
  markNotificationRead: (id: string) =>
    request<NotificationItem>(`/notifications/${id}/read`, { method: "PATCH" }),

  // 🌟 ADICIONE ESTES DOIS MÉTODOS NO FINAL DO OBJETO 'api':
  createMission: (data: unknown) =>
    request<unknown>("/missions", {
      method: "POST",
      body: data,
    }),

  createActivity: (data: unknown) =>
    request<unknown>("/activities", {
      method: "POST",
      body: data,
    }),

  // Combat / Mission with questions
  getMissionCombat: (missionId: string) => request<MissionWithQuestions>(`/missions/${missionId}`),

  finishMissionCombat: (
    missionId: string,
    payload: { status: "completed" | "failed"; xpEarned: number },
  ) =>
    request<unknown>(`/missions/${missionId}/finish`, {
      method: "POST",
      body: payload,
    }),
};

interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin";
}
