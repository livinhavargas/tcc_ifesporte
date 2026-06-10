const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  matricula: { type: String, required: true, unique: true },
  serie: { type: String, required: true },
  sexo: { type: String, enum: ['M', 'F', 'Outro'], required: true },
  altura: { type: Number, required: true }, // em metros
  peso: { type: Number, required: true }, // em kg
  esportes: [{ type: String }], // nomes das modalidades
  email: { type: String },
  telefone: { type: String },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

studentSchema.virtual('imc').get(function() {
  if (this.peso && this.altura) {
    return (this.peso / (this.altura * this.altura)).toFixed(2);
  }
  return null;
});

module.exports = mongoose.model('Student', studentSchema);
