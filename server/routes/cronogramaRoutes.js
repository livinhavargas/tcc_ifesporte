const express = require('express');
const router = express.Router();
const { getAllCronogramas, createCronograma, deleteCronograma, updateCronograma, duplicateCronograma } = require('../controllers/cronogramaController');
const protect = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAllCronogramas)
  .post(protect, createCronograma);

router.route('/:id')
  .put(protect, updateCronograma)
  .delete(protect, deleteCronograma);

router.post('/:id/duplicate', protect, duplicateCronograma);

module.exports = router;
