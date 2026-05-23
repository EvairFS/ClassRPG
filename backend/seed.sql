-- USERS (for login)
-- Passwords are bcrypt hashes of '123456'
INSERT INTO users (id, email, password, role, name) VALUES
  ('s1', 'ana.souza@classrpg.io', '$2b$10$PU4trYLd7zQRIFlDXU96..q1hRvLl4iuHj5LdTDATrIkdY8ZIiaKe', 'student', 'Ana Souza'),
  ('t1', 'renata@classrpg.io', '$2b$10$PU4trYLd7zQRIFlDXU96..q1hRvLl4iuHj5LdTDATrIkdY8ZIiaKe', 'teacher', 'Renata Vasconcelos')
ON CONFLICT (id) DO NOTHING;

-- ACHIEVEMENTS
INSERT INTO achievements (id, name, description, icon, rarity) VALUES
  ('a1', 'Primeiro Passo', 'Complete sua primeira atividade', 'sparkles', 'common'),
  ('a2', 'Sequência de Fogo', '7 dias seguidos de atividades', 'flame', 'rare'),
  ('a3', 'Estratega', 'Vença 5 desafios consecutivos', 'swords', 'epic'),
  ('a4', 'Mente Aberta', 'Conquiste XP em 5 matérias', 'brain', 'rare'),
  ('a5', 'Lenda Acadêmica', 'Alcance o topo do ranking mensal', 'crown', 'legendary'),
  ('a6', 'Mentor', 'Ajude 10 colegas em desafios', 'users', 'epic')
ON CONFLICT (id) DO NOTHING;

-- TEAMS
INSERT INTO teams (id, name, emblem, members, xp, weekly_xp, motto) VALUES
  ('t1', 'Dragões de Pitágoras', '🐉', 6, 24200, 3200, 'Equações são nossa chama.'),
  ('t2', 'Fênix do Saber', '🦅', 5, 21850, 2810, 'Renascemos a cada desafio.'),
  ('t3', 'Lobos da Síntese', '🐺', 6, 19940, 2440, 'Caçamos respostas em alcateia.'),
  ('t4', 'Corujas Estrategistas', '🦉', 4, 17220, 2090, 'Pensamos antes de atacar.')
ON CONFLICT (id) DO NOTHING;

-- STUDENTS
INSERT INTO students (id, name, avatar, email, classroom, xp, level, patent, streak, missions_completed, activities_completed, team_id) VALUES
  ('s1', 'Ana Souza', 'AS', 'ana.souza@classrpg.io', '9º Ano A', 7840, 32, 'Lenda da Turma', 5, 19, 36, 't1'),
  ('s2', 'Bruno Lima', 'BL', 'bruno.lima@classrpg.io', '9º Ano B', 7510, 31, 'Lenda da Turma', 8, 26, 44, 't2'),
  ('s3', 'Carla Mendes', 'CM', 'carla.mendes@classrpg.io', '9º Ano A', 7390, 30, 'Lenda da Turma', 11, 33, 52, 't1'),
  ('s4', 'Diego Rocha', 'DR', 'diego.rocha@classrpg.io', '9º Ano B', 6930, 28, 'Mestre Estratégico', 2, 40, 60, 't2'),
  ('s5', 'Elena Costa', 'EC', 'elena.costa@classrpg.io', '9º Ano A', 6640, 27, 'Mestre Estratégico', 5, 47, 68, 't1'),
  ('s6', 'Felipe Alves', 'FA', 'felipe.alves@classrpg.io', '9º Ano B', 6430, 26, 'Mestre Estratégico', 8, 54, 76, 't2'),
  ('s7', 'Gabi Martins', 'GM', 'gabi.martins@classrpg.io', '9º Ano A', 6090, 25, 'Mestre Estratégico', 11, 12, 29, 't1'),
  ('s8', 'Hugo Pereira', 'HP', 'hugo.pereira@classrpg.io', '9º Ano B', 5850, 24, 'Mestre Estratégico', 14, 19, 37, 't2'),
  ('s9', 'Isabela Cruz', 'IC', 'isabela.cruz@classrpg.io', '9º Ano A', 5530, 23, 'Guerreiro Acadêmico', 5, 26, 45, 't1'),
  ('s10', 'João Pedro', 'JP', 'joao.pedro@classrpg.io', '9º Ano B', 5380, 22, 'Guerreiro Acadêmico', 8, 33, 53, 't2'),
  ('s11', 'Karina Dias', 'KD', 'karina.dias@classrpg.io', '9º Ano A', 4960, 20, 'Guerreiro Acadêmico', 11, 40, 61, 't1'),
  ('s12', 'Lucas Oliveira', 'LO', 'lucas.oliveira@classrpg.io', '9º Ano B', 4650, 19, 'Guerreiro Acadêmico', 14, 47, 69, 't3'),
  ('s13', 'Marina Faria', 'MF', 'marina.faria@classrpg.io', '9º Ano A', 4410, 18, 'Guerreiro Acadêmico', 5, 54, 77, 't3'),
  ('s14', 'Nicolas Reis', 'NR', 'nicolas.reis@classrpg.io', '9º Ano B', 4190, 17, 'Guerreiro Acadêmico', 8, 12, 28, 't3'),
  ('s15', 'Olívia Borges', 'OB', 'olivia.borges@classrpg.io', '9º Ano A', 3820, 16, 'Guerreiro Acadêmico', 11, 19, 36, 't3')
