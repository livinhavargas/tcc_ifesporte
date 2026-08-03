import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LineChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', borderRadius: 'var(--radius-md)', height: '200px',
        padding: '24px', textAlign: 'center'
      }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>
          <i className="bi bi-info-circle me-2"></i>Ainda não existem análises suficientes para gerar um gráfico de evolução desta modalidade.
        </p>
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        background: 'var(--bg)', borderRadius: 'var(--radius-md)', height: '200px', padding: '24px'
      }}>
        <h1 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>{data[0].score.toFixed(1)}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0 0 12px' }}>
          Última avaliação ({new Date(data[0].data).toLocaleDateString('pt-BR')})
        </p>
        <span className="badge bg-warning">Aguardando mais análises para gerar gráfico</span>
      </div>
    );
  }

  const scores = data.map(d => d.score);
  const minScore = Math.max(1, Math.min(...scores) - 0.5);
  const maxScore = Math.min(5, Math.max(...scores) + 0.5);
  
  const width = 800;
  const height = 250;
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
      <h6 style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="bi bi-graph-up-arrow" style={{ color: strokeColor }}></i> {title}
      </h6>
      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-100" style={{ maxHeight: '250px' }}>
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
              <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke={strokeColor} strokeWidth="3" />
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
  const [profile, setProfile] = useState(null);
  const [analyses, setAnalyses] = useState([]);
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
      const resProfile = await fetch(`/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataProfile = await resProfile.json();

      const resAnalysis = await fetch('/api/analysis', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataAnalysis = await resAnalysis.json();
      const myAnalyses = dataAnalysis.filter(a => a.aluno && a.aluno.email === userEmail);

      const resEvents = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataEvents = await resEvents.json();
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const futuros = dataEvents.filter(ev => ev.data && ev.data.split('T')[0] >= todayStr);
      futuros.sort((a, b) => a.data.localeCompare(b.data));

      setProfile(dataProfile);
      setAnalyses(myAnalyses);
      setEvents(futuros.slice(0, 4));
      setLoading(false);
    } catch (error) {
      console.error(error);
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

  const modalidades = profile?.esportes || [];

  if (modalidades.length === 0) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>Olá, {userName.split(' ')[0]} 👋</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0' }}>Acompanhe sua evolução esportiva e eventos.</p>
        </div>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          padding: '48px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--primary-light)', color: 'var(--primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', marginBottom: '20px'
          }}>
            <i className="bi bi-trophy"></i>
          </div>
          <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Nenhuma modalidade vinculada</h4>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', maxWidth: '460px', margin: '0 auto' }}>
            Você ainda não possui modalidades vinculadas ao seu cadastro. Em breve, seus treinadores poderão associá-lo a equipes e registrar avaliações.
          </p>
        </div>
      </div>
    );
  }

  const groupedAnalyses = {};
  modalidades.forEach(mod => {
    groupedAnalyses[mod] = {};
  });

  analyses.forEach(a => {
    const mod = a.modalidade;
    const sub = a.subtipo || 'Geral';
    if (groupedAnalyses[mod] !== undefined) {
      if (!groupedAnalyses[mod][sub]) groupedAnalyses[mod][sub] = [];
      groupedAnalyses[mod][sub].push({
        data: a.data,
        score: a.resultados?.indiceGeral || 0
      });
    }
  });

  Object.keys(groupedAnalyses).forEach(mod => {
    Object.keys(groupedAnalyses[mod]).forEach(sub => {
      groupedAnalyses[mod][sub].sort((a, b) => new Date(a.data) - new Date(b.data));
    });
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>Olá, {userName.split(' ')[0]} 👋</h2>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0' }}>Acompanhe seu desempenho baseado nas avaliações e as próximas atividades.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {modalidades.map(mod => {
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
                  <div style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <i className="bi bi-trophy-fill" style={{ color: 'var(--accent)', fontSize: '1.25rem' }}></i>
                    <h4 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontWeight: 700 }}>{mod}</h4>
                  </div>
                  
                  <div style={{ padding: '24px' }}>
                    {subKeys.length === 0 ? (
                      <div style={{
                        textAlign: 'center', padding: '32px 16px',
                        background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                        border: '1.5px dashed var(--border)'
                      }}>
                        <i className="bi bi-bar-chart-line" style={{ color: 'var(--text-tertiary)', fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8125rem', fontWeight: 500 }}>
                          Ainda não existem análises suficientes para gerar um gráfico de evolução desta modalidade.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {subKeys.map((sub, idx) => (
                          <div key={sub}>
                            <LineChart data={subs[sub]} title={sub === 'Geral' ? 'Desempenho Geral' : `Especialidade: ${sub}`} />
                            {idx < subKeys.length - 1 && (
                              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', margin: '32px 0 0' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-lg-4">
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px'
          }}>
            <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '20px', fontSize: '0.875rem' }}>Próximas Atividades</h6>
            {events.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {events.map((ev, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    gap: '12px'
                  }}>
                    <div style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px',
                      textAlign: 'center',
                      boxShadow: 'var(--shadow-xs)',
                      minWidth: '56px',
                      flexShrink: 0
                    }}>
                      <span style={{ display: 'block', color: 'var(--error)', fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.1 }}>{formatarData(ev.data).split('/')[0]}</span>
                      <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.6875rem', fontWeight: 500, marginTop: '2px', lineHeight: 1 }}>{formatarData(ev.data).split('/')[1]}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 2px', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.titulo}</h6>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.tipo} · {ev.horaInicial || ev.hora}
                      </span>
                    </div>
                  </div>
                ))}
                <Link to="/agenda" className="btn btn-outline-primary" style={{ marginTop: '12px', fontSize: '0.8125rem', width: '100%' }}>Ver Agenda Completa</Link>
              </div>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', textAlign: 'center', margin: '16px 0 0' }}>Nenhuma atividade agendada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
