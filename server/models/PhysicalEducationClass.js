const mongoose = require('mongoose');

const physicalEducationClassSchema = new mongoose.Schema({
  curso: {
    type: String,
    required: true,
    enum: ['Hospedagem', 'Informática para Internet', 'Outro']
  },
  turma: {
    type: String,
    required: true,
    trim: true
  },
  anoLetivo: {
    type: String,
    default: '2026'
  },
  descricao: {
    type: String
  },
  professorResponsavel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // 2 horários/dias de Educação Física por semana (configuráveis)
  horariosSemanais: [
    {
      diaSemana: { 
        type: String, 
        required: true,
        enum: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
      },
      horario: { 
        type: String, 
        required: true 
      }, // Ex: "08:00", "10:00"
      duracaoMinutos: {
        type: Number,
        default: 45
      }
    }
  ],

  // Relatórios históricos das aulas realizadas
  relatorios: [
    {
      data: {
        type: Date,
        required: true
      },
      horario: {
        type: String,
        required: true
      },
      diaSemana: {
        type: String
      },
      conteudo: {
        type: String,
        required: true
      },
      observacoes: {
        type: String,
        default: ''
      },
      responsavel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      responsavelNome: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

// Índice composto para evitar duplicação de turma no mesmo curso e ano letivo
physicalEducationClassSchema.index({ curso: 1, turma: 1, anoLetivo: 1 }, { unique: true });

module.exports = mongoose.model('PhysicalEducationClass', physicalEducationClassSchema);
