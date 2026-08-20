import React, { useMemo, useEffect } from 'react';

export const isCollectiveSport = (modalidadeStr) => {
  if (!modalidadeStr) return false;
  const modLower = modalidadeStr.toLowerCase();
  return ['basquete', 'futsal', 'futebol', 'handebol', 'voleibol', 'vôlei de praia', 'vôlei'].some(s => modLower.includes(s));
};

const ContextoSelector = ({ modalidade, value, onChange, style }) => {
  const isCollective = isCollectiveSport(modalidade);
  const options = useMemo(() => isCollective ? ['Treino', 'Jogo'] : ['Treino', 'Competição'], [isCollective]);

  useEffect(() => {
    if (value && !options.includes(value)) {
      onChange({ target: { name: 'contexto', value: 'Treino' } });
    }
  }, [value, options, onChange]);

  return (
    <div>
      <label className="form-label text-muted small fw-bold" style={{ display: 'block', marginBottom: '4px' }}>
        Contexto da Análise *
      </label>
      <select 
        className="form-select bg-light" 
        name="contexto" 
        value={value || 'Treino'} 
        onChange={onChange} 
        required 
        style={style}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};

export default ContextoSelector;
