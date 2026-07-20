const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Rota para inicializar modalidades (sem autenticação para primeira execução)
router.post('/initialize', sportController.initializeSports);

router.use(authMiddleware);

router.get('/', sportController.getAllSports);
router.get('/:id', sportController.getSportById);
router.post('/', adminMiddleware, sportController.createSport);
router.put('/:id', adminMiddleware, sportController.updateSport);
router.delete('/:id', adminMiddleware, sportController.deleteSport);

module.exports = router;
