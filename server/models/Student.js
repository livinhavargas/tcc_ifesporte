const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Informações Pessoais
  nome: { type: String, required: true },
  dataNascimento: { type: Date },
  sexo: { type: String, enum: ['Masculino', 'Feminino'], required: true },
  cpf: { type: String },
  rg: { type: String },
  foto: { type: String },
  telefone: { type: String },
  email: { type: String },
  endereco: { type: String },
  cidade: { type: String },
  estado: { type: String },
  cep: { type: String },
  idade: { type: Number }, // Mantido por retrocompatibilidade

  // Informações Escolares
  matricula: { type: String, unique: true, sparse: true },
  turma: { type: String }, // Substitui a 'serie' antiga por algo mais genérico
  serie: { type: String }, // Mantido por retrocompatibilidade
  curso: { type: String },
  anoLetivo: { type: String },
  instituicao: { type: String },

  // Informações Esportivas
  esportes: [{ type: String }], // Mantido por retrocompatibilidade
  modalidades: [{ type: String }], // Novo formato
  categoria: { type: String },
  posicao: { type: String },
  tempoPratica: { type: String },
  treinadorResponsavel: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  equipe: { type: String },
  numeroCamisa: { type: String },
  dominancia: { type: String, enum: ['Destro', 'Canhoto', 'Ambidestro'] },

  // Informações Médicas e Contato
  alergias: { type: String },
  medicamentos: { type: String },
  restricoesMedicas: { type: String },
  lesoesAnteriores: { type: String },
  contatoEmergencia: { type: String }, // legado
  observacoesMedicas: { type: String },
  nomeResponsavel: { type: String },
  telefoneResponsavel: { type: String },

  // Físico (retrocompatibilidade)
  altura: { type: Number },
  peso: { type: Number },

  // Status
  situacao: { 
    type: String, 
    enum: ['Ativo', 'Inativo', 'Afastado', 'Lesionado', 'Transferido'], 
    default: 'Ativo' 
  },
  
  adicionadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
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

studentSchema.virtual('imcStatus').get(function() {
  const imc = this.imc;
  if (!imc) return null;
  if (imc < 18.5) return 'Baixo peso';
  if (imc < 25) return 'Normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obeso';
});

module.exports = mongoose.model('Student', studentSchema);
