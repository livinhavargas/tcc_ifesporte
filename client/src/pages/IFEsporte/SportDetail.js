import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Analises from './Analises';
import Cronogramas from './Cronogramas';

const SportDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const genero = searchParams.get('genero') || 'Feminino';
  const [students, setStudents] = useState([]);
  
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

  const [view, setView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('alunos');

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

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border)',
    fontSize: '0.8125rem',
    fontFamily: 'var(--font)',
    outline: 'none',
    transition: 'all var(--transition-fast)',
    background: 'var(--bg)',
    minHeight: '38px'
  };

  if (hasHierarchy && view === 'categories') {
    return (
      <Layout>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
              }}>
                <i className="bi bi-trophy"></i>
              </div>
              <div>
                <h1 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>{nome}</h1>
                <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginTop: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {genero}
                </span>
              </div>
            </div>
            <button className="btn btn-secondary rounded-circle" style={{ width: '42px', height: '42px', padding: 0 }} onClick={() => navigate('/esportes')}>
              <i className="bi bi-arrow-left" style={{ fontSize: '1rem' }}></i>
            </button>
          </div>
          
          <div style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.875rem',
            marginBottom: '32px',
            display: 'inline-block'
          }}>
            {countForNode(nome)} {countForNode(nome) === 1 ? 'aluno cadastrado' : 'alunos cadastrados'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.keys(hierarchy[nome]).map(cat => (
              <div key={cat} style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
              }}>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    cursor: 'pointer',
                    background: expandedCategory === cat ? 'var(--bg)' : 'transparent',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>
                      {cat} <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>( {countForNode(`${nome} - ${cat}`)} )</span>
                    </h5>
                  </div>
                  <i className={`bi bi-chevron-${expandedCategory === cat ? 'down' : 'right'}`} style={{ color: 'var(--text-secondary)' }}></i>
                </div>
                
                {expandedCategory === cat && hierarchy[nome][cat].length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-light)' }}>
                    {hierarchy[nome][cat].map(sub => (
                      <div 
                        key={sub} 
                        style={{
                          padding: '14px 24px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-light)'
                        }}
                        className="hover-bg-light"
                        onClick={() => handleCategorySelect(cat, sub)}
                      >
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{sub}</span>
                        <span className="badge bg-secondary" style={{ fontSize: '0.6875rem' }}>{countForNode(`${nome} - ${cat} - ${sub}`)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {expandedCategory === cat && hierarchy[nome][cat].length === 0 && (
                   handleCategorySelect(cat, null)
                )}
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
            }}>
              <i className="bi bi-trophy"></i>
            </div>
            <div>
              <h1 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>{getPageTitle()}</h1>
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginTop: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                {genero}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary rounded-circle" style={{ width: '42px', height: '42px', padding: 0 }} onClick={() => hasHierarchy ? setView('categories') : navigate('/esportes')}>
            <i className="bi bi-arrow-left" style={{ fontSize: '1rem' }}></i>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {/* Sidebar Menu Lateral */}
          <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }} className="d-none-print">
            {[
              { id: 'alunos', label: 'Alunos', icon: 'bi-people' },
              { id: 'analises', label: 'Análises', icon: 'bi-graph-up' },
              { id: 'cronogramas', label: 'Cronogramas', icon: 'bi-calendar-check' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <i className={`bi ${tab.icon}`}></i> {tab.label}
              </button>
            ))}
          </div>

          {/* Dinamic Tab Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {activeTab === 'alunos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Filtros */}
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-xs)',
                  padding: '16px 20px'
                }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px' }}>Pesquisar Atleta</label>
                      <input 
                        type="text" 
                        placeholder="Pesquisar por nome ou matrícula..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={inputStyle}
                      />
                    </div>
                    <div className="col-md-3">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px' }}>Faixa Etária</label>
                      <select value={filterFaixaEtaria} onChange={(e) => setFilterFaixaEtaria(e.target.value)} style={inputStyle}>
                        <option value="Todos">Todos</option>
                        <option value="Menor de idade">Menor de idade</option>
                        <option value="Maior de idade">Maior de idade</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px' }}>Turma</label>
                      <select value={filterTurma} onChange={(e) => setFilterTurma(e.target.value)} style={inputStyle}>
                        <option value="Todas">Todas</option>
                        {['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Lista */}
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>Alunos Cadastrados</h5>
                    <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem' }}>
                      {getFilteredStudents().length} atletas
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                    {getFilteredStudents().length > 0 ? getFilteredStudents().map(aluno => (
                      <div key={aluno._id}
                        onClick={() => navigate(`/alunos/${aluno._id}`)}
                        style={{
                          background: 'var(--bg)',
                          borderRadius: 'var(--radius-md)',
                          padding: '16px',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '130px'
                        }}
                        className="hover-scale-sm"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {aluno.foto ? (
                            <img src={aluno.foto} alt="Perfil" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{
                              width: '42px', height: '42px', borderRadius: '50%',
                              background: 'var(--primary)', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '1rem'
                            }}>
                              {aluno.nome.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 2px', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aluno.nome}</h6>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{aluno.turma || aluno.serie || 'S/ Turma'} {aluno.matricula ? `· ${aluno.matricula}` : ''}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid var(--border-light)', paddingTop: '10px', marginTop: '12px' }}>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                            <i className="bi bi-calendar3 me-1"></i>
                            {aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : 'Sem data'}
                          </span>
                          {aluno.dataNascimento && (
                            <span className="badge" style={{
                              background: isMinor(aluno.dataNascimento) ? 'var(--accent-light)' : 'var(--border)',
                              color: isMinor(aluno.dataNascimento) ? 'var(--accent)' : 'var(--text-secondary)',
                              fontSize: '0.6875rem', fontWeight: 600
                            }}>
                              {isMinor(aluno.dataNascimento) ? 'Menor' : 'Maior'}
                            </span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 16px' }}>
                        <i className="bi bi-search" style={{ fontSize: '2rem', color: 'var(--text-tertiary)', opacity: 0.5, display: 'block', marginBottom: '12px' }}></i>
                        <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Nenhum atleta encontrado</h6>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>Ajuste os filtros ou o termo de pesquisa.</p>
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
                defaultGenero={genero}
              />
            )}
            {activeTab === 'cronogramas' && (
              <Cronogramas modalidade={getCurrentModalidade()} categoria={genero} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SportDetail;
