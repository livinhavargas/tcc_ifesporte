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

import SportIcon, { detectSport } from '../../../components/SportIcon';

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
  
  const limitEvents = userType === 'estudante' ? 8 : 4;

  const upcomingEvents = events
    .filter(ev => new Date(ev.start) >= today)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, limitEvents);

  const priorityEvents = events
    .filter(ev => (ev.eventoObrigatorio || ev.tipo === 'Urgente') && new Date(ev.start) >= today)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 4);

  const getEventIcon = (ev) => {
    const textToMatch = `${ev.title || ''} ${ev.titulo || ''} ${ev.descricao || ''} ${ev.modalidade || ''}`;
    const detected = detectSport(textToMatch);
    if (detected) {
      return <SportIcon sport={detected} size={16} style={{ color: 'var(--primary)' }} />;
    }
    switch(ev.tipo) {
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

    return evDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  const completedGoalsCount = goals.filter(g => g.done).length;
  const totalGoalsCount = goals.length;
  const goalProgressPct = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  return (
    <div className="agenda-custom-scrollbar" style={{
      height: '100%',
      padding: '16px 14px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      background: 'var(--bg-card)'
    }}>
      
      {/* ── 1. Mini Calendar ── */}
      <div className="mini-calendar-container">
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

      {/* ── 2. PRIORIDADES URGENTES (Destaque Principal) ── */}
      {userType !== 'estudante' && (
        <div style={{
          background: 'var(--bg)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          border: priorityEvents.length > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Warning style={{ fontSize: '0.9375rem', color: priorityEvents.length > 0 ? 'var(--error)' : 'var(--text-tertiary)' }} />
              <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Prioridades Urgentes
              </span>
            </div>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: priorityEvents.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-hover)',
              color: priorityEvents.length > 0 ? 'var(--error-text)' : 'var(--text-tertiary)',
              border: priorityEvents.length > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-light)'
            }}>
              {priorityEvents.length > 0 ? `${priorityEvents.length} urgente${priorityEvents.length > 1 ? 's' : ''}` : '0 urgentes'}
            </span>
          </div>

          {priorityEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {priorityEvents.map(ev => (
                <div 
                  key={`prio-${ev._id || ev.id}`} 
                  onClick={() => onDateChange(new Date(ev.start))}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '8px 10px', 
                    background: 'var(--error-light)', 
                    borderRadius: 'var(--radius-sm)', 
                    borderLeft: '3px solid var(--error)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  className="hover-lift-sm"
                  title="Clique para navegar até a data"
                >
                  <div style={{ flexShrink: 0 }}>
                    {getEventIcon(ev)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--error-text)', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.title || ev.titulo}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                      {formatDateLabel(ev.start)} • {new Date(ev.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: '6px 8px', 
              borderRadius: 'var(--radius-sm)', 
              background: 'var(--bg-card)', 
              fontSize: '0.75rem', 
              color: 'var(--text-tertiary)',
              textAlign: 'center' 
            }}>
              Tudo em dia • Nenhuma prioridade pendente.
            </div>
          )}
        </div>
      )}

      {/* ── 3. METAS GERAIS (Organizada e Compacta) ── */}
      {userType !== 'estudante' && (
        <div id="metas-gerais-section" style={{
          background: 'var(--bg)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Metas
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginLeft: '6px', fontWeight: 600 }}>
                {completedGoalsCount}/{totalGoalsCount} ({goalProgressPct}%)
              </span>
            </div>
            <button 
              onClick={() => {
                setEditingGoal(null);
                setGoalFormData({ text: '', descricao: '', prazo: '' });
                setShowGoalForm(!showGoalForm);
              }}
              style={{
                background: 'none', border: 'none', color: 'var(--primary)',
                fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                transition: 'all var(--transition-fast)'
              }}
              className="hover-bg-primary"
            >
              <i className={`bi bi-${showGoalForm ? 'x' : 'plus-lg'}`}></i>
              <span>{showGoalForm ? 'Fechar' : 'Nova'}</span>
            </button>
          </div>

          {/* Progress bar */}
          {totalGoalsCount > 0 && (
            <div style={{
              width: '100%',
              height: '5px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--border-light)',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${goalProgressPct}%`,
                background: goalProgressPct === 100 ? 'var(--success)' : 'var(--primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          )}

          {/* Form */}
          {showGoalForm && (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              border: '1px solid var(--border)',
              animation: 'fadeIn 0.2s ease'
            }}>
              <form onSubmit={handleGoalSubmit}>
                <div style={{ marginBottom: '6px' }}>
                  <input 
                    type="text" 
                    placeholder="Título da meta *" 
                    value={goalFormData.text}
                    onChange={(e) => setGoalFormData({...goalFormData, text: e.target.value})}
                    required
                    style={{
                      width: '100%', padding: '6px 10px', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontFamily: 'var(--font)',
                      outline: 'none', background: 'var(--bg)', color: 'var(--text)'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <textarea 
                    placeholder="Descrição rápida (opcional)"
                    rows="2"
                    value={goalFormData.descricao}
                    onChange={(e) => setGoalFormData({...goalFormData, descricao: e.target.value})}
                    style={{
                      width: '100%', padding: '6px 10px', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontFamily: 'var(--font)',
                      outline: 'none', background: 'var(--bg)', color: 'var(--text)', resize: 'none'
                    }}
                  ></textarea>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <input 
                    type="date" 
                    value={goalFormData.prazo}
                    onChange={(e) => setGoalFormData({...goalFormData, prazo: e.target.value})}
                    style={{
                      width: '100%', padding: '5px 8px', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontFamily: 'var(--font)',
                      outline: 'none', background: 'var(--bg)', color: 'var(--text)'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)' }}>
                    {editingGoal ? 'Salvar' : 'Adicionar'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowGoalForm(false)} 
                    className="btn btn-secondary btn-sm" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)' }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Goal List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }} className="agenda-custom-scrollbar">
            {goals.map(g => (
              <div key={g.id} style={{
                display: 'flex',
                alignItems: 'start',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                gap: '8px'
              }}>
                <div 
                  style={{ marginTop: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                  onClick={() => toggleGoal(g.id)}
                  title={g.done ? 'Marcar como pendente' : 'Marcar como concluída'}
                >
                  {g.done ? (
                    <CheckCircle style={{ fontSize: '1rem', color: 'var(--success)' }} />
                  ) : (
                    <RadioButtonUnchecked style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => toggleGoal(g.id)}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: g.done ? 'var(--text-tertiary)' : 'var(--text)',
                    textDecoration: g.done ? 'line-through' : 'none',
                    lineHeight: 1.3
                  }}>
                    {g.text}
                  </div>
                  {g.prazo && (
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <i className="bi bi-calendar-event"></i>
                      <span>Prazo: {new Date(g.prazo + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {g.descricao && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', margin: '2px 0 0', lineHeight: 1.2 }}>
                      {g.descricao}
                    </p>
                  )}
                </div>
                {userType !== 'estudante' && (
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px' }} 
                      onClick={(e) => handleEditGoal(e, g)}
                      title="Editar meta"
                    >
                      <i className="bi bi-pencil" style={{ fontSize: '0.6875rem' }}></i>
                    </button>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '2px' }} 
                      onClick={(e) => handleDeleteGoal(e, g.id)}
                      title="Excluir meta"
                    >
                      <i className="bi bi-trash" style={{ fontSize: '0.6875rem' }}></i>
                    </button>
                  </div>
                )}
              </div>
            ))}
            {goals.length === 0 && !showGoalForm && (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', margin: 0, textAlign: 'center', padding: '4px' }}>
                Nenhuma meta cadastrada.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── 4. PRÓXIMOS EVENTOS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-tertiary)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Próximos Eventos
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {upcomingEvents.length}
          </span>
        </div>
        {upcomingEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {upcomingEvents.map(ev => (
              <div 
                key={ev._id || ev.id} 
                onClick={() => onDateChange(new Date(ev.start))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border-light)',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }} 
                className="hover-lift-sm"
                title="Clique para navegar até a data"
              >
                <div style={{ flexShrink: 0 }}>
                  {getEventIcon(ev)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.title || ev.titulo}
                  </div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem', marginTop: '1px' }}>
                    {formatDateLabel(ev.start)} • {new Date(ev.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', margin: 0, textAlign: 'center', padding: '8px' }}>
            Nenhum evento agendado.
          </p>
        )}
      </div>

    </div>
  );
};

export default CalendarSidebar;
