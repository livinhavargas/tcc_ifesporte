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
  const { modalidade, categoria, equipeAdversaria, resultado, placar, subtipoProva, aluno, dadosEspecificos = {} } = data;
  
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

    // Regras estritas de gênero para provas com barreiras
    if (provaLower.includes('100m') && provaLower.includes('barreiras') && !provaLower.includes('400m')) {
      const catNorm = (categoria || '').toLowerCase().trim();
      if (!catNorm.startsWith('fem')) {
        return 'A prova 100m com Barreiras é exclusiva da categoria Feminino.';
      }
    }
    if (provaLower.includes('110m') && provaLower.includes('barreiras')) {
      const catNorm = (categoria || '').toLowerCase().trim();
      if (!catNorm.startsWith('masc')) {
        return 'A prova 110m com Barreiras é exclusiva da categoria Masculino.';
      }
    }

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
    if (!dadosEspecificos.colocacao && !dadosEspecificos.classificacaoFinalPontos) {
      return 'A colocação é obrigatória.';
    }

    return null;
  }

  // TÊNIS DE MESA
  if (modLower.includes('tenis de mesa') || modLower.includes('tênis de mesa')) {
    if (!equipeAdversaria || !equipeAdversaria.trim()) {
      return 'O nome do atleta adversário ou dupla adversária é obrigatório.';
    }
    if (!resultado || !['Vitória', 'Derrota'].includes(resultado)) {
      return 'O resultado da partida de tênis de mesa deve ser Vitória ou Derrota.';
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

  // HANDEBOL, BASQUETE, FUTSAL, FUTEBOL, VOLEIBOL, VÔLEI DE PRAIA, BADMINTON
  if (placar === undefined || placar === null || placar === '') {
    return 'O placar da partida é obrigatório.';
  }

  // Modalidade baseada em sets legada (Badminton)
  if (modLower.includes('badminton')) {
    if (!dadosEspecificos.pontosCadaSet || (Array.isArray(dadosEspecificos.pontosCadaSet) && dadosEspecificos.pontosCadaSet.length === 0)) {
      return 'Os pontos de cada set são obrigatórios.';
    }
  }

  return null;
};

// Resolver e garantir placar válido a partir dos tempos ou dados específicos
const resolvePlacar = (modalidade, placar, dadosEspecificos = {}) => {
  const modLower = (modalidade || '').toLowerCase().trim();
  if (modLower.includes('atletismo') || modLower.includes('xadrez')) {
    return null;
  }
  // Se for Tênis de Mesa (placar de sets calculado a partir dos 5 sets)
  if (modLower.includes('tenis de mesa') || modLower.includes('tênis de mesa')) {
    let nos = 0;
    let adv = 0;
    for (let s = 1; s <= 5; s++) {
      const p = dadosEspecificos[`placarSet${s}`];
      if (p && typeof p === 'object') {
        const pNos = parseInt(p.nos, 10) || 0;
        const pAdv = parseInt(p.adv, 10) || 0;
        if (pNos > 0 || pAdv > 0) {
          if (pNos > pAdv) nos += 1;
          else if (pAdv > pNos) adv += 1;
        }
      }
    }
    return { nos, adv };
  }
  if (placar !== undefined && placar !== null && placar !== '') {
    return placar;
  }
  // Se houver placar de tempos (Basquete, Handebol, Futsal, Futebol)
  if (dadosEspecificos && (dadosEspecificos.placar1Tempo || dadosEspecificos.placar2Tempo)) {
    return {
      nos: (dadosEspecificos.placar1Tempo?.nos || 0) + (dadosEspecificos.placar2Tempo?.nos || 0),
      adv: (dadosEspecificos.placar1Tempo?.adv || 0) + (dadosEspecificos.placar2Tempo?.adv || 0)
    };
  }
  // Se for Voleibol ou Vôlei de Praia (sets opcionais)
  if (modLower.includes('volei') || modLower.includes('vôlei')) {
    let nos = 0;
    let adv = 0;
    for (let s = 1; s <= 5; s++) {
      const p = dadosEspecificos[`placarSet${s}`];
      if (p && typeof p === 'object') {
        const pNos = parseInt(p.nos, 10) || 0;
        const pAdv = parseInt(p.adv, 10) || 0;
        if (pNos > 0 || pAdv > 0) {
          if (pNos > pAdv) nos += 1;
          else if (pAdv > pNos) adv += 1;
        }
      }
    }
    return { nos, adv };
  }
  return { nos: 0, adv: 0 };
};

const isPrimeiroLugar = (val) => {
  if (!val) return false;
  const str = String(val).trim().toLowerCase();
  return (
    str === '1' ||
    str === '1º' ||
    str === '1°' ||
    str === '1o' ||
    str.startsWith('1º') ||
    str.startsWith('1°') ||
    str.startsWith('1o') ||
    str.includes('1º lugar') ||
    str.includes('1° lugar') ||
    str.includes('primeiro') ||
    str.includes('campeão') ||
    str.includes('campeao') ||
    str.includes('vencedor')
  );
};

// Criar nova análise esportiva
const createAnalysis = async (req, res) => {
  try {
    const userTipo = (req.userTipo || '').toLowerCase();
    if (userTipo === 'estudante') {
      return res.status(403).json({ message: 'Acesso negado. Estudantes possuem permissão apenas para visualização de análises.' });
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

    let resolvedResultado = resultado;
    let resolvedCategoria = categoria || 'Geral';

    if (modalidade && modalidade.toLowerCase().includes('atletismo')) {
      if (dadosEspecificos.classificacaoFinalPontos && !dadosEspecificos.colocacao) {
        dadosEspecificos.colocacao = dadosEspecificos.classificacaoFinalPontos;
      }
      if (dadosEspecificos.genero) {
        resolvedCategoria = dadosEspecificos.genero;
      } else if (resolvedCategoria && (resolvedCategoria === 'Feminino' || resolvedCategoria === 'Masculino')) {
        dadosEspecificos.genero = resolvedCategoria;
      }
      const colocacao = dadosEspecificos.colocacao || dadosEspecificos.classificacaoFinalPontos || dadosEspecificos.classificacao;
      resolvedResultado = isPrimeiroLugar(colocacao) ? 'Vitória' : null;
    }

    const resolvedPlacar = resolvePlacar(modalidade, placar, dadosEspecificos);
    const dataToValidate = { ...req.body, categoria: resolvedCategoria, placar: resolvedPlacar, dadosEspecificos, resultado: resolvedResultado };

    const errorMsg = validateAnalysisFields(dataToValidate);
    if (errorMsg) {
      return res.status(400).json({ message: errorMsg });
    }

    const newAnalysis = new Analysis({
      modalidade: modalidade.trim(),
      categoria: resolvedCategoria.trim(),
      subtipoProva: subtipoProva ? subtipoProva.trim() : undefined,
      data,
      avaliador: req.userId || req.user?._id,
      equipeAdversaria: equipeAdversaria ? equipeAdversaria.trim() : undefined,
      resultado: resolvedResultado,
      placar: resolvedPlacar,
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

    let resolvedResultado = resultado;
    let resolvedCategoria = categoria || 'Geral';

    if (modalidade && modalidade.toLowerCase().includes('atletismo')) {
      if (dadosEspecificos.classificacaoFinalPontos && !dadosEspecificos.colocacao) {
        dadosEspecificos.colocacao = dadosEspecificos.classificacaoFinalPontos;
      }
      if (dadosEspecificos.genero) {
        resolvedCategoria = dadosEspecificos.genero;
      } else if (resolvedCategoria && (resolvedCategoria === 'Feminino' || resolvedCategoria === 'Masculino')) {
        dadosEspecificos.genero = resolvedCategoria;
      }
      const colocacao = dadosEspecificos.colocacao || dadosEspecificos.classificacaoFinalPontos || dadosEspecificos.classificacao;
      resolvedResultado = isPrimeiroLugar(colocacao) ? 'Vitória' : null;
    }

    const resolvedPlacar = resolvePlacar(modalidade, placar, dadosEspecificos);
    const dataToValidate = { ...req.body, categoria: resolvedCategoria, placar: resolvedPlacar, dadosEspecificos, resultado: resolvedResultado };

    const errorMsg = validateAnalysisFields(dataToValidate);
    if (errorMsg) {
      return res.status(400).json({ message: errorMsg });
    }

    const updatePayload = {
      modalidade: modalidade.trim(),
      categoria: resolvedCategoria.trim(),
      subtipoProva: subtipoProva ? subtipoProva.trim() : undefined,
      data: data || new Date(),
      equipeAdversaria: equipeAdversaria ? equipeAdversaria.trim() : undefined,
      resultado: resolvedResultado,
      placar: resolvedPlacar,
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
  deleteAnalysis,
  validateAnalysisFields
};

