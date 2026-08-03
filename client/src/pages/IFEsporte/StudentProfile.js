import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ModalidadesSelector from '../../components/ModalidadesSelector';

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

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStudent(data);

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

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
            color: mensagem.includes('✅') ? '#065F46' : '#991B1B',
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
          {/* Lado Esquerdo - Info Resumo */}
          <div className="col-lg-4">
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '32px',
              textAlign: 'center',
              height: '100%'
            }}>
              
              <div style={{ display: 'inline-block', position: 'relative', marginBottom: '24px' }}>
                <div style={{
                  width: '140px', height: '140px', borderRadius: '50%',
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', fontWeight: 700, margin: '0 auto', overflow: 'hidden',
                  border: '4px solid var(--bg)'
                }}>
                  {student.foto ? (
                    <img src={student.foto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    student.nome.charAt(0).toUpperCase()
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
                     fontWeight: 600
                   }}>{m}</span>
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
                      
                      <div className="col-md-12">
                        <label className="form-label text-muted small fw-bold">Endereço</label>
                        <input type="text" name="endereco" value={student.endereco || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Rua, Bairro, Nº" style={fieldStyle} />
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
                      <div className="col-12 mt-4"><h6 style={{ fontWeight: 700, color: 'var(--primary)', margin: 0, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Antropometria e Esporte</h6></div>

                      <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">Peso (kg)</label>
                        <input type="number" step="0.1" name="peso" value={student.peso || ''} onChange={handleInputChange} disabled={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">Altura (m)</label>
                        <input type="number" step="0.01" name="altura" value={student.altura || ''} onChange={handleInputChange} disabled={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">Nº Camisa (Opcional)</label>
                        <input type="text" name="numeroCamisa" value={student.numeroCamisa || ''} onChange={handleInputChange} disabled={!isEditing} style={fieldStyle} />
                      </div>
                      
                      <div className="col-12">
                        <label className="form-label text-muted small fw-bold mb-2">Modalidades Inscritas</label>
                        <div style={isEditing ? {} : { pointerEvents: 'none', opacity: 0.85 }}>
                          <ModalidadesSelector 
                            selected={student.modalidades || student.esportes || []}
                            onChange={(novos) => setStudent({...student, modalidades: novos})}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
                       <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1rem' }}>
                         {showModalidadePicker ? 'Escolha a modalidade' : 'Análises Realizadas'}
                       </h5>
                       
                       <div style={{ display: 'flex', gap: '8px' }}>
                         {showModalidadePicker ? (
                           <button className="btn btn-secondary" onClick={() => setShowModalidadePicker(false)} style={{ padding: '6px 16px', fontSize: '0.8125rem' }}>
                             Cancelar
                           </button>
                         ) : (
                           userType !== 'estudante' && (
                             <button className="btn btn-primary" onClick={() => setShowModalidadePicker(true)} style={{ padding: '6px 16px', fontSize: '0.8125rem' }}>
                               <i className="bi bi-plus-lg me-1"></i> Nova Análise
                             </button>
                           )
                         )}
                       </div>
                    </div>

                    {showModalidadePicker ? (
                      <div style={{ padding: '8px 0' }}>
                        {student.modalidades && student.modalidades.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                            {student.modalidades.map(mod => (
                              <button 
                                key={mod} 
                                className="btn btn-outline-primary"
                                style={{
                                  padding: '24px',
                                  borderRadius: 'var(--radius-lg)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '12px',
                                  height: '120px',
                                  justifyContent: 'center'
                                }}
                                onClick={() => navigate(`/analises?alunoId=${id}&novaAnalise=true&modalidade=${encodeURIComponent(mod)}`)}
                              >
                                <i className="bi bi-activity" style={{ fontSize: '1.5rem' }}></i>
                                <span>{mod}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                            <i className="bi bi-exclamation-circle" style={{ fontSize: '2rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '12px' }}></i>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Este atleta não possui modalidades cadastradas no perfil.</p>
                            <button className="btn btn-primary" onClick={() => { setActiveTab('perfil'); setShowModalidadePicker(false); setIsEditing(true); }} style={{ marginTop: '12px' }}>
                              Adicionar Modalidade
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
                                  <i className="bi bi-bookmark-fill" style={{ color: 'var(--primary)' }}></i>
                                  <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>{mod}</h6>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                                  {groupedAnalyses[mod].map(analise => (
                                    <div key={analise._id} style={{
                                      background: 'var(--bg)',
                                      borderRadius: 'var(--radius-md)',
                                      padding: '16px',
                                      border: '1px solid var(--border)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'space-between',
                                      minHeight: '150px'
                                    }}>
                                      <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                          <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.6875rem', fontWeight: 600 }}>
                                            {analise.tipo}
                                          </span>
                                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                                            <i className="bi bi-calendar3 me-1"></i>
                                            {new Date(analise.dataAvaliacao || analise.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                          </span>
                                        </div>
                                        <h6 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.875rem', margin: '0 0 6px' }}>
                                          {analise.subtipo ? `Análise de ${analise.subtipo}` : 'Análise Geral'}
                                        </h6>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '16px' }}>
                                          Treinador: {analise.treinador ? analise.treinador.nome : 'Não informado'}
                                        </span>
                                      </div>
                                      <button className="btn btn-secondary btn-sm" style={{ width: '100%', borderRadius: 'var(--radius-sm)' }} onClick={() => navigate(`/analises/${analise._id}`)}>
                                        Visualizar
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{
                            textAlign: 'center', padding: '48px 16px',
                            background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                            border: '1.5px dashed var(--border)'
                          }}>
                            <i className="bi bi-clipboard-x" style={{ fontSize: '2rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '12px' }}></i>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Este atleta ainda não possui análises registradas.</p>
                          </div>
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
