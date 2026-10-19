import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Users, BarChart3, CalendarClock, Calendar, Search } from 'lucide-react';
import Layout from '../../components/Layout';
import SportIcon from '../../components/SportIcon';
import Analises from './Analises';
import Cronogramas from './Cronogramas';
import { isSportAnalysisSupported } from '../../utils/sportAnalysisRules';
import { isSportScheduleSupported } from '../../utils/sportScheduleRules';
import { getStudentPositionForSport, isSportWithPositions } from '../../utils/sportPositions';
import { apiUrl } from '../../services/api';

const ATLETISMO_CATEGORIAS = [
  {
    id: 'cat1',
    titulo: 'Provas de Velocidade',
    provas: [
      { nome: '100m Rasos', key: '100m' },
      { nome: '200m Rasos', key: '200m' },
      { nome: '400m Rasos', key: '400m' }
    ]
  },
  {
    id: 'cat2',
    titulo: 'Provas com Obstáculos',
    provas: [
      { nome: '100m com Barreiras', key: '100m_barreiras', generoExclusivo: 'Feminino' },
      { nome: '110m com Barreiras', key: '110m_barreiras', generoExclusivo: 'Masculino' },
      { nome: '400m com Barreiras', key: '400m_barreiras' }
    ]
  },
  {
    id: 'cat3',
    titulo: 'Provas de Meio Fundo',
    provas: [
      { nome: '800m Rasos', key: '800m' },
      { nome: '1.500m Rasos', key: '1500m' }
    ]
  },
  {
    id: 'cat4',
    titulo: 'Provas de Fundo',
    provas: [
      { nome: '3.000m Rasos', key: '3000m' },
      { nome: '5.000m Rasos', key: '5000m' },
      { nome: '10.000m Rasos', key: '10000m' }
    ]
  },
  {
    id: 'cat5',
    titulo: 'Provas de Revezamento',
    provas: [
      { nome: '4x100m', key: '4x100' },
      { nome: '4x400m', key: '4x400' }
    ]
  },
  {
    id: 'cat6',
    titulo: 'Provas de Saltos Verticais',
    provas: [
      { nome: 'Salto em Altura', key: 'altura' },
      { nome: 'Salto com Vara', key: 'vara' }
    ]
  },
  {
    id: 'cat7',
    titulo: 'Provas de Saltos Horizontais',
    provas: [
      { nome: 'Salto em Distância', key: 'distancia' },
      { nome: 'Salto Triplo', key: 'triplo' }
    ]
  },
  {
    id: 'cat8',
    titulo: 'Provas de Arremessos e Lançamentos',
    provas: [
      { nome: 'Arremesso de Martelo', key: 'martelo' },
      { nome: 'Arremesso de Peso', key: 'peso' },
      { nome: 'Lançamento de Dardo', key: 'dardo' },
      { nome: 'Lançamento de Disco', key: 'disco' }
    ]
  },
  {
    id: 'cat9',
    titulo: 'Prova Combinada',
    provas: [
      { nome: 'Pentatlo', key: 'pentatlo' }
    ]
  }
];

const is100mBarreiras = (str) => {
  const s = (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s\-_().]/g, '');
  return s.includes('100m') && s.includes('barreira');
};

const is110mBarreiras = (str) => {
  const s = (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s\-_().]/g, '');
  return s.includes('110m') && s.includes('barreira');
};

const SportDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
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

  // Read query params for deep-linking (e.g. from StudentProfile "Criar Análise" or Home Cronogramas)
  const tabParam = searchParams.get('tab');
  const catParam = searchParams.get('cat');
  const subParam = searchParams.get('sub');
  const cronogramaIdParam = searchParams.get('cronogramaId');

  const [generoFilter, setGeneroFilter] = useState(() => {
    const sub = subParam || '';
    if (is100mBarreiras(sub)) return 'Feminino';
    if (is110mBarreiras(sub)) return 'Masculino';
    return 'Geral';
  });
  const [students, setStudents] = useState([]);

  const [view, setView] = useState(() => {
    // If category params or tab params are provided, skip the hierarchy picker
    if (catParam || subParam || tabParam) return 'subcategory_detail';
    return 'categories';
  });

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (catParam || subParam) {
      let matchedCat = catParam;
      if (!matchedCat && subParam) {
        for (const cat of ATLETISMO_CATEGORIAS) {
          if (cat.provas.some(p => p.nome.toLowerCase() === subParam.toLowerCase() || p.key === subParam)) {
            matchedCat = cat.titulo;
            break;
          }
        }
      }
      return { cat: matchedCat || 'Atletismo', sub: subParam || null };
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState(tabParam || 'alunos');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaixaEtaria, setFilterFaixaEtaria] = useState('Todos');
  const [filterTurma, setFilterTurma] = useState('Todas');
  const [filterCidade, setFilterCidade] = useState('Todas');

  const showAnalysesTab = isSportAnalysisSupported(nome);
  const showScheduleTab = isSportScheduleSupported(nome);

  useEffect(() => {
    const sub = selectedCategory?.sub || subParam || '';
    if (is100mBarreiras(sub)) {
      if (generoFilter !== 'Feminino') setGeneroFilter('Feminino');
    } else if (is110mBarreiras(sub)) {
      if (generoFilter !== 'Masculino') setGeneroFilter('Masculino');
    }
  }, [selectedCategory, subParam, generoFilter]);

  useEffect(() => {
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
    if (age === 18) return 'Sub18';
    if (age <= 19) return 'Sub19';
    return `Sub${age}`;
  };

  useEffect(() => {
    fetchStudents();
  }, [nome, selectedCategory]);

  const getCurrentModalidade = () => {
    if (!selectedCategory) return nome;
    if (selectedCategory.sub) return `${nome} - ${selectedCategory.sub}`;
    return `${nome} - ${selectedCategory.cat}`;
  };

  const getPageTitle = () => {
    if (selectedCategory) {
      return selectedCategory.sub ? selectedCategory.sub : selectedCategory.cat;
    }
    return nome;
  };

  const getPageSubtitle = () => {
    if (activeTab === 'analises') {
      return 'Acompanhe e gerencie as análises esportivas desta prova.';
    }
    if (activeTab === 'cronogramas') {
      return 'Consulte e organize os cronogramas desta prova.';
    }
    if (selectedCategory) {
      return `${nome} · ${selectedCategory.cat}`;
    }
    return 'Participantes desta modalidade.';
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(apiUrl('/api/students'), {
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

  const hasHierarchy = nome === 'Atletismo';

  const handleCategorySelect = (catTitulo, subNome) => {
    setSelectedCategory({ cat: catTitulo, sub: subNome });
    setView('subcategory_detail');
    if (is100mBarreiras(subNome)) {
      setGeneroFilter('Feminino');
    } else if (is110mBarreiras(subNome)) {
      setGeneroFilter('Masculino');
    } else {
      setGeneroFilter('Geral');
    }
    setActiveTab('alunos');
  };

  const handleBackToCategories = () => {
    setView('categories');
    setSelectedCategory(null);
    setGeneroFilter('Geral');
  };

  const checkMatch = (esp, keyword) => {
    const normalize = (str) => {
      return (str || '')
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\-_().]/g, '');
    };
    const e = normalize(esp);
    const k = normalize(keyword);
    if (!e || !k) return false;
    if (e === k || e.includes(k) || k.includes(e)) return true;

    // Fallbacks para compatibilidade entre os formatos legados e novos de outros esportes
    if (k.includes('tenisdemesamisto') && e.includes('tenisdemesadupla')) return true;
    if (k.includes('tenisdemesadupla') && e.includes('tenisdemesamisto')) return true;

    // Se a busca é genérica por Atletismo
    const termosAtletismo = [
      'atletismo', 'corrida', 'salto', 'arremesso', 'lancamento', 
      '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', '10000m', 
      'revezamento', 'distancia', 'altura', 'triplo', 'vara', 
      'peso', 'disco', 'dardo', 'martelo', 'pentatlo', 'barreira'
    ];
    if (k === 'atletismo') {
      return termosAtletismo.some(t => e.includes(t));
    }

    // Se é uma categoria inteira de Atletismo (novas ou legadas)
    if (k.includes('velocidade')) {
      return (e.includes('100m') && !e.includes('barreira') && !e.includes('4x100') && !e.includes('10000m')) ||
             e.includes('200m') ||
             (e.includes('400m') && !e.includes('barreira') && !e.includes('4x400'));
    }
    if (k.includes('obstaculo')) {
      return (e.includes('100m') && e.includes('barreira')) ||
             (e.includes('110m') && e.includes('barreira')) ||
             (e.includes('400m') && e.includes('barreira'));
    }
    if (k.includes('meiofundo')) {
      return e.includes('800m') || e.includes('1500m');
    }
    if (k.includes('fundo') && !k.includes('meiofundo')) {
      return e.includes('3000m') || e.includes('5000m') || e.includes('10000m');
    }
    if (k.includes('revezamento')) {
      if (!k.includes('4x100') && !k.includes('4x400')) {
        return e.includes('4x100') || e.includes('4x400') || e.includes('revezamento');
      }
    }
    if (k.includes('saltosverticais')) {
      return e.includes('altura') || e.includes('vara');
    }
    if (k.includes('saltoshorizontais')) {
      return e.includes('distancia') || e.includes('triplo');
    }
    if (k.includes('arremessoselancamentos')) {
      return e.includes('peso') || e.includes('dardo') || e.includes('disco') || e.includes('martelo');
    }
    if (k.includes('provacombinada')) {
      return e.includes('pentatlo');
    }

    // Categorias legadas
    if (k === 'atletismo-corridas' || k === 'corridas') {
      const termos = ['corrida', '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', '10000m', 'revezamento', 'pentatlo', 'barreira'];
      return termos.some(t => e.includes(t));
    }
    if (k === 'atletismo-saltos' || k === 'saltos') {
      const termos = ['salto', 'distancia', 'altura', 'triplo', 'vara'];
      return termos.some(t => e.includes(t));
    }
    if (k.includes('lancamento') || k.includes('arremesso')) {
      if (!k.includes('peso') && !k.includes('disco') && !k.includes('dardo') && !k.includes('martelo')) {
        const termos = ['lancamento', 'arremesso', 'peso', 'disco', 'dardo', 'martelo'];
        return termos.some(t => e.includes(t));
      }
    }

    // Submodalidades específicas de Corridas e Barreiras
    if (k.includes('10000m')) return e.includes('10000m');
    if (k.includes('100m') && k.includes('barreira')) return e.includes('100m') && e.includes('barreira');
    if (k.includes('110m') && k.includes('barreira')) return e.includes('110m') && e.includes('barreira');
    if (k.includes('400m') && k.includes('barreira')) return e.includes('400m') && e.includes('barreira');
    if (k.includes('4x100') || (k.includes('revezamento') && k.includes('100m'))) return e.includes('4x100') || (e.includes('revezamento') && e.includes('100m'));
    if (k.includes('4x400') || (k.includes('revezamento') && k.includes('400m'))) return e.includes('4x400') || (e.includes('revezamento') && e.includes('400m'));
    if (k.includes('pentatlo')) return e.includes('pentatlo');
    if (k.includes('100m') && !k.includes('10000m') && !k.includes('barreira') && !k.includes('4x100')) {
      return e.includes('100m') && !e.includes('10000m') && !e.includes('barreira') && !e.includes('4x100');
    }
    if (k.includes('200m')) return e.includes('200m');
    if (k.includes('400m') && !k.includes('barreira') && !k.includes('4x400')) {
      return e.includes('400m') && !e.includes('barreira') && !e.includes('4x400');
    }
    if (k.includes('800m')) return e.includes('800m');
    if (k.includes('1500m')) return e.includes('1500m');
    if (k.includes('3000m')) return e.includes('3000m');
    if (k.includes('5000m')) return e.includes('5000m');

    // Submodalidades específicas de Saltos
    if (k.includes('distancia')) return e.includes('distancia');
    if (k.includes('altura')) return e.includes('altura');
    if (k.includes('triplo')) return e.includes('triplo');
    if (k.includes('vara')) return e.includes('vara');

    // Submodalidades específicas de Arremessos e Lançamentos
    if (k.includes('peso')) return e.includes('peso');
    if (k.includes('disco')) return e.includes('disco');
    if (k.includes('dardo')) return e.includes('dardo');
    if (k.includes('martelo')) return e.includes('martelo');

    return false;
  };

  const countForNode = (keyword) => {
    return students.filter(s => {
      if (is100mBarreiras(keyword) && s.sexo !== 'Feminino') return false;
      if (is110mBarreiras(keyword) && s.sexo !== 'Masculino') return false;
      const arr = s.modalidades?.length > 0 ? s.modalidades : (s.esportes || []);
      return arr.some(esp => checkMatch(esp, keyword));
    }).length;
  };

  const getFilteredStudents = () => {
    let keyword = nome;
    const subName = selectedCategory?.sub || '';
    if (selectedCategory) {
      keyword = selectedCategory.sub ? `${nome} - ${selectedCategory.sub}` : `${nome} - ${selectedCategory.cat}`;
    }
    let filtered = students.filter(s => {
      if (is100mBarreiras(subName)) {
        if (s.sexo !== 'Feminino') return false;
      } else if (is110mBarreiras(subName)) {
        if (s.sexo !== 'Masculino') return false;
      } else if (generoFilter !== 'Geral' && s.sexo !== generoFilter) {
        return false;
      }
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
        if (filterFaixaEtaria === 'Sub18') return age === 18;
        if (filterFaixaEtaria === 'Sub19') return age >= 19;
        return false;
      });
    }
    if (filterCidade !== 'Todas') {
      const mainCities = [
        'araranguá',
        'balneário arroio do silva',
        'balneário gaivota',
        'ermo',
        'jacinto machado',
        'maracajá',
        'meleiro',
        'morro grande',
        'passo de torres',
        'praia grande',
        'santa rosa do sul',
        'são joão do sul',
        'sombrio',
        'timbé do sul',
        'torres',
        'turvo'
      ];
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

  const currentSub = selectedCategory?.sub || '';
  const isOnlyFeminino = is100mBarreiras(currentSub);
  const isOnlyMasculino = is110mBarreiras(currentSub);
  const genderOptions = isOnlyFeminino 
    ? ['Feminino'] 
    : isOnlyMasculino 
      ? ['Masculino'] 
      : ['Geral', 'Feminino', 'Masculino'];

  if (hasHierarchy && view === 'categories') {
    return (
      <Layout>
        <div style={{ width: '100%', maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <SportIcon sport={nome} size={24} />
              </div>
              <div>
                <h2 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.375rem', lineHeight: 1.2 }}>{nome}</h2>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0', lineHeight: 1.3 }}>Escolha uma submodalidade.</p>
              </div>
            </div>
            <button 
              className="btn btn-secondary rounded-circle" 
              style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
              onClick={() => navigate('/esportes')}
              title="Voltar para Esportes"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
          
          {/* Alunos Cadastrados Indicator */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            borderRadius: '9999px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontWeight: 600,
            fontSize: '0.8125rem',
            marginBottom: '28px',
            border: '1px solid rgba(30, 94, 255, 0.12)',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <Users size={15} style={{ flexShrink: 0 }} />
            <span>{countForNode(nome)} {countForNode(nome) === 1 ? 'aluno cadastrado' : 'alunos cadastrados'}</span>
          </div>

          {/* Categorias do Atletismo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {ATLETISMO_CATEGORIAS.map(cat => (
              <div key={cat.id} className="atletismo-category-card-group">
                <div className="atletismo-category-card-header">
                  <h3 className="atletismo-category-title">{cat.titulo}</h3>
                </div>
                <div className="atletismo-vertical-list">
                  {cat.provas.map(prova => (
                    <div
                      key={prova.nome}
                      className="atletismo-subitem-row-item"
                      onClick={() => handleCategorySelect(cat.titulo, prova.nome)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCategorySelect(cat.titulo, prova.nome);
                        }
                      }}
                    >
                      <div className="atletismo-subitem-info">
                        <span className="atletismo-subitem-name">{prova.nome}</span>
                        {prova.generoExclusivo && (
                          <span className={`atletismo-gender-badge ${prova.generoExclusivo.toLowerCase()}`}>
                            {prova.generoExclusivo}
                          </span>
                        )}
                      </div>
                      <div className="chevron-box">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ width: '100%', maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <SportIcon sport={nome} size={24} />
            </div>
            <div>
              <h2 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.375rem', lineHeight: 1.2 }}>{getPageTitle()}</h2>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0', lineHeight: 1.3 }}>
                {getPageSubtitle()}
              </p>
            </div>
          </div>
          <button 
            className="btn btn-secondary rounded-circle" 
            style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
            onClick={() => hasHierarchy ? handleBackToCategories() : navigate('/esportes')}
            title={hasHierarchy ? `Voltar para ${nome}` : "Voltar para Esportes"}
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Top Horizontal Section Tabs */}
        {(showAnalysesTab || showScheduleTab) && (
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '16px',
            flexWrap: 'wrap'
          }} className="d-none-print">
            {[
              { id: 'alunos', label: 'Participantes', icon: <Users size={18} /> },
              showAnalysesTab && { id: 'analises', label: 'Análises', icon: <BarChart3 size={18} /> },
              showScheduleTab && { id: 'cronogramas', label: 'Cronogramas', icon: <CalendarClock size={18} /> }
            ].filter(Boolean).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                  background: activeTab === tab.id ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.icon} <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Gender Segmented Control */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-full)',
            padding: '4px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)'
          }}>
            {genderOptions.map(g => (
              <button
                key={g}
                onClick={() => setGeneroFilter(g)}
                style={{
                  padding: '8px 24px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontFamily: 'var(--font)',
                  fontWeight: generoFilter === g ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: genderOptions.length === 1 ? 'default' : 'pointer',
                  transition: 'all var(--transition-base)',
                  background: generoFilter === g ? 'var(--primary-light)' : 'transparent',
                  color: generoFilter === g ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                <span>{g}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Tab Content */}
        <div style={{ width: '100%' }}>
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
                        <option value="Sub18">Sub18</option>
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
                        {[
                          'Araranguá',
                          'Balneário Arroio do Silva',
                          'Balneário Gaivota',
                          'Ermo',
                          'Jacinto Machado',
                          'Maracajá',
                          'Meleiro',
                          'Morro Grande',
                          'Passo de Torres',
                          'Praia Grande',
                          'Santa Rosa do Sul',
                          'São João do Sul',
                          'Sombrio',
                          'Timbé do Sul',
                          'Torres',
                          'Turvo',
                          'Outra'
                        ].map(c => (
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
                    <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>Participantes</h5>
                    <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem' }}>
                      {getFilteredStudents().length} {getFilteredStudents().length === 1 ? 'atleta' : 'atletas'}
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
                            {isSportWithPositions(nome) && (
                              <div style={{ marginTop: '4px' }}>
                                <span className="badge" style={{
                                  background: (getStudentPositionForSport(aluno, nome) === 'Indefinido' || getStudentPositionForSport(aluno, nome) === 'Não sei') ? 'var(--border-light)' : 'var(--primary-light)',
                                  color: (getStudentPositionForSport(aluno, nome) === 'Indefinido' || getStudentPositionForSport(aluno, nome) === 'Não sei') ? 'var(--text-tertiary)' : 'var(--primary)',
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                  padding: '2px 8px'
                                }}>
                                  {getStudentPositionForSport(aluno, nome) || 'Indefinido'}
                                </span>
                              </div>
                            )}
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
                defaultGenero={generoFilter}
              />
            )}
            {activeTab === 'cronogramas' && (
              <Cronogramas 
                modalidade={getCurrentModalidade()} 
                categoria={generoFilter} 
                cronogramaId={cronogramaIdParam}
              />
            )}
          </div>
        </div>
    </Layout>
  );
};

export default SportDetail;
