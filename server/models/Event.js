const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  tipo: { type: String, enum: ['Treino', 'Amistoso', 'Campeonato', 'Reunião', 'Outro'], default: 'Treino' },
  descricao: { type: String },
  
  modalidade: { type: String },
  categoria: { type: String },
  equipeParticipante: { type: String },

  data: { type: Date, required: true },
  horaInicial: { type: String, required: true }, // Antigo "hora"
  horaFinal: { type: String },
  duracaoEstimada: { type: String }, // ex: "90 min"

  localNome: { type: String }, // Antigo "local"
  localTipo: { type: String, enum: ['Quadra', 'Ginásio', 'Campo', 'Outro'] },
  localEndereco: { type: String },
  localObservacoes: { type: String },

  responsavel: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  treinadoresAuxiliares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  
  eventoObrigatorio: { type: Boolean, default: false },
  eventoRecorrente: { type: Boolean, default: false },
  eventoPrivado: { type: Boolean, default: false },

  anexos: [{ type: String }], // URLs ou caminhos

  cor: { type: String, default: '#eab308' },
  criador: { type: String }, // Nome do criador, retrocompatibilidade
  
  // Campos de retrocompatibilidade
  hora: { type: String },
  local: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
