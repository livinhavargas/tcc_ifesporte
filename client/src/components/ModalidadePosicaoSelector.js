import React, { useState, useEffect, useRef } from 'react';
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
  const [openSport, setOpenSport] = useState(null);
  const containerRef = useRef(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenSport(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Obtém array de posições selecionadas para um sportKey
  const getSelectedPositions = (sportKey) => {
    const found = posicoesPorModalidade.find(p => normalizeSportKey(p.modalidade) === sportKey);
    if (!found) return [];

    if (Array.isArray(found.posicoes) && found.posicoes.length > 0) {
      return found.posicoes.filter(p => p && p !== 'Indefinido' && p !== 'Não sei');
    }

    if (typeof found.posicao === 'string' && found.posicao && found.posicao !== 'Indefinido' && found.posicao !== 'Não sei') {
      return found.posicao.split(',').map(s => s.trim()).filter(Boolean);
    }

    return [];
  };

  const handleTogglePosition = (sportItem, posToToggle) => {
    if (readOnly || !onChange) return;

    const currentPositions = getSelectedPositions(sportItem.sportKey);
    let newPositions = [];

    if (posToToggle === 'Indefinido') {
      newPositions = [];
    } else {
      if (currentPositions.includes(posToToggle)) {
        newPositions = currentPositions.filter(p => p !== posToToggle);
      } else {
        newPositions = [...currentPositions, posToToggle];
      }
    }

    // Mapa de posições atuais de todos os esportes para atualizar de forma limpa
    const existingMap = new Map();
    for (const item of posicoesPorModalidade) {
      if (item && item.modalidade) {
        const k = normalizeSportKey(item.modalidade);
        if (k) {
          existingMap.set(k, {
            posicao: item.posicao || 'Indefinido',
            posicoes: Array.isArray(item.posicoes) ? item.posicoes : (item.posicao && item.posicao !== 'Indefinido' ? item.posicao.split(',').map(s => s.trim()) : [])
          });
        }
      }
    }

    existingMap.set(sportItem.sportKey, {
      posicao: newPositions.length > 0 ? newPositions.join(', ') : 'Indefinido',
      posicoes: newPositions
    });

    const updatedList = [];
    for (const sport of activePositionSports) {
      const data = existingMap.get(sport.sportKey) || { posicao: 'Indefinido', posicoes: [] };
      updatedList.push({
        modalidade: sport.rawName,
        posicao: data.posicao,
        posicoes: data.posicoes
      });
    }

    onChange(updatedList);
  };

  return (
    <div 
      ref={containerRef}
      style={{
        marginTop: '16px',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <i className="bi bi-shield-shaded" style={{ color: 'var(--primary)', fontSize: '1rem' }}></i>
        <h6 style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>
          Definir Posição do Atleta por Modalidade
        </h6>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {activePositionSports.map(sportItem => {
          const currentPositions = getSelectedPositions(sportItem.sportKey);
          const isFutebol = sportItem.sportKey === 'Futebol';
          const allSportPositions = SPORT_POSITIONS_MAP[sportItem.sportKey] || [];
          const isOpen = openSport === sportItem.sportKey;

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
                gap: '8px',
                position: 'relative'
              }}
            >
              {/* Header do Esporte */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SportIcon sport={sportItem.sportKey} size={18} />
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text)' }}>
                    {sportItem.sportKey}
                  </span>
                </div>
                {readOnly && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end' }}>
                    {currentPositions.length === 0 ? (
                      <span className="badge" style={{
                        background: 'var(--border-light)',
                        color: 'var(--text-tertiary)',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}>
                        Indefinido
                      </span>
                    ) : (
                      currentPositions.map(pos => (
                        <span key={pos} className="badge" style={{
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}>
                          {pos}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>

              {!readOnly && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '6px', display: 'block' }}>
                    Posições em {sportItem.sportKey}:
                  </label>

                  {/* Badges das posições selecionadas com botão de remoção individual */}
                  {currentPositions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {currentPositions.map(pos => (
                        <span
                          key={pos}
                          style={{
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            borderRadius: 'var(--radius-full)',
                            padding: '3px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          <span>{pos}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePosition(sportItem, pos);
                            }}
                            title={`Desmarcar ${pos}`}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary)',
                              padding: 0,
                              fontSize: '0.9375rem',
                              lineHeight: 1,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              fontWeight: 700
                            }}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Botão Gatilho do Seletor Múltiplo */}
                  <div
                    onClick={() => setOpenSport(isOpen ? null : sportItem.sportKey)}
                    style={{
                      fontSize: '0.8125rem',
                      borderRadius: 'var(--radius-sm)',
                      minHeight: '38px',
                      background: 'var(--bg-card)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--text)',
                      fontWeight: 500,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span style={{ color: currentPositions.length === 0 ? 'var(--text-tertiary)' : 'var(--text)' }}>
                      {currentPositions.length === 0 
                        ? 'Selecione uma ou mais posições...' 
                        : `${currentPositions.length} posição(ões) selecionada(s)`}
                    </span>
                    <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}></i>
                  </div>

                  {/* Menu Dropdown com Opções e Checkboxes */}
                  {isOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: '16px',
                        right: '16px',
                        zIndex: 100,
                        background: 'var(--bg-card)',
                        border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        padding: '6px'
                      }}
                    >
                      {/* Opção Indefinido / Limpar */}
                      <div
                        onClick={() => handleTogglePosition(sportItem, 'Indefinido')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 10px',
                          borderRadius: 'var(--radius-xs)',
                          cursor: 'pointer',
                          background: currentPositions.length === 0 ? 'var(--primary-light)' : 'transparent',
                          color: currentPositions.length === 0 ? 'var(--primary)' : 'var(--text-secondary)',
                          fontSize: '0.8125rem',
                          fontWeight: currentPositions.length === 0 ? 600 : 500,
                          marginBottom: '4px',
                          borderBottom: '1px solid var(--border-light)'
                        }}
                      >
                        <i className={`bi bi-${currentPositions.length === 0 ? 'check-circle-fill' : 'circle'}`} style={{ color: currentPositions.length === 0 ? 'var(--primary)' : 'var(--text-tertiary)' }}></i>
                        <span>Indefinido (Nenhuma posição)</span>
                      </div>

                      {/* Lista de Posições (Categorizada para Futebol, Direta para outras) */}
                      {isFutebol ? (
                        FUTEBOL_CATEGORIES.map(cat => (
                          <div key={cat.categoria} style={{ marginTop: '4px', marginBottom: '4px' }}>
                            <div style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              color: 'var(--text-tertiary)',
                              padding: '4px 8px 2px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}>
                              {cat.categoria}
                            </div>
                            {cat.posicoes.map(pos => {
                              const isSelected = currentPositions.includes(pos);
                              return (
                                <div
                                  key={pos}
                                  onClick={() => handleTogglePosition(sportItem, pos)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 10px',
                                    borderRadius: 'var(--radius-xs)',
                                    cursor: 'pointer',
                                    background: isSelected ? 'var(--primary-light)' : 'transparent',
                                    color: isSelected ? 'var(--primary)' : 'var(--text)',
                                    fontSize: '0.8125rem',
                                    fontWeight: isSelected ? 600 : 400,
                                    transition: 'background var(--transition-fast)'
                                  }}
                                >
                                  <i className={`bi bi-${isSelected ? 'check-square-fill' : 'square'}`} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-tertiary)', fontSize: '0.875rem' }}></i>
                                  <span>{pos}</span>
                                </div>
                              );
                            })}
                          </div>
                        ))
                      ) : (
                        allSportPositions.filter(p => p !== 'Indefinido').map(pos => {
                          const isSelected = currentPositions.includes(pos);
                          return (
                            <div
                              key={pos}
                              onClick={() => handleTogglePosition(sportItem, pos)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-xs)',
                                cursor: 'pointer',
                                background: isSelected ? 'var(--primary-light)' : 'transparent',
                                color: isSelected ? 'var(--primary)' : 'var(--text)',
                                fontSize: '0.8125rem',
                                fontWeight: isSelected ? 600 : 400,
                                transition: 'background var(--transition-fast)'
                              }}
                            >
                              <i className={`bi bi-${isSelected ? 'check-square-fill' : 'square'}`} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-tertiary)', fontSize: '0.875rem' }}></i>
                              <span>{pos}</span>
                            </div>
                          );
                        })
                      )}

                      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '6px', marginTop: '6px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => setOpenSport(null)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 12px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          Concluir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModalidadePosicaoSelector;
