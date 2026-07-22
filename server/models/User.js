const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: {type: String, required: true,},
  email: {type: String, required: true, unique: true,},
  senha: {type: String, required: true,},
  tipo: {type: String, enum: ['admin', 'estudante'], default: 'estudante',},
  matricula: {type: String, unique: true, sparse: true}, // Apenas para estudantes
  esportes: [{ type: String }], // Apenas para estudantes
  telefone: { type: String }, // Adicionado para perfil admin
  foto: { type: String }, // Base64 da foto de perfil

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
