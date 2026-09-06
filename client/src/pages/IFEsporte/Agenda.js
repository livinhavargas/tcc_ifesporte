import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarRange, Plus, Calendar as CalendarIcon, ListOrdered } from 'lucide-react';
import Layout from '../../components/Layout';
import CalendarSidebar from './components/CalendarSidebar';
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
  'Urgente': '#ef4444',
  'Outro': '#64748b'
};

const Agenda = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mobileTab, setMobileTab] = useState('calendar'); // 'calendar' | 'sidebar'
  
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchParams] = useSearchParams();

  const userType = localStorage.getItem('tipo');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'tarefas' || tab === 'metas') {
      setTimeout(() => {
        const el = document.getElementById('metas-gerais-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.transition = 'all 0.5s ease';
          el.style.outline = '2px solid var(--primary)';
          setTimeout(() => { el.style.outline = 'none'; }, 2500);
        }
      }, 400);
    }
  }, [searchParams]);

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
      const response = await fetch(apiUrl('/api/events'), {
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
    const url = isNew ? apiUrl('/api/events') : apiUrl(`/api/events/${eventData._id}`);
    const method = isNew ? 'POST' : 'PUT';

    const payload = {
      ...eventData,
      titulo: eventData.titulo || eventData.title,
      cor: categoriesColors[eventData.tipo] || categoriesColors.Outros
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
        addNotification(isNew ? 'Novo Evento Criado' : 'Evento Atualizado', `Evento "${payload.titulo}" agendado na Agenda.`);
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
      addNotification('Evento Excluído', 'Um compromisso foi removido da Agenda.');
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
        height: 'calc(100vh - 132px)',
        minHeight: '620px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-md)',
        background: 'var(--bg-card)',
        overflow: 'hidden'
      }}>
        
        {/* Agenda Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-card)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.0625rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarRange size={18} style={{ color: 'var(--primary)' }} /> 
              <span>Agenda</span>
            </h4>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setCurrentDate(new Date())} 
              style={{ borderRadius: 'var(--radius-xs)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}
            >
              Hoje
            </button>

            {/* Mobile View Toggle Buttons */}
            <div className="d-flex d-lg-none" style={{ gap: '4px', marginLeft: '8px' }}>
              <button 
                onClick={() => setMobileTab('calendar')}
                className={`btn btn-sm ${mobileTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 8px', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <CalendarIcon size={14} /> Calendário
              </button>
              <button 
                onClick={() => setMobileTab('sidebar')}
                className={`btn btn-sm ${mobileTab === 'sidebar' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 8px', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ListOrdered size={14} /> Painel Lateral
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             {userType !== 'estudante' && (
              <button 
                className="btn btn-primary"
                style={{ padding: '6px 16px', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-sm)' }}
                onClick={() => {
                  setSelectedEvent(null);
                  setShowModal(true);
                }}
              >
                <Plus size={16} /> <span>Criar Evento</span>
              </button>
             )}
          </div>
        </div>

        {/* Content Panel */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          
          {/* Calendar Sidebar */}
          <div 
            className={`calendar-sidebar ${mobileTab === 'sidebar' ? 'd-block' : 'd-none d-lg-block'}`} 
            style={{ width: '310px', flexShrink: 0, borderRight: '1px solid var(--border-light)', height: '100%', overflow: 'hidden' }}
          >
            <CalendarSidebar 
              currentDate={currentDate} 
              onDateChange={handleDateChange} 
              events={events}
              categoriesColors={categoriesColors}
            />
          </div>

          {/* Main Calendar Panel */}
          <div 
            style={{ flex: 1, overflow: 'hidden', background: 'var(--bg-card)', height: '100%', minHeight: 0 }} 
            className={`main-calendar-container ${mobileTab === 'calendar' ? 'd-flex' : 'd-none d-lg-flex'}`}
          >
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
