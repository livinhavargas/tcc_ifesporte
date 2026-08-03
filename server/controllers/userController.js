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

// Realizar registro
const registerUser = async (req, res) => {
  const { 
    nome, email, senha, tipo, 
    telefone, sexo, idade, turma, matricula, peso, altura, modalidades,
    codigoConvite, cpf, endereco, dataNascimento, nomeResponsavel, telefoneResponsavel,
    alergias, lesoesAnteriores, restricoesMedicas, numeroCamisa
  } = req.body;
  
  console.log(`[Registro] Tentativa para: ${email}, Tipo: ${tipo}`);

  try {
    // Verificar se o mongoose está conectado
    if (require('mongoose').connection.readyState !== 1) {
      console.error("ERRO: Banco de dados não está conectado!");
      return res.status(500).json({ mensagem: 'Banco de dados offline. Tente novamente em instantes.' });
    }

    // Backend validation for Treinador
    if (tipo === 'Treinador') {
      if (codigoConvite !== '123') {
        return res.status(400).json({ mensagem: 'Código de Acesso inválido para Treinador.' });
      }
    }

    const userExistente = await User.findOne({ email });

    if (userExistente) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
    }

    // Verificar matrícula duplicada para estudantes
    const matValida = matricula && matricula.trim() !== '' ? matricula.trim() : undefined;
    if (tipo === 'estudante' && matValida) {
      const matriculaExistente = await User.findOne({ matricula: matValida });
      if (matriculaExistente) {
        return res.status(400).json({ mensagem: 'Matrícula já cadastrada.' });
      }
    }

    console.log("Gerando hash da senha...");
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = new User({
      nome, email, senha: senhaHash, tipo, telefone, sexo, cpf, endereco,
      dataNascimento: dataNascimento === '' ? null : dataNascimento,
      nomeResponsavel, telefoneResponsavel,
      alergias, lesoesAnteriores, restricoesMedicas, numeroCamisa,
      matricula: tipo === 'estudante' ? matValida : undefined,
      esportes: tipo === 'estudante' ? (modalidades || []) : undefined,
      turma: tipo === 'estudante' ? turma : undefined,
      peso: (tipo === 'estudante' && peso !== '') ? peso : undefined,
      altura: (tipo === 'estudante' && altura !== '') ? altura : undefined,
      idade: (idade !== undefined && idade !== '') ? idade : undefined,
    });

    await novoUsuario.save();

    // Se for estudante, cria no Student
    if (tipo === 'estudante') {
      const novoEstudante = new Student({
        nome, email,
        matricula: matValida,
        esportes: modalidades || [],
        sexo: sexo || 'Feminino',
        idade: (idade !== undefined && idade !== '') ? idade : undefined,
        turma,
        peso: (peso !== undefined && peso !== '') ? peso : undefined,
        altura: (altura !== undefined && altura !== '') ? altura : undefined,
        telefone,
        cpf,
        endereco,
        dataNascimento: dataNascimento === '' ? null : dataNascimento,
        nomeResponsavel,
        telefoneResponsavel,
        alergias, lesoesAnteriores, restricoesMedicas, numeroCamisa,
        adicionadoPor: novoUsuario._id
      });
      await novoEstudante.save();
    }

    console.log(`✅ Usuário ${email} cadastrado com sucesso!`);
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (erro) {
    console.error("!!! ERRO CRÍTICO NO REGISTRO !!!");
    console.error("Mensagem:", erro.message);
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
        usuario.serie = estudante.turma || estudante.serie || '';
        usuario.turma = estudante.turma || estudante.serie || '';
        usuario.esportes = estudante.esportes || [];
        usuario.cpf = estudante.cpf || '';
        usuario.endereco = estudante.endereco || '';
        usuario.dataNascimento = estudante.dataNascimento ? estudante.dataNascimento.toISOString().split('T')[0] : '';
        usuario.contatoEmergencia = estudante.contatoEmergencia || '';
        usuario.nomeResponsavel = estudante.nomeResponsavel || '';
        usuario.telefoneResponsavel = estudante.telefoneResponsavel || '';
        usuario.alergias = estudante.alergias || '';
        usuario.lesoesAnteriores = estudante.lesoesAnteriores || '';
        usuario.restricoesMedicas = estudante.restricoesMedicas || '';
        usuario.numeroCamisa = estudante.numeroCamisa || '';
        
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
  const { 
    nome, email, telefone, peso, altura, foto, idade, serie, turma, esportes, sexo, 
    matricula, cpf, endereco, dataNascimento, contatoEmergencia, nomeResponsavel, telefoneResponsavel,
    alergias, lesoesAnteriores, restricoesMedicas, numeroCamisa
  } = req.body;
  
  try {
    const usuario = await User.findById(id);
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

    // Buscar o estudante usando os dados originais do usuário ANTES de alterar o usuário
    let estudante = null;
    if (usuario.tipo === 'estudante') {
      const queryOriginal = usuario.matricula ? { matricula: usuario.matricula } : { email: usuario.email };
      estudante = await Student.findOne(queryOriginal);
      // Fallback usando o ID do usuário (adicionadoPor) caso o query original falhe
      if (!estudante) {
        estudante = await Student.findOne({ adicionadoPor: usuario._id });
      }
      // Último fallback se tudo falhar, tenta pelo email atual
      if (!estudante) {
        estudante = await Student.findOne({ email: usuario.email });
      }
    }

    if (nome) usuario.nome = nome;
    if (email) usuario.email = email;
    if (foto) usuario.foto = foto;
    if (esportes) usuario.esportes = esportes;
    if (sexo) usuario.sexo = sexo;
    if (matricula !== undefined) usuario.matricula = matricula === '' ? undefined : matricula;
    if (cpf !== undefined) usuario.cpf = cpf;
    if (endereco !== undefined) usuario.endereco = endereco;
    if (dataNascimento !== undefined) usuario.dataNascimento = dataNascimento === '' ? null : dataNascimento;
    if (telefone !== undefined) usuario.telefone = telefone;
    if (nomeResponsavel !== undefined) usuario.nomeResponsavel = nomeResponsavel;
    if (telefoneResponsavel !== undefined) usuario.telefoneResponsavel = telefoneResponsavel;
    if (alergias !== undefined) usuario.alergias = alergias;
    if (lesoesAnteriores !== undefined) usuario.lesoesAnteriores = lesoesAnteriores;
    if (restricoesMedicas !== undefined) usuario.restricoesMedicas = restricoesMedicas;
    if (numeroCamisa !== undefined) usuario.numeroCamisa = numeroCamisa;
    
    await usuario.save();

    if (usuario.tipo === 'estudante' && estudante) {
      if (nome) estudante.nome = nome;
      if (email) estudante.email = email;
      if (telefone !== undefined) estudante.telefone = telefone;
      if (peso !== undefined) estudante.peso = peso === '' ? null : peso;
      if (altura !== undefined) estudante.altura = altura === '' ? null : altura;
      if (idade !== undefined) estudante.idade = idade === '' ? null : idade;
      if (serie !== undefined) estudante.serie = serie;
      if (turma !== undefined) estudante.turma = turma;
      if (foto) estudante.foto = foto;
      if (esportes) estudante.esportes = esportes;
      if (sexo) estudante.sexo = sexo;
      if (matricula !== undefined) estudante.matricula = matricula === '' ? undefined : matricula;
      if (cpf !== undefined) estudante.cpf = cpf;
      if (endereco !== undefined) estudante.endereco = endereco;
      if (dataNascimento !== undefined) estudante.dataNascimento = dataNascimento === '' ? null : dataNascimento;
      if (contatoEmergencia !== undefined) estudante.contatoEmergencia = contatoEmergencia;
      if (nomeResponsavel !== undefined) estudante.nomeResponsavel = nomeResponsavel;
      if (telefoneResponsavel !== undefined) estudante.telefoneResponsavel = telefoneResponsavel;
      if (alergias !== undefined) estudante.alergias = alergias;
      if (lesoesAnteriores !== undefined) estudante.lesoesAnteriores = lesoesAnteriores;
      if (restricoesMedicas !== undefined) estudante.restricoesMedicas = restricoesMedicas;
      if (numeroCamisa !== undefined) estudante.numeroCamisa = numeroCamisa;
      
      await estudante.save();
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
