const PhysicalAssessment = require('../models/PhysicalAssessment');
const Student = require('../models/Student');
const User = require('../models/User');
const { calculateAge, classifyPROESP } = require('../utils/proespCalculator');

// Obter histórico de avaliações de um estudante
exports.getByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    let targetStudentId = studentId;

    // Se o studentId for de um User, buscar o Student correspondente
    const linkedStudent = await Student.findOne({ 
      $or: [{ _id: studentId }, { usuario: studentId }] 
    });
    if (linkedStudent) {
      targetStudentId = linkedStudent._id;
    }

    const assessments = await PhysicalAssessment.find({ aluno: targetStudentId })
      .populate('avaliador', 'nome email')
      .sort({ dataAvaliacao: -1, createdAt: -1 });

    res.json(assessments);
  } catch (error) {
    console.error('Erro ao buscar avaliações físicas do aluno:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico de aptidão física.', error: error.message });
  }
};

// Obter uma avaliação física específica
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await PhysicalAssessment.findById(id)
      .populate('aluno', 'nome dataNascimento sexo modalidades posicoesPorModalidade matricula turma foto')
      .populate('avaliador', 'nome email');

    if (!assessment) {
      return res.status(404).json({ message: 'Avaliação física não encontrada.' });
    }

    res.json(assessment);
  } catch (error) {
    console.error('Erro ao buscar avaliação física:', error);
    res.status(500).json({ message: 'Erro ao buscar avaliação física.', error: error.message });
  }
};

// Criar nova avaliação física
exports.create = async (req, res) => {
  try {
    const {
      alunoId,
      dataAvaliacao,
      horario,
      temperatura,
      modalidade,
      frequenciaSemanal,
      duracaoSessao,
      tempoPratica,
      possuiDeficiencia,
      deficienciaDescricao,
      medidas = {},
      testes = {},
      observacoes
    } = req.body;

    if (!alunoId) {
      return res.status(400).json({ message: 'O ID do aluno é obrigatório.' });
    }

    if (!dataAvaliacao) {
      return res.status(400).json({ message: 'A data da avaliação é obrigatória.' });
    }

    // Buscar dados cadastrais do aluno para idade e sexo
    const student = await Student.findById(alunoId);
    let studentUser = null;
    if (student && student.usuario) {
      studentUser = await User.findById(student.usuario);
    }

    const sexo = student?.sexo || studentUser?.sexo || req.body.sexo || null;
    const dataNasc = student?.dataNascimento || studentUser?.dataNascimento || null;
    const idade = calculateAge(dataNasc, dataAvaliacao) ?? (student?.idade || studentUser?.idade || null);

    // Processar cálculos e classificações no backend
    const proespResult = classifyPROESP({
      idade,
      sexo,
      medidas,
      testes
    });

    const parsedDataAvaliacao = new Date(dataAvaliacao);

    const assessment = new PhysicalAssessment({
      aluno: alunoId,
      avaliador: req.userId || req.body.avaliadorId || null,
      dataAvaliacao: parsedDataAvaliacao,
      horario: horario || '',
      temperatura: temperatura !== undefined && temperatura !== '' ? Number(temperatura) : undefined,
      modalidade: modalidade || '',
      frequenciaSemanal: frequenciaSemanal !== undefined && frequenciaSemanal !== '' ? Number(frequenciaSemanal) : undefined,
      duracaoSessao: duracaoSessao !== undefined && duracaoSessao !== '' ? Number(duracaoSessao) : undefined,
      tempoPratica: tempoPratica || '',
      possuiDeficiencia: !!possuiDeficiencia,
      deficienciaDescricao: possuiDeficiencia ? (deficienciaDescricao || '') : '',
      medidas: {
        massaCorporal: medidas.massaCorporal !== undefined && medidas.massaCorporal !== '' ? Number(medidas.massaCorporal) : undefined,
        estatura: medidas.estatura !== undefined && medidas.estatura !== '' ? Number(medidas.estatura) : undefined,
        envergadura: medidas.envergadura !== undefined && medidas.envergadura !== '' ? Number(medidas.envergadura) : undefined,
        perimetroCintura: medidas.perimetroCintura !== undefined && medidas.perimetroCintura !== '' ? Number(medidas.perimetroCintura) : undefined
      },
      calculos: proespResult.calculos,
      testes: {
        corrida6Min: {
          voltas: testes.corrida6Min?.voltas !== undefined && testes.corrida6Min?.voltas !== '' ? Number(testes.corrida6Min.voltas) : undefined,
          perimetroPista: testes.corrida6Min?.perimetroPista !== undefined && testes.corrida6Min?.perimetroPista !== '' ? Number(testes.corrida6Min.perimetroPista) : 200,
          metrosUltimaVolta: testes.corrida6Min?.metrosUltimaVolta !== undefined && testes.corrida6Min?.metrosUltimaVolta !== '' ? Number(testes.corrida6Min.metrosUltimaVolta) : undefined,
          totalMetros: proespResult.calculos.corrida6MinTotal
        },
        sentarAlcançar: {
          tentativa1: testes.sentarAlcançar?.tentativa1 !== undefined && testes.sentarAlcançar?.tentativa1 !== '' ? Number(testes.sentarAlcançar.tentativa1) : undefined,
          tentativa2: testes.sentarAlcançar?.tentativa2 !== undefined && testes.sentarAlcançar?.tentativa2 !== '' ? Number(testes.sentarAlcançar.tentativa2) : undefined,
          melhorResultado: proespResult.calculos.sentarAlcançarMelhor
        },
        abdominais1Min: {
          repeticoes: testes.abdominais1Min?.repeticoes !== undefined && testes.abdominais1Min?.repeticoes !== '' ? Number(testes.abdominais1Min.repeticoes) : undefined
        },
        arremessoMedicineBall: {
          tentativa1: testes.arremessoMedicineBall?.tentativa1 !== undefined && testes.arremessoMedicineBall?.tentativa1 !== '' ? Number(testes.arremessoMedicineBall.tentativa1) : undefined,
          tentativa2: testes.arremessoMedicineBall?.tentativa2 !== undefined && testes.arremessoMedicineBall?.tentativa2 !== '' ? Number(testes.arremessoMedicineBall.tentativa2) : undefined,
          melhorResultado: proespResult.calculos.arremessoMedicineBallMelhor
        },
        saltoHorizontal: {
          tentativa1: testes.saltoHorizontal?.tentativa1 !== undefined && testes.saltoHorizontal?.tentativa1 !== '' ? Number(testes.saltoHorizontal.tentativa1) : undefined,
          tentativa2: testes.saltoHorizontal?.tentativa2 !== undefined && testes.saltoHorizontal?.tentativa2 !== '' ? Number(testes.saltoHorizontal.tentativa2) : undefined,
          melhorResultado: proespResult.calculos.saltoHorizontalMelhor
        },
        quadrado4x4: {
          tentativa1: testes.quadrado4x4?.tentativa1 !== undefined && testes.quadrado4x4?.tentativa1 !== '' ? Number(testes.quadrado4x4.tentativa1) : undefined,
          tentativa2: testes.quadrado4x4?.tentativa2 !== undefined && testes.quadrado4x4?.tentativa2 !== '' ? Number(testes.quadrado4x4.tentativa2) : undefined,
          melhorResultado: proespResult.calculos.quadrado4x4Melhor
        },
        corrida20m: {
          tentativa1: testes.corrida20m?.tentativa1 !== undefined && testes.corrida20m?.tentativa1 !== '' ? Number(testes.corrida20m.tentativa1) : undefined,
          tentativa2: testes.corrida20m?.tentativa2 !== undefined && testes.corrida20m?.tentativa2 !== '' ? Number(testes.corrida20m.tentativa2) : undefined,
          melhorResultado: proespResult.calculos.corrida20mMelhor
        }
      },
      classificacoes: proespResult.classificacoes,
      observacoes: observacoes || ''
    });

    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    console.error('Erro ao criar avaliação física:', error);
    res.status(500).json({ message: 'Erro ao salvar avaliação física.', error: error.message });
  }
};

