export interface Student {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  levelName: string;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  deadline: string;
  status: "pending" | "completed" | "active";
  createdBy?: string;
}

export const LEVELS = [
  { name: "Noviço", minXp: 0 },
  { name: "Aprendiz", minXp: 100 },
  { name: "Cavaleiro", minXp: 300 },
  { name: "Mago", minXp: 600 },
  { name: "Campeão", minXp: 1000 },
  { name: "Lenda", minXp: 1500 },
];

export function getLevelInfo(xp: number) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }
  const levelIndex = LEVELS.indexOf(currentLevel);
  const xpInLevel = xp - currentLevel.minXp;
  const xpForNext = nextLevel ? nextLevel.minXp - currentLevel.minXp : 0;
  const progress = nextLevel ? (xpInLevel / xpForNext) * 100 : 100;
  return { level: levelIndex + 1, name: currentLevel.name, progress, xpInLevel, xpForNext, nextLevelName: nextLevel?.name };
}

export const MOCK_BADGES: Badge[] = [
  { id: "1", name: "Primeiro Passo", description: "Complete sua primeira atividade", icon: "star", earned: true, earnedAt: "2024-01-15" },
  { id: "2", name: "Escudo de Ferro", description: "Alcance o nível Cavaleiro", icon: "shield", earned: true, earnedAt: "2024-02-20" },
  { id: "3", name: "Espada Afiada", description: "Complete 10 atividades seguidas", icon: "sword", earned: false },
  { id: "4", name: "Coroa do Saber", description: "Fique em 1º no ranking", icon: "crown", earned: false },
  { id: "5", name: "Chama Eterna", description: "Mantenha uma sequência de 30 dias", icon: "flame", earned: true, earnedAt: "2024-03-01" },
  { id: "6", name: "Olho de Águia", description: "Responda tudo certo em uma prova", icon: "eye", earned: false },
];

export const MOCK_STUDENTS: Student[] = [
  { id: "1", name: "Ana Silva", avatar: "AS", xp: 850, level: 4, levelName: "Mago", badges: MOCK_BADGES.slice(0, 3) },
  { id: "2", name: "Carlos Oliveira", avatar: "CO", xp: 720, level: 3, levelName: "Cavaleiro", badges: MOCK_BADGES.slice(0, 2) },
  { id: "3", name: "Maria Santos", avatar: "MS", xp: 690, level: 3, levelName: "Cavaleiro", badges: MOCK_BADGES.slice(1, 4) },
  { id: "4", name: "Pedro Costa", avatar: "PC", xp: 540, level: 3, levelName: "Cavaleiro", badges: MOCK_BADGES.slice(0, 1) },
  { id: "5", name: "Luísa Ferreira", avatar: "LF", xp: 480, level: 2, levelName: "Aprendiz", badges: MOCK_BADGES.slice(0, 2) },
  { id: "6", name: "João Mendes", avatar: "JM", xp: 350, level: 3, levelName: "Cavaleiro", badges: [] },
  { id: "7", name: "Beatriz Almeida", avatar: "BA", xp: 290, level: 2, levelName: "Aprendiz", badges: MOCK_BADGES.slice(0, 1) },
  { id: "8", name: "Rafael Lima", avatar: "RL", xp: 210, level: 2, levelName: "Aprendiz", badges: [] },
  { id: "9", name: "Fernanda Rocha", avatar: "FR", xp: 150, level: 2, levelName: "Aprendiz", badges: MOCK_BADGES.slice(0, 1) },
  { id: "10", name: "Gabriel Souza", avatar: "GS", xp: 80, level: 1, levelName: "Noviço", badges: [] },
];

export const MOCK_ACTIVITIES: Activity[] = [
  { id: "1", title: "Questionário de História Medieval", description: "Responda 15 perguntas sobre a Idade Média e os cavaleiros templários.", xpReward: 50, deadline: "2024-04-15", status: "pending" },
  { id: "2", title: "Redação: O Futuro da Educação", description: "Escreva uma redação de 500 palavras sobre como a tecnologia transforma o aprendizado.", xpReward: 80, deadline: "2024-04-20", status: "pending" },
  { id: "3", title: "Exercícios de Matemática", description: "Resolva 20 equações de segundo grau.", xpReward: 60, deadline: "2024-04-10", status: "completed" },
  { id: "4", title: "Projeto de Ciências", description: "Crie um experimento sobre reações químicas e documente os resultados.", xpReward: 120, deadline: "2024-04-25", status: "pending" },
  { id: "5", title: "Leitura: Dom Casmurro", description: "Leia os capítulos 1 a 10 e faça um resumo.", xpReward: 40, deadline: "2024-04-08", status: "completed" },
  { id: "6", title: "Apresentação de Geografia", description: "Prepare uma apresentação sobre biomas brasileiros.", xpReward: 70, deadline: "2024-04-30", status: "active" },
];

export const CURRENT_STUDENT = MOCK_STUDENTS[0];
