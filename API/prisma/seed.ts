import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// 🔌 Inicialização correta para o Prisma 7 usando Driver Adapters (lendo do seu .env)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando a população do banco de dados...');

  // 1. Cria um Usuário/Professor de teste
  const teacherUser = await prisma.user.upsert({
    where: { email: 'professor@classrpg.com' },
    update: {},
    create: {
      email: 'professor@classrpg.com',
      password: 'senha_criptografada_aqui', // Em produção, use bcrypt
      name: 'Mestre Ada',
      role: 'teacher',
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { id: teacherUser.id },
    update: {},
    create: {
      id: teacherUser.id,
      avatar: 'wizard_avatar.png',
      subject: 'Programação Web',
      classes: ['3º Ano A', '3º Ano B'],
    },
  });

  // 2. Cria uma Missão/Monstro vinculada a esse professor
  const mission = await prisma.mission.create({
    data: {
      title: 'Chefão do HTTP',
      description: 'Um monstro terrível que ataca usando requisições malformadas! Responda corretamente para derrotá-lo.',
      type: 'challenge',
      difficulty: 'Medium',
      xp_reward: 150,
      gold_reward: 50,
      monster_hp: 100,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expira em 7 dias
      teacher_id: teacher.id,
    },
  });

  // 3. Vincula as perguntas de combate a essa missão
  await prisma.question.createMany({
    data: [
      {
        mission_id: mission.id,
        statement: 'Qual método HTTP é utilizado para ATUALIZAR completamente um recurso no servidor?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correct_index: 2, // PUT é a terceira opção (índice 2)
        damage: 40,
      },
      {
        mission_id: mission.id,
        statement: 'O que significa o status code 404 retornado por uma API Express?',
        options: ['Internal Server Error', 'Not Found', 'Unauthorized', 'Bad Request'],
        correct_index: 1, // Not Found (índice 1)
        damage: 30,
      },
      {
        mission_id: mission.id,
        statement: 'Qual middleware nativo do Express é usado para fazer o parse de corpos de requisição em JSON?',
        options: ['express.json()', 'express.urlencoded()', 'cors()', 'morgan()'],
        correct_index: 0, // express.json() (índice 0)
        damage: 30,
      },
    ],
  });

  // 4. Cria um Aluno de teste para você usar no login/combate
  const studentUser = await prisma.user.upsert({
    where: { email: 'aluno@classrpg.com' },
    update: {},
    create: {
      email: 'aluno@classrpg.com',
      password: 'senha_aluno_aqui',
      name: 'Evair Herói',
      role: 'student',
    },
  });

  await prisma.student.upsert({
    where: { id: studentUser.id },
    update: {},
    create: {
      id: studentUser.id,
      classroom: '3º Ano A',
      max_hp: 100,
      current_hp: 100,
      gold: 0,
      xp: 0,
    },
  });

  console.log('✅ Banco de dados populado com sucesso!');
  console.log(`📝 ID do Estudante: ${studentUser.id}`);
  console.log(`👾 ID da Missão (Monstro): ${mission.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // 🚪 Fecha as conexões do pool e do prisma para o terminal não ficar travado
    await prisma.$disconnect();
    await pool.end();
  });