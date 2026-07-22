const Sport = require('../models/Sport');

const getAllSports = async (req, res) => {
  try {
    const sports = await Sport.find().sort({ nome: 1 });
    res.json(sports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSport = async (req, res) => {
  const sport = new Sport(req.body);
  try {
    const newSport = await sport.save();
    res.status(201).json(newSport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSportById = async (req, res) => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) return res.status(404).json({ message: 'Modalidade não encontrada' });
    res.json(sport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSport = async (req, res) => {
  try {
    const updatedSport = await Sport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSport) return res.status(404).json({ message: 'Modalidade não encontrada' });
    res.json(updatedSport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSport = async (req, res) => {
  try {
    const sport = await Sport.findByIdAndDelete(req.params.id);
    if (!sport) return res.status(404).json({ message: 'Modalidade não encontrada' });
    res.json({ message: 'Modalidade removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Inicializar modalidades padrão
const initializeSports = async (req, res) => {
  try {
    const defaultSports = [
      // Modalidades Individuais
      {
        nome: 'Atletismo',
        tipo: 'individual',
        subcategorias: [
          'Corridas - 100m rasos',
          'Corridas - 200m rasos',
          'Corridas - 400m rasos',
          'Corridas - 800m',
          'Corridas - 1500m',
          'Corridas - 3000m',
          'Corridas - 5000m',
          'Corridas - Revezamento 4x100',
          'Corridas - Revezamento 4x400',
          'Saltos - Salto em Distância',
          'Saltos - Salto em Altura',
          'Saltos - Salto Triplo',
          'Lançamentos - Disco',
          'Lançamentos - Dardo',
          'Lançamentos - Peso'
        ]
      },
      {
        nome: 'Badminton',
        tipo: 'individual',
        subcategorias: []
      },
      {
        nome: 'Tênis de Mesa',
        tipo: 'individual',
        subcategorias: ['Individual', 'Dupla']
      },
      {
        nome: 'Xadrez',
        tipo: 'individual',
        subcategorias: []
      },
      // Modalidades Coletivas
      {
        nome: 'Basquete',
        tipo: 'coletivo',
        subcategorias: []
      },
      {
        nome: 'Futsal',
        tipo: 'coletivo',
        subcategorias: []
      },
      {
        nome: 'Futebol',
        tipo: 'coletivo',
        subcategorias: []
      },
      {
        nome: 'Handebol',
        tipo: 'coletivo',
        subcategorias: []
      },
      {
        nome: 'Vôlei de Quadra',
        tipo: 'coletivo',
        subcategorias: []
      },
      {
        nome: 'Vôlei de Praia (Duplas)',
        tipo: 'coletivo',
        subcategorias: []
      }
    ];

    // Verificar quais esportes já existem e adicionar apenas os novos
    for (const sportData of defaultSports) {
      const existingFlag = await Sport.findOne({ nome: sportData.nome });
      if (!existingFlag) {
        await Sport.create(sportData);
        console.log(`✅ Modalidade ${sportData.nome} criada`);
      } else {
        console.log(`⚠️  Modalidade ${sportData.nome} já existe`);
      }
    }

    res.json({ mensagem: 'Modalidades inicializadas com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllSports,
  createSport,
  getSportById,
  updateSport,
  deleteSport,
  initializeSports
};
