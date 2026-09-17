const express = require('express');
const router = express.Router();
const physicalAssessmentController = require('../controllers/physicalAssessmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/student/:studentId', physicalAssessmentController.getByStudent);
router.get('/:id', physicalAssessmentController.getById);
router.post('/', physicalAssessmentController.create);
router.put('/:id', physicalAssessmentController.update);
router.delete('/:id', physicalAssessmentController.delete);

module.exports = router;
