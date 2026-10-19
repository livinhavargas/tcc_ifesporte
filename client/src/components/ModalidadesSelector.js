import React, { useState, useEffect } from 'react';
import SportIcon from './SportIcon';

export const estruturaModalidades = [
  { id: 'Basquete', nome: 'Basquete' },
  { id: 'Futsal', nome: 'Futsal' },
  { id: 'Futebol', nome: 'Futebol' },
  { id: 'Handebol', nome: 'Handebol' },
  { id: 'Voleibol', nome: 'Voleibol' },
  { id: 'Vôlei de Praia', nome: 'Vôlei de Praia' },
  { id: 'Badminton', nome: 'Badminton' },
  { id: 'Xadrez', nome: 'Xadrez' },
  { id: 'Atletismo', nome: 'Atletismo', sub: [
    { id: 'Atletismo - Provas de Velocidade', nome: 'Provas de Velocidade', sub: [
      { id: 'Atletismo - Provas de Velocidade - 100m Rasos', nome: '100m Rasos' },
      { id: 'Atletismo - Provas de Velocidade - 200m Rasos', nome: '200m Rasos' },
      { id: 'Atletismo - Provas de Velocidade - 400m Rasos', nome: '400m Rasos' }
    ]},
    { id: 'Atletismo - Provas com Obstáculos', nome: 'Provas com Obstáculos', sub: [
      { id: 'Atletismo - Provas com Obstáculos - 100m com Barreiras', nome: '100m com Barreiras', genero: 'Feminino' },
      { id: 'Atletismo - Provas com Obstáculos - 110m com Barreiras', nome: '110m com Barreiras', genero: 'Masculino' },
      { id: 'Atletismo - Provas com Obstáculos - 400m com Barreiras', nome: '400m com Barreiras' }
    ]},
    { id: 'Atletismo - Provas de Meio Fundo', nome: 'Provas de Meio Fundo', sub: [
      { id: 'Atletismo - Provas de Meio Fundo - 800m Rasos', nome: '800m Rasos' },
      { id: 'Atletismo - Provas de Meio Fundo - 1.500m Rasos', nome: '1.500m Rasos' }
    ]},
    { id: 'Atletismo - Provas de Fundo', nome: 'Provas de Fundo', sub: [
      { id: 'Atletismo - Provas de Fundo - 3.000m Rasos', nome: '3.000m Rasos' },
      { id: 'Atletismo - Provas de Fundo - 5.000m Rasos', nome: '5.000m Rasos' },
      { id: 'Atletismo - Provas de Fundo - 10.000m Rasos', nome: '10.000m Rasos' }
    ]},
    { id: 'Atletismo - Provas de Revezamento', nome: 'Provas de Revezamento', sub: [
      { id: 'Atletismo - Provas de Revezamento - 4x100m', nome: '4x100m' },
      { id: 'Atletismo - Provas de Revezamento - 4x400m', nome: '4x400m' }
    ]},
    { id: 'Atletismo - Provas de Saltos Verticais', nome: 'Provas de Saltos Verticais', sub: [
      { id: 'Atletismo - Provas de Saltos Verticais - Salto em Altura', nome: 'Salto em Altura' },
      { id: 'Atletismo - Provas de Saltos Verticais - Salto com Vara', nome: 'Salto com Vara' }
    ]},
    { id: 'Atletismo - Provas de Saltos Horizontais', nome: 'Provas de Saltos Horizontais', sub: [
      { id: 'Atletismo - Provas de Saltos Horizontais - Salto em Distância', nome: 'Salto em Distância' },
      { id: 'Atletismo - Provas de Saltos Horizontais - Salto Triplo', nome: 'Salto Triplo' }
    ]},
    { id: 'Atletismo - Provas de Arremessos e Lançamentos', nome: 'Provas de Arremessos e Lançamentos', sub: [
      { id: 'Atletismo - Provas de Arremessos e Lançamentos - Arremesso de Martelo', nome: 'Arremesso de Martelo' },
      { id: 'Atletismo - Provas de Arremessos e Lançamentos - Arremesso de Peso', nome: 'Arremesso de Peso' },
      { id: 'Atletismo - Provas de Arremessos e Lançamentos - Lançamento de Dardo', nome: 'Lançamento de Dardo' },
      { id: 'Atletismo - Provas de Arremessos e Lançamentos - Lançamento de Disco', nome: 'Lançamento de Disco' }
    ]},
    { id: 'Atletismo - Prova Combinada', nome: 'Prova Combinada', sub: [
      { id: 'Atletismo - Prova Combinada - Pentatlo', nome: 'Pentatlo' }
    ]}
  ]},
  { id: 'Tênis de Mesa', nome: 'Tênis de Mesa', sub: [
    { id: 'Tênis de Mesa (Individual)', nome: 'Individual' },
    { id: 'Tênis de Mesa (Misto)', nome: 'Misto' }
  ]}
];

