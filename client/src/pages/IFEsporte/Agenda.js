import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import CalendarSidebar from './components/CalendarSidebar';
import MainCalendar from './components/MainCalendar';
import EventModal from './components/EventModal';
import '../../agenda.css';

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

const Agenda = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const userType = localStorage.getItem('tipo');

  useEffect(() => {
    fetchEvents();
  }, []);

  const parseEventForCalendar = (ev) => {
    const dateStr = ev.data ? ev.data.split('T')[0] : new Date().toISOString().split('T')[0];
    
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
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map(parseEventForCalendar);
        setEvents(formatted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setCurrentDate(date);
  };

  const handleSelectSlot = ({ start, end }) => {
    if (userType === 'estudante') return;
    
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
    if (userType === 'estudante') return;
    
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
    if (userType === 'estudante') return;

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

  return (
    <Layout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 128px)',
        margin: '-32px',
        background: 'var(--bg-card)',
        overflow: 'hidden'
      }}>
        
        {/* Agenda Inner Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 32px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-calendar-range" style={{ color: 'var(--primary)' }}></i> 
              Agenda
            </h4>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date())} style={{ borderRadius: 'var(--radius-sm)' }}>
              Hoje
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             {userType !== 'estudante' && (
              <button 
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.8125rem' }}
                onClick={() => {
                  setSelectedEvent(null);
                  setShowModal(true);
                }}
              >
                <i className="bi bi-plus-lg me-1"></i> Criar Evento
              </button>
             )}
          </div>
        </div>

        {/* Content Panel */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Calendar Sidebar */}
          <div className="d-none d-lg-block" style={{ width: '280px', flexShrink: 0, borderRight: '1px solid var(--border-light)' }}>
            <CalendarSidebar 
              currentDate={currentDate} 
              onDateChange={handleDateChange} 
              events={events}
              categoriesColors={categoriesColors}
            />
          </div>

          {/* Main Calendar Panel */}
          <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-card)' }} className="main-calendar-container">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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

        </div>

        {/* Create/Edit Modal */}
        <EventModal 
          show={showModal} 
          eventData={selectedEvent} 
          onClose={() => setShowModal(false)}
          onSave={handleSaveModal}
          onDelete={handleDelete}
          userType={userType}
        />

      </div>
    </Layout>
  );
};

export default Agenda;
