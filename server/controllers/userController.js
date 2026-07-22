const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
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

    res.json({ mensagem: 'Login bem-sucedido', token, tipo: usuario.tipo, nome: usuario.nome, email: usuario.email, id: usuario._id, foto: usuario.foto });
  } catch (erro) {
    console.error("ERRO NO LOGIN:", erro);
    res.status(500).json({ mensagem: 'Erro no servidor', detalhe: erro.message });
  }
};

//Realizar registro
const registerUser = async (req, res) => {
  const { nome, email, senha, tipo, matricula, adminCode, esportes, sexo } = req.body;
  console.log(`[Registro] Tentativa para: ${email}, Tipo: ${tipo}`);

  try {
    // Verificar código administrativo
    if (tipo === 'admin') {
      const validAdminCode = '123';
      if (adminCode !== validAdminCode) {
        return res.status(403).json({ mensagem: 'Código administrativo inválido' });
      }
    }

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
    const matValida = matricula && matricula.trim() !== '' ? matricula.trim() : undefined;
    if (tipo === 'estudante' && matValida) {
      const matriculaExistente = await User.findOne({ matricula: matValida });
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
      matricula: tipo === 'estudante' ? matValida : undefined,
      esportes: tipo === 'estudante' ? (esportes || []) : undefined,
    });

    await novoUsuario.save();

    // Se for estudante, cria automaticamente o perfil na tabela Student
    if (tipo === 'estudante') {
      const novoEstudante = new Student({
        nome,
        email,
        matricula: matValida,
        esportes: esportes || [],
        serie: '1A',
        sexo: sexo || 'Feminino',
        adicionadoPor: novoUsuario._id
      });
      await novoEstudante.save();
    }

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
    let usuario = await User.findById(id).select('-senha').lean();

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    if (usuario.tipo === 'estudante') {
      const query = usuario.matricula ? { matricula: usuario.matricula } : { email: usuario.email };
      const estudante = await Student.findOne(query).lean();
      if (estudante) {
        usuario.telefone = estudante.telefone || '';
        usuario.peso = estudante.peso || '';
        usuario.altura = estudante.altura || '';
        usuario.idade = estudante.idade || '';
        usuario.serie = estudante.serie || '';
        usuario.esportes = estudante.esportes || [];
        if (estudante.peso && estudante.altura) {
           usuario.imc = (estudante.peso / (estudante.altura * estudante.altura)).toFixed(2);
        }
      }
    }

    res.json(usuario);
  } catch (erro) {
    console.error("ERRO AO BUSCAR USUÁRIO:", erro);
    res.status(500).json({ mensagem: 'Erro no servidor', detalhe: erro.message });
  }
};

// Atualizar usuário
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, peso, altura, foto, idade, serie, esportes } = req.body;
  
  try {
    const usuario = await User.findById(id);
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

    if (nome) usuario.nome = nome;
    if (email) usuario.email = email;
    if (foto) usuario.foto = foto;
    if (esportes) usuario.esportes = esportes;
    await usuario.save();

    if (usuario.tipo === 'estudante') {
      const query = usuario.matricula ? { matricula: usuario.matricula } : { email: usuario.email };
      const estudante = await Student.findOne(query);
      if (estudante) {
        if (nome) estudante.nome = nome;
        if (email) estudante.email = email;
        if (telefone !== undefined) estudante.telefone = telefone;
        if (peso !== undefined) estudante.peso = peso;
        if (altura !== undefined) estudante.altura = altura;
        if (idade !== undefined) estudante.idade = idade;
        if (serie !== undefined) estudante.serie = serie;
        if (foto) estudante.foto = foto;
        if (esportes) estudante.esportes = esportes;
        await estudante.save();
      }
    }
    res.json({ mensagem: 'Perfil atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ mensagem: error.message });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getUserById,
  updateUser,
};
