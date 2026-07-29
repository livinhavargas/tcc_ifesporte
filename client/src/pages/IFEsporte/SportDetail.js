import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Analises from './Analises';

const SportDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const genero = searchParams.get('genero') || 'Feminino';
  const [students, setStudents] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const userType = localStorage.getItem('tipo');
  
  const [showCronogramaForm, setShowCronogramaForm] = useState(false);
  const [cronoData, setCronoData] = useState({
    titulo: '', dataInicio: '', dataFim: '', competicaoAlvo: '', diasPorSemana: 3, objetivoGeral: ''
  });
  
  // Format id back to name
  const nameMap = {
    'atletismo': 'Atletismo',
    'badminton': 'Badminton',
    'tenis-de-mesa': 'Tênis de Mesa',
    'xadrez': 'Xadrez',
    'basquete': 'Basquete',
    'futsal': 'Futsal',
    'futebol': 'Futebol',
    'handebol': 'Handebol',
    'volei-quadra': 'Vôlei de Quadra',
    'volei-praia': 'Vôlei de Praia'
  };
  
  const nome = nameMap[id] || id;

  // View state: 'categories', 'subcategory_detail'
  const [view, setView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Tabs for the final view: 'alunos', 'analises', 'cronogramas'
  const [activeTab, setActiveTab] = useState('alunos');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaixaEtaria, setFilterFaixaEtaria] = useState('Todos');
  const [filterTurma, setFilterTurma] = useState('Todas');

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

  React.useEffect(() => {
    fetchStudents();
    fetchCronogramas();
  }, [nome, selectedCategory]);

  const getCurrentModalidade = () => {
    return selectedCategory ? (selectedCategory.sub ? `${nome} - ${selectedCategory.cat} - ${selectedCategory.sub}` : `${nome} - ${selectedCategory.cat}`) : nome;
  };

  const getPageTitle = () => {
    if (selectedCategory) {
      return selectedCategory.sub ? `${selectedCategory.cat} ${selectedCategory.sub}` : selectedCategory.cat;
    }
    return nome;
  };

  const handleGerarCronograma = async () => {
    if (!cronoData.titulo || !cronoData.dataInicio || !cronoData.dataFim || !cronoData.competicaoAlvo) {
      alert("Preencha todos os campos de data e título");
      return;
    }
    const dInicio = new Date(`${cronoData.dataInicio}T00:00:00`);
    const dAlvo = new Date(`${cronoData.competicaoAlvo}T00:00:00`);
    const dFim = new Date(`${cronoData.dataFim}T00:00:00`);

    if (dInicio >= dAlvo || dAlvo >= dFim) {
      alert("A ordem das datas deve ser: Início -> Competição Alvo -> Fim");
      return;
    }

    const prepTime = dAlvo.getTime() - dInicio.getTime();
    const midPoint = new Date(dInicio.getTime() + (prepTime / 2));

    const generateTreinos = (start, end, objective) => {
      let treinos = [];
      let current = new Date(start);
      const allowed = [];
      if (cronoData.diasPorSemana >= 1) allowed.push(1); // seg
      if (cronoData.diasPorSemana >= 2) allowed.push(3); // qua
      if (cronoData.diasPorSemana >= 3) allowed.push(5); // sex
      if (cronoData.diasPorSemana >= 4) allowed.push(2); // ter
      if (cronoData.diasPorSemana >= 5) allowed.push(4); // qui
      if (cronoData.diasPorSemana >= 6) allowed.push(6); // sab
      if (cronoData.diasPorSemana >= 7) allowed.push(0); // dom

      while (current <= end) {
        if (allowed.includes(current.getDay())) {
          treinos.push({
            data: current.toISOString(),
            tipo: `Treino ${objective}`
          });
        }
        current.setDate(current.getDate() + 1);
      }
      return treinos;
    };

    const semanasPrep = Math.ceil((midPoint - dInicio) / (7 * 24 * 60 * 60 * 1000));
    const semanasComp = Math.ceil((dAlvo - midPoint) / (7 * 24 * 60 * 60 * 1000));
    const semanasTrans = Math.ceil((dFim - dAlvo) / (7 * 24 * 60 * 60 * 1000));

    const novo = {
      titulo: cronoData.titulo,
      modalidade: getCurrentModalidade(),
      dataInicio: dInicio.toISOString(),
      dataFim: dFim.toISOString(),
      competicaoAlvo: dAlvo.toISOString(),
      diasPorSemana: cronoData.diasPorSemana,
      objetivoGeral: cronoData.objetivoGeral,
      fases: [
        { 
          nome: 'Preparatória', dataInicio: dInicio, dataFim: midPoint, objetivo: 'Condicionamento físico e fundamentos', semanas: semanasPrep,
          treinos: generateTreinos(dInicio, midPoint, 'Físico/Técnico')
        },
        { 
          nome: 'Competitiva', dataInicio: midPoint, dataFim: dAlvo, objetivo: 'Tática, jogos treinos e competição', semanas: semanasComp,
          treinos: generateTreinos(midPoint, dAlvo, 'Tático/Específico')
        },
        { 
          nome: 'Transição', dataInicio: dAlvo, dataFim: dFim, objetivo: 'Descanso ativo e recuperação', semanas: semanasTrans,
          treinos: generateTreinos(dAlvo, dFim, 'Recuperativo')
        }
      ]
    };

    try {
      await fetch('/api/cronogramas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(novo)
      });
      fetchCronogramas();
      setShowCronogramaForm(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportAgenda = async (cronograma) => {
    if (!window.confirm("Deseja exportar estes treinos para a Agenda do IFesporte?")) return;
    try {
      for (const fase of cronograma.fases) {
        for (const treino of fase.treinos) {
          const ev = {
            titulo: `${cronograma.titulo} - ${treino.tipo}`,
            data: treino.data,
            hora: '14:00',
            local: getCurrentModalidade(),
            descricao: `Fase: ${fase.nome} - Objetivo: ${fase.objetivo}`,
            tipo: 'Treino'
          };
          await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(ev)
          });
        }
      }
      alert("Treinos exportados para a agenda com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao exportar");
    }
  };

  const handleDuplicate = async (id) => {
    if (!window.confirm("Duplicar este cronograma?")) return;
    await fetch(`/api/cronogramas/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchCronogramas();
  };

  const fetchCronogramas = async () => {
    try {
      const res = await fetch(`/api/cronogramas?modalidade=${encodeURIComponent(getCurrentModalidade())}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCronogramas(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const hierarchy = {
    'Atletismo': {
      'Corridas': ['100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', 'Revezamento 100m', 'Revezamento 400m'],
      'Saltos': ['Distância', 'Altura', 'Triplo'],
      'Lançamentos': ['Peso', 'Disco', 'Dardo']
    },
    'Tênis de Mesa': {
      'Individual': [],
      'Dupla': []
    }
  };

  const hasHierarchy = hierarchy[nome] !== undefined;

  const handleCategorySelect = (cat, sub) => {
    setSelectedCategory({ cat, sub });
    setView('subcategory_detail');
    setActiveTab('alunos');
  };

  const checkMatch = (esp, keyword) => {
    const e = (esp || '').toLowerCase();
    const k = (keyword || '').toLowerCase();
    if (e.includes(k)) return true;
    
    const parts = k.split('-').map(p => p.trim());
    
    if (k === 'atletismo') {
      const termos = ['atletismo', 'corrida', 'salto', 'arremesso', 'lançamento', '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', 'revezamento', 'distância', 'altura', 'triplo', 'peso', 'disco', 'dardo'];
      return termos.some(t => e.includes(t));
    }
    
    if (parts.length === 2 && parts[0] === 'atletismo') {
      const cat = parts[1];
      if (cat.includes('corrida')) {
        const termos = ['corrida', '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', 'revezamento'];
        return termos.some(t => e.includes(t));
      }
      if (cat.includes('salto')) {
        const termos = ['salto', 'distância', 'altura', 'triplo'];
        return termos.some(t => e.includes(t));
      }
      if (cat.includes('lançamento') || cat.includes('arremesso')) {
        const termos = ['lançamento', 'arremesso', 'peso', 'disco', 'dardo'];
        return termos.some(t => e.includes(t));
      }
    }
    
    if (parts.length === 3 && parts[0] === 'atletismo') {
      const leaf = parts[2];
      if (e.includes(leaf)) return true;
    }
    
    return false;
  };

  const countForNode = (keyword) => {
    return students.filter(s => {
      if (s.sexo !== genero) return false;
      const arr = s.modalidades?.length > 0 ? s.modalidades : (s.esportes || []);
      return arr.some(esp => checkMatch(esp, keyword));
    }).length;
  };

  const getFilteredStudents = () => {
    let keyword = nome;
    if (selectedCategory) {
      keyword = `${nome} - ${selectedCategory.cat}`;
      if (selectedCategory.sub) keyword += ` - ${selectedCategory.sub}`;
    }
    let filtered = students.filter(s => {
      if (s.sexo !== genero) return false;
      const arr = s.modalidades?.length > 0 ? s.modalidades : (s.esportes || []);
      return arr.some(esp => checkMatch(esp, keyword));
    });

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        (s.nome || '').toLowerCase().includes(lower) || 
        (s.matricula || '').toLowerCase().includes(lower)
      );
    }
    if (filterFaixaEtaria === 'Menor de idade') {
      filtered = filtered.filter(s => s.dataNascimento ? isMinor(s.dataNascimento) : false);
    } else if (filterFaixaEtaria === 'Maior de idade') {
      filtered = filtered.filter(s => s.dataNascimento ? !isMinor(s.dataNascimento) : false);
    }
    if (filterTurma !== 'Todas') {
      filtered = filtered.filter(s => (s.turma || s.serie || '') === filterTurma);
    }

    return filtered;
  };

  // Imagem 8 & 9 (Menu de categorias)
  if (hasHierarchy && view === 'categories') {
    return (
      <Layout>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div className="d-flex align-items-center">
            <i className="bi bi-person-walking me-3" style={{ fontSize: '4rem', color: '#295593' }}></i>
            <div>
              <h1 className="fw-bold text-blue-dark mb-0 lh-1">{nome}</h1>
              <div className="text-blue-dark mt-1" style={{ fontSize: '1.2rem' }}>{genero}</div>
            </div>
          </div>
          <div className="text-center">
             <button className="btn btn-blue-dark text-white rounded-circle d-flex align-items-center justify-content-center bg-blue-dark" style={{width:'50px', height:'50px'}} onClick={() => navigate('/esportes')}>
               <i className="bi bi-arrow-left fs-4"></i>
             </button>
          </div>
        </div>
        
        <div className="text-blue-dark fw-bold mb-5 ms-2">{countForNode(nome)} alunos cadastrados</div>

        <div className="ms-2" style={{ maxWidth: '400px' }}>
          {Object.keys(hierarchy[nome]).map(cat => (
            <div key={cat} className="mb-4">
              <div 
                className="d-flex align-items-center cursor-pointer"
                onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
              >
                <div className="bg-orange-secondary rounded-pill me-3" style={{ width: '12px', height: '45px' }}></div>
                <h3 className="fw-bold text-orange mb-0 me-3">{cat} <span className="fs-6 text-muted">({countForNode(`${nome} - ${cat}`)})</span></h3>
                <i className="bi bi-chevron-right text-blue-dark fs-3 fw-bold"></i>
              </div>
              
              {/* Dropdown style matching image 9 */}
              {expandedCategory === cat && hierarchy[nome][cat].length > 0 && (
                <div className="bg-blue-dark text-white rounded-0 mt-2 ms-5">
                  {hierarchy[nome][cat].map(sub => (
                    <div 
                      key={sub} 
                      className="px-4 py-2 hover-bg-light cursor-pointer border-bottom border-secondary d-flex justify-content-between align-items-center"
                      onClick={() => handleCategorySelect(cat, sub)}
                    >
                      <span>{sub}</span>
                      <span className="badge bg-secondary">{countForNode(`${nome} - ${cat} - ${sub}`)}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Se a categoria nao tem subitens (ex Tênis de Mesa -> Individual) */}
              {expandedCategory === cat && hierarchy[nome][cat].length === 0 && (
                 handleCategorySelect(cat, null)
              )}
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  // Imagem 10 (Detalhes da Modalidade Final / Subcategoria)
  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-start mb-5">
        <div className="d-flex align-items-center">
          <i className="bi bi-person-walking me-3" style={{ fontSize: '4rem', color: '#295593' }}></i>
          <div>
            <h1 className="fw-bold text-blue-dark mb-0 lh-1">{getPageTitle()}</h1>
            <div className="text-blue-dark mt-1" style={{ fontSize: '1.2rem' }}>{genero}</div>
          </div>
        </div>
        <div className="d-flex flex-column align-items-end">
          <div className="d-flex align-items-center mb-2">
            <button className="btn btn-blue-dark text-white rounded-circle d-flex align-items-center justify-content-center bg-blue-dark" style={{width:'45px', height:'45px'}} onClick={() => hasHierarchy ? setView('categories') : navigate('/esportes')}>
               <i className="bi bi-arrow-left fs-4"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex mt-5">
        {/* Menu Lateral de Tabs (Imagem 10) */}
        <div className="me-5" style={{ width: '250px' }}>
          <div 
            className="d-flex align-items-center mb-4 cursor-pointer"
            onClick={() => setActiveTab('alunos')}
          >
            <div className={`rounded-pill me-3 ${activeTab === 'alunos' ? 'bg-blue-dark' : 'bg-transparent'}`} style={{ width: '12px', height: '40px' }}></div>
            <h3 className={`fw-bold mb-0 ${activeTab === 'alunos' ? 'text-orange' : 'text-blue-dark opacity-50'}`}>Alunos</h3>
          </div>

          <div 
            className="d-flex align-items-center mb-4 cursor-pointer"
            onClick={() => setActiveTab('analises')}
          >
            <div className={`rounded-pill me-3 ${activeTab === 'analises' ? 'bg-blue-dark' : 'bg-transparent'}`} style={{ width: '12px', height: '40px' }}></div>
            <h3 className={`fw-bold mb-0 ${activeTab === 'analises' ? 'text-orange' : 'text-blue-dark opacity-50'}`}>Análises</h3>
          </div>

          <div 
            className="d-flex align-items-center mb-4 cursor-pointer"
            onClick={() => setActiveTab('cronogramas')}
          >
            <div className={`rounded-pill me-3 ${activeTab === 'cronogramas' ? 'bg-blue-dark' : 'bg-transparent'}`} style={{ width: '12px', height: '40px' }}></div>
            <h3 className={`fw-bold mb-0 ${activeTab === 'cronogramas' ? 'text-orange' : 'text-blue-dark opacity-50'}`}>Cronogramas</h3>
          </div>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="flex-grow-1">
          {activeTab === 'alunos' && (
            <div className="d-flex flex-column gap-4">
              {/* Filtros e Busca */}
              <div className="card-flat p-4 shadow-sm border rounded-4 bg-white">
                <div className="row g-3 align-items-end">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted mb-1">Pesquisar Atleta</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-search"></i></span>
                      <input 
                        type="text" 
                        className="form-control bg-light border-start-0 ps-0" 
                        placeholder="Pesquisar por nome ou matrícula..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted mb-1">Faixa Etária</label>
                    <div className="d-flex align-items-center bg-light rounded px-3 border" style={{ height: '38px' }}>
                      <select 
                        className="form-select form-select-sm border-0 bg-transparent shadow-none w-100 p-0" 
                        value={filterFaixaEtaria} 
                        onChange={(e) => setFilterFaixaEtaria(e.target.value)}
                      >
                        <option value="Todos">Todos</option>
                        <option value="Menor de idade">Menor de idade</option>
                        <option value="Maior de idade">Maior de idade</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted mb-1">Turma</label>
                    <div className="d-flex align-items-center bg-light rounded px-3 border" style={{ height: '38px' }}>
                      <select 
                        className="form-select form-select-sm border-0 bg-transparent shadow-none w-100 p-0" 
                        value={filterTurma} 
                        onChange={(e) => setFilterTurma(e.target.value)}
                      >
                        <option value="Todas">Todas</option>
                        {['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Alunos */}
              <div className="card-flat p-4 shadow-sm border rounded-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold text-blue-dark mb-0">Alunos Cadastrados</h4>
                  <span className="badge bg-blue-dark fs-6 rounded-pill px-3 py-2">{getFilteredStudents().length} atletas</span>
                </div>
                
                <div className="row g-4">
                  {getFilteredStudents().length > 0 ? getFilteredStudents().map(aluno => (
                    <div key={aluno._id} className="col-md-6 col-xl-4">
                      <div 
                        className="card-flat p-4 h-100 position-relative shadow-sm cursor-pointer hover-bg-light border" 
                        onClick={() => navigate(`/alunos/${aluno._id}`)}
                        style={{ transition: '0.2s', borderTop: `4px solid #3b82f6` }}
                      >
                        <div className="d-flex align-items-center mb-3">
                          {aluno.foto ? (
                            <img src={aluno.foto} alt="Perfil" className="rounded-circle shadow-sm me-3 flex-shrink-0" style={{width: '64px', height: '64px', objectFit: 'cover'}} />
                          ) : (
                            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm bg-blue-dark text-white flex-shrink-0" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                              {aluno.nome.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="pe-2">
                            <h5 className="fw-bold text-blue-dark mb-1 text-truncate" style={{maxWidth: '100%'}}>{aluno.nome}</h5>
                            <div className="text-muted small fw-bold">{aluno.turma || aluno.serie || 'S/ Turma'} {aluno.matricula ? `• ${aluno.matricula}` : ''}</div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top">
                          <span className="text-muted small">
                            <i className="bi bi-calendar3 me-1"></i>
                            {aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : 'Sem data'}
                          </span>
                          {aluno.dataNascimento && (
                            <span className={`badge ${isMinor(aluno.dataNascimento) ? 'bg-orange-active text-blue-dark' : 'bg-secondary'}`}>
                              {isMinor(aluno.dataNascimento) ? 'Menor' : 'Maior'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-12 text-center py-5">
                      <i className="bi bi-search text-muted opacity-50 mb-3" style={{ fontSize: '3rem' }}></i>
                      <h5 className="fw-bold text-blue-dark">Nenhum atleta encontrado.</h5>
                      <p className="text-muted">Ajuste os filtros ou o termo de pesquisa.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'analises' && (
            <Analises 
              embebed={true} 
              defaultModalidade={getCurrentModalidade()} 
            />
          )}
          {activeTab === 'cronogramas' && (
            <div className="card-flat p-4 shadow-sm border">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-blue-dark mb-0">Gerador de Cronogramas</h4>
                {userType === 'admin' && !showCronogramaForm && (
                  <button className="btn btn-primary fw-bold px-4 shadow-sm" onClick={() => setShowCronogramaForm(true)}>
                    <i className="bi bi-plus-circle me-2"></i> Novo Cronograma
                  </button>
                )}
              </div>

              {showCronogramaForm && (
                <div className="card shadow-sm border-0 mb-4 bg-light p-4 rounded-4">
                  <h5 className="fw-bold mb-4 text-blue-dark">Gerar Novo Cronograma Automático</h5>
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label fw-bold small text-muted">Título do Cronograma</label>
                      <input type="text" className="form-control" value={cronoData.titulo} onChange={e => setCronoData({...cronoData, titulo: e.target.value})} placeholder="Ex: Preparação OJE 2026" />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-bold small text-muted">Data Início</label>
                      <input type="date" className="form-control" value={cronoData.dataInicio} onChange={e => setCronoData({...cronoData, dataInicio: e.target.value})} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-bold small text-muted">Competição Alvo</label>
                      <input type="date" className="form-control" value={cronoData.competicaoAlvo} onChange={e => setCronoData({...cronoData, competicaoAlvo: e.target.value})} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-bold small text-muted">Data Fim (Pós-competição)</label>
                      <input type="date" className="form-control" value={cronoData.dataFim} onChange={e => setCronoData({...cronoData, dataFim: e.target.value})} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-bold small text-muted">Treinos por Semana</label>
                      <input type="number" className="form-control" value={cronoData.diasPorSemana} onChange={e => setCronoData({...cronoData, diasPorSemana: e.target.value})} min="1" max="7" />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold small text-muted">Objetivo Geral</label>
                      <input type="text" className="form-control" value={cronoData.objetivoGeral} onChange={e => setCronoData({...cronoData, objetivoGeral: e.target.value})} placeholder="O que se espera desta temporada?" />
                    </div>
                    <div className="col-12 text-end mt-4">
                      <button className="btn btn-light me-3 fw-bold border" onClick={() => setShowCronogramaForm(false)}>Cancelar</button>
                      <button className="btn btn-primary fw-bold px-4" onClick={handleGerarCronograma}>
                        <i className="bi bi-magic me-2"></i>Gerar Fases e Treinos Automáticos
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {cronogramas.length > 0 ? (
                <div className="d-flex flex-column gap-4">
                  {cronogramas.map(cron => (
                    <div key={cron._id} className="border rounded-4 p-4 position-relative overflow-hidden">
                      <div className="position-absolute top-0 end-0 mt-3 me-3 d-flex gap-2">
                        {userType === 'admin' && (
                          <>
                            <button className="btn btn-sm btn-outline-primary" title="Exportar para Agenda" onClick={() => handleExportAgenda(cron)}>
                              <i className="bi bi-calendar-plus"></i> Exportar
                            </button>
                            <button className="btn btn-sm btn-outline-secondary" title="Duplicar" onClick={() => handleDuplicate(cron._id)}>
                              <i className="bi bi-copy"></i> Duplicar
                            </button>
                            <button className="btn btn-sm btn-outline-danger" title="Excluir" onClick={async () => {
                              if(window.confirm('Excluir cronograma permanentemente?')) {
                                await fetch(`/api/cronogramas/${cron._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
                                fetchCronogramas();
                              }
                            }}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                      <h5 className="fw-bold text-orange mb-2">{cron.titulo}</h5>
                      <div className="text-muted small mb-1">Período: {new Date(cron.dataInicio).toLocaleDateString()} a {new Date(cron.dataFim).toLocaleDateString()}</div>
                      <div className="text-blue-dark small mb-4 fw-bold">Alvo: {cron.competicaoAlvo ? new Date(cron.competicaoAlvo).toLocaleDateString() : 'N/A'} | {cron.diasPorSemana} treinos/semana</div>
                      
                      <div className="d-flex gap-3 overflow-auto pb-2">
                        {cron.fases.map((fase, i) => (
                          <div key={i} className="card-flat border bg-light flex-shrink-0" style={{ width: '250px' }}>
                            <div className={`p-2 fw-bold text-white text-center rounded-top ${fase.nome === 'Preparatória' ? 'bg-primary' : fase.nome === 'Competitiva' ? 'bg-danger' : 'bg-success'}`}>
                              {fase.nome}
                            </div>
                            <div className="p-3">
                                <div className="text-muted small mb-2 fw-bold text-center">
                                  {new Date(fase.dataInicio).toLocaleDateString()} - {new Date(fase.dataFim).toLocaleDateString()}
                                </div>
                                <p className="small mb-2 fw-bold text-blue-dark">{fase.semanas} Semanas</p>
                                <p className="small mb-3 text-muted">{fase.objetivo}</p>
                                <div className="small fw-bold text-blue-dark mb-1 border-top pt-2">Treinos Sugeridos:</div>
                                <ul className="small text-muted mb-0 ps-3">
                                  {fase.treinos && fase.treinos.slice(0, 4).map((t, index) => (
                                    <li key={index}>{new Date(t.data).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}: {t.tipo}</li>
                                  ))}
                                  {fase.treinos && fase.treinos.length > 4 && <li>... mais {fase.treinos.length - 4} treinos</li>}
                                </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-5 border rounded-4 bg-light">
                  <i className="bi bi-calendar-event fs-1 d-block mb-3"></i>
                  Nenhum cronograma gerado para esta modalidade.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SportDetail;
