const express = require('express');
const router = express.Router();
const { getAllCronogramas, createCronograma, deleteCronograma, updateCronograma } = require('../controllers/cronogramaController');
const protect = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAllCronogramas)
  .post(protect, createCronograma);

router.route('/:id')
  .put(protect, updateCronograma)
  .delete(protect, deleteCronograma);

module.exports = router;
