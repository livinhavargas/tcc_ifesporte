import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StudentHome from './IFesporte/StudentHome';
import EventModal from './IFesporte/components/EventModal';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const userName = localStorage.getItem('userName') || 'Usuário';
  const tipo = localStorage.getItem('tipo');

  const categoriesColors = {
    'Treino': '#3b82f6',
    'Jogo': '#22c55e',
    'Campeonato': '#f97316',
    'Reunião': '#8b5cf6',
    'Avaliação': '#06b6d4',
    'Amistoso': '#14b8a6',
    'Urgente': '#ef4444',
    'Outro': '#64748b'
  };

  const saveEventToApi = async (eventData) => {
    const isNew = !eventData._id;
    const url = isNew ? '/api/events' : `/api/events/${eventData._id}`;
    const method = isNew ? 'POST' : 'PUT';

    const payload = {
      ...eventData,
      titulo: eventData.titulo || eventData.title,
      cor: categoriesColors[eventData.tipo] || categoriesColors.Outro
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
      fetchEvents();
    }
  };

  const handleSaveModal = async (eventData) => {
    await saveEventToApi(eventData);
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Deseja realmente excluir este evento?")) return;
    try {
      await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEvents();
      setShowModal(false);
      setSelectedEvent(null);
    } catch(err) {
      console.error(err);
    }
  };

  const handleSelectEvent = (event) => {
    const dateStr = event.data ? event.data.split('T')[0] : new Date().toISOString().split('T')[0];
    const startStr = event.horaInicial || event.hora || '12:00';
    const endStr = event.horaFinal || (`${String(parseInt(startStr.split(':')[0]) + 1).padStart(2, '0')}:${startStr.split(':')[1]}`);
    
    const start = new Date(`${dateStr}T${startStr}:00`);
    const end = new Date(`${dateStr}T${endStr}:00`);

    setSelectedEvent({
      ...event,
      start,
      end,
      title: event.titulo || 'Evento'
    });
    setShowModal(true);
  };

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
            <p className="text-muted mb-0">Acompanhe rapidamente seus atletas, próximos compromissos e o planejamento das modalidades em um único lugar.</p>
          </div>
        </div>

        {/* 1. Dashboard Superior (Atletas Ativos + Próximos Eventos) */}
        <div className="row g-4 mb-5">
          {/* Atletas Ativos */}
          <div className="col-lg-4 col-xl-3">
            <div className="card-flat p-4 h-100 shadow-sm d-flex flex-column justify-content-center align-items-center text-center bg-white" style={{ borderRadius: '16px' }}>
              <div className="bg-orange-light text-orange rounded-circle d-flex align-items-center justify-content-center mb-3 transition hover-scale" style={{width: '64px', height: '64px', fontSize: '1.75rem'}}>
                <i className="bi bi-people-fill"></i>
              </div>
              <h1 className="fw-bold text-blue-dark mb-0 lh-1">45</h1>
              <span className="text-muted small fw-bold mt-2 text-uppercase" style={{ letterSpacing: '1px' }}>Atletas Ativos</span>
            </div>
          </div>
          
          {/* Próximos Eventos (Lista Compacta) */}
          <div className="col-lg-8 col-xl-9">
            <div className="card-flat p-4 h-100 shadow-sm bg-white d-flex flex-column" style={{ borderRadius: '16px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-blue-dark mb-0 d-flex align-items-center">
                  <i className="bi bi-calendar2-week-fill text-success me-2"></i>Próximos Eventos
                </h5>
                <Link to="/agenda" className="btn btn-outline-success btn-sm fw-bold rounded-pill px-4 shadow-sm transition hover-scale">Ver Agenda Completa</Link>
              </div>

              <div className="d-flex flex-column gap-3 flex-grow-1">
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const upcoming = events
                    .filter(ev => ev.data && new Date(ev.data.split('T')[0] + 'T12:00:00') >= today)
                    .sort((a, b) => a.data.localeCompare(b.data))
                    .slice(0, 5);

                  if (upcoming.length === 0) {
                    return (
                      <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center p-4 bg-light rounded-3">
                        <i className="bi bi-calendar-x fs-2 text-muted opacity-50 mb-2"></i>
                        <h6 className="fw-bold text-dark mb-1">Sem próximos eventos</h6>
                        <p className="text-muted small mb-3">Não há eventos programados no momento.</p>
                        <Link to="/agenda" className="btn btn-sm btn-primary rounded-pill px-3 fw-bold transition hover-scale">Ir para Agenda</Link>
                      </div>
                    );
                  }

                  return upcoming.map(ev => {
                    let icon = 'bi-calendar-event';
                    let colorClass = 'text-info';
                    let bgClass = 'bg-info bg-opacity-10';

                    if (ev.tipo?.toLowerCase() === 'treino') { 
                      icon = 'bi-activity'; 
                      colorClass = 'text-primary'; 
                      bgClass = 'bg-primary bg-opacity-10'; 
                    }
                    if (ev.tipo?.toLowerCase() === 'amistoso') { 
                      icon = 'bi-people-fill'; 
                      colorClass = 'text-success'; 
                      bgClass = 'bg-success bg-opacity-10'; 
                    }
                    if (ev.tipo?.toLowerCase() === 'campeonato') { 
                      icon = 'bi-trophy-fill'; 
                      colorClass = 'text-warning'; 
                      bgClass = 'bg-warning bg-opacity-10'; 
                    }

                    return (
                      <div 
                        key={ev._id} 
                        className="d-flex align-items-center p-3 border rounded-3 bg-light transition hover-scale-sm"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSelectEvent(ev)}
                      >
                        <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0 ${bgClass} ${colorClass}`} style={{ width: '48px', height: '48px' }}>
                          <i className={`bi ${icon} fs-5`}></i>
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <h6 className="fw-bold text-dark mb-0 text-truncate" title={ev.titulo}>
                              {ev.titulo} <span className="text-muted fw-normal small">({ev.tipo || 'Evento'})</span>
                            </h6>
                            <span className="badge bg-white text-dark border ms-2 flex-shrink-0 shadow-sm">
                              <i className="bi bi-clock me-1 text-muted"></i>{formatarData(ev.data)} às {ev.horaInicial || ev.hora || '12:00'}
                            </span>
                          </div>
                          {ev.local && (
                            <small className="text-muted text-truncate d-block" title={ev.local}>
                              <i className="bi bi-geo-alt-fill me-1 text-danger"></i> {ev.local}
                            </small>
                          )}
                        </div>
                        <div className="ms-3 flex-shrink-0">
                          <button className="btn btn-sm btn-light border rounded-circle shadow-sm transition hover-scale d-flex align-items-center justify-content-center" title="Visualizar" style={{ width: '36px', height: '36px' }}>
                            <i className="bi bi-chevron-right text-muted"></i>
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Planejamento (Metas Gerais + Prioridades) */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-blue-dark mb-0 d-flex align-items-center">
              <i className="bi bi-kanban text-primary me-3 fs-3"></i>Planejamento
            </h4>
            <Link to="/agenda" className="btn btn-outline-primary btn-sm fw-bold rounded-pill px-4 shadow-sm transition hover-scale">Gerenciar Planejamento</Link>
          </div>

          <div className="card-flat p-4 shadow-sm border-0 bg-white" style={{ borderRadius: '16px' }}>
            <div className="row g-5">
              {/* Metas Gerais */}
              <div className="col-lg-6">
                <h5 className="fw-bold text-dark mb-4 d-flex align-items-center">
                  <i className="bi bi-bullseye text-orange me-2 fs-5"></i>Metas Gerais
                </h5>
                <div className="d-flex flex-column gap-3">
                  {goals.map(g => (
                    <div key={g.id} className="p-3 border rounded-3 position-relative overflow-hidden bg-light transition hover-scale-sm">
                      <div className="position-absolute top-0 start-0 h-100" style={{ width: '4px', backgroundColor: g.done ? '#22c55e' : '#f97316' }}></div>
                      <div className="d-flex justify-content-between align-items-center ms-2">
                        <h6 className={`fw-bold mb-0 ${g.done ? 'text-muted text-decoration-line-through' : 'text-blue-dark'}`} style={{ fontSize: '0.95rem' }}>
                          {g.text}
                        </h6>
                        {g.done ? <i className="bi bi-check-circle-fill text-success fs-5"></i> : <i className="bi bi-circle text-muted fs-5"></i>}
                      </div>
                      {(g.prazo || g.descricao) && (
                        <div className="ms-2 mt-2">
                          {g.prazo && (
                             <div className={`small fw-bold ${g.done ? 'text-muted' : 'text-danger'} mb-1`} style={{ fontSize: '0.80rem' }}>
                               <i className="bi bi-calendar-event me-1"></i>
                               Prazo: {new Date(g.prazo + 'T12:00:00').toLocaleDateString('pt-BR')}
                             </div>
                          )}
                          {g.descricao && (
                             <div className={`small ${g.done ? 'text-muted' : 'text-secondary'}`} style={{ fontSize: '0.85rem' }}>
                               {g.descricao}
                             </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prioridades */}
              <div className="col-lg-6">
                <h5 className="fw-bold text-dark mb-4 d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill text-danger me-2 fs-5"></i>Prioridades
                </h5>
                <div className="d-flex flex-column gap-3">
                  {priorities.length > 0 ? priorities.map(ev => (
                    <div key={ev._id} className="p-3 border rounded-3 position-relative overflow-hidden bg-light transition hover-scale-sm">
                      <div className="position-absolute top-0 start-0 h-100" style={{ width: '4px', backgroundColor: '#ef4444' }}></div>
                      <div className="ms-2">
                        <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.95rem' }}>{ev.titulo}</h6>
                        <div className="d-flex align-items-center text-muted small fw-bold">
                          <i className="bi bi-calendar-event me-2 text-danger"></i>
                          {formatarData(ev.data)} às {ev.horaInicial || ev.hora || '12:00'}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 border rounded-3 text-center bg-light h-100 d-flex flex-column justify-content-center align-items-center">
                      <i className="bi bi-emoji-smile fs-2 text-muted opacity-50 mb-2"></i>
                      <h6 className="text-muted fw-bold mb-0">Nenhuma prioridade urgente.</h6>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

        {/* Modal Editar Evento (Agenda) */}
        <EventModal 
          show={showModal} 
          eventData={selectedEvent} 
          onClose={() => setShowModal(false)}
          onSave={handleSaveModal}
          onDelete={handleDelete}
          userType={tipo}
        />
      </div>
    </Layout>
  );
};

export default Home;
