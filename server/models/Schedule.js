const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  modalidade: { type: String, required: true },
  genero: { type: String, required: true },
  periodo: { type: String, required: true }, // ex: '2026/1'
  frequenciaSemanal: { type: Number, required: true },
  dataCompeticao: { type: Date, required: true },
  fases: [{
    nome: { type: String }, // Preparatória, Competitiva, Transição
    inicio: { type: Date },
    fim: { type: Date },
    duracaoSemanas: { type: Number },
    quantidadeTreinos: { type: Number },
    objetivos: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
