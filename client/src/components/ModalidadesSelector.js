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
      { id: 'Atletismo - Corridas - 100m rasos', nome: '100m rasos' },
      { id: 'Atletismo - Corridas - 200m rasos', nome: '200m rasos' },
      { id: 'Atletismo - Corridas - 400m rasos', nome: '400m rasos' },
      { id: 'Atletismo - Corridas - 800m', nome: '800m' },
      { id: 'Atletismo - Corridas - 1500m', nome: '1500m' },
      { id: 'Atletismo - Corridas - 3000m', nome: '3000m' },
      { id: 'Atletismo - Corridas - 5000m', nome: '5000m' },
      { id: 'Atletismo - Corridas - Revezamento 4x100', nome: 'Revezamento 4x100' },
      { id: 'Atletismo - Corridas - Revezamento 4x400', nome: 'Revezamento 4x400' }
    ]},
    { id: 'Atletismo - Saltos', nome: 'Saltos', sub: [
      { id: 'Atletismo - Saltos - Distância', nome: 'Distância' },
      { id: 'Atletismo - Saltos - Altura', nome: 'Altura' },
      { id: 'Atletismo - Saltos - Triplo', nome: 'Triplo' }
    ]},
    { id: 'Atletismo - Lançamentos', nome: 'Lançamentos', sub: [
      { id: 'Atletismo - Lançamentos - Disco', nome: 'Disco' },
      { id: 'Atletismo - Lançamentos - Dardo', nome: 'Dardo' },
      { id: 'Atletismo - Lançamentos - Peso', nome: 'Peso' }
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
    <div className="mb-2 w-100">
      <div 
        className={`d-flex align-items-center p-2 rounded-3 border ${active ? 'bg-orange-active border-orange text-blue-dark fw-bold' : 'bg-light text-muted'}`}
        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        onClick={() => {
          if (hasSub) setExpanded(!expanded);
          else onToggle(node.id);
        }}
      >
        {hasSub && (
          <i className={`bi bi-chevron-${expanded ? 'down' : 'right'} me-2`}></i>
        )}
        {!hasSub && (
           <i className={`bi bi-${isSelected ? 'check-square-fill text-orange' : 'square'} me-2`}></i>
        )}
        <span>{node.nome}</span>
      </div>

      {hasSub && expanded && (
        <div className="ps-4 pt-2 border-start border-2 ms-2 border-orange-light">
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
    <div className="modalidades-tree row g-2">
      {estruturaModalidades.map(mod => (
        <div key={mod.id} className="col-md-6">
          <TreeNode node={mod} selectedIds={selected} onToggle={handleToggle} />
        </div>
      ))}
    </div>
  );
};

export default ModalidadesSelector;
