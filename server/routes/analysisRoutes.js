const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', analysisController.getAllAnalyses);
router.post('/', analysisController.createAnalysis);
router.get('/student/:studentId', analysisController.getAnalysisByStudent);
router.get('/:id', analysisController.getAnalysisById);
router.put('/:id', analysisController.updateAnalysis);
router.delete('/:id', analysisController.deleteAnalysis);

module.exports = router;
