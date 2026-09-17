const Event = require('../models/Event');
const PhysicalEducationClass = require('../models/PhysicalEducationClass');
const Student = require('../models/Student');
const User = require('../models/User');
const { 
  buildTurmaRegex,
  isTerceiroAno,
  generatePhysicalEducationEvents 
} = require('./physicalEducationController');

const getAllEvents = async (req, res) => {
  try {
    const manualEvents = await Event.find().sort({ data: 1, horaInicial: 1, hora: 1 });

    const userTipo = (req.userTipo || '').toLowerCase();

    // 1. A Agenda do Treinador/Admin NÃO deve ser alimentada automaticamente pelos horários de Educação Física
    if (userTipo !== 'estudante') {
      return res.json(manualEvents);
    }

    // 2. Para estudantes: Apenas 1º e 2º anos possuem aulas de Educação Física integradas à Agenda
    let peClasses = [];
    const user = await User.findById(req.userId);
    if (user) {
      const student = await Student.findOne({
        $or: [
          { email: new RegExp(`^${user.email}$`, 'i') },
          ...(user.matricula ? [{ matricula: user.matricula }] : []),
          ...(user.cpf ? [{ cpf: user.cpf }] : []),
          { _id: user._id }
        ]
      });

      const turmaNome = student?.turma || student?.serie || user.turma;
      const cursoNome = student?.curso || user.curso;

      // 3º Anos NÃO possuem Educação Física
      if (turmaNome && !isTerceiroAno(turmaNome) && !isTerceiroAno(student?.serie) && !isTerceiroAno(user?.serie)) {
        const regex = buildTurmaRegex(turmaNome);
        let peClass = null;

        if (cursoNome) {
          peClass = await PhysicalEducationClass.findOne({
            curso: new RegExp(`^${cursoNome.trim()}$`, 'i'),
            $or: [{ turma: regex }, { turma: turmaNome }],
            anoLetivo: '2026'
          });
        }

        if (!peClass) {
          peClass = await PhysicalEducationClass.findOne({
            $or: [{ turma: regex }, { turma: turmaNome }],
            anoLetivo: '2026'
          });
        }

        if (peClass && !isTerceiroAno(peClass.turma)) {
          peClasses = [peClass];
        }
      }
    }

    const currentYear = new Date().getFullYear() || 2026;
    const peEvents = generatePhysicalEducationEvents(peClasses, currentYear);

    // Combinar eventos manuais com eventos de Educação Física do estudante (1º e 2º ano)
    const combined = [...manualEvents.map(e => e.toObject ? e.toObject() : e), ...peEvents];

    // Ordenar cronologicamente
    combined.sort((a, b) => {
      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      if (dateA - dateB !== 0) return dateA - dateB;
      const horaA = a.horaInicial || a.hora || '00:00';
      const horaB = b.horaInicial || b.hora || '00:00';
      return horaA.localeCompare(horaB);
    });

    res.json(combined);
  } catch (error) {
    console.error('Erro ao listar eventos da agenda:', error);
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  const event = new Event(req.body);
  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id && id.startsWith('pe_')) {
      return res.json({
        _id: id,
        titulo: 'Aula de Educação Física',
        tipo: 'Educação Física',
        isPhysicalEducation: true,
        isReadOnly: true
      });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Evento não encontrado' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (id && id.startsWith('pe_')) {
      return res.status(400).json({ 
        message: 'Os horários de Educação Física são recorrentes e devem ser configurados na aba Educação Física da turma correspondente.' 
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: 'Evento não encontrado' });
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (id && id.startsWith('pe_')) {
      return res.status(400).json({ 
        message: 'Os horários de Educação Física são gerenciados no módulo de Educação Física.' 
      });
    }

    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ message: 'Evento não encontrado' });
    res.json({ message: 'Evento removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent
};
