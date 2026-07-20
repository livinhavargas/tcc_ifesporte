const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  modalidade: { type: String, required: true },
  tipoAnalise: { type: String, enum: ['individual', 'coletiva'], required: true },
  categoria: { type: String, enum: ['ataque', 'defesa', 'goleiro', 'geral'], required: true },
  metricas: {
    passesCertos: { type: Number, default: 0 },
    passesErrados: { type: Number, default: 0 },
    contraAtaques: { type: Number, default: 0 },
    situacoesJogo: { type: Number, default: 0 },
    desempenhoDefensivo: { type: Number, default: 0 },
    velocidade: { type: Number, default: 0 },
    resistencia: { type: Number, default: 0 },
    tecnica: { type: Number, default: 0 },
    tacaoDeForca: { type: Number, default: 0 },
    tomadas: { type: Number, default: 0 },
    gols: { type: Number, default: 0 },
    defesas: { type: Number, default: 0 }
  },
  periodo: { type: String }, // ex: 'Setembro', '2024'
  avaliador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  observacoes: { type: String },
  resultado: { type: String }, // calculado baseado nas métricas
}, { timestamps: true });

// Virtual para calcular resultado baseado nas métricas
analysisSchema.virtual('avaliacao').get(function() {
  const metricas = this.metricas;
  const total = Object.values(metricas).reduce((a, b) => a + b, 0);
  const mediaAritmetica = total / Object.keys(metricas).length;
  
  if (mediaAritmetica >= 8) return 'Excelente';
  if (mediaAritmetica >= 6) return 'Bom';
  if (mediaAritmetica >= 4) return 'Regular';
  return 'Precisar Melhorar';
});

module.exports = mongoose.model('Analysis', analysisSchema);
