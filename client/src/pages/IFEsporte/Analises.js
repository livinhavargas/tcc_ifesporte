import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import SportIcon from '../../components/SportIcon';
import { addNotification } from '../../utils/notifications';
import { apiUrl } from '../../services/api';
import { 
  Plus, Search, Trophy, Calendar, Edit2, Trash2, 
  CheckCircle2, XCircle, MinusCircle, Medal, Timer, ArrowLeft,
  Activity, ArrowRight, ChevronRight, BarChart3
} from 'lucide-react';

const MODALIDADES_INDIVIDUAIS = [
  { id: 'atletismo', nome: 'Atletismo' },
  { id: 'badminton', nome: 'Badminton' },
  { id: 'tenis-de-mesa', nome: 'Tênis de Mesa' },
  { id: 'xadrez', nome: 'Xadrez' }
];

const MODALIDADES_EQUIPE = [
  { id: 'basquete', nome: 'Basquete' },
  { id: 'futsal', nome: 'Futsal' },
  { id: 'futebol', nome: 'Futebol' },
  { id: 'handebol', nome: 'Handebol' },
  { id: 'voleibol', nome: 'Voleibol' },
  { id: 'volei-praia', nome: 'Vôlei de Praia' }
];

const ALL_MODALIDADES = [...MODALIDADES_INDIVIDUAIS, ...MODALIDADES_EQUIPE];

