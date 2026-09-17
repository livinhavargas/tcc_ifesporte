const PhysicalEducationClass = require('../models/PhysicalEducationClass');
const Student = require('../models/Student');
const User = require('../models/User');

// Helper para normalizar e buscar turmas compatíveis (ex: '3º B', '3B', '3 B')
const buildTurmaRegex = (turmaStr) => {
  if (!turmaStr) return null;
  const clean = turmaStr.replace(/[º°\s]/g, '').trim(); // '3B'
  // Se tem dígito e letra (ex: 3 e B)
  const match = clean.match(/^(\d+)([a-zA-Z]+)$/);
  if (match) {
    const num = match[1];
    const letter = match[2];
    return new RegExp(`^${num}[º°]?\\s*${letter}$`, 'i');
  }
  return new RegExp(`^${turmaStr.trim()}$`, 'i');
};

// Helper para identificar se uma turma pertence ao 3º ano escolar
const isTerceiroAno = (turmaStr) => {
  if (!turmaStr) return false;
  const clean = turmaStr.trim().replace(/[º°\s]/g, ''); // '3A', '3B', '3C', '3H'
  return /^3/i.test(clean);
};

// Cursos padrão e turmas padrão do IFesporte (Apenas 1º e 2º anos fazem Educação Física)
const DEFAULT_COURSES = [
  {
    nome: 'Informática para Internet',
    slug: 'informatica-para-internet',
    descricao: 'Curso Técnico Integrado ao Ensino Médio em Informática para Internet',
    turmasPadrao: ['1º A', '1º B', '2º A', '2º B'],
    defaultHorarios: [
      { diaSemana: 'Terça-feira', horario: '08:00', duracaoMinutos: 45 },
      { diaSemana: 'Quinta-feira', horario: '10:00', duracaoMinutos: 45 }
    ]
  },
  {
    nome: 'Hospedagem',
    slug: 'hospedagem',
    descricao: 'Curso Técnico Integrado ao Ensino Médio em Hospedagem',
    turmasPadrao: ['1º H', '2º H'],
    defaultHorarios: [
      { diaSemana: 'Segunda-feira', horario: '09:00', duracaoMinutos: 45 },
      { diaSemana: 'Quarta-feira', horario: '08:00', duracaoMinutos: 45 }
    ]
  }
];

// Garantir que as turmas padrão existam no banco para os 2 cursos
const ensureDefaultClasses = async () => {
  try {
    for (const courseDef of DEFAULT_COURSES) {
      for (const tNome of courseDef.turmasPadrao) {
        const exists = await PhysicalEducationClass.findOne({
          curso: courseDef.nome,
          turma: tNome,
          anoLetivo: '2026'
        });
        if (!exists) {
          await PhysicalEducationClass.create({
            curso: courseDef.nome,
            turma: tNome,
            anoLetivo: '2026',
            horariosSemanais: courseDef.defaultHorarios,
            relatorios: []
          });
        }
      }
    }

    // Atualizar horários padrão legados de 50 minutos para 45 minutos sem alterar horários já configurados
    await PhysicalEducationClass.updateMany(
      { "horariosSemanais.duracaoMinutos": 50 },
      { $set: { "horariosSemanais.$[elem].duracaoMinutos": 45 } },
      { arrayFilters: [{ "elem.duracaoMinutos": 50 }] }
    );
  } catch (err) {
    console.error('Erro ao inicializar turmas padrão de Educação Física:', err);
  }
};

