import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [sportCount, setSportCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Fetch Events
        const eventsRes = await fetch('/api/events', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Se o token estiver expirado/inválido
        if (eventsRes.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }

        // Fetch Students
        const studentsRes = await fetch('/api/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (studentsRes.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudentCount(studentsData.length);
        }

        // Fetch Sports
        const sportsRes = await fetch('/api/sports', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (sportsRes.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        if (sportsRes.ok) {
          const sportsData = await sportsRes.json();
          setSportCount(sportsData.length);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da Home:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter treinos vs other events
  const treinos = events.filter(e => e.tipo === 'treino').slice(0, 5);
  const outrosEventos = events.filter(e => e.tipo !== 'treino').slice(0, 5);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="row mb-4">
        <div className="col-12">
          <h1>Olá, Treinador!</h1>
          <p className="text-muted">Bem-vindo ao IFEsporte. Aqui está o resumo das atividades esportivas do IFC.</p>
        </div>
      </div>

      <div className="row">
        {/* Próximos Treinos */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Próximos Treinos</h5>
            </div>
            <div className="card-body">
              {treinos.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {treinos.map((event, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{event.titulo}</strong>
                        <br />
                        <small className="text-muted">{event.local} - {event.hora}</small>
                      </div>
                      <span className="badge bg-info rounded-pill">
                        {new Date(event.data).toLocaleDateString('pt-BR')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">Nenhum treino agendado.</p>
              )}
            </div>
          </div>
        </div>

        {/* Eventos Futuros */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Eventos Futuros</h5>
            </div>
            <div className="card-body">
              {outrosEventos.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {outrosEventos.map((event, idx) => (
                    <li key={idx} className="list-group-item">
                      <strong>{event.titulo}</strong>
                      {event.descricao && <p className="mb-1 text-muted small">{event.descricao}</p>}
                      <small className="text-muted">
                        Data: {new Date(event.data).toLocaleDateString('pt-BR')} - {event.local}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">Nenhum evento futuro agendado.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card bg-light border-0 shadow-sm text-center p-3">
            <h3>{studentCount}</h3>
            <p className="mb-0">Alunos Ativos</p>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-light border-0 shadow-sm text-center p-3">
            <h3>{sportCount}</h3>
            <p className="mb-0">Modalidades</p>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-light border-0 shadow-sm text-center p-3">
            <h3>{events.filter(e => e.tipo === 'treino').length}</h3>
            <p className="mb-0">Treinos Agendados</p>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-light border-0 shadow-sm text-center p-3">
            <h3>{events.filter(e => e.tipo !== 'treino').length}</h3>
            <p className="mb-0">Eventos Totais</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
