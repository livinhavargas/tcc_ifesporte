const Analysis = require('../models/Analysis');

// Buscar todas as análises esportivas
const getAllAnalyses = async (req, res) => {
  try {
    const { modalidade, categoria, alunoId } = req.query;
    const filter = {};
    
    if (modalidade) {
      filter.modalidade = new RegExp(`^${modalidade.trim()}$`, 'i');
    }
    if (categoria && categoria !== 'Todas') {
      const normCat = categoria.toLowerCase().trim();
      if (normCat.startsWith('fem')) {
        filter.categoria = new RegExp('^fem', 'i');
      } else if (normCat.startsWith('masc')) {
        filter.categoria = new RegExp('^masc', 'i');
      } else if (normCat.startsWith('geral')) {
        filter.$or = [
          { categoria: new RegExp('^geral', 'i') },
          { categoria: null },
          { categoria: '' },
          { categoria: { $exists: false } }
        ];
      } else {
        filter.categoria = categoria;
      }
    }
    if (alunoId) {
      filter.$or = [
        { aluno: alunoId },
        { atletas: alunoId }
      ];
    }

    const analyses = await Analysis.find(filter)
      .populate('aluno')
      .populate('atletas')
      .populate('avaliador', 'nome email')
      .sort({ data: -1, createdAt: -1 });

    res.json(analyses);
  } catch (error) {
    console.error('Erro ao buscar análises esportivas:', error);
    res.status(500).json({ message: 'Erro ao buscar análises esportivas.' });
  }
};

// Validação dos campos obrigatórios conforme modalidade
const validateAnalysisFields = (data) => {
  const { modalidade, equipeAdversaria, resultado, placar, subtipoProva, aluno, dadosEspecificos = {} } = data;
  
  if (!modalidade || typeof modalidade !== 'string' || !modalidade.trim()) {
    return 'A modalidade esportiva é obrigatória.';
  }

  const modLower = modalidade.toLowerCase().trim();

  // ATLETISMO
  if (modLower.includes('atletismo')) {
    if (!subtipoProva) {
      return 'A prova de atletismo é obrigatória.';
    }

    const provaLower = subtipoProva.toLowerCase();

    // Revezamentos 4x100m e 4x400m
    if (provaLower.includes('revezamento') || provaLower.includes('4x')) {
      const { atletasRevezamento, quantidadeEquipes, colocacao } = dadosEspecificos;
      if (!Array.isArray(atletasRevezamento) || atletasRevezamento.filter(Boolean).length < 4) {
        return 'É obrigatório selecionar os quatro atletas do revezamento.';
      }
      if (quantidadeEquipes === undefined || quantidadeEquipes === null || quantidadeEquipes === '') {
        return 'A quantidade de equipes é obrigatória.';
      }
      if (!colocacao) {
        return 'A colocação é obrigatória.';
      }
      return null;
    }

    // Provas individuais de Atletismo (Corridas, Barreiras, Saltos, Lançamentos, Pentatlo)
    if (!aluno) {
      return 'É obrigatório selecionar o atleta.';
    }
    if (dadosEspecificos.quantidadeAdversarios === undefined || dadosEspecificos.quantidadeAdversarios === null || dadosEspecificos.quantidadeAdversarios === '') {
      return 'A quantidade de adversários é obrigatória.';
    }
    if (!dadosEspecificos.colocacao) {
      return 'A colocação é obrigatória.';
    }

    return null;
  }

  // DEMAIS MODALIDADES (Confronto)
  if (!equipeAdversaria || !equipeAdversaria.trim()) {
    return 'O nome da equipe adversária é obrigatório.';
  }

  if (!resultado || !['Vitória', 'Derrota', 'Empate'].includes(resultado)) {
    return 'O resultado da partida é obrigatório (Vitória, Derrota ou Empate).';
  }

  // XADREZ: Não requer placar de gols/sets
  if (modLower.includes('xadrez')) {
    return null;
  }

  // HANDEBOL, BASQUETE, FUTSAL, FUTEBOL, VOLEIBOL, VÔLEI DE PRAIA, BADMINTON, TÊNIS DE MESA
  if (placar === undefined || placar === null || placar === '') {
    return 'O placar da partida é obrigatório.';
  }

  // Modalidades baseadas em sets (Badminton e Tênis de Mesa)
  if (
    modLower.includes('badminton') ||
    modLower.includes('tênis de mesa') ||
    modLower.includes('tenis de mesa')
  ) {
    if (!dadosEspecificos.pontosCadaSet || (Array.isArray(dadosEspecificos.pontosCadaSet) && dadosEspecificos.pontosCadaSet.length === 0)) {
      return 'Os pontos de cada set são obrigatórios.';
    }
  }

  return null;
};

