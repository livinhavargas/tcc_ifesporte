const Cronograma = require('../models/Cronograma');

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
    const data = { ...req.body, criador: req.user.userId };
    const cronograma = new Cronograma(data);
    await cronograma.save();
    res.status(201).json(cronograma);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCronograma = async (req, res) => {
  try {
    const cronograma = await Cronograma.findByIdAndDelete(req.params.id);
    if (!cronograma) return res.status(404).json({ message: 'Cronograma não encontrado' });
    res.json({ message: 'Cronograma removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCronogramas,
  createCronograma,
  deleteCronograma
};
