const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: {type: String, required: true,},
  email: {type: String, required: true, unique: true,},
  senha: {type: String, required: true,},
  tipo: {type: String, enum: ['treinador', 'admin', 'estudante'], default: 'treinador',},
  matricula: {type: String, unique: true, sparse: true}, // Apenas para estudantes
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
