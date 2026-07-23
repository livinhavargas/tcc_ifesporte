import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  SportsSoccer, 
  EventNote, 
  Flag, 
  People, 
  Warning, 
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';

const CalendarSidebar = ({ 
  currentDate, 
  onDateChange, 
  events, 
  categoriesColors 
}) => {
  const userType = localStorage.getItem('tipo');

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('agenda_goals');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Preparar equipe para campeonato', done: false },
      { id: 2, text: 'Finalizar avaliações físicas', done: false },
      { id: 3, text: 'Organizar amistoso', done: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('agenda_goals', JSON.stringify(goals));
  }, [goals]);

  const toggleGoal = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, done: !g.done } : g));
  };

  // Filtrar Próximos Eventos (A partir de hoje)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const limitEvents = userType === 'estudante' ? 10 : 4;

  const upcomingEvents = events
    .filter(ev => new Date(ev.start) >= today)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, limitEvents);

  // Filtrar Prioridades (Eventos com eventoObrigatorio = true)
  const priorityEvents = events
    .filter(ev => ev.eventoObrigatorio && new Date(ev.start) >= today)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 3);

  const getEventIcon = (tipo) => {
    switch(tipo) {
      case 'Treino': return <SportsSoccer fontSize="small" style={{ color: categoriesColors.Treino }} />;
      case 'Amistoso': return <Flag fontSize="small" style={{ color: categoriesColors.Amistoso }} />;
      case 'Campeonato': return <Flag fontSize="small" style={{ color: categoriesColors.Campeonato }} />;
      case 'Reunião': return <People fontSize="small" style={{ color: categoriesColors.Reunião }} />;
      case 'Avaliação': return <EventNote fontSize="small" style={{ color: categoriesColors.Avaliação }} />;
      case 'Urgente': return <Warning fontSize="small" style={{ color: categoriesColors.Urgente }} />;
      default: return <EventNote fontSize="small" style={{ color: categoriesColors.Outro }} />;
    }
  };

  const formatDateLabel = (date) => {
    const evDate = new Date(date);
    if (evDate.toDateString() === new Date().toDateString()) return 'Hoje';
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (evDate.toDateString() === tomorrow.toDateString()) return 'Amanhã';

    return evDate.toLocaleDateString('pt-BR', { weekday: 'long' });
  };

  return (
    <div className="calendar-sidebar bg-white h-100 p-3 overflow-auto border-end d-flex flex-column">
      
      {/* Mini Calendário */}
      <div className="mb-4 d-flex justify-content-center w-100 mini-calendar-container">
        <Calendar 
          onChange={onDateChange} 
          value={currentDate} 
          className="border-0 shadow-none"
          locale="pt-BR"
          tileClassName={({ date, view }) => {
             // Highlight days with events
             if (view === 'month') {
               const hasEvent = events.some(ev => new Date(ev.start).toDateString() === date.toDateString());
               return hasEvent ? 'has-event-tile' : null;
             }
          }}
        />
      </div>

      {/* Próximos Eventos */}
      <div className={`mb-2 ${userType === 'estudante' ? 'flex-grow-1 overflow-auto pe-1' : 'mb-4'}`}>
        <h6 className="text-muted fw-bold mb-3 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Próximos Eventos</h6>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(ev => (
            <div key={ev._id || ev.id} className="d-flex align-items-start mb-3 p-2 rounded event-sidebar-card shadow-sm border">
              <div className="me-3 mt-1">
                {getEventIcon(ev.tipo)}
              </div>
              <div>
                <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>{ev.title}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {formatDateLabel(ev.start)} • {new Date(ev.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted small">Nenhum evento próximo.</p>
        )}
      </div>

      {userType !== 'estudante' && (
        <>
          {/* Prioridades da Semana */}
          <div className="mb-4">
            <h6 className="text-muted fw-bold mb-3 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Prioridades</h6>
            {priorityEvents.length > 0 ? (
              priorityEvents.map(ev => (
                <div key={`prio-${ev._id || ev.id}`} className="d-flex align-items-center mb-2">
                  <Warning fontSize="small" className="text-danger me-2" />
                  <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                    {ev.title}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted small">Sem prioridades urgentes.</p>
            )}
          </div>

          {/* Metas Gerais */}
          <div className="mb-4">
            <h6 className="text-muted fw-bold mb-3 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Metas Gerais</h6>
            <div>
              {goals.map(g => (
                <div key={g.id} className="d-flex align-items-center mb-2 cursor-pointer" onClick={() => toggleGoal(g.id)} style={{ cursor: 'pointer' }}>
                  {g.done ? <CheckCircle fontSize="small" className="text-success me-2" /> : <RadioButtonUnchecked fontSize="small" className="text-muted me-2" />}
                  <span className={g.done ? 'text-decoration-line-through text-muted' : 'text-dark'} style={{ fontSize: '0.85rem' }}>
                    {g.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
    </div>
  );
};

export default CalendarSidebar;
