const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  matricula: { type: String, unique: true, sparse: true },
  serie: { type: String, enum: ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'] },
  sexo: { type: String, enum: ['Masculino', 'Feminino'], required: true },
  idade: { type: Number },
  esportes: [{ type: String }], // nomes das modalidades
  // Campos opcionais
  email: { type: String },
  telefone: { type: String },
  altura: { type: Number }, // em metros
  peso: { type: Number }, // em kg
  foto: { type: String }, // Base64 foto
  adicionadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referência ao admin que adicionou

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
