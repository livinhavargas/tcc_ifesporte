import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Activity, Plus, Calendar, Trophy, 
  Heart, AlertCircle, CheckCircle2, ChevronRight, ArrowLeft, 
  Pencil, Trash2, Printer, Scale, Ruler,
  Dumbbell, Timer, Flame, GitCompare,
  TrendingUp, TrendingDown, Minus, CheckSquare, Square,
  BarChart2
} from 'lucide-react';
import { apiUrl } from '../services/api';
import { 
  calculateAge, 
  classifyPROESP 
} from '../utils/proespCalculator';
import SportIcon from './SportIcon';
import PhysicalAssessmentPDFExport, { 
  evaluateMetricEvolution, 
  TEST_DIRECTION_RULES 
} from './PhysicalAssessmentPDFExport';

// Modalidades padrão do IFesporte
const MODALIDADES_IFESPORTE = [
  'Basquetebol',
  'Futsal',
  'Futebol',
  'Handebol',
  'Voleibol',
  'Vôlei de Praia',
  'Atletismo',
  'Badminton',
  'Xadrez',
  'Tênis de Mesa',
  'Outra'
];

export const getPerformanceBadge = (classification) => {
  switch (classification) {
    case 'Excelência':
      return {
        label: 'Excelência',
        bg: 'rgba(139, 92, 246, 0.15)',
        color: '#8b5cf6',
        border: 'rgba(139, 92, 246, 0.3)',
        icon: '★'
      };
    case 'Muito bom':
      return {
        label: 'Muito bom',
        bg: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        border: 'rgba(16, 185, 129, 0.3)',
        icon: '▲'
      };
    case 'Bom':
      return {
        label: 'Bom',
        bg: 'rgba(59, 130, 246, 0.15)',
        color: '#3b82f6',
        border: 'rgba(59, 130, 246, 0.3)',
        icon: '●'
      };
    case 'Razoável':
      return {
        label: 'Razoável',
        bg: 'rgba(245, 158, 11, 0.15)',
        color: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.3)',
        icon: '■'
      };
    case 'Fraco':
      return {
        label: 'Fraco',
        bg: 'rgba(239, 68, 68, 0.12)',
        color: '#ef4444',
        border: 'rgba(239, 68, 68, 0.25)',
        icon: '▼'
      };
    default:
      return {
        label: classification || 'Dados insuficientes',
        bg: 'var(--bg-hover)',
        color: 'var(--text-tertiary)',
        border: 'var(--border)',
        icon: '—'
      };
  }
};

export const getHealthBadge = (healthStatus) => {
  if (healthStatus === 'Zona saudável') {
    return {
      label: 'Zona saudável',
      bg: 'rgba(16, 185, 129, 0.12)',
      color: '#10b981',
      border: 'rgba(16, 185, 129, 0.25)',
      icon: <CheckCircle2 size={13} className="me-1" />
    };
  }
  if (healthStatus === 'Zona de risco à saúde') {
    return {
      label: 'Zona de risco à saúde',
      bg: 'rgba(245, 158, 11, 0.12)',
      color: '#d97706',
      border: 'rgba(245, 158, 11, 0.25)',
      icon: <AlertCircle size={13} className="me-1" />
    };
  }
  return {
    label: healthStatus || 'Sem dados',
    bg: 'var(--bg-hover)',
    color: 'var(--text-tertiary)',
    border: 'var(--border)',
    icon: null
  };
};

