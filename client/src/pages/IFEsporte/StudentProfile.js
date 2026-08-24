import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ModalidadesSelector from '../../components/ModalidadesSelector';
import SportIcon from '../../components/SportIcon';
import IMCCard from '../../components/IMCCard';
import { isCollectiveSport } from './components/ContextoSelector';
import { isSportAnalysisSupported } from '../../utils/sportAnalysisRules';
import { addNotification } from '../../utils/notifications';
import { renderDiagnosticCard } from './Analises';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userType = localStorage.getItem('tipo'); 
  
  const [student, setStudent] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [activeTab, setActiveTab] = useState('perfil'); // perfil, estatisticas
  const [showModalidadePicker, setShowModalidadePicker] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudent(data);
      }
      try {
        const analisesRes = await fetch('/api/analysis', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (analisesRes.ok) {
          const analisesData = await analisesRes.json();
          setAnalyses(analisesData.filter(a => a.aluno && a.aluno._id === id));
        }
      } catch (err) {
        console.error('Erro ao buscar análises:', err);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta análise?')) return;
    try {
      const res = await fetch(`/api/analysis/${analysisId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        addNotification('Análise Excluída', 'Uma avaliação técnica foi removida do sistema.');
        setAnalyses(prev => prev.filter(a => a._id !== analysisId));
        setSelectedAnalysis(null);
      }
    } catch (e) {
      console.error('Erro ao excluir:', e);
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'cpf') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    if (name === 'rg') {
      value = value.replace(/[^a-zA-Z0-9]/g, '');
      if (value.length > 9) value = value.slice(0, 9);
      if (value.length > 8) {
        value = value.replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9]{3})([a-zA-Z0-9]{3})([a-zA-Z0-9]{1})$/, '$1.$2.$3-$4');
      } else if (value.length > 5) {
        value = value.replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9]{3})([a-zA-Z0-9]{1,3})$/, '$1.$2.$3');
      } else if (value.length > 2) {
        value = value.replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9]{1,3})$/, '$1.$2');
      }
    }
    
    if (name === 'telefone' || name === 'telefoneResponsavel') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }

    setStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const payload = { ...student, esportes: student.modalidades };

      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setMensagem('✅ Perfil atualizado com sucesso!');
        setIsEditing(false);
        fetchStudent();
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem('Erro ao atualizar aluno.');
      }
    } catch (error) {
      setMensagem('Erro de conexão ao servidor.');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Foto = reader.result;
      try {
        const response = await fetch(`/api/students/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ ...student, foto: base64Foto })
        });
        if (response.ok) {
          const updated = await response.json();
          setStudent(prev => ({ ...prev, foto: updated.foto || base64Foto }));
          setMensagem('✅ Foto do atleta atualizada com sucesso!');
          setTimeout(() => setMensagem(''), 3000);
        } else {
          setMensagem('Erro ao salvar foto do atleta.');
        }
      } catch (err) {
        setMensagem('Erro de conexão ao salvar foto.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoDelete = async () => {
    if (!window.confirm('Deseja realmente remover a foto do atleta?')) return;
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...student, foto: '' })
      });
      if (response.ok) {
        setStudent(prev => ({ ...prev, foto: '' }));
        setMensagem('✅ Foto removida com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem('Erro ao remover foto.');
      }
    } catch (err) {
      setMensagem('Erro de conexão ao remover foto.');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const groupedAnalyses = React.useMemo(() => {
    if (!analyses || analyses.length === 0) return {};
    const grouped = {};
    analyses.forEach(a => {
      if (!isSportAnalysisSupported(a.modalidade)) return;
      const mod = a.modalidade || 'Outros';
      if (!grouped[mod]) grouped[mod] = [];
      grouped[mod].push(a);
    });
    Object.keys(grouped).forEach(mod => {
      grouped[mod].sort((a, b) => new Date(b.dataAvaliacao || b.data) - new Date(a.dataAvaliacao || a.data));
    });
    return grouped;
  }, [analyses]);
  const hasAnalyses = Object.keys(groupedAnalyses).length > 0;

  const supportedModalidades = React.useMemo(() => {
    const mods = student?.modalidades || student?.esportes || [];
    return mods.filter(mod => isSportAnalysisSupported(mod));
  }, [student]);

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o atleta ${student.nome}?`)) return;
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) window.location.href = '/alunos';
      else alert('Erro ao excluir aluno');
    } catch (error) {
      alert('Erro de conexão ao excluir');
    }
  };

  if (loading) return <Layout><div className="text-center py-5"><div className="spinner-border text-primary"></div></div></Layout>;
  if (!student) return <Layout><div className="text-center py-5">Aluno não encontrado.</div></Layout>;

  const fieldStyle = isEditing ? {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font)',
    outline: 'none',
    transition: 'all var(--transition-fast)',
    background: 'var(--bg)',
    minHeight: '44px'
  } : {
    width: '100%',
    padding: '10px 0',
    border: 'none',
    borderBottom: '1px dashed var(--border)',
    borderRadius: 0,
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: 'var(--text)',
    background: 'transparent',
    minHeight: 'auto',
    pointerEvents: 'none'
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }} className="d-none-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn btn-secondary rounded-circle" style={{ width: '42px', height: '42px', padding: 0 }} onClick={() => navigate('/alunos')}>
              <i className="bi bi-arrow-left" style={{ fontSize: '1rem' }}></i>
            </button>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>Informações do Atleta</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline-secondary" onClick={() => window.print()}>
              <i className="bi bi-printer-fill me-2"></i>Exportar Ficha (PDF)
            </button>
            {userType !== 'estudante' && (
              <button className="btn btn-outline-danger" onClick={handleDelete}>
                Excluir Atleta
              </button>
            )}
          </div>
        </div>

        {mensagem && (
          <div style={{
            background: mensagem.includes('✅') ? 'var(--success-light)' : 'var(--error-light)',
            color: mensagem.includes('✅') ? 'var(--success-text)' : 'var(--error-text)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <i className={`bi ${mensagem.includes('✅') ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>{mensagem}
          </div>
        )}

        <div className="row g-4">
          {/* Lado Esquerdo - Info Resumo & Gestão da Foto */}
          <div className="col-lg-4" style={{ alignSelf: 'flex-start' }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '28px 24px',
              textAlign: 'center'
            }}>
              
              {/* Foto / Avatar com Gerenciamento */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '16px' }}>
                  <div style={{
                    width: '140px', height: '140px', borderRadius: '50%',
                    background: 'var(--primary)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3.25rem', fontWeight: 700, overflow: 'hidden',
                    border: '4px solid var(--bg-card)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {student.foto ? (
                      <img src={student.foto} alt="Foto do Atleta" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      student.nome ? student.nome.charAt(0).toUpperCase() : 'A'
                    )}
                  </div>
                </div>

                {/* Ações de Foto (Adicionar / Alterar / Excluir) */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <input 
                    type="file" 
                    id="atletaFotoInput" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handlePhotoUpload} 
                  />
                  
                  {!student.foto ? (
                    <label htmlFor="atletaFotoInput" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                      <i className="bi bi-camera-fill"></i> Adicionar Foto
                    </label>
                  ) : (
                    <>
                      <label htmlFor="atletaFotoInput" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                        <i className="bi bi-pencil-fill"></i> Alterar Foto
                      </label>
                      <button 
                        type="button" 
                        onClick={handlePhotoDelete} 
                        className="btn btn-outline-danger" 
                        style={{ padding: '6px 12px', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <i className="bi bi-trash-fill"></i> Excluir Foto
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px', fontSize: '1.25rem' }}>{student.nome}</h4>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '24px' }}>
                {student.turma || student.serie || 'S/ Turma'} {student.matricula ? `• ${student.matricula}` : ''}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '28px' }}>
                 {student.modalidades && student.modalidades.map((m, i) => (
                   <span key={i} style={{
                     background: 'var(--primary-light)',
                     color: 'var(--primary)',
                     padding: '4px 12px',
                     borderRadius: 'var(--radius-full)',
                     fontSize: '0.75rem',
                     fontWeight: 600,
                     display: 'inline-flex',
                     alignItems: 'center',
                     gap: '4px'
                   }}>
                     <SportIcon sport={m} size={14} />
                     <span>{m}</span>
                   </span>
                 ))}
              </div>

              {(student.email || student.cpf) && (
                <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'left', marginBottom: '16px' }}>
                  {student.email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}><i className="bi bi-envelope-fill" style={{ color: 'var(--primary)' }}></i> <strong>{student.email}</strong></div>}
                  {student.cpf && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}><i className="bi bi-person-vcard-fill" style={{ color: 'var(--success)' }}></i> <strong>{student.cpf}</strong></div>}
                </div>
              )}

              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'left' }}>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '12px', fontSize: '0.8125rem' }}>Contato de Emergência</h6>
                {student.nomeResponsavel || student.telefoneResponsavel ? (
                  <>
                    {student.nomeResponsavel && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '6px' }}><i className="bi bi-person-fill me-2"></i> {student.nomeResponsavel}</div>}
                    {student.telefoneResponsavel && <div style={{ fontSize: '0.8125rem', color: 'var(--error)', fontWeight: 600 }}><i className="bi bi-telephone-plus-fill me-2"></i> {student.telefoneResponsavel}</div>}
                  </>
                ) : (
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontStyle: 'italic' }}>Nenhum contato de emergência.</div>
                )}
              </div>
            </div>
          </div>

          {/* Lado Direito - Tabs Content */}
          <div className="col-lg-8">
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
              height: '100%'
            }}>
              
              {/* Tabs Navigation */}
              <div style={{
                background: 'var(--bg)',
                padding: '16px 24px 0',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                gap: '8px'
              }} className="d-none-print">
                <button 
                  onClick={() => setActiveTab('perfil')}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                    border: 'none',
                    borderBottom: activeTab === 'perfil' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                    background: activeTab === 'perfil' ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === 'perfil' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="bi bi-person-lines-fill"></i> Perfil
                </button>
                <button 
                  onClick={() => setActiveTab('estatisticas')}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                    border: 'none',
                    borderBottom: activeTab === 'estatisticas' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                    background: activeTab === 'estatisticas' ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === 'estatisticas' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="bi bi-graph-up-arrow"></i> Análises
                </button>
              </div>

              <div style={{ padding: '32px' }}>
                
                {/* TAB 1: PERFIL */}
                {activeTab === 'perfil' && (
                  <form onSubmit={handleSave}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
                       <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1rem' }}>Ficha Completa do Atleta</h5>
                       {userType !== 'estudante' && !isEditing && (
                         <button type="button" className="btn btn-outline-primary" onClick={() => setIsEditing(true)} style={{ padding: '6px 16px', fontSize: '0.8125rem' }}>
                           <i className="bi bi-pencil-fill me-2"></i>Editar Dados
                         </button>
                       )}
                    </div>

                    <div className="row g-4">
                      {/* Section: Academic */}
                      <div className="col-12"><h6 style={{ fontWeight: 700, color: 'var(--primary)', margin: 0, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dados Escolares e Pessoais</h6></div>
                      
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Nome Completo</label>
                        <input type="text" name="nome" value={student.nome || ''} onChange={handleInputChange} disabled={!isEditing} style={fieldStyle} required />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">Matrícula</label>
                        <input type="text" name="matricula" value={student.matricula || ''} onChange={handleInputChange} disabled={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">Turma</label>
                        {isEditing ? (
                          <select className="form-select" name="turma" value={student.turma || student.serie || ''} onChange={handleInputChange} style={fieldStyle}>
                            <option value="">Selecione...</option>
                            {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : (
                          <input type="text" value={student.turma || student.serie || '-'} readOnly style={fieldStyle} />
                        )}
                      </div>

                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">Data de Nasc.</label>
                        <input type="date" name="dataNascimento" value={student.dataNascimento ? student.dataNascimento.split('T')[0] : ''} onChange={handleInputChange} disabled={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">Idade</label>
                        <input type="text" value={`${calculateAge(student.dataNascimento)} anos`} disabled style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">Gênero</label>
                        {isEditing ? (
                          <select className="form-select" name="sexo" value={student.sexo || ''} onChange={handleInputChange} style={fieldStyle} required>
                            <option value="Feminino">Feminino</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Outro">Outro</option>
                          </select>
                        ) : (
                          <input type="text" value={student.sexo || '-'} readOnly style={fieldStyle} />
                        )}
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">CPF</label>
                        <input type="text" name="cpf" value={student.cpf || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="000.000.000-00" style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">RG</label>
                        <input type="text" name="rg" value={student.rg || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="00.000.000-0" style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">Telefone</label>
                        <input type="text" name="telefone" value={student.telefone || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="(00) 00000-0000" style={fieldStyle} />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Logradouro</label>
                        <input type="text" name="endereco" value={student.endereco || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Rua, Bairro, Nº" style={fieldStyle} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">Cidade</label>
                        <input type="text" name="cidade" value={student.cidade || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Cidade" style={fieldStyle} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label text-muted small fw-bold">Estado</label>
                        <input type="text" name="estado" value={student.estado || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="UF" maxLength="2" style={{ ...fieldStyle, textTransform: 'uppercase' }} />
                      </div>

                      {/* Section: Guardian */}
                      <div className="col-12 mt-4"><h6 style={{ fontWeight: 700, color: 'var(--primary)', margin: 0, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dados do Responsável</h6></div>
                      
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Nome do Responsável</label>
                        <input type="text" name="nomeResponsavel" value={student.nomeResponsavel || ''} onChange={handleInputChange} disabled={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Telefone do Responsável</label>
                        <input type="text" name="telefoneResponsavel" value={student.telefoneResponsavel || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="(00) 00000-0000" style={fieldStyle} />
                      </div>

                      {/* Section: Antropometria */}
                      <div className="col-12 mt-4"><h6 style={{ fontWeight: 700, color: 'var(--primary)', margin: 0, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Antropometria</h6></div>

                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Peso (kg)</label>
                        <input type="number" step="0.1" name="peso" value={student.peso || ''} onChange={handleInputChange} disabled={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Altura (m)</label>
                        <input type="number" step="0.01" name="altura" value={student.altura || ''} onChange={handleInputChange} disabled={!isEditing} style={fieldStyle} />
                      </div>

                      <div className="col-12">
                        <IMCCard peso={student?.peso} altura={student?.altura} />
                      </div>

                      {/* Section: Dados Esportivos */}
                      <div className="col-12 mt-4"><h6 style={{ fontWeight: 700, color: 'var(--primary)', margin: 0, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dados Esportivos</h6></div>

                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">Nº Camiseta</label>
                        <input type="number" name="numeroCamisa" value={student.numeroCamisa || ''} onChange={handleInputChange} disabled={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">Nº Calçado</label>
                        <input type="number" name="numeroCalcado" value={student.numeroCalcado || ''} onChange={handleInputChange} disabled={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">Tam. Camisa</label>
                        {isEditing ? (
                          <select className="form-select" name="tamanhoCamisa" value={student.tamanhoCamisa || ''} onChange={handleInputChange} style={fieldStyle}>
                            <option value="">Selecione...</option>
                            <option value="P">P</option>
                            <option value="M">M</option>
                            <option value="G">G</option>
                            <option value="GG">GG</option>
                          </select>
                        ) : (
                          <input type="text" value={student.tamanhoCamisa || '-'} readOnly style={fieldStyle} />
                        )}
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">Tam. Calção</label>
                        {isEditing ? (
                          <select className="form-select" name="tamanhoCalcao" value={student.tamanhoCalcao || ''} onChange={handleInputChange} style={fieldStyle}>
                            <option value="">Selecione...</option>
                            <option value="P">P</option>
                            <option value="M">M</option>
                            <option value="G">G</option>
                            <option value="GG">GG</option>
                          </select>
                        ) : (
                          <input type="text" value={student.tamanhoCalcao || '-'} readOnly style={fieldStyle} />
                        )}
                      </div>
                      
                      <div className="col-12">
                        <label className="form-label text-muted small fw-bold mb-2">Modalidades Inscritas</label>
                        <div style={isEditing ? {} : { pointerEvents: 'none', opacity: 0.85 }}>
                          <ModalidadesSelector 
                            selected={student.modalidades || student.esportes || []}
                            onChange={(novos) => setStudent({...student, modalidades: novos})}
                            gender={student.sexo}
                          />
                        </div>
                      </div>

                      {/* Section: Medical */}
                      <div className="col-12 mt-4"><h6 style={{ fontWeight: 700, color: 'var(--error)', margin: 0, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Histórico Médico</h6></div>

                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Alergias</label>
                        {isEditing ? (
                          <textarea name="alergias" rows="2" value={student.alergias || ''} onChange={handleInputChange} placeholder="Nenhuma declarada..." style={fieldStyle}></textarea>
                        ) : (
                          <div style={{ ...fieldStyle, minHeight: '38px', whiteSpace: 'pre-wrap' }}>{student.alergias || '-'}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Lesões Anteriores</label>
                        {isEditing ? (
                          <textarea name="lesoesAnteriores" rows="2" value={student.lesoesAnteriores || ''} onChange={handleInputChange} placeholder="Nenhuma declarada..." style={fieldStyle}></textarea>
                        ) : (
                          <div style={{ ...fieldStyle, minHeight: '38px', whiteSpace: 'pre-wrap' }}>{student.lesoesAnteriores || '-'}</div>
                        )}
                      </div>
                      <div className="col-md-12">
                        <label className="form-label text-muted small fw-bold">Observações Médicas / Restrições</label>
                        {isEditing ? (
                          <textarea name="observacoesMedicas" rows="2" value={student.observacoesMedicas || ''} onChange={handleInputChange} placeholder="Vazio..." style={fieldStyle}></textarea>
                        ) : (
                          <div style={{ ...fieldStyle, minHeight: '38px', whiteSpace: 'pre-wrap' }}>{student.observacoesMedicas || '-'}</div>
                        )}
                      </div>

                      {isEditing && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', width: '100%', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                          <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); fetchStudent(); }}>Cancelar</button>
                          <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                        </div>
                      )}
                    </div>
                  </form>
                )}

                {/* TAB 2: ANÁLISES */}
                {activeTab === 'estatisticas' && (
                  <div>
                    {/* VISUALIZAÇÃO COMPLETA DA ANÁLISE SELECIONADA */}
                    {selectedAnalysis ? (
                      <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                          <button 
                            className="btn btn-outline-secondary btn-sm" 
                            onClick={() => setSelectedAnalysis(null)} 
                            style={{ padding: '6px 14px', fontSize: '0.8125rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <i className="bi bi-arrow-left"></i> Voltar para Análises
                          </button>

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                              className="btn btn-outline-primary btn-sm" 
                              onClick={() => navigate(`/analises?editId=${selectedAnalysis._id}`)}
                              style={{ padding: '6px 14px', fontSize: '0.8125rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <i className="bi bi-pencil"></i> Editar
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm" 
                              onClick={() => handleDeleteAnalysis(selectedAnalysis._id)}
                              style={{ padding: '6px 14px', fontSize: '0.8125rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <i className="bi bi-trash"></i> Excluir
                            </button>
                            
                            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.8125rem', padding: '6px 12px' }}>
                              Data: {new Date(selectedAnalysis.dataAvaliacao || selectedAnalysis.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                            </span>
                          </div>
                        </div>

                        {/* Cabeçalho da Análise */}
                        <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            <div style={{
                              width: '52px', height: '52px', borderRadius: 'var(--radius-md)',
                              background: 'var(--primary-light)', color: 'var(--primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <SportIcon sport={selectedAnalysis.modalidade} size={28} />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <h4 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 4px', fontSize: '1.25rem' }}>
                                {selectedAnalysis.modalidade}
                              </h4>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600 }}>
                                  <i className="bi bi-geo-alt-fill me-1"></i> Contexto: {selectedAnalysis.contexto || (isCollectiveSport(selectedAnalysis.modalidade) ? 'Jogo' : 'Treino')}
                                </span>
                                {selectedAnalysis.subtipo && (
                                  <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600 }}>
                                    {selectedAnalysis.subtipo}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Índice Geral</div>
                              <span className="badge" style={{ background: 'var(--primary)', color: '#fff', fontSize: '1.125rem', padding: '6px 16px', fontWeight: 700 }}>
                                <i className="bi bi-star-fill me-1"></i> {selectedAnalysis.resultados?.indiceGeral || '5.0'}
                              </span>
                            </div>
                          </div>

                          <div className="row g-3 pt-3 border-top" style={{ fontSize: '0.875rem' }}>
                            <div className="col-md-6">
                              <span style={{ color: 'var(--text-tertiary)' }}>Atleta: </span>
                              <strong style={{ color: 'var(--text)' }}>{student.nome}</strong> ({student.sexo || 'Gênero n/i'})
                            </div>
                            <div className="col-md-6">
                              <span style={{ color: 'var(--text-tertiary)' }}>Categoria / Turma: </span>
                              <strong style={{ color: 'var(--text)' }}>{student.turma || student.serie || 'Principal'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Diagnóstico Inteligente */}
                        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                          <h6 style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '14px', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="bi bi-robot" style={{ fontSize: '1.25rem' }}></i> Diagnóstico Inteligente Gerado
                          </h6>
                          {renderDiagnosticCard(selectedAnalysis.diagnostico)}
                        </div>

                        {/* Notas Detalhadas por Critério */}
                        <div className="mb-4">
                          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border-light)' }}>
                            <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '16px', fontSize: '0.9375rem' }}>Notas dos Critérios Avaliados</h6>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                              {selectedAnalysis.respostas && Object.entries(selectedAnalysis.respostas).map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                  </span>
                                  <span className="badge" style={{ background: Number(val) >= 4 ? 'var(--success)' : Number(val) >= 3 ? 'var(--primary)' : 'var(--warning)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, minWidth: '40px', padding: '6px 12px' }}>
                                    {val} / 5
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Observações Adicionais */}
                        {selectedAnalysis.observacoes && (
                          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '18px 20px', border: '1px solid var(--border-light)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '4px' }}><i className="bi bi-chat-quote-fill me-2" style={{ color: 'var(--primary)' }}></i>Observações do Treinador:</strong>
                            {selectedAnalysis.observacoes}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
                           <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.0625rem' }}>
                             {showModalidadePicker ? 'Selecione o esporte do atleta para criar a análise' : 'Análises Realizadas'}
                           </h5>
                           
                           <div style={{ display: 'flex', gap: '8px' }}>
                             {showModalidadePicker ? (
                               <button className="btn btn-secondary" onClick={() => setShowModalidadePicker(false)} style={{ padding: '8px 18px', fontSize: '0.875rem' }}>
                                 Cancelar
                               </button>
                             ) : (
                               userType !== 'estudante' && (
                                 <button className="btn btn-primary" onClick={() => setShowModalidadePicker(true)} style={{ padding: '8px 20px', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                   <i className="bi bi-plus-circle-fill"></i> Criar Análise
                                 </button>
                               )
                             )}
                           </div>
                        </div>

                        {showModalidadePicker ? (
                          <div style={{ padding: '12px 0' }}>
                            {supportedModalidades.length > 0 ? (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                                {supportedModalidades.map(mod => {
                                  const parts = mod.split('-').map(p => p.trim());
                                  let baseMod = parts[0];
                                  
                                  // Map display name to route ID
                                  const routeMap = {
                                    'Atletismo': 'atletismo',
                                    'Badminton': 'badminton',
                                    'Tênis de Mesa': 'tenis-de-mesa',
                                    'Xadrez': 'xadrez',
                                    'Basquete': 'basquete',
                                    'Futsal': 'futsal',
                                    'Futebol': 'futebol',
                                    'Handebol': 'handebol',
                                    'Voleibol': 'voleibol',
                                    'Vôlei de Praia': 'volei-praia'
                                  };
                                  const sportRouteId = routeMap[baseMod] || baseMod.toLowerCase().replace(/\s+/g, '-');
                                  const studentGender = student.sexo || 'Feminino';
                                  
                                  // Build navigation URL to SportDetail with Analyses tab
                                  let targetUrl = `/esportes/${sportRouteId}?genero=${encodeURIComponent(studentGender)}&tab=analises`;
                                  
                                  // For hierarchical sports (e.g. "Atletismo - Corridas - 200m"), add cat/sub params
                                  if (parts.length >= 2) {
                                    targetUrl += `&cat=${encodeURIComponent(parts[1])}`;
                                    if (parts.length >= 3) {
                                      targetUrl += `&sub=${encodeURIComponent(parts[2])}`;
                                    }
                                  }
                                  
                                  return (
                                    <button 
                                      key={mod} 
                                      className="btn btn-outline-primary hover-lift"
                                      style={{
                                        padding: '24px 16px',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px',
                                        minHeight: '130px',
                                        justifyContent: 'center',
                                        textAlign: 'center'
                                      }}
                                      onClick={() => navigate(targetUrl)}
                                    >
                                      <SportIcon sport={baseMod} size={28} />
                                      <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{mod}</div>
                                        <small style={{ opacity: 0.7, fontSize: '0.75rem' }}>Criar avaliação de {student.nome.split(' ')[0]}</small>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', padding: '40px 16px', background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1.5px dashed var(--border)' }}>
                                <i className="bi bi-info-circle" style={{ fontSize: '2rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '12px' }}></i>
                                <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '8px' }}>
                                  {student.modalidades && student.modalidades.length > 0 
                                    ? 'Nenhuma das modalidades deste atleta possui avaliações por análise.' 
                                    : 'Este atleta ainda não possui modalidades cadastradas.'}
                                </p>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginBottom: '16px' }}>
                                  {student.modalidades && student.modalidades.length > 0
                                    ? 'As modalidades deste atleta (como Xadrez, Tênis de Mesa ou Vôlei de Praia) não utilizam o sistema de análises técnicas.'
                                    : 'Vincule esportes no perfil do aluno para iniciar a criação de análises.'}
                                </p>
                                <button className="btn btn-primary" onClick={() => { setActiveTab('perfil'); setShowModalidadePicker(false); setIsEditing(true); }}>
                                  <i className="bi bi-pencil-fill me-2"></i> Editar Perfil e Gerenciar Modalidades
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {hasAnalyses ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                {Object.keys(groupedAnalyses).map(mod => (
                                  <div key={mod}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                                      <SportIcon sport={mod} size={18} />
                                      <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>{mod}</h6>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                                      {groupedAnalyses[mod].map(analise => (
                                        <div 
                                          key={analise._id} 
                                          className="card-flat hover-lift"
                                          style={{
                                            background: 'var(--bg)',
                                            borderRadius: 'var(--radius-lg)',
                                            padding: '18px',
                                            border: '1.5px solid var(--border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            minHeight: '160px',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-base)'
                                          }}
                                          onClick={() => setSelectedAnalysis(analise)}
                                          title="Clique para abrir a análise completa"
                                        >
                                          <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                              <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {analise.contexto || (isCollectiveSport(analise.modalidade) ? 'Jogo' : 'Treino')}
                                              </span>
                                              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                                                <i className="bi bi-calendar3 me-1"></i>
                                                {new Date(analise.dataAvaliacao || analise.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                              </span>
                                            </div>
                                            <h6 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9375rem', margin: '0 0 12px' }}>
                                              {analise.subtipo ? `${analise.subtipo}` : 'Análise Geral'}
                                            </h6>
                                          </div>

                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                                            <span className="badge" style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                                              ★ {analise.resultados?.indiceGeral || '5.0'}
                                            </span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                              <button 
                                                className="btn btn-outline-secondary btn-sm" 
                                                onClick={() => setSelectedAnalysis(analise)}
                                                style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                                                title="Ver detalhes"
                                              >
                                                <i className="bi bi-eye me-1"></i> Detalhes
                                              </button>
                                              <button 
                                                className="btn btn-outline-primary btn-sm" 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/analises?editId=${analise._id}`); }}
                                                style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                                                title="Editar Análise"
                                              >
                                                <i className="bi bi-pencil me-1"></i> Editar
                                              </button>
                                              <button 
                                                className="btn btn-outline-danger btn-sm" 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteAnalysis(analise._id); }}
                                                style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                                                title="Excluir Análise"
                                              >
                                                <i className="bi bi-trash me-1"></i> Excluir
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{
                                textAlign: 'center', padding: '48px 16px',
                                background: 'var(--bg)', borderRadius: 'var(--radius-lg)',
                                border: '1.5px dashed var(--border)'
                              }}>
                                <i className="bi bi-clipboard-x" style={{ fontSize: '2.25rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '12px' }}></i>
                                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                                  {supportedModalidades.length === 0
                                    ? 'Nenhuma das modalidades deste atleta possui avaliações por análise.'
                                    : 'Nenhuma análise registrada'}
                                </h6>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
                                  {supportedModalidades.length === 0
                                    ? 'As modalidades deste atleta (como Xadrez, Tênis de Mesa ou Vôlei de Praia) não utilizam o sistema de análises técnicas.'
                                    : 'Ainda não foram realizadas avaliações técnicas para este atleta.'}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentProfile;
