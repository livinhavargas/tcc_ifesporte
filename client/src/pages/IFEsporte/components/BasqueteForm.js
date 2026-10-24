import React from 'react';
import NumberStepper from '../../../components/NumberStepper';

const BasqueteForm = ({
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

  const tePlacar = dados.tempoExtra?.placar;
  const hasTeNos = tePlacar?.nos !== undefined && tePlacar?.nos !== '' && tePlacar?.nos !== null;
  const hasTeAdv = tePlacar?.adv !== undefined && tePlacar?.adv !== '' && tePlacar?.adv !== null;
  const teNos = hasTeNos ? (parseInt(tePlacar.nos, 10) || 0) : 0;
  const teAdv = hasTeAdv ? (parseInt(tePlacar.adv, 10) || 0) : 0;

  const placar1T = dados.placar1Tempo || { nos: 0, adv: 0 };
  const placar2T = dados.placar2Tempo || { nos: 0, adv: 0 };
  const regulamentarNos = (placar1T.nos || 0) + (placar2T.nos || 0);
  const regulamentarAdv = (placar1T.adv || 0) + (placar2T.adv || 0);

  const totalPartidaNos = regulamentarNos + teNos;
  const totalPartidaAdv = regulamentarAdv + teAdv;

  const handlePlacarTempoChange = (tempo, team, val) => {
    const nextVal = Math.max(0, val);
    const updated1 = tempo === 1 ? { ...placar1T, [team]: nextVal } : placar1T;
    const updated2 = tempo === 2 ? { ...placar2T, [team]: nextVal } : placar2T;
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

  React.useEffect(() => {
    if (!dados.placar1Tempo || !dados.placar2Tempo || !formData.placar || formData.placar === '') {
      const p1 = dados.placar1Tempo || { nos: 0, adv: 0 };
      const p2 = dados.placar2Tempo || { nos: 0, adv: 0 };
      setFormData(prev => ({
        ...prev,
        placar: (typeof prev.placar === 'object' && prev.placar !== null)
          ? prev.placar
          : { nos: (p1.nos || 0) + (p2.nos || 0) + teNos, adv: (p1.adv || 0) + (p2.adv || 0) + teAdv },
        dadosEspecificos: {
          ...(prev.dadosEspecificos || {}),
          placar1Tempo: p1,
          placar2Tempo: p2
        }
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Equipe Adversária & 2. Resultado */}
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
          <label htmlFor="select-resultado-final-basquete" className="form-label" style={{ fontWeight: 700 }}>
            Resultado Final <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <select
            id="select-resultado-final-basquete"
            className="form-select"
            value={formData.resultado || ''}
            onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
            required
          >
            <option value="">Selecione o resultado</option>
            <option value="Vitória">Vitória</option>
            <option value="Derrota">Derrota</option>
          </select>
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
                ariaLabel="Pontos nossa equipe 1º tempo"
              />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-tertiary)' }}>X</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NumberStepper
                value={placar1T.adv || 0}
                onChange={(e) => handlePlacarTempoChange(1, 'adv', e)}
                min={0}
                ariaLabel="Pontos adversário 1º tempo"
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
                ariaLabel="Pontos nossa equipe 2º tempo"
              />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-tertiary)' }}>X</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NumberStepper
                value={placar2T.adv || 0}
                onChange={(e) => handlePlacarTempoChange(2, 'adv', e)}
                min={0}
                ariaLabel="Pontos adversário 2º tempo"
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Adversário</span>
            </div>
          </div>
        </div>

        {/* Total acumulado da partida */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-light)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
          Total acumulado da partida: <strong style={{ color: 'var(--text)', fontSize: '0.9375rem' }}>{totalPartidaNos} x {totalPartidaAdv}</strong>
          {(hasTeNos || hasTeAdv) && (teNos > 0 || teAdv > 0) && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              (Tempo Regulamentar: {regulamentarNos} x {regulamentarAdv} + Tempo Extra: {teNos} x {teAdv})
            </div>
          )}
        </div>
      </div>

      {/* 3. Cards de Cestas (Cestas de 2 Pontos e Cestas de 3 Pontos dispostos em Coluna de 100%) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Card: Cestas de 2 Pontos (100% de largura) */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid var(--border-light)',
          width: '100%'
        }}>
          <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
            Cestas de 2 Pontos
          </label>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '10px', width: '100%' }}>
            {/* 1º Tempo */}
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 10px',
              border: '1px solid var(--border-light)',
              flex: 1
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1º Tempo
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'nowrap' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', width: '60px', flexShrink: 0, fontWeight: 600 }}>Feitas:</span>
                  <NumberStepper
                    value={dados.cestas2PontosFeitas1T || 0}
                    onChange={(v) => updateDados({ cestas2PontosFeitas1T: v })}
                    min={0}
                    size="sm"
                    style={{ flexShrink: 0 }}
                    ariaLabel="Cestas de 2 pontos feitas 1º tempo"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'nowrap' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', width: '60px', flexShrink: 0, fontWeight: 600 }}>Sofridas:</span>
                  <NumberStepper
                    value={dados.cestas2PontosSofridas1T || 0}
                    onChange={(v) => updateDados({ cestas2PontosSofridas1T: v })}
                    min={0}
                    size="sm"
                    style={{ flexShrink: 0 }}
                    ariaLabel="Cestas de 2 pontos sofridas 1º tempo"
                  />
                </div>
              </div>
            </div>

            {/* 2º Tempo */}
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 10px',
              border: '1px solid var(--border-light)',
              flex: 1
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                2º Tempo
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'nowrap' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', width: '60px', flexShrink: 0, fontWeight: 600 }}>Feitas:</span>
                  <NumberStepper
                    value={dados.cestas2PontosFeitas2T || 0}
                    onChange={(v) => updateDados({ cestas2PontosFeitas2T: v })}
                    min={0}
                    size="sm"
                    style={{ flexShrink: 0 }}
                    ariaLabel="Cestas de 2 pontos feitas 2º tempo"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'nowrap' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', width: '60px', flexShrink: 0, fontWeight: 600 }}>Sofridas:</span>
                  <NumberStepper
                    value={dados.cestas2PontosSofridas2T || 0}
                    onChange={(v) => updateDados({ cestas2PontosSofridas2T: v })}
                    min={0}
                    size="sm"
                    style={{ flexShrink: 0 }}
                    ariaLabel="Cestas de 2 pontos sofridas 2º tempo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Cestas de 3 Pontos (100% de largura) */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid var(--border-light)',
          width: '100%'
        }}>
          <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
            Cestas de 3 Pontos
          </label>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '10px', width: '100%' }}>
            {/* 1º Tempo */}
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 10px',
              border: '1px solid var(--border-light)',
              flex: 1
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1º Tempo
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'nowrap' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', width: '60px', flexShrink: 0, fontWeight: 600 }}>Feitas:</span>
                  <NumberStepper
                    value={dados.cestas3PontosFeitas1T || 0}
                    onChange={(v) => updateDados({ cestas3PontosFeitas1T: v })}
                    min={0}
                    size="sm"
                    style={{ flexShrink: 0 }}
                    ariaLabel="Cestas de 3 pontos feitas 1º tempo"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'nowrap' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', width: '60px', flexShrink: 0, fontWeight: 600 }}>Sofridas:</span>
                  <NumberStepper
                    value={dados.cestas3PontosSofridas1T || 0}
                    onChange={(v) => updateDados({ cestas3PontosSofridas1T: v })}
                    min={0}
                    size="sm"
                    style={{ flexShrink: 0 }}
                    ariaLabel="Cestas de 3 pontos sofridas 1º tempo"
                  />
                </div>
              </div>
            </div>

            {/* 2º Tempo */}
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 10px',
              border: '1px solid var(--border-light)',
              flex: 1
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                2º Tempo
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'nowrap' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', width: '60px', flexShrink: 0, fontWeight: 600 }}>Feitas:</span>
                  <NumberStepper
                    value={dados.cestas3PontosFeitas2T || 0}
                    onChange={(v) => updateDados({ cestas3PontosFeitas2T: v })}
                    min={0}
                    size="sm"
                    style={{ flexShrink: 0 }}
                    ariaLabel="Cestas de 3 pontos feitas 2º tempo"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'nowrap' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)', width: '60px', flexShrink: 0, fontWeight: 600 }}>Sofridas:</span>
                  <NumberStepper
                    value={dados.cestas3PontosSofridas2T || 0}
                    onChange={(v) => updateDados({ cestas3PontosSofridas2T: v })}
                    min={0}
                    size="sm"
                    style={{ flexShrink: 0 }}
                    ariaLabel="Cestas de 3 pontos sofridas 2º tempo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Card: Lances Livres */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-light)'
      }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '14px', display: 'block' }}>
          Lances Livres
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
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Feitos:</span>
                  <NumberStepper
                    value={dados.lancesLivresFeitos1T || 0}
                    onChange={(v) => updateDados({ lancesLivresFeitos1T: v })}
                    min={0}
                    ariaLabel="Lances livres feitos 1º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Sofridos:</span>
                  <NumberStepper
                    value={dados.lancesLivresSofridos1T || 0}
                    onChange={(v) => updateDados({ lancesLivresSofridos1T: v })}
                    min={0}
                    ariaLabel="Lances livres sofridos 1º tempo"
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
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Feitos:</span>
                  <NumberStepper
                    value={dados.lancesLivresFeitos2T || 0}
                    onChange={(v) => updateDados({ lancesLivresFeitos2T: v })}
                    min={0}
                    ariaLabel="Lances livres feitos 2º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Sofridos:</span>
                  <NumberStepper
                    value={dados.lancesLivresSofridos2T || 0}
                    onChange={(v) => updateDados({ lancesLivresSofridos2T: v })}
                    min={0}
                    ariaLabel="Lances livres sofridos 2º tempo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Card Agrupado de Faltas */}
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
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Cometidas:</span>
                  <NumberStepper
                    value={dados.faltasCometidas1T || 0}
                    onChange={(v) => updateDados({ faltasCometidas1T: v })}
                    min={0}
                    ariaLabel="Faltas cometidas 1º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Sofridas:</span>
                  <NumberStepper
                    value={dados.faltasSofridas1T || 0}
                    onChange={(v) => updateDados({ faltasSofridas1T: v })}
                    min={0}
                    ariaLabel="Faltas sofridas 1º tempo"
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
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Cometidas:</span>
                  <NumberStepper
                    value={dados.faltasCometidas2T || 0}
                    onChange={(v) => updateDados({ faltasCometidas2T: v })}
                    min={0}
                    ariaLabel="Faltas cometidas 2º tempo"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text)' }}>Faltas Sofridas:</span>
                  <NumberStepper
                    value={dados.faltasSofridas2T || 0}
                    onChange={(v) => updateDados({ faltasSofridas2T: v })}
                    min={0}
                    ariaLabel="Faltas sofridas 2º tempo"
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

export default BasqueteForm;
