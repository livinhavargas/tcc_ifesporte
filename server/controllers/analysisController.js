const Analysis = require('../models/Analysis');

const getAllAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find().populate('aluno').sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const UNSUPPORTED_ANALYSIS_SPORTS = [
  'xadrez',
  'tênis de mesa',
  'tenis de mesa',
  'tênis de mesa individual',
  'tenis de mesa individual',
  'tênis de mesa dupla',
  'tenis de mesa dupla',
  'tênis de mesa (individual)',
  'tênis de mesa (misto)',
  'vôlei de praia',
  'volei de praia',
  'vôlei de praia (dupla)',
  'badminton'
];

const isSportAnalysisSupported = (modalidadeStr) => {
  if (!modalidadeStr) return false;
  const modLower = modalidadeStr.toLowerCase().trim();
  return !UNSUPPORTED_ANALYSIS_SPORTS.some(unsupported => modLower.includes(unsupported));
};

const createAnalysis = async (req, res) => {
  try {
    const { 
      tipoAnalise = 'Individual', 
      aluno, 
      modalidade, 
      categoria = 'Geral', 
      contexto = 'Treino',
      data, 
      subtipo = 'Geral', 
      respostas = {}, 
      observacoes,
      diagnostico: reqDiagnostico
    } = req.body;

    if (!isSportAnalysisSupported(modalidade)) {
      return res.status(400).json({ message: 'Análises não são permitidas para esta modalidade.' });
    }

    let indiceGeral = 0;
    let diagnostico = '';
    
    const notas = Object.entries(respostas || {});
    if (notas.length > 0) {
      // Calcular media e identificar maior/menor
      let soma = 0;
      let maxNota = -1;
      let minNota = 6;
      let melhorAtr = '';
      let piorAtr = '';

      notas.forEach(([atr, val]) => {
        const num = Number(val);
        soma += num;
        if (num > maxNota) { maxNota = num; melhorAtr = atr; }
        if (num < minNota) { minNota = num; piorAtr = atr; }
      });

      indiceGeral = (soma / notas.length).toFixed(1);
      
      const nivel = indiceGeral >= 4.5 ? 'Excelente' :
                    indiceGeral >= 3.5 ? 'Bom' :
                    indiceGeral >= 2.5 ? 'Regular' : 'Precisa Melhorar';

      const formatAttr = s => {
        // camelCase to spaced
        return s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      };
      
      if (reqDiagnostico) {
        diagnostico = reqDiagnostico;
      } else {
        diagnostico = `O atleta atingiu um Índice Geral ${nivel} (${indiceGeral}). `;
        
        if (maxNota >= 4) {
          diagnostico += `O seu grande destaque foi em ${formatAttr(melhorAtr)} (Nota ${maxNota}). `;
        } else {
          diagnostico += `Seu melhor desempenho foi em ${formatAttr(melhorAtr)} (Nota ${maxNota}). `;
        }
        
        if (minNota !== maxNota) {
          diagnostico += `Para as próximas semanas, a sugestão é focar em treinos para melhorar ${formatAttr(piorAtr)} (Nota ${minNota}).`;
        }
      }
    }

    // fallback for retrocompatibility (legacy result string)
    let legacyResultado = 'Bom';
    if (indiceGeral >= 4.5) legacyResultado = 'Excelente';
    else if (indiceGeral >= 3.5) legacyResultado = 'Bom';
    else if (indiceGeral >= 2.5) legacyResultado = 'Regular';
    else if (indiceGeral > 0) legacyResultado = 'Precisa Melhorar';
    else legacyResultado = req.body.resultado || 'Bom'; // if old form used

    const analysisData = {
      tipoAnalise,
      aluno,
      modalidade,
      categoria,
      contexto,
      data,
      subtipo,
      respostas,
      resultados: {
        indiceGeral: Number(indiceGeral)
      },
      diagnostico,
      observacoes,
      resultado: legacyResultado
    };

    const newAnalysis = new Analysis(analysisData);
    await newAnalysis.save();

    res.status(201).json(newAnalysis);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const getAnalysisByStudent = async (req, res) => {
  try {
    const analyses = await Analysis.find({ aluno: req.params.studentId }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      tipoAnalise = 'Individual', 
      aluno, 
      modalidade, 
      categoria = 'Geral', 
      contexto = 'Treino',
      data, 
      subtipo = 'Geral', 
      respostas = {}, 
      observacoes,
      diagnostico: reqDiagnostico
    } = req.body;

    if (!isSportAnalysisSupported(modalidade)) {
      return res.status(400).json({ message: 'Análises não são permitidas para esta modalidade.' });
    }

    let indiceGeral = 0;
    let diagnostico = '';
    
    const notas = Object.entries(respostas || {});
    if (notas.length > 0) {
      let soma = 0;
      let maxNota = -1;
      let minNota = 6;
      let melhorAtr = '';
      let piorAtr = '';

      notas.forEach(([atr, val]) => {
        const num = Number(val);
        soma += num;
        if (num > maxNota) { maxNota = num; melhorAtr = atr; }
        if (num < minNota) { minNota = num; piorAtr = atr; }
      });

      indiceGeral = (soma / notas.length).toFixed(1);
      
      const nivel = indiceGeral >= 4.5 ? 'Excelente' :
                    indiceGeral >= 3.5 ? 'Bom' :
                    indiceGeral >= 2.5 ? 'Regular' : 'Precisa Melhorar';

      const formatAttr = s => s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      if (reqDiagnostico) {
        diagnostico = reqDiagnostico;
      } else {
        diagnostico = `O atleta atingiu um Índice Geral ${nivel} (${indiceGeral}). `;
        if (maxNota >= 4) {
          diagnostico += `O seu grande destaque foi em ${formatAttr(melhorAtr)} (Nota ${maxNota}). `;
        } else {
          diagnostico += `Seu melhor desempenho foi em ${formatAttr(melhorAtr)} (Nota ${maxNota}). `;
        }
        if (minNota !== maxNota) {
          diagnostico += `Para as próximas semanas, a sugestão é focar em treinos para melhorar ${formatAttr(piorAtr)} (Nota ${minNota}).`;
        }
      }
    }

    let legacyResultado = 'Bom';
    if (indiceGeral >= 4.5) legacyResultado = 'Excelente';
    else if (indiceGeral >= 3.5) legacyResultado = 'Bom';
    else if (indiceGeral >= 2.5) legacyResultado = 'Regular';
    else if (indiceGeral > 0) legacyResultado = 'Precisa Melhorar';

    const updateData = {
      tipoAnalise,
      aluno,
      modalidade,
      categoria,
      contexto,
      data,
      subtipo,
      respostas,
      resultados: {
        indiceGeral: Number(indiceGeral)
      },
      diagnostico,
      observacoes,
      resultado: legacyResultado
    };

    const updatedAnalysis = await Analysis.findByIdAndUpdate(id, updateData, { new: true }).populate('aluno');
    if (!updatedAnalysis) {
      return res.status(404).json({ message: 'Análise não encontrada' });
    }

    res.json(updatedAnalysis);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndDelete(req.params.id);
    if (!analysis) return res.status(404).json({ message: 'Análise não encontrada' });
    res.json({ message: 'Análise removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAnalyses,
  createAnalysis,
  updateAnalysis,
  getAnalysisByStudent,
  deleteAnalysis
};
