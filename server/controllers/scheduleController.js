const Schedule = require('../models/Schedule');

const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ createdAt: -1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateSchedule = async (req, res) => {
  const { modalidade, genero, periodo, frequenciaSemanal, dataCompeticao } = req.body;
  
  const compDate = new Date(dataCompeticao);
  const startDate = new Date();
  const diffTime = compDate - startDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks < 4) {
    return res.status(400).json({ message: 'O período de treinamento deve ser de pelo menos 4 semanas.' });
  }

  // Lógica simples de divisão de fases
  const prepWeeks = Math.floor(diffWeeks * 0.5);
  const compWeeks = Math.floor(diffWeeks * 0.3);
  const transWeeks = diffWeeks - prepWeeks - compWeeks;

  const phases = [
    {
      nome: 'Preparatória',
      duracaoSemanas: prepWeeks,
      quantidadeTreinos: prepWeeks * frequenciaSemanal,
      objetivos: 'Desenvolvimento da base física, técnica e tática geral.',
      inicio: new Date(startDate),
      fim: new Date(new Date(startDate).setDate(startDate.getDate() + (prepWeeks * 7)))
    },
    {
      nome: 'Competitiva',
      duracaoSemanas: compWeeks,
      quantidadeTreinos: compWeeks * frequenciaSemanal,
      objetivos: 'Ajustes finos, estratégia de jogo e manutenção da performance máxima.',
      inicio: new Date(new Date(startDate).setDate(startDate.getDate() + (prepWeeks * 7))),
      fim: new Date(new Date(startDate).setDate(startDate.getDate() + ((prepWeeks + compWeeks) * 7)))
    },
    {
      nome: 'Transição',
      duracaoSemanas: transWeeks,
      quantidadeTreinos: transWeeks * frequenciaSemanal,
      objetivos: 'Recuperação ativa, polimento final e preparação psicológica para a competição.',
      inicio: new Date(new Date(startDate).setDate(startDate.getDate() + ((prepWeeks + compWeeks) * 7))),
      fim: compDate
    }
  ];

  const schedule = new Schedule({
    modalidade,
    genero,
    periodo,
    frequenciaSemanal,
    dataCompeticao,
    fases: phases
  });

  try {
    const newSchedule = await schedule.save();
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllSchedules,
  generateSchedule
};
