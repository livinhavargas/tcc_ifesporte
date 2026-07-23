import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

const Esportes = () => {
  const [genero, setGenero] = useState('Feminino');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const modalidadesIndividuais = [
    { id: 'atletismo', nome: 'Atletismo', icone: 'bi-person-walking' },
    { id: 'badminton', nome: 'Badminton', icone: 'bi-usb-drive' }, // using best match for shuttlecock
    { id: 'tenis-de-mesa', nome: 'Tênis de Mesa', icone: 'bi-circle' },
    { id: 'xadrez', nome: 'Xadrez', icone: 'bi-puzzle-fill' }
  ];

  const modalidadesEquipe = [
    { id: 'basquete', nome: 'Basquete', icone: 'bi-dribbble' },
    { id: 'futsal', nome: 'Futsal', icone: 'bi-circle-fill' }, // soccer ball
    { id: 'futebol', nome: 'Futebol', icone: 'bi-circle-half' },
    { id: 'handebol', nome: 'Handebol', icone: 'bi-person-arms-up' },
    { id: 'volei-quadra', nome: 'Vôlei de Quadra', icone: 'bi-record-circle' },
    { id: 'volei-praia', nome: 'Vôlei de Praia', icone: 'bi-sun' }
  ];

  const getCount = (nome) => {
    return students.filter(student => {
      if (student.sexo !== genero) return false;
      const arr = student.modalidades?.length > 0 ? student.modalidades : (student.esportes || []);
      return arr.some(esp => esp.includes(nome));
    }).length;
  };

  return (
    <Layout>
      <div className="d-flex justify-content-center mb-5">
        <div className="d-flex bg-white rounded-pill p-1 shadow-sm" style={{ width: '400px' }}>
          <button 
            className={`flex-fill btn rounded-pill fw-bold d-flex align-items-center justify-content-center ${genero === 'Feminino' ? 'bg-blue-dark text-orange' : 'bg-white text-blue-dark border-0'}`}
            onClick={() => setGenero('Feminino')}
            style={{ padding: '12px' }}
          >
            <i className="bi bi-gender-female fs-4 me-2"></i> Feminino
          </button>
          <button 
            className={`flex-fill btn rounded-pill fw-bold d-flex align-items-center justify-content-center ${genero === 'Masculino' ? 'bg-blue-dark text-orange' : 'bg-white text-blue-dark border-0'}`}
            onClick={() => setGenero('Masculino')}
            style={{ padding: '12px' }}
          >
            <i className="bi bi-gender-male fs-4 me-2"></i> Masculino
          </button>
        </div>
      </div>

      <div className="mb-5">
        <h4 className="fw-bold text-orange mb-4">Modalidades individuais</h4>
        <div className="row g-4">
          {modalidadesIndividuais.map(mod => (
            <div className="col-md-3" key={mod.id}>
              <Link to={`/esportes/${mod.id}?genero=${genero}`} className="text-decoration-none">
                <div className="card-flat shadow-sm text-center p-4 d-flex flex-column align-items-center justify-content-center h-100 transition-hover">
                  <i className={`bi ${mod.icone} mb-3`} style={{ fontSize: '4.5rem', color: '#B08851' }}></i>
                  <h4 className="fw-bold text-blue-dark mb-2">{mod.nome}</h4>
                  <div className="text-blue-dark small">{getCount(mod.nome)} alunos cadastrados</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="fw-bold text-orange mb-4">Modalidades em equipe</h4>
        <div className="row g-4">
          {modalidadesEquipe.map(mod => (
            <div className="col-md-3" key={mod.id}>
              <Link to={`/esportes/${mod.id}?genero=${genero}`} className="text-decoration-none">
                <div className="card-flat shadow-sm text-center p-4 d-flex flex-column align-items-center justify-content-center h-100 transition-hover">
                  <i className={`bi ${mod.icone} mb-3`} style={{ fontSize: '4.5rem', color: '#B08851' }}></i>
                  <h4 className="fw-bold text-blue-dark mb-2">{mod.nome}</h4>
                  <div className="text-blue-dark small">{getCount(mod.nome)} alunos cadastrados</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        .transition-hover:hover {
          transform: translateY(-5px);
          transition: transform 0.2s ease-in-out;
        }
      `}</style>
    </Layout>
  );
};

export default Esportes;
