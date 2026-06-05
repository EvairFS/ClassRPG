import { q } from "../db.js"; // 🌟 ALTERADO: Usamos a mesma função de banco do resto do app

export const missionService = {
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
        // No seu projeto a tabela se chama 'students' (como vimos em students.ts)
        await q(`
          UPDATE students 
          SET xp = xp + $1 
          WHERE id = $2
        `, [studentMission.xp_reward, studentId]);
        
        // Cria o registro de notificação para o front-end ler
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