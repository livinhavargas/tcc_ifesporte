const mongoose = require('mongoose');

const physicalAssessmentSchema = new mongoose.Schema({
  // Vínculos
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  avaliador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Seção 1: Dados da avaliação
  dataAvaliacao: { type: Date, required: true },
  horario: { type: String }, // Ex: "09:30"
  temperatura: { type: Number }, // Em °C
  modalidade: { type: String }, // Modalidade esportiva frequente
  frequenciaSemanal: { type: Number }, // Sessões por semana
  duracaoSessao: { type: Number }, // Minutos por sessão
  tempoPratica: { type: String }, // Ex: "2 anos", "6 meses"
  possuiDeficiencia: { type: Boolean, default: false },
  deficienciaDescricao: { type: String },

  // Seção 2: Medidas corporais (Antropometria)
  medidas: {
    massaCorporal: { type: Number }, // kg (1 decimal)
    estatura: { type: Number },      // cm (1 decimal)
    envergadura: { type: Number },   // cm (1 decimal)
    perimetroCintura: { type: Number } // cm (1 decimal)
  },

  // Seção 3: Cálculos Automáticos
  calculos: {
    imc: { type: Number },
    rce: { type: Number },
    corrida6MinTotal: { type: Number },
    sentarAlcançarMelhor: { type: Number },
    arremessoMedicineBallMelhor: { type: Number },
    saltoHorizontalMelhor: { type: Number },
    quadrado4x4Melhor: { type: Number },
    corrida20mMelhor: { type: Number }
  },

  // Seção 4: Testes de Aptidão Física (PROESP-Br 2021)
  testes: {
    corrida6Min: {
      voltas: { type: Number },
      perimetroPista: { type: Number, default: 200 },
      metrosUltimaVolta: { type: Number },
      totalMetros: { type: Number }
    },
    sentarAlcançar: {
      tentativa1: { type: Number },
      tentativa2: { type: Number },
      melhorResultado: { type: Number }
    },
    abdominais1Min: {
      repeticoes: { type: Number }
    },
    arremessoMedicineBall: {
      tentativa1: { type: Number },
      tentativa2: { type: Number },
      melhorResultado: { type: Number }
    },
    saltoHorizontal: {
      tentativa1: { type: Number },
      tentativa2: { type: Number },
      melhorResultado: { type: Number }
    },
    quadrado4x4: {
      tentativa1: { type: Number },
      tentativa2: { type: Number },
      melhorResultado: { type: Number }
    },
    corrida20m: {
      tentativa1: { type: Number },
      tentativa2: { type: Number },
      melhorResultado: { type: Number }
    }
  },

  // Seção 5: Classificações PROESP-Br 2021
  classificacoes: {
    desempenho: {
      corrida6Min: { type: String },
      sentarAlcançar: { type: String },
      abdominais1Min: { type: String },
      arremessoMedicineBall: { type: String },
      saltoHorizontal: { type: String },
      quadrado4x4: { type: String },
      corrida20m: { type: String }
    },
    saude: {
      imc: { type: String },
      rce: { type: String },
      aptidaoCardiorrespiratoria: { type: String },
      flexibilidade: { type: String },
      resistenciaMuscular: { type: String }
    }
  },

  observacoes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PhysicalAssessment', physicalAssessmentSchema);
