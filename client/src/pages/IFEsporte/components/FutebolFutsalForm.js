import React, { useEffect } from 'react';
import NumberStepper from '../../../components/NumberStepper';
import { Plus, Trash2 } from 'lucide-react';

const FutebolFutsalForm = ({
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
    : { nos: 0, adv: 0 };

  // 1. Placares 1º e 2º Tempo
  const placar1T = (dados.placar1Tempo && typeof dados.placar1Tempo === 'object')
    ? dados.placar1Tempo
    : { nos: placarObj.nos || 0, adv: placarObj.adv || 0 };

  const placar2T = (dados.placar2Tempo && typeof dados.placar2Tempo === 'object')
    ? dados.placar2Tempo
    : { nos: 0, adv: 0 };

  // Inicializar placares no estado se ainda não configurados
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

    const tePlacar = dados.tempoExtra?.placar;
    const hasTeNos = tePlacar?.nos !== undefined && tePlacar?.nos !== '' && tePlacar?.nos !== null;
    const hasTeAdv = tePlacar?.adv !== undefined && tePlacar?.adv !== '' && tePlacar?.adv !== null;
    const teNos = hasTeNos ? (parseInt(tePlacar.nos, 10) || 0) : 0;
    const teAdv = hasTeAdv ? (parseInt(tePlacar.adv, 10) || 0) : 0;

    const totalNos = (updated1.nos || 0) + (updated2.nos || 0) + teNos;
    const totalAdv = (updated1.adv || 0) + (updated2.adv || 0) + teAdv;

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
  };

  const foiParaPenaltis = dados.foiParaPenaltis !== undefined
    ? Boolean(dados.foiParaPenaltis)
    : Boolean(
        dados.penaltisAcertos > 0 ||
        dados.penaltisErros > 0 ||
        (Array.isArray(dados.penaltisParticipantes) && dados.penaltisParticipantes.length > 0) ||
        (Array.isArray(dados.penaltisCobrancas) && dados.penaltisCobrancas.length > 0)
      );

  const handleFoiParaPenaltisChange = (checked) => {
    updateDados({ foiParaPenaltis: checked });
  };

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

  // Atletas selecionados no desempate
  const selectedShootoutAthletes = Array.isArray(dados.penaltisParticipantes)
    ? dados.penaltisParticipantes
    : (Array.isArray(dados.penaltisCobrancas) ? dados.penaltisCobrancas.map(c => c.atletaId).filter(Boolean) : []);

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
        resultado: 'Participou'
      };
    });

    updateDados({
      penaltisParticipantes: updated,
      penaltisCobrancas: cobrancas
    });
  };

  // Pênaltis no Tempo Regulamentar
  const handlePenaltisRegulamentarChange = (field, val) => {
    const nextVal = Math.max(0, val);
    const updates = { [field]: nextVal };

    if (field.startsWith('penaltisSofridos')) {
      const t1 = field === 'penaltisSofridos1T' ? nextVal : (dados.penaltisSofridos1T || 0);
      const t2 = field === 'penaltisSofridos2T' ? nextVal : (dados.penaltisSofridos2T || 0);
      updates.penaltisSofridosQtd = t1 + t2;
    } else if (field.startsWith('penaltisCometidos')) {
      const t1 = field === 'penaltisCometidos1T' ? nextVal : (dados.penaltisCometidos1T || 0);
      const t2 = field === 'penaltisCometidos2T' ? nextVal : (dados.penaltisCometidos2T || 0);
      updates.penaltisCometidosQtd = t1 + t2;
    } else if (field.startsWith('penaltisErrados')) {
      const t1 = field === 'penaltisErrados1T' ? nextVal : (dados.penaltisErrados1T || 0);
      const t2 = field === 'penaltisErrados2T' ? nextVal : (dados.penaltisErrados2T || 0);
      updates.penaltisErradosQtd = t1 + t2;
    } else if (field.startsWith('penaltisDefendidos')) {
      const t1 = field === 'penaltisDefendidos1T' ? nextVal : (dados.penaltisDefendidos1T || 0);
      const t2 = field === 'penaltisDefendidos2T' ? nextVal : (dados.penaltisDefendidos2T || 0);
      updates.penaltisDefendidosQtd = t1 + t2;
    }

    updateDados(updates);
  };

  // Faltas
  const handleFaltasChange = (field, val) => {
    const nextVal = Math.max(0, val);
    const updates = { [field]: nextVal };

    if (field.startsWith('faltasSofridas')) {
      const t1 = field === 'faltasSofridas1T' ? nextVal : (dados.faltasSofridas1T || 0);
      const t2 = field === 'faltasSofridas2T' ? nextVal : (dados.faltasSofridas2T || 0);
      updates.faltasSofridasQtd = t1 + t2;
    } else if (field.startsWith('faltasCometidas')) {
      const t1 = field === 'faltasCometidas1T' ? nextVal : (dados.faltasCometidas1T || 0);
      const t2 = field === 'faltasCometidas2T' ? nextVal : (dados.faltasCometidas2T || 0);
      updates.faltasCometidasQtd = t1 + t2;
    }

    updateDados(updates);
  };

  // Cartões
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
    const novo = { atletaId: '', atletaNome: '', tipo: 'Amarelo' };
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
    if (tempo === 1) {
      const updated = [...cartoes1T];
      if (field === 'atletaId') {
        const at = students.find(s => s._id === val);
        updated[idx] = { ...updated[idx], atletaId: val, atletaNome: at ? at.nome : '' };
      } else {
        updated[idx] = { ...updated[idx], [field]: val };
      }
      syncCartoes(updated, cartoes2T);
    } else {
      const updated = [...cartoes2T];
      if (field === 'atletaId') {
        const at = students.find(s => s._id === val);
        updated[idx] = { ...updated[idx], atletaId: val, atletaNome: at ? at.nome : '' };
      } else {
        updated[idx] = { ...updated[idx], [field]: val };
      }
      syncCartoes(cartoes1T, updated);
    }
  };

  const tePlacar = dados.tempoExtra?.placar;
  const hasTeNos = tePlacar?.nos !== undefined && tePlacar?.nos !== '' && tePlacar?.nos !== null;
  const hasTeAdv = tePlacar?.adv !== undefined && tePlacar?.adv !== '' && tePlacar?.adv !== null;
  const teNos = hasTeNos ? (parseInt(tePlacar.nos, 10) || 0) : 0;
  const teAdv = hasTeAdv ? (parseInt(tePlacar.adv, 10) || 0) : 0;

  const regulamentarNos = (placar1T.nos || 0) + (placar2T.nos || 0);
  const regulamentarAdv = (placar1T.adv || 0) + (placar2T.adv || 0);

  const totalPartidaNos = regulamentarNos + teNos;
  const totalPartidaAdv = regulamentarAdv + teAdv;

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
              Foi para os pênaltis
            </label>
          </div>
        </div>
      </div>

      {/* 2. Placares da partida (1º e 2º Tempo em um único card) */}
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
                onChange={(e) => handlePlacarTempoChange(1, 'adv', e)}
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
                onChange={(e) => handlePlacarTempoChange(2, 'adv', e)}
                min={0}
                ariaLabel="Gols adversário 2º tempo"
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Adversário</span>
            </div>
          </div>
        </div>

        {/* Total da partida */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-light)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
          Total acumulado da partida: <strong style={{ color: 'var(--text)', fontSize: '0.9375rem' }}>{totalPartidaNos} x {totalPartidaAdv}</strong>
          {(hasTeNos || hasTeAdv) && (teNos > 0 || teAdv > 0) && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              (Tempo Regulamentar: {regulamentarNos} x {regulamentarAdv} + Tempo Extra: {teNos} x {teAdv})
            </div>
          )}
        </div>
      </div>

      {/* 3. Placar de desempate — Disputa de Pênaltis (Exibido quando foi para os pênaltis) */}
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
            Placar de desempate - Disputa de Pênaltis
          </h6>

          {/* Formato: Nossa equipe [Number Stepper] X [Number Stepper] Adversário */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Nossa equipe
              </span>
              <NumberStepper
                value={dados.penaltisAcertos || 0}
                onChange={(v) => updateDados({ penaltisAcertos: v })}
                min={0}
                ariaLabel="Nossa equipe"
              />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-tertiary)' }}>X</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NumberStepper
                value={dados.penaltisErros || 0}
                onChange={(v) => updateDados({ penaltisErros: v })}
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

      {/* 4. Pênaltis no Tempo Regulamentar (Abaixo do placar normal ou do placar de desempate se empate) */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-light)'
      }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
          Pênaltis (Tempo Regulamentar)
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
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Sofridos:</span>
                  <NumberStepper
                    value={dados.penaltisSofridos1T || 0}
                    onChange={(v) => handlePenaltisRegulamentarChange('penaltisSofridos1T', v)}
                    min={0}
                    ariaLabel="Pênaltis sofridos no 1º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Cometidos:</span>
                  <NumberStepper
                    value={dados.penaltisCometidos1T || 0}
                    onChange={(v) => handlePenaltisRegulamentarChange('penaltisCometidos1T', v)}
                    min={0}
                    ariaLabel="Pênaltis cometidos no 1º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Errados:</span>
                  <NumberStepper
                    value={dados.penaltisErrados1T || 0}
                    onChange={(v) => handlePenaltisRegulamentarChange('penaltisErrados1T', v)}
                    min={0}
                    ariaLabel="Pênaltis errados no 1º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Defendidos:</span>
                  <NumberStepper
                    value={dados.penaltisDefendidos1T || 0}
                    onChange={(v) => handlePenaltisRegulamentarChange('penaltisDefendidos1T', v)}
                    min={0}
                    ariaLabel="Pênaltis defendidos no 1º tempo"
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
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Sofridos:</span>
                  <NumberStepper
                    value={dados.penaltisSofridos2T || 0}
                    onChange={(v) => handlePenaltisRegulamentarChange('penaltisSofridos2T', v)}
                    min={0}
                    ariaLabel="Pênaltis sofridos no 2º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Cometidos:</span>
                  <NumberStepper
                    value={dados.penaltisCometidos2T || 0}
                    onChange={(v) => handlePenaltisRegulamentarChange('penaltisCometidos2T', v)}
                    min={0}
                    ariaLabel="Pênaltis cometidos no 2º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Errados:</span>
                  <NumberStepper
                    value={dados.penaltisErrados2T || 0}
                    onChange={(v) => handlePenaltisRegulamentarChange('penaltisErrados2T', v)}
                    min={0}
                    ariaLabel="Pênaltis errados no 2º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Pênaltis Defendidos:</span>
                  <NumberStepper
                    value={dados.penaltisDefendidos2T || 0}
                    onChange={(v) => handlePenaltisRegulamentarChange('penaltisDefendidos2T', v)}
                    min={0}
                    ariaLabel="Pênaltis defendidos no 2º tempo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Faltas (1º e 2º Tempo em um único card) */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-light)'
      }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
          Faltas
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
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Sofridas:</span>
                  <NumberStepper
                    value={dados.faltasSofridas1T || 0}
                    onChange={(v) => handleFaltasChange('faltasSofridas1T', v)}
                    min={0}
                    ariaLabel="Faltas sofridas no 1º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Cometidas:</span>
                  <NumberStepper
                    value={dados.faltasCometidas1T || 0}
                    onChange={(v) => handleFaltasChange('faltasCometidas1T', v)}
                    min={0}
                    ariaLabel="Faltas cometidas no 1º tempo"
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
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Sofridas:</span>
                  <NumberStepper
                    value={dados.faltasSofridas2T || 0}
                    onChange={(v) => handleFaltasChange('faltasSofridas2T', v)}
                    min={0}
                    ariaLabel="Faltas sofridas no 2º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Cometidas:</span>
                  <NumberStepper
                    value={dados.faltasCometidas2T || 0}
                    onChange={(v) => handleFaltasChange('faltasCometidas2T', v)}
                    min={0}
                    ariaLabel="Faltas cometidas no 2º tempo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Cartões (1º e 2º Tempo em um único card) */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-light)'
      }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
          Cartões
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1º Tempo
                </span>
                <button
                  type="button"
                  onClick={() => handleAddCartao(1)}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.6875rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={12} /> Adicionar Cartão
                </button>
              </div>

              {cartoes1T.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '8px 0' }}>
                  Nenhum cartão no 1º Tempo.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cartoes1T.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <select
                        className="form-select form-select-sm"
                        value={c.atletaId || ''}
                        onChange={(e) => handleCartaoChange(1, idx, 'atletaId', e.target.value)}
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
                        onChange={(e) => handleCartaoChange(1, idx, 'tipo', e.target.value)}
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
                        onClick={() => handleRemoveCartao(1, idx)}
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

          {/* 2º Tempo */}
          <div className="col-12 col-md-6">
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-light)',
              height: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2º Tempo
                </span>
                <button
                  type="button"
                  onClick={() => handleAddCartao(2)}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.6875rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={12} /> Adicionar Cartão
                </button>
              </div>

              {cartoes2T.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '8px 0' }}>
                  Nenhum cartão no 2º Tempo.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cartoes2T.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <select
                        className="form-select form-select-sm"
                        value={c.atletaId || ''}
                        onChange={(e) => handleCartaoChange(2, idx, 'atletaId', e.target.value)}
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
                        onChange={(e) => handleCartaoChange(2, idx, 'tipo', e.target.value)}
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
                        onClick={() => handleRemoveCartao(2, idx)}
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
        </div>
      </div>

    </div>
  );
};

export default FutebolFutsalForm;
