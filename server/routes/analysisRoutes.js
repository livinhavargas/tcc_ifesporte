const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', analysisController.getAllAnalyses);
router.post('/', analysisController.createAnalysis);
router.get('/student/:studentId', analysisController.getAnalysisByStudent);

module.exports = router;
