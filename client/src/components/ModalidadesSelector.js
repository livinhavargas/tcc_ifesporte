import React, { useState } from 'react';

export const estruturaModalidades = [
  { id: 'Basquete', nome: 'Basquete' },
  { id: 'Futsal', nome: 'Futsal' },
  { id: 'Futebol', nome: 'Futebol' },
  { id: 'Handebol', nome: 'Handebol' },
  { id: 'Vôlei de Quadra', nome: 'Vôlei de Quadra' },
  { id: 'Vôlei de Praia', nome: 'Vôlei de Praia' },
  { id: 'Badminton', nome: 'Badminton' },
  { id: 'Xadrez', nome: 'Xadrez' },
  { id: 'Atletismo', nome: 'Atletismo', sub: [
    { id: 'Atletismo - Corridas', nome: 'Corridas', sub: [
      { id: 'Atletismo - Corridas - 100m', nome: '100m' },
      { id: 'Atletismo - Corridas - 200m', nome: '200m' },
      { id: 'Atletismo - Corridas - 400m', nome: '400m' },
      { id: 'Atletismo - Corridas - 800m', nome: '800m' },
      { id: 'Atletismo - Corridas - 1500m', nome: '1500m' },
      { id: 'Atletismo - Corridas - 3000m', nome: '3000m' },
      { id: 'Atletismo - Corridas - 5000m', nome: '5000m' },
      { id: 'Atletismo - Corridas - Revezamento 100m', nome: 'Revezamento 100m' },
      { id: 'Atletismo - Corridas - Revezamento 400m', nome: 'Revezamento 400m' }
    ]},
    { id: 'Atletismo - Saltos', nome: 'Saltos', sub: [
      { id: 'Atletismo - Saltos - Distância', nome: 'Distância' },
      { id: 'Atletismo - Saltos - Altura', nome: 'Altura' },
      { id: 'Atletismo - Saltos - Triplo', nome: 'Triplo' }
    ]},
    { id: 'Atletismo - Lançamentos', nome: 'Lançamentos', sub: [
      { id: 'Atletismo - Lançamentos - Peso', nome: 'Peso' },
      { id: 'Atletismo - Lançamentos - Disco', nome: 'Disco' },
      { id: 'Atletismo - Lançamentos - Dardo', nome: 'Dardo' }
    ]}
  ]},
  { id: 'Tênis de Mesa', nome: 'Tênis de Mesa', sub: [
    { id: 'Tênis de Mesa - Individual', nome: 'Individual' },
    { id: 'Tênis de Mesa - Dupla', nome: 'Dupla' }
  ]}
];

const TreeNode = ({ node, selectedIds, onToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const hasSub = node.sub && node.sub.length > 0;
  
  const isSelected = selectedIds.includes(node.id);

  const isAnyChildSelected = (n) => {
    if (selectedIds.includes(n.id)) return true;
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
        <span>{node.nome}</span>
      </div>

      {hasSub && expanded && (
        <div style={{ paddingLeft: '20px', paddingTop: '6px', borderLeft: '2px solid var(--primary-light)', marginLeft: '10px' }}>
          {node.sub.map(child => (
            <TreeNode key={child.id} node={child} selectedIds={selectedIds} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
};

const ModalidadesSelector = ({ selected, onChange }) => {
  const handleToggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(x => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
      {estruturaModalidades.map(mod => (
        <div key={mod.id}>
          <TreeNode node={mod} selectedIds={selected} onToggle={handleToggle} />
        </div>
      ))}
    </div>
  );
};

export default ModalidadesSelector;
