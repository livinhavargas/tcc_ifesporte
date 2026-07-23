import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import CalendarSidebar from './components/CalendarSidebar';
import MainCalendar from './components/MainCalendar';
import EventModal from './components/EventModal';
import '../../agenda.css';

const categoriesColors = {
  'Treino': '#3b82f6',       // Azul
  'Jogo': '#22c55e',         // Verde
  'Campeonato': '#f97316',   // Laranja
  'Reunião': '#8b5cf6',      // Roxo
  'Avaliação': '#06b6d4',    // Ciano (como não especificado, escolhi ciano para não confundir com outros)
  'Amistoso': '#14b8a6',     // Teal
  'Urgente': '#ef4444',      // Vermelho
  'Outro': '#64748b'         // Cinza
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
    // A data é guardada no backend como YYYY-MM-DD ou Date ISOS
    const dateStr = ev.data ? ev.data.split('T')[0] : new Date().toISOString().split('T')[0];
    
    const startStr = ev.horaInicial || ev.hora || '12:00';
    const endStr = ev.horaFinal || (
      // se não tem hora final, assume 1 hora de duração
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
    
    // Create new event
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

  const handleEventDrop = async ({ event, start, end, isAllDay: droppedOnAllDaySlot }) => {
    if (userType === 'estudante') return;
    
    const updatedEvent = {
      ...event,
      start,
      end,
      data: start.toISOString(),
      horaInicial: start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      horaFinal: end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    // Update in local state for immediate feedback
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
      fetchEvents(); // Revert on failure
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
      <div className="container-fluid p-0 h-100 d-flex flex-column agenda-layout">
        
        {/* Header Superior */}
        <div className="d-flex justify-content-between align-items-center bg-white px-4 py-3 border-bottom shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <h4 className="mb-0 fw-bold text-dark d-flex align-items-center">
              <i className="bi bi-calendar-range me-2 text-primary"></i> 
              Agenda
            </h4>
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 ms-3 fw-bold" onClick={() => setCurrentDate(new Date())}>Hoje</button>
          </div>
          
          <div className="d-flex align-items-center gap-2">
             <div className="input-group input-group-sm rounded-pill overflow-hidden border">
                <span className="input-group-text bg-white border-0"><i className="bi bi-search text-muted"></i></span>
                <input type="text" className="form-control border-0 shadow-none bg-white" placeholder="Pesquisar..." style={{width: '150px'}} />
             </div>
             {userType !== 'estudante' && (
              <button 
                className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center"
                onClick={() => {
                  setSelectedEvent(null);
                  setShowModal(true);
                }}
              >
                <i className="bi bi-plus-lg me-1"></i> Criar
              </button>
             )}
          </div>
        </div>

        {/* Content Area */}
        <div className="d-flex flex-grow-1 overflow-hidden" style={{ height: 'calc(100vh - 150px)' }}>
          
          {/* Sidebar */}
          <div className="d-none d-lg-block" style={{ width: '280px', flexShrink: 0 }}>
            <CalendarSidebar 
              currentDate={currentDate} 
              onDateChange={handleDateChange} 
              events={events}
              categoriesColors={categoriesColors}
            />
          </div>

          {/* Main Calendar */}
          <div className="flex-grow-1 overflow-auto bg-light">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary"></div>
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

        {/* Modal Novo/Editar */}
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