const getProvaKey = (str) => {
  if (!str) return null;
  const s = str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-()._]/g, '');
  if (s.includes('100mcombarreiras') || s.includes('100mbarreiras')) return '100m_barreiras';
  if (s.includes('110mcombarreiras') || s.includes('110mbarreiras')) return '110m_barreiras';
  if (s.includes('400mcombarreiras') || s.includes('400mbarreiras')) return '400m_barreiras';
  if (s.includes('4x100') || s.includes('revezamento100')) return '4x100';
  if (s.includes('4x400') || s.includes('revezamento400')) return '4x400';
  if (s.includes('10000m')) return '10000m';
  if (s.includes('100m') && !s.includes('barreiras') && !s.includes('4x100')) return '100m';
  if (s.includes('200m')) return '200m';
  if (s.includes('400m') && !s.includes('barreiras') && !s.includes('4x400')) return '400m';
  if (s.includes('800m')) return '800m';
  if (s.includes('1500m')) return '1500m';
  if (s.includes('3000m')) return '3000m';
  if (s.includes('5000m')) return '5000m';
  if (s.includes('vara')) return 'vara';
  if (s.includes('altura')) return 'altura';
  if (s.includes('distancia')) return 'distancia';
  if (s.includes('triplo')) return 'triplo';
  if (s.includes('peso')) return 'peso';
  if (s.includes('dardo')) return 'dardo';
  if (s.includes('disco')) return 'disco';
  if (s.includes('martelo')) return 'martelo';
  if (s.includes('pentatlo')) return 'pentatlo';
  return s;
};

const matchNodeId = (idA, idB) => {
  if (!idA || !idB) return false;
  if (idA === idB) return true;
  const keyA = getProvaKey(idA);
  const keyB = getProvaKey(idB);
  if (keyA && keyB && keyA === keyB) return true;
  return false;
};

const TreeNode = ({ node, selectedIds, onToggle, gender }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Filter subnodes by gender if gender is specified
  const filteredSub = node.sub ? node.sub.filter(child => {
    if (!gender) return true;
    if (child.genero && child.genero !== gender) return false;
    return true;
  }) : [];

  const hasSub = filteredSub.length > 0;
  const isSelected = selectedIds.some(id => matchNodeId(node.id, id));

  const isAnyChildSelected = (n) => {
    if (selectedIds.some(id => matchNodeId(n.id, id))) return true;
    if (n.sub) return n.sub.some(isAnyChildSelected);
    return false;
  };

  const active = hasSub ? isAnyChildSelected(node) : isSelected;

  return (
    <div style={{ marginBottom: '6px', width: '100%' }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
          background: active ? 'var(--primary-light)' : 'var(--bg)',
          color: active ? 'var(--primary)' : 'var(--text-secondary)',
          fontWeight: active ? 600 : 500,
          fontSize: '0.8125rem',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          fontFamily: 'var(--font)'
        }}
        onClick={() => {
          if (hasSub) setExpanded(!expanded);
          else onToggle(node.id);
        }}
      >
        {hasSub && (
          <i className={`bi bi-chevron-${expanded ? 'down' : 'right'}`} style={{ marginRight: '8px', fontSize: '0.75rem' }}></i>
        )}
        {!hasSub && (
          <i className={`bi bi-${isSelected ? 'check-square-fill' : 'square'}`} style={{ marginRight: '8px', color: isSelected ? 'var(--primary)' : 'var(--text-tertiary)' }}></i>
        )}
        <SportIcon sport={node.id} size={16} style={{ marginRight: '6px' }} />
        <span>{node.nome}</span>
      </div>

      {hasSub && expanded && (
        <div style={{ paddingLeft: '20px', paddingTop: '6px', borderLeft: '2px solid var(--primary-light)', marginLeft: '10px' }}>
          {filteredSub.map(child => (
            <TreeNode key={child.id} node={child} selectedIds={selectedIds} onToggle={onToggle} gender={gender} />
          ))}
        </div>
      )}
    </div>
  );
};

const ModalidadesSelector = ({ selected = [], onChange, gender }) => {
  // Efeito de sanitização estrita caso o gênero mude ou já possua itens incompatíveis
  useEffect(() => {
    if (!gender || !selected || selected.length === 0) return;
    const sanitized = selected.filter(item => {
      if (gender === 'Masculino' && item.includes('100m com Barreiras')) return false;
      if (gender === 'Feminino' && item.includes('110m com Barreiras')) return false;
      return true;
    });

    if (sanitized.length !== selected.length) {
      onChange(sanitized);
    }
  }, [gender, selected, onChange]);

  const handleToggle = (id) => {
    // Impedimento duplo por segurança lógica
    if (gender === 'Masculino' && id.includes('100m com Barreiras')) return;
    if (gender === 'Feminino' && id.includes('110m com Barreiras')) return;

    const isCurrentlySelected = selected.some(x => matchNodeId(x, id));

    if (isCurrentlySelected) {
      onChange(selected.filter(x => !matchNodeId(x, id)));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
      {estruturaModalidades.map(mod => (
        <div key={mod.id}>
          <TreeNode node={mod} selectedIds={selected} onToggle={handleToggle} gender={gender} />
        </div>
      ))}
    </div>
  );
};

export default ModalidadesSelector;