// Atualizar avaliação física existente
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await PhysicalAssessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ message: 'Avaliação física não encontrada.' });
    }

    const {
      dataAvaliacao,
      horario,
      temperatura,
      modalidade,
      frequenciaSemanal,
      duracaoSessao,
      tempoPratica,
      possuiDeficiencia,
      deficienciaDescricao,
      medidas = {},
      testes = {},
      observacoes
    } = req.body;

    const student = await Student.findById(assessment.aluno);
    let studentUser = null;
    if (student && student.usuario) {
      studentUser = await User.findById(student.usuario);
    }

    const targetDate = dataAvaliacao || assessment.dataAvaliacao;
    const sexo = student?.sexo || studentUser?.sexo || req.body.sexo || null;
    const dataNasc = student?.dataNascimento || studentUser?.dataNascimento || null;
    const idade = calculateAge(dataNasc, targetDate) ?? (student?.idade || studentUser?.idade || null);

    const proespResult = classifyPROESP({
      idade,
      sexo,
      medidas,
      testes
    });

    assessment.dataAvaliacao = targetDate ? new Date(targetDate) : assessment.dataAvaliacao;
    assessment.horario = horario !== undefined ? horario : assessment.horario;
    assessment.temperatura = temperatura !== undefined && temperatura !== '' ? Number(temperatura) : assessment.temperatura;
    assessment.modalidade = modalidade !== undefined ? modalidade : assessment.modalidade;
    assessment.frequenciaSemanal = frequenciaSemanal !== undefined && frequenciaSemanal !== '' ? Number(frequenciaSemanal) : assessment.frequenciaSemanal;
    assessment.duracaoSessao = duracaoSessao !== undefined && duracaoSessao !== '' ? Number(duracaoSessao) : assessment.duracaoSessao;
    assessment.tempoPratica = tempoPratica !== undefined ? tempoPratica : assessment.tempoPratica;
    assessment.possuiDeficiencia = possuiDeficiencia !== undefined ? !!possuiDeficiencia : assessment.possuiDeficiencia;
    assessment.deficienciaDescricao = assessment.possuiDeficiencia ? (deficienciaDescricao || '') : '';

    assessment.medidas = {
      massaCorporal: medidas.massaCorporal !== undefined && medidas.massaCorporal !== '' ? Number(medidas.massaCorporal) : undefined,
      estatura: medidas.estatura !== undefined && medidas.estatura !== '' ? Number(medidas.estatura) : undefined,
      envergadura: medidas.envergadura !== undefined && medidas.envergadura !== '' ? Number(medidas.envergadura) : undefined,
      perimetroCintura: medidas.perimetroCintura !== undefined && medidas.perimetroCintura !== '' ? Number(medidas.perimetroCintura) : undefined
    };

    assessment.calculos = proespResult.calculos;
    assessment.testes = {
      corrida6Min: {
        voltas: testes.corrida6Min?.voltas !== undefined && testes.corrida6Min?.voltas !== '' ? Number(testes.corrida6Min.voltas) : undefined,
        perimetroPista: testes.corrida6Min?.perimetroPista !== undefined && testes.corrida6Min?.perimetroPista !== '' ? Number(testes.corrida6Min.perimetroPista) : 200,
        metrosUltimaVolta: testes.corrida6Min?.metrosUltimaVolta !== undefined && testes.corrida6Min?.metrosUltimaVolta !== '' ? Number(testes.corrida6Min.metrosUltimaVolta) : undefined,
        totalMetros: proespResult.calculos.corrida6MinTotal
      },
      sentarAlcançar: {
        tentativa1: testes.sentarAlcançar?.tentativa1 !== undefined && testes.sentarAlcançar?.tentativa1 !== '' ? Number(testes.sentarAlcançar.tentativa1) : undefined,
        tentativa2: testes.sentarAlcançar?.tentativa2 !== undefined && testes.sentarAlcançar?.tentativa2 !== '' ? Number(testes.sentarAlcançar.tentativa2) : undefined,
        melhorResultado: proespResult.calculos.sentarAlcançarMelhor
      },
      abdominais1Min: {
        repeticoes: testes.abdominais1Min?.repeticoes !== undefined && testes.abdominais1Min?.repeticoes !== '' ? Number(testes.abdominais1Min.repeticoes) : undefined
      },
      arremessoMedicineBall: {
        tentativa1: testes.arremessoMedicineBall?.tentativa1 !== undefined && testes.arremessoMedicineBall?.tentativa1 !== '' ? Number(testes.arremessoMedicineBall.tentativa1) : undefined,
        tentativa2: testes.arremessoMedicineBall?.tentativa2 !== undefined && testes.arremessoMedicineBall?.tentativa2 !== '' ? Number(testes.arremessoMedicineBall.tentativa2) : undefined,
        melhorResultado: proespResult.calculos.arremessoMedicineBallMelhor
      },
      saltoHorizontal: {
        tentativa1: testes.saltoHorizontal?.tentativa1 !== undefined && testes.saltoHorizontal?.tentativa1 !== '' ? Number(testes.saltoHorizontal.tentativa1) : undefined,
        tentativa2: testes.saltoHorizontal?.tentativa2 !== undefined && testes.saltoHorizontal?.tentativa2 !== '' ? Number(testes.saltoHorizontal.tentativa2) : undefined,
        melhorResultado: proespResult.calculos.saltoHorizontalMelhor
      },
      quadrado4x4: {
        tentativa1: testes.quadrado4x4?.tentativa1 !== undefined && testes.quadrado4x4?.tentativa1 !== '' ? Number(testes.quadrado4x4.tentativa1) : undefined,
        tentativa2: testes.quadrado4x4?.tentativa2 !== undefined && testes.quadrado4x4?.tentativa2 !== '' ? Number(testes.quadrado4x4.tentativa2) : undefined,
        melhorResultado: proespResult.calculos.quadrado4x4Melhor
      },
      corrida20m: {
        tentativa1: testes.corrida20m?.tentativa1 !== undefined && testes.corrida20m?.tentativa1 !== '' ? Number(testes.corrida20m.tentativa1) : undefined,
        tentativa2: testes.corrida20m?.tentativa2 !== undefined && testes.corrida20m?.tentativa2 !== '' ? Number(testes.corrida20m.tentativa2) : undefined,
        melhorResultado: proespResult.calculos.corrida20mMelhor
      }
    };

    assessment.classificacoes = proespResult.classificacoes;
    if (observacoes !== undefined) assessment.observacoes = observacoes;

    await assessment.save();
    res.json(assessment);
  } catch (error) {
    console.error('Erro ao atualizar avaliação física:', error);
    res.status(500).json({ message: 'Erro ao atualizar avaliação física.', error: error.message });
  }
};

// Excluir avaliação física
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await PhysicalAssessment.findByIdAndDelete(id);

    if (!assessment) {
      return res.status(404).json({ message: 'Avaliação física não encontrada.' });
    }

    res.json({ message: 'Avaliação física excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir avaliação física:', error);
    res.status(500).json({ message: 'Erro ao excluir avaliação física.', error: error.message });
  }
};
