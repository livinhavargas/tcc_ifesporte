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
              Resultado Final por Sets <span style={{ color: 'var(--error)' }}>*</span>
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
            <Activity size={16} style={{ color: 'var(--primary)' }} />
            2. Placar dos Sets (Opcional)
          </h6>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {isPraia ? 'Até 3 sets disponíveis' : 'Até 5 sets disponíveis'} · Preencha apenas os sets disputados
          </span>
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

        {/* Resumo do placar em sets acumulados */}
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px dashed var(--border-light)',
          fontSize: '0.8125rem',
          color: 'var(--text-tertiary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span>Placar Total em Sets:</span>
          <strong style={{ color: 'var(--text)', fontSize: '0.9375rem' }}>
            {placarObj.nos || 0} x {placarObj.adv || 0}
          </strong>
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
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Registre os aces da nossa equipe e do adversário por set
          </span>
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
              value={dados.qualidadeSaque || ''}
              onChange={(e) => updateDados({ qualidadeSaque: e.target.value })}
            >
              <option value="">Selecione uma avaliação</option>
              <option value="A — Positivo">A — Positivo</option>
              <option value="B — Médio">B — Médio</option>
              <option value="C — Negativo">C — Negativo</option>
            </select>
          </div>

          {/* F) Qualidade do Passe */}
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Qualidade do Passe
            </label>
            <select
              className="form-select"
              value={dados.qualidadePasse || ''}
              onChange={(e) => updateDados({ qualidadePasse: e.target.value })}
            >
              <option value="">Selecione uma avaliação</option>
              <option value="A — Positivo">A — Positivo</option>
              <option value="B — Médio">B — Médio</option>
              <option value="C — Negativo">C — Negativo</option>
            </select>
          </div>

          {/* G) Qualidade do Ataque */}
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Qualidade do Ataque
            </label>
            <select
              className="form-select"
              value={dados.qualidadeAtaque || ''}
              onChange={(e) => updateDados({ qualidadeAtaque: e.target.value })}
            >
              <option value="">Selecione uma avaliação</option>
              <option value="A — Ponto">A — Ponto</option>
              <option value="B — Defesa do Adversário">B — Defesa do Adversário</option>
              <option value="C — Erro (bloqueio, rede ou bola fora)">C — Erro (bloqueio, rede ou bola fora)</option>
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
              value={dados.qualidadeLevantamento || ''}
              onChange={(e) => updateDados({ qualidadeLevantamento: e.target.value })}
            >
              <option value="">Selecione uma avaliação</option>
              <option value="A — Positivo">A — Positivo</option>
              <option value="B — Médio">B — Médio</option>
              <option value="C — Negativo">C — Negativo</option>
            </select>
          </div>

          {/* J) Qualidade do Bloqueio */}
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Qualidade do Bloqueio
            </label>
            <select
              className="form-select"
              value={dados.qualidadeBloqueio || ''}
              onChange={(e) => updateDados({ qualidadeBloqueio: e.target.value })}
            >
              <option value="">Selecione uma avaliação</option>
              <option value="A — Positivo">A — Positivo</option>
              <option value="B — Médio">B — Médio</option>
              <option value="C — Negativo">C — Negativo</option>
            </select>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VoleiForm;
