const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Dados de Acesso
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  tipo: { 
    type: String, 
    enum: ['Administrador', 'Professor', 'Treinador', 'Coordenador', 'estudante', 'admin'], 
    default: 'estudante' 
  }, // Mantendo estudante/admin por retrocompatibilidade

  // Dados Pessoais
  cpf: { type: String },
  rg: { type: String },
  dataNascimento: { type: Date },
  sexo: { type: String, enum: ['Masculino', 'Feminino', 'Outro'] },
  telefone: { type: String },

  // Endereço e Contato Adicional
  cep: { type: String },
  endereco: { type: String },
  complemento: { type: String },
  cidade: { type: String },
  estado: { type: String },
  nomeResponsavel: { type: String },
  telefoneResponsavel: { type: String },
  alergias: { type: String },
  lesoesAnteriores: { type: String },
  restricoesMedicas: { type: String },
  numeroCamisa: { type: String },

  // Dados Profissionais
  instituicao: { type: String },
  cargo: { type: String },
  modalidadePrincipal: { type: String },
  modalidadesSecundarias: [{ type: String }],
  experiencia: { type: String },
  registroProfissional: { type: String },
  especializacoes: { type: String },

  // Outros (Retrocompatibilidade)
  matricula: { type: String, sparse: true }, 
  esportes: [{ type: String }], 
  foto: { type: String }, 

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
