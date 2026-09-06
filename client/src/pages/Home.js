import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CalendarDays, CalendarX, Zap, Users, Trophy, Gamepad2, 
  Calendar, Target, TriangleAlert, Clock, CheckCircle2, Circle, Smile
} from 'lucide-react';
import Layout from '../components/Layout';
import StudentHome from './IFesporte/StudentHome';
import SportIcon, { detectSport } from '../components/SportIcon';
import EventModal from './IFesporte/components/EventModal';
import { apiUrl } from '../services/api';
import { addNotification } from '../utils/notifications';
import { isTaskPending } from '../utils/taskUtils';

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completingIds, setCompletingIds] = useState(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);
  
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
    const url = isNew ? apiUrl('/api/events') : apiUrl(`/api/events/${eventData._id}`);
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
      await fetch(apiUrl(`/api/events/${id}`), {
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

  useEffect(() => {
    if (tipo !== 'estudante') {
      fetchEvents();
      fetchCronogramas();
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [tipo]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(apiUrl('/api/tasks'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas no dashboard:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    setCompletingIds(prev => new Set(prev).add(taskId));
    const previousTasks = [...tasks];

    try {
      const response = await fetch(apiUrl(`/api/tasks/${taskId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ done: true })
      });

      if (!response.ok) {
        throw new Error('Falha ao concluir tarefa');
      }

      setTimeout(() => {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, done: true } : t));
        setCompletingIds(prev => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }, 220);
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      setCompletingIds(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      setTasks(previousTasks);
      addNotification('Erro ao concluir', 'Não foi possível concluir a tarefa. Tente novamente.', 'error');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(apiUrl('/api/events'), {
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
      const response = await fetch(apiUrl('/api/cronogramas'), {
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
    const baseMod = (modName || '').split(' - ')[0].trim();
    const nameMapReverse = {
      'Atletismo': 'atletismo',
      'Badminton': 'badminton',
      'Tênis de Mesa': 'tenis-de-mesa',
      'Xadrez': 'xadrez',
      'Basquete': 'basquete',
      'Futsal': 'futsal',
      'Futebol': 'futebol',
      'Handebol': 'handebol',
      'Voleibol': 'voleibol',
      'Vôlei de Quadra': 'voleibol',
      'Vôlei de Praia': 'volei-praia'
    };
    return nameMapReverse[baseMod] || baseMod.toLowerCase().replace(/\s+/g, '-');
  };

  const handleCronogramaClick = (cron) => {
    const parts = (cron.modalidade || '').split(' - ').map(p => p.trim());
    const baseMod = parts[0] || '';
    const sportId = formatModalityToId(baseMod);

    const params = new URLSearchParams();
    params.set('tab', 'cronogramas');
    if (cron.categoria) {
      params.set('genero', cron.categoria);
    }
    if (parts.length > 1) {
      params.set('cat', parts[1]);
    }
    if (parts.length > 2) {
      params.set('sub', parts[2]);
    }
    params.set('cronogramaId', cron._id);

    navigate(`/esportes/${sportId}?${params.toString()}`);
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
    if (t === 'treino') return { icon: <Zap size={20} />, color: 'var(--primary)', bg: 'var(--primary-light)' };
    if (t === 'amistoso') return { icon: <Users size={20} />, color: 'var(--success)', bg: 'var(--success-light)' };
    if (t === 'campeonato') return { icon: <Trophy size={20} />, color: 'var(--accent)', bg: 'var(--accent-light)' };
    if (t === 'jogo') return { icon: <Gamepad2 size={20} />, color: 'var(--success)', bg: 'var(--success-light)' };
    return { icon: <CalendarDays size={20} />, color: 'var(--info)', bg: 'var(--info-light)' };
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
              Ver Agenda <ArrowRight size={16} />
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
              <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CalendarX size={36} style={{ color: 'var(--text-tertiary)', opacity: 0.5, marginBottom: '12px' }} />
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
                      flexShrink: 0
                    }}>
                      {detectSport(`${ev.titulo} ${ev.descricao || ''} ${ev.modalidade || ''}`) ? (
                        <SportIcon text={`${ev.titulo} ${ev.descricao || ''} ${ev.modalidade || ''}`} size={22} color={evStyle.color} />
                      ) : (
                        evStyle.icon
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{ev.titulo}</span>
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

        {/* ── Section: Planejamento (Tarefas + Prioridades) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Tarefas */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={18} />
                </div>
                <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>Tarefas</h5>
              </div>
              <button 
                className="btn btn-outline-primary btn-sm"
                style={{ padding: '5px 12px', fontSize: '0.8125rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => navigate('/agenda?tab=tarefas')}
              >
                <i className="bi bi-calendar-check"></i> Ver tarefas na Agenda
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(() => {
                const pendingTasks = tasks.filter(t => isTaskPending(t, currentTime) || completingIds.has(t._id));
                if (pendingTasks.length === 0) {
                  return (
                    <div style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                        <CheckCircle2 size={22} />
                      </div>
                      <h6 style={{ fontWeight: 600, color: 'var(--text)', margin: '0 0 4px', fontSize: '0.875rem' }}>Tudo em dia!</h6>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>Não há tarefas pendentes no momento.</p>
                    </div>
                  );
                }

                return pendingTasks.map(t => {
                  const isCompleting = completingIds.has(t._id);
                  return (
                    <div 
                      key={t._id} 
                      style={{
                        padding: isCompleting ? '0 16px' : '12px 16px',
                        maxHeight: isCompleting ? '0px' : '120px',
                        opacity: isCompleting ? 0 : 1,
                        transform: isCompleting ? 'scale(0.96) translateX(8px)' : 'scale(1) translateX(0)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderLeft: `3px solid ${isCompleting ? 'var(--success)' : 'var(--accent)'}`,
                        transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        cursor: 'default'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                        <span style={{
                          fontWeight: 500, fontSize: '0.8125rem',
                          color: isCompleting ? 'var(--text-tertiary)' : 'var(--text)',
                          textDecoration: isCompleting ? 'line-through' : 'none',
                          display: 'block',
                          wordBreak: 'break-word',
                          transition: 'color 180ms ease'
                        }}>{t.text}</span>
                        {t.prazo && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> Prazo: {new Date(t.prazo + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTask(t._id);
                        }}
                        disabled={isCompleting}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '6px',
                          cursor: isCompleting ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          color: isCompleting ? 'var(--success)' : 'var(--text-tertiary)',
                          transition: 'all var(--transition-fast)',
                          flexShrink: 0
                        }}
                        className="task-complete-btn"
                        title="Marcar como concluída"
                        aria-label="Concluir tarefa"
                      >
                        {isCompleting ? (
                          <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                    </div>
                  );
                });
              })()}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--error-light)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TriangleAlert size={18} />
                </div>
                <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>Prioridades urgentes</h5>
              </div>
              <button 
                className="btn btn-outline-primary btn-sm"
                style={{ padding: '5px 12px', fontSize: '0.8125rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => navigate('/agenda')}
              >
                <i className="bi bi-calendar-event"></i> Ir para Agenda
              </button>
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
                    <Clock size={14} />
                    <span>{formatarData(ev.data)} às {ev.horaInicial || ev.hora || '12:00'}</span>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Smile size={28} style={{ color: 'var(--text-tertiary)', opacity: 0.5, marginBottom: '8px' }} />
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
                <div 
                  key={cron._id} 
                  onClick={() => handleCronogramaClick(cron)}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden',
                    transition: 'all var(--transition-base)',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }} 
                  className="hover-lift"
                >
                  <div style={{ padding: '24px 24px 16px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <span style={{
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <SportIcon sport={cron.modalidade} text={cron.titulo} size={14} />
                        <span>{cron.modalidade}</span>
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
                      <Calendar size={14} />
                      <span>{new Date(cron.dataInicio).toLocaleDateString('pt-BR')} — {new Date(cron.dataFim).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Abrir <ArrowRight size={16} />
                    </span>
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
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <CalendarX size={36} style={{ color: 'var(--text-tertiary)', opacity: 0.5, marginBottom: '12px' }} />
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
