const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { JWT_SECRET } = require('../config');
const { 
  validatePosicoesPorModalidade, 
  sanitizePosicoesPorModalidade 
} = require('../utils/sportPositions');

const mapLegacyToNewModality = (mod) => {
  const legacyMap = {
    // Atletismo - Corridas
    '100m rasos': 'Atletismo - Corridas - 100m',
    '200m rasos': 'Atletismo - Corridas - 200m',
    '400m rasos': 'Atletismo - Corridas - 400m',
    '800m': 'Atletismo - Corridas - 800m',
    '1500m': 'Atletismo - Corridas - 1500m',
    '3000m': 'Atletismo - Corridas - 3000m',
    '3000m rasos': 'Atletismo - Corridas - 3000m',
    '5000m': 'Atletismo - Corridas - 5000m',
    'Revezamento 4x100': 'Atletismo - Corridas - Revezamento 4x100',
    'Revezamento 4x400': 'Atletismo - Corridas - Revezamento 4x400',
    'Revezamento 100m': 'Atletismo - Corridas - Revezamento 4x100',
    'Revezamento 400m': 'Atletismo - Corridas - Revezamento 4x400',
    'Revezamento 100': 'Atletismo - Corridas - Revezamento 4x100',
    'Revezamento 400': 'Atletismo - Corridas - Revezamento 4x400',
    'Atletismo - Corridas - Revezamento 100m': 'Atletismo - Corridas - Revezamento 4x100',
    'Atletismo - Corridas - Revezamento 400m': 'Atletismo - Corridas - Revezamento 4x400',
    'Pentatlo': 'Atletismo - Corridas - Pentatlo',
    'Pentatlo em Corrida': 'Atletismo - Corridas - Pentatlo',
    'Pentatlo em Corridas': 'Atletismo - Corridas - Pentatlo',
    'Atletismo - Corridas - Pentatlo em Corrida': 'Atletismo - Corridas - Pentatlo',
    '100m com Barreiras': 'Atletismo - Corridas - 100m com Barreiras',
    '110m com Barreiras': 'Atletismo - Corridas - 110m com Barreiras',
    'Corridas - 100m rasos': 'Atletismo - Corridas - 100m',
    'Corridas - 200m rasos': 'Atletismo - Corridas - 200m',
    'Corridas - 400m rasos': 'Atletismo - Corridas - 400m',
    'Corridas - 800m': 'Atletismo - Corridas - 800m',
    'Corridas - 1500m': 'Atletismo - Corridas - 1500m',
    'Corridas - 3000m': 'Atletismo - Corridas - 3000m',
    'Corridas - 5000m': 'Atletismo - Corridas - 5000m',
    'Corridas - Revezamento 4x100': 'Atletismo - Corridas - Revezamento 4x100',
    'Corridas - Revezamento 4x400': 'Atletismo - Corridas - Revezamento 4x400',
    'Corridas - Revezamento 100m': 'Atletismo - Corridas - Revezamento 4x100',
    'Corridas - Revezamento 400m': 'Atletismo - Corridas - Revezamento 4x400',
    
    // Atletismo - Saltos
    'Salto em Distância': 'Atletismo - Saltos - Salto em Distância',
    'Salto em Altura': 'Atletismo - Saltos - Salto em Altura',
    'Salto Triplo': 'Atletismo - Saltos - Salto Triplo',
    'Salto com Vara': 'Atletismo - Saltos - Salto com Vara',
    'Saltos - Salto em Distância': 'Atletismo - Saltos - Salto em Distância',
    'Saltos - Salto em Altura': 'Atletismo - Saltos - Salto em Altura',
    'Saltos - Salto Triplo': 'Atletismo - Saltos - Salto Triplo',
    'Saltos - Salto com Vara': 'Atletismo - Saltos - Salto com Vara',
    'Saltos - Distância': 'Atletismo - Saltos - Salto em Distância',
    'Saltos - Altura': 'Atletismo - Saltos - Salto em Altura',
    'Saltos - Triplo': 'Atletismo - Saltos - Salto Triplo',
    'Saltos - Vara': 'Atletismo - Saltos - Salto com Vara',
    'Atletismo - Saltos - Distância': 'Atletismo - Saltos - Salto em Distância',
    'Atletismo - Saltos - Altura': 'Atletismo - Saltos - Salto em Altura',
    'Atletismo - Saltos - Triplo': 'Atletismo - Saltos - Salto Triplo',
    'Atletismo - Saltos - Vara': 'Atletismo - Saltos - Salto com Vara',
    
    // Atletismo - Arremessos e Lançamentos
    'Lançamento de Disco': 'Atletismo - Arremessos e Lançamentos - Lançamento de Disco',
    'Lançamento de Dardo': 'Atletismo - Arremessos e Lançamentos - Lançamento de Dardo',
    'Arremesso de Peso': 'Atletismo - Arremessos e Lançamentos - Arremesso de Peso',
    'Lançamento de Martelo': 'Atletismo - Arremessos e Lançamentos - Lançamento de Martelo',
    'Lançamentos - Disco': 'Atletismo - Arremessos e Lançamentos - Lançamento de Disco',
    'Lançamentos - Dardo': 'Atletismo - Arremessos e Lançamentos - Lançamento de Dardo',
    'Lançamentos - Peso': 'Atletismo - Arremessos e Lançamentos - Arremesso de Peso',
    'Lançamentos - Martelo': 'Atletismo - Arremessos e Lançamentos - Lançamento de Martelo',
    'Arremessos e Lançamentos - Disco': 'Atletismo - Arremessos e Lançamentos - Lançamento de Disco',
    'Arremessos e Lançamentos - Dardo': 'Atletismo - Arremessos e Lançamentos - Lançamento de Dardo',
    'Arremessos e Lançamentos - Peso': 'Atletismo - Arremessos e Lançamentos - Arremesso de Peso',
    'Arremessos e Lançamentos - Martelo': 'Atletismo - Arremessos e Lançamentos - Lançamento de Martelo',
    'Atletismo - Lançamentos - Disco': 'Atletismo - Arremessos e Lançamentos - Lançamento de Disco',
    'Atletismo - Lançamentos - Dardo': 'Atletismo - Arremessos e Lançamentos - Lançamento de Dardo',
    'Atletismo - Lançamentos - Peso': 'Atletismo - Arremessos e Lançamentos - Arremesso de Peso',
    'Atletismo - Lançamentos - Martelo': 'Atletismo - Arremessos e Lançamentos - Lançamento de Martelo',
    
    // Tênis de Mesa
    'Tênis de Mesa - Individual': 'Tênis de Mesa (Individual)',
    'Tênis de Mesa - Misto': 'Tênis de Mesa (Misto)',
    'Tênis de Mesa - Dupla': 'Tênis de Mesa (Misto)',
    'Tênis de Mesa (Dupla)': 'Tênis de Mesa (Misto)',
  };

  return legacyMap[mod] || mod;
};

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
    telefone, sexo, idade, turma, matricula, peso, altura, modalidades, posicoesPorModalidade,
    codigoConvite, cpf, rg, endereco, cidade, estado, dataNascimento, nomeResponsavel, telefoneResponsavel,
    alergias, lesoesAnteriores, restricoesMedicas, numeroCamisa,
    numeroCalcado, tamanhoCamisa, tamanhoCalcao
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

    const mods = tipo === 'estudante' ? (modalidades || []).map(mapLegacyToNewModality) : undefined;
    
    if (tipo === 'estudante' && posicoesPorModalidade && Array.isArray(posicoesPorModalidade)) {
      const valResult = validatePosicoesPorModalidade(mods || [], posicoesPorModalidade);
      if (!valResult.isValid) {
        return res.status(400).json({ mensagem: valResult.error });
      }
    }

    const sanitizedPos = tipo === 'estudante' ? sanitizePosicoesPorModalidade(mods || [], posicoesPorModalidade) : undefined;

    console.log("Gerando hash da senha...");
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = new User({
      nome, email, senha: senhaHash, tipo, telefone, sexo, cpf, rg, endereco, cidade, estado,
      dataNascimento: dataNascimento === '' ? null : dataNascimento,
      nomeResponsavel, telefoneResponsavel,
      alergias, lesoesAnteriores, restricoesMedicas, numeroCamisa,
      numeroCalcado, tamanhoCamisa, tamanhoCalcao,
      matricula: tipo === 'estudante' ? matValida : undefined,
      esportes: mods,
      posicoesPorModalidade: sanitizedPos,
      turma: tipo === 'estudante' ? turma : undefined,
      peso: (tipo === 'estudante' && peso !== '') ? peso : undefined,
      altura: (tipo === 'estudante' && altura !== '') ? altura : undefined,
      idade: (idade !== undefined && idade !== '') ? idade : undefined,
    });

    await novoUsuario.save();

    // Se for estudante, cria ou atualiza no Student
    if (tipo === 'estudante') {
      let estudanteExistente = null;
      if (matValida) {
        estudanteExistente = await Student.findOne({ matricula: matValida });
      }
      if (!estudanteExistente && cpf) {
        estudanteExistente = await Student.findOne({ cpf });
      }
      if (!estudanteExistente && email) {
        estudanteExistente = await Student.findOne({ email });
      }

      if (estudanteExistente) {
        console.log(`[Registro] Estudante existente encontrado (${estudanteExistente._id}). Vinculando e atualizando dados...`);
        estudanteExistente.nome = nome || estudanteExistente.nome;
        estudanteExistente.email = email || estudanteExistente.email;
        estudanteExistente.matricula = matValida || estudanteExistente.matricula;
        estudanteExistente.sexo = sexo || estudanteExistente.sexo;
        if (idade !== undefined && idade !== '') estudanteExistente.idade = idade;
        estudanteExistente.turma = turma || estudanteExistente.turma;
        if (peso !== undefined && peso !== '') estudanteExistente.peso = peso;
        if (altura !== undefined && altura !== '') estudanteExistente.altura = altura;
        estudanteExistente.telefone = telefone || estudanteExistente.telefone;
        estudanteExistente.cpf = cpf || estudanteExistente.cpf;
        estudanteExistente.rg = rg || estudanteExistente.rg;
        estudanteExistente.endereco = endereco || estudanteExistente.endereco;
        estudanteExistente.cidade = cidade || estudanteExistente.cidade;
        estudanteExistente.estado = estado || estudanteExistente.estado;
        if (dataNascimento !== '' && dataNascimento !== undefined) estudanteExistente.dataNascimento = dataNascimento;
        estudanteExistente.nomeResponsavel = nomeResponsavel || estudanteExistente.nomeResponsavel;
        estudanteExistente.telefoneResponsavel = telefoneResponsavel || estudanteExistente.telefoneResponsavel;
        estudanteExistente.alergias = alergias || estudanteExistente.alergias;
        estudanteExistente.lesoesAnteriores = lesoesAnteriores || estudanteExistente.lesoesAnteriores;
        estudanteExistente.restricoesMedicas = restricoesMedicas || estudanteExistente.restricoesMedicas;
        estudanteExistente.numeroCamisa = numeroCamisa || estudanteExistente.numeroCamisa;
        estudanteExistente.numeroCalcado = numeroCalcado || estudanteExistente.numeroCalcado;
        estudanteExistente.tamanhoCamisa = tamanhoCamisa || estudanteExistente.tamanhoCamisa;
        estudanteExistente.tamanhoCalcao = tamanhoCalcao || estudanteExistente.tamanhoCalcao;
        
        estudanteExistente.esportes = mods;
        estudanteExistente.modalidades = mods;
        estudanteExistente.posicoesPorModalidade = sanitizedPos;
        estudanteExistente.adicionadoPor = novoUsuario._id;
        
        await estudanteExistente.save();
      } else {
        const novoEstudante = new Student({
          nome, email,
          matricula: matValida,
          esportes: mods,
          modalidades: mods,
          posicoesPorModalidade: sanitizedPos,
          sexo: sexo || 'Feminino',
          idade: (idade !== undefined && idade !== '') ? idade : undefined,
          turma,
          peso: (peso !== undefined && peso !== '') ? peso : undefined,
          altura: (altura !== undefined && altura !== '') ? altura : undefined,
          telefone,
          cpf,
          rg,
          endereco,
          cidade,
          estado,
          dataNascimento: dataNascimento === '' ? null : dataNascimento,
          nomeResponsavel,
          telefoneResponsavel,
          alergias, lesoesAnteriores, restricoesMedicas, numeroCamisa,
          numeroCalcado, tamanhoCamisa, tamanhoCalcao,
          adicionadoPor: novoUsuario._id
        });
        await novoEstudante.save();
      }
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
        const mods = (estudante.modalidades || estudante.esportes || []).map(mapLegacyToNewModality);
        usuario.esportes = mods;
        usuario.modalidades = mods;
        usuario.posicoesPorModalidade = sanitizePosicoesPorModalidade(mods, estudante.posicoesPorModalidade || usuario.posicoesPorModalidade);
        usuario.cpf = estudante.cpf || '';
        usuario.rg = estudante.rg || '';
        usuario.endereco = estudante.endereco || '';
        usuario.cidade = estudante.cidade || '';
        usuario.estado = estudante.estado || '';
        usuario.dataNascimento = estudante.dataNascimento ? estudante.dataNascimento.toISOString().split('T')[0] : '';
        usuario.contatoEmergencia = estudante.contatoEmergencia || '';
        usuario.nomeResponsavel = estudante.nomeResponsavel || '';
        usuario.telefoneResponsavel = estudante.telefoneResponsavel || '';
        usuario.alergias = estudante.alergias || '';
        usuario.lesoesAnteriores = estudante.lesoesAnteriores || '';
        usuario.restricoesMedicas = estudante.restricoesMedicas || '';
        usuario.numeroCamisa = estudante.numeroCamisa || '';
        usuario.numeroCalcado = estudante.numeroCalcado || '';
        usuario.tamanhoCamisa = estudante.tamanhoCamisa || '';
        usuario.tamanhoCalcao = estudante.tamanhoCalcao || '';
        
        if (estudante.peso && estudante.altura) {
           let h = estudante.altura;
           if (h > 3) h = h / 100;
           usuario.imc = (estudante.peso / (h * h)).toFixed(1);
        }
      } else {
        const mods = (usuario.esportes || []).map(mapLegacyToNewModality);
        usuario.posicoesPorModalidade = sanitizePosicoesPorModalidade(mods, usuario.posicoesPorModalidade);
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
    matricula, cpf, rg, endereco, cidade, estado, dataNascimento, contatoEmergencia, nomeResponsavel, telefoneResponsavel,
    alergias, lesoesAnteriores, restricoesMedicas, numeroCamisa,
    numeroCalcado, tamanhoCamisa, tamanhoCalcao, posicoesPorModalidade
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
    let mods = req.body.modalidades || req.body.esportes;
    if (mods) {
      mods = mods.map(mapLegacyToNewModality);
      usuario.esportes = mods;
    }

    if (posicoesPorModalidade) {
      const valResult = validatePosicoesPorModalidade(mods || usuario.esportes || [], posicoesPorModalidade);
      if (!valResult.isValid) {
        return res.status(400).json({ mensagem: valResult.error });
      }
      usuario.posicoesPorModalidade = sanitizePosicoesPorModalidade(mods || usuario.esportes || [], posicoesPorModalidade);
    } else if (mods) {
      usuario.posicoesPorModalidade = sanitizePosicoesPorModalidade(mods, usuario.posicoesPorModalidade);
    }

    if (sexo) usuario.sexo = sexo;
    if (matricula !== undefined) usuario.matricula = matricula === '' ? undefined : matricula;
    if (cpf !== undefined) usuario.cpf = cpf;
    if (rg !== undefined) usuario.rg = rg;
    if (endereco !== undefined) usuario.endereco = endereco;
    if (cidade !== undefined) usuario.cidade = cidade;
    if (estado !== undefined) usuario.estado = estado;
    if (dataNascimento !== undefined) usuario.dataNascimento = dataNascimento === '' ? null : dataNascimento;
    if (telefone !== undefined) usuario.telefone = telefone;
    if (nomeResponsavel !== undefined) usuario.nomeResponsavel = nomeResponsavel;
    if (telefoneResponsavel !== undefined) usuario.telefoneResponsavel = telefoneResponsavel;
    if (alergias !== undefined) usuario.alergias = alergias;
    if (lesoesAnteriores !== undefined) usuario.lesoesAnteriores = lesoesAnteriores;
    if (restricoesMedicas !== undefined) usuario.restricoesMedicas = restricoesMedicas;
    if (numeroCamisa !== undefined) usuario.numeroCamisa = numeroCamisa;
    if (numeroCalcado !== undefined) usuario.numeroCalcado = numeroCalcado;
    if (tamanhoCamisa !== undefined) usuario.tamanhoCamisa = tamanhoCamisa;
    if (tamanhoCalcao !== undefined) usuario.tamanhoCalcao = tamanhoCalcao;
    
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
      if (mods) {
        estudante.esportes = mods;
        estudante.modalidades = mods;
      }
      if (usuario.posicoesPorModalidade) {
        estudante.posicoesPorModalidade = usuario.posicoesPorModalidade;
      }
      if (sexo) estudante.sexo = sexo;
      if (matricula !== undefined) estudante.matricula = matricula === '' ? undefined : matricula;
      if (cpf !== undefined) estudante.cpf = cpf;
      if (rg !== undefined) estudante.rg = rg;
      if (endereco !== undefined) estudante.endereco = endereco;
      if (cidade !== undefined) estudante.cidade = cidade;
      if (estado !== undefined) estudante.estado = estado;
      if (dataNascimento !== undefined) estudante.dataNascimento = dataNascimento === '' ? null : dataNascimento;
      if (contatoEmergencia !== undefined) estudante.contatoEmergencia = contatoEmergencia;
      if (nomeResponsavel !== undefined) estudante.nomeResponsavel = nomeResponsavel;
      if (telefoneResponsavel !== undefined) estudante.telefoneResponsavel = telefoneResponsavel;
      if (alergias !== undefined) estudante.alergias = alergias;
      if (lesoesAnteriores !== undefined) estudante.lesoesAnteriores = lesoesAnteriores;
      if (restricoesMedicas !== undefined) estudante.restricoesMedicas = restricoesMedicas;
      if (numeroCamisa !== undefined) estudante.numeroCamisa = numeroCamisa;
      if (numeroCalcado !== undefined) estudante.numeroCalcado = numeroCalcado;
      if (tamanhoCamisa !== undefined) estudante.tamanhoCamisa = tamanhoCamisa;
      if (tamanhoCalcao !== undefined) estudante.tamanhoCalcao = tamanhoCalcao;
      
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
