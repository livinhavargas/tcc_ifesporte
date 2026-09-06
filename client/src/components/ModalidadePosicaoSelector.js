import React from 'react';
import SportIcon from './SportIcon';
import { 
  SPORT_POSITIONS_MAP, 
  FUTEBOL_CATEGORIES, 
  normalizeSportKey 
} from '../utils/sportPositions';

const ModalidadePosicaoSelector = ({ 
  selectedModalidades = [], 
  posicoesPorModalidade = [], 
  onChange,
  readOnly = false 
}) => {
  // Filtrar modalidades únicas que possuem suporte a posições
  const activePositionSports = [];
  const seenKeys = new Set();

  for (const mod of selectedModalidades) {
    const sportKey = normalizeSportKey(mod);
    if (sportKey && !seenKeys.has(sportKey)) {
      seenKeys.add(sportKey);
      activePositionSports.push({
        rawName: mod,
        sportKey: sportKey
      });
    }
  }

  if (activePositionSports.length === 0) {
    return null;
  }

  const getPositionValue = (sportKey) => {
    const found = posicoesPorModalidade.find(p => normalizeSportKey(p.modalidade) === sportKey);
    return found?.posicao || 'Não sei';
  };

  const handlePositionChange = (sportItem, newPos) => {
    if (readOnly || !onChange) return;

    const existingMap = new Map();
    for (const item of posicoesPorModalidade) {
      if (item && item.modalidade) {
        const k = normalizeSportKey(item.modalidade);
        if (k) existingMap.set(k, item.posicao || 'Não sei');
      }
    }

    existingMap.set(sportItem.sportKey, newPos || 'Não sei');

    const updatedList = [];
    for (const sport of activePositionSports) {
      updatedList.push({
        modalidade: sport.rawName,
        posicao: existingMap.get(sport.sportKey) || 'Não sei'
      });
    }

    onChange(updatedList);
  };

  return (
    <div style={{
      marginTop: '16px',
      background: 'var(--bg-card)',
      border: '1.5px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <i className="bi bi-shield-shaded" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i>
        <h6 style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>
          Definir Posição do Atleta por Modalidade
        </h6>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {activePositionSports.map(sportItem => {
          const currentPos = getPositionValue(sportItem.sportKey);
          const isFutebol = sportItem.sportKey === 'Futebol';
          const positions = SPORT_POSITIONS_MAP[sportItem.sportKey] || [];

          return (
            <div 
              key={sportItem.sportKey}
              style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SportIcon sport={sportItem.sportKey} size={18} />
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text)' }}>
                    {sportItem.sportKey}
                  </span>
                </div>
                {readOnly && (
                  <span className="badge" style={{
                    background: currentPos === 'Não sei' ? 'var(--border-light)' : 'var(--primary-light)',
                    color: currentPos === 'Não sei' ? 'var(--text-tertiary)' : 'var(--primary)',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}>
                    {currentPos}
                  </span>
                )}
              </div>

              {!readOnly ? (
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px', display: 'block' }}>
                    Posição em {sportItem.sportKey}:
                  </label>
                  {isFutebol ? (
                    <select
                      className="form-select"
                      value={currentPos}
                      onChange={(e) => handlePositionChange(sportItem, e.target.value)}
                      style={{
                        fontSize: '0.8125rem',
                        borderRadius: 'var(--radius-sm)',
                        minHeight: '38px',
                        background: 'var(--bg-card)',
                        border: '1.5px solid var(--border)',
                        color: 'var(--text)',
                        fontWeight: 500
                      }}
                    >
                      <option value="Não sei">Não sei</option>
                      {FUTEBOL_CATEGORIES.map(cat => (
                        <optgroup key={cat.categoria} label={cat.categoria}>
                          {cat.posicoes.map(pos => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  ) : (
                    <select
                      className="form-select"
                      value={currentPos}
                      onChange={(e) => handlePositionChange(sportItem, e.target.value)}
                      style={{
                        fontSize: '0.8125rem',
                        borderRadius: 'var(--radius-sm)',
                        minHeight: '38px',
                        background: 'var(--bg-card)',
                        border: '1.5px solid var(--border)',
                        color: 'var(--text)',
                        fontWeight: 500
                      }}
                    >
                      {positions.map(pos => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModalidadePosicaoSelector;
