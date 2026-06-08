import { q } from "../db.js"; // 🌟 Mantendo a sua função de banco padronizada

export const missionService = {
  /**
   * Permite que um aluno aceite/entre em uma missão ativa.
   */
  async joinMission(missionId: string, studentId: string) {
    // 1. Busca os dados iniciais da missão (HP do monstro e total de perguntas)
    // NOTA: Confirme se na tabela 'missions' os nomes são 'monster_hp' e 'total_steps' (ou 'total_questions')
    const missions = await q(
      "SELECT monster_hp, total_steps FROM missions WHERE id = $1",
      [missionId]
    );

    if (missions.length === 0) {
      throw new Error("MISSION_NOT_FOUND");
    }

    const { monster_hp, total_steps } = missions[0];

    // 2. Verifica se o aluno já aceitou essa missão anteriormente para não duplicar
    const existingJoin = await q(
      "SELECT id FROM student_missions WHERE student_id = $1 AND mission_id = $2",
      [studentId, missionId]
    );

    if (existingJoin.length > 0) {
      throw new Error("ALREADY_JOINED");
    }

    // 3. Insere o registro na tabela student_missions (com progresso 0 e HP do aluno em 100)
    const newJoin = await q(`
      INSERT INTO student_missions (
        student_id, 
        mission_id, 
        progress, 
        total, 
        status, 
        current_monster_hp, 
        current_student_hp
      ) VALUES ($1, $2, 0, $3, 'IN_PROGRESS', $4, 100) 
      RETURNING *
    `, [studentId, missionId, total_steps, monster_hp]);

    return newJoin[0];
  },

  /**
   * Atualiza o progresso das missões de um aluno baseado em uma ação específica.
   */
  async trackAction(studentId: string, actionType: string) {
    // 1. Busca todos os progressos ativos usando SQL Puro (com JOIN entre as tabelas)
    const activeMissions = await q(`
      SELECT sm.*, m.title, m.xp_reward 
      FROM student_missions sm
      JOIN missions m ON sm.mission_id = m.id
      WHERE sm.student_id = $1 AND sm.status = 'IN_PROGRESS' AND m.type = $2
    `, [studentId, actionType]);

    for (const studentMission of activeMissions) {
      const nextProgress = studentMission.progress + 1;
      const isCompleted = nextProgress >= studentMission.total;
      const status = isCompleted ? "COMPLETED" : "IN_PROGRESS";
      const finalProgress = Math.min(nextProgress, studentMission.total);

      // 2. Atualiza o progresso na tabela 'student_missions'
      await q(`
        UPDATE student_missions 
        SET progress = $1, status = $2 
        WHERE id = $3
      `, [finalProgress, status, studentMission.id]);

      // 3. Se completou a missão, aplica as recompensas de XP e gera a notificação
      if (isCompleted) {
        await q(`
          UPDATE students 
          SET xp = xp + $1 
          WHERE id = $2
        `, [studentMission.xp_reward, studentId]);
        
        await q(`
          INSERT INTO notifications (student_id, title, message) 
          VALUES ($1, $2, $3)
        `, [
          studentId, 
          "⚔️ Missão Cumprida!", 
          `Você completou a missão "${studentMission.title}" e ganhou +${studentMission.xp_reward} XP!`
        ]);
      }
    }
  }
};