// 1. Obter visão geral dos 2 cursos com estatísticas reais (Apenas 1º e 2º anos)
exports.getCoursesSummary = async (req, res) => {
  try {
    await ensureDefaultClasses();

    const allStudents = await Student.find({}).select('nome matricula turma curso esportes modalidades');
    const allClasses = await PhysicalEducationClass.find({ anoLetivo: '2026' });

    const summary = DEFAULT_COURSES.map(courseDef => {
      // Filtrar apenas turmas de 1º e 2º ano
      const courseClasses = allClasses.filter(c => c.curso === courseDef.nome && !isTerceiroAno(c.turma));
      
      // Contar alunos associados a este curso nas turmas de 1º e 2º ano
      let totalStudentsInCourse = 0;
      courseClasses.forEach(cls => {
        const regex = buildTurmaRegex(cls.turma);
        const count = allStudents.filter(s => {
          if (isTerceiroAno(s.turma) || isTerceiroAno(s.serie)) return false;
          if (s.curso && s.curso.toLowerCase() === courseDef.nome.toLowerCase()) {
            if (regex && s.turma) return regex.test(s.turma);
            return true;
          }
          if (regex && s.turma) return regex.test(s.turma);
          return false;
        }).length;
        totalStudentsInCourse += count;
      });

      // Total de relatórios de aulas do curso
      const totalReports = courseClasses.reduce((sum, c) => sum + (c.relatorios ? c.relatorios.length : 0), 0);

      return {
        nome: courseDef.nome,
        slug: courseDef.slug,
        descricao: courseDef.descricao,
        totalTurmas: courseClasses.length,
        totalAlunos: totalStudentsInCourse,
        totalRelatorios: totalReports
      };
    });

    res.json(summary);
  } catch (error) {
    console.error('Erro ao buscar resumo dos cursos:', error);
    res.status(500).json({ message: 'Erro ao buscar resumo dos cursos de Educação Física.', error: error.message });
  }
};

// 2. Obter turmas de um curso específico com contagem real de alunos (Apenas 1º e 2º anos)
exports.getTurmasByCourse = async (req, res) => {
  try {
    const { cursoSlug } = req.params;
    const courseDef = DEFAULT_COURSES.find(c => c.slug === cursoSlug || c.nome.toLowerCase() === cursoSlug.toLowerCase());

    if (!courseDef) {
      return res.status(404).json({ message: 'Curso não encontrado.' });
    }

    await ensureDefaultClasses();

    const turmas = await PhysicalEducationClass.find({
      curso: courseDef.nome,
      anoLetivo: '2026'
    }).sort({ turma: 1 });

    // Filtrar estritamente apenas 1º e 2º anos (3º anos não participam de Educação Física)
    const filteredTurmas = turmas.filter(t => !isTerceiroAno(t.turma));

    const allStudents = await Student.find({}).select('nome matricula turma curso esportes modalidades');

    const result = filteredTurmas.map(t => {
      const regex = buildTurmaRegex(t.turma);
      const studentCount = allStudents.filter(s => {
        if (isTerceiroAno(s.turma) || isTerceiroAno(s.serie)) return false;
        if (s.curso && s.curso.toLowerCase() === courseDef.nome.toLowerCase()) {
          if (regex && s.turma) return regex.test(s.turma);
          return true;
        }
        if (regex && s.turma) return regex.test(s.turma);
        return false;
      }).length;

      return {
        _id: t._id,
        curso: t.curso,
        turma: t.turma,
        anoLetivo: t.anoLetivo,
        horariosSemanais: t.horariosSemanais || [],
        totalAlunos: studentCount,
        totalRelatorios: t.relatorios ? t.relatorios.length : 0,
        ultimoRelatorio: t.relatorios && t.relatorios.length > 0 
          ? t.relatorios.sort((a, b) => new Date(b.data) - new Date(a.data))[0]
          : null
      };
    });

    res.json({
      curso: courseDef.nome,
      descricao: courseDef.descricao,
      turmas: result
    });
  } catch (error) {
    console.error('Erro ao buscar turmas do curso:', error);
    res.status(500).json({ message: 'Erro ao buscar turmas do curso.', error: error.message });
  }
};

