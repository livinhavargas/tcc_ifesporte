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
          'Corridas - 100 metros rasos',
          'Corridas - 200 metros rasos',
          'Corridas - 400 metros rasos',
          'Corridas - 800 metros meio-fundo',
          'Corridas - 1500 metros meio-fundo',
          'Corridas - 3000 metros meio-fundo',
          'Corridas - 5000 metros meio-fundo',
          'Corridas - Revezamento',
          'Saltos - Salto em altura',
          'Saltos - Salto em distância',
          'Saltos - Salto triplo',
          'Saltos - Triátlo',
          'Lançamentos e Arremessos - Disco',
          'Lançamentos e Arremessos - Dardo',
          'Lançamentos e Arremessos - Arremesso de peso'
        ]
      },
      {
        nome: 'Tênis de Mesa',
        tipo: 'individual',
        subcategorias: ['Simples Masculino', 'Simples Feminino', 'Duplas Mistas']
      },
      {
        nome: 'Xadrez',
        tipo: 'individual',
        subcategorias: ['Clássico', 'Rápido', 'Relâmpago']
      },
      // Modalidades Coletivas
      {
        nome: 'Futsal',
        tipo: 'coletivo',
        subcategorias: ['Masculino', 'Feminino', 'Misto']
      },
      {
        nome: 'Handebol',
        tipo: 'coletivo',
        subcategorias: ['Masculino', 'Feminino']
      },
      {
        nome: 'Basquete',
        tipo: 'coletivo',
        subcategorias: ['Masculino', 'Feminino']
      },
      {
        nome: 'Vôlei',
        tipo: 'coletivo',
        subcategorias: ['Masculino', 'Feminino', 'Misto']
      },
      {
        nome: 'Vôlei de Praia',
        tipo: 'coletivo',
        subcategorias: ['Masculino', 'Feminino', 'Misto']
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
