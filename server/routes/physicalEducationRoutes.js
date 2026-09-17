const express = require('express');
const router = express.Router();
const physicalEducationController = require('../controllers/physicalEducationController');
const authMiddleware = require('../middleware/authMiddleware');

// Consulta da próxima aula de Educação Física (Estudante/Usuário)
router.get('/proxima-aula', authMiddleware, physicalEducationController.getMyNextClass);

// Rotas de Educação Física (autenticadas para treinadores e staff)
router.get('/cursos', authMiddleware, physicalEducationController.getCoursesSummary);
router.get('/cursos/:cursoSlug', authMiddleware, physicalEducationController.getTurmasByCourse);
router.get('/turma/:id', authMiddleware, physicalEducationController.getTurmaDetail);

// Configuração de horários semanais
router.put('/turma/:id/horarios', authMiddleware, physicalEducationController.updateSchedules);

// CRUD de Relatórios de Aulas
router.post('/turma/:id/relatorios', authMiddleware, physicalEducationController.addReport);
router.put('/turma/:id/relatorios/:relatorioId', authMiddleware, physicalEducationController.updateReport);
router.delete('/turma/:id/relatorios/:relatorioId', authMiddleware, physicalEducationController.deleteReport);

module.exports = router;
