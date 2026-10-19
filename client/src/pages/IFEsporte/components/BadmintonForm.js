import React, { useEffect } from 'react';
import NumberStepper from '../../../components/NumberStepper';

const BadmintonForm = ({
  formData,
  setFormData,
  onUpdateDados
}) => {
  const dados = formData.dadosEspecificos || {};
  const formato = dados.formatoPartida || 'Individual';
  const isDupla = formato === 'Em Dupla' || formato === 'Dupla';

  // Inicializa formatoPartida como 'Individual' se não existir
  useEffect(() => {
    if (!dados.formatoPartida) {
      if (onUpdateDados) {
        onUpdateDados({ formatoPartida: 'Individual' });
      } else {
        setFormData(prev => ({
          ...prev,
          dadosEspecificos: {
            ...(prev.dadosEspecificos || {}),
            formatoPartida: 'Individual'
          }
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDados = (updates) => {
    if (onUpdateDados) {
      onUpdateDados(updates);
    } else {
      setFormData(prev => ({
        ...prev,
        dadosEspecificos: {
          ...(prev.dadosEspecificos || {}),
          ...updates
        }
      }));
    }
  };

  // Calcular sets vencidos a partir dos 3 sets
  const calculateSetsWon = (dadosObj) => {
    let nos = 0;
    let adv = 0;
    for (let s = 1; s <= 3; s++) {
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

  const placarObj = typeof formData.placar === 'object' && formData.placar !== null
    ? formData.placar
    : calculateSetsWon(dados);

  const handlePlacarSetChange = (setNum, team, val) => {
    const currentSet = dados[`placarSet${setNum}`] || { nos: 0, adv: 0 };
    const updatedSet = {
      ...currentSet,
      [team]: Math.max(0, val)
    };

    const newDados = {
      ...dados,
      [`placarSet${setNum}`]: updatedSet
    };

    const setsWon = calculateSetsWon(newDados);

    let newResultado = formData.resultado;
    if (setsWon.nos > setsWon.adv) {
      newResultado = 'Vitória';
    } else if (setsWon.adv > setsWon.nos) {
      newResultado = 'Derrota';
    }

    setFormData(prev => ({
      ...prev,
      resultado: newResultado,
      placar: setsWon,
      dadosEspecificos: newDados
    }));
  };

  const handleFormatoChange = (novoFormato) => {
    updateDados({ formatoPartida: novoFormato });
  };

  const handleResultadoChange = (novoResultado) => {
    setFormData(prev => ({
      ...prev,
      resultado: novoResultado
    }));
  };

  // Mapeamentos para normalização e seleção de valores de qualidade
  const mapQualidadeSaqueValue = (val) => {
    if (!val) return '';
    if (val.includes('Ace')) return 'Ace';
    if (val.includes('Passe quebrado')) return 'Passe quebrado';
    if (val.includes('Bola viva')) return 'Bola viva';
    if (val.includes('Saque fácil') || val.includes('Saque facil')) return 'Saque fácil';
    if (val.includes('Erro')) return 'Erro (rede/fora)';
    return val;
  };

  const mapQualidadeAtaqueValue = (val) => {
    if (!val) return '';
    if (val.includes('Ponto direto')) return 'Ponto direto';
    if (val.includes('Bloqueio explorado')) return 'Bloqueio explorado';
    if (val.includes('Bola defendida')) return 'Bola defendida';
    if (val.includes('Ataque amortecido')) return 'Ataque amortecido';
    if (val.includes('Toco')) return 'Toco (bloqueado)';
    if (val.includes('Erro')) return 'Erro (rede/fora)';
    return val;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* 1. Individual ou em Dupla */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Individual ou em Dupla <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
        </label>
        <select
          className="form-select"
          value={isDupla ? 'Em Dupla' : 'Individual'}
          onChange={(e) => handleFormatoChange(e.target.value)}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600 }}
          required
        >
          <option value="Individual">Individual</option>
          <option value="Em Dupla">Em Dupla</option>
        </select>
      </div>

      {/* 2. Atleta Adversário ou Dupla Adversária */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          {isDupla ? 'Dupla Adversária' : 'Atleta Adversário'} <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder={isDupla ? 'Digite os nomes da dupla adversária' : 'Digite o nome do atleta adversário'}
          value={formData.equipeAdversaria || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, equipeAdversaria: e.target.value }))}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
          required
        />
      </div>

      {/* 3. Resultado Final por Sets */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Resultado Final por Sets <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
        </label>
        <select
          className="form-select"
          value={formData.resultado || ''}
          onChange={(e) => handleResultadoChange(e.target.value)}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600 }}
          required
        >
          <option value="">Selecione o resultado</option>
          <option value="Vitória">Vitória</option>
          <option value="Derrota">Derrota</option>
        </select>
      </div>

      {/* 4. Placar dos Sets */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '12px', display: 'block' }}>
          Placar dos Sets
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map((setNum) => {
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
                      {isDupla ? 'Nossa Dupla:' : 'Nosso Atleta:'}
                    </span>
                    <NumberStepper
                      value={setPlacar.nos || 0}
                      onChange={(v) => handlePlacarSetChange(setNum, 'nos', v)}
                      min={0}
                      max={99}
                      ariaLabel={`Pontos ${isDupla ? 'nossa dupla' : 'nosso atleta'} ${setNum}º set`}
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
                      ariaLabel={`Pontos ${isDupla ? 'dupla adversária' : 'atleta adversário'} ${setNum}º set`}
                    />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {isDupla ? 'Dupla Adversária' : 'Adversário'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Placar Total destacado e centralizado */}
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
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
            padding: '8px 22px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <span style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--text-secondary)'
            }}>
              Placar Total:
            </span>
            <span style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '0.5px'
            }}>
              {placarObj.nos || 0} x {placarObj.adv || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Aces a Favor e Contra */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '12px', display: 'block' }}>
          Aces a Favor e Contra
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map((setNum) => {
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

      {/* 6. Qualidade do Saque */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Qualidade do Saque
        </label>
        <select
          className="form-select"
          value={mapQualidadeSaqueValue(dados.qualidadeSaque)}
          onChange={(e) => updateDados({ qualidadeSaque: e.target.value })}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
        >
          <option value="">Selecione uma avaliação</option>
          <optgroup label="Positivo">
            <option value="Ace">Ace</option>
            <option value="Passe quebrado">Passe quebrado</option>
          </optgroup>
          <optgroup label="Médio">
            <option value="Bola viva">Bola viva</option>
            <option value="Saque fácil">Saque fácil</option>
          </optgroup>
          <optgroup label="Negativo">
            <option value="Erro (rede/fora)">Erro (rede/fora)</option>
          </optgroup>
        </select>
      </div>

      {/* 7. Qualidade do Ataque */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Qualidade do Ataque
        </label>
        <select
          className="form-select"
          value={mapQualidadeAtaqueValue(dados.qualidadeAtaque)}
          onChange={(e) => updateDados({ qualidadeAtaque: e.target.value })}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
        >
          <option value="">Selecione uma avaliação</option>
          <optgroup label="Positivo">
            <option value="Ponto direto">Ponto direto</option>
            <option value="Bloqueio explorado">Bloqueio explorado</option>
          </optgroup>
          <optgroup label="Médio">
            <option value="Bola defendida">Bola defendida</option>
            <option value="Ataque amortecido">Ataque amortecido</option>
          </optgroup>
          <optgroup label="Negativo">
            <option value="Erro (rede/fora)">Erro (rede/fora)</option>
            <option value="Toco (bloqueado)">Toco (bloqueado)</option>
          </optgroup>
        </select>
      </div>

      {/* 8. Observações do treinador */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Observações do treinador
        </label>
        <textarea
          className="form-control"
          rows={4}
          placeholder="Digite aqui as observações..."
          value={formData.observacoes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
        />
      </div>

    </div>
  );
};

export default BadmintonForm;
