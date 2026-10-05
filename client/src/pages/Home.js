import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CalendarDays, CalendarX, Zap, Users, Trophy, Gamepad2, 
  Calendar, Clock
} from 'lucide-react';
import Layout from '../components/Layout';
import StudentHome from './IFesporte/StudentHome';
import SportIcon, { detectSport } from '../components/SportIcon';
import EventModal from './IFesporte/components/EventModal';
import { apiUrl } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const userName = localStorage.getItem('userName') || 'Treinador';
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
      const response = await fetch(apiUrl('/api/events'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos no Início:', error);
    }
  };

  const fetchCronogramas = async () => {
    try {
      const response = await fetch(apiUrl('/api/cronogramas'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCronogramas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao buscar cronogramas no Início:', error);
    } finally {
      setLoading(false);
    }
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
      console.error('Erro ao salvar evento:', err);
      fetchEvents();
    }
  };

  const handleSaveModal = async (eventData) => {
    await saveEventToApi(eventData);
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este evento?")) return;
    try {
      await fetch(apiUrl(`/api/events/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEvents();
      setShowModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = events
    .filter(ev => ev.data && new Date(ev.data.split('T')[0] + 'T12:00:00') >= today)
    .sort((a, b) => (a.data || '').localeCompare(b.data || ''))
    .slice(0, 6);

  return (
    <Layout>
      <div style={{ width: '100%', maxWidth: 'var(--content-max-width)', margin: '0 auto', paddingBottom: '36px' }}>

        {/* ── Saudação ao Treinador ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div>
            <h2 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.5rem', letterSpacing: '-0.3px' }}>
              {getGreeting()},{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>
                {userName.split(' ')[0]}
              </span> 👋
            </h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
              Acompanhe os próximos eventos e cronogramas esportivos das suas equipes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/agenda"
              className="btn btn-secondary"
              style={{
                padding: '9px 18px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Calendar size={16} /> Ver Agenda
            </Link>
          </div>
        </div>

        {/* ── Cards de Resumo Rápido (Visão Geral Limpa) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Calendar size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Próximos Eventos
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
                {upcoming.length}
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Trophy size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Cronogramas Ativos
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
                {cronogramas.length}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section: Próximos Eventos ── */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: 'var(--primary)' }}></div>
              <h3 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>
                Próximos Eventos
              </h3>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            {upcoming.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CalendarX size={36} style={{ color: 'var(--text-tertiary)', opacity: 0.5, marginBottom: '12px' }} />
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Sem próximos eventos</h6>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: '0 0 16px' }}>Não há eventos programados no momento.</p>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setShowModal(true);
                  }}
                  className="btn btn-primary btn-sm rounded-pill px-4"
                >
                  Criar Primeiro Evento
                </button>
              </div>
            ) : (
              upcoming.map((ev, i) => {
                const evStyle = getEventIcon(ev.tipo);
                return (
                  <div
                    key={ev._id || i}
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
                      width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
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
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{ev.titulo}</span>
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-tertiary)', 
                        marginTop: '2px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>{ev.tipo || 'Evento'}</span>
                        {ev.modalidade && <span>• {ev.modalidade}</span>}
                        {ev.categoria && <span>• {ev.categoria}</span>}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg)',
                      padding: '5px 14px',
                      borderRadius: 'var(--radius-full)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={12} />
                      <span>{formatarData(ev.data)} · {ev.horaInicial || ev.hora || '12:00'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Section: Cronogramas ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: 'var(--accent)' }}></div>
              <h3 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>
                Cronogramas
              </h3>
            </div>
            <Link
              to="/esportes"
              className="btn btn-secondary"
              style={{
                padding: '9px 18px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trophy size={16} /> Gerenciar em Esportes
            </Link>
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
                    borderRadius: 'var(--radius-xl)',
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
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <SportIcon sport={cron.modalidade} text={cron.titulo} size={14} />
                        <span>{cron.modalidade}</span>
                      </span>
                    </div>
                    <h5 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '12px', fontSize: '0.9375rem', lineHeight: 1.4 }}>
                      {cron.titulo}
                    </h5>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      background: 'var(--bg)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <Calendar size={14} />
                      <span>{new Date(cron.dataInicio).toLocaleDateString('pt-BR')} — {new Date(cron.dataFim).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
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
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <CalendarX size={36} style={{ color: 'var(--text-tertiary)', opacity: 0.5, marginBottom: '12px' }} />
              <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Nenhum cronograma</h6>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginBottom: '16px' }}>Nenhum cronograma foi criado até o momento.</p>
              <Link to="/esportes" className="btn btn-primary btn-sm rounded-pill px-4">Criar Cronograma</Link>
            </div>
          )}
        </div>

        {/* Modal Editar Evento */}
        <EventModal 
          show={showModal} 
          eventData={selectedEvent} 
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveModal}
          onDelete={handleDelete}
          userType={tipo}
        />
      </div>
    </Layout>
  );
};

export default Home;
