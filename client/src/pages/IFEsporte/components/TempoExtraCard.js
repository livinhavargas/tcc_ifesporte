import React from 'react';
import NumberStepper from '../../../components/NumberStepper';
import { Timer, Plus, Trash2 } from 'lucide-react';

const TempoExtraCard = ({
  formData,
  setFormData,
  students = []
}) => {
  const modLower = (formData.modalidade || '').toLowerCase();
  const isFutsalFutebol = modLower.includes('futsal') || modLower.includes('futebol');
  const isHandebol = modLower.includes('handebol');
  const isBasquete = modLower.includes('basquete');

  if (!isFutsalFutebol && !isHandebol && !isBasquete) {
    return null;
  }

  const dados = formData.dadosEspecificos || {};
  const tempoExtra = dados.tempoExtra || {};
  const tePlacar = tempoExtra.placar || {};

  // Filtro de atletas elegíveis conforme gênero da modalidade
  const categoriaLower = (formData.categoria || '').toLowerCase();
  const eligibleStudents = students.filter(s => {
    if (categoriaLower === 'feminino') {
      return (s.sexo || '').toLowerCase() === 'feminino';
    }
    if (categoriaLower === 'masculino') {
      return (s.sexo || '').toLowerCase() === 'masculino';
    }
    return true; // Geral / Misto
  });

  // Atualizar campo genérico do Tempo Extra
  const updateTempoExtraField = (updates) => {
    setFormData(prev => {
      const prevDados = prev.dadosEspecificos || {};
      const prevTE = prevDados.tempoExtra || {};
      return {
        ...prev,
        dadosEspecificos: {
          ...prevDados,
          tempoExtra: {
            ...prevTE,
            ...updates
          }
        }
      };
    });
  };

  // Alterar placar do tempo extra e recalcular total da partida automaticamente
  const handleScoreChange = (team, val) => {
    setFormData(prev => {
      const prevDados = prev.dadosEspecificos || {};
      const prevTE = prevDados.tempoExtra || {};
      const prevTePlacar = prevTE.placar || {};

      const updatedTePlacar = {
        ...prevTePlacar,
        [team]: val
      };

      const hasTeNos = updatedTePlacar.nos !== undefined && updatedTePlacar.nos !== '' && updatedTePlacar.nos !== null;
      const hasTeAdv = updatedTePlacar.adv !== undefined && updatedTePlacar.adv !== '' && updatedTePlacar.adv !== null;

      const teNos = hasTeNos ? (parseInt(updatedTePlacar.nos, 10) || 0) : 0;
      const teAdv = hasTeAdv ? (parseInt(updatedTePlacar.adv, 10) || 0) : 0;

      const p1 = prevDados.placar1Tempo || { nos: 0, adv: 0 };
      const p2 = prevDados.placar2Tempo || { nos: 0, adv: 0 };
      const totalNos = (p1.nos || 0) + (p2.nos || 0) + teNos;
      const totalAdv = (p1.adv || 0) + (p2.adv || 0) + teAdv;

      return {
        ...prev,
        placar: { nos: totalNos, adv: totalAdv },
        dadosEspecificos: {
          ...prevDados,
          tempoExtra: {
            ...prevTE,
            placar: updatedTePlacar
          }
        }
      };
    });
  };

  // ==========================================
  // CARTÕES - FUTSAL / FUTEBOL
  // ==========================================
  const cartoesFutsal = Array.isArray(tempoExtra.cartoes) ? tempoExtra.cartoes : [];

  const handleAddCartaoFutsal = () => {
    const novo = { atletaId: '', atletaNome: '', tipo: 'Amarelo' };
    updateTempoExtraField({ cartoes: [...cartoesFutsal, novo] });
  };

  const handleRemoveCartaoFutsal = (idx) => {
    updateTempoExtraField({ cartoes: cartoesFutsal.filter((_, i) => i !== idx) });
  };

  const handleCartaoFutsalChange = (idx, field, val) => {
    const updated = [...cartoesFutsal];
    if (field === 'atletaId') {
      const at = students.find(s => s._id === val);
      updated[idx] = { ...updated[idx], atletaId: val, atletaNome: at ? at.nome : '' };
    } else {
      updated[idx] = { ...updated[idx], [field]: val };
    }
    updateTempoExtraField({ cartoes: updated });
  };

  // ==========================================
  // HANDEBOL - GOLS DE 7 METROS
  // ==========================================
  const gols7mList = Array.isArray(tempoExtra.gols7m) ? tempoExtra.gols7m : [];

  const handleGols7mMarcadosChange = (qtd) => {
    if (qtd === '' || qtd === null || qtd === undefined) {
      updateTempoExtraField({ gols7mMarcados: '', gols7m: [] });
      return;
    }
    const targetQtd = Math.max(0, parseInt(qtd, 10) || 0);
    const currentList = [...gols7mList];
    if (targetQtd > currentList.length) {
      while (currentList.length < targetQtd) {
        currentList.push({ atletaId: '', atletaNome: '' });
      }
    } else {
      currentList.splice(targetQtd);
    }
    updateTempoExtraField({
      gols7mMarcados: targetQtd,
      gols7m: currentList
    });
  };

  const handleGol7mJogadorChange = (idx, atletaId) => {
    const at = students.find(s => s._id === atletaId);
    const updated = [...gols7mList];
    updated[idx] = { atletaId, atletaNome: at ? at.nome : '' };
    updateTempoExtraField({ gols7m: updated });
  };

  // ==========================================
  // HANDEBOL - CARTÕES
  // ==========================================
  const cartoesHandebol = Array.isArray(tempoExtra.cartoes) ? tempoExtra.cartoes : [];

  const handleAddCartaoHandebol = () => {
    const novo = { equipe: 'Nossa Equipe', atletaId: '', atletaNome: '', tipo: 'Amarelo' };
    updateTempoExtraField({ cartoes: [...cartoesHandebol, novo] });
  };

  const handleRemoveCartaoHandebol = (idx) => {
    updateTempoExtraField({ cartoes: cartoesHandebol.filter((_, i) => i !== idx) });
  };

  const handleCartaoHandebolChange = (idx, field, val) => {
    const updated = [...cartoesHandebol];
    const currentItem = { ...updated[idx] };

    if (field === 'equipe') {
      currentItem.equipe = val;
      if (val === 'Adversário') {
        currentItem.atletaId = '';
        currentItem.atletaNome = currentItem.atletaNome && currentItem.atletaNome !== '' ? currentItem.atletaNome : 'Adversário';
      } else {
        const at = students.find(s => s._id === currentItem.atletaId);
        currentItem.atletaNome = at ? at.nome : '';
      }
    } else if (field === 'atletaId') {
      const at = students.find(s => s._id === val);
      currentItem.atletaId = val;
      currentItem.atletaNome = at ? at.nome : '';
    } else if (field === 'atletaNome') {
      currentItem.atletaNome = val;
    } else if (field === 'tipo') {
      currentItem.tipo = val;
    }

    updated[idx] = currentItem;
    updateTempoExtraField({ cartoes: updated });
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Título do Card */}
      <h5 style={{
        fontWeight: 700,
        color: 'var(--text)',
        marginBottom: '2px',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Timer size={18} style={{ color: 'var(--primary)' }} />
        Tempo Extra
      </h5>

      {/* ── PLACAR DO TEMPO EXTRA (Comum a Futsal, Futebol, Handebol e Basquete) ── */}
      <div style={{
        background: 'var(--bg)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 16px',
        border: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block', textAlign: 'center' }}>
          Placar do Tempo Extra
        </label>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nossa Equipe:</span>
            <NumberStepper
              value={tePlacar.nos ?? ''}
              onChange={(v) => handleScoreChange('nos', v)}
              min={0}
              allowEmpty={true}
              placeholder="0"
              ariaLabel={isBasquete ? "Pontos nossa equipe tempo extra" : "Gols nossa equipe tempo extra"}
            />
          </div>
          <span style={{ fontWeight: 800, color: 'var(--text-tertiary)' }}>X</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NumberStepper
              value={tePlacar.adv ?? ''}
              onChange={(v) => handleScoreChange('adv', v)}
              min={0}
              allowEmpty={true}
              placeholder="0"
              ariaLabel={isBasquete ? "Pontos adversário tempo extra" : "Gols adversário tempo extra"}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Adversário</span>
          </div>
        </div>
      </div>

      {/* ── CRITÉRIOS TÉCNICOS: FUTSAL E FUTEBOL ── */}
      {isFutsalFutebol && (
        <>
          {/* Pênaltis no Tempo Extra */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)'
          }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
              Pênaltis (Tempo Extra)
            </label>
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Sofridos:</span>
                  <NumberStepper
                    value={tempoExtra.penaltisSofridos ?? ''}
                    onChange={(v) => updateTempoExtraField({ penaltisSofridos: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Pênaltis sofridos no tempo extra"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Cometidos:</span>
                  <NumberStepper
                    value={tempoExtra.penaltisCometidos ?? ''}
                    onChange={(v) => updateTempoExtraField({ penaltisCometidos: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Pênaltis cometidos no tempo extra"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Errados:</span>
                  <NumberStepper
                    value={tempoExtra.penaltisErrados ?? ''}
                    onChange={(v) => updateTempoExtraField({ penaltisErrados: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Pênaltis errados no tempo extra"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Defendidos:</span>
                  <NumberStepper
                    value={tempoExtra.penaltisDefendidos ?? ''}
                    onChange={(v) => updateTempoExtraField({ penaltisDefendidos: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Pênaltis defendidos no tempo extra"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Faltas no Tempo Extra */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)'
          }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
              Faltas
            </label>
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Sofridas:</span>
                  <NumberStepper
                    value={tempoExtra.faltasSofridas ?? ''}
                    onChange={(v) => updateTempoExtraField({ faltasSofridas: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Faltas sofridas no tempo extra"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Cometidas:</span>
                  <NumberStepper
                    value={tempoExtra.faltasCometidas ?? ''}
                    onChange={(v) => updateTempoExtraField({ faltasCometidas: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Faltas cometidas no tempo extra"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cartões no Tempo Extra */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)'
          }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
              Cartões
            </label>
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tempo Extra
                </span>
                <button
                  type="button"
                  onClick={handleAddCartaoFutsal}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.6875rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={12} /> Adicionar Cartão
                </button>
              </div>

              {cartoesFutsal.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '8px 0' }}>
                  Nenhum cartão no Tempo Extra.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cartoesFutsal.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <select
                        className="form-select form-select-sm"
                        value={c.atletaId || ''}
                        onChange={(e) => handleCartaoFutsalChange(idx, 'atletaId', e.target.value)}
                        style={{
                          flex: '1 1 180px',
                          minWidth: '150px',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Selecione o atleta</option>
                        {eligibleStudents.map(s => <option key={s._id} value={s._id}>{s.nome} {s.turma ? `(${s.turma})` : ''}</option>)}
                      </select>

                      <select
                        className="form-select form-select-sm"
                        value={c.tipo || 'Amarelo'}
                        onChange={(e) => handleCartaoFutsalChange(idx, 'tipo', e.target.value)}
                        style={{
                          width: '150px',
                          minWidth: '145px',
                          fontWeight: 600,
                          flexShrink: 0,
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Amarelo">🟨 Amarelo</option>
                        <option value="Vermelho">🟥 Vermelho</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveCartaoFutsal(idx)}
                        className="btn btn-sm text-danger"
                        style={{ padding: '4px 6px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        title="Remover cartão"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── CRITÉRIOS TÉCNICOS: HANDEBOL ── */}
      {isHandebol && (
        <>
          {/* Gols de 7 Metros no Tempo Extra */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)'
          }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
              Gols de 7 Metros
            </label>
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Tempo Extra
              </span>

              {/* Gols Sofridos */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                  Gols Sofridos
                </span>
                <NumberStepper
                  value={tempoExtra.gols7mSofridos ?? ''}
                  onChange={(v) => updateTempoExtraField({ gols7mSofridos: v })}
                  min={0}
                  allowEmpty={true}
                  ariaLabel="Gols de 7 metros sofridos no tempo extra"
                />
              </div>

              {/* Separador */}
              <div style={{ height: '1px', background: 'var(--border-light)', margin: '2px 0' }} />

              {/* Gols Marcados */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                    Gols Marcados
                  </span>
                  <NumberStepper
                    value={tempoExtra.gols7mMarcados ?? (gols7mList.length > 0 ? gols7mList.length : '')}
                    onChange={(v) => handleGols7mMarcadosChange(v)}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Gols de 7 metros marcados no tempo extra"
                  />
                </div>

                {/* Seletores de jogadores */}
                {gols7mList.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px dashed var(--border-light)'
                  }}>
                    {gols7mList.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          minWidth: '45px',
                          whiteSpace: 'nowrap'
                        }}>
                          Gol {idx + 1}:
                        </span>
                        <select
                          className="form-select form-select-sm"
                          value={item.atletaId || ''}
                          onChange={(e) => handleGol7mJogadorChange(idx, e.target.value)}
                          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                        >
                          <option value="">Selecionar Jogador</option>
                          {eligibleStudents.map(s => (
                            <option key={s._id} value={s._id}>
                              {s.nome} {s.turma ? `(${s.turma})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cartões no Tempo Extra */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)'
          }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
              Cartões
            </label>
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Tempo Extra
                </span>
                <button
                  type="button"
                  onClick={handleAddCartaoHandebol}
                  className="btn btn-sm btn-secondary"
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={13} /> Adicionar Cartão
                </button>
              </div>

              {cartoesHandebol.length === 0 ? (
                <div style={{
                  padding: '18px 14px',
                  textAlign: 'center',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-light)',
                  marginTop: '2px'
                }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: 0 }}>
                    Nenhum cartão no Tempo Extra.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cartoesHandebol.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px 16px'
                      }}
                    >
                      {/* Equipe */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap' }}>
                          Equipe:
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={c.equipe || 'Nossa Equipe'}
                          onChange={(e) => handleCartaoHandebolChange(idx, 'equipe', e.target.value)}
                          style={{ width: '135px', fontWeight: 500, cursor: 'pointer' }}
                        >
                          <option value="Nossa Equipe">Nossa Equipe</option>
                          <option value="Adversário">Adversário</option>
                        </select>
                      </div>

                      {/* Atleta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px', minWidth: '180px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap' }}>
                          Atleta:
                        </label>
                        {c.equipe === 'Adversário' ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Jogador adversário"
                            value={c.atletaNome && c.atletaNome !== 'Adversário' ? c.atletaNome : ''}
                            onChange={(e) => handleCartaoHandebolChange(idx, 'atletaNome', e.target.value || 'Adversário')}
                            style={{ flex: 1, minWidth: 0 }}
                          />
                        ) : (
                          <select
                            className="form-select form-select-sm"
                            value={c.atletaId || ''}
                            onChange={(e) => handleCartaoHandebolChange(idx, 'atletaId', e.target.value)}
                            style={{ flex: 1, minWidth: 0, textOverflow: 'ellipsis', cursor: 'pointer' }}
                          >
                            <option value="">Selecione o atleta</option>
                            {eligibleStudents.map(s => (
                              <option key={s._id} value={s._id}>
                                {s.nome} {s.turma ? `(${s.turma})` : ''}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Tipo */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap' }}>
                          Tipo:
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={c.tipo || 'Amarelo'}
                          onChange={(e) => handleCartaoHandebolChange(idx, 'tipo', e.target.value)}
                          style={{ width: '135px', fontWeight: 500, cursor: 'pointer' }}
                        >
                          <option value="Amarelo">🟨 Amarelo</option>
                          <option value="Vermelho">🟥 Vermelho</option>
                        </select>
                      </div>

                      {/* Excluir */}
                      <button
                        type="button"
                        onClick={() => handleRemoveCartaoHandebol(idx)}
                        className="btn btn-sm text-danger"
                        style={{ padding: '4px 6px', background: 'transparent', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 'auto' }}
                        title="Remover cartão"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Punições - Dois Minutos no Tempo Extra */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)'
          }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
              Punições - Dois Minutos
            </label>
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tempo Extra
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Nossa Equipe:</span>
                  <NumberStepper
                    value={tempoExtra.doisMinutosNos ?? ''}
                    onChange={(v) => updateTempoExtraField({ doisMinutosNos: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Dois minutos nossa equipe no tempo extra"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Adversário:</span>
                  <NumberStepper
                    value={tempoExtra.doisMinutosAdv ?? ''}
                    onChange={(v) => updateTempoExtraField({ doisMinutosAdv: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Dois minutos adversário no tempo extra"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── CRITÉRIOS TÉCNICOS: BASQUETE ── */}
      {isBasquete && (
        <>
          {/* Cestas de 2 Pontos */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)'
          }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
              Cestas de 2 Pontos
            </label>
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tempo Extra
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', fontWeight: 600 }}>Feitas:</span>
                  <NumberStepper
                    value={tempoExtra.cestas2PontosFeitas ?? ''}
                    onChange={(v) => updateTempoExtraField({ cestas2PontosFeitas: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Cestas de 2 pontos feitas tempo extra"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', fontWeight: 600 }}>Sofridas:</span>
                  <NumberStepper
                    value={tempoExtra.cestas2PontosSofridas ?? ''}
                    onChange={(v) => updateTempoExtraField({ cestas2PontosSofridas: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Cestas de 2 pontos sofridas tempo extra"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cestas de 3 Pontos */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)'
          }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
              Cestas de 3 Pontos
            </label>
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tempo Extra
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', fontWeight: 600 }}>Feitas:</span>
                  <NumberStepper
                    value={tempoExtra.cestas3PontosFeitas ?? ''}
                    onChange={(v) => updateTempoExtraField({ cestas3PontosFeitas: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Cestas de 3 pontos feitas tempo extra"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', fontWeight: 600 }}>Sofridas:</span>
                  <NumberStepper
                    value={tempoExtra.cestas3PontosSofridas ?? ''}
                    onChange={(v) => updateTempoExtraField({ cestas3PontosSofridas: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Cestas de 3 pontos sofridas tempo extra"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lances Livres */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)'
          }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
              Lances Livres
            </label>
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tempo Extra
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Feitos:</span>
                  <NumberStepper
                    value={tempoExtra.lancesLivresFeitos ?? ''}
                    onChange={(v) => updateTempoExtraField({ lancesLivresFeitos: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Lances livres feitos tempo extra"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Sofridos:</span>
                  <NumberStepper
                    value={tempoExtra.lancesLivresSofridos ?? ''}
                    onChange={(v) => updateTempoExtraField({ lancesLivresSofridos: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Lances livres sofridos tempo extra"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Faltas */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-light)'
          }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
              Faltas
            </label>
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tempo Extra
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Cometidas:</span>
                  <NumberStepper
                    value={tempoExtra.faltasCometidas ?? ''}
                    onChange={(v) => updateTempoExtraField({ faltasCometidas: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Faltas cometidas tempo extra"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Sofridas:</span>
                  <NumberStepper
                    value={tempoExtra.faltasSofridas ?? ''}
                    onChange={(v) => updateTempoExtraField({ faltasSofridas: v })}
                    min={0}
                    allowEmpty={true}
                    ariaLabel="Faltas sofridas tempo extra"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TempoExtraCard;
