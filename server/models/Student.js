const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  matricula: { type: String, required: true, unique: true },
  serie: { type: String, enum: ['1EM', '2EM', '3EM'], required: true },
  sexo: { type: String, enum: ['M', 'F', 'Outro'], required: true },
  idade: { type: Number, required: true },
  esportes: [{ type: String }], // nomes das modalidades
  // Campos opcionais
  email: { type: String },
  telefone: { type: String },
  altura: { type: Number }, // em metros
  peso: { type: Number }, // em kg
  adicionadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referência ao admin/treinador que adicionou
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

// Virtual para validar IMC
studentSchema.virtual('imcStatus').get(function() {
  const imc = this.imc;
  if (!imc) return null;
  
  if (imc < 18.5) return 'Baixo peso';
  if (imc < 25) return 'Normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obeso';
});

module.exports = mongoose.model('Student', studentSchema);
