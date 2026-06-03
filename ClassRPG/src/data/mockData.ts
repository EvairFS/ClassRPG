import type {
  Achievement,
  ActivityItem,
  Mission,
  NotificationItem,
  Student,
  Teacher,
  Team,
} from "@/types";

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: "a1", name: "Primeiro Passo", description: "Complete sua primeira atividade", icon: "sparkles", rarity: "common", earned: true, earnedAt: "2026-02-10" },
  { id: "a2", name: "Sequência de Fogo", description: "7 dias seguidos de atividades", icon: "flame", rarity: "rare", earned: true, earnedAt: "2026-03-02" },
  { id: "a3", name: "Estratega", description: "Vença 5 desafios consecutivos", icon: "swords", rarity: "epic", earned: true, earnedAt: "2026-04-21" },
  { id: "a4", name: "Mente Aberta", description: "Conquiste XP em 5 matérias", icon: "brain", rarity: "rare", earned: false, progress: 60 },
  { id: "a5", name: "Lenda Acadêmica", description: "Alcance o topo do ranking mensal", icon: "crown", rarity: "legendary", earned: false, progress: 40 },
  { id: "a6", name: "Mentor", description: "Ajude 10 colegas em desafios", icon: "users", rarity: "epic", earned: false, progress: 20 },
];

const names = [
  "Ana Souza","Bruno Lima","Carla Mendes","Diego Rocha","Elena Costa",
  "Felipe Alves","Gabi Martins","Hugo Pereira","Isabela Cruz","João Pedro",
  "Karina Dias","Lucas Oliveira","Marina Faria","Nicolas Reis","Olívia Borges",
];