const PhysicalAssessmentTab = ({ student, userType = 'treinador' }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Estados para novas funcionalidades: Comparação, Gráfico de Evolução e PDF
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'compare' | 'evolution'
  const [compareIds, setCompareIds] = useState([]);
  const [evolutionMetric, setEvolutionMetric] = useState('saltoHorizontalMelhor');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Modalidades do aluno
  const studentModalidades = useMemo(() => {
    if (!student) return [];
    if (Array.isArray(student.modalidades) && student.modalidades.length > 0) {
      return student.modalidades;
    }
    if (Array.isArray(student.esportes) && student.esportes.length > 0) {
      return student.esportes;
    }
    return [];
  }, [student]);

  // Estados auxiliares de modalidade no formulário
  const [selectedStudentModalidades, setSelectedStudentModalidades] = useState([]);
  const [praticaAlgumaModalidade, setPraticaAlgumaModalidade] = useState(true);
  const [fallbackModalidade, setFallbackModalidade] = useState('Futsal');

  const isReadOnly = userType === 'estudante';

  // Form State
  const initialFormState = {
    dataAvaliacao: new Date().toISOString().split('T')[0],
    horario: new Date().toTimeString().slice(0, 5),
    temperatura: '25',
    modalidade: '',
    frequenciaSemanal: '3',
    duracaoSessao: '90',
    tempoPratica: '1 ano',
    possuiDeficiencia: false,
    deficienciaDescricao: '',
    
    // Medidas corporais
    massaCorporal: student?.peso || '',
    estatura: student?.altura ? (Number(student.altura) > 3 ? student.altura : Math.round(Number(student.altura) * 100)) : '',
    envergadura: '',
    perimetroCintura: '',

    // Testes de Aptidão Física
    testes: {
      corrida6Min: { voltas: '', perimetroPista: '200', metrosUltimaVolta: '' },
      sentarAlcançar: { tentativa1: '', tentativa2: '' },
      abdominais1Min: { repeticoes: '' },
      arremessoMedicineBall: { tentativa1: '', tentativa2: '' },
      saltoHorizontal: { tentativa1: '', tentativa2: '' },
      quadrado4x4: { tentativa1: '', tentativa2: '' },
      corrida20m: { tentativa1: '', tentativa2: '' }
    },
    observacoes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchAssessments = useCallback(async () => {
    if (!student?._id) return;
    try {
      setLoading(true);
      const res = await fetch(apiUrl(`/api/physical-assessments/student/${student._id}`), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
        if (data.length >= 2 && compareIds.length === 0) {
          setCompareIds([data[1]._id, data[0]._id]);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar avaliações físicas:', err);
    } finally {
      setLoading(false);
    }
  }, [student?._id, compareIds.length]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Cálculos dinâmicos em tempo real enquanto o treinador preenche
  const liveCalculations = useMemo(() => {
    const dataNasc = student?.dataNascimento;
    const idade = calculateAge(dataNasc, formData.dataAvaliacao) ?? (student?.idade ? Number(student.idade) : null);
    const sexo = student?.sexo || 'M';

    return classifyPROESP({
      idade,
      sexo,
      medidas: {
        massaCorporal: formData.massaCorporal,
        estatura: formData.estatura,
        envergadura: formData.envergadura,
        perimetroCintura: formData.perimetroCintura
      },
      testes: formData.testes
    });
  }, [formData, student]);

  // Inicializar modo de criação
  const handleStartNew = () => {
    let initialMod = '';
    if (studentModalidades.length > 0) {
      setSelectedStudentModalidades([...studentModalidades]);
      initialMod = studentModalidades.join(', ');
      setPraticaAlgumaModalidade(true);
    } else {
      setSelectedStudentModalidades([]);
      setPraticaAlgumaModalidade(true);
      setFallbackModalidade('Futsal');
      initialMod = 'Futsal';
    }

    setFormData({
      ...initialFormState,
      modalidade: initialMod,
      massaCorporal: student?.peso || '',
      estatura: student?.altura ? (Number(student.altura) > 3 ? student.altura : Math.round(Number(student.altura) * 100)) : ''
    });
    setSelectedAssessment(null);
    setIsEditing(false);
    setIsCreating(true);
  };

  // Inicializar modo de edição
  const handleStartEdit = (assessment) => {
    const currentMod = assessment.modalidade || '';
    if (studentModalidades.length > 0) {
      const matched = studentModalidades.filter(m => currentMod.includes(m));
      setSelectedStudentModalidades(matched.length > 0 ? matched : [...studentModalidades]);
      setPraticaAlgumaModalidade(true);
    } else {
      if (currentMod === 'Não pratica modalidade') {
        setPraticaAlgumaModalidade(false);
      } else {
        setPraticaAlgumaModalidade(true);
        setFallbackModalidade(MODALIDADES_IFESPORTE.includes(currentMod) ? currentMod : 'Outra');
      }
    }

    setFormData({
      dataAvaliacao: assessment.dataAvaliacao ? assessment.dataAvaliacao.split('T')[0] : '',
      horario: assessment.horario || '',
      temperatura: assessment.temperatura != null ? String(assessment.temperatura) : '',
      modalidade: currentMod,
      frequenciaSemanal: assessment.frequenciaSemanal != null ? String(assessment.frequenciaSemanal) : '',
      duracaoSessao: assessment.duracaoSessao != null ? String(assessment.duracaoSessao) : '',
      tempoPratica: assessment.tempoPratica || '',
      possuiDeficiencia: !!assessment.possuiDeficiencia,
      deficienciaDescricao: assessment.deficienciaDescricao || '',

      massaCorporal: assessment.medidas?.massaCorporal != null ? String(assessment.medidas.massaCorporal) : '',
      estatura: assessment.medidas?.estatura != null ? String(assessment.medidas.estatura) : '',
      envergadura: assessment.medidas?.envergadura != null ? String(assessment.medidas.envergadura) : '',
      perimetroCintura: assessment.medidas?.perimetroCintura != null ? String(assessment.medidas.perimetroCintura) : '',

      testes: {
        corrida6Min: {
          voltas: assessment.testes?.corrida6Min?.voltas != null ? String(assessment.testes.corrida6Min.voltas) : '',
          perimetroPista: assessment.testes?.corrida6Min?.perimetroPista != null ? String(assessment.testes.corrida6Min.perimetroPista) : '200',
          metrosUltimaVolta: assessment.testes?.corrida6Min?.metrosUltimaVolta != null ? String(assessment.testes.corrida6Min.metrosUltimaVolta) : ''
        },
        sentarAlcançar: {
          tentativa1: assessment.testes?.sentarAlcançar?.tentativa1 != null ? String(assessment.testes.sentarAlcançar.tentativa1) : '',
          tentativa2: assessment.testes?.sentarAlcançar?.tentativa2 != null ? String(assessment.testes.sentarAlcançar.tentativa2) : ''
        },
        abdominais1Min: {
          repeticoes: assessment.testes?.abdominais1Min?.repeticoes != null ? String(assessment.testes.abdominais1Min.repeticoes) : ''
        },
        arremessoMedicineBall: {
          tentativa1: assessment.testes?.arremessoMedicineBall?.tentativa1 != null ? String(assessment.testes.arremessoMedicineBall.tentativa1) : '',
          tentativa2: assessment.testes?.arremessoMedicineBall?.tentativa2 != null ? String(assessment.testes.arremessoMedicineBall.tentativa2) : ''
        },
        saltoHorizontal: {
          tentativa1: assessment.testes?.saltoHorizontal?.tentativa1 != null ? String(assessment.testes.saltoHorizontal.tentativa1) : '',
          tentativa2: assessment.testes?.saltoHorizontal?.tentativa2 != null ? String(assessment.testes.saltoHorizontal.tentativa2) : ''
        },
        quadrado4x4: {
          tentativa1: assessment.testes?.quadrado4x4?.tentativa1 != null ? String(assessment.testes.quadrado4x4.tentativa1) : '',
          tentativa2: assessment.testes?.quadrado4x4?.tentativa2 != null ? String(assessment.testes.quadrado4x4.tentativa2) : ''
        },
        corrida20m: {
          tentativa1: assessment.testes?.corrida20m?.tentativa1 != null ? String(assessment.testes.corrida20m.tentativa1) : '',
          tentativa2: assessment.testes?.corrida20m?.tentativa2 != null ? String(assessment.testes.corrida20m.tentativa2) : ''
        }
      },
      observacoes: assessment.observacoes || ''
    });
    setSelectedAssessment(assessment);
    setIsCreating(false);
    setIsEditing(true);
  };

  // Toggle de modalidade cadastrada do aluno (Cenário A)
  const handleToggleStudentModality = (mod) => {
    let next;
    if (selectedStudentModalidades.includes(mod)) {
      next = selectedStudentModalidades.filter(m => m !== mod);
    } else {
      next = [...selectedStudentModalidades, mod];
    }
    setSelectedStudentModalidades(next);
    setFormData(prev => ({
      ...prev,
      modalidade: next.join(', ') || 'Nenhuma selecionada'
    }));
  };

  const handleTestChange = (testName, field, value) => {
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setFormData(prev => ({
      ...prev,
      testes: {
        ...prev.testes,
        [testName]: {
          ...prev.testes[testName],
          [field]: sanitized
        }
      }
    }));
  };

  const handleMedidaChange = (field, value) => {
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setFormData(prev => ({ ...prev, [field]: sanitized }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    // Definir string final da modalidade
    let finalMod = formData.modalidade;
    if (studentModalidades.length > 0) {
      finalMod = selectedStudentModalidades.join(', ') || 'Nenhuma selecionada';
    } else {
      if (!praticaAlgumaModalidade) {
        finalMod = 'Não pratica modalidade';
      } else {
        finalMod = fallbackModalidade || 'Futsal';
      }
    }

    try {
      const payload = {
        alunoId: student._id,
        dataAvaliacao: formData.dataAvaliacao,
        horario: formData.horario,
        temperatura: formData.temperatura,
        modalidade: finalMod,
        frequenciaSemanal: praticaAlgumaModalidade ? formData.frequenciaSemanal : undefined,
        duracaoSessao: praticaAlgumaModalidade ? formData.duracaoSessao : undefined,
        tempoPratica: praticaAlgumaModalidade ? formData.tempoPratica : 'Não pratica',
        possuiDeficiencia: formData.possuiDeficiencia,
        deficienciaDescricao: formData.deficienciaDescricao,
        medidas: {
          massaCorporal: formData.massaCorporal,
          estatura: formData.estatura,
          envergadura: formData.envergadura,
          perimetroCintura: formData.perimetroCintura
        },
        testes: formData.testes,
        observacoes: formData.observacoes
      };

      const endpoint = isEditing && selectedAssessment
        ? apiUrl(`/api/physical-assessments/${selectedAssessment._id}`)
        : apiUrl('/api/physical-assessments');

      const method = isEditing && selectedAssessment ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const saved = await response.json();
        setMessage(`✅ Avaliação física ${isEditing ? 'atualizada' : 'registrada'} com sucesso!`);
        setIsCreating(false);
        setIsEditing(false);
        setSelectedAssessment(saved);
        fetchAssessments();
        setTimeout(() => setMessage(''), 4000);
      } else {
        const errData = await response.json();
        setMessage(`❌ ${errData.message || 'Erro ao salvar avaliação física.'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Erro de conexão com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação física?')) return;
    try {
      const res = await fetch(apiUrl(`/api/physical-assessments/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setMessage('✅ Avaliação excluída com sucesso.');
        setSelectedAssessment(null);
        setIsCreating(false);
        setIsEditing(false);
        fetchAssessments();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Erro ao excluir avaliação.');
    }
  };

  // Avaliações selecionadas para comparação
  const assessment1 = useMemo(() => assessments.find(a => a._id === compareIds[0]), [assessments, compareIds]);
  const assessment2 = useMemo(() => assessments.find(a => a._id === compareIds[1]), [assessments, compareIds]);

  // Lista ordenada cronologicamente para a evolução
  const chronologicalAssessments = useMemo(() => {
    return [...assessments].sort((a, b) => new Date(a.dataAvaliacao) - new Date(b.dataAvaliacao));
  }, [assessments]);

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font)',
    outline: 'none',
    background: 'var(--bg-card)',
    color: 'var(--text)',
    transition: 'all var(--transition-fast)'
  };

  const calculatedBoxStyle = {
    background: 'var(--bg)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-light)',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '62px'
  };

  return (
    <div className="fade-in">
      {message && (
        <div style={{
          background: message.includes('✅') ? 'var(--success-light)' : 'var(--error-light)',
          color: message.includes('✅') ? 'var(--success-text)' : 'var(--error-text)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {message}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODO 1: FORMULÁRIO DE NOVA AVALIAÇÃO OU EDIÇÃO                            */}
      {/* ========================================================================= */}
      {(isCreating || isEditing) && (
        <form onSubmit={handleSubmit}>
          {/* Header do Formulário */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} style={{ color: 'var(--primary)' }} />
                <span>{isEditing ? 'Editar Avaliação Física' : 'Nova Avaliação de Aptidão Física (PROESP-Br 2021)'}</span>
              </h5>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
                Os dados pessoais de {student.nome} ({student.sexo === 'M' ? 'Masculino' : student.sexo === 'F' ? 'Feminino' : 'Sexo não informado'}, {student.dataNascimento ? `${calculateAge(student.dataNascimento, formData.dataAvaliacao)} anos` : 'idade n/d'}) já estão vinculados.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => { setIsCreating(false); setIsEditing(false); }}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={16} /> {submitting ? 'Salvando...' : 'Salvar Avaliação'}
              </button>
            </div>
          </div>

          <div className="row g-4">
            {/* SEÇÃO 1: DADOS DA AVALIAÇÃO E MODALIDADE INTELIGENTE */}
            <div className="col-12">
              <div style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                padding: '20px 24px'
              }}>
                <h6 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '16px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} /> Seção 1 — Dados da Avaliação & Prática Esportiva
                </h6>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold">Data da Avaliação *</label>
                    <input 
                      type="date" 
                      value={formData.dataAvaliacao} 
                      onChange={(e) => setFormData(prev => ({ ...prev, dataAvaliacao: e.target.value }))} 
                      style={inputStyle} 
                      required 
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold">Horário</label>
                    <input 
                      type="time" 
                      value={formData.horario} 
                      onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))} 
                      style={inputStyle} 
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold">Temperatura Ambiente (°C)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="Ex: 26" 
                      value={formData.temperatura} 
                      onChange={(e) => setFormData(prev => ({ ...prev, temperatura: e.target.value }))} 
                      style={inputStyle} 
                    />
                  </div>

                  {/* LÓGICA DE MODALIDADE PRATICADA (CENÁRIO A / CENÁRIO B) */}
                  <div className="col-12">
                    <div style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      padding: '16px 20px',
                      marginTop: '6px'
                    }}>
                      <div className="mb-2">
                        <label className="form-label fw-bold text-dark mb-1" style={{ fontSize: '0.875rem' }}>
                          Modalidade Esportiva Praticada com Frequência
                        </label>
                        <p className="text-muted small m-0" style={{ fontSize: '0.75rem' }}>
                          Identificação das modalidades habituais do atleta para contextualização da avaliação física.
                        </p>
                      </div>

                      {/* PERGUNTA INICIAL: O ALUNO PRATICA ALGUMA MODALIDADE? */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '6px', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                          O aluno pratica alguma modalidade esportiva com frequência?
                        </span>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className={`btn btn-sm ${praticaAlgumaModalidade ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => {
                              setPraticaAlgumaModalidade(true);
                              if (studentModalidades.length > 0) {
                                const initial = selectedStudentModalidades.length > 0 ? selectedStudentModalidades : [...studentModalidades];
                                setSelectedStudentModalidades(initial);
                                setFormData(prev => ({ ...prev, modalidade: initial.join(', ') }));
                              } else {
                                setFormData(prev => ({ ...prev, modalidade: fallbackModalidade || 'Futsal' }));
                              }
                            }}
                            style={{ minWidth: '70px', fontWeight: 600 }}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${!praticaAlgumaModalidade ? 'btn-danger' : 'btn-outline-secondary'}`}
                            onClick={() => {
                              setPraticaAlgumaModalidade(false);
                              setFormData(prev => ({ ...prev, modalidade: 'Não pratica modalidade' }));
                            }}
                            style={{ minWidth: '70px', fontWeight: 600 }}
                          >
                            Não
                          </button>
                        </div>
                      </div>

                      {!praticaAlgumaModalidade ? (
                        <div className="p-3 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                          ✓ O registro será salvo como <strong>"Não pratica modalidade"</strong>. Os campos de frequência semanal, duração e tempo de prática foram desabilitados por serem não aplicáveis.
                        </div>
                      ) : studentModalidades.length > 0 ? (
                        /* CENÁRIO A: ALUNO POSSUI MODALIDADES CADASTRADAS */
                        <div>
                          <label className="form-label text-muted small fw-bold mb-1">Modalidades do Aluno (Marque as praticadas)</label>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {studentModalidades.map((mod) => {
                              const isChecked = selectedStudentModalidades.includes(mod);
                              return (
                                <button
                                  type="button"
                                  key={mod}
                                  onClick={() => handleToggleStudentModality(mod)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 14px',
                                    borderRadius: 'var(--radius-md)',
                                    border: isChecked ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                                    background: isChecked ? 'var(--primary-light)' : 'var(--bg)',
                                    color: isChecked ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: isChecked ? 700 : 500,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)'
                                  }}
                                >
                                  <SportIcon sport={mod} size={18} />
                                  <span>{mod}</span>
                                  {isChecked ? (
                                    <CheckSquare size={16} style={{ color: 'var(--primary)' }} />
                                  ) : (
                                    <Square size={16} style={{ color: 'var(--text-tertiary)' }} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* CENÁRIO B: ALUNO NÃO POSSUI NENHUMA MODALIDADE CADASTRADA */
                        <div className="row g-2 align-items-center mt-1">
                          <div className="col-md-6">
                            <label className="form-label text-muted small fw-bold">Selecione a Modalidade Praticada</label>
                            <select 
                              value={fallbackModalidade} 
                              onChange={(e) => {
                                setFallbackModalidade(e.target.value);
                                setFormData(prev => ({ ...prev, modalidade: e.target.value }));
                              }} 
                              style={inputStyle}
                            >
                              {MODALIDADES_IFESPORTE.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CAMPOS DE PRÁTICA COM EXPLICAÇÃO DETALHADA E OBJETIVA */}
                  {praticaAlgumaModalidade && (
                    <>
                      {/* FREQUÊNCIA SEMANAL */}
                      <div className="col-md-4">
                        <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: '0.875rem' }}>
                          Frequência semanal
                        </label>
                        <div className="input-group mb-1">
                          <input 
                            type="number" 
                            min="1" 
                            max="7" 
                            placeholder="Ex: 3" 
                            value={formData.frequenciaSemanal} 
                            onChange={(e) => setFormData(prev => ({ ...prev, frequenciaSemanal: e.target.value }))} 
                            style={inputStyle} 
                          />
                          <span className="input-group-text" style={{ fontSize: '0.8125rem', background: 'var(--bg)' }}>sessões/sem</span>
                        </div>
                        <p className="text-muted m-0" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                          Quantas vezes por semana o aluno costuma praticar essa modalidade? <span className="text-primary fw-semibold">(Ex: 3 vezes por semana)</span>
                        </p>
                      </div>

                      {/* DURAÇÃO MÉDIA DA SESSÃO */}
                      <div className="col-md-4">
                        <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: '0.875rem' }}>
                          Duração média da sessão
                        </label>
                        <div className="input-group mb-1">
                          <input 
                            type="number" 
                            placeholder="Ex: 90" 
                            value={formData.duracaoSessao} 
                            onChange={(e) => setFormData(prev => ({ ...prev, duracaoSessao: e.target.value }))} 
                            style={inputStyle} 
                          />
                          <span className="input-group-text" style={{ fontSize: '0.8125rem', background: 'var(--bg)' }}>minutos</span>
                        </div>
                        <p className="text-muted m-0" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                          Quanto tempo, em média, dura cada treino ou sessão de prática? <span className="text-primary fw-semibold">(Ex: 90 minutos)</span>
                        </p>
                      </div>

                      {/* TEMPO DE PRÁTICA */}
                      <div className="col-md-4">
                        <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: '0.875rem' }}>
                          Tempo de prática
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ex: 2 anos e 6 meses" 
                          value={formData.tempoPratica} 
                          onChange={(e) => setFormData(prev => ({ ...prev, tempoPratica: e.target.value }))} 
                          style={{ ...inputStyle, marginBottom: '4px' }} 
                        />
                        <p className="text-muted m-0" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                          Há quanto tempo o aluno pratica essa modalidade de forma regular? <span className="text-primary fw-semibold">(Ex: 2 anos e 6 meses)</span>
                        </p>
                      </div>
                    </>
                  )}

                  {/* DEFICIÊNCIA */}
                  <div className="col-12 mt-3 pt-3 border-top" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div>
                        <label className="form-label text-dark fw-bold m-0" style={{ fontSize: '0.875rem' }}>
                          Apresenta alguma deficiência diagnosticada?
                        </label>
                        <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>
                          Permite adequar o acompanhamento físico às necessidades do atleta.
                        </span>
                      </div>
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="deficienciaSwitch"
                          checked={formData.possuiDeficiencia} 
                          onChange={(e) => setFormData(prev => ({ ...prev, possuiDeficiencia: e.target.checked }))} 
                          style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                        />
                        <label className="form-check-label small fw-bold ms-2" htmlFor="deficienciaSwitch">
                          {formData.possuiDeficiencia ? 'Sim' : 'Não'}
                        </label>
                      </div>
                    </div>

                    {formData.possuiDeficiencia && (
                      <div className="mt-2">
                        <input 
                          type="text" 
                          placeholder="Especifique a deficiência..." 
                          value={formData.deficienciaDescricao} 
                          onChange={(e) => setFormData(prev => ({ ...prev, deficienciaDescricao: e.target.value }))} 
                          style={inputStyle} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: MEDIDAS CORPORAIS & CÁLCULOS AUTOMÁTICOS (IMC E RCE) */}
            <div className="col-12">
              <div style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                padding: '20px 24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h6 style={{ fontWeight: 700, color: 'var(--primary)', margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Scale size={16} /> Seção 2 — Medidas Corporais e Indicadores de Saúde
                  </h6>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Cálculos de IMC e RCE automáticos em tempo real
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <label className="form-label text-muted small fw-bold">Massa Corporal (kg)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 62.5" 
                      value={formData.massaCorporal} 
                      onChange={(e) => handleMedidaChange('massaCorporal', e.target.value)} 
                      style={inputStyle} 
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label text-muted small fw-bold">Estatura (cm)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 172.0" 
                      value={formData.estatura} 
                      onChange={(e) => handleMedidaChange('estatura', e.target.value)} 
                      style={inputStyle} 
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label text-muted small fw-bold">Envergadura (cm)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 176.0" 
                      value={formData.envergadura} 
                      onChange={(e) => handleMedidaChange('envergadura', e.target.value)} 
                      style={inputStyle} 
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label text-muted small fw-bold">Perímetro da Cintura (cm)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 74.0" 
                      value={formData.perimetroCintura} 
                      onChange={(e) => handleMedidaChange('perimetroCintura', e.target.value)} 
                      style={inputStyle} 
                    />
                  </div>

                  {/* IMC & RCE Cards Calculados */}
                  <div className="col-md-6">
                    <div style={calculatedBoxStyle}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>IMC Calculado:</span>
                          <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                            {liveCalculations.calculos.imc != null ? `${liveCalculations.calculos.imc} kg/m²` : '—'}
                          </strong>
                        </div>
                        <div>
                          {(() => {
                            const badge = getHealthBadge(liveCalculations.classificacoes.saude.imc);
                            return (
                              <span style={{
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}>
                                {badge.icon} {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div style={calculatedBoxStyle}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>Razão Cintura-Estatura (RCE):</span>
                          <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                            {liveCalculations.calculos.rce != null ? liveCalculations.calculos.rce : '—'}
                          </strong>
                        </div>
                        <div>
                          {(() => {
                            const badge = getHealthBadge(liveCalculations.classificacoes.saude.rce);
                            return (
                              <span style={{
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}>
                                {badge.icon} {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: OS 7 TESTES MOTORES (PROESP-Br 2021) */}
            <div className="col-12">
              <h6 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '16px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={16} /> Seção 3 — Bateria de Testes Motores (PROESP-Br 2021)
              </h6>

              <div className="row g-3">
                {/* 1. CORRIDA 6 MIN */}
                <div className="col-lg-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Heart size={16} style={{ color: '#ef4444' }} /> 1. Corrida/Caminhada de 6 min
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Aptidão Cardiorrespiratória</span>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-4">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Voltas Completas</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 6" 
                            value={formData.testes.corrida6Min.voltas} 
                            onChange={(e) => handleTestChange('corrida6Min', 'voltas', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                        <div className="col-4">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Perímetro Pista (m)</label>
                          <input 
                            type="text" 
                            value={formData.testes.corrida6Min.perimetroPista} 
                            onChange={(e) => handleTestChange('corrida6Min', 'perimetroPista', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                        <div className="col-4">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Metros Últ. Volta</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 80" 
                            value={formData.testes.corrida6Min.metrosUltimaVolta} 
                            onChange={(e) => handleTestChange('corrida6Min', 'metrosUltimaVolta', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                      </div>
                    </div>
                    <div style={calculatedBoxStyle}>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Distância Total:</small>
                          <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>
                            {liveCalculations.calculos.corrida6MinTotal != null ? `${liveCalculations.calculos.corrida6MinTotal} m` : '—'}
                          </strong>
                        </div>
                        <div>
                          {(() => {
                            const pBadge = getPerformanceBadge(liveCalculations.classificacoes.desempenho.corrida6Min);
                            return (
                              <span style={{ background: pBadge.bg, color: pBadge.color, border: `1px solid ${pBadge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                                {pBadge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. SENTAR E ALCANÇAR */}
                <div className="col-lg-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Ruler size={16} style={{ color: '#3b82f6' }} /> 2. Sentar e Alcançar (Flexibilidade)
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Banco de Wells (cm)</span>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Tentativa 1 (cm)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 24.5" 
                            value={formData.testes.sentarAlcançar.tentativa1} 
                            onChange={(e) => handleTestChange('sentarAlcançar', 'tentativa1', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Tentativa 2 (cm)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 26.0" 
                            value={formData.testes.sentarAlcançar.tentativa2} 
                            onChange={(e) => handleTestChange('sentarAlcançar', 'tentativa2', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                      </div>
                    </div>
                    <div style={calculatedBoxStyle}>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Melhor Marca:</small>
                          <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>
                            {liveCalculations.calculos.sentarAlcançarMelhor != null ? `${liveCalculations.calculos.sentarAlcançarMelhor} cm` : '—'}
                          </strong>
                        </div>
                        <div>
                          {(() => {
                            const badge = getPerformanceBadge(liveCalculations.classificacoes.desempenho.sentarAlcançar);
                            return (
                              <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. ABDOMINAIS 1 MINUTO */}
                <div className="col-lg-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Activity size={16} style={{ color: '#10b981' }} /> 3. Abdominais em 1 minuto
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Resistência Muscular</span>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Repetições completas em 60s</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 38" 
                          value={formData.testes.abdominais1Min.repeticoes} 
                          onChange={(e) => handleTestChange('abdominais1Min', 'repeticoes', e.target.value)} 
                          style={inputStyle} 
                        />
                      </div>
                    </div>
                    <div style={calculatedBoxStyle}>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Classificação:</small>
                          <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>
                            {formData.testes.abdominais1Min.repeticoes ? `${formData.testes.abdominais1Min.repeticoes} reps` : '—'}
                          </strong>
                        </div>
                        <div>
                          {(() => {
                            const badge = getPerformanceBadge(liveCalculations.classificacoes.desempenho.abdominais1Min);
                            return (
                              <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. ARREMESSO DE MEDICINE BALL */}
                <div className="col-lg-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Dumbbell size={16} style={{ color: '#8b5cf6' }} /> 4. Arremesso de Medicine Ball (2 kg)
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Força MMSS (cm)</span>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Tentativa 1 (cm)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 340" 
                            value={formData.testes.arremessoMedicineBall.tentativa1} 
                            onChange={(e) => handleTestChange('arremessoMedicineBall', 'tentativa1', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Tentativa 2 (cm)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 365" 
                            value={formData.testes.arremessoMedicineBall.tentativa2} 
                            onChange={(e) => handleTestChange('arremessoMedicineBall', 'tentativa2', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                      </div>
                    </div>
                    <div style={calculatedBoxStyle}>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Melhor Arremesso:</small>
                          <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>
                            {liveCalculations.calculos.arremessoMedicineBallMelhor != null ? `${liveCalculations.calculos.arremessoMedicineBallMelhor} cm` : '—'}
                          </strong>
                        </div>
                        <div>
                          {(() => {
                            const badge = getPerformanceBadge(liveCalculations.classificacoes.desempenho.arremessoMedicineBall);
                            return (
                              <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. SALTO HORIZONTAL */}
                <div className="col-lg-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <TrendingUp size={16} style={{ color: '#ec4899' }} /> 5. Salto Horizontal
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Força MMII (cm)</span>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Tentativa 1 (cm)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 165.0" 
                            value={formData.testes.saltoHorizontal.tentativa1} 
                            onChange={(e) => handleTestChange('saltoHorizontal', 'tentativa1', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Tentativa 2 (cm)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 178.0" 
                            value={formData.testes.saltoHorizontal.tentativa2} 
                            onChange={(e) => handleTestChange('saltoHorizontal', 'tentativa2', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                      </div>
                    </div>
                    <div style={calculatedBoxStyle}>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Melhor Salto:</small>
                          <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>
                            {liveCalculations.calculos.saltoHorizontalMelhor != null ? `${liveCalculations.calculos.saltoHorizontalMelhor} cm` : '—'}
                          </strong>
                        </div>
                        <div>
                          {(() => {
                            const badge = getPerformanceBadge(liveCalculations.classificacoes.desempenho.saltoHorizontal);
                            return (
                              <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. QUADRADO 4X4 */}
                <div className="col-lg-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Timer size={16} style={{ color: '#f59e0b' }} /> 6. Quadrado de 4 × 4 metros
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Agilidade (segundos)</span>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Tentativa 1 (s)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 4.85" 
                            value={formData.testes.quadrado4x4.tentativa1} 
                            onChange={(e) => handleTestChange('quadrado4x4', 'tentativa1', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Tentativa 2 (s)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 4.70" 
                            value={formData.testes.quadrado4x4.tentativa2} 
                            onChange={(e) => handleTestChange('quadrado4x4', 'tentativa2', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                      </div>
                    </div>
                    <div style={calculatedBoxStyle}>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Melhor Tempo (menor):</small>
                          <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>
                            {liveCalculations.calculos.quadrado4x4Melhor != null ? `${liveCalculations.calculos.quadrado4x4Melhor} s` : '—'}
                          </strong>
                        </div>
                        <div>
                          {(() => {
                            const badge = getPerformanceBadge(liveCalculations.classificacoes.desempenho.quadrado4x4);
                            return (
                              <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. CORRIDA 20 METROS */}
                <div className="col-lg-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Flame size={16} style={{ color: '#06b6d4' }} /> 7. Corrida de 20 metros
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Velocidade (segundos)</span>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Tentativa 1 (s)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 3.82" 
                            value={formData.testes.corrida20m.tentativa1} 
                            onChange={(e) => handleTestChange('corrida20m', 'tentativa1', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Tentativa 2 (s)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 3.74" 
                            value={formData.testes.corrida20m.tentativa2} 
                            onChange={(e) => handleTestChange('corrida20m', 'tentativa2', e.target.value)} 
                            style={inputStyle} 
                          />
                        </div>
                      </div>
                    </div>
                    <div style={calculatedBoxStyle}>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Melhor Tempo (menor):</small>
                          <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>
                            {liveCalculations.calculos.corrida20mMelhor != null ? `${liveCalculations.calculos.corrida20mMelhor} s` : '—'}
                          </strong>
                        </div>
                        <div>
                          {(() => {
                            const badge = getPerformanceBadge(liveCalculations.classificacoes.desempenho.corrida20m);
                            return (
                              <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* OBSERVAÇÕES */}
                <div className="col-12">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '16px 20px' }}>
                    <label className="form-label text-muted small fw-bold">Observações Gerais do Avaliador</label>
                    <textarea 
                      rows="2" 
                      placeholder="Anotações sobre a execução dos testes, condições climáticas ou recomendações..." 
                      value={formData.observacoes} 
                      onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))} 
                      style={inputStyle} 
                    />
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="col-12 d-flex justify-content-end gap-2 pt-3 border-top" style={{ borderColor: 'var(--border-light)' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setIsCreating(false); setIsEditing(false); }}
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={submitting}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckCircle2 size={16} /> {submitting ? 'Salvando...' : 'Salvar Avaliação'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODO 2: DETALHAMENTO DE UMA AVALIAÇÃO SELECIONADA                         */}
      {/* ========================================================================= */}
      {!isCreating && !isEditing && selectedAssessment && (
        <div>
          {/* Header do Detalhamento */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <button 
              className="btn btn-outline-secondary btn-sm" 
              onClick={() => setSelectedAssessment(null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <ArrowLeft size={16} /> Voltar ao Histórico
            </button>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-outline-primary btn-sm" 
                onClick={() => setIsPdfModalOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={15} /> Exportar PDF
              </button>

              {!isReadOnly && (
                <>
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={() => handleStartEdit(selectedAssessment)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Pencil size={15} /> Editar
                  </button>
                  <button 
                    className="btn btn-outline-danger btn-sm" 
                    onClick={() => handleDelete(selectedAssessment._id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={15} /> Excluir
                  </button>
                </>
              )}

              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.8125rem', padding: '6px 12px' }}>
                Avaliado em: {new Date(selectedAssessment.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </span>
            </div>
          </div>

          <div className="row g-4">
            {/* Bloco 1: Dados da Sessão */}
            <div className="col-12">
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '20px' }}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <span className="text-muted d-block small">Data e Horário</span>
                    <strong style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                      {new Date(selectedAssessment.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} {selectedAssessment.horario ? ` às ${selectedAssessment.horario}` : ''}
                    </strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block small">Temperatura</span>
                    <strong style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                      {selectedAssessment.temperatura != null ? `${selectedAssessment.temperatura} °C` : 'Não informada'}
                    </strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block small">Modalidade Frequente</span>
                    <strong style={{ color: 'var(--text)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <SportIcon sport={selectedAssessment.modalidade || 'Futsal'} size={16} />
                      {selectedAssessment.modalidade || 'Geral'}
                    </strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted d-block small">Rotina de Prática</span>
                    <strong style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                      {selectedAssessment.modalidade === 'Não pratica modalidade' ? (
                        <span className="text-muted">Não aplicável</span>
                      ) : (
                        `${selectedAssessment.frequenciaSemanal ? `${selectedAssessment.frequenciaSemanal}x/sem ` : ''}${selectedAssessment.duracaoSessao ? `(${selectedAssessment.duracaoSessao} min) ` : ''}${selectedAssessment.tempoPratica ? `• ${selectedAssessment.tempoPratica}` : ''}`.trim() || 'Não informada'
                      )}
                    </strong>
                  </div>
                  {selectedAssessment.possuiDeficiencia && (
                    <div className="col-12">
                      <span className="text-muted d-block small">Deficiência Informada</span>
                      <span className="badge bg-warning text-dark">{selectedAssessment.deficienciaDescricao || 'Sim'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bloco 2: Medidas Antropométricas & Indicadores de Saúde */}
            <div className="col-12">
              <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '20px' }}>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '16px', fontSize: '0.9375rem' }}>
                  Medidas Antropométricas & Indicadores de Saúde
                </h6>

                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <div style={calculatedBoxStyle}>
                      <span className="text-muted small">Massa Corporal</span>
                      <strong style={{ fontSize: '1.125rem', color: 'var(--text)' }}>
                        {selectedAssessment.medidas?.massaCorporal != null ? `${selectedAssessment.medidas.massaCorporal} kg` : '—'}
                      </strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={calculatedBoxStyle}>
                      <span className="text-muted small">Estatura</span>
                      <strong style={{ fontSize: '1.125rem', color: 'var(--text)' }}>
                        {selectedAssessment.medidas?.estatura != null ? `${selectedAssessment.medidas.estatura} cm` : '—'}
                      </strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={calculatedBoxStyle}>
                      <span className="text-muted small">Envergadura</span>
                      <strong style={{ fontSize: '1.125rem', color: 'var(--text)' }}>
                        {selectedAssessment.medidas?.envergadura != null ? `${selectedAssessment.medidas.envergadura} cm` : '—'}
                      </strong>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div style={calculatedBoxStyle}>
                      <span className="text-muted small">Perímetro da Cintura</span>
                      <strong style={{ fontSize: '1.125rem', color: 'var(--text)' }}>
                        {selectedAssessment.medidas?.perimetroCintura != null ? `${selectedAssessment.medidas.perimetroCintura} cm` : '—'}
                      </strong>
                    </div>
                  </div>

                  {/* IMC & RCE Cards */}
                  <div className="col-md-6">
                    <div style={{ ...calculatedBoxStyle, background: 'var(--bg)' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="text-muted small d-block">IMC Calculado</span>
                          <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                            {selectedAssessment.calculos?.imc != null ? `${selectedAssessment.calculos.imc} kg/m²` : '—'}
                          </strong>
                        </div>
                        <div>
                          {(() => {
                            const badge = getHealthBadge(selectedAssessment.classificacoes?.saude?.imc);
                            return (
                              <span style={{
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}>
                                {badge.icon} {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div style={{ ...calculatedBoxStyle, background: 'var(--bg)' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="text-muted small d-block">Razão Cintura-Estatura (RCE)</span>
                          <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                            {selectedAssessment.calculos?.rce != null ? selectedAssessment.calculos.rce : '—'}
                          </strong>
                        </div>
                        <div>
                          {(() => {
                            const badge = getHealthBadge(selectedAssessment.classificacoes?.saude?.rce);
                            return (
                              <span style={{
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}>
                                {badge.icon} {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 3: Cards dos 7 Testes */}
            <div className="col-12">
              <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '16px', fontSize: '0.9375rem' }}>
                Resultados dos Testes Motores (PROESP-Br 2021)
              </h6>

              <div className="row g-3">
                {/* 1. Corrida 6 min */}
                <div className="col-md-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '16px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text)' }}>1. Corrida/Caminhada de 6 min</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Aptidão Cardiorrespiratória</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Voltas: <strong>{selectedAssessment.testes?.corrida6Min?.voltas ?? '—'}</strong> ({selectedAssessment.testes?.corrida6Min?.perimetroPista ?? 200}m) • Última volta: <strong>{selectedAssessment.testes?.corrida6Min?.metrosUltimaVolta ?? '—'}m</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: 'var(--border-light)' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text)' }}>
                        Total: {selectedAssessment.testes?.corrida6Min?.totalMetros ?? selectedAssessment.calculos?.corrida6MinTotal ?? '—'} m
                      </span>
                      {(() => {
                        const pBadge = getPerformanceBadge(selectedAssessment.classificacoes?.desempenho?.corrida6Min);
                        return (
                          <span style={{ background: pBadge.bg, color: pBadge.color, border: `1px solid ${pBadge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                            {pBadge.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 2. Sentar e Alcançar */}
                <div className="col-md-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '16px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text)' }}>2. Sentar e Alcançar</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Flexibilidade</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Tentativa 1: <strong>{selectedAssessment.testes?.sentarAlcançar?.tentativa1 ?? '—'} cm</strong> • Tentativa 2: <strong>{selectedAssessment.testes?.sentarAlcançar?.tentativa2 ?? '—'} cm</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: 'var(--border-light)' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text)' }}>
                        Melhor: {selectedAssessment.testes?.sentarAlcançar?.melhorResultado ?? selectedAssessment.calculos?.sentarAlcançarMelhor ?? '—'} cm
                      </span>
                      {(() => {
                        const pBadge = getPerformanceBadge(selectedAssessment.classificacoes?.desempenho?.sentarAlcançar);
                        return (
                          <span style={{ background: pBadge.bg, color: pBadge.color, border: `1px solid ${pBadge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                            {pBadge.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 3. Abdominais */}
                <div className="col-md-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '16px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text)' }}>3. Abdominais em 1 minuto</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Resistência Muscular</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Movimentos completos realizados em 1 minuto
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: 'var(--border-light)' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text)' }}>
                        {selectedAssessment.testes?.abdominais1Min?.repeticoes != null ? `${selectedAssessment.testes.abdominais1Min.repeticoes} reps/min` : '—'}
                      </span>
                      {(() => {
                        const pBadge = getPerformanceBadge(selectedAssessment.classificacoes?.desempenho?.abdominais1Min);
                        return (
                          <span style={{ background: pBadge.bg, color: pBadge.color, border: `1px solid ${pBadge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                            {pBadge.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 4. Arremesso Medicine Ball */}
                <div className="col-md-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '16px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text)' }}>4. Arremesso de Medicine Ball (2 kg)</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Força MMSS</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Tentativa 1: <strong>{selectedAssessment.testes?.arremessoMedicineBall?.tentativa1 ?? '—'} cm</strong> • Tentativa 2: <strong>{selectedAssessment.testes?.arremessoMedicineBall?.tentativa2 ?? '—'} cm</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: 'var(--border-light)' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text)' }}>
                        Melhor: {selectedAssessment.testes?.arremessoMedicineBall?.melhorResultado ?? selectedAssessment.calculos?.arremessoMedicineBallMelhor ?? '—'} cm
                      </span>
                      {(() => {
                        const pBadge = getPerformanceBadge(selectedAssessment.classificacoes?.desempenho?.arremessoMedicineBall);
                        return (
                          <span style={{ background: pBadge.bg, color: pBadge.color, border: `1px solid ${pBadge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                            {pBadge.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 5. Salto Horizontal */}
                <div className="col-md-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '16px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text)' }}>5. Salto Horizontal</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Força MMII</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Tentativa 1: <strong>{selectedAssessment.testes?.saltoHorizontal?.tentativa1 ?? '—'} cm</strong> • Tentativa 2: <strong>{selectedAssessment.testes?.saltoHorizontal?.tentativa2 ?? '—'} cm</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: 'var(--border-light)' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text)' }}>
                        Melhor: {selectedAssessment.testes?.saltoHorizontal?.melhorResultado ?? selectedAssessment.calculos?.saltoHorizontalMelhor ?? '—'} cm
                      </span>
                      {(() => {
                        const pBadge = getPerformanceBadge(selectedAssessment.classificacoes?.desempenho?.saltoHorizontal);
                        return (
                          <span style={{ background: pBadge.bg, color: pBadge.color, border: `1px solid ${pBadge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                            {pBadge.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 6. Quadrado 4x4 */}
                <div className="col-md-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '16px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text)' }}>6. Quadrado de 4 × 4 metros</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Agilidade</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Tentativa 1: <strong>{selectedAssessment.testes?.quadrado4x4?.tentativa1 ?? '—'} s</strong> • Tentativa 2: <strong>{selectedAssessment.testes?.quadrado4x4?.tentativa2 ?? '—'} s</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: 'var(--border-light)' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text)' }}>
                        Melhor: {selectedAssessment.testes?.quadrado4x4?.melhorResultado ?? selectedAssessment.calculos?.quadrado4x4Melhor ?? '—'} s
                      </span>
                      {(() => {
                        const pBadge = getPerformanceBadge(selectedAssessment.classificacoes?.desempenho?.quadrado4x4);
                        return (
                          <span style={{ background: pBadge.bg, color: pBadge.color, border: `1px solid ${pBadge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                            {pBadge.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 7. Corrida 20m */}
                <div className="col-md-6">
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '16px' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text)' }}>7. Corrida de 20 metros</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Velocidade</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Tentativa 1: <strong>{selectedAssessment.testes?.corrida20m?.tentativa1 ?? '—'} s</strong> • Tentativa 2: <strong>{selectedAssessment.testes?.corrida20m?.tentativa2 ?? '—'} s</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: 'var(--border-light)' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text)' }}>
                        Melhor: {selectedAssessment.testes?.corrida20m?.melhorResultado ?? selectedAssessment.calculos?.corrida20mMelhor ?? '—'} s
                      </span>
                      {(() => {
                        const pBadge = getPerformanceBadge(selectedAssessment.classificacoes?.desempenho?.corrida20m);
                        return (
                          <span style={{ background: pBadge.bg, color: pBadge.color, border: `1px solid ${pBadge.border}`, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700 }}>
                            {pBadge.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {selectedAssessment.observacoes && (
                  <div className="col-12">
                    <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '16px' }}>
                      <strong style={{ fontSize: '0.8125rem', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Observações do Avaliador</strong>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                        {selectedAssessment.observacoes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODO 3: HISTÓRICO, COMPARAÇÃO E EVOLUÇÃO TEMPORAL                        */}
      {/* ========================================================================= */}
      {!isCreating && !isEditing && !selectedAssessment && (
        <div>
          {/* Header Principal da Aba */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: 'var(--primary)' }} />
                <span>Aptidão Física (PROESP-Br 2021)</span>
              </h5>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
                Acompanhamento longitudinal de medidas antropométricas, saúde e testes motores.
              </p>
            </div>

            {/* AÇÕES CENTRALIZADAS (BOTÃO ÚNICO + EXPORTAR PDF) */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {assessments.length > 0 && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setIsPdfModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}
                >
                  <Printer size={16} /> Exportar PDF
                </button>
              )}

              {/* ÚNICO BOTÃO PRINCIPAL DE CRIAÇÃO */}
              {!isReadOnly && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleStartNew}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}
                >
                  <Plus size={16} /> Nova Avaliação
                </button>
              )}
            </div>
          </div>

          {/* NAVEGAÇÃO DE SUB-VISÕES: LISTA / COMPARAR / EVOLUÇÃO TEMPORAL */}
          {assessments.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '12px',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: viewMode === 'list' ? 'var(--primary)' : 'var(--bg)',
                  color: viewMode === 'list' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Activity size={15} /> Histórico ({assessments.length})
              </button>

              {assessments.length >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    if (compareIds.length < 2 && assessments.length >= 2) {
                      setCompareIds([assessments[1]._id, assessments[0]._id]);
                    }
                    setViewMode('compare');
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: viewMode === 'compare' ? 'var(--primary)' : 'var(--bg)',
                    color: viewMode === 'compare' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <GitCompare size={15} /> Comparar Avaliações
                </button>
              )}

              {assessments.length >= 3 && (
                <button
                  type="button"
                  onClick={() => setViewMode('evolution')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: viewMode === 'evolution' ? 'var(--primary)' : 'var(--bg)',
                    color: viewMode === 'evolution' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <BarChart2 size={15} /> Gráfico de Evolução
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : assessments.length === 0 ? (
            /* ESTADO VAZIO: SEM BOTÕES DUPLICADOS, COM MENSAGEM CLARA */
            <div style={{
              textAlign: 'center',
              padding: '64px 24px',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px dashed var(--border)'
            }}>
              <Activity size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
              <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                Nenhuma avaliação de aptidão física registrada
              </h6>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto' }}>
                Utilize o botão <strong>+ Nova avaliação</strong> no topo para registrar a primeira avaliação motora e antropométrica com o protocolo PROESP-Br 2021.
              </p>
            </div>
          ) : viewMode === 'compare' ? (
            /* ========================================================================= */
            /* MODO: COMPARAÇÃO ENTRE DUAS AVALIAÇÕES                                   */
            /* ========================================================================= */
            <div className="fade-in">
              {/* SELETORES DAS 2 AVALIAÇÕES */}
              <div style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                padding: '16px 20px',
                marginBottom: '20px'
              }}>
                <div className="row g-3 align-items-center">
                  <div className="col-md-5">
                    <label className="form-label text-muted small fw-bold">Avaliação 1 (Base/Anterior)</label>
                    <select
                      value={compareIds[0] || ''}
                      onChange={(e) => setCompareIds([e.target.value, compareIds[1]])}
                      style={inputStyle}
                    >
                      {chronologicalAssessments.map(a => (
                        <option key={a._id} value={a._id}>
                          {new Date(a.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} — {a.modalidade || 'Geral'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-2 text-center d-flex align-items-center justify-content-center pt-md-3">
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'var(--primary-light)', color: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <GitCompare size={18} />
                    </div>
                  </div>

                  <div className="col-md-5">
                    <label className="form-label text-muted small fw-bold">Avaliação 2 (Recente/Comparada)</label>
                    <select
                      value={compareIds[1] || ''}
                      onChange={(e) => setCompareIds([compareIds[0], e.target.value])}
                      style={inputStyle}
                    >
                      {chronologicalAssessments.map(a => (
                        <option key={a._id} value={a._id}>
                          {new Date(a.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} — {a.modalidade || 'Geral'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {assessment1 && assessment2 ? (
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  overflow: 'hidden'
                }}>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle m-0" style={{ fontSize: '0.875rem' }}>
                      <thead style={{ background: 'var(--bg)', color: 'var(--text)', borderBottom: '2px solid var(--border)' }}>
                        <tr>
                          <th style={{ padding: '12px 16px', fontWeight: 700 }}>Indicador / Teste Motor</th>
                          <th style={{ padding: '12px 16px', fontWeight: 700 }}>
                            {new Date(assessment1.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </th>
                          <th style={{ padding: '12px 16px', fontWeight: 700 }}>
                            {new Date(assessment2.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </th>
                          <th style={{ padding: '12px 16px', fontWeight: 700 }}>Variação</th>
                          <th style={{ padding: '12px 16px', fontWeight: 700 }}>Evolução</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'massaCorporal', label: 'Massa Corporal', val1: assessment1.medidas?.massaCorporal, val2: assessment2.medidas?.massaCorporal, unit: 'kg' },
                          { key: 'estatura', label: 'Estatura', val1: assessment1.medidas?.estatura, val2: assessment2.medidas?.estatura, unit: 'cm' },
                          { key: 'imc', label: 'IMC (Índice de Massa Corporal)', val1: assessment1.calculos?.imc, val2: assessment2.calculos?.imc, unit: 'kg/m²', class1: assessment1.classificacoes?.saude?.imc, class2: assessment2.classificacoes?.saude?.imc },
                          { key: 'rce', label: 'Razão Cintura-Estatura (RCE)', val1: assessment1.calculos?.rce, val2: assessment2.calculos?.rce, unit: '', class1: assessment1.classificacoes?.saude?.rce, class2: assessment2.classificacoes?.saude?.rce },
                          { key: 'corrida6MinTotal', label: '1. Corrida 6 min (Aptidão Cardiorrespiratória)', val1: assessment1.testes?.corrida6Min?.totalMetros ?? assessment1.calculos?.corrida6MinTotal, val2: assessment2.testes?.corrida6Min?.totalMetros ?? assessment2.calculos?.corrida6MinTotal, unit: 'm', class1: assessment1.classificacoes?.desempenho?.corrida6Min, class2: assessment2.classificacoes?.desempenho?.corrida6Min },
                          { key: 'sentarAlcançarMelhor', label: '2. Sentar e Alcançar (Flexibilidade)', val1: assessment1.testes?.sentarAlcançar?.melhorResultado ?? assessment1.calculos?.sentarAlcançarMelhor, val2: assessment2.testes?.sentarAlcançar?.melhorResultado ?? assessment2.calculos?.sentarAlcançarMelhor, unit: 'cm', class1: assessment1.classificacoes?.desempenho?.sentarAlcançar, class2: assessment2.classificacoes?.desempenho?.sentarAlcançar },
                          { key: 'abdominais1Min', label: '3. Abdominais em 1 min (Resistência)', val1: assessment1.testes?.abdominais1Min?.repeticoes, val2: assessment2.testes?.abdominais1Min?.repeticoes, unit: 'reps', class1: assessment1.classificacoes?.desempenho?.abdominais1Min, class2: assessment2.classificacoes?.desempenho?.abdominais1Min },
                          { key: 'arremessoMedicineBallMelhor', label: '4. Arremesso Medicine Ball (Força MMSS)', val1: assessment1.testes?.arremessoMedicineBall?.melhorResultado ?? assessment1.calculos?.arremessoMedicineBallMelhor, val2: assessment2.testes?.arremessoMedicineBall?.melhorResultado ?? assessment2.calculos?.arremessoMedicineBallMelhor, unit: 'cm', class1: assessment1.classificacoes?.desempenho?.arremessoMedicineBall, class2: assessment2.classificacoes?.desempenho?.arremessoMedicineBall },
                          { key: 'saltoHorizontalMelhor', label: '5. Salto Horizontal (Força MMII)', val1: assessment1.testes?.saltoHorizontal?.melhorResultado ?? assessment1.calculos?.saltoHorizontalMelhor, val2: assessment2.testes?.saltoHorizontal?.melhorResultado ?? assessment2.calculos?.saltoHorizontalMelhor, unit: 'cm', class1: assessment1.classificacoes?.desempenho?.saltoHorizontal, class2: assessment2.classificacoes?.desempenho?.saltoHorizontal },
                          { key: 'quadrado4x4Melhor', label: '6. Quadrado 4×4 m (Agilidade - menor é melhor)', val1: assessment1.testes?.quadrado4x4?.melhorResultado ?? assessment1.calculos?.quadrado4x4Melhor, val2: assessment2.testes?.quadrado4x4?.melhorResultado ?? assessment2.calculos?.quadrado4x4Melhor, unit: 's', class1: assessment1.classificacoes?.desempenho?.quadrado4x4, class2: assessment2.classificacoes?.desempenho?.quadrado4x4 },
                          { key: 'corrida20mMelhor', label: '7. Corrida 20 m (Velocidade - menor é melhor)', val1: assessment1.testes?.corrida20m?.melhorResultado ?? assessment1.calculos?.corrida20mMelhor, val2: assessment2.testes?.corrida20m?.melhorResultado ?? assessment2.calculos?.corrida20mMelhor, unit: 's', class1: assessment1.classificacoes?.desempenho?.corrida20m, class2: assessment2.classificacoes?.desempenho?.corrida20m }
                        ].map((m) => {
                          const evo = evaluateMetricEvolution(m.key, m.val1, m.val2);
                          const deltaText = evo.delta != null ? (evo.delta > 0 ? `+${evo.delta}` : `${evo.delta}`) + (m.unit ? ` ${m.unit}` : '') : '—';
                          
                          return (
                            <tr key={m.key}>
                              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>
                                {m.label}
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontWeight: 700 }}>
                                  {m.val1 != null ? `${m.val1} ${m.unit}` : '—'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontWeight: 700 }}>
                                  {m.val2 != null ? `${m.val2} ${m.unit}` : '—'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: 700, color: evo.color }}>
                                {deltaText}
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                {evo.status === 'melhorou' && (
                                  <span style={{
                                    background: 'var(--success-light)',
                                    color: 'var(--success-text)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <TrendingUp size={14} /> Melhorou
                                  </span>
                                )}
                                {evo.status === 'piorou' && (
                                  <span style={{
                                    background: 'var(--error-light)',
                                    color: 'var(--error-text)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <TrendingDown size={14} /> Piorou
                                  </span>
                                )}
                                {evo.status === 'igual' && (
                                  <span style={{
                                    background: 'var(--bg)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <Minus size={14} /> Sem alteração relevante
                                  </span>
                                )}
                                {(evo.status === 'aumento' || evo.status === 'reducao') && (
                                  <span style={{
                                    background: 'var(--bg)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}>
                                    {evo.label}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-muted text-center py-4">Selecione duas avaliações para comparar os resultados.</p>
              )}
            </div>
          ) : viewMode === 'evolution' ? (
            /* ========================================================================= */
            /* MODO: GRÁFICO DE EVOLUÇÃO TEMPORAL (3+ AVALIAÇÕES)                       */
            /* ========================================================================= */
            <div className="fade-in">
              <div style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'block' }}>
                    Evolução Longitudinal de Desempenho
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Acompanhe o progresso temporal do atleta nos testes do PROESP-Br.
                  </span>
                </div>

                <div style={{ minWidth: '220px' }}>
                  <select
                    value={evolutionMetric}
                    onChange={(e) => setEvolutionMetric(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="saltoHorizontalMelhor">5. Salto Horizontal (cm)</option>
                    <option value="corrida20mMelhor">7. Corrida 20m (s)</option>
                    <option value="quadrado4x4Melhor">6. Quadrado 4×4m (s)</option>
                    <option value="corrida6MinTotal">1. Corrida 6 min (m)</option>
                    <option value="sentarAlcançarMelhor">2. Sentar e Alcançar (cm)</option>
                    <option value="abdominais1Min">3. Abdominais (reps)</option>
                    <option value="arremessoMedicineBallMelhor">4. Medicine Ball (cm)</option>
                    <option value="imc">IMC (kg/m²)</option>
                    <option value="massaCorporal">Massa Corporal (kg)</option>
                  </select>
                </div>
              </div>

              {/* RENDERIZADOR DO GRÁFICO SVG RESPONSIVO */}
              {(() => {
                const metricRule = TEST_DIRECTION_RULES[evolutionMetric] || { label: 'Indicador', unit: '' };
                const points = chronologicalAssessments.map(a => {
                  let val = null;
                  if (evolutionMetric === 'massaCorporal') val = a.medidas?.massaCorporal;
                  else if (evolutionMetric === 'imc') val = a.calculos?.imc;
                  else if (evolutionMetric === 'corrida6MinTotal') val = a.testes?.corrida6Min?.totalMetros ?? a.calculos?.corrida6MinTotal;
                  else if (evolutionMetric === 'sentarAlcançarMelhor') val = a.testes?.sentarAlcançar?.melhorResultado ?? a.calculos?.sentarAlcançarMelhor;
                  else if (evolutionMetric === 'abdominais1Min') val = a.testes?.abdominais1Min?.repeticoes;
                  else if (evolutionMetric === 'arremessoMedicineBallMelhor') val = a.testes?.arremessoMedicineBall?.melhorResultado ?? a.calculos?.arremessoMedicineBallMelhor;
                  else if (evolutionMetric === 'saltoHorizontalMelhor') val = a.testes?.saltoHorizontal?.melhorResultado ?? a.calculos?.saltoHorizontalMelhor;
                  else if (evolutionMetric === 'quadrado4x4Melhor') val = a.testes?.quadrado4x4?.melhorResultado ?? a.calculos?.quadrado4x4Melhor;
                  else if (evolutionMetric === 'corrida20mMelhor') val = a.testes?.corrida20m?.melhorResultado ?? a.calculos?.corrida20mMelhor;

                  return {
                    dateStr: new Date(a.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC', month: 'short', day: 'numeric', year: '2-digit' }),
                    val: val != null && !isNaN(Number(val)) ? Number(val) : null
                  };
                }).filter(p => p.val !== null);

                if (points.length < 2) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
                      Dados insuficientes para gerar a curva deste indicador.
                    </div>
                  );
                }

                const minVal = Math.min(...points.map(p => p.val));
                const maxVal = Math.max(...points.map(p => p.val));
                const range = (maxVal - minVal) || 1;

                const width = 600;
                const height = 220;
                const padX = 50;
                const padY = 30;

                const getX = (idx) => padX + (idx / (points.length - 1)) * (width - 2 * padX);
                const getY = (val) => height - padY - ((val - minVal) / range) * (height - 2 * padY);

                const polylinePoints = points.map((p, i) => `${getX(i)},${getY(p.val)}`).join(' ');

                const firstVal = points[0].val;
                const lastVal = points[points.length - 1].val;
                const totalEvo = evaluateMetricEvolution(evolutionMetric, firstVal, lastVal);

                return (
                  <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    padding: '24px'
                  }}>
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                      <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                        {metricRule.label} ({metricRule.unit})
                      </h6>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          Evolução Total: <strong>{totalEvo.label}</strong> ({firstVal} ➔ {lastVal} {metricRule.unit})
                        </span>
                      </div>
                    </div>

                    <div style={{ width: '100%', overflowX: 'auto' }}>
                      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxHeight: '260px', overflow: 'visible' }}>
                        {/* Linhas de Grade de Fundo */}
                        <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="var(--border-light)" strokeDasharray="4" />
                        <line x1={padX} y1={height / 2} x2={width - padX} y2={height / 2} stroke="var(--border-light)" strokeDasharray="4" />
                        <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="var(--border-light)" />

                        {/* Linha do Gráfico */}
                        <polyline
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={polylinePoints}
                        />

                        {/* Pontos e Rótulos */}
                        {points.map((p, i) => {
                          const cx = getX(i);
                          const cy = getY(p.val);
                          return (
                            <g key={i}>
                              <circle
                                cx={cx}
                                cy={cy}
                                r="6"
                                fill="var(--bg-card)"
                                stroke="var(--primary)"
                                strokeWidth="3"
                              />
                              <text
                                x={cx}
                                y={cy - 12}
                                textAnchor="middle"
                                fill="var(--text)"
                                fontSize="11"
                                fontWeight="700"
                              >
                                {p.val}
                              </text>
                              <text
                                x={cx}
                                y={height - 10}
                                textAnchor="middle"
                                fill="var(--text-secondary)"
                                fontSize="10"
                                fontWeight="600"
                              >
                                {p.dateStr}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* ========================================================================= */
            /* MODO: LISTA / HISTÓRICO PADRÃO                                            */
            /* ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {assessments.map((a) => {
                const dateFormatted = new Date(a.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                return (
                  <div 
                    key={a._id}
                    onClick={() => setSelectedAssessment(a)}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-light)',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                    className="hover-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Activity size={24} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '1rem', color: 'var(--text)' }}>
                            {dateFormatted}
                          </strong>
                          <span className="badge" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', fontSize: '0.75rem' }}>
                            {a.modalidade || 'Geral'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {a.calculos?.imc && <span>IMC: <strong>{a.calculos.imc}</strong></span>}
                          {a.calculos?.rce && <span>RCE: <strong>{a.calculos.rce}</strong></span>}
                          {a.testes?.corrida6Min?.totalMetros && <span>6 min: <strong>{a.testes.corrida6Min.totalMetros} m</strong></span>}
                          {a.testes?.saltoHorizontal?.melhorResultado && <span>Salto: <strong>{a.testes.saltoHorizontal.melhorResultado} cm</strong></span>}
                          {a.avaliador?.nome && <span>Avaliador: <strong>{a.avaliador.nome}</strong></span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={(e) => { e.stopPropagation(); setSelectedAssessment(a); }}
                        style={{ fontSize: '0.8125rem' }}
                      >
                        Ver Detalhes
                      </button>

                      {!isReadOnly && (
                        <>
                          <button 
                            type="button" 
                            className="btn btn-outline-primary btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleStartEdit(a); }}
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-danger btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleDelete(a._id); }}
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}

                      <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE EXPORTAÇÃO PARA PDF */}
      <PhysicalAssessmentPDFExport
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        assessments={assessments}
        student={student}
        selectedAssessmentId={selectedAssessment?._id}
        initialCompareIds={compareIds}
      />
    </div>
  );
};

export default PhysicalAssessmentTab;
