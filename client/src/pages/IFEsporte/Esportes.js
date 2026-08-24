import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Venus, Mars } from 'lucide-react';
import Layout from '../../components/Layout';
import SportIcon from '../../components/SportIcon';

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
    { id: 'atletismo', nome: 'Atletismo' },
    { id: 'badminton', nome: 'Badminton' },
    { id: 'tenis-de-mesa', nome: 'Tênis de Mesa' },
    { id: 'xadrez', nome: 'Xadrez' }
  ];

  const modalidadesEquipe = [
    { id: 'basquete', nome: 'Basquete' },
    { id: 'futsal', nome: 'Futsal' },
    { id: 'futebol', nome: 'Futebol' },
    { id: 'handebol', nome: 'Handebol' },
    { id: 'voleibol', nome: 'Voleibol' },
    { id: 'volei-praia', nome: 'Vôlei de Praia' }
  ];

  const checkMatch = (esp, keyword) => {
    const normalize = (str) => {
      return (str || '')
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s-()]/g, '');
    };
    const e = normalize(esp);
    const k = normalize(keyword);
    if (!e || !k) return false;
    if (e.includes(k) || k.includes(e)) return true;

    // Fallbacks para compatibilidade entre os formatos legados e novos
    if (k.includes('tenisdemesamisto') && e.includes('tenisdemesadupla')) return true;
    if (k.includes('tenisdemesadupla') && e.includes('tenisdemesamisto')) return true;
    
    if (k === 'atletismo') {
      const termos = ['atletismo', 'corrida', 'salto', 'arremesso', 'lancamento', '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', 'revezamento', 'distancia', 'altura', 'triplo', 'vara', 'peso', 'disco', 'dardo', 'martelo', 'pentatlo', 'barreiras'];
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
          padding: '24px 20px',
          textAlign: 'center',
          transition: 'all var(--transition-base)',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        className="hover-lift"
        >
          <div style={{
            width: '64px', height: '64px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <SportIcon sport={mod.nome} size={32} />
          </div>
          <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 6px 0', fontSize: '0.9375rem', lineHeight: 1.3 }}>{mod.nome}</h5>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, margin: 0 }}>
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
                  background: genero === g ? 'var(--primary-light)' : 'transparent',
                  color: genero === g ? 'var(--primary)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {g === 'Feminino' ? <Venus size={18} /> : <Mars size={18} />}
                <span>{g}</span>
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
