const mongoose = require('mongoose');

const faseSchema = new mongoose.Schema({
  nome: { type: String, required: true }, // 'Preparatória', 'Competitiva', 'Transição'
  dataInicio: { type: Date, required: true },
  dataFim: { type: Date, required: true },
  objetivo: { type: String, required: true },
  semanas: { type: Number, default: 0 },
  treinos: [{
    data: Date,
    tipo: String
  }],
  descricao: { type: String },
  foco: { type: String },
  observacoes: { type: String }
});

const cronogramaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  modalidade: { type: String, required: true },
  categoria: { type: String, required: true },
  dataInicio: { type: Date, required: true },
  dataFim: { type: Date, required: true },
  competicaoAlvo: { type: Date },
  diasPorSemana: { type: Number, default: 3 },
  objetivoGeral: { type: String },
  fases: [faseSchema],
  eventosVinculados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  incluirTransicao: { type: Boolean, default: true },
  quantidadeSemanas: { type: Number, default: 0 },
  quantidadeTreinos: { type: Number, default: 0 },
  criador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  treinadorResponsavel: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Cronograma', cronogramaSchema);
