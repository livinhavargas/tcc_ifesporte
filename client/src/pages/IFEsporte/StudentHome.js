import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LineChart = ({ data, title }) => {
  // data is an array of { data: string, score: number } sorted by date.
  if (!data || data.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center bg-light rounded-3" style={{ height: '200px' }}>
        <p className="text-muted small mb-0"><i className="bi bi-info-circle me-2"></i>Ainda não existem análises suficientes para gerar um gráfico de evolução desta modalidade.</p>
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div className="d-flex align-items-center justify-content-center bg-light rounded-3 flex-column" style={{ height: '200px' }}>
        <h1 className="fw-bold text-blue-dark mb-1">{data[0].score.toFixed(1)}</h1>
        <p className="text-muted small mb-0">Última avaliação ({new Date(data[0].data).toLocaleDateString('pt-BR')})</p>
        <span className="badge bg-warning text-dark mt-2">Aguardando mais análises para gerar gráfico</span>
      </div>
    );
  }

  // Determine min and max score for Y axis, pad slightly
  const scores = data.map(d => d.score);
  const minScore = Math.max(1, Math.min(...scores) - 0.5);
  const maxScore = Math.min(5, Math.max(...scores) + 0.5);
  
  // SVG ViewBox
  const width = 800;
  const height = 250;
  const paddingX = 50;
  const paddingY = 40;
  
  const drawWidth = width - paddingX * 2;
  const drawHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * drawWidth;
    // Y is inverted (0 is top)
    const y = height - paddingY - ((d.score - minScore) / (maxScore - minScore)) * drawHeight;
    return { x, y, score: d.score, date: d.data };
  });

  const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  
  // Check trend
  const isPositive = data.length > 1 && data[data.length - 1].score >= data[data.length - 2].score;
  const strokeColor = isPositive ? '#22c55e' : '#f97316'; // Green if going up/stable, Orange if going down

  return (
    <div>
      <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center">
        <i className="bi bi-graph-up-arrow me-2" style={{ color: strokeColor }}></i> {title}
      </h6>
      <div className="w-100 d-flex flex-column align-items-center justify-content-center position-relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-100" style={{ maxHeight: '250px' }}>
          {/* Grid Lines Y */}
          {[1, 2, 3, 4, 5].map(val => {
            if (val < minScore || val > maxScore) return null;
            const y = height - paddingY - ((val - minScore) / (maxScore - minScore)) * drawHeight;
            return (
              <g key={`grid-${val}`}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
                <text x={paddingX - 10} y={y + 4} fontSize="12" fill="#94a3b8" textAnchor="end">{val}</text>
              </g>
            );
          })}

          {/* Line Chart */}
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Points & Labels */}
          {points.map((p, i) => (
            <g key={`point-${i}`}>
              <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke={strokeColor} strokeWidth="3" />
              <text x={p.x} y={height - 15} fontSize="12" fill="#64748b" textAnchor="middle">
                {new Date(p.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
              </text>
              <text x={p.x} y={p.y - 15} fontSize="12" fill="#334155" fontWeight="bold" textAnchor="middle">
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
      // 1. Fetch Profile to get modalidades (esportes)
      const resProfile = await fetch(`/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataProfile = await resProfile.json();

      // 2. Fetch Analyses for this student
      const resAnalysis = await fetch('/api/analysis', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataAnalysis = await resAnalysis.json();
      const myAnalyses = dataAnalysis.filter(a => a.aluno && a.aluno.email === userEmail);

      // 3. Fetch Events
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
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const modalidades = profile?.esportes || [];

  if (modalidades.length === 0) {
    return (
      <div className="container-fluid p-0">
        <div className="mb-4">
          <h2 className="fw-bold text-blue-dark">Olá, {userName.split(' ')[0]} 👋</h2>
          <p className="text-muted">Acompanhe sua evolução esportiva e eventos.</p>
        </div>
        <div className="card-flat p-5 text-center shadow-sm border border-light" style={{ borderRadius: '16px' }}>
          <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
            <i className="bi bi-trophy text-muted fs-1"></i>
          </div>
          <h4 className="fw-bold text-blue-dark">Nenhuma modalidade vinculada</h4>
          <p className="text-muted mx-auto mb-0" style={{ maxWidth: '500px' }}>
            Você ainda não possui modalidades vinculadas ao seu cadastro. Em breve, seus treinadores poderão associá-lo a equipes e registrar avaliações.
          </p>
        </div>
      </div>
    );
  }

  // Group analyses by modalidade -> subtipo
  const groupedAnalyses = {};
  modalidades.forEach(mod => {
    groupedAnalyses[mod] = {};
  });

  analyses.forEach(a => {
    const mod = a.modalidade;
    const sub = a.subtipo || 'Geral';
    // Only process if it belongs to one of their registered modalidades
    if (groupedAnalyses[mod] !== undefined) {
      if (!groupedAnalyses[mod][sub]) groupedAnalyses[mod][sub] = [];
      groupedAnalyses[mod][sub].push({
        data: a.data,
        score: a.resultados?.indiceGeral || 0
      });
    }
  });

  // Sort dates
  Object.keys(groupedAnalyses).forEach(mod => {
    Object.keys(groupedAnalyses[mod]).forEach(sub => {
      groupedAnalyses[mod][sub].sort((a, b) => new Date(a.data) - new Date(b.data));
    });
  });

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h2 className="fw-bold text-blue-dark">Olá, {userName.split(' ')[0]} 👋</h2>
        <p className="text-muted">Acompanhe seu desempenho baseado nas avaliações e as próximas atividades.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-4">
            {modalidades.map(mod => {
              const subs = groupedAnalyses[mod] || {};
              const subKeys = Object.keys(subs);

              return (
                <div key={mod} className="card-flat shadow-sm overflow-hidden" style={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div className="bg-blue-dark text-white px-4 py-3 d-flex align-items-center">
                    <i className="bi bi-trophy-fill fs-4 me-3 text-orange"></i>
                    <h4 className="mb-0 fw-bold">{mod}</h4>
                  </div>
                  
                  <div className="p-4 p-md-5 bg-white">
                    {subKeys.length === 0 ? (
                      <div className="text-center py-4 bg-light rounded-4 border border-light">
                        <i className="bi bi-bar-chart-line text-muted fs-1 mb-3 d-block"></i>
                        <p className="text-muted mb-0 fw-medium">Ainda não existem análises suficientes para gerar um gráfico de evolução desta modalidade.</p>
                      </div>
                    ) : (
                      <div className="row g-5">
                        {subKeys.map(sub => (
                          <div key={sub} className="col-12">
                            <LineChart data={subs[sub]} title={sub === 'Geral' ? 'Desempenho Geral' : `Especialidade: ${sub}`} />
                            {subKeys.length > 1 && subKeys[subKeys.length-1] !== sub && <hr className="mt-5 mb-0 text-muted opacity-25" />}
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
          {/* Próximas Atividades */}
          <div className="card-flat p-4 shadow-sm" style={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h6 className="fw-bold text-blue-dark mb-4">Próximas Atividades</h6>
            {events.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {events.map((ev, i) => (
                  <div key={i} className="d-flex align-items-center p-3 bg-light rounded-3">
                    <div className="bg-white rounded p-2 text-center shadow-sm me-3" style={{ minWidth: '55px' }}>
                      <span className="d-block text-danger fw-bold lh-1 mb-1">{formatarData(ev.data).split('/')[0]}</span>
                      <span className="d-block text-muted small lh-1">{formatarData(ev.data).split('/')[1]}</span>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h6 className="fw-bold text-blue-dark mb-1 text-truncate">{ev.titulo}</h6>
                      <small className="text-muted text-truncate d-block">{ev.tipo} • {ev.horaInicial || ev.hora}</small>
                    </div>
                  </div>
                ))}
                <Link to="/agenda" className="btn btn-outline-primary btn-sm mt-3 fw-bold rounded-pill w-100">Ver Agenda Completa</Link>
              </div>
            ) : (
              <p className="text-muted small text-center mb-0 py-3">Nenhuma atividade agendada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
