import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import ModalidadesSelector from '../../components/ModalidadesSelector';

const Alunos = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const userType = localStorage.getItem('tipo');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurma, setFilterTurma] = useState('');
  const [filterSituacao, setFilterSituacao] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '', matricula: '', turma: '1º Ano Técnico', sexo: 'Feminino',
    modalidades: [], email: '', telefone: '', situacao: 'Ativo'
  });

  const turmasDisponiveis = ['1º Ano Técnico', '2º Ano Técnico', '3º Ano Técnico', 'Superior', 'Outro'];
  const situacoes = ['Ativo', 'Inativo', 'Afastado', 'Lesionado', 'Transferido'];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!formData.nome || !formData.sexo) {
      setMensagem('Preencha os campos obrigatórios (Nome, Gênero)');
      return;
    }

    try {
      // Garantindo que envia pro backend usando o novo formato 'modalidades' + fallback para 'esportes' antigo caso necessite
      const payload = {
        ...formData,
        esportes: formData.modalidades 
      };

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setMensagem('Erro ao adicionar aluno');
        return;
      }

      setMensagem('✅ Aluno cadastrado com sucesso!');
      setTimeout(() => {
        setFormData({ nome: '', matricula: '', turma: '1º Ano Técnico', sexo: 'Feminino', modalidades: [], email: '', telefone: '', situacao: 'Ativo' });
        setShowForm(false);
        setMensagem('');
        fetchStudents();
      }, 1500);
    } catch (error) {
      setMensagem('Erro no servidor');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (student.matricula || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Suporte a 'turma' (novo) ou 'serie' (antigo)
    const studentTurma = student.turma || student.serie || '';
    const matchesTurma = filterTurma ? studentTurma.includes(filterTurma) : true;
    
    const matchesSituacao = filterSituacao ? student.situacao === filterSituacao : true;

    return matchesSearch && matchesTurma && matchesSituacao;
  }).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

  const getSituacaoColor = (sit) => {
    switch(sit) {
      case 'Ativo': return '#22c55e'; // verde
      case 'Inativo': return '#94a3b8'; // cinza
      case 'Afastado': return '#f59e0b'; // laranja
      case 'Lesionado': return '#ef4444'; // vermelho
      case 'Transferido': return '#3b82f6'; // azul
      default: return '#22c55e';
    }
  };

  return (
    <Layout>
      <div className="container-fluid p-0">
        
        {/* Header e Filtros */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
          <div>
            <h2 className="fw-bold text-blue-dark mb-1">Meus Atletas</h2>
            <p className="text-muted mb-0">Gerencie todos os alunos inscritos nos seus esportes.</p>
          </div>
          {userType !== 'estudante' && (
            <button 
              className="btn btn-primary shadow-sm rounded-pill px-4 py-2 fw-bold"
              onClick={() => setShowForm(!showForm)}
            >
              <i className={`bi bi-${showForm ? 'x-lg' : 'plus-lg'} me-2`}></i> 
              {showForm ? 'Cancelar' : 'Novo Aluno'}
            </button>
          )}
        </div>

        {/* Painel de Filtros */}
        <div className="card-flat p-3 mb-4 shadow-sm border">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control border-start-0 ps-0" placeholder="Buscar por nome ou matrícula..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select text-muted" value={filterTurma} onChange={(e) => setFilterTurma(e.target.value)}>
                <option value="">Todas as Turmas</option>
                {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select text-muted" value={filterSituacao} onChange={(e) => setFilterSituacao(e.target.value)}>
                <option value="">Todas as Situações</option>
                {situacoes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Formulário de Cadastro Rápido */}
        {showForm && userType !== 'estudante' && (
          <div className="card-flat p-4 mb-5 shadow-sm border" style={{ backgroundColor: '#f8fafc' }}>
            <h5 className="fw-bold mb-4 text-blue-dark border-bottom pb-2">Cadastro Rápido de Aluno</h5>
            {mensagem && <div className={`alert ${mensagem.includes('✅') ? 'alert-success' : 'alert-danger'} fw-bold rounded-3`}>{mensagem}</div>}
            
            <form onSubmit={handleAddStudent}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Nome Completo *</label>
                  <input type="text" className="form-control" name="nome" value={formData.nome} onChange={handleInputChange} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted">Matrícula</label>
                  <input type="text" className="form-control" name="matricula" value={formData.matricula} onChange={handleInputChange} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted">Turma</label>
                  <select className="form-select" name="turma" value={formData.turma} onChange={handleInputChange}>
                    {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-bold text-muted">Sexo</label>
                  <select className="form-select" name="sexo" value={formData.sexo} onChange={handleInputChange} required>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>
                
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">E-mail</label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Telefone / WhatsApp</label>
                  <input type="text" className="form-control" name="telefone" value={formData.telefone} onChange={handleInputChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Situação Inicial</label>
                  <select className="form-select" name="situacao" value={formData.situacao} onChange={handleInputChange}>
                    {situacoes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="col-12 mt-4">
                  <label className="form-label small fw-bold text-muted">Vincular Modalidades</label>
                  <ModalidadesSelector 
                    selected={formData.modalidades}
                    onChange={(novos) => setFormData({...formData, modalidades: novos})}
                  />
                  <small className="text-muted d-block mt-1">Isso adicionará o aluno imediatamente aos elencos selecionados.</small>
                </div>
                
                <div className="col-12 text-end mt-4 pt-3 border-top">
                  <button type="submit" className="btn btn-primary px-5 py-2 fw-bold rounded-pill">
                    Salvar e Ir para Perfil Completo
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Grid de Listagem */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <div className="row g-4">
            {filteredStudents.map(student => {
              const sit = student.situacao || 'Ativo';
              const sitColor = getSituacaoColor(sit);
              // Fallback para modalidades ou esportes (retrocompatibilidade)
              const arrEsportes = student.modalidades?.length > 0 ? student.modalidades : (student.esportes || []);

              return (
                <div className="col-md-6 col-xl-4" key={student._id}>
                  <div 
                    className="card-flat p-4 h-100 position-relative shadow-sm cursor-pointer hover-bg-light" 
                    onClick={() => window.location.href=`/alunos/${student._id}`} 
                    style={{transition: '0.2s', borderTop: `4px solid ${sitColor}`}}
                  >
                    
                    {/* Badge Situação */}
                    <span 
                      className="position-absolute top-0 end-0 mt-3 me-3 badge rounded-pill" 
                      style={{ backgroundColor: `${sitColor}20`, color: sitColor, fontSize: '0.75rem', fontWeight: 'bold' }}
                    >
                      {sit.toUpperCase()}
                    </span>
                    
                    {/* Header: Avatar and Name */}
                    <div className="d-flex align-items-center mb-3 mt-2">
                      {student.foto ? (
                        <img src={student.foto} alt="Perfil" className="rounded-circle shadow-sm me-3" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                      ) : (
                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm bg-blue-dark text-white" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                          {student.nome ? student.nome.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                      <div className="pe-4">
                        <h5 className="fw-bold text-blue-dark mb-0 text-truncate" style={{maxWidth: '180px'}}>{student.nome}</h5>
                        <div className="text-muted small fw-bold mt-1">{student.turma || student.serie || 'S/ Turma'} {student.matricula ? `• ${student.matricula}` : ''}</div>
                      </div>
                    </div>

                    {/* Sports Pills */}
                    <div className="d-flex flex-wrap gap-2 mb-3 mt-3">
                      {arrEsportes && arrEsportes.length > 0 ? (
                        arrEsportes.map((esp, idx) => (
                          <span key={idx} className="badge bg-light text-blue-dark border px-2 py-1">{esp}</span>
                        ))
                      ) : (
                        <span className="text-muted small fst-italic">Sem modalidades vinculadas</span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
            
            {filteredStudents.length === 0 && (
              <div className="col-12 text-center py-5">
                <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="fw-bold text-blue-dark mt-3">Nenhum aluno encontrado</h5>
                <p className="text-muted">Ajuste os filtros ou cadastre um novo aluno.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Alunos;
