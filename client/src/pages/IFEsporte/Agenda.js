import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import Layout from '../../components/Layout';
import MainCalendar from './components/MainCalendar';
import EventModal from './components/EventModal';
import { addNotification } from '../../utils/notifications';
import '../../agenda.css';
import { apiUrl } from '../../services/api';

const categoriesColors = {
  'Treino': '#3b82f6',
  'Jogo': '#22c55e',
  'Campeonato': '#f97316',
  'Reunião': '#8b5cf6',
  'Avaliação': '#06b6d4',
  'Amistoso': '#14b8a6',
  'Educação Física': '#10b981',
  'Urgente': '#ef4444',
  'Outro': '#64748b'
};

const Agenda = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const userType = localStorage.getItem('tipo');
  const isStudent = (userType || '').toLowerCase() === 'estudante';

  useEffect(() => {
    fetchEvents();
  }, []);

  const parseEventForCalendar = (ev) => {
    const dateStr = ev.data ? (typeof ev.data === 'string' ? ev.data.split('T')[0] : new Date(ev.data).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0];
    
    const startStr = ev.horaInicial || ev.hora || '12:00';
    const endStr = ev.horaFinal || (
      `${String(parseInt(startStr.split(':')[0]) + 1).padStart(2, '0')}:${startStr.split(':')[1]}`
    );

    const start = new Date(`${dateStr}T${startStr}:00`);
    const end = new Date(`${dateStr}T${endStr}:00`);

    return {
      ...ev,
      start,
      end,
      title: ev.titulo || 'Evento'
    };
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/events'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map(parseEventForCalendar);
        setEvents(formatted);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos da agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setCurrentDate(date);
  };

  const handleSelectSlot = ({ start, end }) => {
    if (isStudent) return;
    
    setSelectedEvent({
      start,
      end,
      data: start.toISOString(),
      horaInicial: start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      horaFinal: end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleEventDrop = async ({ event, start, end }) => {
    if (isStudent || event.isPhysicalEducation) return;
    
    const updatedEvent = {
      ...event,
      start,
      end,
      data: start.toISOString(),
      horaInicial: start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      horaFinal: end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setEvents(prev => prev.map(ev => ev._id === event._id ? updatedEvent : ev));
    await saveEventToApi(updatedEvent);
  };

  const handleEventResize = async ({ event, start, end }) => {
    if (isStudent || event.isPhysicalEducation) return;

    const updatedEvent = {
      ...event,
      start,
      end,
      data: start.toISOString(),
      horaInicial: start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      horaFinal: end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setEvents(prev => prev.map(ev => ev._id === event._id ? updatedEvent : ev));
    await saveEventToApi(updatedEvent);
  };

  const saveEventToApi = async (eventData) => {
    if (isStudent) return;

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
        addNotification(isNew ? 'Novo Evento Criado' : 'Evento Atualizado', `Evento "${payload.titulo}" salvo na Agenda.`);
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
    if (isStudent) return;
    if (!window.confirm("Deseja realmente excluir este evento?")) return;
    try {
      await fetch(apiUrl(`/api/events/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      addNotification('Evento Excluído', 'O compromisso foi removido da Agenda.');
      fetchEvents();
      setShowModal(false);
      setSelectedEvent(null);
    } catch(err) {
      console.error('Erro ao excluir evento:', err);
    }
  };

  return (
    <Layout>
      <div style={{ width: '100%', maxWidth: 'var(--content-max-width)', margin: '0 auto', paddingBottom: '32px' }}>
        
        {/* ── Header da Página: Fora do Calendário com Ícone e Descrição ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.5rem', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                Agenda
              </h1>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0', lineHeight: 1.3 }}>
                Organize e acompanhe seus compromissos, treinos, jogos e eventos.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isStudent && (
              <button 
                className="btn btn-primary"
                style={{
                  padding: '10px 22px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onClick={() => {
                  setSelectedEvent(null);
                  setShowModal(true);
                }}
              >
                <Plus size={18} /> <span>Novo Evento</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Calendário Principal (Elemento Central e Amplo) ── */}
        <div style={{
          height: 'calc(100dvh - 210px)',
          minHeight: '580px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          background: 'var(--bg-card)',
          overflow: 'hidden',
          width: '100%',
          position: 'relative'
        }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
              <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
            </div>
          ) : (
            <MainCalendar 
              events={events}
              currentDate={currentDate}
              onNavigate={handleDateChange}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              categoriesColors={categoriesColors}
            />
          )}
        </div>

        {/* ── Modal de Criação / Edição / Visualização de Eventos ── */}
        <EventModal 
          show={showModal} 
          eventData={selectedEvent} 
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveModal}
          onDelete={handleDelete}
          userType={userType}
        />

      </div>
    </Layout>
  );
};

export default Agenda;