function avatarFrom(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const MOCK_STUDENTS: Student[] = names.map((name, i) => {
  const xp = Math.round(8200 - i * 480 + (i % 3) * 110);
  const xpClamped = Math.max(180, xp);
  return {
    id: `s${i + 1}`,
    name,
    avatar: avatarFrom(name),
    email: name.toLowerCase().replace(/\s/g, ".") + "@classrpg.io",
    classroom: i % 2 === 0 ? "9º Ano A" : "9º Ano B",
    xp: xpClamped,
    level: Math.floor(xpClamped / 250) + 1,
    patent:
      xpClamped >= 7000 ? "Lenda da Turma" :
      xpClamped >= 3500 ? "Mestre Estratégico" :
      xpClamped >= 1500 ? "Guerreiro Acadêmico" :
      xpClamped >= 500 ? "Aprendiz" : "Novato",
    streak: ((i * 3) % 21) + 2,
    missionsCompleted: 12 + ((i * 7) % 30),
    activitiesCompleted: 24 + ((i * 5) % 50),
    achievements: MOCK_ACHIEVEMENTS.slice(0, 3 + (i % 3)),
    teamId: `t${(i % 4) + 1}`,
  };
});

export const CURRENT_STUDENT: Student = MOCK_STUDENTS[2]; // Carla Mendes

export const MOCK_TEACHERS: Teacher[] = [
  { id: "t1", name: "Renata Vasconcelos", avatar: "RV", email: "renata@classrpg.io", subject: "Matemática", classes: ["9A", "9B"], studentsCount: 62, status: "active" },
  { id: "t2", name: "Marcos Tavares", avatar: "MT", email: "marcos@classrpg.io", subject: "História", classes: ["9A"], studentsCount: 31, status: "active" },
  { id: "t3", name: "Patrícia Nogueira", avatar: "PN", email: "patricia@classrpg.io", subject: "Biologia", classes: ["8A", "8B", "9A"], studentsCount: 94, status: "active" },
  { id: "t4", name: "Eduardo Brandão", avatar: "EB", email: "eduardo@classrpg.io", subject: "Física", classes: ["9B"], studentsCount: 28, status: "pending" },
  { id: "t5", name: "Letícia Quintela", avatar: "LQ", email: "leticia@classrpg.io", subject: "Literatura", classes: ["7A"], studentsCount: 33, status: "pending" },
];

export const CURRENT_TEACHER: Teacher = MOCK_TEACHERS[0];

export const MOCK_MISSIONS: Mission[] = [
  { id: "m1", title: "Conquiste 100 XP hoje", description: "Complete qualquer combinação de atividades.", type: "daily", difficulty: "Easy", xpReward: 50, deadline: "2026-05-21T23:59", status: "in_progress", progress: 65, total: 100 },
  { id: "m2", title: "Resolva 3 desafios de matemática", description: "Equações, funções e geometria analítica.", type: "weekly", difficulty: "Medium", xpReward: 220, deadline: "2026-05-25T23:59", status: "in_progress", progress: 2, total: 3 },
  { id: "m3", title: "Domine a Revolução Industrial", description: "Leia o material e faça o quiz épico.", type: "special", difficulty: "Hard", xpReward: 400, deadline: "2026-05-28T23:59", status: "available", progress: 0, total: 1 },
  { id: "m4", title: "Boss: Prova bimestral", description: "Atinja 80% na simulação bimestral.", type: "event", difficulty: "Epic", xpReward: 900, deadline: "2026-06-01T18:00", status: "available", progress: 0, total: 1 },
  { id: "m5", title: "Desafie um colega", description: "Vença um duelo 1v1 de conhecimento.", type: "challenge", difficulty: "Medium", xpReward: 150, deadline: "2026-05-22T23:59", status: "completed", progress: 1, total: 1 },
];

export const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: "ac1", title: "Quiz: Frações", description: "10 questões de operações com frações.", subject: "Matemática", difficulty: "Easy", xpReward: 80, deadline: "2026-05-22", status: "pending", teacher: "Renata Vasconcelos",
    instructions: "Resolva as 10 questões abaixo no campo de resposta. Mostre os cálculos quando necessário. Tempo estimado: 25 minutos.",
    attachments: [{ name: "lista-fracoes.pdf", size: "180 KB" }] },
  { id: "ac2", title: "Redação: Mundo em 2050", description: "Texto dissertativo de 25 linhas.", subject: "Português", difficulty: "Medium", xpReward: 160, deadline: "2026-05-24", status: "pending", teacher: "Letícia Quintela",
    instructions: "Produza um texto dissertativo-argumentativo de 25 linhas sobre os desafios da humanidade em 2050." },
  { id: "ac3", title: "Lab virtual: pH", description: "Simulador de soluções ácido-base.", subject: "Química", difficulty: "Hard", xpReward: 240, deadline: "2026-05-26", status: "submitted", teacher: "Patrícia Nogueira",
    submission: "Relatório completo enviado com prints do simulador e tabela de resultados.",
    instructions: "Use o simulador, varie a concentração e registre os valores de pH obtidos." },
  { id: "ac4", title: "Apresentação: Guerra Fria", description: "Slides em grupo (3 alunos).", subject: "História", difficulty: "Epic", xpReward: 420, deadline: "2026-05-30", status: "pending", teacher: "Marcos Tavares",
    instructions: "Em grupos de 3, prepare slides cobrindo causas, fases e consequências da Guerra Fria.",
    attachments: [{ name: "roteiro-apresentacao.docx", size: "92 KB" }] },
  { id: "ac5", title: "Listas de exercícios — Funções", description: "Lista 04, capítulo 7.", subject: "Matemática", difficulty: "Medium", xpReward: 140, deadline: "2026-05-19", status: "graded", grade: 92, teacher: "Renata Vasconcelos",
    submission: "Resoluções entregues no prazo, com gráficos desenhados à mão.",
    feedback: "Excelente domínio de funções afim e quadrática. Reveja função inversa." },
  { id: "ac6", title: "Mapa mental: Sistema solar", description: "Diagrama interativo das principais luas.", subject: "Ciências", difficulty: "Easy", xpReward: 90, deadline: "2026-05-23", status: "pending", teacher: "Patrícia Nogueira",
    instructions: "Construa um mapa mental cobrindo os 8 planetas e ao menos 5 luas relevantes." },
  { id: "ac7", title: "Leitura: Capítulo 'Vidas Secas'", description: "Resumo + análise da personagem Fabiano.", subject: "Literatura", difficulty: "Medium", xpReward: 170, deadline: "2026-05-21", status: "submitted", teacher: "Letícia Quintela",
    submission: "Resumo entregue com análise comparativa entre Fabiano e Sinhá Vitória." },
  { id: "ac8", title: "Pesquisa: Energias renováveis", description: "Relatório com 3 fontes citadas.", subject: "Geografia", difficulty: "Hard", xpReward: 260, deadline: "2026-05-28", status: "pending", teacher: "Eduardo Brandão",
    instructions: "Compare as matrizes energéticas do Brasil e da Alemanha. Cite ao menos 3 fontes acadêmicas." },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", title: "+150 XP", body: "Você completou a missão 'Desafio do dia'.", type: "xp", read: false, createdAt: "há 2h" },
  { id: "n2", title: "Nova conquista!", body: "Você desbloqueou 'Sequência de Fogo'.", type: "achievement", read: false, createdAt: "há 6h" },
  { id: "n3", title: "Feedback da Profa. Renata", body: "Ótima resolução no exercício de funções.", type: "feedback", read: false, createdAt: "ontem" },
  { id: "n4", title: "Missão semanal liberada", body: "Resolva 3 desafios de Matemática.", type: "mission", read: true, createdAt: "ontem" },
  { id: "n5", title: "Manutenção programada", body: "Plataforma em manutenção 23/05 02h-03h.", type: "system", read: true, createdAt: "2 dias" },
  { id: "n6", title: "+80 XP", body: "Você concluiu o Quiz de Frações.", type: "xp", read: true, createdAt: "2 dias" },
  { id: "n7", title: "Boss bimestral em 11 dias", body: "Prepare-se com a missão épica liberada.", type: "mission", read: false, createdAt: "há 3h" },
  { id: "n8", title: "Equipe subiu ao 2º lugar", body: "Dragões de Pitágoras avançaram no ranking.", type: "system", read: true, createdAt: "3 dias" },
  { id: "n9", title: "Feedback do Prof. Marcos", body: "Sua apresentação ficou muito clara, parabéns!", type: "feedback", read: true, createdAt: "4 dias" },
  { id: "n10", title: "Conquista perto de desbloquear", body: "'Mente Aberta' a 60% — falta XP em 2 matérias.", type: "achievement", read: false, createdAt: "há 30min" },
];

