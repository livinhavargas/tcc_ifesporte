const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getUserById, updateUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

//Rotas de login e registro. Aqui também daria pra colocar rotas para exibição do perfil, aluno.
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);

module.exports = router;
