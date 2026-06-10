import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const Esportes = () => {
  const [sports, setSports] = useState([]);
  const navigate = useNavigate();

  const defaultSports = [
    { nome: 'Atletismo', tipo: 'individual', alunos: 15 },
    { nome: 'Badminton', tipo: 'individual', alunos: 8 },
    { nome: 'Xadrez', tipo: 'individual', alunos: 12 },
    { nome: 'Basquete', tipo: 'coletivo', alunos: 20 },
    { nome: 'Handebol', tipo: 'coletivo', alunos: 18 },
    { nome: 'Futsal', tipo: 'coletivo', alunos: 25 },
  ];

  useEffect(() => {
    // In a real scenario, fetch from API.
    // For now, I'll use the default list to ensure the UI looks good as per prompt.
    setSports(defaultSports);
  }, []);

  const renderSportCard = (sport) => (
    <div className="col-md-4 mb-4" key={sport.nome}>
      <div 
        className="card shadow-sm border-0 h-100 sport-card" 
        onClick={() => navigate(`/esportes/${sport.nome.toLowerCase()}`)}
        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      >
        <div className="card-body text-center d-flex flex-column justify-content-center">
          <div className="mb-3">
            <i className={`bi bi-${sport.tipo === 'individual' ? 'person' : 'people'} fs-1 text-primary`}></i>
          </div>
          <h4 className="card-title">{sport.nome}</h4>
          <p className="text-muted mb-0">{sport.alunos} alunos cadastrados</p>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <h2 className="mb-4">Modalidades Esportivas</h2>
      
      <h4 className="mb-3">Modalidades Individuais</h4>
      <div className="row mb-4">
        {sports.filter(s => s.tipo === 'individual').map(renderSportCard)}
      </div>

      <h4 className="mb-3">Modalidades em Equipe</h4>
      <div className="row">
        {sports.filter(s => s.tipo === 'coletivo').map(renderSportCard)}
      </div>
    </Layout>
  );
};

export default Esportes;
