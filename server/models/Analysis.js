const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  modalidade: { 
    type: String, 
    required: true,
    trim: true
  },
  categoria: { 
    type: String, 
    default: 'Geral',
    trim: true
  },
  subtipoProva: { 
    type: String,
    trim: true
  },
  data: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
  avaliador: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Campos de Confronto / Partida
  equipeAdversaria: { 
    type: String,
    trim: true
  },
  resultado: { 
    type: String, 
    enum: ['Vitória', 'Derrota', 'Empate', null]
  },
  placar: { 
    type: mongoose.Schema.Types.Mixed 
  },
  
  // Vinculação de Atleta(s)
  aluno: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  },
  atletas: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  }],
  
  // Dados específicos estritos de cada modalidade esportiva
  dadosEspecificos: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  
  // Observações livres do treinador
  observacoes: { 
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
