import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StudentHome from './IFesporte/StudentHome';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userName = localStorage.getItem('userName') || 'Usuário';
  const tipo = localStorage.getItem('tipo');

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('agenda_goals');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Preparar equipe para campeonato', done: false },
      { id: 2, text: 'Finalizar avaliações físicas', done: false },
      { id: 3, text: 'Organizar amistoso', done: false }
    ];
  });

  useEffect(() => {
    if (tipo !== 'estudante') {
      fetchEvents();
      fetchCronogramas();
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Prioridades
      const priorityEvents = data
        .filter(ev => ev.eventoObrigatorio && ev.data && new Date(ev.data.split('T')[0] + 'T12:00:00') >= today)
        .sort((a, b) => a.data.localeCompare(b.data))
        .slice(0, 6);

      setPriorities(priorityEvents);
      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCronogramas = async () => {
    try {
      const response = await fetch('/api/cronogramas', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCronogramas(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    const dateStr = dataString.split('T')[0];
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  };

  const formatModalityToId = (modName) => {
    const baseMod = modName.split(' - ')[0];
    const nameMapReverse = {
      'Atletismo': 'atletismo',
      'Badminton': 'badminton',
      'Tênis de Mesa': 'tenis-de-mesa',
      'Xadrez': 'xadrez',
      'Basquete': 'basquete',
      'Futsal': 'futsal',
      'Futebol': 'futebol',
      'Handebol': 'handebol',
      'Vôlei de Quadra': 'volei-quadra',
      'Vôlei de Praia': 'volei-praia'
    };
    return nameMapReverse[baseMod] || baseMod.toLowerCase().replace(/\s+/g, '-');
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
      <div className="container-fluid p-0 pb-5">
        
        {/* Saudação */}
        <div className="mb-5 d-flex justify-content-between align-items-end">
          <div>
            <h2 className="fw-bold text-blue-dark mb-1">Olá, {userName.split(' ')[0]} 👋</h2>
            <p className="text-muted mb-0">Aqui está o painel de controle e acompanhamento das suas equipes.</p>
          </div>
        </div>

        {/* 1. Atletas Ativos (O único card superior mantido) */}
        <div className="row g-4 mb-5">
          <div className="col-md-4 col-lg-3">
            <div className="card-flat p-4 h-100 shadow-sm d-flex flex-column justify-content-center align-items-center text-center bg-white" style={{ borderRadius: '16px' }}>
              <div className="bg-orange-light text-orange rounded-circle d-flex align-items-center justify-content-center mb-3 transition hover-scale" style={{width: '64px', height: '64px', fontSize: '1.75rem'}}>
                <i className="bi bi-people-fill"></i>
              </div>
              <h1 className="fw-bold text-blue-dark mb-0 lh-1">45</h1>
              <span className="text-muted small fw-bold mt-2 text-uppercase" style={{ letterSpacing: '1px' }}>Atletas Ativos</span>
            </div>
          </div>
        </div>

        {/* 2. Metas Gerais */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-blue-dark mb-0 d-flex align-items-center">
              <i className="bi bi-bullseye text-orange me-3 fs-3"></i>Metas Gerais
            </h4>
            <Link to="/agenda" className="btn btn-outline-primary btn-sm fw-bold rounded-pill px-4 shadow-sm transition">Gerenciar Metas</Link>
          </div>
          
          <div className="row g-4">
            {goals.map(g => (
              <div key={g.id} className="col-md-6 col-lg-4">
                <div className="card-flat p-4 h-100 shadow-sm border-0 position-relative overflow-hidden bg-white" style={{ borderRadius: '16px' }}>
                  <div className="position-absolute top-0 start-0 h-100" style={{ width: '6px', backgroundColor: g.done ? '#22c55e' : '#f97316' }}></div>
                  
                  <div className="d-flex justify-content-between align-items-start ms-2 mb-3">
                    <h6 className={`fw-bold mb-0 lh-base ${g.done ? 'text-muted text-decoration-line-through' : 'text-blue-dark'}`} style={{ fontSize: '1.05rem' }}>
                      {g.text}
                    </h6>
                    <div className="ms-3 flex-shrink-0">
                      {g.done ? <i className="bi bi-check-circle-fill text-success fs-4 shadow-sm rounded-circle bg-white"></i> : <i className="bi bi-circle text-muted fs-4"></i>}
                    </div>
                  </div>
                  
                  <div className="ms-2 mt-auto">
                    <span className={`badge rounded-pill px-3 py-2 fw-bold ${g.done ? 'bg-success text-white shadow-sm' : 'bg-orange-light text-orange'}`}>
                      {g.done ? 'Concluída' : 'Em andamento'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Prioridades */}
        <div className="mb-5 pt-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-blue-dark mb-0 d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill text-danger me-3 fs-3"></i>Prioridades
            </h4>
            <Link to="/agenda" className="btn btn-outline-primary btn-sm fw-bold rounded-pill px-4 shadow-sm transition">Gerenciar Prioridades</Link>
          </div>
          
          <div className="row g-4">
            {priorities.length > 0 ? priorities.map(ev => (
              <div key={ev._id} className="col-md-6 col-lg-4">
                <div className="card-flat p-4 h-100 shadow-sm border-0 position-relative overflow-hidden bg-white" style={{ borderRadius: '16px' }}>
                  <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px', backgroundColor: '#ef4444' }}></div>
                  <div className="d-flex flex-column h-100">
                    <h6 className="fw-bold text-dark mb-3 lh-base" style={{ fontSize: '1.05rem' }}>{ev.titulo}</h6>
                    
                    <div className="mt-auto d-flex align-items-center p-2 rounded-3 bg-light text-muted small fw-bold">
                      <i className="bi bi-calendar-event me-2 text-danger"></i>
                      {formatarData(ev.data)} às {ev.horaInicial || ev.hora || '12:00'}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-12">
                <div className="p-5 border-0 rounded-4 text-center shadow-sm" style={{ backgroundColor: '#F8FAFC' }}>
                  <i className="bi bi-emoji-smile fs-1 text-muted opacity-50 mb-3 d-block"></i>
                  <h6 className="text-muted fw-bold mb-0">Nenhuma prioridade urgente no momento.</h6>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Cronogramas */}
        <div className="mb-2 pt-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-blue-dark mb-0 d-flex align-items-center">
              <i className="bi bi-calendar-range-fill text-primary me-3 fs-3"></i>Cronogramas
            </h4>
          </div>
          
          {loading ? (
             <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : cronogramas.length > 0 ? (
            <div className="row g-4">
              {cronogramas.map(cron => (
                <div key={cron._id} className="col-md-6 col-lg-4">
                  <div className="card-flat p-0 h-100 shadow-sm border-0 d-flex flex-column bg-white overflow-hidden" style={{ borderRadius: '16px' }}>
                    <div className="p-4 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className="badge bg-blue-light text-blue-dark px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
                          {cron.modalidade}
                        </span>
                        <div className="text-muted opacity-50"><i className="bi bi-clipboard-data fs-5"></i></div>
                      </div>
                      
                      <h5 className="fw-bold text-blue-dark mb-3 lh-base">{cron.titulo}</h5>
                      
                      <div className="d-flex align-items-center text-muted small fw-medium mt-auto bg-light p-2 rounded-3">
                        <i className="bi bi-calendar3 me-2 text-primary"></i>
                        {new Date(cron.dataInicio).toLocaleDateString('pt-BR')} a {new Date(cron.dataFim).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="bg-light px-4 py-3 border-top d-flex justify-content-between align-items-center">
                      <small className="text-muted fw-medium" style={{ fontSize: '0.75rem' }}>Acesso rápido</small>
                      <Link to={`/esportes/${formatModalityToId(cron.modalidade)}`} className="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm transition hover-scale">
                        Abrir <i className="bi bi-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted p-5 border-0 shadow-sm" style={{ backgroundColor: '#F8FAFC', borderRadius: '16px' }}>
              <i className="bi bi-calendar-x fs-1 text-muted mb-3 d-block opacity-50"></i>
              <h5 className="fw-bold text-blue-dark mb-2">Nenhum cronograma</h5>
              <p className="mb-4 text-muted">Nenhum cronograma foi criado até o momento.</p>
              <Link to="/esportes" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm transition hover-scale">
                Criar Cronograma
              </Link>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default Home;
