const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  tipo: { type: String, enum: ['treino', 'evento'], default: 'treino' },
  data: { type: Date, required: true },
  hora: { type: String, required: true },
  local: { type: String, required: true },
  modalidade: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
