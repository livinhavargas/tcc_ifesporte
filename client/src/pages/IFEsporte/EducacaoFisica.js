import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  GraduationCap, Users, Calendar, Clock, BookOpen, Plus, 
  ChevronRight, ArrowLeft, Pencil, Trash2, CheckCircle2, 
  Building, Laptop, School,
  X, Search, FileText, CalendarCheck, User, Phone, Mail, 
  ExternalLink, Award
} from 'lucide-react';
import Layout from '../../components/Layout';
import { apiUrl } from '../../services/api';
import SportIcon from '../../components/SportIcon';

const DIAS_SEMANA = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export default function EducacaoFisica() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navegação: 'courses' | 'classes' | 'class-detail'
  const [selectedCourseSlug, setSelectedCourseSlug] = useState(searchParams.get('curso') || null);
  const [selectedClassId, setSelectedClassId] = useState(searchParams.get('turmaId') || null);

  const [coursesSummary, setCoursesSummary] = useState([]);
  const [currentCourseData, setCurrentCourseData] = useState(null);
  const [currentClassData, setCurrentClassData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Busca e Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('aulas'); // 'aulas' | 'alunos'

  // Modal de Detalhes do Aluno (Visualização Compacta -> Perfil Completo)
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // Modal de Relatório de Aula (Registrar / Editar)
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [reportForm, setReportForm] = useState({
    data: new Date().toISOString().split('T')[0],
    horario: '08:00',
    diaSemana: 'Terça-feira',
    conteudo: '',
    observacoes: ''
  });

  // Modal de Configurar Horários Semanais
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState([
    { diaSemana: 'Terça-feira', horario: '08:00', duracaoMinutos: 45 },
    { diaSemana: 'Quinta-feira', horario: '10:00', duracaoMinutos: 45 }
  ]);

  // Modal de Confirmação de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  // 1. Carregar Resumo dos Cursos
  const fetchCoursesSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/educacao-fisica/cursos'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoursesSummary(data);
      }
    } catch (err) {
      console.error('Erro ao carregar cursos de Educação Física:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Carregar Turmas do Curso Selecionado
  const fetchCourseClasses = useCallback(async (slug) => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl(`/api/educacao-fisica/cursos/${slug}`), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentCourseData(data);
      }
    } catch (err) {
      console.error('Erro ao carregar turmas do curso:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Carregar Detalhes da Turma Selecionada
  const fetchClassDetail = useCallback(async (classId) => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl(`/api/educacao-fisica/turma/${classId}`), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentClassData(data);
        if (data.horariosSemanais && data.horariosSemanais.length > 0) {
          setScheduleForm(data.horariosSemanais.map(h => ({
            ...h,
            duracaoMinutos: h.duracaoMinutos || 45
          })));
        }
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes da turma:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincronizar URL e Carregamentos
  useEffect(() => {
    if (selectedClassId) {
      fetchClassDetail(selectedClassId);
    } else if (selectedCourseSlug) {
      fetchCourseClasses(selectedCourseSlug);
    } else {
      fetchCoursesSummary();
    }
  }, [selectedCourseSlug, selectedClassId, fetchCoursesSummary, fetchCourseClasses, fetchClassDetail]);

  const handleSelectCourse = (slug) => {
    setSelectedCourseSlug(slug);
    setSelectedClassId(null);
    setSearchParams({ curso: slug });
  };

  const handleSelectClass = (classId) => {
    setSelectedClassId(classId);
    setSearchParams({ curso: selectedCourseSlug, turmaId: classId });
  };

  const handleBackToCourses = () => {
    setSelectedCourseSlug(null);
    setSelectedClassId(null);
    setCurrentCourseData(null);
    setCurrentClassData(null);
    setSearchParams({});
    fetchCoursesSummary();
  };

  const handleBackToClasses = () => {
    setSelectedClassId(null);
    setCurrentClassData(null);
    setSearchParams({ curso: selectedCourseSlug });
    if (selectedCourseSlug) {
      fetchCourseClasses(selectedCourseSlug);
    }
  };

  // Abrir modal de criação de relatório
  const handleOpenNewReport = () => {
    const today = new Date();
    const dayOfWeekIndex = today.getDay(); // 0 = Domingo, 1 = Segunda, ...
    const dayMap = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const currentDayName = dayMap[dayOfWeekIndex] || 'Terça-feira';

    const defaultTime = currentClassData?.horariosSemanais?.[0]?.horario || '08:00';
    const defaultDay = currentClassData?.horariosSemanais?.[0]?.diaSemana || currentDayName;

    setEditingReportId(null);
    setReportForm({
      data: today.toISOString().split('T')[0],
      horario: defaultTime,
      diaSemana: defaultDay,
      conteudo: '',
      observacoes: ''
    });
    setReportModalOpen(true);
  };

  // Abrir modal de edição de relatório
  const handleOpenEditReport = (relatorio) => {
    setEditingReportId(relatorio._id);
    setReportForm({
      data: relatorio.data ? relatorio.data.split('T')[0] : new Date().toISOString().split('T')[0],
      horario: relatorio.horario || '08:00',
      diaSemana: relatorio.diaSemana || 'Terça-feira',
      conteudo: relatorio.conteudo || '',
      observacoes: relatorio.observacoes || ''
    });
    setReportModalOpen(true);
  };

  // Salvar Relatório de Aula (POST ou PUT)
  const handleSaveReport = async (e) => {
    e.preventDefault();
    if (!reportForm.conteudo.trim()) {
      setMessage('❌ O conteúdo trabalhado na aula é obrigatório.');
      return;
    }

    try {
      setActionLoading(true);
      const url = editingReportId
        ? apiUrl(`/api/educacao-fisica/turma/${selectedClassId}/relatorios/${editingReportId}`)
        : apiUrl(`/api/educacao-fisica/turma/${selectedClassId}/relatorios`);

      const method = editingReportId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reportForm)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Relatório de aula ${editingReportId ? 'atualizado' : 'registrado'} com sucesso!`);
        setReportModalOpen(false);
        fetchClassDetail(selectedClassId);
        setTimeout(() => setMessage(''), 3500);
      } else {
        setMessage(`❌ ${data.message || 'Erro ao salvar relatório de aula.'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Erro de conexão com o servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirmar Exclusão de Relatório
  const handleConfirmDeleteReport = async () => {
    if (!reportToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(apiUrl(`/api/educacao-fisica/turma/${selectedClassId}/relatorios/${reportToDelete._id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setMessage('✅ Relatório de aula excluído com sucesso.');
        setDeleteModalOpen(false);
        setReportToDelete(null);
        fetchClassDetail(selectedClassId);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.message || 'Erro ao excluir relatório.'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Erro ao excluir relatório.');
    } finally {
      setActionLoading(false);
    }
  };

  // Salvar Horários Semanais da Turma
  const handleSaveSchedules = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch(apiUrl(`/api/educacao-fisica/turma/${selectedClassId}/horarios`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          horariosSemanais: scheduleForm.map(h => ({
            diaSemana: h.diaSemana,
            horario: h.horario,
            duracaoMinutos: Number(h.duracaoMinutos) || 45
          }))
        })
      });

      if (res.ok) {
        setMessage('✅ Horários semanais de Educação Física atualizados com sucesso!');
        setScheduleModalOpen(false);
        fetchClassDetail(selectedClassId);
        setTimeout(() => setMessage(''), 3500);
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.message || 'Erro ao salvar horários.'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Erro de conexão com o servidor.');
    } finally {
      setActionLoading(false);
    }
  };

  // Agrupamento das turmas por Ano Escolar (Apenas 1º Ano e 2º Ano possuem Educação Física)
  const groupedTurmas = useMemo(() => {
    if (!currentCourseData?.turmas) return {};
    const groups = {
      '1º Ano': [],
      '2º Ano': []
    };

    currentCourseData.turmas.forEach(t => {
      const nome = (t.turma || '').trim();
      const clean = nome.replace(/[º°\s]/g, '');
      // Ignorar 3º ano completamente da Educação Física
      if (/^3/i.test(clean)) return;

      if (/^1/i.test(clean)) {
        groups['1º Ano'].push(t);
      } else if (/^2/i.test(clean)) {
        groups['2º Ano'].push(t);
      }
    });

    // Ordenar turmas alfabeticamente dentro de cada grupo
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.turma.localeCompare(b.turma, 'pt-BR', { numeric: true }));
    });

    return groups;
  }, [currentCourseData?.turmas]);

  // Alunos filtrados por busca
  const filteredStudents = useMemo(() => {
    if (!currentClassData?.alunos) return [];
    if (!searchTerm.trim()) return currentClassData.alunos;
    const term = searchTerm.toLowerCase();
    return currentClassData.alunos.filter(a => 
      (a.nome && a.nome.toLowerCase().includes(term)) ||
      (a.matricula && a.matricula.toLowerCase().includes(term)) ||
      (a.turma && a.turma.toLowerCase().includes(term)) ||
      (a.modalidades && a.modalidades.some(m => m.toLowerCase().includes(term))) ||
      (a.esportes && a.esportes.some(e => e.toLowerCase().includes(term)))
    );
  }, [currentClassData?.alunos, searchTerm]);

  // Helper para cálculo de idade
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? null : age;
  };

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

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* MENSAGEM GLOBAL DE FEEDBACK */}
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
        {/* NÍVEL 1: TELA DE CURSOS (HOSPEDAGEM & INFORMÁTICA PARA INTERNET)          */}
        {/* ========================================================================= */}
        {!selectedCourseSlug && !selectedClassId && (
          <div className="fade-in">
            {/* Header da Seção de Educação Física */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <GraduationCap size={22} />
                  </div>
                  <h2 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>
                    Educação Física
                  </h2>
                </div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
                  Organização escolar das aulas de Educação Física, turmas e registros de conteúdo trabalhado.
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2 small">Carregando cursos escolares...</p>
              </div>
            ) : (
              <div className="row g-4">
                {coursesSummary.map((c) => {
                  const isInfo = c.slug.includes('informatica');
                  return (
                    <div key={c.slug} className="col-md-6">
                      <div
                        onClick={() => handleSelectCourse(c.slug)}
                        style={{
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-xl)',
                          border: '1.5px solid var(--border-light)',
                          padding: '32px 28px',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        className="hover-card"
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: 'var(--radius-lg)',
                              background: isInfo ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                              color: isInfo ? '#2563eb' : '#d97706',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isInfo ? <Laptop size={28} /> : <Building size={28} />}
                            </div>

                            <span className="badge" style={{
                              background: 'var(--bg)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border)',
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              {c.totalTurmas} turmas ativas
                            </span>
                          </div>

                          <h4 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '8px', fontSize: '1.25rem' }}>
                            {c.nome}
                          </h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px', lineHeight: '1.5' }}>
                            {c.descricao}
                          </p>
                        </div>

                        <div>
                          <div style={{
                            display: 'flex',
                            gap: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid var(--border-light)',
                            marginBottom: '16px',
                            flexWrap: 'wrap'
                          }}>
                            <div>
                              <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>Alunos Matriculados:</span>
                              <strong style={{ fontSize: '1.125rem', color: 'var(--text)' }}>
                                {c.totalAlunos} alunos
                              </strong>
                            </div>
                            <div>
                              <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>Aulas Registradas:</span>
                              <strong style={{ fontSize: '1.125rem', color: 'var(--primary)' }}>
                                {c.totalRelatorios} aulas
                              </strong>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            fontSize: '0.875rem'
                          }}>
                            <span>Acessar Turmas de {c.nome.split(' ')[0]}</span>
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* NÍVEL 2: TELA DE TURMAS DO CURSO ORGANIZADAS POR ANO (1º, 2º e 3º ANO)     */}
        {/* ========================================================================= */}
        {selectedCourseSlug && !selectedClassId && (
          <div className="fade-in">
            {/* Header com Navegação e Breadcrumb */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '28px',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <button
                    onClick={handleBackToCourses}
                    className="btn btn-outline-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    <ArrowLeft size={14} /> Voltar para Cursos
                  </button>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>/</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8125rem' }}>
                    {currentCourseData?.curso || selectedCourseSlug}
                  </span>
                </div>

                <h3 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <School size={20} style={{ color: 'var(--primary)' }} />
                  <span>Turmas de {currentCourseData?.curso}</span>
                </h3>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2 small">Carregando turmas organizadas por ano...</p>
              </div>
            ) : currentCourseData?.turmas?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--bg)', borderRadius: 'var(--radius-lg)' }}>
                <p className="text-muted m-0">Nenhuma turma cadastrada para este curso.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {['1º Ano', '2º Ano'].map((anoKey) => {
                  const turmasDoAno = groupedTurmas[anoKey] || [];
                  if (turmasDoAno.length === 0) return null;

                  return (
                    <div key={anoKey} style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-xl)',
                      border: '1.5px solid var(--border-light)',
                      padding: '24px 22px',
                      boxShadow: 'var(--shadow-xs)'
                    }}>
                      {/* Cabeçalho da Seção do Ano */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '18px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid var(--border-light)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            fontWeight: 800,
                            fontSize: '0.8125rem',
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-md)'
                          }}>
                            {anoKey}
                          </span>
                          <h4 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>
                            Turmas do {anoKey}
                          </h4>
                        </div>

                        <span className="badge" style={{
                          background: 'var(--bg)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {turmasDoAno.length} {turmasDoAno.length === 1 ? 'turma' : 'turmas'}
                        </span>
                      </div>

                      {/* Grid de Turmas do Ano */}
                      <div className="row g-3">
                        {turmasDoAno.map((t) => (
                          <div key={t._id} className="col-md-6 col-lg-4">
                            <div
                              onClick={() => handleSelectClass(t._id)}
                              style={{
                                background: 'var(--bg)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border)',
                                padding: '18px',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                              className="hover-card"
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                  <h5 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>
                                    {t.turma}
                                  </h5>
                                  <span className="badge" style={{
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                  }}>
                                    {t.totalAlunos} alunos
                                  </span>
                                </div>

                                {/* 2 Dias de Aula de Educação Física */}
                                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: '14px', border: '1px solid var(--border-light)' }}>
                                  <span className="text-muted d-block small mb-1" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                    Aulas Semanais:
                                  </span>
                                  {t.horariosSemanais && t.horariosSemanais.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      {t.horariosSemanais.map((h, i) => (
                                        <div key={i} style={{ fontSize: '0.8125rem', color: 'var(--text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <Clock size={13} style={{ color: 'var(--primary)' }} />
                                          <span>{h.diaSemana} — {h.horario} <small style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>({h.duracaoMinutos || 45} min)</small></span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Não configurados</span>
                                  )}
                                </div>
                              </div>

                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderTop: '1px solid var(--border-light)',
                                paddingTop: '10px',
                                fontSize: '0.8125rem'
                              }}>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  <strong>{t.totalRelatorios}</strong> relatórios
                                </span>
                                <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  Acessar Turma <ChevronRight size={15} />
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* NÍVEL 3: TELA DETALHADA DA TURMA (ALUNOS & HISTÓRICO DE AULAS)             */}
        {/* ========================================================================= */}
        {selectedClassId && currentClassData && (
          <div className="fade-in">
            {/* Header da Turma */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <button
                    onClick={handleBackToClasses}
                    className="btn btn-outline-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    <ArrowLeft size={14} /> Voltar para Turmas
                  </button>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>/</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {currentClassData.curso}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>/</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8125rem' }}>
                    {currentClassData.turma}
                  </span>
                </div>

                <h3 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <School size={20} style={{ color: 'var(--primary)' }} />
                  <span>{currentClassData.turma} — {currentClassData.curso}</span>
                </h3>
              </div>
            </div>

            {/* SEÇÃO PRINCIPAL: AULAS DE EDUCAÇÃO FÍSICA E AÇÕES ÚNICAS */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid var(--border-light)',
              padding: '22px 24px',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <CalendarCheck size={16} /> Aulas de Educação Física
                  </span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
                    2 aulas semanais com duração padrão de 45 minutos.
                  </p>
                </div>

                {/* BOTÕES ÚNICOS: 1 BOTÃO CONFIGURAR HORÁRIOS + 1 BOTÃO REGISTRAR AULA */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setScheduleModalOpen(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, padding: '8px 16px', borderRadius: 'var(--radius-md)' }}
                  >
                    <Clock size={15} /> Configurar horários
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleOpenNewReport}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, padding: '8px 16px', borderRadius: 'var(--radius-md)' }}
                  >
                    <Plus size={16} /> Registrar aula
                  </button>
                </div>
              </div>

              {/* Cards de Horários */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {currentClassData.horariosSemanais && currentClassData.horariosSemanais.length > 0 ? (
                  currentClassData.horariosSemanais.map((h, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minWidth: '220px'
                      }}
                    >
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.875rem'
                      }}>
                        {idx + 1}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'block' }}>
                          {h.diaSemana} — {h.horario}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Duração: <strong>{h.duracaoMinutos || 45} min</strong>
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small m-0">Nenhum horário configurado para esta turma.</p>
                )}
              </div>
            </div>

            {/* TABS DE VISUALIZAÇÃO: AULAS REALIZADAS vs ALUNOS DA TURMA */}
            <div style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '20px'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('aulas')}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  border: 'none',
                  borderBottom: activeTab === 'aulas' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                  background: activeTab === 'aulas' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'aulas' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <BookOpen size={16} />
                <span>Histórico de Aulas ({currentClassData.relatorios?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('alunos')}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  border: 'none',
                  borderBottom: activeTab === 'alunos' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                  background: activeTab === 'alunos' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'alunos' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Users size={16} />
                <span>Alunos da Turma ({currentClassData.alunos?.length || 0})</span>
              </button>
            </div>

            {/* TAB CONTENT 1: HISTÓRICO DE AULAS REGISTRADAS */}
            {activeTab === 'aulas' && (
              <div>
                {currentClassData.relatorios && currentClassData.relatorios.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {currentClassData.relatorios.map((rel) => {
                      const dateFormatted = new Date(rel.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                      return (
                        <div
                          key={rel._id}
                          style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-light)',
                            padding: '20px',
                            boxShadow: 'var(--shadow-xs)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Calendar size={20} />
                              </div>
                              <div>
                                <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'block' }}>
                                  {dateFormatted} — {rel.diaSemana || 'Aula'}
                                </strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  Horário: <strong>{rel.horario}</strong> • Registrado por: <strong>{rel.responsavelNome || 'Professor(a)'}</strong>
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleOpenEditReport(rel)}
                                title="Editar Relatório"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '4px 10px' }}
                              >
                                <Pencil size={13} /> Editar
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => {
                                  setReportToDelete(rel);
                                  setDeleteModalOpen(true);
                                }}
                                title="Excluir Relatório"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '4px 10px' }}
                              >
                                <Trash2 size={13} /> Excluir
                              </button>
                            </div>
                          </div>

                          {/* Conteúdo trabalhado */}
                          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginTop: '12px' }}>
                            <span className="text-muted d-block small mb-1" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Conteúdo Trabalhado na Aula:
                            </span>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                              {rel.conteudo}
                            </p>
                          </div>

                          {/* Observações adicionais */}
                          {rel.observacoes && (
                            <div style={{ marginTop: '10px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                              <strong style={{ color: 'var(--text)' }}>Observações:</strong> {rel.observacoes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '54px 20px',
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px dashed var(--border)'
                  }}>
                    <BookOpen size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '10px' }} />
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                      Nenhuma aula registrada nesta turma
                    </h6>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>
                      Utilize o botão "Registrar aula" acima para manter o histórico e o diário pedagógico atualizados.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: ALUNOS DA TURMA (VISUALIZAÇÃO COMPACTA ESTILO ANÁLISES + PERFIL AO CLICAR) */}
            {activeTab === 'alunos' && (
              <div>
                {/* BARRA DE PESQUISA AMPLIADA E CONFORTÁVEL */}
                <div style={{
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                  background: 'var(--bg-card)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <div style={{ position: 'relative', flex: '1 1 360px', minWidth: '240px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      type="text"
                      placeholder="Pesquisar aluno por nome, matrícula ou modalidade..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        ...inputStyle,
                        paddingLeft: '42px',
                        paddingRight: searchTerm ? '36px' : '14px',
                        height: '44px',
                        fontSize: '0.875rem',
                        background: 'var(--bg)'
                      }}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-tertiary)',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Exibindo <strong>{filteredStudents.length}</strong> de <strong>{currentClassData.alunos?.length || 0}</strong> alunos
                  </span>
                </div>

                {filteredStudents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg)', borderRadius: 'var(--radius-lg)' }}>
                    <Users size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
                    <p className="text-muted m-0 small">
                      {searchTerm ? 'Nenhum aluno encontrado para os termos pesquisados.' : 'Nenhum aluno vinculado a esta turma no momento.'}
                    </p>
                  </div>
                ) : (
                  /* GRID DE CARDS COMPACTOS E OBJETIVOS DE ALUNOS (REFERÊNCIA ANÁLISES) */
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '14px'
                  }}>
                    {filteredStudents.map((aluno) => {
                      return (
                        <div
                          key={aluno._id}
                          className="hover-card"
                          style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-light)',
                            padding: '16px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px',
                            boxShadow: 'var(--shadow-xs)',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {aluno.foto ? (
                              <img
                                src={aluno.foto}
                                alt={aluno.nome}
                                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                              />
                            ) : (
                              <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '1rem',
                                flexShrink: 0
                              }}>
                                {aluno.nome ? aluno.nome.charAt(0).toUpperCase() : 'A'}
                              </div>
                            )}

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h6 style={{
                                fontWeight: 700,
                                color: 'var(--text)',
                                margin: 0,
                                fontSize: '0.9375rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {aluno.nome}
                              </h6>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                                {aluno.turma || currentClassData.turma} • {currentClassData.curso}
                              </span>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid var(--border-light)',
                            paddingTop: '10px'
                          }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                              {aluno.matricula ? `Mat: ${aluno.matricula}` : 'Sem matrícula'}
                            </span>

                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setSelectedStudentForModal(aluno)}
                              style={{
                                fontSize: '0.75rem',
                                padding: '4px 12px',
                                fontWeight: 600,
                                borderRadius: 'var(--radius-md)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              Ver perfil
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: PERFIL COMPLETO / DETALHADO DO ALUNO (CONSULTA RÁPIDA DE DADOS)    */}
        {/* ========================================================================= */}
        {selectedStudentForModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1050, padding: '16px'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              width: '100%', maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              {/* Header do Perfil */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={20} style={{ color: 'var(--primary)' }} />
                  <h5 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>
                    Informações do Aluno
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary rounded-circle"
                  style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setSelectedStudentForModal(null)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Conteúdo Detalhado do Aluno */}
              <div style={{ padding: '24px' }}>
                {/* Resumo Principal do Aluno */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'var(--bg)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  marginBottom: '20px'
                }}>
                  {selectedStudentForModal.foto ? (
                    <img
                      src={selectedStudentForModal.foto}
                      alt={selectedStudentForModal.nome}
                      style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.5rem'
                    }}>
                      {selectedStudentForModal.nome ? selectedStudentForModal.nome.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h5 style={{ fontWeight: 800, color: 'var(--text)', margin: '0 0 4px', fontSize: '1.125rem' }}>
                      {selectedStudentForModal.nome}
                    </h5>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                        {selectedStudentForModal.turma || currentClassData?.turma || 'Turma'}
                      </span>
                      <span className="badge" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                        {selectedStudentForModal.curso || currentClassData?.curso || 'Curso Técnico'}
                      </span>
                      {selectedStudentForModal.matricula && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                          Mat: {selectedStudentForModal.matricula}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grade de Dados Pessoais & Cadastrais */}
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <div style={{ background: 'var(--bg)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                      <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>Gênero:</span>
                      <strong style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                        {selectedStudentForModal.sexo || 'Não informado'}
                      </strong>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div style={{ background: 'var(--bg)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                      <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>Data de Nascimento / Idade:</span>
                      <strong style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                        {selectedStudentForModal.dataNascimento
                          ? `${new Date(selectedStudentForModal.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}${calculateAge(selectedStudentForModal.dataNascimento) ? ` (${calculateAge(selectedStudentForModal.dataNascimento)} anos)` : ''}`
                          : 'Não informada'}
                      </strong>
                    </div>
                  </div>

                  {selectedStudentForModal.telefone && (
                    <div className="col-sm-6">
                      <div style={{ background: 'var(--bg)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <div>
                          <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>Telefone:</span>
                          <strong style={{ color: 'var(--text)', fontSize: '0.875rem' }}>{selectedStudentForModal.telefone}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedStudentForModal.email && (
                    <div className="col-sm-6">
                      <div style={{ background: 'var(--bg)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>E-mail:</span>
                          <strong style={{ color: 'var(--text)', fontSize: '0.8125rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedStudentForModal.email}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modalidades / Esportes */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Award size={15} style={{ color: 'var(--primary)' }} /> Modalidades & Esportes Vinculados
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(selectedStudentForModal.modalidades || selectedStudentForModal.esportes || []).length > 0 ? (
                      (selectedStudentForModal.modalidades || selectedStudentForModal.esportes || []).map((mod, idx) => (
                        <span key={idx} className="badge" style={{
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <SportIcon sport={mod} size={14} />
                          <span>{mod}</span>
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                        Nenhuma modalidade esportiva vinculada além da Educação Física regular.
                      </span>
                    )}
                  </div>
                </div>

                {/* Informações de Contato do Responsável se existirem */}
                {(selectedStudentForModal.nomeResponsavel || selectedStudentForModal.telefoneResponsavel) && (
                  <div style={{
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    border: '1px solid var(--border-light)',
                    marginBottom: '20px'
                  }}>
                    <span className="text-muted d-block small fw-bold mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Responsável Legal:
                    </span>
                    <strong style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                      {selectedStudentForModal.nomeResponsavel || 'Responsável'}
                    </strong>
                    {selectedStudentForModal.telefoneResponsavel && (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block' }}>
                        Contato: {selectedStudentForModal.telefoneResponsavel}
                      </span>
                    )}
                  </div>
                )}

                {/* Ações do Modal */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '18px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      const studentId = selectedStudentForModal._id;
                      setSelectedStudentForModal(null);
                      navigate(`/alunos/${studentId}`);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}
                  >
                    <ExternalLink size={15} /> Abrir Ficha Completa
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setSelectedStudentForModal(null)}
                    style={{ padding: '8px 20px', fontSize: '0.875rem' }}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: REGISTRAR / EDITAR RELATÓRIO DE AULA                              */}
        {/* ========================================================================= */}
        {reportModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1050, padding: '16px'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              width: '100%', maxWidth: '640px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <h5 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} style={{ color: 'var(--primary)' }} />
                  <span>{editingReportId ? 'Editar Relatório de Aula' : 'Registrar Aula de Educação Física'}</span>
                </h5>
                <button
                  type="button"
                  className="btn btn-secondary rounded-circle"
                  style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setReportModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveReport} style={{ padding: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold">Data da Aula *</label>
                    <input
                      type="date"
                      value={reportForm.data}
                      onChange={(e) => setReportForm(prev => ({ ...prev, data: e.target.value }))}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold">Horário *</label>
                    <input
                      type="time"
                      value={reportForm.horario}
                      onChange={(e) => setReportForm(prev => ({ ...prev, horario: e.target.value }))}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold">Dia da Semana</label>
                    <select
                      value={reportForm.diaSemana}
                      onChange={(e) => setReportForm(prev => ({ ...prev, diaSemana: e.target.value }))}
                      style={inputStyle}
                    >
                      {DIAS_SEMANA.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold">Conteúdo Trabalhado *</label>
                    <textarea
                      rows="4"
                      placeholder="Descreva o que foi desenvolvido nesta aula (ex: Fundamentos do voleibol, circuito de agilidade, regras e dinâmicas)..."
                      value={reportForm.conteudo}
                      onChange={(e) => setReportForm(prev => ({ ...prev, conteudo: e.target.value }))}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold">Observações Pedagógicas (Opcional)</label>
                    <textarea
                      rows="2"
                      placeholder="Anotações sobre participação, adaptações ou observações para a próxima aula..."
                      value={reportForm.observacoes}
                      onChange={(e) => setReportForm(prev => ({ ...prev, observacoes: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setReportModalOpen(false)}
                    disabled={actionLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckCircle2 size={16} /> {actionLoading ? 'Salvando...' : 'Salvar Relatório'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CONFIGURAR HORÁRIOS SEMANAIS (PADRÃO 45 MIN)                       */}
        {/* ========================================================================= */}
        {scheduleModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1050, padding: '16px'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              width: '100%', maxWidth: '540px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <h5 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} style={{ color: 'var(--primary)' }} />
                  <span>Configurar Aulas Semanais (2 aulas)</span>
                </h5>
                <button
                  type="button"
                  className="btn btn-secondary rounded-circle"
                  style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setScheduleModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveSchedules} style={{ padding: '24px' }}>
                <p className="text-muted small mb-3">
                  Defina os 2 dias da semana e os respectivos horários em que a turma {currentClassData?.turma} possui aula de Educação Física (duração padrão de 45 minutos).
                </p>

                {[0, 1].map((idx) => {
                  const currentSchedule = scheduleForm[idx] || { diaSemana: 'Terça-feira', horario: '08:00', duracaoMinutos: 45 };
                  return (
                    <div key={idx} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '14px' }}>
                      <strong style={{ fontSize: '0.8125rem', color: 'var(--primary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Aula {idx + 1} da Semana
                      </strong>
                      <div className="row g-2">
                        <div className="col-7">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Dia da Semana</label>
                          <select
                            value={currentSchedule.diaSemana}
                            onChange={(e) => {
                              const updated = [...scheduleForm];
                              updated[idx] = { ...updated[idx], diaSemana: e.target.value };
                              setScheduleForm(updated);
                            }}
                            style={inputStyle}
                          >
                            {DIAS_SEMANA.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="col-5">
                          <label className="form-label text-muted small" style={{ fontSize: '0.75rem' }}>Horário</label>
                          <input
                            type="time"
                            value={currentSchedule.horario}
                            onChange={(e) => {
                              const updated = [...scheduleForm];
                              updated[idx] = { ...updated[idx], horario: e.target.value };
                              setScheduleForm(updated);
                            }}
                            style={inputStyle}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setScheduleModalOpen(false)}
                    disabled={actionLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckCircle2 size={16} /> {actionLoading ? 'Salvando...' : 'Salvar Horários'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO DE RELATÓRIO                              */}
        {/* ========================================================================= */}
        {deleteModalOpen && reportToDelete && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1050, padding: '16px'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              width: '100%', maxWidth: '440px',
              padding: '24px', textAlign: 'center'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'var(--error-light)', color: 'var(--error)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 size={24} />
              </div>

              <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                Excluir Relatório de Aula?
              </h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
                Deseja realmente excluir o relatório da aula de{' '}
                <strong>{new Date(reportToDelete.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong>?
                Esta ação não poderá ser desfeita.
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setDeleteModalOpen(false); setReportToDelete(null); }}
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDeleteReport}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Excluindo...' : 'Sim, Excluir Relatório'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
