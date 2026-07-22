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

  React.useEffect(() => {
    fetchStudents();
    fetchCronogramas();
  }, [nome, selectedCategory]);

  const getCurrentModalidade = () => {
    return selectedCategory ? (selectedCategory.sub ? `${nome} - ${selectedCategory.cat} - ${selectedCategory.sub}` : `${nome} - ${selectedCategory.cat}`) : nome;
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
      'Corridas': ['100 metros rasos', '200 metros rasos', '400 metros rasos', '800 metros meio-fundo', '1500 metros meio-fundo', '3000 metros', '5000 metros', 'Revezamento'],
      'Saltos': ['Distância', 'Altura', 'Triplo'],
      'Lançamentos&Arremessos': ['Peso', 'Disco', 'Dardo']
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

  const countForNode = (keyword) => {
    return students.filter(s => s.sexo === genero && s.esportes && s.esportes.some(esp => esp.includes(keyword))).length;
  };

  const getFilteredStudents = () => {
    let keyword = nome;
    if (selectedCategory) {
      keyword = `${nome} - ${selectedCategory.cat}`;
      if (selectedCategory.sub) keyword += ` - ${selectedCategory.sub}`;
    }
    return students.filter(s => s.sexo === genero && s.esportes && s.esportes.some(esp => esp.includes(keyword)));
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
            <h1 className="fw-bold text-blue-dark mb-0 lh-1">{nome}</h1>
            <div className="text-blue-dark mt-1" style={{ fontSize: '1.2rem' }}>{genero}</div>
          </div>
        </div>
        <div className="d-flex flex-column align-items-end">
          <div className="d-flex align-items-center mb-2">
            <div className="text-end me-3">
              <h4 className="fw-bold text-orange mb-0">{selectedCategory ? selectedCategory.cat : nome}</h4>
              <div className="text-blue-dark fw-bold">{selectedCategory && selectedCategory.sub ? selectedCategory.sub : 'Geral'}</div>
            </div>
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
            <div className="card-flat p-4 shadow-sm border">
              <h4 className="fw-bold text-blue-dark mb-4">Lista de Alunos</h4>
              <div className="d-flex flex-column gap-3">
                {getFilteredStudents().length > 0 ? getFilteredStudents().map(aluno => (
                  <div key={aluno._id} className="d-flex align-items-center p-3 rounded-4 bg-light border cursor-pointer hover-bg-light" onClick={() => navigate(`/alunos/${aluno._id}`)}>
                    {aluno.foto ? (
                      <img src={aluno.foto} alt="Perfil" className="rounded-circle shadow-sm me-3" style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                    ) : (
                      <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 text-orange bg-blue-dark" style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}>
                        {aluno.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h5 className="fw-bold text-blue-dark mb-0">{aluno.nome}</h5>
                      <div className="text-muted small">{aluno.matricula} - {aluno.serie || 'S/ Turma'}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted py-5">
                    Nenhum aluno encontrado para esta modalidade.
                  </div>
                )}
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
                {userType === 'admin' && (
                  <button className="btn btn-primary fw-bold px-4" onClick={async () => {
                    // Gerar cronograma simples
                    const inicio = new Date();
                    const fimPrep = new Date(inicio.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 dias
                    const fimComp = new Date(fimPrep.getTime() + 60 * 24 * 60 * 60 * 1000); // +60 dias
                    const fimTrans = new Date(fimComp.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 dias
                    
                    const novo = {
                      titulo: `Plano de Treinamento - ${new Date().getFullYear()}`,
                      modalidade: getCurrentModalidade(),
                      dataInicio: inicio.toISOString(),
                      dataFim: fimTrans.toISOString(),
                      fases: [
                        { nome: 'Preparatória', dataInicio: inicio, dataFim: fimPrep, objetivo: 'Condicionamento físico e fundamentos básicos.' },
                        { nome: 'Competitiva', dataInicio: fimPrep, dataFim: fimComp, objetivo: 'Tática, jogos treinos e competição alvo.' },
                        { nome: 'Transição', dataInicio: fimComp, dataFim: fimTrans, objetivo: 'Descanso ativo e recuperação.' }
                      ]
                    };

                    try {
                      await fetch('/api/cronogramas', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(novo)
                      });
                      fetchCronogramas();
                    } catch (e) {
                      console.error(e);
                    }
                  }}>
                    <i className="bi bi-magic me-2"></i> Gerar Automático
                  </button>
                )}
              </div>

              {cronogramas.length > 0 ? (
                <div className="d-flex flex-column gap-4">
                  {cronogramas.map(cron => (
                    <div key={cron._id} className="border rounded-4 p-4 position-relative overflow-hidden">
                      <div className="position-absolute top-0 end-0 mt-3 me-3">
                        {userType === 'admin' && (
                          <button className="btn btn-sm btn-outline-danger" onClick={async () => {
                            if(window.confirm('Excluir cronograma?')) {
                              await fetch(`/api/cronogramas/${cron._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
                              fetchCronogramas();
                            }
                          }}>
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                      <h5 className="fw-bold text-orange mb-2">{cron.titulo}</h5>
                      <div className="text-muted small mb-4">Período: {new Date(cron.dataInicio).toLocaleDateString()} a {new Date(cron.dataFim).toLocaleDateString()}</div>
                      
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
                              <p className="small mb-0">{fase.objetivo}</p>
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