const normalize = (str) => {
  return (str || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const getCategoryGroup = (str) => {
  const norm = normalize(str);
  if (norm.startsWith('fem')) return 'Feminino';
  if (norm.startsWith('masc')) return 'Masculino';
  return 'Geral';
};

const Analises = ({ initialSport = null, defaultModalidade = null, defaultGenero = null, embebed = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selected modality and category state
  const queryMod = defaultModalidade || searchParams.get('modalidade') || initialSport || '';
  const queryGen = defaultGenero || searchParams.get('genero') || searchParams.get('categoria') || 'Geral';

  const [selectedModalidade, setSelectedModalidade] = useState(queryMod);
  const [selectedGenero, setSelectedGenero] = useState(queryGen);
  const [searchTerm, setSearchTerm] = useState('');

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state if query params or props change
  useEffect(() => {
    const mod = defaultModalidade || searchParams.get('modalidade') || initialSport || '';
    const gen = defaultGenero || searchParams.get('genero') || searchParams.get('categoria') || 'Geral';
    if (mod) setSelectedModalidade(mod);
    if (gen) setSelectedGenero(gen);
  }, [searchParams, defaultModalidade, defaultGenero, initialSport]);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/analysis'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
      }
    } catch (err) {
      console.error('Erro ao buscar análises:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSport = (sportName, gender = selectedGenero) => {
    setSelectedModalidade(sportName);
    setSelectedGenero(gender);
    if (!embebed) {
      setSearchParams({ modalidade: sportName, genero: gender });
    }
  };

  const handleClearSport = () => {
    setSelectedModalidade('');
    if (!embebed) {
      setSearchParams({});
    }
  };

  const handleGenderChange = (gender) => {
    setSelectedGenero(gender);
    if (selectedModalidade && !embebed) {
      setSearchParams({ modalidade: selectedModalidade, genero: gender });
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir esta análise esportiva?')) return;
    try {
      const res = await fetch(apiUrl(`/api/analysis/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setAnalyses(prev => prev.filter(a => a._id !== id));
        addNotification('Análise Excluída', 'A análise esportiva foi removida com sucesso.');
      }
    } catch (err) {
      console.error('Erro ao excluir análise:', err);
    }
  };

  // Filter analyses for the active modality and category
  const filteredAnalyses = analyses.filter(a => {
    if (!selectedModalidade) return true;

    // Split target into base and submodality (e.g. "Atletismo - Corridas - 200m")
    const parts = selectedModalidade.split(' - ').map(s => s.trim());
    const baseTarget = normalize(parts[0]);
    const normAnalysisMod = normalize(a.modalidade || '');
    
    // 1. Base sport must match
    const baseMatches = normAnalysisMod === baseTarget || 
                        normAnalysisMod.includes(baseTarget) || 
                        baseTarget.includes(normAnalysisMod);
    if (!baseMatches) return false;

    // 2. If target specifies a submodality/prova (e.g. "200m" or "Salto em distância")
    if (parts.length > 1) {
      const specificTarget = normalize(parts.length > 2 ? parts[2] : parts[1]).replace(/[\s_-]/g, '');
      const analysisSub = normalize(a.subtipoProva || '').replace(/[\s_-]/g, '');
      const analysisModRaw = normalize(a.modalidade || '').replace(/[\s_-]/g, '');

      if (analysisSub) {
        const subMatches = analysisSub === specificTarget || 
                           analysisSub.includes(specificTarget) || 
                           specificTarget.includes(analysisSub);
        if (!subMatches) return false;
      } else if (analysisModRaw.includes(' - ')) {
        if (!analysisModRaw.includes(specificTarget)) return false;
      }
    }

    // Filter by gender tab (Geral, Feminino, Masculino)
    if (selectedGenero && selectedGenero !== 'Todas') {
      const categoryGroup = getCategoryGroup(a.categoria);
      const selectedGroup = getCategoryGroup(selectedGenero);
      if (categoryGroup !== selectedGroup) {
        return false;
      }
    }

    // Filter by search term
    if (searchTerm) {
      const term = normalize(searchTerm);
      const opp = normalize(a.equipeAdversaria);
      const sub = normalize(a.subtipoProva);
      const athlete = normalize(a.aluno?.nome);
      return opp.includes(term) || sub.includes(term) || athlete.includes(term);
    }

    return true;
  });

  const vitoriasCount = filteredAnalyses.filter(a => a.resultado === 'Vitória').length;

  // Get total analysis count for each modality in hub
  const getAnalysisCountForSport = (sportName) => {
    const normSport = normalize(sportName);
    return analyses.filter(a => {
      const normAnalysisSport = normalize(a.modalidade);
      return normAnalysisSport.includes(normSport) || normSport.includes(normAnalysisSport);
    }).length;
  };

  const renderAnalysisCards = (isAtletismo) => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
        </div>
      );
    }

    if (filteredAnalyses.length === 0) {
      return (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px dashed var(--border)',
          padding: '56px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--primary-light)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <SportIcon sport={selectedModalidade} size={32} />
          </div>
          <h4 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '6px', fontSize: '1.125rem' }}>
            Nenhuma análise realizada
          </h4>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 24px' }}>
            {searchTerm 
              ? `Nenhum registro encontrado para "${searchTerm}". Tente alterar o termo de busca.`
              : `Ainda não existem registros técnicos para ${selectedModalidade}${selectedGenero && selectedGenero !== 'Geral' ? ` (${selectedGenero})` : ''}.`}
          </p>
          <Link
            to={`/analises/nova?modalidade=${encodeURIComponent(selectedModalidade)}&genero=${encodeURIComponent(selectedGenero === 'Geral' ? 'Geral' : selectedGenero)}`}
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontWeight: 700, borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Criar primeira análise
          </Link>
        </div>
      );
    }

    return (
      <div className="row g-3">
        {filteredAnalyses.map(analysis => {
          const res = analysis.resultado;
          const placar = analysis.placar;
          const placarText = typeof placar === 'object' && placar !== null 
            ? `${placar.nos || 0} x ${placar.adv || 0}`
            : (placar || '-');

          const isEmpate = analysis.resultado === 'Empate' || (
            typeof placar === 'object' && placar !== null && placar.nos !== undefined && placar.nos === placar.adv
          );
          const tieNos = analysis.dadosEspecificos?.penaltisAcertos ?? analysis.dadosEspecificos?.desempateSeteMetrosAcertos;
          const tieAdv = analysis.dadosEspecificos?.penaltisErros ?? analysis.dadosEspecificos?.desempateSeteMetrosErros;
          const hasTiebreaker = Boolean(
            isEmpate &&
            tieNos !== undefined &&
            tieNos !== null &&
            tieAdv !== undefined &&
            tieAdv !== null &&
            (analysis.dadosEspecificos?.foiParaPenaltis || (tieNos > 0 || tieAdv > 0) || analysis.dadosEspecificos?.desempateSeteMetrosAcertos !== undefined)
          );

          return (
            <div key={analysis._id} className="col-12 col-md-6 col-lg-4">
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                padding: '20px',
                boxShadow: 'var(--shadow-xs)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                transition: 'all var(--transition-fast)'
              }}
              className="hover-lift"
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                        {analysis.categoria || 'Geral'}
                      </span>
                      <h6 style={{ fontWeight: 800, color: 'var(--text)', margin: '2px 0 0', fontSize: '1rem' }}>
                        {analysis.subtipoProva || (analysis.equipeAdversaria ? `vs ${analysis.equipeAdversaria}` : analysis.modalidade)}
                      </h6>
                    </div>

                    {/* Status Badge */}
                    {!isAtletismo && res && (
                      <span className="badge" style={{
                        background: res === 'Vitória' ? 'var(--success-light)' : res === 'Derrota' ? 'var(--error-light)' : 'var(--warning-light)',
                        color: res === 'Vitória' ? 'var(--success-text)' : res === 'Derrota' ? 'var(--error-text)' : 'var(--warning-text)',
                        border: `1px solid ${res === 'Vitória' ? 'rgba(52,211,153,0.3)' : res === 'Derrota' ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        padding: '4px 8px'
                      }}>
                        {res === 'Vitória' && <CheckCircle2 size={13} />}
                        {res === 'Derrota' && <XCircle size={13} />}
                        {res === 'Empate' && <MinusCircle size={13} />}
                        {res}
                      </span>
                    )}

                    {isAtletismo && (
                      <span className="badge" style={{
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}>
                        <Medal size={12} className="me-1" />
                        {analysis.dadosEspecificos?.colocacao || 'Participação'}
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  {!isAtletismo ? (
                    <div style={{ marginBottom: '16px' }}>
                      {analysis.equipeAdversaria && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          Adversário: <strong style={{ color: 'var(--text)' }}>{analysis.equipeAdversaria}</strong>
                        </div>
                      )}
                      {analysis.modalidade?.toLowerCase() !== 'xadrez' && placarText !== '-' && (
                        <div style={{
                          background: 'var(--bg)',
                          borderRadius: 'var(--radius-md)',
                          padding: '8px 12px',
                          fontWeight: 900,
                          fontSize: '1.125rem',
                          color: 'var(--primary)',
                          display: 'inline-block',
                          marginTop: '2px'
                        }}>
                          Placar: {placarText}
                          {hasTiebreaker && (
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: '8px' }}>
                              (Desempate: {tieNos} x {tieAdv})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Atleta: <strong style={{ color: 'var(--text)' }}>{analysis.aluno?.nome || (analysis.atletas?.length ? `${analysis.atletas.length} atletas` : '-')}</strong>
                      </div>
                      {analysis.dadosEspecificos?.tempo && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <Timer size={14} style={{ color: 'var(--primary)' }} />
                          <span>Tempo: <strong>{analysis.dadosEspecificos.tempo}</strong></span>
                        </div>
                      )}
                      {analysis.dadosEspecificos?.maiorAltura && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Altura: <strong>{analysis.dadosEspecificos.maiorAltura}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    {new Date(analysis.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => navigate(`/analises/${analysis._id}`)}
                      className="btn btn-sm btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>Visualizar</span>
                      <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() => navigate(`/analises/editar/${analysis._id}`)}
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Editar Análise"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(analysis._id, e)}
                      className="btn btn-sm text-danger"
                      style={{ padding: '4px 6px', background: 'transparent', border: 'none' }}
                      title="Excluir Análise"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: HUB DE SELEÇÃO DE MODALIDADES (Modo Standalone /analises)
  // ─────────────────────────────────────────────────────────────
  const renderHub = () => (
    <div style={{ width: '100%', maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Trophy size={22} />
            </div>
            <h1 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
              Análises Esportivas
            </h1>
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0 50px' }}>
            Selecione uma modalidade para gerenciar relatórios, desempenhos técnicos e registros de jogos.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '10px 20px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Activity size={18} style={{ color: 'var(--primary)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total no Sistema
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text)' }}>
              {analyses.length} {analyses.length === 1 ? 'Análise' : 'Análises'}
            </div>
          </div>
        </div>
      </div>

      {/* Modalidades em Equipe */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: 'var(--primary)' }}></div>
          <h4 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.0625rem' }}>
            Modalidades Coletivas / em Equipe
          </h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
          {MODALIDADES_EQUIPE.map(mod => {
            const count = getAnalysisCountForSport(mod.nome);
            return (
              <div
                key={mod.id}
                onClick={() => handleSelectSport(mod.nome, 'Geral')}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '24px 20px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="hover-lift"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{
                      width: '56px', height: '56px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <SportIcon sport={mod.nome} size={28} />
                    </div>

                    <span className="badge" style={{
                      background: count > 0 ? 'var(--primary-light)' : 'var(--bg)',
                      color: count > 0 ? 'var(--primary)' : 'var(--text-tertiary)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {count} {count === 1 ? 'análise' : 'análises'}
                    </span>
                  </div>

                  <h5 style={{ fontWeight: 800, color: 'var(--text)', margin: '0 0 6px 0', fontSize: '1.125rem' }}>
                    {mod.nome}
                  </h5>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>
                    Relatórios táticos, pontuação e escalação por categoria.
                  </p>
                </div>

                <div style={{
                  marginTop: '20px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  <span>Acessar modalidade</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modalidades Individuais */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: 'var(--accent)' }}></div>
          <h4 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.0625rem' }}>
            Modalidades Individuais
          </h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
          {MODALIDADES_INDIVIDUAIS.map(mod => {
            const count = getAnalysisCountForSport(mod.nome);
            return (
              <div
                key={mod.id}
                onClick={() => handleSelectSport(mod.nome, 'Geral')}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '24px 20px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="hover-lift"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{
                      width: '56px', height: '56px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--accent-light)',
                      color: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <SportIcon sport={mod.nome} size={28} />
                    </div>

                    <span className="badge" style={{
                      background: count > 0 ? 'var(--accent-light)' : 'var(--bg)',
                      color: count > 0 ? 'var(--accent)' : 'var(--text-tertiary)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {count} {count === 1 ? 'análise' : 'análises'}
                    </span>
                  </div>

                  <h5 style={{ fontWeight: 800, color: 'var(--text)', margin: '0 0 6px 0', fontSize: '1.125rem' }}>
                    {mod.nome}
                  </h5>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>
                    Provas, tempos, alturas e registros individuais dos atletas.
                  </p>
                </div>

                <div style={{
                  marginTop: '20px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--accent)',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  <span>Acessar modalidade</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // RENDER: VISUALIZAÇÃO EMBUTIDA (Portal Treinador > Esportes > Modalidade)
  // Sem duplicação de cabeçalho, sem seletor de modalidade, sem filtro de gênero duplicado
  // ─────────────────────────────────────────────────────────────
  const renderEmbeddedView = () => {
    const isAtletismo = normalize(selectedModalidade).includes('atletismo');

    return (
      <div style={{ width: '100%' }}>
        {/* Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} style={{ color: 'var(--primary)' }} />
            <span>Análises Esportivas</span>
          </h5>
          <Link
            to={`/analises/nova?modalidade=${encodeURIComponent(selectedModalidade)}&genero=${encodeURIComponent(selectedGenero === 'Geral' ? 'Geral' : selectedGenero)}`}
            className="btn btn-primary"
            style={{ padding: '8px 18px', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Nova Análise
          </Link>
        </div>

        {/* Resumo / KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: !isAtletismo ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '20px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Trophy size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Análises Realizadas
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                {filteredAnalyses.length}
              </div>
            </div>
          </div>

          {!isAtletismo && (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              padding: '20px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                background: 'var(--success-light)', color: 'var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Vitórias Registradas
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                  {vitoriasCount}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Filter Bar */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '14px 18px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-control"
              placeholder={`Buscar análises de ${selectedModalidade} por adversário ou prova...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {/* Lista de Análises */}
        {renderAnalysisCards(isAtletismo)}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: PÁGINA CONTEXTUALIZADA DA MODALIDADE (Modo Standalone /analises?modalidade=...)
  // ─────────────────────────────────────────────────────────────
  const renderModalityPage = () => {
    const isAtletismo = normalize(selectedModalidade).includes('atletismo');

    return (
      <div style={{ width: '100%', maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        {/* Breadcrumb Contextual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
          <button 
            onClick={handleClearSport}
            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}
          >
            Análises Esportivas
          </button>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{selectedModalidade}</span>
          <span>/</span>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedGenero}</span>
        </div>

        {/* Top Header da Modalidade */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="btn btn-secondary rounded-circle"
              style={{ width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleClearSport}
              title="Voltar para todas as modalidades"
            >
              <ArrowLeft size={18} />
            </button>

            <div style={{
              width: '54px', height: '54px', borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <SportIcon sport={selectedModalidade} size={28} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
                  {selectedModalidade}
                </h1>
                <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem' }}>
                  {selectedGenero}
                </span>
              </div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
                Acompanhe os registros, resultados e análises técnicas exclusivas desta modalidade.
              </p>
            </div>
          </div>

          <Link
            to={`/analises/nova?modalidade=${encodeURIComponent(selectedModalidade)}&genero=${encodeURIComponent(selectedGenero === 'Geral' ? 'Geral' : selectedGenero)}`}
            className="btn btn-primary"
            style={{ padding: '10px 22px', borderRadius: 'var(--radius-md)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Nova Análise
          </Link>
        </div>

        {/* Category / Gender Selector Chips */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-card)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)'
          }}>
            {['Geral', 'Feminino', 'Masculino'].map(gen => (
              <button
                key={gen}
                onClick={() => handleGenderChange(gen)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontFamily: 'var(--font)',
                  fontWeight: selectedGenero === gen ? 700 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  background: selectedGenero === gen ? 'var(--primary)' : 'transparent',
                  color: selectedGenero === gen ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {gen}
              </button>
            ))}
          </div>

          {/* Quick Switch Sport Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Trocar Modalidade:</span>
            <select
              className="form-select form-select-sm"
              value={selectedModalidade}
              onChange={(e) => handleSelectSport(e.target.value, selectedGenero)}
              style={{ width: 'auto', minWidth: '160px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
            >
              {ALL_MODALIDADES.map(m => (
                <option key={m.id} value={m.nome}>{m.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumo / KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: !isAtletismo ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '20px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Trophy size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Análises Realizadas
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                {filteredAnalyses.length}
              </div>
            </div>
          </div>

          {!isAtletismo && (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              padding: '20px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                background: 'var(--success-light)', color: 'var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Vitórias Registradas
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                  {vitoriasCount}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Filter Bar */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '14px 18px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-control"
              placeholder={`Buscar análises de ${selectedModalidade} por adversário ou prova...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {/* Lista de Análises da Modalidade */}
        {renderAnalysisCards(isAtletismo)}
      </div>
    );
  };

  // If embedded in another page (e.g. SportDetail), return content directly
  if (embebed) {
    return renderEmbeddedView();
  }

  return (
    <Layout>
      {selectedModalidade ? renderModalityPage() : renderHub()}
    </Layout>
  );
};

export default Analises;
