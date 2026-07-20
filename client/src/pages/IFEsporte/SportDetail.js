import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const SportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sport, setSport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detalhes');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    fetchSport();
  }, [id]);

  const fetchSport = async () => {
    try {
      const response = await fetch(`/api/sports/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSport(data);
      } else {
        navigate('/esportes');
      }
    } catch (error) {
      console.error('Erro ao buscar modalidade:', error);
      navigate('/esportes');
    } finally {
      setLoading(false);
    }
  };

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

  if (!sport) {
    return (
      <Layout>
        <div className="alert alert-danger">Modalidade não encontrada</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/esportes')}>
          <i className="bi bi-arrow-left me-2"></i>Voltar
        </button>
        <h2 className="text-capitalize">{sport.nome}</h2>
        <p className="text-muted">
          {sport.tipo === 'individual' ? '🏃 Modalidade Individual' : '👥 Modalidade em Equipe'}
        </p>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'detalhes' ? 'active' : ''}`}
            onClick={() => setActiveTab('detalhes')}
          >
            <i className="bi bi-info-circle me-2"></i>Detalhes
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'alunos' ? 'active' : ''}`}
            onClick={() => setActiveTab('alunos')}
          >
            <i className="bi bi-people me-2"></i>Alunos
          </button>
        </li>
      </ul>

      {activeTab === 'detalhes' && (
        <div className="row">
          <div className="col-md-8">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Informações da Modalidade</h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="text-muted">Nome</h6>
                    <p className="fs-5">{sport.nome}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">Tipo</h6>
                    <p className="fs-5">
                      <span className={`badge ${sport.tipo === 'individual' ? 'bg-info' : 'bg-warning'}`}>
                        {sport.tipo === 'individual' ? 'Individual' : 'Em Equipe'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {sport.subcategorias && sport.subcategorias.length > 0 && (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-secondary text-white">
                  <h5 className="mb-0">Subesportes / Categorias</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {sport.subcategorias.map((sub, index) => (
                      <div key={index} className="col-md-6 mb-3">
                        <div className="p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                          <i className="bi bi-arrow-right me-2 text-primary"></i>
                          <strong>{sub}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">Estatísticas</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 className="text-muted">Total de Subesportes</h6>
                  <p className="fs-4 fw-bold text-primary">
                    {sport.subcategorias ? sport.subcategorias.length : 0}
                  </p>
                </div>
                <div>
                  <h6 className="text-muted">Tipo de Modalidade</h6>
                  <p className="fs-5">
                    {sport.tipo === 'individual' ? 'Individual' : 'Em Equipe'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alunos' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Alunos Inscritos em {sport.nome}</h5>
          </div>
          <div className="card-body">
            {studentsLoading ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando alunos...</span>
                </div>
              </div>
            ) : students.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Nome</th>
                      <th>Matrícula</th>
                      <th>Série</th>
                      <th>Idade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student._id}>
                        <td><strong>{student.nome}</strong></td>
                        <td>{student.matricula}</td>
                        <td>{student.serie}</td>
                        <td>{student.idade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Nenhum aluno inscrito nesta modalidade no momento.
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SportDetail;

