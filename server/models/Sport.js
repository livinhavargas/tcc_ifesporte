const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  tipo: { type: String, enum: ['individual', 'coletivo'], required: true },
  subcategorias: [{ type: String }] // ex: '100m rasos', 'Futsal Masculino'
}, { timestamps: true });

module.exports = mongoose.model('Sport', sportSchema);
