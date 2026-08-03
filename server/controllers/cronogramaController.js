const Cronograma = require('../models/Cronograma');
const Event = require('../models/Event');
const User = require('../models/User');

const getAllCronogramas = async (req, res) => {
  try {
    const { modalidade } = req.query;
    let filter = {};
    if (modalidade) filter.modalidade = modalidade;
    
    const cronogramas = await Cronograma.find(filter).sort({ dataInicio: 1 });
    res.json(cronogramas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCronograma = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const data = { 
      ...req.body, 
      criador: req.userId,
      treinadorResponsavel: user ? user.nome : 'Não informado'
    };
    const cronograma = new Cronograma(data);
    await cronograma.save();
    res.status(201).json(cronograma);
  } catch (error) {
    console.error("Erro em createCronograma:", error.message, error);
    res.status(400).json({ message: error.message });
  }
};

const deleteCronograma = async (req, res) => {
  try {
    const cronograma = await Cronograma.findById(req.params.id);
    if (!cronograma) return res.status(404).json({ message: 'Cronograma não encontrado' });
    
    // Deleta os eventos vinculados da agenda
    if (cronograma.eventosVinculados && cronograma.eventosVinculados.length > 0) {
      await Event.deleteMany({ _id: { $in: cronograma.eventosVinculados } });
    }
    
    await Cronograma.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cronograma removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCronograma = async (req, res) => {
  try {
    const cronogramaAntigo = await Cronograma.findById(req.params.id);
    if (!cronogramaAntigo) return res.status(404).json({ message: 'Cronograma não encontrado' });

    // Se houver eventos antigos, excluí-los (só no backend pra não sujar a agenda)
    // O frontend enviará req.body.eventosVinculados vazio ou com os novos eventos
    if (req.body.fases && cronogramaAntigo.eventosVinculados && cronogramaAntigo.eventosVinculados.length > 0) {
      // Como o cronograma inteiro foi re-gerado/atualizado, vamos apagar os eventos antigos da agenda
      // A responsabilidade de recriá-los ficará pro front end enviar no save se tiver optado.
      if (req.body.removerEventosAntigos) {
         await Event.deleteMany({ _id: { $in: cronogramaAntigo.eventosVinculados } });
         req.body.eventosVinculados = [];
      }
    }

    const user = await User.findById(req.userId);
    if (user) {
      req.body.treinadorResponsavel = user.nome;
    }

    const cronograma = await Cronograma.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cronograma);
  } catch (error) {
    console.error("Erro em updateCronograma:", error.message, error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllCronogramas,
  createCronograma,
  deleteCronograma,
  updateCronograma
};
