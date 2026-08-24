import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');

    try {
      // 1. Perfil do Estudante
      const resProfile = await fetch(`/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataProfile = resProfile.ok ? await resProfile.json() : null;

      // 2. Análises realizadas pelo treinador
      const resAnalysis = await fetch('/api/analysis', {
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
        const hasDate = Boolean(a.data);
        const hasScore = (a.resultados && typeof a.resultados.indiceGeral === 'number') ||
                         (a.respostas && Object.keys(a.respostas).length > 0) ||
                         Boolean(a.resultado);

        return hasDate && hasScore;
      }) : [];

      // 3. Próximos eventos da Agenda
      const resEvents = await fetch('/api/events', {
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
      data: a.data,
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

                return (
                  <div key={mod} style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden'
                  }}>
                    {/* Header do Card da Modalidade */}
                    <div style={{
                      background: 'var(--primary)',
                      color: '#fff',
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="bi bi-trophy-fill" style={{ color: 'var(--accent)', fontSize: '1.125rem' }}></i>
                        <h4 style={{ color: '#fff', margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
                          {mod}
                        </h4>
                      </div>
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        color: '#fff'
                      }}>
                        {Object.values(subs).reduce((acc, list) => acc + list.length, 0)} {Object.values(subs).reduce((acc, list) => acc + list.length, 0) === 1 ? 'avaliação' : 'avaliações'}
                      </span>
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
    </div>
  );
};

export default StudentHome;
