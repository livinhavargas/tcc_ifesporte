const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  tipo: { type: String, enum: ['Treino', 'Amistoso', 'Campeonato', 'Outro'], default: 'Treino' },
  data: { type: Date, required: true },
  hora: { type: String, required: true },
  local: { type: String, required: true },
  cor: { type: String, default: '#eab308' },
  descricao: { type: String },
  responsavel: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  criador: { type: String }, // Nome do usuário que criou
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
