const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  getUserById,
  updateUser,
  deleteUserPhoto
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas de autenticação, registro e verificação de e-mail
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', authMiddleware, resendVerificationEmail);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id/foto', authMiddleware, deleteUserPhoto);
router.delete('/:id/photo', authMiddleware, deleteUserPhoto);

module.exports = router;
