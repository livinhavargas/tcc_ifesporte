import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Calendar, Trophy, ChevronRight, Eye, 
  CheckCircle2, XCircle, MinusCircle, Medal, Timer,
  Activity, MessageSquare, X
} from 'lucide-react';
import Layout from '../../components/Layout';
import SportIcon from '../../components/SportIcon';
import { apiUrl } from '../../services/api';

const normalizeStr = (str) => {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

const getBaseSportName = (modName) => {
  const norm = normalizeStr(modName);
  if (norm.includes('atletismo')) return 'Atletismo';
  if (norm.includes('badminton')) return 'Badminton';
  if (norm.includes('tenis de mesa')) return 'Tênis de Mesa';
  if (norm.includes('xadrez')) return 'Xadrez';
  if (norm.includes('basquete')) return 'Basquete';
  if (norm.includes('futsal')) return 'Futsal';
  if (norm.includes('futebol')) return 'Futebol';
  if (norm.includes('handebol')) return 'Handebol';
  if (norm.includes('volei de praia') || norm.includes('praia')) return 'Vôlei de Praia';
  if (norm.includes('volei') || norm.includes('voleibol')) return 'Voleibol';
  return (modName || '').split(' - ')[0].trim();
};

const StudentAnalises = () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [studentSports, setStudentSports] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [selectedSportTab, setSelectedSportTab] = useState('ALL');
  const [selectedAnalysisModal, setSelectedAnalysisModal] = useState(null);

  useEffect(() => {
    fetchStudentAnalyses();
  }, []);

  const fetchStudentAnalyses = async () => {
    try {
      setLoading(true);

      // 1. Obter dados do estudante (para saber suas modalidades reais)
      const resUser = await fetch(apiUrl(`/api/users/${userId}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = resUser.ok ? await resUser.json() : null;
      const rawSports = userData?.modalidades || userData?.esportes || [];
      
      // Lista de modalidades únicas em que o estudante está cadastrado
      const registeredSports = Array.from(new Set(rawSports.filter(Boolean)));
      setStudentSports(registeredSports);

      if (registeredSports.length === 0) {
        setFilteredAnalyses([]);
        setLoading(false);
        return;
      }

      // 2. Obter todas as análises cadastradas pelos treinadores
      const resAnalysis = await fetch(apiUrl('/api/analysis'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allAnalyses = resAnalysis.ok ? await resAnalysis.json() : [];

      // Mapear esportes-base do estudante
      const studentBaseSports = registeredSports.map(s => normalizeStr(getBaseSportName(s)));
      const studentSpecificSports = registeredSports.map(s => normalizeStr(s));

      // 3. Filtrar estritamente análises pertencentes às modalidades cadastradas do aluno
      const matchedMap = new Map();

      if (Array.isArray(allAnalyses)) {
        allAnalyses.forEach(analysis => {
          if (!analysis || !analysis.modalidade) return;
          const analysisMod = analysis.modalidade;
          const normAnalysisMod = normalizeStr(analysisMod);
          const baseAnalysisMod = normalizeStr(getBaseSportName(analysisMod));

          // Verificar se a modalidade da análise corresponde a alguma modalidade do aluno
          const matches = studentBaseSports.some(bs => bs === baseAnalysisMod || normAnalysisMod.includes(bs) || bs.includes(normAnalysisMod)) ||
                          studentSpecificSports.some(ss => ss === normAnalysisMod || normAnalysisMod.includes(ss) || ss.includes(normAnalysisMod));

          if (matches) {
            // Evitar duplicatas por ID
            if (!matchedMap.has(analysis._id)) {
              matchedMap.set(analysis._id, analysis);
            }
          }
        });
      }

      const matchedList = Array.from(matchedMap.values());
      // Ordenar por data decrescente
      matchedList.sort((a, b) => new Date(b.data || b.createdAt || 0) - new Date(a.data || a.createdAt || 0));

      setFilteredAnalyses(matchedList);
    } catch (err) {
      console.error('Erro ao carregar análises do estudante:', err);
    } finally {
      setLoading(false);
    }
  };

  // Agrupamento por esporte-base para renderização organizada
  const groupedBySport = {};
  filteredAnalyses.forEach(analysis => {
    const baseSport = getBaseSportName(analysis.modalidade);
    if (!groupedBySport[baseSport]) {
      groupedBySport[baseSport] = [];
    }
    groupedBySport[baseSport].push(analysis);
  });

  const availableBaseSports = Object.keys(groupedBySport);

  // Filtragem conforme a aba selecionada (Todas ou Modalidade Específica)
  const displayedSports = selectedSportTab === 'ALL'
    ? availableBaseSports
    : availableBaseSports.filter(s => s === selectedSportTab);

  return (
    <Layout>
      <div style={{ width: '100%', maxWidth: 'var(--content-max-width)', margin: '0 auto', paddingBottom: '40px' }}>
        
        {/* Header Principal da Aba Análises */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BarChart3 size={24} />
              </div>
              <div>
                <h1 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.5rem', letterSpacing: '-0.3px' }}>
                  Análises
                </h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '2px 0 0' }}>
                  Visualize suas análises esportivas e acompanhe o histórico das suas modalidades.
                </p>
              </div>
            </div>
          </div>

          {/* Badge Somente Leitura Informativo */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 16px',
            boxShadow: 'var(--shadow-xs)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Eye size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Modo Visualização
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
          </div>
        ) : studentSports.length === 0 ? (
          /* Estado Vazio: Estudante não tem esportes cadastrados */
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--border)',
            padding: '56px 24px',
            textAlign: 'center',
            maxWidth: '680px',
            margin: '0 auto'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--accent-light)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Trophy size={32} />
            </div>
            <h4 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '8px', fontSize: '1.125rem' }}>
              Nenhuma modalidade vinculada ao seu perfil
            </h4>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', maxWidth: '460px', margin: '0 auto 24px', lineHeight: 1.5 }}>
              Para visualizar suas análises esportivas, você precisa estar cadastrado em pelo menos uma modalidade esportiva no seu perfil.
            </p>
            <Link
              to="/perfil"
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontWeight: 700, borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              Ir para Meu Perfil
            </Link>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          /* Estado Vazio Amigável: Estudante tem esportes, mas treinadores ainda não registraram análises */
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            padding: '56px 28px',
            textAlign: 'center',
            maxWidth: '680px',
            margin: '0 auto'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Activity size={32} />
            </div>
            <h4 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '8px', fontSize: '1.125rem' }}>
              Você ainda não possui análises esportivas disponíveis
            </h4>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.5 }}>
              As análises registradas pelos seus treinadores para as suas modalidades aparecerão aqui assim que forem publicadas.
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              background: 'var(--bg)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Suas modalidades ativas:</span>
              {studentSports.map(s => (
                <span key={s} className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Visualização Organizada por Modalidade */
          <div>
            {/* Filtro por Abas de Modalidade (Se houver mais de 1 modalidade com análises) */}
            {availableBaseSports.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <button
                  onClick={() => setSelectedSportTab('ALL')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    border: selectedSportTab === 'ALL' ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: selectedSportTab === 'ALL' ? 'var(--primary)' : 'var(--bg-card)',
                    color: selectedSportTab === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  Todas ({filteredAnalyses.length})
                </button>
                {availableBaseSports.map(sport => {
                  const count = groupedBySport[sport]?.length || 0;
                  const isSelected = selectedSportTab === sport;
                  return (
                    <button
                      key={sport}
                      onClick={() => setSelectedSportTab(sport)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                        background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <SportIcon sport={sport} size={16} />
                      <span>{sport}</span>
                      <span style={{
                        background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-hover)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.6875rem'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Seções por Modalidade */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {displayedSports.map(sportName => {
                const sportAnalyses = groupedBySport[sportName] || [];
                const isAtletismo = normalizeStr(sportName).includes('atletismo');

                return (
                  <div key={sportName} style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden'
                  }}>
                    {/* Header da Seção da Modalidade */}
                    <div style={{
                      padding: '18px 24px',
                      background: 'var(--bg)',
                      borderBottom: '1px solid var(--border-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
                          background: 'var(--primary-light)', color: 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <SportIcon sport={sportName} size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>
                            {sportName}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {sportAnalyses.length} {sportAnalyses.length === 1 ? 'análise registrada' : 'análises registradas'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Grade de Cards de Análises da Modalidade */}
                    <div style={{ padding: '24px' }}>
                      <div className="row g-3">
                        {sportAnalyses.map(analysis => {
                          const res = analysis.resultado;
                          const placar = analysis.placar;
                          const placarText = typeof placar === 'object' && placar !== null
                            ? `${placar.nos || 0} x ${placar.adv || 0}`
                            : (placar || null);

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
                                background: 'var(--bg)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-light)',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '100%',
                                transition: 'all var(--transition-fast)'
                              }}
                              className="hover-lift"
                              >
                                <div>
                                  {/* Topo do Card */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
                                    <div>
                                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                        {analysis.categoria || 'Geral'}
                                      </span>
                                      <h5 style={{ fontWeight: 800, color: 'var(--text)', margin: '4px 0 0', fontSize: '0.9375rem', lineHeight: 1.3 }}>
                                        {analysis.subtipoProva || (analysis.equipeAdversaria ? `vs ${analysis.equipeAdversaria}` : analysis.modalidade)}
                                      </h5>
                                    </div>

                                    {/* Badge de Resultado */}
                                    {!isAtletismo && res && (
                                      <span className="badge" style={{
                                        background: res === 'Vitória' ? 'var(--success-light)' : res === 'Derrota' ? 'var(--danger-light)' : 'var(--warning-light)',
                                        color: res === 'Vitória' ? 'var(--success)' : res === 'Derrota' ? 'var(--danger)' : 'var(--warning-text)',
                                        border: `1px solid ${res === 'Vitória' ? 'rgba(52,211,153,0.3)' : res === 'Derrota' ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)'}`,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        padding: '4px 8px'
                                      }}>
                                        {res === 'Vitória' && <CheckCircle2 size={12} />}
                                        {res === 'Derrota' && <XCircle size={12} />}
                                        {res === 'Empate' && <MinusCircle size={12} />}
                                        {res}
                                      </span>
                                    )}

                                    {isAtletismo && analysis.dadosEspecificos?.colocacao && (
                                      <span className="badge" style={{
                                        background: 'var(--primary-light)',
                                        color: 'var(--primary)',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}>
                                        <Medal size={12} />
                                        {analysis.dadosEspecificos.colocacao}
                                      </span>
                                    )}
                                  </div>

                                  {/* Conteúdo Técnico */}
                                  {!isAtletismo ? (
                                    <div style={{ marginBottom: '16px' }}>
                                      {analysis.equipeAdversaria && (
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                          Adversário: <strong style={{ color: 'var(--text)' }}>{analysis.equipeAdversaria}</strong>
                                        </div>
                                      )}
                                      {placarText && (
                                        <div style={{
                                          background: 'var(--bg-card)',
                                          borderRadius: 'var(--radius-sm)',
                                          padding: '6px 12px',
                                          fontWeight: 800,
                                          fontSize: '1rem',
                                          color: 'var(--primary)',
                                          display: 'inline-block',
                                          marginTop: '4px',
                                          border: '1px solid var(--border-light)'
                                        }}>
                                          Placar: {placarText}
                                          {hasTiebreaker && (
                                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: '6px' }}>
                                              (Desempate: {tieNos} x {tieAdv})
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div style={{ marginBottom: '16px' }}>
                                      {analysis.dadosEspecificos?.tempo && (
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <Timer size={14} style={{ color: 'var(--primary)' }} />
                                          <span>Tempo: <strong style={{ color: 'var(--text)' }}>{analysis.dadosEspecificos.tempo}</strong></span>
                                        </div>
                                      )}
                                      {analysis.dadosEspecificos?.maiorAltura && (
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                          Altura: <strong style={{ color: 'var(--text)' }}>{analysis.dadosEspecificos.maiorAltura}</strong>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Rodapé do Card com Botão Visualizar */}
                                <div style={{
                                  borderTop: '1px solid var(--border-light)',
                                  paddingTop: '12px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={13} />
                                    {new Date(analysis.data || analysis.createdAt || Date.now()).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                  </span>

                                  <button
                                    onClick={() => setSelectedAnalysisModal(analysis)}
                                    className="btn btn-sm btn-primary"
                                    style={{
                                      padding: '5px 14px',
                                      fontSize: '0.8125rem',
                                      fontWeight: 700,
                                      borderRadius: 'var(--radius-md)',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <span>Visualizar</span>
                                    <ChevronRight size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Modal de Detalhes da Análise (Somente Leitura para Estudante) ── */}
        {selectedAnalysisModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '16px',
            backdropFilter: 'blur(3px)'
          }} onClick={() => setSelectedAnalysisModal(null)}>
            <div 
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                maxWidth: '720px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column'
              }} 
              onClick={e => e.stopPropagation()}
            >
              {/* Header da Modal */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <SportIcon sport={selectedAnalysisModal.modalidade} size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>
                      {selectedAnalysisModal.modalidade}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Registro Técnico e Avaliação da Partida
                    </span>
                  </div>
                </div>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSelectedAnalysisModal(null)}
                  style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Corpo da Modal com dados técnicos */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Placar e Resumo */}
                <div style={{
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                        {selectedAnalysisModal.modalidade}
                      </span>
                      <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700 }}>
                        {selectedAnalysisModal.categoria || 'Geral'}
                      </span>
                      {selectedAnalysisModal.subtipoProva && (
                        <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                          {selectedAnalysisModal.subtipoProva}
                        </span>
                      )}
                    </div>
                    {selectedAnalysisModal.equipeAdversaria && (
                      <h4 style={{ fontSize: '1.125rem', color: 'var(--text)', fontWeight: 800, margin: '4px 0' }}>
                        vs {selectedAnalysisModal.equipeAdversaria}
                      </h4>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      Data do evento: <strong>{new Date(selectedAnalysisModal.data || selectedAnalysisModal.createdAt || Date.now()).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {selectedAnalysisModal.resultado && (
                      <div className="badge" style={{
                        background: selectedAnalysisModal.resultado === 'Vitória' ? 'var(--success-light)' : selectedAnalysisModal.resultado === 'Derrota' ? 'var(--danger-light)' : 'var(--warning-light)',
                        color: selectedAnalysisModal.resultado === 'Vitória' ? 'var(--success)' : selectedAnalysisModal.resultado === 'Derrota' ? 'var(--danger)' : 'var(--warning-text)',
                        fontSize: '0.9375rem',
                        fontWeight: 800,
                        padding: '6px 16px',
                        display: 'inline-block',
                        marginBottom: '6px'
                      }}>
                        {selectedAnalysisModal.resultado}
                      </div>
                    )}
                    {selectedAnalysisModal.placar !== undefined && selectedAnalysisModal.placar !== null && (
                      <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text)' }}>
                        {typeof selectedAnalysisModal.placar === 'object' ? `${selectedAnalysisModal.placar.nos || 0} x ${selectedAnalysisModal.placar.adv || 0}` : String(selectedAnalysisModal.placar)}
                      </div>
                    )}
                    {selectedAnalysisModal.dadosEspecificos?.colocacao && (
                      <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary)' }}>
                        Colocação: {selectedAnalysisModal.dadosEspecificos.colocacao}
                      </div>
                    )}
                    {selectedAnalysisModal.dadosEspecificos?.tempo && (
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                        Tempo: {selectedAnalysisModal.dadosEspecificos.tempo}
                      </div>
                    )}
                  </div>
                </div>

                {/* Estatísticas e Métricas Técnicas */}
                {selectedAnalysisModal.dadosEspecificos && Object.keys(selectedAnalysisModal.dadosEspecificos).length > 0 && (
                  <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    border: '1px solid var(--border-light)'
                  }}>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '14px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Activity size={16} style={{ color: 'var(--primary)' }} />
                      Métricas e Estatísticas Técnicas
                    </h6>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                      {Object.entries(selectedAnalysisModal.dadosEspecificos).map(([k, v]) => {
                        if (v === '' || v === null || v === undefined) return null;
                        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                        const formattedVal = Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v);
                        return (
                          <div key={k} style={{
                            background: 'var(--bg)',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-light)'
                          }}>
                            <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'capitalize', marginBottom: '2px' }}>
                              {label}
                            </span>
                            <strong style={{ fontSize: '0.875rem', color: 'var(--text)', wordBreak: 'break-word' }}>
                              {formattedVal}
                            </strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Observações do Treinador */}
                {selectedAnalysisModal.observacoes && (
                  <div style={{
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 18px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.875rem',
                    color: 'var(--text)'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                      Observações do Treinador:
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      {selectedAnalysisModal.observacoes}
                    </div>
                  </div>
                )}
              </div>

              {/* Rodapé da Modal */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '16px 24px',
                borderTop: '1px solid var(--border-light)',
                background: 'var(--bg)'
              }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedAnalysisModal(null)}
                  style={{ padding: '8px 24px', fontWeight: 600, borderRadius: 'var(--radius-md)' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default StudentAnalises;