// Criar nova análise esportiva
const createAnalysis = async (req, res) => {
  try {
    const userTipo = (req.userTipo || '').toLowerCase();
    if (userTipo === 'estudante') {
      return res.status(403).json({ message: 'Acesso negado. Estudantes possuem permissão apenas para visualização de análises.' });
    }

    const errorMsg = validateAnalysisFields(req.body);
    if (errorMsg) {
      return res.status(400).json({ message: errorMsg });
    }

    const {
      modalidade,
      categoria = 'Geral',
      subtipoProva,
      data = new Date(),
      equipeAdversaria,
      resultado,
      placar,
      aluno,
      atletas = [],
      dadosEspecificos = {},
      observacoes
    } = req.body;

    const newAnalysis = new Analysis({
      modalidade: modalidade.trim(),
      categoria: categoria.trim(),
      subtipoProva: subtipoProva ? subtipoProva.trim() : undefined,
      data,
      avaliador: req.userId || req.user?._id,
      equipeAdversaria: equipeAdversaria ? equipeAdversaria.trim() : undefined,
      resultado,
      placar,
      aluno: aluno || undefined,
      atletas: Array.isArray(atletas) ? atletas : [],
      dadosEspecificos,
      observacoes: observacoes ? observacoes.trim() : undefined
    });

    await newAnalysis.save();
    const populated = await Analysis.findById(newAnalysis._id)
      .populate('aluno')
      .populate('atletas')
      .populate('avaliador', 'nome email');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Erro ao salvar análise esportiva:', error);
    res.status(500).json({ message: error.message || 'Erro ao registrar análise esportiva.' });
  }
};

// Atualizar análise esportiva existente
const updateAnalysis = async (req, res) => {
  try {
    const userTipo = (req.userTipo || '').toLowerCase();
    if (userTipo === 'estudante') {
      return res.status(403).json({ message: 'Acesso negado. Estudantes possuem permissão apenas para visualização de análises.' });
    }

    const { id } = req.params;
    const errorMsg = validateAnalysisFields(req.body);
    if (errorMsg) {
      return res.status(400).json({ message: errorMsg });
    }

    const {
      modalidade,
      categoria = 'Geral',
      subtipoProva,
      data,
      equipeAdversaria,
      resultado,
      placar,
      aluno,
      atletas = [],
      dadosEspecificos = {},
      observacoes
    } = req.body;

    const updatePayload = {
      modalidade: modalidade.trim(),
      categoria: (categoria || 'Geral').trim(),
      subtipoProva: subtipoProva ? subtipoProva.trim() : undefined,
      data: data || new Date(),
      equipeAdversaria: equipeAdversaria ? equipeAdversaria.trim() : undefined,
      resultado,
      placar,
      aluno: aluno || undefined,
      atletas: Array.isArray(atletas) ? atletas : [],
      dadosEspecificos,
      observacoes: observacoes ? observacoes.trim() : undefined
    };

    const updated = await Analysis.findByIdAndUpdate(id, updatePayload, { new: true })
      .populate('aluno')
      .populate('atletas')
      .populate('avaliador', 'nome email');

    if (!updated) {
      return res.status(404).json({ message: 'Análise esportiva não encontrada.' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar análise esportiva:', error);
    res.status(500).json({ message: error.message || 'Erro ao atualizar análise esportiva.' });
  }
};

// Buscar análises de um aluno específico
const getAnalysisByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const analyses = await Analysis.find({
      $or: [
        { aluno: studentId },
        { atletas: studentId },
        { 'dadosEspecificos.golsMarcados.atletaId': studentId },
        { 'dadosEspecificos.cestas.atletaId': studentId },
        { 'dadosEspecificos.cartoes.atletaId': studentId },
        { 'dadosEspecificos.faltasCometidas.atletas': studentId },
        { 'dadosEspecificos.atletasRevezamento': studentId }
      ]
    })
      .populate('aluno')
      .populate('atletas')
      .populate('avaliador', 'nome email')
      .sort({ data: -1, createdAt: -1 });

    res.json(analyses);
  } catch (error) {
    console.error('Erro ao buscar análises do aluno:', error);
    res.status(500).json({ message: 'Erro ao buscar análises do aluno.' });
  }
};

// Buscar análise esportiva por ID
const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await Analysis.findById(id)
      .populate('aluno')
      .populate('atletas')
      .populate('avaliador', 'nome email');

    if (!analysis) {
      return res.status(404).json({ message: 'Análise esportiva não encontrada.' });
    }
    res.json(analysis);
  } catch (error) {
    console.error('Erro ao buscar análise esportiva:', error);
    res.status(500).json({ message: 'Erro ao buscar análise esportiva.' });
  }
};

// Excluir análise esportiva
const deleteAnalysis = async (req, res) => {
  try {
    const userTipo = (req.userTipo || '').toLowerCase();
    if (userTipo === 'estudante') {
      return res.status(403).json({ message: 'Acesso negado. Estudantes possuem permissão apenas para visualização de análises.' });
    }

    const { id } = req.params;
    const analysis = await Analysis.findByIdAndDelete(id);
    if (!analysis) {
      return res.status(404).json({ message: 'Análise esportiva não encontrada.' });
    }
    res.json({ message: 'Análise esportiva removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir análise esportiva:', error);
    res.status(500).json({ message: 'Erro ao excluir análise esportiva.' });
  }
};

module.exports = {
  getAllAnalyses,
  getAnalysisById,
  createAnalysis,
  updateAnalysis,
  getAnalysisByStudent,
  deleteAnalysis
};

