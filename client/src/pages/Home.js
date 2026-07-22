import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      // Filtrar apenas eventos futuros ou de hoje
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Considerar do início do dia

      const futuros = data.filter(ev => new Date(ev.data) >= now);
      
      // Ordenar por data
      futuros.sort((a, b) => new Date(a.data) - new Date(b.data));

      setEvents(futuros);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const diaStr = diasSemana[data.getUTCDay()];
    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    return `${diaStr} (${dia}/${mes})`;
  };

  const formatarHora = (horaString) => {
    return horaString;
  };

  const treinos = events.filter(e => e.tipo === 'Treino' || e.tipo === 'treino');
  const proximos = events.filter(e => e.tipo === 'Amistoso' || e.tipo === 'Campeonato' || e.tipo === 'amistoso' || e.tipo === 'competição');

  return (
    <Layout>
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="row g-4 mt-1">
          {/* Coluna Treinos Hoje */}
          <div className="col-lg-6">
            <div className="card-flat p-4 h-100 shadow-sm">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-orange-secondary rounded-pill me-3" style={{ width: '12px', height: '40px' }}></div>
                <div>
                  <h4 className="fw-bold text-blue-dark mb-0">Treinos futuros</h4>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                {treinos.length > 0 ? treinos.map(treino => (
                  <div key={treino._id} className="bg-blue-light rounded-4 p-4 position-relative shadow-sm" style={{ borderLeft: `5px solid ${treino.cor || '#22c55e'}` }}>
                    <h5 className="fw-bold text-blue-dark mb-3">{treino.titulo}</h5>
                    <div className="d-flex justify-content-between text-blue-dark">
                      <span>{formatarData(treino.data)} - {treino.hora}</span>
                      <span>{treino.local}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-muted text-center py-3">Nenhum treino programado.</div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Eventos Próximos */}
          <div className="col-lg-6">
            <div className="card-flat p-4 h-100 shadow-sm">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-blue-dark rounded-pill me-3" style={{ width: '12px', height: '40px' }}></div>
                <div>
                  <h4 className="fw-bold text-blue-dark mb-0">Eventos próximos</h4>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                {proximos.length > 0 ? proximos.map(evento => (
                  <div key={evento._id} className="bg-orange-light rounded-4 p-4 position-relative shadow-sm" style={{ borderLeft: `5px solid ${evento.cor || '#f97316'}` }}>
                    <div className="d-flex justify-content-between text-blue-dark mb-3">
                      <h5 className="fw-bold mb-0">{evento.tipo} - {evento.titulo}</h5>
                      <span className="text-muted fw-bold">{evento.local}</span>
                    </div>
                    <div className="text-orange">{formatarData(evento.data)} - {evento.hora}</div>
                  </div>
                )) : (
                  <div className="text-muted text-center py-3">Nenhum evento programado.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Home;
