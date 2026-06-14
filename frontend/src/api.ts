import type {
  Student,
  Teacher,
  ActivityItem,
  Mission,
  Achievement,
  NotificationItem,
  Team,
} from "@/types";

// Use VITE_API_BASE environment variable for production (set in .env.production)
// Falls back to localhost:3001 for local development
const BASE_URL = import.meta.env.VITE_API_BASE ?? "https://classrpg-api-26wl.onrender.com/api";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "student" | "teacher";
    name: string;
  };
}

interface DashboardResponse {
  student?: Student;
  teacher?: Teacher;
  activities?: ActivityItem[];
  missions?: Mission[];
  achievements?: Achievement[];
  notifications?: NotificationItem[];
  teams?: Team[];
  ranking?: Student[];
}

const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  async login(
    email: string,
    password: string,
    role: "student" | "teacher",
  ): Promise<LoginResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  async getStudents(token?: string): Promise<Student[]> {
    const res = await fetch(`${BASE_URL}/students`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch students");
    return res.json();
  },

  async getStudent(id: string, token?: string): Promise<Student> {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch student");
    return res.json();
  },

  async getTeachers(token?: string): Promise<Teacher[]> {
    const res = await fetch(`${BASE_URL}/teachers`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch teachers");
    return res.json();
  },

  async getTeacher(id: string, token?: string): Promise<Teacher> {
    const res = await fetch(`${BASE_URL}/teachers/${id}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch teacher");
    return res.json();
  },

  async getActivities(token?: string): Promise<ActivityItem[]> {
    const res = await fetch(`${BASE_URL}/activities`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch activities");
    return res.json();
  },

  async getActivity(id: string, token?: string): Promise<ActivityItem> {
    const res = await fetch(`${BASE_URL}/activities/${id}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch activity");
    return res.json();
  },

  async getMissions(token?: string): Promise<Mission[]> {
    const res = await fetch(`${BASE_URL}/missions`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch missions");
    return res.json();
  },

  async getMission(id: string, token?: string): Promise<Mission> {
    const res = await fetch(`${BASE_URL}/missions/${id}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch mission");
    return res.json();
  },

  async getAchievements(token?: string): Promise<Achievement[]> {
    const res = await fetch(`${BASE_URL}/achievements`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch achievements");
    return res.json();
  },

  async getNotifications(token?: string): Promise<NotificationItem[]> {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
  },

  async getTeams(token?: string): Promise<Team[]> {
    const res = await fetch(`${BASE_URL}/teams`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch teams");
    return res.json();
  },

  async getRanking(token?: string): Promise<{
    students: Student[];
    teams: Team[];
  }> {
    const res = await fetch(`${BASE_URL}/ranking`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch ranking");
    return res.json();
  },

  async getStudentDashboard(studentId: string, token?: string): Promise<DashboardResponse> {
    const res = await fetch(`${BASE_URL}/students/${studentId}/dashboard`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch student dashboard");
    return res.json();
  },

  async getTeacherDashboard(teacherId: string, token?: string): Promise<DashboardResponse> {
    const res = await fetch(`${BASE_URL}/teachers/${teacherId}/dashboard`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch teacher dashboard");
    return res.json();
  },

  async submitActivity(activityId: string, token?: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/activities/${activityId}/submit`, {
      method: "POST",
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to submit activity");
    return res.json();
  },

  async gradeActivity(
    activityId: string,
    grade: number,
    feedback: string,
    token?: string,
  ): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/activities/${activityId}/grade`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ grade, feedback }),
    });
    if (!res.ok) throw new Error("Failed to grade activity");
    return res.json();
  },

  async createMission(missionData: unknown, token: string): Promise<Mission> {
    const res = await fetch(`${BASE_URL}/missions`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(missionData),
    });
    if (!res.ok) throw new Error("Falha ao criar missão");
    return res.json();
  },

  async joinMission(missionId: string, token: string): Promise<unknown> {
    const res = await fetch(`${BASE_URL}/missions/${missionId}/join`, {
      method: "POST",
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Falha ao entrar na missão");
    return res.json();
  },

  async answerQuestion(questionId: string, index: number, token: string): Promise<unknown> {
    const res = await fetch(`${BASE_URL}/missions/answer`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ question_id: questionId, student_answer_index: index }),
    });
    if (!res.ok) throw new Error("Falha ao responder pergunta");
    return res.json();
  },

  async getMissionStatus(missionId: string, token: string): Promise<unknown> {
    const res = await fetch(`${BASE_URL}/missions/${missionId}/status`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Falha ao buscar status da missão");
    return res.json();
  },

  async getMyMissions(token: string): Promise<Mission[]> {
    const res = await fetch(`${BASE_URL}/missions/my-missions`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Falha ao buscar missões do professor");
    return res.json();
  },

  async createActivity(
    activityData: { title: string; description: string; xp_reward: number; deadline: string },
    token: string,
  ) {
    const res = await fetch(`${BASE_URL}/activities`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(activityData),
    });
    if (!res.ok) throw new Error("Falha ao criar atividade");
    return res.json();
  },
};
