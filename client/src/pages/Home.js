import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StudentHome from './IFesporte/StudentHome';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem('userName') || 'Usuário';
  const tipo = localStorage.getItem('tipo');

  useEffect(() => {
    if (tipo !== 'estudante') {
      fetchEvents();
    } else {
      setLoading(false); // StudentHome does its own loading
    }
  }, [tipo]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      const futuros = data.filter(ev => ev.data && ev.data.split('T')[0] >= todayStr);
      futuros.sort((a, b) => a.data.localeCompare(b.data));

      setEvents(futuros.slice(0, 4)); // Pegar apenas os 4 próximos
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

  if (tipo === 'estudante') {
    return (
      <Layout>
        <StudentHome userName={userName} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid p-0">
        
        {/* Saudação */}
        <div className="mb-4">
          <h2 className="fw-bold text-blue-dark">Olá, {userName.split(' ')[0]} 👋</h2>
          <p className="text-muted">Aqui está o resumo das suas atividades e equipes.</p>
        </div>

        {/* 4 Cartões de Resumo */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card-flat p-4 h-100 shadow-sm d-flex flex-column justify-content-center align-items-center text-center">
              <div className="bg-orange-light text-orange rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
                <i className="bi bi-people-fill"></i>
              </div>
              <h2 className="fw-bold text-blue-dark mb-0">45</h2>
              <span className="text-muted small fw-bold mt-1">Atletas Ativos</span>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card-flat p-4 h-100 shadow-sm d-flex flex-column justify-content-center align-items-center text-center">
              <div className="bg-blue-light text-blue-dark rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
                <i className="bi bi-calendar-event-fill"></i>
              </div>
              <h5 className="fw-bold text-blue-dark mb-0">{events.length > 0 ? formatarData(events[0].data) : '--/--'}</h5>
              <span className="text-muted small fw-bold mt-1 text-truncate w-100 px-2">{events.length > 0 ? events[0].titulo : 'Sem eventos'}</span>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card-flat p-4 h-100 shadow-sm d-flex flex-column justify-content-center align-items-center text-center">
              <div className="bg-green-light text-success rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
                <i className="bi bi-clipboard-data-fill"></i>
              </div>
              <h2 className="fw-bold text-blue-dark mb-0">12</h2>
              <span className="text-muted small fw-bold mt-1">Análises Pendentes</span>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card-flat p-4 h-100 shadow-sm d-flex flex-column justify-content-center align-items-center text-center cursor-pointer hover-bg-light transition" onClick={() => window.location.href='/relatorios'}>
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
                <i className="bi bi-file-earmark-bar-graph-fill"></i>
              </div>
              <h5 className="fw-bold text-blue-dark mb-0">Relatórios</h5>
              <span className="text-primary small fw-bold mt-1">Gerar Novo <i className="bi bi-arrow-right"></i></span>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Gráficos */}
          <div className="col-lg-8">
            <div className="card-flat p-4 h-100 shadow-sm">
              <h5 className="fw-bold text-blue-dark mb-4">Evolução Média (Índice de Desempenho)</h5>
              
              <div className="w-100 d-flex flex-column align-items-center justify-content-center" style={{ height: '300px' }}>
                <svg viewBox="0 0 800 250" className="w-100 h-100">
                  {/* Grid Lines */}
                  <line x1="50" y1="200" x2="750" y2="200" stroke="#e2e8f0" strokeWidth="2" />
                  <line x1="50" y1="150" x2="750" y2="150" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="50" y1="100" x2="750" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="50" y1="50" x2="750" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
                  
                  {/* Line Chart */}
                  <path d="M 50 180 L 150 160 L 250 130 L 350 140 L 450 90 L 550 110 L 650 60 L 750 40" fill="none" stroke="#295593" strokeWidth="4" />
                  
                  {/* Points */}
                  <circle cx="50" cy="180" r="6" fill="#f97316" />
                  <circle cx="150" cy="160" r="6" fill="#f97316" />
                  <circle cx="250" cy="130" r="6" fill="#f97316" />
                  <circle cx="350" cy="140" r="6" fill="#f97316" />
                  <circle cx="450" cy="90" r="6" fill="#f97316" />
                  <circle cx="550" cy="110" r="6" fill="#f97316" />
                  <circle cx="650" cy="60" r="6" fill="#f97316" />
                  <circle cx="750" cy="40" r="6" fill="#f97316" />

                  {/* X Axis Labels */}
                  <text x="50" y="230" fontSize="12" fill="#64748b" textAnchor="middle">Jan</text>
                  <text x="150" y="230" fontSize="12" fill="#64748b" textAnchor="middle">Fev</text>
                  <text x="250" y="230" fontSize="12" fill="#64748b" textAnchor="middle">Mar</text>
                  <text x="350" y="230" fontSize="12" fill="#64748b" textAnchor="middle">Abr</text>
                  <text x="450" y="230" fontSize="12" fill="#64748b" textAnchor="middle">Mai</text>
                  <text x="550" y="230" fontSize="12" fill="#64748b" textAnchor="middle">Jun</text>
                  <text x="650" y="230" fontSize="12" fill="#64748b" textAnchor="middle">Jul</text>
                  <text x="750" y="230" fontSize="12" fill="#64748b" textAnchor="middle">Ago</text>
                </svg>
              </div>

            </div>
          </div>

          {/* Assiduidade e Próximas Atividades */}
          <div className="col-lg-4">
            
            {/* Assiduidade */}
            <div className="card-flat p-4 mb-4 shadow-sm text-center">
              <h6 className="fw-bold text-blue-dark mb-4">Assiduidade Mensal</h6>
              <div className="position-relative d-inline-block mx-auto mb-3" style={{ width: '160px', height: '160px' }}>
                <svg viewBox="0 0 36 36" className="w-100 h-100">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#e2e8f0" strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="85, 100"
                  />
                </svg>
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                  <h3 className="fw-bold text-success mb-0">85%</h3>
                  <small className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>PRESENÇA</small>
                </div>
              </div>
            </div>

            {/* Próximas Atividades */}
            <div className="card-flat p-4 shadow-sm">
              <h6 className="fw-bold text-blue-dark mb-4">Próximas Atividades</h6>
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary spinner-border-sm"></div></div>
              ) : events.length > 0 ? (
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
                  <Link to="/agenda" className="btn btn-outline-primary btn-sm mt-2 fw-bold rounded-pill">Ver Agenda Completa</Link>
                </div>
              ) : (
                <p className="text-muted small text-center mb-0">Nenhuma atividade agendada.</p>
              )}
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Home;
