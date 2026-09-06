const Student = require('../models/Student');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
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

const syncStudentToUser = async (student) => {
  try {
    let user = null;
    if (student.adicionadoPor) {
      user = await User.findOne({ _id: student.adicionadoPor, tipo: 'estudante' });
    }
    if (!user && student.email) {
      user = await User.findOne({ email: student.email, tipo: 'estudante' });
    }
    if (!user && student.matricula) {
      user = await User.findOne({ matricula: student.matricula, tipo: 'estudante' });
    }

    if (user) {
      console.log(`[Sync] Sincronizando dados de Student (${student.nome}) para User (${user.email})...`);
      user.nome = student.nome;
      if (student.email) user.email = student.email;
      if (student.foto !== undefined) user.foto = student.foto;

      user.telefone = student.telefone;
      user.sexo = student.sexo;
      user.cpf = student.cpf;
      user.rg = student.rg;
      user.endereco = student.endereco;
      user.cidade = student.cidade;
      user.estado = student.estado;
      user.dataNascimento = student.dataNascimento;
      user.nomeResponsavel = student.nomeResponsavel;
      user.telefoneResponsavel = student.telefoneResponsavel;
      user.alergias = student.alergias;
      user.lesoesAnteriores = student.lesoesAnteriores;
      user.restricoesMedicas = student.restricoesMedicas;
      user.numeroCamisa = student.numeroCamisa;
      user.numeroCalcado = student.numeroCalcado;
      user.tamanhoCamisa = student.tamanhoCamisa;
      user.tamanhoCalcao = student.tamanhoCalcao;
      user.matricula = student.matricula;
      user.turma = student.turma || student.serie;
      user.peso = student.peso;
      user.altura = student.altura;
      user.idade = student.idade;
      const mods = (student.modalidades || student.esportes || []).map(mapLegacyToNewModality);
      user.esportes = mods;
      user.posicoesPorModalidade = sanitizePosicoesPorModalidade(mods, student.posicoesPorModalidade);
      
      await user.save();
    }
  } catch (err) {
    console.error("Erro ao sincronizar Student para User:", err);
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ nome: 1 }).lean();
    const normalized = students.map(s => {
      if (s.esportes) s.esportes = s.esportes.map(mapLegacyToNewModality);
      if (s.modalidades) s.modalidades = s.modalidades.map(mapLegacyToNewModality);
      const mods = s.modalidades || s.esportes || [];
      s.posicoesPorModalidade = sanitizePosicoesPorModalidade(mods, s.posicoesPorModalidade);
      return s;
    });
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ message: 'Estudante não encontrado' });
    if (student.esportes) student.esportes = student.esportes.map(mapLegacyToNewModality);
    if (student.modalidades) student.modalidades = student.modalidades.map(mapLegacyToNewModality);
    const mods = student.modalidades || student.esportes || [];
    student.posicoesPorModalidade = sanitizePosicoesPorModalidade(mods, student.posicoesPorModalidade);
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStudent = async (req, res) => {
  console.log("POST /api/students PAYLOAD RECEBIDO:", req.body);
  const { matricula, cpf, email, posicoesPorModalidade } = req.body;
  
  try {
    let mods = req.body.modalidades || req.body.esportes || [];
    if (mods) {
      mods = mods.map(mapLegacyToNewModality);
      req.body.modalidades = mods;
      req.body.esportes = mods;
    }

    // Validação estrita das posições
    if (posicoesPorModalidade && Array.isArray(posicoesPorModalidade)) {
      const valResult = validatePosicoesPorModalidade(mods, posicoesPorModalidade);
      if (!valResult.isValid) {
        return res.status(400).json({ message: valResult.error });
      }
    }

    req.body.posicoesPorModalidade = sanitizePosicoesPorModalidade(mods, posicoesPorModalidade);

    let studentExistente = null;
    if (matricula) {
      studentExistente = await Student.findOne({ matricula });
    }
    if (!studentExistente && cpf) {
      studentExistente = await Student.findOne({ cpf });
    }
    if (!studentExistente && email) {
      studentExistente = await Student.findOne({ email });
    }

    if (studentExistente) {
      console.log(`[createStudent] Estudante existente encontrado (${studentExistente._id}). Atualizando dados existentes...`);
      Object.assign(studentExistente, req.body);
      const updatedStudent = await studentExistente.save();
      await syncStudentToUser(updatedStudent);
      return res.status(200).json(updatedStudent);
    }

    const student = new Student(req.body);
    let userExistente = null;
    if (email) {
      userExistente = await User.findOne({ email, tipo: 'estudante' });
    }
    if (!userExistente && matricula) {
      userExistente = await User.findOne({ matricula, tipo: 'estudante' });
    }

    if (userExistente) {
      student.adicionadoPor = userExistente._id;
    }

    const newStudent = await student.save();
    
    if (userExistente) {
      await syncStudentToUser(newStudent);
    }

    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Erro ao criar estudante:", error);
    res.status(400).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    let mods = req.body.modalidades || req.body.esportes;
    if (mods) {
      mods = mods.map(mapLegacyToNewModality);
      req.body.modalidades = mods;
      req.body.esportes = mods;
    }

    // Validação estrita das posições
    if (req.body.posicoesPorModalidade) {
      const valResult = validatePosicoesPorModalidade(mods || [], req.body.posicoesPorModalidade);
      if (!valResult.isValid) {
        return res.status(400).json({ message: valResult.error });
      }
      req.body.posicoesPorModalidade = sanitizePosicoesPorModalidade(mods || [], req.body.posicoesPorModalidade);
    } else if (mods) {
      // Se modalidades mudaram mas posicoesPorModalidade não veio explicitamente, resanitizar
      const existing = await Student.findById(req.params.id);
      if (existing) {
        req.body.posicoesPorModalidade = sanitizePosicoesPorModalidade(mods, existing.posicoesPorModalidade);
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStudent) return res.status(404).json({ message: 'Estudante não encontrado' });
    
    await syncStudentToUser(updatedStudent);
    
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    await Analysis.deleteMany({ aluno: studentId });
    
    const student = await Student.findByIdAndDelete(studentId);
    if (!student) return res.status(404).json({ message: 'Estudante não encontrado' });
    
    res.json({ message: 'Estudante removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
