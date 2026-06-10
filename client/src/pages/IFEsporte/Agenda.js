import React, { useState } from 'react';
import Layout from '../../components/Layout';

const Agenda = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="col border p-3 bg-light"></div>);
  }
  for (let d = 1; d <= daysInMonth(currentMonth.getMonth(), currentMonth.getFullYear()); d++) {
    days.push(
      <div key={d} className="col border p-3 bg-white" style={{ minHeight: '100px' }}>
        <strong>{d}</strong>
        {d === 15 && <div className="badge bg-primary text-wrap mt-1">Treino Futsal</div>}
        {d === 22 && <div className="badge bg-success text-wrap mt-1">Amistoso Vôlei</div>}
      </div>
    );
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Agenda de Treinos</h2>
        <button className="btn btn-primary">Novo Evento</button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <button className="btn btn-outline-secondary" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>Anterior</button>
          <h4 className="mb-0">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h4>
          <button className="btn btn-outline-secondary" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>Próximo</button>
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
