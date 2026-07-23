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
  }]
});

const cronogramaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  modalidade: { type: String, required: true },
  dataInicio: { type: Date, required: true },
  dataFim: { type: Date, required: true },
  competicaoAlvo: { type: Date },
  diasPorSemana: { type: Number, default: 3 },
  objetivoGeral: { type: String },
  fases: [faseSchema],
  criador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Cronograma', cronogramaSchema);
