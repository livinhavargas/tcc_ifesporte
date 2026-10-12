import React, { useEffect } from 'react';
import NumberStepper from '../../../components/NumberStepper';
import { Plus, Trash2 } from 'lucide-react';

const HandebolForm = ({
  formData,
  setFormData,
  students = []
}) => {
  const dados = formData.dadosEspecificos || {};

  const updateDados = (updates) => {
    setFormData(prev => ({
      ...prev,
      dadosEspecificos: {
        ...(prev.dadosEspecificos || {}),
        ...updates
      }
    }));
  };

  const placarObj = typeof formData.placar === 'object' && formData.placar !== null 
    ? formData.placar 
    : (typeof formData.placar === 'string' && formData.placar.includes('x') 
        ? { nos: parseInt(formData.placar.split('x')[0], 10) || 0, adv: parseInt(formData.placar.split('x')[1], 10) || 0 }
        : { nos: 0, adv: 0 });

  // 1. Placares 1º e 2º Tempo
  const placar1T = (dados.placar1Tempo && typeof dados.placar1Tempo === 'object')
    ? dados.placar1Tempo
    : { nos: placarObj.nos || 0, adv: placarObj.adv || 0 };

  const placar2T = (dados.placar2Tempo && typeof dados.placar2Tempo === 'object')
    ? dados.placar2Tempo
    : { nos: 0, adv: 0 };

  useEffect(() => {
    if (!dados.placar1Tempo || !dados.placar2Tempo) {
      updateDados({
        placar1Tempo: dados.placar1Tempo || { nos: placarObj.nos || 0, adv: placarObj.adv || 0 },
        placar2Tempo: dados.placar2Tempo || { nos: 0, adv: 0 }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlacarTempoChange = (tempo, team, val) => {
    const nextVal = Math.max(0, val);
    const updated1 = tempo === 1 ? { ...placar1T, [team]: nextVal } : placar1T;
    const updated2 = tempo === 2 ? { ...placar2T, [team]: nextVal } : placar2T;
    const totalNos = (updated1.nos || 0) + (updated2.nos || 0);
    const totalAdv = (updated1.adv || 0) + (updated2.adv || 0);

    setFormData(prev => ({
      ...prev,
      placar: { nos: totalNos, adv: totalAdv },
      dadosEspecificos: {
        ...(prev.dadosEspecificos || {}),
        placar1Tempo: updated1,
        placar2Tempo: updated2
      }
    }));
  };

  const handleResultadoChange = (novoResultado) => {
    setFormData(prev => ({
      ...prev,
      resultado: novoResultado
    }));
    if (novoResultado === 'Empate') {
      updateDados({ foiParaPenaltis: true });
    }
  };

  // Desempate / Pênaltis (Cobranças de 7 Metros)
  const foiParaPenaltis = dados.foiParaPenaltis !== undefined
    ? Boolean(dados.foiParaPenaltis)
    : Boolean(
        formData.resultado === 'Empate' ||
        dados.penaltisAcertos > 0 ||
        dados.penaltisErros > 0 ||
        dados.desempateSeteMetrosAcertos > 0 ||
        dados.desempateSeteMetrosErros > 0 ||
        (Array.isArray(dados.penaltisParticipantes) && dados.penaltisParticipantes.length > 0) ||
        (Array.isArray(dados.desempateSeteMetrosLista) && dados.desempateSeteMetrosLista.length > 0)
      );

  const handleFoiParaPenaltisChange = (checked) => {
    updateDados({ foiParaPenaltis: checked });
  };

  // Filtro de atletas conforme gênero da categoria
  const categoriaLower = (formData.categoria || '').toLowerCase();
  const eligibleStudents = students.filter(s => {
    if (categoriaLower === 'feminino') {
      return (s.sexo || '').toLowerCase() === 'feminino';
    }
    if (categoriaLower === 'masculino') {
      return (s.sexo || '').toLowerCase() === 'masculino';
    }
    return true;
  });

  const selectedShootoutAthletes = Array.isArray(dados.penaltisParticipantes)
    ? dados.penaltisParticipantes
    : (Array.isArray(dados.desempateSeteMetrosLista) 
        ? dados.desempateSeteMetrosLista.map(c => c.atletaId).filter(Boolean) 
        : []);

  const toggleShootoutAthlete = (atletaId) => {
    const isSelected = selectedShootoutAthletes.includes(atletaId);
    const updated = isSelected 
      ? selectedShootoutAthletes.filter(id => id !== atletaId)
      : [...selectedShootoutAthletes, atletaId];

    const cobrancas = updated.map(id => {
      const at = eligibleStudents.find(s => s._id === id) || students.find(s => s._id === id);
      return {
        atletaId: id,
        atletaNome: at ? at.nome : '',
        resultado: 'Acertou'
      };
    });

    updateDados({
      penaltisParticipantes: updated,
      penaltisCobrancas: cobrancas,
      desempateSeteMetrosLista: cobrancas
    });
  };

  // 2. Gols de 7 Metros (Fusão da contagem com a seleção do jogador marcador)
  const getGolsList = (list, qtd) => {
    const arr = Array.isArray(list) ? list.map(item => ({ ...item })) : [];
    if (typeof qtd === 'number' && qtd > arr.length) {
      while (arr.length < qtd) {
        arr.push({ atletaId: '', atletaNome: '' });
      }
    }
    return arr;
  };

  const rawGols1T = Array.isArray(dados.gols7m1T) 
    ? dados.gols7m1T 
    : (Array.isArray(dados.autoresGols7m1T) ? dados.autoresGols7m1T : []);

  const rawGols2T = Array.isArray(dados.gols7m2T) 
    ? dados.gols7m2T 
    : (Array.isArray(dados.autoresGols7m2T) ? dados.autoresGols7m2T : []);

  const gols7m1T = getGolsList(rawGols1T, dados.gols7mMarcados1T);
  const gols7m2T = getGolsList(rawGols2T, dados.gols7mMarcados2T);

  const handleGols7mMarcadosQtdChange = (tempo, qtd) => {
    const targetQtd = Math.max(0, qtd);
    const currentList = tempo === 1 ? [...gols7m1T] : [...gols7m2T];
    
    if (targetQtd > currentList.length) {
      while (currentList.length < targetQtd) {
        currentList.push({ atletaId: '', atletaNome: '' });
      }
    } else {
      currentList.splice(targetQtd);
    }

    if (tempo === 1) {
      updateDados({
        gols7m1T: currentList,
        gols7mMarcados1T: targetQtd,
        autoresGols7m1T: currentList
      });
    } else {
      updateDados({
        gols7m2T: currentList,
        gols7mMarcados2T: targetQtd,
        autoresGols7m2T: currentList
      });
    }
  };

  const handleGol7mJogadorChange = (tempo, idx, atletaId) => {
    const at = students.find(s => s._id === atletaId);
    const item = { atletaId, atletaNome: at ? at.nome : '' };
    if (tempo === 1) {
      const updated = [...gols7m1T];
      updated[idx] = item;
      updateDados({
        gols7m1T: updated,
        autoresGols7m1T: updated
      });
    } else {
      const updated = [...gols7m2T];
      updated[idx] = item;
      updateDados({
        gols7m2T: updated,
        autoresGols7m2T: updated
      });
    }
  };


  // 3. Cartões (Estrutura e estilo visual do Futsal com suporte a Nossa Equipe e Adversário)
  const cartoes1T = Array.isArray(dados.cartoes1T)
    ? dados.cartoes1T
    : (Array.isArray(dados.cartoes) ? dados.cartoes.filter(c => c.tempo === '1º Tempo' || !c.tempo) : []);

  const cartoes2T = Array.isArray(dados.cartoes2T)
    ? dados.cartoes2T
    : (Array.isArray(dados.cartoes) ? dados.cartoes.filter(c => c.tempo === '2º Tempo') : []);

  const syncCartoes = (new1T, new2T) => {
    const unified = [
      ...new1T.map(c => ({ ...c, tempo: '1º Tempo' })),
      ...new2T.map(c => ({ ...c, tempo: '2º Tempo' }))
    ];
    updateDados({
      cartoes1T: new1T,
      cartoes2T: new2T,
      cartoes: unified
    });
  };

  const handleAddCartao = (tempo) => {
    const novo = { equipe: 'Nossa Equipe', atletaId: '', atletaNome: '', tipo: 'Amarelo' };
    if (tempo === 1) {
      syncCartoes([...cartoes1T, novo], cartoes2T);
    } else {
      syncCartoes(cartoes1T, [...cartoes2T, novo]);
    }
  };

  const handleRemoveCartao = (tempo, idx) => {
    if (tempo === 1) {
      syncCartoes(cartoes1T.filter((_, i) => i !== idx), cartoes2T);
    } else {
      syncCartoes(cartoes1T, cartoes2T.filter((_, i) => i !== idx));
    }
  };

  const handleCartaoChange = (tempo, idx, field, val) => {
    const targetList = tempo === 1 ? [...cartoes1T] : [...cartoes2T];
    const currentItem = { ...targetList[idx] };

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

    targetList[idx] = currentItem;
    if (tempo === 1) {
      syncCartoes(targetList, cartoes2T);
    } else {
      syncCartoes(cartoes1T, targetList);
    }
  };

  const totalPartidaNos = (placar1T.nos || 0) + (placar2T.nos || 0);
  const totalPartidaAdv = (placar1T.adv || 0) + (placar2T.adv || 0);

  const renderPainelCartoes = (tempo, cartoesList) => (
    <div style={{
      background: 'var(--bg)',
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      border: '1px solid var(--border-light)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Cabeçalho do tempo e ação de adicionar */}
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
          {tempo === 1 ? '1º Tempo' : '2º Tempo'}
        </span>
        <button
          type="button"
          onClick={() => handleAddCartao(tempo)}
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

      {/* Lista de cartões ou mensagem informativa */}
      {cartoesList.length === 0 ? (
        <div style={{
          padding: '18px 14px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-light)',
          marginTop: '2px'
        }}>
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--text-tertiary)',
            margin: 0
          }}>
            Nenhum cartão no {tempo === 1 ? '1º' : '2º'} Tempo.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cartoesList.map((c, idx) => (
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
              {/* Campo Equipe */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0
              }}>
                <label style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  margin: 0,
                  whiteSpace: 'nowrap'
                }}>
                  Equipe:
                </label>
                <select
                  className="form-select form-select-sm"
                  value={c.equipe || 'Nossa Equipe'}
                  onChange={(e) => handleCartaoChange(tempo, idx, 'equipe', e.target.value)}
                  style={{
                    width: '150px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <option value="Nossa Equipe">Nossa Equipe</option>
                  <option value="Adversário">Adversário</option>
                </select>
              </div>

              {/* Campo Atleta */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: '1 1 240px',
                minWidth: '200px'
              }}>
                <label style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  margin: 0,
                  whiteSpace: 'nowrap'
                }}>
                  Atleta:
                </label>
                {c.equipe === 'Adversário' ? (
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Jogador adversário (opcional)"
                    value={c.atletaNome && c.atletaNome !== 'Adversário' ? c.atletaNome : ''}
                    onChange={(e) => handleCartaoChange(tempo, idx, 'atletaNome', e.target.value || 'Adversário')}
                    style={{
                      flex: 1,
                      minWidth: 0
                    }}
                  />
                ) : (
                  <select
                    className="form-select form-select-sm"
                    value={c.atletaId || ''}
                    onChange={(e) => handleCartaoChange(tempo, idx, 'atletaId', e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      textOverflow: 'ellipsis',
                      cursor: 'pointer'
                    }}
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

              {/* Campo Tipo de cartão */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0
              }}>
                <label style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  margin: 0,
                  whiteSpace: 'nowrap'
                }}>
                  Tipo de cartão:
                </label>
                <select
                  className="form-select form-select-sm"
                  value={c.tipo || 'Amarelo'}
                  onChange={(e) => handleCartaoChange(tempo, idx, 'tipo', e.target.value)}
                  style={{
                    width: '145px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <option value="Amarelo">🟨 Amarelo</option>
                  <option value="Vermelho">🟥 Vermelho</option>
                </select>
              </div>

              {/* Botão Excluir */}
              <button
                type="button"
                onClick={() => handleRemoveCartao(tempo, idx)}
                className="btn btn-sm text-danger"
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  flexShrink: 0,
                  marginLeft: 'auto'
                }}
                title="Remover cartão"
                aria-label="Remover cartão"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Equipe Adversária & 2. Resultado Final */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label" style={{ fontWeight: 700 }}>
            Equipe Adversária <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite o nome da equipe adversária"
            value={formData.equipeAdversaria || ''}
            onChange={(e) => setFormData({ ...formData, equipeAdversaria: e.target.value })}
            required
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={{ fontWeight: 700 }}>
            Resultado Final <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              value={formData.resultado || ''}
              onChange={(e) => handleResultadoChange(e.target.value)}
              style={{ flex: '1 1 180px' }}
              required
            >
              <option value="">Selecione o resultado</option>
              <option value="Vitória">Vitória</option>
              <option value="Empate">Empate</option>
              <option value="Derrota">Derrota</option>
            </select>

            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: foiParaPenaltis ? 'var(--text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              padding: '6px 0'
            }}>
              <input
                type="checkbox"
                checked={Boolean(foiParaPenaltis)}
                onChange={(e) => handleFoiParaPenaltisChange(e.target.checked)}
                style={{
                  width: '17px',
                  height: '17px',
                  accentColor: 'var(--primary)',
                  cursor: 'pointer'
                }}
              />
              Foi para o desempate
            </label>
          </div>
        </div>
      </div>

      {/* 2. Placares da partida (1º e 2º Tempo em um único card — Estilo Futsal) */}
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
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '16px', display: 'block', textAlign: 'center' }}>
          Placares da partida <span style={{ color: 'var(--error)' }}>*</span>
        </label>

        {/* 1º Tempo */}
        <div style={{ marginBottom: '16px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            1º Tempo
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nossa Equipe:</span>
              <NumberStepper
                value={placar1T.nos || 0}
                onChange={(v) => handlePlacarTempoChange(1, 'nos', v)}
                min={0}
                ariaLabel="Gols nossa equipe 1º tempo"
              />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-tertiary)' }}>X</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NumberStepper
                value={placar1T.adv || 0}
                onChange={(v) => handlePlacarTempoChange(1, 'adv', v)}
                min={0}
                ariaLabel="Gols adversário 1º tempo"
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Adversário</span>
            </div>
          </div>
        </div>

        {/* Linha divisória sutil entre tempos */}
        <div style={{ width: '80%', height: '1px', background: 'var(--border-light)', margin: '4px 0 16px' }} />

        {/* 2º Tempo */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            2º Tempo
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nossa Equipe:</span>
              <NumberStepper
                value={placar2T.nos || 0}
                onChange={(v) => handlePlacarTempoChange(2, 'nos', v)}
                min={0}
                ariaLabel="Gols nossa equipe 2º tempo"
              />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-tertiary)' }}>X</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NumberStepper
                value={placar2T.adv || 0}
                onChange={(v) => handlePlacarTempoChange(2, 'adv', v)}
                min={0}
                ariaLabel="Gols adversário 2º tempo"
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Adversário</span>
            </div>
          </div>
        </div>

        {/* Total acumulado da partida */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-light)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
          Total acumulado da partida: <strong style={{ color: 'var(--text)', fontSize: '0.9375rem' }}>{totalPartidaNos} x {totalPartidaAdv}</strong>
        </div>
      </div>

      {/* 3. Placar de desempate — Cobranças de 7 Metros (Estilo Futsal) */}
      {foiParaPenaltis && (
        <div style={{
          background: 'var(--bg)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1.5px solid #fb923c',
          boxShadow: '0 0 0 2px rgba(251, 146, 60, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h6 style={{
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '16px',
            fontSize: '0.9375rem',
            textAlign: 'center',
            width: '100%'
          }}>
            Placar de desempate - Cobranças de 7 Metros
          </h6>

          {/* Formato: Nossa equipe [Number Stepper] X [Number Stepper] Adversário */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Nossa equipe
              </span>
              <NumberStepper
                value={dados.penaltisAcertos ?? dados.desempateSeteMetrosAcertos ?? 0}
                onChange={(v) => updateDados({ penaltisAcertos: v, desempateSeteMetrosAcertos: v })}
                min={0}
                ariaLabel="Nossa equipe"
              />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-tertiary)' }}>X</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NumberStepper
                value={dados.penaltisErros ?? dados.desempateSeteMetrosErros ?? 0}
                onChange={(v) => updateDados({ penaltisErros: v, desempateSeteMetrosErros: v })}
                min={0}
                ariaLabel="Adversário"
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Adversário
              </span>
            </div>
          </div>

          {/* Divisor */}
          <div style={{ width: '100%', height: '1px', background: 'rgba(251, 146, 60, 0.25)', margin: '4px 0 16px' }} />

          {/* Jogadores que participaram da cobrança */}
          <div style={{ width: '100%', textAlign: 'left' }}>
            <h6 style={{
              fontWeight: 700,
              color: 'var(--text)',
              fontSize: '0.875rem',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              Jogadores que participaram da cobrança
            </h6>

            {eligibleStudents.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textAlign: 'center', margin: 0 }}>
                Nenhum jogador encontrado para a categoria selecionada.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px',
                width: '100%'
              }}>
                {eligibleStudents.map((st) => {
                  const isSelected = selectedShootoutAthletes.includes(st._id);
                  return (
                    <label
                      key={st._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(251, 146, 60, 0.08)' : 'var(--bg-card)',
                        border: isSelected ? '1px solid #fb923c' : '1px solid var(--border-light)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        userSelect: 'none'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleShootoutAthlete(st._id)}
                        style={{
                          accentColor: '#f97316',
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{
                          fontSize: '0.8125rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: 'var(--text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {st.nome}
                        </span>
                        {st.turma && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                            {st.turma}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Card de Gols de 7 Metros */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-light)'
      }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
          Gols de 7 Metros
        </label>

        <div className="row g-3">
          {/* 1º Tempo */}
          <div className="col-12 col-md-6">
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-light)',
              height: '100%',
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
                1º Tempo
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
                  value={dados.gols7mSofridos1T || 0}
                  onChange={(v) => updateDados({ gols7mSofridos1T: Math.max(0, v) })}
                  min={0}
                  ariaLabel="Gols sofridos 1º tempo"
                />
              </div>

              {/* Separador visual discreto */}
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
                    value={gols7m1T.length}
                    onChange={(v) => handleGols7mMarcadosQtdChange(1, v)}
                    min={0}
                    ariaLabel="Gols marcados 1º tempo"
                  />
                </div>

                {/* Seletores de jogadores (quando quantidade > 0) */}
                {gols7m1T.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px dashed var(--border-light)'
                  }}>
                    {gols7m1T.map((item, idx) => (
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
                          onChange={(e) => handleGol7mJogadorChange(1, idx, e.target.value)}
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

          {/* 2º Tempo */}
          <div className="col-12 col-md-6">
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-light)',
              height: '100%',
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
                2º Tempo
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
                  value={dados.gols7mSofridos2T || 0}
                  onChange={(v) => updateDados({ gols7mSofridos2T: Math.max(0, v) })}
                  min={0}
                  ariaLabel="Gols sofridos 2º tempo"
                />
              </div>

              {/* Separador visual discreto */}
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
                    value={gols7m2T.length}
                    onChange={(v) => handleGols7mMarcadosQtdChange(2, v)}
                    min={0}
                    ariaLabel="Gols marcados 2º tempo"
                  />
                </div>

                {/* Seletores de jogadores (quando quantidade > 0) */}
                {gols7m2T.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px dashed var(--border-light)'
                  }}>
                    {gols7m2T.map((item, idx) => (
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
                          onChange={(e) => handleGol7mJogadorChange(2, idx, e.target.value)}
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
        </div>
      </div>

      {/* 5. Card de Cartões */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-light)'
      }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
          Cartões
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1º Tempo */}
          {renderPainelCartoes(1, cartoes1T)}

          {/* 2º Tempo */}
          {renderPainelCartoes(2, cartoes2T)}
        </div>
      </div>

      {/* 6. Card de Punições — Dois Minutos (Parte 4: Título e labels simplificadas) */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-light)'
      }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
          Punições - Dois Minutos
        </label>

        <div className="row g-3">
          {/* 1º Tempo */}
          <div className="col-12 col-md-6">
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-light)',
              height: '100%'
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1º Tempo
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Nossa Equipe:</span>
                  <NumberStepper
                    value={dados.doisMinutosNos1T || 0}
                    onChange={(v) => updateDados({ doisMinutosNos1T: Math.max(0, v) })}
                    min={0}
                    ariaLabel="Dois minutos nossa equipe 1º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Adversário:</span>
                  <NumberStepper
                    value={dados.doisMinutosAdv1T || 0}
                    onChange={(v) => updateDados({ doisMinutosAdv1T: Math.max(0, v) })}
                    min={0}
                    ariaLabel="Dois minutos adversário 1º tempo"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2º Tempo */}
          <div className="col-12 col-md-6">
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-light)',
              height: '100%'
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                2º Tempo
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Nossa Equipe:</span>
                  <NumberStepper
                    value={dados.doisMinutosNos2T || 0}
                    onChange={(v) => updateDados({ doisMinutosNos2T: Math.max(0, v) })}
                    min={0}
                    ariaLabel="Dois minutos nossa equipe 2º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Adversário:</span>
                  <NumberStepper
                    value={dados.doisMinutosAdv2T || 0}
                    onChange={(v) => updateDados({ doisMinutosAdv2T: Math.max(0, v) })}
                    min={0}
                    ariaLabel="Dois minutos adversário 2º tempo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HandebolForm;
