const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  tipoAtividade: { type: String, enum: ['treino', 'avaliação'], required: true },
  categoria: { type: String, required: true }, // ex: 'ataque', 'defesa', 'goleiro'
  metricas: {
    passesCertos: { type: Number, default: 0 },
    passesErrados: { type: Number, default: 0 },
    contraAtaques: { type: Number, default: 0 },
    situacoesJogo: { type: Number, default: 0 },
    desempenhoDefensivo: { type: Number, default: 0 }
  },
  data: { type: Date, default: Date.now },
  observacoes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
