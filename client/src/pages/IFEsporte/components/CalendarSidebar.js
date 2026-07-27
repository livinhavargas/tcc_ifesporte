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
      { id: 1, text: 'Preparar equipe para campeonato', descricao: '', prazo: '', done: false }
    ];
  });

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalFormData, setGoalFormData] = useState({ text: '', descricao: '', prazo: '' });

  useEffect(() => {
    localStorage.setItem('agenda_goals', JSON.stringify(goals));
  }, [goals]);

  const toggleGoal = (id) => {
    if (userType === 'estudante') return;
    setGoals(goals.map(g => g.id === id ? { ...g, done: !g.done } : g));
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    if (!goalFormData.text.trim()) return;

    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal ? { ...g, ...goalFormData } : g));
    } else {
      setGoals([...goals, { 
        id: Date.now(), 
        ...goalFormData,
        done: false 
      }]);
    }
    
    setGoalFormData({ text: '', descricao: '', prazo: '' });
    setEditingGoal(null);
    setShowGoalForm(false);
  };

  const handleEditGoal = (e, g) => {
    e.stopPropagation();
    setEditingGoal(g.id);
    setGoalFormData({ text: g.text, descricao: g.descricao || '', prazo: g.prazo || '' });
    setShowGoalForm(true);
  };

  const handleDeleteGoal = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Deseja excluir esta meta?")) {
      setGoals(goals.filter(g => g.id !== id));
    }
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Metas Gerais</h6>
              {userType !== 'estudante' && (
                <button 
                  className="btn btn-sm btn-link text-primary p-0 fw-bold text-decoration-none" 
                  onClick={() => {
                    setEditingGoal(null);
                    setGoalFormData({ text: '', descricao: '', prazo: '' });
                    setShowGoalForm(!showGoalForm);
                  }}
                >
                  <i className={`bi bi-${showGoalForm ? 'x' : 'plus-lg'} me-1`}></i>
                  {showGoalForm ? 'Cancelar' : 'Nova Meta'}
                </button>
              )}
            </div>

            {showGoalForm && (
              <div className="card-flat p-3 bg-light border mb-3 rounded-3 shadow-sm">
                <form onSubmit={handleGoalSubmit}>
                  <div className="mb-2">
                    <input 
                      type="text" 
                      className="form-control form-control-sm border-0" 
                      placeholder="Título da meta *" 
                      value={goalFormData.text}
                      onChange={(e) => setGoalFormData({...goalFormData, text: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <textarea 
                      className="form-control form-control-sm border-0" 
                      placeholder="Descrição (opcional)"
                      rows="2"
                      value={goalFormData.descricao}
                      onChange={(e) => setGoalFormData({...goalFormData, descricao: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <input 
                      type="date" 
                      className="form-control form-control-sm border-0 text-muted" 
                      value={goalFormData.prazo}
                      onChange={(e) => setGoalFormData({...goalFormData, prazo: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="btn btn-sm btn-primary w-100 fw-bold rounded-pill">
                    {editingGoal ? 'Salvar Meta' : 'Adicionar Meta'}
                  </button>
                </form>
              </div>
            )}

            <div>
              {goals.map(g => (
                <div key={g.id} className="d-flex flex-column mb-2 p-2 rounded event-sidebar-card shadow-sm border bg-white">
                  <div className="d-flex align-items-start" style={{ cursor: 'pointer' }} onClick={() => toggleGoal(g.id)}>
                    <div className="mt-1">
                      {g.done ? <CheckCircle fontSize="small" className="text-success me-2" /> : <RadioButtonUnchecked fontSize="small" className="text-muted me-2" />}
                    </div>
                    <div className="flex-grow-1">
                      <span className={g.done ? 'text-decoration-line-through text-muted fw-bold' : 'text-dark fw-bold'} style={{ fontSize: '0.85rem' }}>
                        {g.text}
                      </span>
                      {g.prazo && (
                         <div className="text-muted mt-1" style={{ fontSize: '0.70rem' }}>
                           <i className="bi bi-calendar-event me-1"></i>
                           Prazo: {new Date(g.prazo + 'T12:00:00').toLocaleDateString('pt-BR')}
                         </div>
                      )}
                      {g.descricao && (
                         <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                           {g.descricao}
                         </div>
                      )}
                    </div>
                    {userType !== 'estudante' && (
                      <div className="d-flex ms-2">
                        <button className="btn btn-sm btn-link text-muted p-0 me-2" onClick={(e) => handleEditGoal(e, g)}>
                          <i className="bi bi-pencil-fill" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                        <button className="btn btn-sm btn-link text-danger p-0" onClick={(e) => handleDeleteGoal(e, g.id)}>
                          <i className="bi bi-trash-fill" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {goals.length === 0 && !showGoalForm && (
                <p className="text-muted small">Nenhuma meta cadastrada.</p>
              )}
            </div>
          </div>
        </>
      )}
      
    </div>
  );
};

export default CalendarSidebar;