// 3. Obter detalhes da turma: alunos reais, 2 horários semanais e histórico de relatórios
exports.getTurmaDetail = async (req, res) => {
  try {
    const { id } = req.params;
    let turmaDoc = await PhysicalEducationClass.findById(id).populate('professorResponsavel', 'nome email');

    if (!turmaDoc || isTerceiroAno(turmaDoc.turma)) {
      return res.status(404).json({ message: 'Turma de Educação Física não encontrada ou não participa de Educação Física (3ºs anos não possuem Educação Física).' });
    }

    // Buscar alunos reais vinculados à turma
    const regex = buildTurmaRegex(turmaDoc.turma);
    const alunos = await Student.find({
      $or: [
        { turma: regex },
        { turma: turmaDoc.turma },
        { serie: regex },
        { serie: turmaDoc.turma }
      ]
    }).select('nome matricula foto sexo dataNascimento turma curso modalidades esportes telefone email')
      .sort({ nome: 1 });

    // Ordenar relatórios da aula mais recente para a mais antiga
    const sortedRelatorios = (turmaDoc.relatorios || []).sort((a, b) => new Date(b.data) - new Date(a.data));

    res.json({
      _id: turmaDoc._id,
      curso: turmaDoc.curso,
      turma: turmaDoc.turma,
      anoLetivo: turmaDoc.anoLetivo,
      professorResponsavel: turmaDoc.professorResponsavel,
      horariosSemanais: turmaDoc.horariosSemanais || [],
      relatorios: sortedRelatorios,
      alunos: alunos
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes da turma:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes da turma.', error: error.message });
  }
};

// 4. Configurar os 2 dias/horários semanais de aula de Educação Física
exports.updateSchedules = async (req, res) => {
  try {
    if (req.userTipo === 'estudante') {
      return res.status(403).json({ message: 'Acesso negado: estudantes não têm permissão para esta ação.' });
    }

    const { id } = req.params;
    const { horariosSemanais } = req.body;

    if (!Array.isArray(horariosSemanais)) {
      return res.status(400).json({ message: 'Lista de horários semanais inválida.' });
    }

    const turmaDoc = await PhysicalEducationClass.findById(id);
    if (!turmaDoc) {
      return res.status(404).json({ message: 'Turma não encontrada.' });
    }

    turmaDoc.horariosSemanais = horariosSemanais;
    await turmaDoc.save();

    res.json({
      message: 'Horários de aula de Educação Física atualizados com sucesso.',
      horariosSemanais: turmaDoc.horariosSemanais
    });
  } catch (error) {
    console.error('Erro ao atualizar horários:', error);
    res.status(500).json({ message: 'Erro ao salvar horários de aula.', error: error.message });
  }
};

// 5. Registrar novo relatório de aula
exports.addReport = async (req, res) => {
  try {
    if (req.userTipo === 'estudante') {
      return res.status(403).json({ message: 'Acesso negado: estudantes não têm permissão para esta ação.' });
    }

    const { id } = req.params;
    const { data, horario, diaSemana, conteudo, observacoes } = req.body;

    if (!data || !conteudo) {
      return res.status(400).json({ message: 'A data da aula e o conteúdo trabalhado são obrigatórios.' });
    }

    const turmaDoc = await PhysicalEducationClass.findById(id);
    if (!turmaDoc) {
      return res.status(404).json({ message: 'Turma não encontrada.' });
    }

    // Identificar usuário logado a partir de req.userId
    let responsavelNome = req.body.responsavelNome || 'Professor';
    let responsavelId = null;

    if (req.userId) {
      const user = await User.findById(req.userId);
      if (user) {
        responsavelId = user._id;
        responsavelNome = user.nome || responsavelNome;
      }
    }

    const novoRelatorio = {
      data: new Date(data),
      horario: horario || '08:00',
      diaSemana: diaSemana || 'Aula',
      conteudo: conteudo.trim(),
      observacoes: (observacoes || '').trim(),
      responsavel: responsavelId,
      responsavelNome: responsavelNome,
      createdAt: new Date()
    };

    turmaDoc.relatorios.push(novoRelatorio);
    await turmaDoc.save();

    const sortedRelatorios = turmaDoc.relatorios.sort((a, b) => new Date(b.data) - new Date(a.data));

    res.status(201).json({
      message: 'Relatório de aula registrado com sucesso!',
      relatorios: sortedRelatorios
    });
  } catch (error) {
    console.error('Erro ao registrar relatório de aula:', error);
    res.status(500).json({ message: 'Erro ao registrar relatório de aula.', error: error.message });
  }
};

// 6. Editar relatório de aula existente
exports.updateReport = async (req, res) => {
  try {
    if (req.userTipo === 'estudante') {
      return res.status(403).json({ message: 'Acesso negado: estudantes não têm permissão para esta ação.' });
    }

    const { id, relatorioId } = req.params;
    const { data, horario, diaSemana, conteudo, observacoes } = req.body;

    if (!conteudo) {
      return res.status(400).json({ message: 'O conteúdo trabalhado é obrigatório.' });
    }

    const turmaDoc = await PhysicalEducationClass.findById(id);
    if (!turmaDoc) {
      return res.status(404).json({ message: 'Turma não encontrada.' });
    }

    const relatorio = turmaDoc.relatorios.id(relatorioId);
    if (!relatorio) {
      return res.status(404).json({ message: 'Relatório de aula não encontrado.' });
    }

    if (data) relatorio.data = new Date(data);
    if (horario) relatorio.horario = horario;
    if (diaSemana) relatorio.diaSemana = diaSemana;
    relatorio.conteudo = conteudo.trim();
    relatorio.observacoes = (observacoes || '').trim();

    await turmaDoc.save();

    const sortedRelatorios = turmaDoc.relatorios.sort((a, b) => new Date(b.data) - new Date(a.data));

    res.json({
      message: 'Relatório de aula atualizado com sucesso!',
      relatorios: sortedRelatorios
    });
  } catch (error) {
    console.error('Erro ao atualizar relatório de aula:', error);
    res.status(500).json({ message: 'Erro ao atualizar relatório de aula.', error: error.message });
  }
};

// 7. Excluir relatório de aula com confirmação
exports.deleteReport = async (req, res) => {
  try {
    if (req.userTipo === 'estudante') {
      return res.status(403).json({ message: 'Acesso negado: estudantes não têm permissão para esta ação.' });
    }

    const { id, relatorioId } = req.params;

    const turmaDoc = await PhysicalEducationClass.findById(id);
    if (!turmaDoc) {
      return res.status(404).json({ message: 'Turma não encontrada.' });
    }

    const relatorio = turmaDoc.relatorios.id(relatorioId);
    if (!relatorio) {
      return res.status(404).json({ message: 'Relatório de aula não encontrado.' });
    }

    turmaDoc.relatorios.pull(relatorioId);
    await turmaDoc.save();

    const sortedRelatorios = turmaDoc.relatorios.sort((a, b) => new Date(b.data) - new Date(a.data));

    res.json({
      message: 'Relatório de aula excluído com sucesso.',
      relatorios: sortedRelatorios
    });
  } catch (error) {
    console.error('Erro ao excluir relatório de aula:', error);
    res.status(500).json({ message: 'Erro ao excluir relatório de aula.', error: error.message });
  }
};

const DIA_SEMANA_MAP = {
  'domingo': 0,
  'segunda-feira': 1,
  'segunda': 1,
  'terça-feira': 2,
  'terca-feira': 2,
  'terça': 2,
  'terca': 2,
  'quarta-feira': 3,
  'quarta': 3,
  'quinta-feira': 4,
  'quinta': 4,
  'sexta-feira': 5,
  'sexta': 5,
  'sábado': 6,
  'sabado': 6
};

const calculateEndTime = (startTime, durationMinutes = 45) => {
  if (!startTime) return '08:45';
  const parts = startTime.split(':').map(Number);
  const h = isNaN(parts[0]) ? 8 : parts[0];
  const m = isNaN(parts[1]) ? 0 : parts[1];
  const total = h * 60 + m + Number(durationMinutes || 45);
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

const calculateNextPhysicalEducationClass = (horariosSemanais, currentDate = new Date()) => {
  if (!horariosSemanais || horariosSemanais.length === 0) return null;

  const curDayIndex = currentDate.getDay(); // 0 = Domingo, 1 = Segunda, ...
  const curMins = currentDate.getHours() * 60 + currentDate.getMinutes();

  // Avaliar cada horário semanal cadastrado
  const evaluated = horariosSemanais.map(h => {
    const rawDia = (h.diaSemana || '').toLowerCase().trim();
    const schedDayIndex = DIA_SEMANA_MAP[rawDia] !== undefined ? DIA_SEMANA_MAP[rawDia] : 2;
    
    const dur = Number(h.duracaoMinutos) || 45;
    const parts = (h.horario || '08:00').split(':').map(Number);
    const startH = isNaN(parts[0]) ? 8 : parts[0];
    const startM = isNaN(parts[1]) ? 0 : parts[1];
    const startMins = startH * 60 + startM;
    const endMins = startMins + dur;
    const endStr = calculateEndTime(h.horario, dur);

    let distanceDays = 0;
    let status = 'proxima'; // 'em_andamento' | 'hoje' | 'proxima'

    if (schedDayIndex === curDayIndex) {
      if (curMins >= startMins && curMins < endMins) {
        status = 'em_andamento';
        distanceDays = 0;
      } else if (curMins < startMins) {
        status = 'hoje';
        distanceDays = 0;
      } else {
        // Aula de hoje já encerrou -> próxima ocorrência é na próxima semana (+7 dias)
        status = 'proxima';
        distanceDays = 7;
      }
    } else if (schedDayIndex > curDayIndex) {
      distanceDays = schedDayIndex - curDayIndex;
      status = 'proxima';
    } else {
      distanceDays = 7 - (curDayIndex - schedDayIndex);
      status = 'proxima';
    }

    return {
      diaSemana: h.diaSemana,
      horario: h.horario,
      horaInicio: h.horario,
      horaFim: endStr,
      duracaoMinutos: dur,
      horarioFormatado: `${h.horario}–${endStr}`,
      distanceDays,
      startMins,
      status
    };
  });

  // Ordenar priorizando aula em andamento, menor distância em dias e menor horário
  evaluated.sort((a, b) => {
    if (a.status === 'em_andamento' && b.status !== 'em_andamento') return -1;
    if (b.status === 'em_andamento' && a.status !== 'em_andamento') return 1;
    if (a.distanceDays !== b.distanceDays) return a.distanceDays - b.distanceDays;
    return a.startMins - b.startMins;
  });

  const best = evaluated[0];

  let label = '';
  let textoFormatado = '';

  if (best.status === 'em_andamento') {
    label = 'Aula de Educação Física em andamento';
    textoFormatado = `Hoje · ${best.horarioFormatado}`;
  } else if (best.status === 'hoje') {
    label = 'Aula de Educação Física hoje';
    textoFormatado = `Hoje · ${best.horarioFormatado}`;
  } else {
    label = 'Próxima aula de Educação Física';
    textoFormatado = `${best.diaSemana} · ${best.horarioFormatado}`;
  }

  return {
    diaSemana: best.diaSemana,
    horarioInicio: best.horaInicio,
    horarioFim: best.horaFim,
    duracaoMinutos: best.duracaoMinutos,
    horarioFormatado: best.horarioFormatado,
    status: best.status,
    label,
    textoFormatado
  };
};

// Helper para gerar instâncias de eventos de Educação Física para o calendário da Agenda
const generatePhysicalEducationEvents = (classesList, year = 2026) => {
  const events = [];
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  classesList.forEach(cls => {
    if (!cls.horariosSemanais || cls.horariosSemanais.length === 0) return;

    cls.horariosSemanais.forEach((h, hIdx) => {
      const rawDia = (h.diaSemana || '').toLowerCase().trim();
      const schedDayIndex = DIA_SEMANA_MAP[rawDia] !== undefined ? DIA_SEMANA_MAP[rawDia] : 2;
      const dur = Number(h.duracaoMinutos) || 45;
      const endStr = calculateEndTime(h.horario, dur);

      const current = new Date(startOfYear);
      while (current.getDay() !== schedDayIndex) {
        current.setDate(current.getDate() + 1);
      }

      while (current <= endOfYear) {
        const dateStr = current.toISOString().split('T')[0];
        const parts = (h.horario || '08:00').split(':').map(Number);
        const startH = isNaN(parts[0]) ? 8 : parts[0];
        const startM = isNaN(parts[1]) ? 0 : parts[1];

        const endParts = endStr.split(':').map(Number);
        const endH = isNaN(endParts[0]) ? 8 : endParts[0];
        const endM = isNaN(endParts[1]) ? 45 : endParts[1];

        const startDateTime = new Date(current);
        startDateTime.setHours(startH, startM, 0, 0);

        const endDateTime = new Date(current);
        endDateTime.setHours(endH, endM, 0, 0);

        events.push({
          _id: `pe_${cls._id}_${dateStr}_${hIdx}`,
          titulo: `Educação Física — ${cls.turma}`,
          tipo: 'Educação Física',
          descricao: `Aula semanal de Educação Física da turma ${cls.turma} (${cls.curso})`,
          curso: cls.curso,
          turma: cls.turma,
          data: startDateTime,
          horaInicial: h.horario,
          horaFinal: endStr,
          hora: h.horario,
          localNome: 'Ginásio / Quadra Poliesportiva',
          local: 'Ginásio / Quadra Poliesportiva',
          duracaoEstimada: `${dur} min`,
          isPhysicalEducation: true,
          isReadOnly: true,
          eventoObrigatorio: false,
          cor: '#10b981'
        });

        current.setDate(current.getDate() + 7);
      }
    });
  });

  return events;
};

// 8. Obter a próxima aula / aula em andamento de Educação Física do estudante autenticado
exports.getMyNextClass = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Não autenticado.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Buscar perfil de Student vinculado
    let student = await Student.findOne({
      $or: [
        { email: new RegExp(`^${user.email}$`, 'i') },
        ...(user.matricula ? [{ matricula: user.matricula }] : []),
        ...(user.cpf ? [{ cpf: user.cpf }] : []),
        { _id: user._id }
      ]
    });

    const turmaNome = student?.turma || student?.serie || user.turma;
    const cursoNome = student?.curso || user.curso;

    if (!turmaNome) {
      return res.json({
        hasTurma: false,
        message: 'Não foi possível identificar sua turma para consultar as aulas de Educação Física.'
      });
    }

    // Regra definitiva: 3ºs anos NÃO possuem Educação Física
    if (isTerceiroAno(turmaNome) || isTerceiroAno(student?.serie) || isTerceiroAno(user?.serie)) {
      return res.json({
        hasTurma: true,
        isThirdYear: true,
        hasHorarios: false,
        turma: turmaNome,
        curso: cursoNome || 'Curso Técnico',
        message: 'Turmas de 3º ano não possuem aulas de Educação Física.'
      });
    }

    // Buscar a turma de Educação Física correspondente
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

    if (!peClass || !peClass.horariosSemanais || peClass.horariosSemanais.length === 0) {
      return res.json({
        hasTurma: true,
        hasHorarios: false,
        turma: turmaNome,
        curso: cursoNome || 'Curso Técnico',
        message: 'Os horários de Educação Física ainda não foram configurados para sua turma.'
      });
    }

    // Calcular próxima aula / aula em andamento de forma dinâmica
    const nextClassInfo = calculateNextPhysicalEducationClass(peClass.horariosSemanais, new Date());

    res.json({
      hasTurma: true,
      hasHorarios: true,
      turma: peClass.turma,
      curso: peClass.curso,
      horariosSemanais: peClass.horariosSemanais,
      proximaAula: nextClassInfo
    });
  } catch (error) {
    console.error('Erro ao consultar próxima aula do estudante:', error);
    res.status(500).json({ message: 'Erro ao consultar próxima aula de Educação Física.', error: error.message });
  }
};

// Exportar helpers para integração com a Agenda
exports.isTerceiroAno = isTerceiroAno;
exports.buildTurmaRegex = buildTurmaRegex;
exports.DIA_SEMANA_MAP = DIA_SEMANA_MAP;
exports.calculateEndTime = calculateEndTime;
exports.calculateNextPhysicalEducationClass = calculateNextPhysicalEducationClass;
exports.generatePhysicalEducationEvents = generatePhysicalEducationEvents;