export const MOCK_TEAMS: Team[] = [
  { id: "t1", name: "Dragões de Pitágoras", emblem: "🐉", members: 6, xp: 24200, weeklyXp: 3200, motto: "Equações são nossa chama.",
    memberIds: ["s1", "s3", "s5", "s7", "s9", "s11"] },
  { id: "t2", name: "Fênix do Saber", emblem: "🦅", members: 5, xp: 21850, weeklyXp: 2810, motto: "Renascemos a cada desafio.",
    memberIds: ["s2", "s4", "s6", "s8", "s10"] },
  { id: "t3", name: "Lobos da Síntese", emblem: "🐺", members: 6, xp: 19940, weeklyXp: 2440, motto: "Caçamos respostas em alcateia.",
    memberIds: ["s12", "s13", "s14", "s15", "s1", "s2"] },
  { id: "t4", name: "Corujas Estrategistas", emblem: "🦉", members: 4, xp: 17220, weeklyXp: 2090, motto: "Pensamos antes de atacar.",
    memberIds: ["s4", "s8", "s12", "s14"] },
];

/* charts */
export const STUDENT_PERF_WEEK = [
  { day: "Seg", xp: 120, missions: 1 },
  { day: "Ter", xp: 240, missions: 2 },
  { day: "Qua", xp: 180, missions: 1 },
  { day: "Qui", xp: 380, missions: 3 },
  { day: "Sex", xp: 260, missions: 2 },
  { day: "Sáb", xp: 90, missions: 1 },
  { day: "Dom", xp: 50, missions: 0 },
];

export const CLASS_ENGAGEMENT = [
  { week: "S1", ativos: 24, entregas: 88 },
  { week: "S2", ativos: 27, entregas: 102 },
  { week: "S3", ativos: 25, entregas: 96 },
  { week: "S4", ativos: 29, entregas: 124 },
  { week: "S5", ativos: 30, entregas: 138 },
  { week: "S6", ativos: 31, entregas: 142 },
];

export const PLATFORM_GROWTH = [
  { month: "Jan", schools: 18, students: 1240, teachers: 92 },
  { month: "Fev", schools: 22, students: 1680, teachers: 121 },
  { month: "Mar", schools: 27, students: 2210, teachers: 158 },
  { month: "Abr", schools: 31, students: 2840, teachers: 196 },
  { month: "Mai", schools: 36, students: 3520, teachers: 232 },
];

export const STUDENT_SKILLS_RADAR = [
  { skill: "Matemática", value: 82 },
  { skill: "Português", value: 74 },
  { skill: "Ciências", value: 88 },
  { skill: "História", value: 66 },
  { skill: "Geografia", value: 71 },
  { skill: "Inglês", value: 79 },
];