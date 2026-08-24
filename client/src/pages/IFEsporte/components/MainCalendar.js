import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import SportIcon, { detectSport } from '../../../components/SportIcon';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

const EventComponent = ({ event }) => {
  const textToMatch = `${event.title || ''} ${event.titulo || ''} ${event.descricao || ''} ${event.modalidade || ''}`;
  const detected = detectSport(textToMatch);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
      {detected && <SportIcon sport={detected} size={14} color="#fff" style={{ flexShrink: 0 }} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</span>
    </div>
  );
};

const MainCalendar = ({
  events,
  currentDate,
  onNavigate,
  onSelectEvent,
  onSelectSlot,
  onEventDrop,
  onEventResize,
  categoriesColors
}) => {

  const eventStyleGetter = (event, start, end, isSelected) => {
    let backgroundColor = categoriesColors[event.tipo] || categoriesColors.Outro;
    if (event.eventoObrigatorio) {
      backgroundColor = categoriesColors.Urgente; // Override se for urgente/prioridade
    }
    
    let style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      padding: '2px 5px',
      fontSize: '0.8rem',
      fontWeight: '500',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };
    
    return {
      style
    };
  };

  return (
    <div className="main-calendar-container p-3 h-100" style={{ background: 'var(--bg-card)', color: 'var(--text)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <DnDCalendar
        localizer={localizer}
        events={events}
        date={currentDate}
        onNavigate={onNavigate}
        defaultView="month"
        views={['month', 'week', 'day', 'agenda']}
        step={30}
        showMultiDayTimes
        selectable
        resizable
        components={{
          event: EventComponent
        }}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        eventPropGetter={eventStyleGetter}
        culture="pt-BR"
        messages={{
          allDay: 'Dia Inteiro',
          previous: 'Anterior',
          next: 'Próximo',
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
          agenda: 'Agenda',
          date: 'Data',
          time: 'Hora',
          event: 'Evento',
          noEventsInRange: 'Não há eventos neste período.',
          showMore: total => `+ ${total} eventos`
        }}
        style={{ height: '100%', flex: 1, minHeight: 0 }}
      />
    </div>
  );
};

export default MainCalendar;
