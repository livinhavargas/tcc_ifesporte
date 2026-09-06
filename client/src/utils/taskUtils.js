/**
 * Utilitários para regras de negócio de Tarefas no IFesporte
 */

/**
 * Verifica se uma tarefa está expirada com base na data/hora de prazo e no fuso horário local.
 * - Tarefas sem prazo definido NÃO expiram.
 * - Se o prazo for uma data (YYYY-MM-DD), a tarefa é válida até 23:59:59.999 do respectivo dia.
 * - Se o prazo contiver horário específico, a expiração ocorre no minuto/segundo exato.
 * 
 * @param {Object} task 
 * @param {Date} [currentTime] Data de referência para comparação (default: new Date())
 * @returns {boolean} true se o prazo foi ultrapassado
 */
export const isTaskExpired = (task, currentTime = new Date()) => {
  if (!task || !task.prazo || typeof task.prazo !== 'string' || !task.prazo.trim()) {
    return false;
  }

  const prazoStr = task.prazo.trim();

  // Formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(prazoStr)) {
    const [year, month, day] = prazoStr.split('-').map(Number);
    // Válida até o final do dia (23:59:59.999) no fuso horário local do usuário
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    return currentTime.getTime() > endOfDay.getTime();
  }

  // Formato ISO ou com horário (ex: YYYY-MM-DDTHH:mm)
  const parsed = new Date(prazoStr);
  if (isNaN(parsed.getTime())) {
    return false;
  }

  return currentTime.getTime() > parsed.getTime();
};

/**
 * Retorna true se a tarefa estiver pendente e não-expirada
 * @param {Object} task 
 * @param {Date} [currentTime]
 * @returns {boolean}
 */
export const isTaskPending = (task, currentTime = new Date()) => {
  if (!task) return false;
  if (task.done) return false;
  return !isTaskExpired(task, currentTime);
};
