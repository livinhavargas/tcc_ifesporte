import React from 'react';
import NumberStepper from '../../../components/NumberStepper';
import { Trophy, Activity, Zap, CheckCircle2 } from 'lucide-react';

const VoleiForm = ({
  formData,
  setFormData
}) => {
  const dados = formData.dadosEspecificos || {};

  // Identificar se a modalidade é Vôlei de Praia ou Voleibol de quadra
  const isPraia = (formData.modalidade || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .includes('praia');

  const setsCount = isPraia ? 3 : 5;

  const updateDados = (updates) => {
    setFormData(prev => ({
      ...prev,
      dadosEspecificos: {
        ...(prev.dadosEspecificos || {}),
        ...updates
      }
    }));
  };

  // Funções de compatibilidade para valores de qualidade com/sem letras e descrições
  const mapSaqueValue = (val) => {
    if (!val) return '';
    const s = String(val).toLowerCase();
    if (s.includes('positivo') || s.includes('ace') || s.includes('passe quebrado')) return 'Positivo — Ace / Passe quebrado';
    if (s.includes('medio') || s.includes('médio') || s.includes('bola viva') || s.includes('saque facil') || s.includes('saque fácil')) return 'Médio — Bola viva / Saque fácil';
    if (s.includes('negativo') || s.includes('erro')) return 'Negativo — Erro (rede/fora)';
    return val;
  };

  const mapPasseValue = (val) => {
    if (!val) return '';
    const s = String(val).toLowerCase();
    if (s.includes('positivo') || s.includes('bola na mao') || s.includes('bola na mão')) return 'Positivo — Bola na mão';
    if (s.includes('medio') || s.includes('médio') || s.includes('passe quebrado') || s.includes('deslocada')) return 'Médio — Passe quebrado / Bola deslocada';
    if (s.includes('negativo') || s.includes('ace sofrido') || s.includes('overpass')) return 'Negativo — Ace sofrido / Overpass (bola de graça)';
    return val;
  };

  const mapAtaqueValue = (val) => {
    if (!val) return '';
    const s = String(val).toLowerCase();
    if (s.includes('positivo') || s.includes('ponto') || s.includes('bloqueio explorado')) return 'Positivo — Ponto direto / Bloqueio explorado';
    if (s.includes('medio') || s.includes('médio') || s.includes('defendida') || s.includes('amortecido') || s.includes('defesa')) return 'Médio — Bola defendida / Ataque amortecido';
    if (s.includes('negativo') || s.includes('erro') || s.includes('toco')) return 'Negativo — Erro (rede/fora) / Toco (bloqueado)';
    return val;
  };

  const mapLevantamentoValue = (val) => {
    if (!val) return '';
    const s = String(val).toLowerCase();
    if (s.includes('positivo') || s.includes('bola na medida') || s.includes('bloqueio quebrado')) return 'Positivo — Bola na medida / Bloqueio quebrado';
    if (s.includes('medio') || s.includes('médio') || s.includes('seguranca') || s.includes('segurança') || s.includes('ajustado')) return 'Médio — Bola de segurança / Levantamento ajustado';
    if (s.includes('negativo') || s.includes('falta') || s.includes('inatacavel') || s.includes('inatacável')) return 'Negativo — Falta / Bola inatacável';
    return val;
  };

  const mapBloqueioValue = (val) => {
    if (!val) return '';
    const s = String(val).toLowerCase();
    if (s.includes('positivo') || s.includes('toco') || s.includes('amortecida') || s.includes('stuff block')) return 'Positivo — Toco (stuff block) / Bola amortecida';
    if (s.includes('medio') || s.includes('médio') || s.includes('espaco fechado') || s.includes('espaço fechado') || s.includes('direcionado')) return 'Médio — Espaço fechado / Ataque direcionado';
    if (s.includes('negativo') || s.includes('explorado') || s.includes('falta')) return 'Negativo — Bloqueio explorado / Falta';
    return val;
  };

  // Placar geral em sets
  const placarObj = typeof formData.placar === 'object' && formData.placar !== null
    ? formData.placar
    : { nos: 0, adv: 0 };

  // Calcular sets vencidos a partir dos placares registrados em cada set
  const calculateSetsWon = (dadosObj) => {
    let nos = 0;
    let adv = 0;
    for (let s = 1; s <= setsCount; s++) {
      const p = dadosObj[`placarSet${s}`];
      if (p && typeof p === 'object') {
        const pNos = parseInt(p.nos, 10) || 0;
        const pAdv = parseInt(p.adv, 10) || 0;
        if (pNos > 0 || pAdv > 0) {
          if (pNos > pAdv) nos += 1;
          else if (pAdv > pNos) adv += 1;
        }
      }
    }
    return { nos, adv };
  };

  const handlePlacarSetChange = (setNum, team, val) => {
    const currentSet = dados[`placarSet${setNum}`] || { nos: 0, adv: 0 };
    const updatedSet = {
      ...currentSet,
      [team]: Math.max(0, val)
    };

    const newDados = {
      ...(formData.dadosEspecificos || {}),
      [`placarSet${setNum}`]: updatedSet
    };

    const setsWon = calculateSetsWon(newDados);
    const updatedPlacar = (setsWon.nos > 0 || setsWon.adv > 0)
      ? setsWon
      : (typeof formData.placar === 'object' && formData.placar !== null ? formData.placar : { nos: 0, adv: 0 });

    setFormData(prev => ({
      ...prev,
      placar: updatedPlacar,
      dadosEspecificos: newDados
    }));
  };

  React.useEffect(() => {
    if (!formData.placar || formData.placar === '') {
      const setsWon = calculateSetsWon(dados);
      setFormData(prev => ({
        ...prev,
        placar: (typeof prev.placar === 'object' && prev.placar !== null) ? prev.placar : setsWon
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* 1. DADOS DA PARTIDA */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <h6 style={{
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: '16px',
          fontSize: '0.9375rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Trophy size={16} style={{ color: 'var(--primary)' }} />
          1. Dados da Partida
        </h6>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Equipe Adversária <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Digite o nome da equipe adversária"
              value={formData.equipeAdversaria || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, equipeAdversaria: e.target.value }))}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Resultado Final <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <select
              className="form-select"
              value={formData.resultado || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, resultado: e.target.value }))}
              required
            >
              <option value="">Selecione o resultado</option>
              <option value="Vitória">Vitória</option>
              <option value="Derrota">Derrota</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. PLACAR POR SETS */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h6 style={{
            fontWeight: 700,
            color: 'var(--text)',
            margin: 0,
            fontSize: '0.9375rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Activity size={16} style={{ color: 'var(--primary)' }} />
            2. Placar dos Sets
          </h6>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: setsCount }).map((_, idx) => {
            const setNum = idx + 1;
            const setPlacar = dados[`placarSet${setNum}`] || { nos: 0, adv: 0 };
            return (
              <div
                key={setNum}
                style={{
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 18px',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>
                  {setNum}º Set
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Nossa Equipe:
                    </span>
                    <NumberStepper
                      value={setPlacar.nos || 0}
                      onChange={(v) => handlePlacarSetChange(setNum, 'nos', v)}
                      min={0}
                      max={99}
                      ariaLabel={`Pontos nossa equipe ${setNum}º set`}
                    />
                  </div>

                  <span style={{ fontWeight: 800, color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                    X
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <NumberStepper
                      value={setPlacar.adv || 0}
                      onChange={(v) => handlePlacarSetChange(setNum, 'adv', v)}
                      min={0}
                      max={99}
                      ariaLabel={`Pontos adversário ${setNum}º set`}
                    />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Adversário
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Placar Total destacado e centralizado */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: 'var(--bg)',
            padding: '10px 24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <span style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-secondary)'
            }}>
              Placar Total:
            </span>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '0.5px'
            }}>
              {placarObj.nos || 0} x {placarObj.adv || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ESTATÍSTICAS DE SAQUE */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <h6 style={{
            fontWeight: 700,
            color: 'var(--text)',
            margin: 0,
            fontSize: '0.9375rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Zap size={16} style={{ color: 'var(--primary)' }} />
            3. Estatísticas de Saque — Aces por Set
          </h6>
          {!isPraia && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Registre os aces da nossa equipe e do adversário por set
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: setsCount }).map((_, idx) => {
            const setNum = idx + 1;
            const acesFavor = dados[`acesFavorSet${setNum}`] || 0;
            const acesContra = dados[`acesContraSet${setNum}`] || 0;
            return (
              <div
                key={setNum}
                style={{
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 18px',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>
                  {setNum}º Set
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Aces a favor:
                    </span>
                    <NumberStepper
                      value={acesFavor}
                      onChange={(v) => updateDados({ [`acesFavorSet${setNum}`]: Math.max(0, v) })}
                      min={0}
                      max={99}
                      ariaLabel={`Aces a favor ${setNum}º set`}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Aces contra:
                    </span>
                    <NumberStepper
                      value={acesContra}
                      onChange={(v) => updateDados({ [`acesContraSet${setNum}`]: Math.max(0, v) })}
                      min={0}
                      max={99}
                      ariaLabel={`Aces contra ${setNum}º set`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AVALIAÇÃO TÉCNICA */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <h6 style={{
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: '16px',
          fontSize: '0.9375rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
          4. Avaliação Técnica
        </h6>

        <div className="row g-3">
          {/* E) Qualidade do Saque */}
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Qualidade do Saque
            </label>
            <select
              className="form-select"
              value={mapSaqueValue(dados.qualidadeSaque)}
              onChange={(e) => updateDados({ qualidadeSaque: e.target.value })}
            >
              <option value="">Selecione uma avaliação</option>
              <option value="Positivo — Ace / Passe quebrado">Positivo — Ace / Passe quebrado</option>
              <option value="Médio — Bola viva / Saque fácil">Médio — Bola viva / Saque fácil</option>
              <option value="Negativo — Erro (rede/fora)">Negativo — Erro (rede/fora)</option>
            </select>
          </div>

          {/* F) Qualidade do Passe */}
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Qualidade do Passe
            </label>
            <select
              className="form-select"
              value={mapPasseValue(dados.qualidadePasse)}
              onChange={(e) => updateDados({ qualidadePasse: e.target.value })}
            >
              <option value="">Selecione uma avaliação</option>
              <option value="Positivo — Bola na mão">Positivo — Bola na mão</option>
              <option value="Médio — Passe quebrado / Bola deslocada">Médio — Passe quebrado / Bola deslocada</option>
              <option value="Negativo — Ace sofrido / Overpass (bola de graça)">Negativo — Ace sofrido / Overpass (bola de graça)</option>
            </select>
          </div>

          {/* G) Qualidade do Ataque */}
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Qualidade do Ataque
            </label>
            <select
              className="form-select"
              value={mapAtaqueValue(dados.qualidadeAtaque)}
              onChange={(e) => updateDados({ qualidadeAtaque: e.target.value })}
            >
              <option value="">Selecione uma avaliação</option>
              <option value="Positivo — Ponto direto / Bloqueio explorado">Positivo — Ponto direto / Bloqueio explorado</option>
              <option value="Médio — Bola defendida / Ataque amortecido">Médio — Bola defendida / Ataque amortecido</option>
              <option value="Negativo — Erro (rede/fora) / Toco (bloqueado)">Negativo — Erro (rede/fora) / Toco (bloqueado)</option>
            </select>
          </div>

          {/* H) Levantamentos (Zonas) — Apenas para Voleibol de quadra */}
          {!isPraia && (
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Levantamentos (Zona)
              </label>
              <select
                className="form-select"
                value={dados.levantamentosZona || ''}
                onChange={(e) => updateDados({ levantamentosZona: e.target.value })}
              >
                <option value="">Selecione a zona do levantamento</option>
                <option value="Entrada de Rede">Entrada de Rede</option>
                <option value="Saída de Rede">Saída de Rede</option>
                <option value="Meio de Rede">Meio de Rede</option>
                <option value="Fundo Saída de Rede">Fundo Saída de Rede</option>
                <option value="Fundo Meio de Rede">Fundo Meio de Rede</option>
              </select>
            </div>
          )}

          {/* I) Qualidade do Levantamento */}
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Qualidade do Levantamento
            </label>
            <select
              className="form-select"
              value={mapLevantamentoValue(dados.qualidadeLevantamento)}
              onChange={(e) => updateDados({ qualidadeLevantamento: e.target.value })}
            >
              <option value="">Selecione uma avaliação</option>
              <option value="Positivo — Bola na medida / Bloqueio quebrado">Positivo — Bola na medida / Bloqueio quebrado</option>
              <option value="Médio — Bola de segurança / Levantamento ajustado">Médio — Bola de segurança / Levantamento ajustado</option>
              <option value="Negativo — Falta / Bola inatacável">Negativo — Falta / Bola inatacável</option>
            </select>
          </div>

          {/* J) Qualidade do Bloqueio */}
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Qualidade do Bloqueio
            </label>
            <select
              className="form-select"
              value={mapBloqueioValue(dados.qualidadeBloqueio)}
              onChange={(e) => updateDados({ qualidadeBloqueio: e.target.value })}
            >
              <option value="">Selecione uma avaliação</option>
              <option value="Positivo — Toco (stuff block) / Bola amortecida">Positivo — Toco (stuff block) / Bola amortecida</option>
              <option value="Médio — Espaço fechado / Ataque direcionado">Médio — Espaço fechado / Ataque direcionado</option>
              <option value="Negativo — Bloqueio explorado / Falta">Negativo — Bloqueio explorado / Falta</option>
            </select>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VoleiForm;
