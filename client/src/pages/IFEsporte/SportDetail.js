import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, Users, BarChart3, CalendarClock, Calendar, Search } from 'lucide-react';
import Layout from '../../components/Layout';
import SportIcon from '../../components/SportIcon';
import Analises from './Analises';
import Cronogramas from './Cronogramas';
import { isSportAnalysisSupported } from '../../utils/sportAnalysisRules';
import { isSportScheduleSupported } from '../../utils/sportScheduleRules';

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
    'voleibol': 'Voleibol',
    'volei-quadra': 'Voleibol',
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
  const [filterCidade, setFilterCidade] = useState('Todas');

  const showAnalysesTab = isSportAnalysisSupported(nome);
  const showScheduleTab = isSportScheduleSupported(nome);

  React.useEffect(() => {
    if (!showAnalysesTab && activeTab === 'analises') {
      setActiveTab('alunos');
    }
    if (!showScheduleTab && activeTab === 'cronogramas') {
      setActiveTab('alunos');
    }
  }, [showAnalysesTab, showScheduleTab, activeTab]);

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getAgeCategoryLabel = (dob) => {
    const age = calculateAge(dob);
    if (age === null) return '-';
    if (age <= 15) return 'Sub15';
    if (age === 16) return 'Sub16';
    if (age === 17) return 'Sub17';
    if (age <= 19) return 'Sub19';
    return `Sub${age}`;
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
      'Corridas': ['100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', 'Revezamento 4x100', 'Revezamento 4x400', 'Pentatlo', '100m com Barreiras', '110m com Barreiras'],
      'Saltos': ['Distância', 'Altura', 'Triplo'],
      'Lançamentos': ['Peso', 'Disco', 'Dardo']
    },
    'Tênis de Mesa': {
      'Individual': [],
      'Misto': []
    }
  };

  const hasHierarchy = hierarchy[nome] !== undefined;

  const handleCategorySelect = (cat, sub) => {
    setSelectedCategory({ cat, sub });
    setView('subcategory_detail');
    setActiveTab('alunos');
  };

  const checkMatch = (esp, keyword) => {
    const normalize = (str) => {
      return (str || '')
        .toLowerCase()
        .replace(/[\s-()]/g, '');
    };
    const e = normalize(esp);
    const k = normalize(keyword);
    if (e.includes(k)) return true;

    // Fallbacks para compatibilidade entre os formatos legados e novos
    if (k.includes('tênisdemesamisto') && e.includes('tênisdemesadupla')) return true;
    if (k.includes('tênisdemesadupla') && e.includes('tênisdemesamisto')) return true;
    
    const parts = (keyword || '').split('-').map(p => p.trim());
    const kLower = (keyword || '').toLowerCase();
    const eLower = (esp || '').toLowerCase();
    
    if (kLower === 'atletismo') {
      const termos = ['atletismo', 'corrida', 'salto', 'arremesso', 'lançamento', '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', 'revezamento', 'distância', 'altura', 'triplo', 'peso', 'disco', 'dardo'];
      return termos.some(t => eLower.includes(t));
    }
    
    if (parts.length === 2 && parts[0].toLowerCase() === 'atletismo') {
      const cat = parts[1].toLowerCase();
      if (cat.includes('corrida')) {
        const termos = ['corrida', '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', 'revezamento'];
        return termos.some(t => eLower.includes(t));
      }
      if (cat.includes('salto')) {
        const termos = ['salto', 'distância', 'altura', 'triplo'];
        return termos.some(t => eLower.includes(t));
      }
      if (cat.includes('lançamento') || cat.includes('arremesso')) {
        const termos = ['lançamento', 'arremesso', 'peso', 'disco', 'dardo'];
        return termos.some(t => eLower.includes(t));
      }
    }
    
    if (parts.length === 3 && parts[0].toLowerCase() === 'atletismo') {
      const leaf = parts[2].toLowerCase();
      if (eLower.includes(leaf)) return true;
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
    if (filterFaixaEtaria !== 'Todos') {
      filtered = filtered.filter(s => {
        const age = calculateAge(s.dataNascimento);
        if (age === null) return false;
        if (filterFaixaEtaria === 'Sub15') return age <= 15;
        if (filterFaixaEtaria === 'Sub16') return age === 16;
        if (filterFaixaEtaria === 'Sub17') return age === 17;
        if (filterFaixaEtaria === 'Sub19') return age === 18 || age === 19;
        return false;
      });
    }
    if (filterCidade !== 'Todas') {
      const mainCities = ['praia grande', 'são joão do sul', 'sombrio', 'balneário gaivota', 'araranguá', 'torres'];
      filtered = filtered.filter(s => {
        const studentCidade = (s.cidade || '').trim().toLowerCase();
        if (filterCidade === 'Outra') {
          return studentCidade !== '' && !mainCities.includes(studentCidade);
        }
        return studentCidade === filterCidade.toLowerCase();
      });
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
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <SportIcon sport={nome} size={28} />
              </div>
              <div>
                <h1 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>{nome}</h1>
                <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginTop: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {genero}
                </span>
              </div>
            </div>
            <button className="btn btn-secondary rounded-circle" style={{ width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => navigate('/esportes')}>
              <ArrowLeft size={18} />
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
                  {expandedCategory === cat ? <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />}
                </div>
                
                {expandedCategory === cat && hierarchy[nome][cat].length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-light)' }}>
                    {hierarchy[nome][cat].filter(sub => {
                      if (sub === '100m com Barreiras' && genero !== 'Feminino') return false;
                      if (sub === '110m com Barreiras' && genero !== 'Masculino') return false;
                      return true;
                    }).map(sub => (
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
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <SportIcon sport={nome} size={28} />
            </div>
            <div>
              <h1 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>{getPageTitle()}</h1>
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginTop: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                {genero}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary rounded-circle" style={{ width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => hasHierarchy ? setView('categories') : navigate('/esportes')}>
            <ArrowLeft size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {/* Sidebar Menu Lateral */}
          <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }} className="d-none-print">
            {[
              { id: 'alunos', label: 'Alunos', icon: <Users size={18} /> },
              showAnalysesTab && { id: 'analises', label: 'Análises', icon: <BarChart3 size={18} /> },
              showScheduleTab && { id: 'cronogramas', label: 'Cronogramas', icon: <CalendarClock size={18} /> }
            ].filter(Boolean).map(tab => (
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
                {tab.icon} {tab.label}
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
                    <div className="col-md-3">
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
                        <option value="Sub15">Sub15</option>
                        <option value="Sub16">Sub16</option>
                        <option value="Sub17">Sub17</option>
                        <option value="Sub19">Sub19</option>
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
                    <div className="col-md-3">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px' }}>Cidade</label>
                      <select value={filterCidade} onChange={(e) => setFilterCidade(e.target.value)} style={inputStyle}>
                        <option value="Todas">Todas</option>
                        {['Praia Grande', 'São João do Sul', 'Sombrio', 'Balneário Gaivota', 'Araranguá', 'Torres', 'Outra'].map(c => (
                          <option key={c} value={c}>{c}</option>
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
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            <span>{aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : 'Sem data'}</span>
                          </span>
                          {aluno.dataNascimento && (
                            <span className="badge" style={{
                              background: 'var(--accent-light)',
                              color: 'var(--accent)',
                              fontSize: '0.6875rem', fontWeight: 600
                            }}>
                              {getAgeCategoryLabel(aluno.dataNascimento)}
                            </span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Search size={36} style={{ color: 'var(--text-tertiary)', opacity: 0.5, marginBottom: '12px' }} />
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
