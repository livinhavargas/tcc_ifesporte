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
    { id: 'Atletismo - Corridas', nome: 'Corridas', sub: [
      { id: 'Atletismo - Corridas - 100m', nome: '100m' },
      { id: 'Atletismo - Corridas - 200m', nome: '200m' },
      { id: 'Atletismo - Corridas - 400m', nome: '400m' },
      { id: 'Atletismo - Corridas - 800m', nome: '800m' },
      { id: 'Atletismo - Corridas - 1500m', nome: '1500m' },
      { id: 'Atletismo - Corridas - 3000m', nome: '3000m' },
      { id: 'Atletismo - Corridas - 5000m', nome: '5000m' },
      { id: 'Atletismo - Corridas - Revezamento 4x100', nome: 'Revezamento 4x100' },
      { id: 'Atletismo - Corridas - Revezamento 4x400', nome: 'Revezamento 4x400' },
      { id: 'Atletismo - Corridas - Pentatlo', nome: 'Pentatlo' },
      { id: 'Atletismo - Corridas - 100m com Barreiras', nome: '100m com Barreiras', genero: 'Feminino' },
      { id: 'Atletismo - Corridas - 110m com Barreiras', nome: '110m com Barreiras', genero: 'Masculino' }
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
    { id: 'Tênis de Mesa (Individual)', nome: 'Individual' },
    { id: 'Tênis de Mesa (Misto)', nome: 'Misto' }
  ]}
];

const TreeNode = ({ node, selectedIds, onToggle, gender }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Filter subnodes by gender if gender is specified
  const filteredSub = node.sub ? node.sub.filter(child => {
    if (!gender) return true;
    if (child.genero && child.genero !== gender) return false;
    return true;
  }) : [];

  const hasSub = filteredSub.length > 0;
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
          <TreeNode node={mod} selectedIds={selected} onToggle={handleToggle} gender={gender} />
        </div>
      ))}
    </div>
  );
};

export default ModalidadesSelector;
