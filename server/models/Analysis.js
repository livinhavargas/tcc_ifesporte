const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  // Identificação
  tipoAnalise: { type: String, enum: ['Individual', 'Coletiva'], required: true },
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Quando for individual
  equipe: { type: String }, // Quando for coletiva
  
  modalidade: { type: String, required: true },
  categoria: { type: String },
  data: { type: Date, required: true },
  avaliador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Estrutura Dinâmica do Formulário
  subtipo: { type: String }, // Ex: 'Ataque', 'Defesa', 'Goleiro', 'Levantador'
  
  // Respostas Brutas do Formulário (pares chave-valor, ex: { passe: 5, finalizacao: 4 })
  respostas: { type: Map, of: mongoose.Schema.Types.Mixed },
  
  // Resultados Processados pelo Sistema
  resultados: {
    mediaOfensiva: { type: Number },
    mediaDefensiva: { type: Number },
    mediaFisica: { type: Number },
    mediaTatica: { type: Number },
    mediaTecnica: { type: Number },
    indiceGeral: { type: Number }
  },

  diagnostico: { type: String }, // Texto gerado automaticamente

  observacoes: { type: String },
  
  // Retrocompatibilidade (para não quebrar a listagem atual temporariamente)
  resultado: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
