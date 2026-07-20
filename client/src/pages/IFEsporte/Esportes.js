import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const Esportes = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSports();
  }, []);

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
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar modalidades:', error);
      setLoading(false);
    }
  };

  const renderSportCard = (sport) => (
    <div className="col-md-4 mb-4" key={sport._id || sport.nome}>
      <div 
        className="card shadow-sm border-0 h-100 sport-card" 
        onClick={() => navigate(`/esportes/${sport._id}`)}
        style={{ 
          cursor: 'pointer', 
          transition: 'transform 0.2s, box-shadow 0.2s',
          backgroundColor: sport.tipo === 'individual' ? '#e8f4f8' : '#fff4e6'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div className="card-body text-center d-flex flex-column justify-content-center">
          <div className="mb-3">
            <i className={`bi bi-${sport.tipo === 'individual' ? 'person-fill' : 'people-fill'} fs-1`} style={{ color: sport.tipo === 'individual' ? '#1e5ba8' : '#f4a942' }}></i>
          </div>
          <h4 className="card-title text-dark">{sport.nome}</h4>
          <p className="text-muted mb-2">{sport.tipo === 'individual' ? 'Individual' : 'Em Equipe'}</p>
          {sport.subcategorias && sport.subcategorias.length > 0 && (
            <p className="text-muted small">{sport.subcategorias.length} subesportes</p>
          )}
        </div>
      </div>
    </div>
  );

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

  const individualSports = sports.filter(s => s.tipo === 'individual');
  const teamSports = sports.filter(s => s.tipo === 'coletivo');

  return (
    <Layout>
      <div className="mb-4">
        <h2>Modalidades Esportivas</h2>
        <p className="text-muted">Explore e gerencie todas as modalidades do IFEsporte</p>
      </div>
      
      {individualSports.length > 0 && (
        <>
          <h4 className="mb-3 text-primary">
            <i className="bi bi-person-fill me-2"></i>Modalidades Individuais
          </h4>
          <div className="row mb-5">
            {individualSports.map(renderSportCard)}
          </div>
        </>
      )}

      {teamSports.length > 0 && (
        <>
          <h4 className="mb-3 text-warning">
            <i className="bi bi-people-fill me-2"></i>Modalidades em Equipe
          </h4>
          <div className="row">
            {teamSports.map(renderSportCard)}
          </div>
        </>
      )}

      {sports.length === 0 && (
        <div className="alert alert-info">
          Nenhuma modalidade cadastrada. Contacte o administrador para adicionar modalidades.
        </div>
      )}
    </Layout>
  );
};

export default Esportes;
