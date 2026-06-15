
const adminMiddleware = (req, res, next) => {
  if (req.userTipo !== 'admin') {
    return res.status(403).json({ mensagem: 'Acesso negado: Apenas administradores podem acessar este recurso.' });
  }
  next();
};

module.exports = adminMiddleware;
