export interface CreateActivityInput {
  title: string;
  description: string;
  objective: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  maxScore?: number;
  dueDate: string;
  objectives?: Array<{
    title: string;
    description: string;
    points: number;
  }>;
  challenges?: Array<{
    title: string;
    description: string;
    points: number;
  }>;
  rewards?: Array<{
    name: string;
    type: string;
    value: string | number;
  }>;
}

export interface ActivityResponse {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  maxScore: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  dueDate: Date;
  createdAt: Date;
}