ON CONFLICT (id) DO NOTHING;

-- STUDENT_ACHIEVEMENTS
INSERT INTO student_achievements (student_id, achievement_id, earned, earned_at, progress) VALUES
  ('s1', 'a1', true, '2026-02-10', NULL),
  ('s1', 'a2', true, '2026-03-02', NULL),
  ('s1', 'a3', true, '2026-04-21', NULL),
  ('s1', 'a4', false, NULL, 60),
  ('s1', 'a5', false, NULL, 40),
  ('s1', 'a6', false, NULL, 20),
  ('s2', 'a1', true, '2026-01-15', NULL),
  ('s2', 'a2', true, '2026-02-20', NULL),
  ('s3', 'a1', true, '2026-02-10', NULL),
  ('s3', 'a2', true, '2026-03-02', NULL),
  ('s3', 'a3', true, '2026-04-21', NULL)
ON CONFLICT (student_id, achievement_id) DO NOTHING;

-- TEACHERS
INSERT INTO teachers (id, name, avatar, email, subject, classes, students_count, status) VALUES
  ('t1', 'Renata Vasconcelos', 'RV', 'renata@classrpg.io', 'Matemática', '{9A,9B}', 62, 'active'),
  ('t2', 'Marcos Tavares', 'MT', 'marcos@classrpg.io', 'História', '{9A}', 31, 'active'),
  ('t3', 'Patrícia Nogueira', 'PN', 'patricia@classrpg.io', 'Biologia', '{8A,8B,9A}', 94, 'active'),
  ('t4', 'Eduardo Brandão', 'EB', 'eduardo@classrpg.io', 'Física', '{9B}', 28, 'pending'),
  ('t5', 'Letícia Quintela', 'LQ', 'leticia@classrpg.io', 'Literatura', '{7A}', 33, 'pending')
ON CONFLICT (id) DO NOTHING;

-- MISSIONS
INSERT INTO missions (id, title, description, type, difficulty, xp_reward, deadline, status, progress, total) VALUES
  ('m1', 'Conquiste 100 XP hoje', 'Complete qualquer combinação de atividades.', 'daily', 'Easy', 50, '2026-05-21T23:59', 'in_progress', 65, 100),
  ('m2', 'Resolva 3 desafios de matemática', 'Equações, funções e geometria analítica.', 'weekly', 'Medium', 220, '2026-05-25T23:59', 'in_progress', 2, 3),
  ('m3', 'Domine a Revolução Industrial', 'Leia o material e faça o quiz épico.', 'special', 'Hard', 400, '2026-05-28T23:59', 'available', 0, 1),
  ('m4', 'Boss: Prova bimestral', 'Atinja 80% na simulação bimestral.', 'event', 'Epic', 900, '2026-06-01T18:00', 'available', 0, 1),
  ('m5', 'Desafie um colega', 'Vença um duelo 1v1 de conhecimento.', 'challenge', 'Medium', 150, '2026-05-22T23:59', 'completed', 1, 1)
ON CONFLICT (id) DO NOTHING;

