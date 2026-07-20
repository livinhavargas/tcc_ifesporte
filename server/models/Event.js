const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  tipo: { type: String, enum: ['treino', 'amistoso', 'competição', 'outro'], default: 'treino' },
  data: { type: Date, required: true },
  hora: { type: String, required: true },
  local: { type: String, required: true },
  modalidade: { type: String, required: true },
  descricao: { type: String },
  responsavel: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  criador: { type: String }, // Nome do usuário que criou
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
