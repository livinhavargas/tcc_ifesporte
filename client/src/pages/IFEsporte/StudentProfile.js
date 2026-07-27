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
  const [activeTab, setActiveTab] = useState('perfil'); // perfil, estatisticas, anotacoes
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
      // Sincroniza esportes/modalidades
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

  const isMinor = (dob) => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
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

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button className="btn btn-light rounded-circle shadow-sm me-4 d-flex align-items-center justify-content-center text-muted hover-bg-light" style={{width:'45px', height:'45px'}} onClick={() => navigate('/alunos')}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
            <h2 className="fw-bold text-blue-dark mb-0">Informações do Atleta</h2>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary shadow-sm fw-bold rounded-pill px-4" onClick={() => window.print()}>
            <i className="bi bi-printer-fill me-2"></i>Exportar Ficha (PDF)
          </button>
          {userType !== 'estudante' && (
            <button className="btn btn-outline-danger shadow-sm fw-bold rounded-pill px-4" onClick={handleDelete}>
              Excluir Atleta
            </button>
          )}
        </div>
      </div>

      {mensagem && <div className={`alert ${mensagem.includes('✅') ? 'alert-success' : 'alert-danger'} fw-bold rounded-3 shadow-sm`}>{mensagem}</div>}

      <div className="row g-4">
        {/* Lado Esquerdo - Info Resumo */}
        <div className="col-lg-4">
          <div className="card-flat p-4 text-center h-100 shadow-sm border-0 position-relative" style={{ borderTop: `5px solid #3b82f6` }}>
            
            <div className="d-inline-block position-relative mb-4 mt-4">
              <div className="d-flex align-items-center justify-content-center bg-blue-dark text-white rounded-circle shadow-sm mb-2" style={{ width: '150px', height: '150px', fontSize: '3rem', margin: '0 auto', overflow: 'hidden' }}>
                {student.foto ? (
                  <img src={student.foto} alt="Perfil" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  student.nome.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            
            <h4 className="fw-bold text-blue-dark mb-1">{student.nome}</h4>
            <p className="text-muted mb-4">{student.turma || student.serie || 'S/ Turma'} {student.matricula ? `• ${student.matricula}` : ''}</p>

            <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
               {student.modalidades && student.modalidades.map((m, i) => <span key={i} className="badge bg-orange-light text-orange border border-orange px-2 py-1">{m}</span>)}
            </div>

            {(student.email || student.cpf) && (
              <div className="bg-light rounded-4 p-4 text-start mb-3 border">
                {student.email && <div className="mb-2"><i className="bi bi-envelope-fill me-2 text-primary"></i> <strong>{student.email}</strong></div>}
                {student.cpf && <div><i className="bi bi-person-vcard-fill me-2 text-success"></i> <strong>{student.cpf}</strong></div>}
              </div>
            )}

            <div className="bg-light rounded-4 p-4 text-start border">
              <h6 className="fw-bold text-blue-dark mb-2">Contato de Emergência</h6>
              {student.nomeResponsavel || student.telefoneResponsavel ? (
                <>
                  {student.nomeResponsavel && <div className="text-secondary mb-1"><i className="bi bi-person-fill me-2"></i> {student.nomeResponsavel}</div>}
                  {student.telefoneResponsavel && <div className="text-danger fw-bold"><i className="bi bi-telephone-plus-fill me-2"></i> {student.telefoneResponsavel}</div>}
                </>
              ) : (
                <div className="text-muted small">Nenhum contato de emergência cadastrado.</div>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito - Tabs Content */}
        <div className="col-lg-8">
          <div className="card-flat p-0 h-100 shadow-sm border-0 overflow-hidden">
            
            {/* Tabs Navigation */}
            <ul className="nav nav-tabs px-4 pt-4 border-bottom-0 bg-light">
              <li className="nav-item">
                <button className={`nav-link fw-bold ${activeTab === 'perfil' ? 'active bg-white text-blue-dark border-bottom-0' : 'text-muted'}`} onClick={() => setActiveTab('perfil')}>
                  <i className="bi bi-person-lines-fill me-2"></i> Perfil
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link fw-bold ${activeTab === 'estatisticas' ? 'active bg-white text-blue-dark border-bottom-0' : 'text-muted'}`} onClick={() => setActiveTab('estatisticas')}>
                  <i className="bi bi-graph-up-arrow me-2"></i> Análises
                </button>
              </li>
            </ul>

            <div className="p-4 bg-white" style={{ minHeight: '500px' }}>
              
              {/* TAB 1: PERFIL & MÉDICO */}
              {activeTab === 'perfil' && (
                <form onSubmit={handleSave}>
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                     <h5 className="fw-bold text-blue-dark mb-0">Ficha Completa do Atleta</h5>
                     {userType !== 'estudante' && !isEditing && (
                       <button type="button" className="btn btn-outline-primary rounded-pill fw-bold px-3 btn-sm" onClick={() => setIsEditing(true)}>
                         <i className="bi bi-pencil-fill me-2"></i>Editar Dados
                       </button>
                     )}
                  </div>

                  <div className="row g-4">
                    {/* Bloco Escolar e Pessoal */}
                    <div className="col-12"><h6 className="fw-bold text-orange mb-0"><i className="bi bi-mortarboard-fill me-2"></i>Dados Escolares e Pessoais</h6></div>
                    
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Nome Completo</label>
                      <input type="text" className="form-control bg-light" name="nome" value={student.nome || ''} onChange={handleInputChange} disabled={!isEditing} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small fw-bold">Matrícula</label>
                      <input type="text" className="form-control bg-light" name="matricula" value={student.matricula || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small fw-bold">Turma</label>
                      <select className="form-select bg-light" name="turma" value={student.turma || student.serie || ''} onChange={handleInputChange} disabled={!isEditing}>
                        <option value="">Selecione...</option>
                        {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label text-muted small fw-bold">Data de Nasc.</label>
                      <input type="date" className="form-control bg-light" name="dataNascimento" value={student.dataNascimento ? student.dataNascimento.split('T')[0] : ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small fw-bold">Idade</label>
                      <input type="text" className="form-control bg-light" value={`${calculateAge(student.dataNascimento)} anos`} disabled />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small fw-bold">Gênero</label>
                      <select className="form-select bg-light" name="sexo" value={student.sexo || ''} onChange={handleInputChange} disabled={!isEditing} required>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small fw-bold">CPF</label>
                      <input type="text" className="form-control bg-light" name="cpf" value={student.cpf || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="000.000.000-00" />
                    </div>
                    
                    <div className="col-md-12">
                      <label className="form-label text-muted small fw-bold">Endereço</label>
                      <input type="text" className="form-control bg-light" name="endereco" value={student.endereco || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Rua, Bairro, Nº" />
                    </div>

                    {/* Bloco do Responsável */}
                    <div className="col-12 mt-4"><h6 className="fw-bold text-orange mb-0"><i className="bi bi-people-fill me-2"></i>Dados do Responsável</h6></div>
                    
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Nome do Responsável</label>
                      <input type="text" className="form-control bg-light" name="nomeResponsavel" value={student.nomeResponsavel || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Telefone do Responsável</label>
                      <input type="text" className="form-control bg-light" name="telefoneResponsavel" value={student.telefoneResponsavel || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="(00) 00000-0000" />
                    </div>

                    {/* Bloco Físico/Esportivo */}
                    <div className="col-12 mt-5"><h6 className="fw-bold text-orange mb-0"><i className="bi bi-activity me-2"></i>Antropometria e Esporte</h6></div>

                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Peso (kg)</label>
                      <input type="number" step="0.1" className="form-control bg-light" name="peso" value={student.peso || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Altura (m)</label>
                      <input type="number" step="0.01" className="form-control bg-light" name="altura" value={student.altura || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Nº Camisa (Opcional)</label>
                      <input type="text" className="form-control bg-light" name="numeroCamisa" value={student.numeroCamisa || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold mb-2">Modalidades Inscritas</label>
                      <div className={isEditing ? '' : 'pe-none opacity-75'}>
                        <ModalidadesSelector 
                          selected={student.modalidades || student.esportes || []}
                          onChange={(novos) => setStudent({...student, modalidades: novos})}
                        />
                      </div>
                    </div>

                    {/* Bloco Médico */}
                    <div className="col-12 mt-5"><h6 className="fw-bold text-orange mb-0"><i className="bi bi-heart-pulse-fill me-2"></i>Histórico Médico</h6></div>

                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Alergias</label>
                      <textarea className="form-control bg-light" name="alergias" rows="2" value={student.alergias || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Nenhuma declarada..."></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Lesões Anteriores</label>
                      <textarea className="form-control bg-light" name="lesoesAnteriores" rows="2" value={student.lesoesAnteriores || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Nenhuma declarada..."></textarea>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label text-muted small fw-bold">Observações Médicas / Restrições</label>
                      <textarea className="form-control bg-light" name="observacoesMedicas" rows="2" value={student.observacoesMedicas || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Vazio..."></textarea>
                    </div>

                    {isEditing && (
                      <div className="col-12 text-end mt-4 pt-3 border-top">
                        <button type="button" className="btn btn-light me-3 px-4 fw-bold rounded-pill" onClick={() => { setIsEditing(false); fetchStudent(); }}>Cancelar</button>
                        <button type="submit" className="btn btn-primary px-5 fw-bold rounded-pill">Salvar Alterações</button>
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* TAB 2: ANÁLISES */}
              {activeTab === 'estatisticas' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                     {showModalidadePicker ? (
                       <h5 className="fw-bold text-blue-dark mb-0">Escolha a modalidade</h5>
                     ) : (
                       <h5 className="fw-bold text-blue-dark mb-0">Análises Realizadas</h5>
                     )}
                     
                     <div className="d-flex gap-2">
                       {showModalidadePicker ? (
                         <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold border text-muted" onClick={() => setShowModalidadePicker(false)}>
                           Cancelar
                         </button>
                       ) : (
                         <>
                           {userType !== 'estudante' && (
                             <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold" onClick={() => setShowModalidadePicker(true)}>
                               <i className="bi bi-plus-lg me-1"></i> Nova Análise
                             </button>
                           )}
                         </>
                       )}
                     </div>
                  </div>

                  {showModalidadePicker ? (
                    <div className="py-2">
                      {student.modalidades && student.modalidades.length > 0 ? (
                        <div className="row g-3">
                          {student.modalidades.map(mod => (
                            <div key={mod} className="col-md-4">
                              <button 
                                className="btn btn-outline-primary w-100 p-4 rounded-4 shadow-sm fw-bold border-2 d-flex flex-column align-items-center justify-content-center gap-2 h-100"
                                onClick={() => navigate(`/analises?alunoId=${id}&novaAnalise=true&modalidade=${encodeURIComponent(mod)}`)}
                              >
                                <i className="bi bi-activity fs-2"></i>
                                {mod}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <i className="bi bi-exclamation-circle fs-1 text-muted mb-3 d-block"></i>
                          <p className="text-muted fs-5">Este atleta não possui modalidades cadastradas no perfil.</p>
                          <button className="btn btn-primary mt-3 rounded-pill fw-bold" onClick={() => { setActiveTab('perfil'); setShowModalidadePicker(false); setIsEditing(true); }}>
                            Adicionar Modalidade
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                  {hasAnalyses ? (
                    <div>
                      {Object.keys(groupedAnalyses).map(mod => (
                        <div key={mod} className="mb-4">
                          <h6 className="fw-bold text-secondary mb-3 pb-2 border-bottom d-flex align-items-center">
                            <i className="bi bi-bookmark-fill me-2 text-primary"></i>
                            {mod}
                          </h6>
                          <div className="row g-3">
                            {groupedAnalyses[mod].map(analise => (
                              <div key={analise._id} className="col-md-6 col-lg-4">
                                <div className="card-flat p-3 border h-100 bg-white shadow-sm">
                                  <div className="d-flex justify-content-between mb-2 align-items-center">
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">{analise.tipo}</span>
                                    <span className="text-muted small fw-medium">
                                      <i className="bi bi-calendar3 me-1"></i>
                                      {new Date(analise.dataAvaliacao || analise.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </span>
                                  </div>
                                  <h6 className="fw-bold text-blue-dark mb-2 mt-3 text-truncate">{analise.subtipo ? `Análise de ${analise.subtipo}` : 'Análise Geral'}</h6>
                                  <div className="text-muted small mb-3">
                                    <i className="bi bi-person-badge me-1"></i>
                                    Treinador: {analise.treinador ? analise.treinador.nome : 'Não informado'}
                                  </div>
                                  <button className="btn btn-outline-secondary btn-sm w-100 fw-bold" onClick={() => navigate(`/analises/${analise._id}`)}>
                                    Visualizar
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                      <i className="bi bi-clipboard-x fs-1 text-muted mb-3 d-block"></i>
                      <p className="text-muted fs-5 mb-0">Este atleta ainda não possui análises registradas.</p>
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
    </Layout>
  );
};

export default StudentProfile;
