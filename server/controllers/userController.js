const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

// Realizar login
const loginUser = async (req, res) => {
  const { email, senha } = req.body;
  console.log(`Tentativa de login: ${email}`);

  try {
    if (!JWT_SECRET) {
      console.error("ERRO: JWT_SECRET não definida no arquivo .env");
      return res.status(500).json({ mensagem: 'Erro de configuração do servidor (JWT)' });
    }

    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(400).json({ mensagem: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    const token = jwt.sign(
      { userId: usuario._id, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ mensagem: 'Login bem-sucedido', token, tipo: usuario.tipo, nome: usuario.nome, id: usuario._id });
  } catch (erro) {
    console.error("ERRO NO LOGIN:", erro);
    res.status(500).json({ mensagem: 'Erro no servidor', detalhe: erro.message });
  }
};

//Realizar registro
const registerUser = async (req, res) => {
  const { nome, email, senha, tipo, matricula } = req.body;
  console.log(`[Registro] Tentativa para: ${email}`);

  try {
    // Verificar se o mongoose está conectado
    if (require('mongoose').connection.readyState !== 1) {
      console.error("ERRO: Banco de dados não está conectado!");
      return res.status(500).json({ mensagem: 'Banco de dados offline. Tente novamente em instantes.' });
    }

    const userExistente = await User.findOne({ email });

    if (userExistente) {
      return res.status(400).json({ mensagem: 'Usuário já cadastrado' });
    }

    // Verificar matrícula duplicada para estudantes
    if (tipo === 'estudante' && matricula) {
      const matriculaExistente = await User.findOne({ matricula });
      if (matriculaExistente) {
        return res.status(400).json({ mensagem: 'Matrícula já cadastrada' });
      }
    }

    console.log("Gerando hash da senha...");
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = new User({
      nome,
      email,
      senha: senhaHash,
      tipo,
      matricula: tipo === 'estudante' ? matricula : undefined,
    });

    await novoUsuario.save();
    console.log(`✅ Usuário ${email} cadastrado com sucesso!`);

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (erro) {
    console.error("!!! ERRO CRÍTICO NO REGISTRO !!!");
    console.error("Mensagem:", erro.message);
    console.error("Stack:", erro.stack);
    res.status(500).json({ mensagem: 'Erro no servidor', detalhe: erro.message });
  }
};

// Buscar usuário por ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await User.findById(id).select('-senha');

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (erro) {
    console.error("ERRO AO BUSCAR USUÁRIO:", erro);
    res.status(500).json({ mensagem: 'Erro no servidor', detalhe: erro.message });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getUserById,
};
