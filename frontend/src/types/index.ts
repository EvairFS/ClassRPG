export type UserRole = "student" | "teacher";

export type Patent =
  | "Novato"
  | "Aprendiz"
  | "Guerreiro Acadêmico"
  | "Mestre Estratégico"
  | "Lenda da Turma";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Epic";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earned: boolean;
  earnedAt?: string;
  progress?: number;
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  email: string;
  classroom: string;
  xp: number;
  level: number;
  patent: Patent;
  streak: number;
  missionsCompleted: number;
  activitiesCompleted: number;
  achievements: Achievement[];
  teamId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  email: string;
  subject: string;
  classes: string[];
  studentsCount: number;
  status: "active" | "pending";
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "special" | "event" | "challenge";
  difficulty: Difficulty;
  xpReward: number;
  deadline: string;
  status: "available" | "in_progress" | "completed" | "expired";
  progress: number;
  total: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: Difficulty;
  xpReward: number;
  deadline: string;
  status: "pending" | "submitted" | "graded";
  grade?: number;
  instructions?: string;
  attachments?: { name: string; size: string }[];
  feedback?: string;
  submission?: string;
  teacher?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: "xp" | "mission" | "achievement" | "system" | "feedback";
  read: boolean;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  emblem: string;
  members: number;
  xp: number;
  weeklyXp?: number;
  memberIds?: string[];
  motto?: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed";
  xpReward: number;
  deadline: string;
}

export interface RankingEntry {
  rank: number;
  student: Student;
}
