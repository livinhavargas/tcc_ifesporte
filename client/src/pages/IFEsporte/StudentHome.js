import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../services/api';
import SportIcon from '../../components/SportIcon';
import { renderDiagnosticCard } from './Analises';

const LineChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', borderRadius: 'var(--radius-md)', height: '180px',
        padding: '20px', textAlign: 'center'
      }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>
          <i className="bi bi-info-circle me-2"></i>Ainda não existem avaliações suficientes para gerar o gráfico desta especialidade.
        </p>
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        background: 'var(--bg)', borderRadius: 'var(--radius-md)', height: '180px', padding: '20px'
      }}>
        <h1 style={{ fontWeight: 800, color: 'var(--primary)', margin: '0 0 4px', fontSize: '2rem' }}>
          {data[0].score.toFixed(1)}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0 0 10px' }}>
          Avaliação em {new Date(data[0].data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
        </p>
        <span className="badge" style={{ background: 'var(--warning-light)', color: 'var(--warning-text)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '4px 10px', fontSize: '0.6875rem', fontWeight: 600 }}>
          1ª avaliação registrada • Próximas avaliações formarão a curva de evolução
        </span>
      </div>
    );
  }

  const scores = data.map(d => d.score);
  const minScore = Math.max(1, Math.min(...scores) - 0.5);
  const maxScore = Math.min(5, Math.max(...scores) + 0.5);
  
  const width = 800;
  const height = 240;
  const paddingX = 50;
  const paddingY = 40;
  
  const drawWidth = width - paddingX * 2;
  const drawHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * drawWidth;
    const y = height - paddingY - ((d.score - minScore) / (maxScore - minScore)) * drawHeight;
    return { x, y, score: d.score, date: d.data };
  });

  const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  
  const isPositive = data.length > 1 && data[data.length - 1].score >= data[data.length - 2].score;
  const strokeColor = isPositive ? 'var(--success)' : 'var(--accent)';

  return (
    <div>
      <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '14px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="bi bi-graph-up-arrow" style={{ color: strokeColor }}></i> {title}
      </h6>
      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-100" style={{ maxHeight: '240px' }}>
          {[1, 2, 3, 4, 5].map(val => {
            if (val < minScore || val > maxScore) return null;
            const y = height - paddingY - ((val - minScore) / (maxScore - minScore)) * drawHeight;
            return (
              <g key={`grid-${val}`}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border-light)" strokeWidth="1" strokeDasharray="5,5" />
                <text x={paddingX - 10} y={y + 4} fontSize="12" fill="var(--text-tertiary)" textAnchor="end">{val}</text>
              </g>
            );
          })}

          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          
          {points.map((p, i) => (
            <g key={`point-${i}`}>
              <circle cx={p.x} cy={p.y} r="6" fill="var(--bg-card)" stroke={strokeColor} strokeWidth="3" />
              <text x={p.x} y={height - 15} fontSize="12" fill="var(--text-tertiary)" textAnchor="middle">
                {new Date(p.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
              </text>
              <text x={p.x} y={p.y - 15} fontSize="12" fill="var(--text)" fontWeight="bold" textAnchor="middle">
                {p.score.toFixed(1)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

const StudentHome = ({ userName }) => {
  const [validAnalyses, setValidAnalyses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModalityModal, setSelectedModalityModal] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');

    try {
      // 1. Perfil do Estudante
      const resProfile = await fetch(apiUrl(`/api/users/${userId}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataProfile = resProfile.ok ? await resProfile.json() : null;

      // 2. Análises realizadas pelo treinador
      const resAnalysis = await fetch(apiUrl('/api/analysis'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataAnalysis = resAnalysis.ok ? await resAnalysis.json() : [];

      // Filtrar estritamente análises válidas vinculadas a este estudante
      const myValidAnalyses = Array.isArray(dataAnalysis) ? dataAnalysis.filter(a => {
        if (!a || !a.aluno || !a.modalidade) return false;
        
        const aluno = a.aluno;
        const matchesEmail = aluno.email && userEmail && aluno.email.toLowerCase() === userEmail.toLowerCase();
        const matchesMatricula = aluno.matricula && dataProfile?.matricula && aluno.matricula === dataProfile.matricula;
        const matchesCpf = aluno.cpf && dataProfile?.cpf && aluno.cpf === dataProfile.cpf;
        const matchesId = aluno._id === userId || aluno === userId || aluno.adicionadoPor === userId;

        const belongsToStudent = matchesEmail || matchesMatricula || matchesCpf || matchesId;
        if (!belongsToStudent) return false;

        // Validar se contém data e nota/resultado processado
        const hasDate = Boolean(a.data || a.dataAvaliacao);
        const hasScore = (a.resultados && typeof a.resultados.indiceGeral === 'number') ||
                         (a.respostas && Object.keys(a.respostas).length > 0) ||
                         Boolean(a.resultado);

        return hasDate && hasScore;
      }) : [];

      // 3. Próximos eventos da Agenda
      const resEvents = await fetch(apiUrl('/api/events'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataEvents = resEvents.ok ? await resEvents.json() : [];
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const futuros = Array.isArray(dataEvents) 
        ? dataEvents.filter(ev => ev.data && ev.data.split('T')[0] >= todayStr)
        : [];
      futuros.sort((a, b) => (a.data || '').localeCompare(b.data || ''));

      setValidAnalyses(myValidAnalyses);
      setEvents(futuros.slice(0, 4));
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do estudante:', error);
      setLoading(false);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    const dateStr = dataString.split('T')[0];
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  };

  const handleOpenDetails = (modalidade) => {
    const modAnalyses = validAnalyses.filter(a => a.modalidade === modalidade);
    modAnalyses.sort((a, b) => new Date(b.dataAvaliacao || b.data) - new Date(a.dataAvaliacao || a.data));
    setSelectedModalityModal({
      modalidade,
      analyses: modAnalyses,
      activeIndex: 0
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
      </div>
    );
  }

  // Agrupar análises válidas por modalidade e especialidade/subtipo
  const groupedAnalyses = {};

  validAnalyses.forEach(a => {
    const mod = a.modalidade;
    const sub = a.subtipo || 'Geral';
    if (!groupedAnalyses[mod]) {
      groupedAnalyses[mod] = {};
    }
    if (!groupedAnalyses[mod][sub]) {
      groupedAnalyses[mod][sub] = [];
    }
    groupedAnalyses[mod][sub].push({
      data: a.data || a.dataAvaliacao,
      score: a.resultados?.indiceGeral !== undefined ? Number(a.resultados.indiceGeral) : 0
    });
  });

  // Ordenar as análises por data cronológica crescente
  Object.keys(groupedAnalyses).forEach(mod => {
    Object.keys(groupedAnalyses[mod]).forEach(sub => {
      groupedAnalyses[mod][sub].sort((a, b) => new Date(a.data) - new Date(b.data));
    });
  });

  // REGRA: Modalidades com pelo menos UMA análise válida efetivamente realizada
  const modalidadesAtivas = Object.keys(groupedAnalyses).filter(mod => {
    const subs = groupedAnalyses[mod];
    return Object.values(subs).some(list => list.length > 0);
  });

  const activeAnalysisInModal = selectedModalityModal
    ? selectedModalityModal.analyses[selectedModalityModal.activeIndex]
    : null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header do Estudante */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>
          Olá, {userName.split(' ')[0]} 👋
        </h2>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
          Acompanhe seu desempenho nas avaliações esportivas e seus próximos compromissos na Agenda.
        </p>
      </div>

      <div className="row g-4">
        {/* Coluna Principal: Análises Esportivas */}
        <div className="col-lg-8">
          {modalidadesAtivas.length === 0 ? (
            /* Estado Vazio Elegante quando não existem análises realizadas */
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '48px 32px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.875rem', marginBottom: '20px'
              }}>
                <i className="bi bi-clipboard2-data"></i>
              </div>
              <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px', fontSize: '1.125rem' }}>
                Nenhuma análise disponível no momento
              </h4>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                Assim que seu treinador realizar suas avaliações esportivas, sua evolução e relatórios de desempenho aparecerão aqui.
              </p>
              <Link to="/agenda" className="btn btn-outline-primary btn-sm" style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                <i className="bi bi-calendar-event me-2"></i>Ver Atividades na Agenda
              </Link>
            </div>
          ) : (
            /* Lista exclusiva de modalidades que possuem análises reais */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {modalidadesAtivas.map(mod => {
                const subs = groupedAnalyses[mod] || {};
                const subKeys = Object.keys(subs);
                const totalAnalises = Object.values(subs).reduce((acc, list) => acc + list.length, 0);

                return (
                  <div key={mod} style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden'
                  }}>
                    {/* Header do Card da Modalidade com Botão "Mais detalhes" */}
                    <div style={{
                      background: 'var(--primary)',
                      color: '#fff',
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="bi bi-trophy-fill" style={{ color: 'var(--accent)', fontSize: '1.125rem' }}></i>
                        <h4 style={{ color: '#fff', margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
                          Análise de {mod}
                        </h4>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          color: '#fff'
                        }}>
                          {totalAnalises} {totalAnalises === 1 ? 'avaliação' : 'avaliações'}
                        </span>
                        
                        <button
                          className="btn btn-light btn-sm"
                          style={{
                            padding: '5px 14px',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-md)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--primary)',
                            background: '#ffffff',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                            transition: 'all var(--transition-fast)'
                          }}
                          onClick={() => handleOpenDetails(mod)}
                        >
                          <i className="bi bi-file-text"></i> Mais detalhes
                        </button>
                      </div>
                    </div>
                    
                    {/* Gráficos de Evolução por Especialidade/Geral */}
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        {subKeys.map((sub, idx) => (
                          <div key={sub}>
                            <LineChart 
                              data={subs[sub]} 
                              title={sub === 'Geral' ? 'Desempenho Geral' : `Especialidade: ${sub}`} 
                            />
                            {idx < subKeys.length - 1 && (
                              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', margin: '24px 0 0' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna Lateral: Próximas Atividades */}
        <div className="col-lg-4">
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px'
          }}>
            <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '16px', fontSize: '0.875rem' }}>
              Próximas Atividades
            </h6>
            {events.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.map((ev, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    gap: '12px'
                  }}>
                    <div style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 8px',
                      textAlign: 'center',
                      boxShadow: 'var(--shadow-xs)',
                      minWidth: '50px',
                      flexShrink: 0
                    }}>
                      <span style={{ display: 'block', color: 'var(--error)', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.1 }}>
                        {formatarData(ev.data).split('/')[0]}
                      </span>
                      <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.6875rem', fontWeight: 500, marginTop: '2px', lineHeight: 1 }}>
                        {formatarData(ev.data).split('/')[1]}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 2px', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.titulo}
                      </h6>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.tipo} · {ev.horaInicial || ev.hora}
                      </span>
                    </div>
                  </div>
                ))}
                <Link to="/agenda" className="btn btn-outline-primary" style={{ marginTop: '8px', fontSize: '0.8125rem', width: '100%', borderRadius: 'var(--radius-md)' }}>
                  Ver Agenda Completa
                </Link>
              </div>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', textAlign: 'center', margin: '16px 0 0' }}>
                Nenhuma atividade agendada.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal de Detalhes da Análise ── */}
      {selectedModalityModal && activeAnalysisInModal && (
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
        }} onClick={() => setSelectedModalityModal(null)}>
          <div 
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
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
                  width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <SportIcon sport={selectedModalityModal.modalidade} size={22} />
                </div>
                <div>
                  <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>
                    Detalhes da Análise de {selectedModalityModal.modalidade}
                  </h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Avaliação realizada pelo treinador
                  </span>
                </div>
              </div>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSelectedModalityModal(null)}
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Fechar"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Abas / Seletor de Histórico se houver mais de uma análise */}
            {selectedModalityModal.analyses.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '12px 24px',
                background: 'var(--bg)',
                borderBottom: '1px solid var(--border-light)'
              }}>
                {selectedModalityModal.analyses.map((a, idx) => {
                  const isSelected = selectedModalityModal.activeIndex === idx;
                  const dateLabel = new Date(a.dataAvaliacao || a.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                  return (
                    <button
                      key={a._id || idx}
                      onClick={() => setSelectedModalityModal(prev => ({ ...prev, activeIndex: idx }))}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                        background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {dateLabel} {a.subtipo ? `• ${a.subtipo}` : ''} ({a.resultados?.indiceGeral !== undefined ? Number(a.resultados.indiceGeral).toFixed(1) : '-'})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Conteúdo Detalhado da Análise */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Banner de Informações Principais */}
              <div style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600 }}>
                      {activeAnalysisInModal.subtipo || 'Geral'}
                    </span>
                    <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600 }}>
                      Contexto: {activeAnalysisInModal.contexto || 'Treino'}
                    </span>
                    {activeAnalysisInModal.categoria && (
                      <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                        {activeAnalysisInModal.categoria}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <i className="bi bi-calendar3 me-1"></i> Data da avaliação: <strong>{new Date(activeAnalysisInModal.dataAvaliacao || activeAnalysisInModal.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Índice Geral
                  </div>
                  <span className="badge" style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    fontSize: '1.125rem',
                    padding: '6px 16px',
                    fontWeight: 700,
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    ★ {activeAnalysisInModal.resultados?.indiceGeral !== undefined ? Number(activeAnalysisInModal.resultados.indiceGeral).toFixed(1) : '5.0'}
                  </span>
                </div>
              </div>

              {/* Diagnóstico Inteligente */}
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <h6 style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '12px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-robot" style={{ fontSize: '1.125rem' }}></i> Diagnóstico de Desempenho
                </h6>
                {renderDiagnosticCard(activeAnalysisInModal.diagnostico)}
              </div>

              {/* Notas dos Critérios Avaliados */}
              {activeAnalysisInModal.respostas && Object.keys(activeAnalysisInModal.respostas).length > 0 && (
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid var(--border-light)'
                }}>
                  <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '14px', fontSize: '0.875rem' }}>
                    Notas dos Critérios Avaliados
                  </h6>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                    {Object.entries(activeAnalysisInModal.respostas).map(([key, val]) => (
                      <div key={key} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--bg)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)'
                      }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className="badge" style={{
                          background: Number(val) >= 4 ? 'var(--success)' : Number(val) >= 3 ? 'var(--primary)' : 'var(--warning)',
                          color: '#fff',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          minWidth: '36px',
                          padding: '4px 8px'
                        }}>
                          {val} / 5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações do Treinador */}
              {activeAnalysisInModal.observacoes && (
                <div style={{
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 18px',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)'
                }}>
                  <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
                    <i className="bi bi-chat-quote-fill me-2" style={{ color: 'var(--primary)' }}></i>Observações do Treinador:
                  </strong>
                  {activeAnalysisInModal.observacoes}
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
                onClick={() => setSelectedModalityModal(null)}
                style={{ padding: '6px 20px', fontWeight: 600, borderRadius: 'var(--radius-md)' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHome;
