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
  const [filterGenero, setFilterGenero] = useState('');
  const [filterIdade, setFilterIdade] = useState('');

  const [formData, setFormData] = useState({
    nome: '', sexo: 'Feminino', dataNascimento: '', cpf: '', endereco: '',
    matricula: '', turma: '', telefone: '', nomeResponsavel: '', telefoneResponsavel: '',
    peso: '', altura: '', alergias: '', lesoesAnteriores: '', restricoesMedicas: '',
    numeroCamisa: '', modalidades: []
  });

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];
  const generosDisponiveis = ['Feminino', 'Masculino', 'Outro'];
  const faixasEtarias = ['Menor de idade', 'Maior de idade'];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erro da API:', data.mensagem || response.statusText);
        setStudents([]);
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        setLoading(false);
        return;
      }

      setStudents(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Falha na requisição:', error);
      setStudents([]);
      setLoading(false);
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
    
    if (name === 'telefone' || name === 'telefoneResponsavel') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!formData.nome || !formData.sexo || !formData.matricula || !formData.telefone || !formData.cpf || !formData.dataNascimento) {
      setMensagem('Preencha os campos obrigatórios (*).');
      return;
    }
    if (formData.cpf.length < 14) {
      setMensagem('CPF inválido ou incompleto.');
      return;
    }

    try {
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
        setFormData({
          nome: '', sexo: 'Feminino', dataNascimento: '', cpf: '', endereco: '',
          matricula: '', turma: '', telefone: '', nomeResponsavel: '', telefoneResponsavel: '',
          peso: '', altura: '', alergias: '', lesoesAnteriores: '', restricoesMedicas: '',
          numeroCamisa: '', modalidades: []
        });
        setShowForm(false);
        setMensagem('');
        fetchStudents();
      }, 1500);
    } catch (error) {
      setMensagem('Erro no servidor');
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

  const filteredStudents = (Array.isArray(students) ? students : []).filter(student => {
    const matchesSearch = (student.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (student.matricula || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const studentTurma = student.turma || student.serie || '';
    const matchesTurma = filterTurma ? studentTurma === filterTurma : true;
    
    const matchesGenero = filterGenero ? (student.sexo || '') === filterGenero : true;
    
    let matchesIdade = true;
    if (filterIdade === 'Menor de idade') {
      matchesIdade = student.dataNascimento ? isMinor(student.dataNascimento) : false;
    } else if (filterIdade === 'Maior de idade') {
      matchesIdade = student.dataNascimento ? !isMinor(student.dataNascimento) : false;
    }

    return matchesSearch && matchesTurma && matchesGenero && matchesIdade;
  }).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

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
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control border-start-0 ps-0" placeholder="Buscar aluno..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="col-12 col-lg-3">
              <div className="d-flex align-items-center bg-light rounded px-3 py-1 border">
                <i className="bi bi-building me-2 text-muted"></i>
                <select className="form-select form-select-sm border-0 bg-transparent shadow-none" value={filterTurma} onChange={(e) => setFilterTurma(e.target.value)}>
                  <option value="">Todas as Turmas</option>
                  {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="col-12 col-lg-3">
              <div className="d-flex align-items-center bg-light rounded px-3 py-1 border">
                <i className="bi bi-gender-ambiguous me-2 text-muted"></i>
                <select className="form-select form-select-sm border-0 bg-transparent shadow-none" value={filterGenero} onChange={(e) => setFilterGenero(e.target.value)}>
                  <option value="">Todos (Gênero)</option>
                  {generosDisponiveis.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="col-12 col-lg-3">
              <div className="d-flex align-items-center bg-light rounded px-3 py-1 border">
                <i className="bi bi-calendar-event me-2 text-muted"></i>
                <select className="form-select form-select-sm border-0 bg-transparent shadow-none" value={filterIdade} onChange={(e) => setFilterIdade(e.target.value)}>
                  <option value="">Todas as Idades</option>
                  {faixasEtarias.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário Customizado de Cadastro de Aluno pelo Treinador */}
        {showForm && userType !== 'estudante' && (
          <div className="card-flat p-4 p-md-5 mb-5 shadow-sm border rounded-4" style={{ backgroundColor: '#f8fafc' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
              <h4 className="fw-bold text-blue-dark mb-0"><i className="bi bi-person-plus-fill me-2"></i>Cadastrar Novo Atleta</h4>
              <button className="btn-close" onClick={() => setShowForm(false)}></button>
            </div>
            
            {mensagem && <div className={`alert ${mensagem.includes('✅') ? 'alert-success bg-green-light border-0 text-success' : 'alert-danger'} fw-bold rounded-3`}><i className={`bi ${mensagem.includes('✅') ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>{mensagem}</div>}
            
            <form onSubmit={handleAddStudent}>
              
              {/* Seção A: Dados Pessoais e Acadêmicos */}
              <h6 className="fw-bold text-blue-dark mb-3"><i className="bi bi-person-lines-fill me-2 text-primary"></i>Dados Pessoais e Acadêmicos</h6>
              <div className="row g-3 mb-4 bg-white p-3 rounded-3 border shadow-sm">
                <div className="col-md-8">
                  <label className="form-label small fw-bold text-muted">Nome Completo *</label>
                  <input type="text" className="form-control bg-light border-0" name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Nome do estudante" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Gênero *</label>
                  <select className="form-select bg-light border-0" name="sexo" value={formData.sexo} onChange={handleInputChange} required>
                    {generosDisponiveis.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Data de Nascimento *</label>
                  <input type="date" className="form-control bg-light border-0" name="dataNascimento" value={formData.dataNascimento} onChange={handleInputChange} required />
                </div>
                <div className="col-md-8">
                  <label className="form-label small fw-bold text-muted">CPF *</label>
                  <input type="text" className="form-control bg-light border-0" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" required />
                </div>
                
                <div className="col-md-12">
                  <label className="form-label small fw-bold text-muted">Endereço</label>
                  <input type="text" className="form-control bg-light border-0" name="endereco" value={formData.endereco} onChange={handleInputChange} placeholder="Rua, Bairro, Nº" />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Matrícula *</label>
                  <input type="text" className="form-control bg-light border-0" name="matricula" value={formData.matricula} onChange={handleInputChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Turma</label>
                  <select className="form-select bg-light border-0" name="turma" value={formData.turma} onChange={handleInputChange}>
                    <option value="">Selecione...</option>
                    {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Telefone (Contato) *</label>
                  <input type="text" className="form-control bg-light border-0" name="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="(00) 00000-0000" required />
                </div>
              </div>

              <div className="row g-4 mb-4">
                {/* Seção B: Dados do Responsável */}
                <div className="col-lg-6">
                  <h6 className="fw-bold text-blue-dark mb-3"><i className="bi bi-people-fill me-2 text-primary"></i>Dados do Responsável</h6>
                  <div className="bg-white p-3 rounded-3 border shadow-sm h-100">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Nome do Responsável</label>
                      <input type="text" className="form-control bg-light border-0" name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleInputChange} placeholder="Nome do pai, mãe ou responsável" />
                    </div>
                    <div>
                      <label className="form-label small fw-bold text-muted">Telefone do Responsável</label>
                      <input type="text" className="form-control bg-light border-0" name="telefoneResponsavel" value={formData.telefoneResponsavel} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                </div>

                {/* Seção C: Informações Físicas */}
                <div className="col-lg-6">
                  <h6 className="fw-bold text-blue-dark mb-3"><i className="bi bi-heart-pulse-fill me-2 text-danger"></i>Informações Físicas e Médicas</h6>
                  <div className="bg-white p-3 rounded-3 border shadow-sm h-100">
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold text-muted">Peso (kg)</label>
                        <input type="number" step="0.1" className="form-control bg-light border-0" name="peso" value={formData.peso} onChange={handleInputChange} placeholder="Ex: 65.5" />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold text-muted">Altura (m)</label>
                        <input type="number" step="0.01" className="form-control bg-light border-0" name="altura" value={formData.altura} onChange={handleInputChange} placeholder="Ex: 1.75" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Alergias</label>
                      <input type="text" className="form-control bg-light border-0" name="alergias" value={formData.alergias} onChange={handleInputChange} placeholder="Medicamentos, insetos, etc." />
                    </div>
                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label small fw-bold text-muted">Lesões Anteriores</label>
                        <textarea className="form-control bg-light border-0" name="lesoesAnteriores" rows="2" value={formData.lesoesAnteriores} onChange={handleInputChange}></textarea>
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold text-muted">Restrições Médicas</label>
                        <textarea className="form-control bg-light border-0" name="restricoesMedicas" rows="2" value={formData.restricoesMedicas} onChange={handleInputChange}></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção D: Perfil Esportivo */}
              <h6 className="fw-bold text-blue-dark mb-3"><i className="bi bi-trophy-fill me-2 text-primary"></i>Perfil Esportivo</h6>
              <div className="bg-white p-3 rounded-3 border shadow-sm mb-4">
                <div className="mb-4" style={{ maxWidth: '200px' }}>
                  <label className="form-label small fw-bold text-muted">Número da Camisa</label>
                  <input type="number" className="form-control bg-light border-0" name="numeroCamisa" value={formData.numeroCamisa} onChange={handleInputChange} placeholder="Ex: 10" />
                </div>
                <div>
                  <label className="form-label small fw-bold text-muted mb-3">Vincular Modalidades</label>
                  <ModalidadesSelector 
                    selected={formData.modalidades}
                    onChange={(novos) => setFormData({...formData, modalidades: novos})}
                  />
                  <small className="text-muted d-block mt-2">Isso adicionará o aluno imediatamente aos elencos selecionados.</small>
                </div>
              </div>

              <div className="d-flex justify-content-end pt-3 border-top gap-2">
                <button type="button" className="btn btn-outline-secondary fw-bold px-4 rounded-pill" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary fw-bold px-5 rounded-pill">
                  Salvar Atleta
                </button>
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
              // Fallback para modalidades ou esportes (retrocompatibilidade)
              const arrEsportes = student.modalidades?.length > 0 ? student.modalidades : (student.esportes || []);

              return (
                <div className="col-md-6 col-xl-4" key={student._id}>
                  <div 
                    className="card-flat p-4 h-100 position-relative shadow-sm cursor-pointer hover-bg-light" 
                    onClick={() => window.location.href=`/alunos/${student._id}`} 
                    style={{transition: '0.2s', borderTop: `4px solid #3b82f6`}}
                  >
                    
                    {/* Header: Avatar and Name */}
                    <div className="d-flex align-items-center mb-3 mt-2">
                      {student.foto ? (
                        <img src={student.foto} alt="Perfil" className="rounded-circle shadow-sm me-3 flex-shrink-0" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                      ) : (
                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm bg-blue-dark text-white flex-shrink-0" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
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
