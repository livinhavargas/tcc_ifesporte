import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

const Esportes = () => {
  const [genero, setGenero] = useState('Feminino');
  const [students, setStudents] = useState([]);

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
    }
  };

  const modalidadesIndividuais = [
    { id: 'atletismo', nome: 'Atletismo', icone: 'bi-person-walking' },
    { id: 'badminton', nome: 'Badminton', icone: 'bi-usb-drive' },
    { id: 'tenis-de-mesa', nome: 'Tênis de Mesa', icone: 'bi-circle' },
    { id: 'xadrez', nome: 'Xadrez', icone: 'bi-puzzle-fill' }
  ];

  const modalidadesEquipe = [
    { id: 'basquete', nome: 'Basquete', icone: 'bi-dribbble' },
    { id: 'futsal', nome: 'Futsal', icone: 'bi-circle-fill' },
    { id: 'futebol', nome: 'Futebol', icone: 'bi-circle-half' },
    { id: 'handebol', nome: 'Handebol', icone: 'bi-person-arms-up' },
    { id: 'volei-quadra', nome: 'Vôlei de Quadra', icone: 'bi-record-circle' },
    { id: 'volei-praia', nome: 'Vôlei de Praia', icone: 'bi-sun' }
  ];

  const checkMatch = (esp, keyword) => {
    const e = (esp || '').toLowerCase();
    const k = (keyword || '').toLowerCase();
    if (e.includes(k)) return true;
    
    if (k === 'atletismo') {
      const termos = ['atletismo', 'corrida', 'salto', 'arremesso', 'lançamento', '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', 'revezamento', 'distância', 'altura', 'triplo', 'peso', 'disco', 'dardo'];
      return termos.some(t => e.includes(t));
    }
    return false;
  };

  const getCount = (nome) => {
    return students.filter(student => {
      if (student.sexo !== genero) return false;
      const arr = student.modalidades?.length > 0 ? student.modalidades : (student.esportes || []);
      return arr.some(esp => checkMatch(esp, nome));
    }).length;
  };

  const SportCard = ({ mod }) => {
    const count = getCount(mod.nome);
    return (
      <Link to={`/esportes/${mod.id}?genero=${genero}`} style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          padding: '28px 24px',
          textAlign: 'center',
          transition: 'all var(--transition-base)',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
        className="hover-lift"
        >
          <div style={{
            width: '56px', height: '56px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '4px'
          }}>
            <i className={`bi ${mod.icone}`}></i>
          </div>
          <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>{mod.nome}</h5>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            {count} {count === 1 ? 'aluno cadastrado' : 'alunos cadastrados'}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Gender Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-full)',
            padding: '4px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)'
          }}>
            {['Feminino', 'Masculino'].map(g => (
              <button
                key={g}
                onClick={() => setGenero(g)}
                style={{
                  padding: '10px 28px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontFamily: 'var(--font)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  background: genero === g ? 'var(--primary)' : 'transparent',
                  color: genero === g ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className={`bi bi-gender-${g === 'Feminino' ? 'female' : 'male'}`}></i> {g}
              </button>
            ))}
          </div>
        </div>

        {/* Modalidades Individuais */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: 'var(--accent)' }}></div>
            <h4 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1rem' }}>Modalidades Individuais</h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {modalidadesIndividuais.map(mod => (
              <SportCard key={mod.id} mod={mod} />
            ))}
          </div>
        </div>

        {/* Modalidades em Equipe */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: 'var(--accent)' }}></div>
            <h4 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1rem' }}>Modalidades em Equipe</h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {modalidadesEquipe.map(mod => (
              <SportCard key={mod.id} mod={mod} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Esportes;
