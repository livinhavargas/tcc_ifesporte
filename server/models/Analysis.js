const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  modalidade: { type: String, required: true },
  data: { type: Date, required: true },
  categoria: { type: String, required: true },
  observacoes: { type: String },
  resultado: { type: String, required: true },
  avaliador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
