import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

const Agenda = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const userType = localStorage.getItem('tipo');

  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'Treino',
    data: '',
    hora: '',
    local: '',
    descricao: ''
  });
  
  const [editingEventId, setEditingEventId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEventId ? `/api/events/${editingEventId}` : '/api/events';
      const method = editingEventId ? 'PUT' : 'POST';
      
      let eventColor = '#3b82f6'; // Azul padrão
      if (formData.tipo === 'Treino') eventColor = '#22c55e'; // Verde
      else if (formData.tipo === 'Amistoso') eventColor = '#eab308'; // Amarelo
      else if (formData.tipo === 'Campeonato') eventColor = '#f97316'; // Laranja
      
      await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({...formData, cor: eventColor})
      });
      setFormData({ titulo: '', tipo: 'Treino', data: '', hora: '', local: '', descricao: '' });
      setShowForm(false);
      setEditingEventId(null);
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEvent = async (id) => {
    if(!window.confirm("Deseja realmente excluir este evento?")) return;
    try {
      await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEvents();
    } catch(err) {
      console.error(err);
    }
  };

  const handleEditEvent = (ev) => {
    setFormData({
      titulo: ev.titulo,
      tipo: ev.tipo,
      data: ev.data ? ev.data.split('T')[0] : '',
      hora: ev.hora,
      local: ev.local,
      descricao: ev.descricao || ''
    });
    setEditingEventId(ev._id);
    setShowForm(true);
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(`${event.data}T00:00:00`);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentMonth.getMonth() &&
             eventDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth.getMonth(), currentMonth.getFullYear());
    
    // Empty slots before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="col" style={{ minHeight: '120px' }}></div>);
    }
    
    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const dayEvents = getEventsForDay(d);
      days.push(
        <div key={d} className="col p-2">
          <div className="rounded-4 p-2 h-100" style={{ backgroundColor: '#FBE6CD', minHeight: '110px' }}>
            <div className="text-blue-dark fw-bold">{d}</div>
            <div className="mt-2 d-flex flex-column gap-2">
              {dayEvents.map((ev, idx) => (
                <div key={idx} className="rounded-3 text-white p-2 text-start position-relative shadow-sm" style={{ backgroundColor: ev.cor || '#eab308', fontSize: '0.8rem' }}>
                  <div className="fw-bold text-truncate mb-1">{ev.titulo}</div>
                  <div className="d-flex align-items-center opacity-75 mb-1" style={{ fontSize: '0.7rem' }}>
                    <i className="bi bi-tag-fill me-1"></i> {ev.tipo}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <span className="fw-bold bg-white text-dark px-1 rounded" style={{ fontSize: '0.7rem' }}>{ev.hora}</span>
                    {userType === 'admin' && (
                      <div className="d-flex gap-1">
                        <i className="bi bi-pencil-fill cursor-pointer text-white opacity-75 hover-opacity-100" onClick={() => handleEditEvent(ev)}></i>
                        <i className="bi bi-trash-fill cursor-pointer text-white opacity-75 hover-opacity-100" onClick={() => handleDeleteEvent(ev._id)}></i>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Wrap in rows of 7 (Bootstrap grid row-cols-7 doesn't exist, we use flex)
    return (
      <div className="d-flex flex-wrap" style={{ rowGap: '1rem' }}>
        {days.map((day, idx) => (
          <div key={idx} style={{ width: '14.28%', padding: '0 0.5rem' }}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="card-flat p-4 shadow-sm border">
        
        {/* Calendar Header */}
        <div className="d-flex justify-content-between align-items-center mb-5 px-3">
          <div className="d-flex align-items-center">
            <button className="btn btn-link text-orange fs-2 p-0 me-4 text-decoration-none" onClick={prevMonth}>
              <i className="bi bi-chevron-left"></i>
            </button>
            {userType === 'admin' && (
              <button className="btn bg-blue-light text-blue-dark fw-bold rounded-3 px-4 py-2 d-flex align-items-center" onClick={() => {
                setFormData({ titulo: '', tipo: 'Treino', data: '', hora: '', local: '', descricao: '' });
                setEditingEventId(null);
                setShowForm(!showForm);
              }}>
                <i className={`bi bi-${showForm ? 'x' : 'plus-lg'} me-2`}></i> {showForm ? 'Cancelar' : 'Novo evento'}
              </button>
            )}
          </div>
          
          <div className="d-flex align-items-center">
            <h3 className="fw-bold text-blue-dark mb-0 me-4">
              {monthNames[currentMonth.getMonth()]} - {currentMonth.getFullYear()}
            </h3>
            <button className="btn btn-link text-orange fs-2 p-0 text-decoration-none" onClick={nextMonth}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Formulário */}
        {showForm && userType === 'admin' && (
          <div className="bg-light p-4 rounded-4 mb-4 border">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <input type="text" className="form-control" name="titulo" placeholder="Título do Evento" value={formData.titulo} onChange={handleInputChange} required />
              </div>
              <div className="col-md-3">
                <input type="date" className="form-control" name="data" value={formData.data} onChange={handleInputChange} required />
              </div>
              <div className="col-md-3">
                <input type="time" className="form-control" name="hora" value={formData.hora} onChange={handleInputChange} required />
              </div>
              <div className="col-md-6">
                <input type="text" className="form-control" name="local" placeholder="Local (ex: Quadra Poliesportiva)" value={formData.local} onChange={handleInputChange} required />
              </div>
              <div className="col-md-3">
                <select className="form-select" name="tipo" value={formData.tipo} onChange={handleInputChange}>
                  <option value="Treino">Treino</option>
                  <option value="Amistoso">Amistoso</option>
                  <option value="Campeonato">Campeonato</option>
                </select>
              </div>
              <div className="col-md-6">
                <input type="text" className="form-control" name="descricao" placeholder="Descrição Opcional" value={formData.descricao} onChange={handleInputChange} />
              </div>
              <div className="col-12 text-end">
                <button type="submit" className="btn btn-primary px-4">{editingEventId ? 'Salvar Alterações' : 'Agendar'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Days of Week Header */}
        <div className="d-flex mb-3">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-blue-dark fw-bold" style={{ width: '14.28%' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {renderCalendar()}

      </div>
    </Layout>
  );
};

export default Agenda;
