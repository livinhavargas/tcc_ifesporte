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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const limitEvents = userType === 'estudante' ? 10 : 4;

  const upcomingEvents = events
    .filter(ev => new Date(ev.start) >= today)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, limitEvents);

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
    <div style={{
      height: '100%',
      padding: '24px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      
      {/* Mini Calendar container */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }} className="mini-calendar-container">
        <Calendar 
          onChange={onDateChange} 
          value={currentDate} 
          className="border-0 shadow-none"
          locale="pt-BR"
          tileClassName={({ date, view }) => {
             if (view === 'month') {
               const hasEvent = events.some(ev => new Date(ev.start).toDateString() === date.toDateString());
               return hasEvent ? 'has-event-tile' : null;
             }
          }}
        />
      </div>

      {/* Próximos Eventos */}
      <div style={{ display: 'flex', flexDirection: 'column' }} className={userType === 'estudante' ? 'flex-grow-1 overflow-auto' : ''}>
        <h6 style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Próximos Eventos</h6>
        {upcomingEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingEvents.map(ev => (
              <div key={ev._id || ev.id} style={{
                display: 'flex',
                alignItems: 'start',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg)',
                border: '1px solid var(--border-light)',
                gap: '12px'
              }} className="hover-scale-sm">
                <div style={{ marginTop: '2px' }}>
                  {getEventIcon(ev.tipo)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '2px' }}>
                    {formatDateLabel(ev.start)} • {new Date(ev.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>Nenhum evento próximo.</p>
        )}
      </div>

      {userType !== 'estudante' && (
        <>
          {/* Prioridades */}
          <div>
            <h6 style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Prioridades</h6>
            {priorityEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {priorityEvents.map(ev => (
                  <div key={`prio-${ev._id || ev.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--error-light)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--error)' }}>
                    <Warning fontSize="small" className="text-danger" />
                    <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.title}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>Sem prioridades urgentes.</p>
            )}
          </div>

          {/* Metas Gerais */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h6 style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Metas Gerais</h6>
              <button 
                onClick={() => {
                  setEditingGoal(null);
                  setGoalFormData({ text: '', descricao: '', prazo: '' });
                  setShowGoalForm(!showGoalForm);
                }}
                style={{
                  background: 'none', border: 'none', color: 'var(--primary)',
                  fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <i className={`bi bi-${showGoalForm ? 'x' : 'plus-lg'}`}></i>
                {showGoalForm ? 'Cancelar' : 'Nova Meta'}
              </button>
            </div>

            {showGoalForm && (
              <div style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                border: '1.5px solid var(--border)',
                marginBottom: '16px'
              }}>
                <form onSubmit={handleGoalSubmit}>
                  <div style={{ marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Título da meta *" 
                      value={goalFormData.text}
                      onChange={(e) => setGoalFormData({...goalFormData, text: e.target.value})}
                      required
                      style={{
                        width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', fontFamily: 'var(--font)',
                        outline: 'none', background: 'var(--bg-card)'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <textarea 
                      placeholder="Descrição (opcional)"
                      rows="2"
                      value={goalFormData.descricao}
                      onChange={(e) => setGoalFormData({...goalFormData, descricao: e.target.value})}
                      style={{
                        width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', fontFamily: 'var(--font)',
                        outline: 'none', background: 'var(--bg-card)', resize: 'vertical'
                      }}
                    ></textarea>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <input 
                      type="date" 
                      value={goalFormData.prazo}
                      onChange={(e) => setGoalFormData({...goalFormData, prazo: e.target.value})}
                      style={{
                        width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', fontFamily: 'var(--font)',
                        outline: 'none', background: 'var(--bg-card)', color: 'var(--text-secondary)'
                      }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', borderRadius: 'var(--radius-sm)' }}>
                    {editingGoal ? 'Salvar Meta' : 'Adicionar Meta'}
                  </button>
                </form>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {goals.map(g => (
                <div key={g.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', cursor: 'pointer', gap: '8px' }} onClick={() => toggleGoal(g.id)}>
                    <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center' }}>
                      {g.done ? <CheckCircle fontSize="small" className="text-success" /> : <RadioButtonUnchecked fontSize="small" className="text-muted" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: g.done ? 'var(--text-tertiary)' : 'var(--text)',
                        textDecoration: g.done ? 'line-through' : 'none'
                      }}>
                        {g.text}
                      </span>
                      {g.prazo && (
                         <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <i className="bi bi-calendar-event"></i>
                           Prazo: {new Date(g.prazo + 'T12:00:00').toLocaleDateString('pt-BR')}
                         </div>
                      )}
                      {g.descricao && (
                         <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '4px 0 0' }}>
                           {g.descricao}
                         </p>
                      )}
                    </div>
                    {userType !== 'estudante' && (
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px' }} onClick={(e) => handleEditGoal(e, g)}>
                          <i className="bi bi-pencil-fill" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                        <button style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '2px' }} onClick={(e) => handleDeleteGoal(e, g.id)}>
                          <i className="bi bi-trash-fill" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {goals.length === 0 && !showGoalForm && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>Nenhuma meta cadastrada.</p>
              )}
            </div>
          </div>
        </>
      )}
      
    </div>
  );
};

export default CalendarSidebar;
