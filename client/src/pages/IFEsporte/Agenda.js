import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

const Agenda = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [sports, setSports] = useState([]);
  const userType = localStorage.getItem('tipo');

  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'treino',
    data: '',
    hora: '',
    local: '',
    modalidade: '',
    descricao: ''
  });

  useEffect(() => {
    fetchEvents();
    fetchSports();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  };

  const fetchSports = async () => {
    try {
      const response = await fetch('/api/sports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSports(data);
      }
    } catch (error) {
      console.error('Erro ao buscar modalidades:', error);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!formData.titulo || !formData.data || !formData.hora || !formData.local || !formData.modalidade) {
      setMensagem('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        setMensagem(error.message || 'Erro ao adicionar evento');
        return;
      }

      setMensagem('✅ Evento adicionado com sucesso!');
      setTimeout(() => {
        setFormData({
          titulo: '',
          tipo: 'treino',
          data: '',
          hora: '',
          local: '',
          modalidade: '',
          descricao: ''
        });
        setShowForm(false);
        setMensagem('');
        fetchEvents();
      }, 1500);
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.data);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentMonth.getMonth() &&
             eventDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="col border p-3 bg-light"></div>);
  }
  for (let d = 1; d <= daysInMonth(currentMonth.getMonth(), currentMonth.getFullYear()); d++) {
    const dayEvents = getEventsForDay(d);
    days.push(
      <div key={d} className="col border p-3 bg-white" style={{ minHeight: '120px', fontSize: '0.9em' }}>
        <strong>{d}</strong>
        <div style={{ marginTop: '5px' }}>
          {dayEvents.map((event, idx) => (
            <div key={idx} className={`badge text-wrap mb-1 ${event.tipo === 'treino' ? 'bg-info' : event.tipo === 'amistoso' ? 'bg-warning' : 'bg-danger'}`}>
              {event.titulo}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Agenda de Eventos</h2>
        {(userType === 'admin' || userType === 'treinador') && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <i className="bi bi-plus-circle me-2"></i>{showForm ? 'Cancelar' : 'Novo Evento'}
          </button>
        )}
      </div>

      {/* Formulário de adicionar evento */}
      {showForm && (userType === 'admin' || userType === 'treinador') && (
        <div className="card mb-4 shadow-sm border-0">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Adicionar Novo Evento</h5>
          </div>
          <div className="card-body">
            {mensagem && <p className={`text-${mensagem.includes('✅') ? 'success' : 'danger'}`}>{mensagem}</p>}
            <form onSubmit={handleAddEvent}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="titulo" className="form-label fw-bold">Título *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    placeholder="Ex: Treino de Futsal"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="tipo" className="form-label fw-bold">Tipo de Evento *</label>
                  <select
                    className="form-select"
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                  >
                    <option value="treino">Treino</option>
                    <option value="amistoso">Amistoso</option>
                    <option value="competição">Competição</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-3 mb-3">
                  <label htmlFor="data" className="form-label fw-bold">Data *</label>
                  <input
                    type="date"
                    className="form-control"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="hora" className="form-label fw-bold">Hora *</label>
                  <input
                    type="time"
                    className="form-control"
                    id="hora"
                    name="hora"
                    value={formData.hora}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="modalidade" className="form-label fw-bold">Modalidade *</label>
                  <select
                    className="form-select"
                    id="modalidade"
                    name="modalidade"
                    value={formData.modalidade}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione uma modalidade</option>
                    {sports.map(sport => (
                      <option key={sport._id} value={sport.nome}>{sport.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-3">
                  <label htmlFor="local" className="form-label fw-bold">Local *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="local"
                    name="local"
                    value={formData.local}
                    onChange={handleInputChange}
                    placeholder="Ex: Ginásio do IFC"
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-3">
                  <label htmlFor="descricao" className="form-label">Descrição</label>
                  <textarea
                    className="form-control"
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Detalhes adicionais sobre o evento"
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="btn btn-success">
                <i className="bi bi-check-circle me-2"></i>Adicionar Evento
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          >
            ← Anterior
          </button>
          <h4 className="mb-0">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h4>
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          >
            Próximo →
          </button>
        </div>
        <div className="card-body p-0">
          <div className="row row-cols-7 g-0 text-center bg-dark text-white p-2">
            <div className="col">Dom</div>
            <div className="col">Seg</div>
            <div className="col">Ter</div>
            <div className="col">Qua</div>
            <div className="col">Qui</div>
            <div className="col">Sex</div>
            <div className="col">Sáb</div>
          </div>
          <div className="row row-cols-7 g-0">
            {days}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Agenda;
