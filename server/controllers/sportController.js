const Sport = require('../models/Sport');

const ATLETISMO_SUBCATEGORIAS = [
  '100m Rasos',
  '200m Rasos',
  '400m Rasos',
  '100m com Barreiras',
  '110m com Barreiras',
  '400m com Barreiras',
  '800m Rasos',
  '1.500m Rasos',
  '3.000m Rasos',
  '5.000m Rasos',
  '10.000m Rasos',
  '4x100m',
  '4x400m',
  'Salto em Altura',
  'Salto com Vara',
  'Salto em Distância',
  'Salto Triplo',
  'Arremesso de Peso',
  'Lançamento de Dardo',
  'Lançamento de Disco',
  'Arremesso de Martelo',
  'Pentatlo'
];

const DEFAULT_SPORTS = [
  // Modalidades Individuais
  {
    nome: 'Atletismo',
    tipo: 'individual',
    subcategorias: ATLETISMO_SUBCATEGORIAS
  },
  {
    nome: 'Badminton',
    tipo: 'individual',
    subcategorias: []
  },
  {
    nome: 'Tênis de Mesa',
    tipo: 'individual',
    subcategorias: ['Individual', 'Misto']
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
    nome: 'Voleibol',
    tipo: 'coletivo',
    subcategorias: []
  },
  {
    nome: 'Vôlei de Praia',
    tipo: 'coletivo',
    subcategorias: []
  }
];

const ensureDefaultSports = async () => {
  try {
    for (const sportData of DEFAULT_SPORTS) {
      // Buscar se já existe pelo nome (case insensitive)
      const existingList = await Sport.find({
        nome: new RegExp(`^${sportData.nome.trim()}$`, 'i')
      });

      if (existingList.length === 0) {
        await Sport.create(sportData);
      } else {
        const primary = existingList[0];

        // Se houver duplicatas no banco, remover as extras para evitar duplicidade
        if (existingList.length > 1) {
          for (let i = 1; i < existingList.length; i++) {
            await Sport.findByIdAndDelete(existingList[i]._id);
          }
        }

        // Se for Atletismo, garantir todas as 22 submodalidades padronizadas
        if (primary.nome.toLowerCase() === 'atletismo') {
          primary.subcategorias = ATLETISMO_SUBCATEGORIAS;
          await primary.save();
        }
      }
    }
  } catch (err) {
    console.error('Erro ao garantir modalidades padrão:', err);
  }
};

const getAllSports = async (req, res) => {
  try {
    await ensureDefaultSports();
    const sports = await Sport.find().sort({ nome: 1 });
    res.json(sports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSport = async (req, res) => {
  try {
    const nomeLimpo = (req.body.nome || '').trim();
    const existing = await Sport.findOne({
      nome: new RegExp(`^${nomeLimpo}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({ message: `A modalidade "${nomeLimpo}" já está cadastrada no sistema.` });
    }

    const sport = new Sport(req.body);
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
    await ensureDefaultSports();
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

