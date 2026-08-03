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
  const goals = [
    { id: 1, text: 'Preparar equipe para campeonato', done: false },
    { id: 2, text: 'Finalizar avaliações físicas', done: false },
    { id: 3, text: 'Organizar amistoso', done: false }
  ];

  useEffect(() => {
    if (tipo !== 'estudante') {
      fetchEvents();
      fetchCronogramas();
    } else {
      setLoading(false);
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

  const getEventIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'treino') return { icon: 'bi-lightning-charge-fill', color: 'var(--primary)', bg: 'var(--primary-light)' };
    if (t === 'amistoso') return { icon: 'bi-people-fill', color: 'var(--success)', bg: 'var(--success-light)' };
    if (t === 'campeonato') return { icon: 'bi-trophy-fill', color: 'var(--accent)', bg: 'var(--accent-light)' };
    if (t === 'jogo') return { icon: 'bi-controller', color: 'var(--success)', bg: 'var(--success-light)' };
    return { icon: 'bi-calendar-event-fill', color: 'var(--info)', bg: 'var(--info-light)' };
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = events
    .filter(ev => ev.data && new Date(ev.data.split('T')[0] + 'T12:00:00') >= today)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 5);

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Section: Próximos Eventos ── */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>
              Próximos Eventos
            </h3>
            <Link to="/agenda" style={{
              textDecoration: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Ver Agenda <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            {upcoming.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <i className="bi bi-calendar-x" style={{ fontSize: '2rem', color: 'var(--text-tertiary)', opacity: 0.5, display: 'block', marginBottom: '12px' }}></i>
                <h6 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Sem próximos eventos</h6>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>Não há eventos programados no momento.</p>
              </div>
            ) : (
              upcoming.map((ev, i) => {
                const evStyle = getEventIcon(ev.tipo);
                return (
                  <div
                    key={ev._id}
                    onClick={() => handleSelectEvent(ev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 24px',
                      gap: '16px',
                      cursor: 'pointer',
                      borderBottom: i < upcoming.length - 1 ? '1px solid var(--border-light)' : 'none',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: 'var(--radius-sm)',
                      background: evStyle.bg, color: evStyle.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: '1.125rem'
                    }}>
                      <i className={`bi ${evStyle.icon}`}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.titulo}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {ev.tipo || 'Evento'}{ev.modalidade ? ` · ${ev.modalidade}` : ''}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {formatarData(ev.data)} · {ev.horaInicial || ev.hora || '12:00'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Section: Planejamento (Metas + Prioridades) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Metas */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-bullseye" style={{ fontSize: '0.875rem' }}></i>
              </div>
              <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>Metas Gerais</h5>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {goals.map(g => (
                <div key={g.id} style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: `3px solid ${g.done ? 'var(--success)' : 'var(--accent)'}`,
                  transition: 'all var(--transition-fast)'
                }}>
                  <span style={{
                    fontWeight: 500, fontSize: '0.8125rem',
                    color: g.done ? 'var(--text-tertiary)' : 'var(--text)',
                    textDecoration: g.done ? 'line-through' : 'none'
                  }}>{g.text}</span>
                  <i className={`bi ${g.done ? 'bi-check-circle-fill' : 'bi-circle'}`}
                    style={{ color: g.done ? 'var(--success)' : 'var(--text-tertiary)', fontSize: '1rem' }}></i>
                </div>
              ))}
            </div>
          </div>

          {/* Prioridades */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--error-light)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '0.875rem' }}></i>
              </div>
              <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>Prioridades</h5>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {priorities.length > 0 ? priorities.map(ev => (
                <div key={ev._id} style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)',
                  borderLeft: '3px solid var(--error)',
                  transition: 'all var(--transition-fast)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text)', marginBottom: '4px' }}>{ev.titulo}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="bi bi-clock"></i>
                    {formatarData(ev.data)} às {ev.horaInicial || ev.hora || '12:00'}
                  </div>
                </div>
              )) : (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <i className="bi bi-emoji-smile" style={{ fontSize: '1.5rem', color: 'var(--text-tertiary)', opacity: 0.5, display: 'block', marginBottom: '8px' }}></i>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', fontWeight: 500 }}>Nenhuma prioridade urgente.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section: Cronogramas ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>Cronogramas</h3>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
            </div>
          ) : cronogramas.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {cronogramas.map(cron => (
                <div key={cron._id} style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden',
                  transition: 'all var(--transition-base)',
                  display: 'flex',
                  flexDirection: 'column'
                }} className="hover-lift">
                  <div style={{ padding: '24px 24px 16px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <span style={{
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.6875rem',
                        fontWeight: 600
                      }}>
                        {cron.modalidade}
                      </span>
                    </div>
                    <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '12px', fontSize: '0.9375rem', lineHeight: 1.4 }}>{cron.titulo}</h5>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      background: 'var(--bg)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <i className="bi bi-calendar3"></i>
                      {new Date(cron.dataInicio).toLocaleDateString('pt-BR')} — {new Date(cron.dataFim).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={`/esportes/${formatModalityToId(cron.modalidade)}`} style={{
                      textDecoration: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Abrir <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)'
            }}>
              <i className="bi bi-calendar-x" style={{ fontSize: '2rem', color: 'var(--text-tertiary)', opacity: 0.5, display: 'block', marginBottom: '12px' }}></i>
              <h6 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Nenhum cronograma</h6>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginBottom: '16px' }}>Nenhum cronograma foi criado até o momento.</p>
              <Link to="/esportes" className="btn btn-primary btn-sm rounded-pill px-4">Criar Cronograma</Link>
            </div>
          )}
        </div>

        {/* Modal Editar Evento */}
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
