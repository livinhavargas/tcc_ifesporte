const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getUserById, updateUser } = require('../controllers/userController');

//Rotas de login e registro. Aqui também daria pra colocar rotas para exibição do perfil, aluno.
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);

module.exports = router;
