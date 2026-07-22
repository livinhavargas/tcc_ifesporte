const express = require('express');
const router = express.Router();
const { getAllCronogramas, createCronograma, deleteCronograma } = require('../controllers/cronogramaController');
const protect = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAllCronogramas)
  .post(protect, createCronograma);

router.route('/:id')
  .delete(protect, deleteCronograma);

module.exports = router;
