import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ModalidadesSelector from '../../components/ModalidadesSelector';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userType = localStorage.getItem('tipo'); 
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [activeTab, setActiveTab] = useState('perfil'); // perfil, estatisticas, anotacoes

  const turmasDisponiveis = ['1º Ano Técnico', '2º Ano Técnico', '3º Ano Técnico', 'Superior', 'Outro'];
  const situacoes = ['Ativo', 'Inativo', 'Afastado', 'Lesionado', 'Transferido'];

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

  const getImcData = () => {
    if (!student || !student.peso || !student.altura) return { valor: '-', cor: '#94a3b8', status: 'N/A' };
    const peso = parseFloat(student.peso);
    const altura = parseFloat(student.altura);
    const imc = (peso / (altura * altura)).toFixed(2);
    
    let cor = '#94a3b8';
    let status = 'Desconhecido';

    if (imc < 18.5) { cor = '#eab308'; status = 'Abaixo do peso (Alerta)'; }
    else if (imc >= 18.5 && imc <= 24.9) { cor = '#22c55e'; status = 'Peso saudável'; }
    else if (imc >= 25 && imc <= 29.9) { cor = '#f97316'; status = 'Sobrepeso (Alerta)'; }
    else { cor = '#ef4444'; status = 'Obesidade (Atenção)'; }

    return { valor: imc, cor, status };
  };

  const getSituacaoColor = (sit) => {
    switch(sit) {
      case 'Ativo': return '#22c55e';
      case 'Inativo': return '#94a3b8';
      case 'Afastado': return '#f59e0b';
      case 'Lesionado': return '#ef4444';
      case 'Transferido': return '#3b82f6';
      default: return '#22c55e';
    }
  };

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

  const imcData = getImcData();
  const sitColor = getSituacaoColor(student.situacao || 'Ativo');

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button className="btn btn-light rounded-circle shadow-sm me-4 d-flex align-items-center justify-content-center text-muted hover-bg-light" style={{width:'45px', height:'45px'}} onClick={() => navigate('/alunos')}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
            <h2 className="fw-bold text-blue-dark mb-0">Dashboard do Atleta</h2>
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
          <div className="card-flat p-4 text-center h-100 shadow-sm border-0 position-relative" style={{ borderTop: `5px solid ${sitColor}` }}>
            
            <span className="position-absolute top-0 end-0 mt-3 me-3 badge rounded-pill px-3 py-2 shadow-sm" style={{ backgroundColor: sitColor, color: '#fff' }}>
              {(student.situacao || 'Ativo').toUpperCase()}
            </span>

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

            <div className="bg-light rounded-4 p-4 text-start mb-3 border">
              <div className="mb-2"><i className="bi bi-envelope-fill me-2 text-primary"></i> <strong>{student.email || 'Não informado'}</strong></div>
              <div><i className="bi bi-whatsapp me-2 text-success"></i> <strong>{student.telefone || 'Não informado'}</strong></div>
            </div>

            <div className="bg-light rounded-4 p-4 text-start border">
              <h6 className="fw-bold text-blue-dark mb-2">Contato de Emergência</h6>
              <div className="text-danger fw-bold"><i className="bi bi-telephone-plus-fill me-2"></i> {student.contatoEmergencia || 'Não informado'}</div>
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
                  <i className="bi bi-person-lines-fill me-2"></i> Perfil & Médico
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link fw-bold ${activeTab === 'estatisticas' ? 'active bg-white text-blue-dark border-bottom-0' : 'text-muted'}`} onClick={() => setActiveTab('estatisticas')}>
                  <i className="bi bi-graph-up-arrow me-2"></i> Estatísticas
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link fw-bold ${activeTab === 'anotacoes' ? 'active bg-white text-blue-dark border-bottom-0' : 'text-muted'}`} onClick={() => setActiveTab('anotacoes')}>
                  <i className="bi bi-journal-text me-2"></i> Anotações (Coach)
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
                    {/* Bloco Escolar */}
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

                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Data de Nasc.</label>
                      <input type="date" className="form-control bg-light" name="dataNascimento" value={student.dataNascimento ? student.dataNascimento.split('T')[0] : ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Gênero</label>
                      <select className="form-select bg-light" name="sexo" value={student.sexo || ''} onChange={handleInputChange} disabled={!isEditing} required>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Situação</label>
                      <select className="form-select bg-light" name="situacao" value={student.situacao || 'Ativo'} onChange={handleInputChange} disabled={!isEditing}>
                        {situacoes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Bloco Físico/Esportivo */}
                    <div className="col-12 mt-5"><h6 className="fw-bold text-orange mb-0"><i className="bi bi-activity me-2"></i>Antropometria e Esporte</h6></div>

                    <div className="col-md-3">
                      <label className="form-label text-muted small fw-bold">Peso (kg)</label>
                      <input type="number" step="0.1" className="form-control bg-light" name="peso" value={student.peso || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small fw-bold">Altura (m)</label>
                      <input type="number" step="0.01" className="form-control bg-light" name="altura" value={student.altura || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="col-md-6 d-flex align-items-end pb-2">
                       <span className="badge rounded-pill fw-bold px-3 py-2 fs-6 shadow-sm" style={{backgroundColor: imcData.cor, color: '#fff'}}>
                         IMC: {imcData.valor} ({imcData.status})
                       </span>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Posição (Principal)</label>
                      <input type="text" className="form-control bg-light" name="posicao" value={student.posicao || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Dominância</label>
                      <select className="form-select bg-light" name="dominancia" value={student.dominancia || ''} onChange={handleInputChange} disabled={!isEditing}>
                        <option value="">Selecione...</option>
                        <option value="Destro">Destro</option>
                        <option value="Canhoto">Canhoto</option>
                        <option value="Ambidestro">Ambidestro</option>
                      </select>
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

              {/* TAB 2: ESTATÍSTICAS */}
              {activeTab === 'estatisticas' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                     <h5 className="fw-bold text-blue-dark mb-0">Rendimento Desportivo</h5>
                     <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold" onClick={() => navigate(`/analises?alunoId=${id}`)}>
                       Ver Análises Detalhadas
                     </button>
                  </div>
                  
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="card-flat bg-light border p-4 text-center h-100">
                        <h6 className="fw-bold text-blue-dark mb-4">Radar de Habilidades (Média)</h6>
                        <div className="mx-auto" style={{ width: '250px', height: '250px' }}>
                           {/* MOCK SVG RADAR CHART */}
                           <svg viewBox="0 0 100 100" className="w-100 h-100">
                             {/* Fundo Radar */}
                             <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1"/>
                             <polygon points="50,25 80,40 80,60 50,75 20,60 20,40" fill="none" stroke="#cbd5e1" strokeWidth="1"/>
                             <line x1="50" y1="5" x2="50" y2="95" stroke="#cbd5e1" strokeWidth="1"/>
                             <line x1="5" y1="25" x2="95" y2="75" stroke="#cbd5e1" strokeWidth="1"/>
                             <line x1="5" y1="75" x2="95" y2="25" stroke="#cbd5e1" strokeWidth="1"/>
                             
                             {/* Area do Atleta (Exemplo) */}
                             <polygon points="50,30 85,35 60,70 50,80 30,60 20,40" fill="rgba(249, 115, 22, 0.4)" stroke="#f97316" strokeWidth="2"/>
                             
                             {/* Labels */}
                             <text x="50" y="3" fontSize="4" textAnchor="middle" fill="#64748b" fontWeight="bold">Físico</text>
                             <text x="96" y="25" fontSize="4" textAnchor="start" fill="#64748b" fontWeight="bold">Tática</text>
                             <text x="96" y="75" fontSize="4" textAnchor="start" fill="#64748b" fontWeight="bold">Passe</text>
                             <text x="50" y="99" fontSize="4" textAnchor="middle" fill="#64748b" fontWeight="bold">Defesa</text>
                             <text x="4" y="75" fontSize="4" textAnchor="end" fill="#64748b" fontWeight="bold">Chute</text>
                             <text x="4" y="25" fontSize="4" textAnchor="end" fill="#64748b" fontWeight="bold">Drible</text>
                           </svg>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card-flat bg-light border p-4 h-100">
                        <h6 className="fw-bold text-blue-dark mb-4 text-center">Frequência e Assiduidade</h6>
                        
                        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
                          <div>
                            <span className="d-block text-muted small fw-bold">Presenças (Últimos 30 dias)</span>
                            <span className="fs-3 fw-bold text-success">24</span>
                          </div>
                          <div>
                            <span className="d-block text-muted small fw-bold">Faltas</span>
                            <span className="fs-3 fw-bold text-danger">3</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <span className="d-block text-muted small fw-bold mb-2">Taxa de Participação</span>
                          <div className="progress" style={{ height: '20px' }}>
                            <div className="progress-bar bg-success fw-bold" role="progressbar" style={{ width: '88%' }}>88%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ANOTAÇÕES */}
              {activeTab === 'anotacoes' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                     <h5 className="fw-bold text-blue-dark mb-0">Coach Notes (Diário do Treinador)</h5>
                     <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold">
                       <i className="bi bi-plus-lg me-2"></i>Nova Anotação
                     </button>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    <div className="p-3 bg-light rounded-4 border border-start border-4 border-primary">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold text-blue-dark">Desempenho no Jogo Treino</span>
                        <span className="text-muted small">Hoje, 14:30</span>
                      </div>
                      <p className="mb-0 text-secondary">O aluno mostrou grande evolução na recomposição defensiva, mas ainda precisa trabalhar o pé não dominante.</p>
                    </div>

                    <div className="p-3 bg-light rounded-4 border border-start border-4 border-warning">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold text-blue-dark">Aviso de Lesão Leve</span>
                        <span className="text-muted small">12/07/2026</span>
                      </div>
                      <p className="mb-0 text-secondary">Torção leve no tornozelo direito. Ficará afastado dos treinos com bola por 3 dias. Encaminhado ao departamento médico.</p>
                    </div>

                    <div className="p-3 bg-light rounded-4 border border-start border-4 border-secondary">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold text-blue-dark">Avaliação Inicial</span>
                        <span className="text-muted small">01/02/2026</span>
                      </div>
                      <p className="mb-0 text-secondary">Aluno inserido no programa. Boa estrutura física, mas requer adaptação tática ao esquema da equipe.</p>
                    </div>
                  </div>
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