-- ACTIVITIES
INSERT INTO activities (id, title, description, subject, difficulty, xp_reward, deadline, status, grade, instructions, submission, feedback, teacher) VALUES
  ('ac1', 'Quiz: Frações', '10 questões de operações com frações.', 'Matemática', 'Easy', 80, '2026-05-22', 'pending', NULL, 'Resolva as 10 questões abaixo no campo de resposta. Mostre os cálculos quando necessário. Tempo estimado: 25 minutos.', NULL, NULL, 'Renata Vasconcelos'),
  ('ac2', 'Redação: Mundo em 2050', 'Texto dissertativo de 25 linhas.', 'Português', 'Medium', 160, '2026-05-24', 'pending', NULL, 'Produza um texto dissertativo-argumentativo de 25 linhas sobre os desafios da humanidade em 2050.', NULL, NULL, 'Letícia Quintela'),
  ('ac3', 'Lab virtual: pH', 'Simulador de soluções ácido-base.', 'Química', 'Hard', 240, '2026-05-26', 'submitted', NULL, 'Use o simulador, varie a concentração e registre os valores de pH obtidos.', 'Relatório completo enviado com prints do simulador e tabela de resultados.', NULL, 'Patrícia Nogueira'),
  ('ac4', 'Apresentação: Guerra Fria', 'Slides em grupo (3 alunos).', 'História', 'Epic', 420, '2026-05-30', 'pending', NULL, 'Em grupos de 3, prepare slides cobrindo causas, fases e consequências da Guerra Fria.', NULL, NULL, 'Marcos Tavares'),
  ('ac5', 'Listas de exercícios — Funções', 'Lista 04, capítulo 7.', 'Matemática', 'Medium', 140, '2026-05-19', 'graded', 92, NULL, 'Resoluções entregues no prazo, com gráficos desenhados à mão.', 'Excelente domínio de funções afim e quadrática. Reveja função inversa.', 'Renata Vasconcelos'),
  ('ac6', 'Mapa mental: Sistema solar', 'Diagrama interativo das principais luas.', 'Ciências', 'Easy', 90, '2026-05-23', 'pending', NULL, 'Construa um mapa mental cobrindo os 8 planetas e ao menos 5 luas relevantes.', NULL, NULL, 'Patrícia Nogueira'),
  ('ac7', 'Leitura: Capítulo Vidas Secas', 'Resumo + análise da personagem Fabiano.', 'Literatura', 'Medium', 170, '2026-05-21', 'submitted', NULL, NULL, 'Resumo entregue com análise comparativa entre Fabiano e Sinhá Vitória.', NULL, 'Letícia Quintela'),
  ('ac8', 'Pesquisa: Energias renováveis', 'Relatório com 3 fontes citadas.', 'Geografia', 'Hard', 260, '2026-05-28', 'pending', NULL, 'Compare as matrizes energéticas do Brasil e da Alemanha. Cite ao menos 3 fontes acadêmicas.', NULL, NULL, 'Eduardo Brandão')
ON CONFLICT (id) DO NOTHING;

-- NOTIFICATIONS
INSERT INTO notifications (id, title, body, type, read, created_at) VALUES
  ('n1', '+150 XP', 'Você completou a missão Desafio do dia.', 'xp', false, 'há 2h'),
  ('n2', 'Nova conquista!', 'Você desbloqueou Sequência de Fogo.', 'achievement', false, 'há 6h'),
  ('n3', 'Feedback da Profa. Renata', 'Ótima resolução no exercício de funções.', 'feedback', false, 'ontem'),
  ('n4', 'Missão semanal liberada', 'Resolva 3 desafios de Matemática.', 'mission', true, 'ontem'),
  ('n5', 'Manutenção programada', 'Plataforma em manutenção 23/05 02h-03h.', 'system', true, '2 dias'),
  ('n6', '+80 XP', 'Você concluiu o Quiz de Frações.', 'xp', true, '2 dias'),
  ('n7', 'Boss bimestral em 11 dias', 'Prepare-se com a missão épica liberada.', 'mission', false, 'há 3h'),
  ('n8', 'Equipe subiu ao 2º lugar', 'Dragões de Pitágoras avançaram no ranking.', 'system', true, '3 dias'),
  ('n9', 'Feedback do Prof. Marcos', 'Sua apresentação ficou muito clara, parabéns!', 'feedback', true, '4 dias'),
  ('n10', 'Conquista perto de desbloquear', 'Mente Aberta a 60% — falta XP em 2 matérias.', 'achievement', false, 'há 30min')
ON CONFLICT (id) DO NOTHING;

-- TEAM MEMBERS
INSERT INTO team_members (team_id, student_id) VALUES
  ('t1', 's1'), ('t1', 's3'), ('t1', 's5'), ('t1', 's7'), ('t1', 's9'), ('t1', 's11'),
  ('t2', 's2'), ('t2', 's4'), ('t2', 's6'), ('t2', 's8'), ('t2', 's10'),
  ('t3', 's12'), ('t3', 's13'), ('t3', 's14'), ('t3', 's15'), ('t3', 's1'), ('t3', 's2'),
  ('t4', 's4'), ('t4', 's8'), ('t4', 's12'), ('t4', 's14')
ON CONFLICT (team_id, student_id) DO NOTHING;