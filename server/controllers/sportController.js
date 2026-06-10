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

module.exports = {
  getAllSports,
  createSport,
  getSportById,
  updateSport,
  deleteSport
};
