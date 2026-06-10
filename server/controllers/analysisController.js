const Analysis = require('../models/Analysis');

const getAllAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find().populate('aluno').sort({ data: -1 });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAnalysis = async (req, res) => {
  const analysis = new Analysis(req.body);
  try {
    const newAnalysis = await analysis.save();
    res.status(201).json(newAnalysis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAnalysisByStudent = async (req, res) => {
  try {
    const analyses = await Analysis.find({ aluno: req.params.studentId }).sort({ data: -1 });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAnalyses,
  createAnalysis,
  getAnalysisByStudent
};
