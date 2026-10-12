import React from 'react';
import NumberStepper from '../../../components/NumberStepper';

const BadmintonTenisMesaForm = ({
  formData,
  setFormData
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

  const totalSets = (placarObj.nos || 0) + (placarObj.adv || 0);

  const pontosCadaSet = Array.isArray(dados.pontosCadaSet) ? dados.pontosCadaSet : [];

  const handlePlacarChange = (team, val) => {
    const updatedPlacar = { ...placarObj, [team]: val };
    const newTotal = (updatedPlacar.nos || 0) + (updatedPlacar.adv || 0);

    const updatedPontos = [...pontosCadaSet];
    if (newTotal > updatedPontos.length) {
      while (updatedPontos.length < newTotal) {
        updatedPontos.push('');
      }
    } else if (newTotal < updatedPontos.length) {
      updatedPontos.splice(newTotal);
    }

    setFormData(prev => ({
      ...prev,
      placar: updatedPlacar,
      dadosEspecificos: {
        ...(prev.dadosEspecificos || {}),
        pontosCadaSet: updatedPontos
      }
    }));
  };

  const handlePontoSetChange = (idx, val) => {
    const updated = [...pontosCadaSet];
    updated[idx] = val;
    updateDados({ pontosCadaSet: updated });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Equipe Adversária & 2. Resultado */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label" style={{ fontWeight: 700 }}>
            Equipe / Atleta Adversário <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite o nome do adversário"
            value={formData.equipeAdversaria || ''}
            onChange={(e) => setFormData({ ...formData, equipeAdversaria: e.target.value })}
            required
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={{ fontWeight: 700 }}>
            Resultado <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <select
            className="form-select"
            value={formData.resultado || ''}
            onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
            required
          >
            <option value="">Selecione o resultado</option>
            <option value="Vitória">Vitória</option>
            <option value="Derrota">Derrota</option>
            <option value="Empate">Empate</option>
          </select>
        </div>
      </div>

      {/* 3. Placar (Baseado nos sets via Number Stepper) */}
      <div style={{
        background: 'var(--bg)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        border: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '12px', display: 'block', textAlign: 'center' }}>
          Placar em Sets <span style={{ color: 'var(--error)' }}>*</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nossa Equipe:</span>
            <NumberStepper
              value={placarObj.nos || 0}
              onChange={(v) => handlePlacarChange('nos', v)}
              min={0}
              ariaLabel="Sets nossos"
            />
          </div>
          <span style={{ fontWeight: 800, color: 'var(--text-tertiary)' }}>X</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NumberStepper
              value={placarObj.adv || 0}
              onChange={(v) => handlePlacarChange('adv', v)}
              min={0}
              ariaLabel="Sets adversário"
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Adversário</span>
          </div>
        </div>
      </div>

      {/* 4. Pontos de Cada Set */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        border: '1px solid var(--border-light)'
      }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '12px', display: 'block' }}>
          Pontos de Cada Set <span style={{ color: 'var(--error)' }}>* (Obrigatório preencher todos os sets)</span>
        </label>

        {totalSets === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--error)', margin: 0, fontWeight: 600 }}>
            ⚠️ Defina o placar em sets acima (deve ser maior que 0) para registrar os pontos de cada set.
          </p>
        ) : (
          <div className="row g-3">
            {Array.from({ length: totalSets }).map((_, idx) => (
              <div key={idx} className="col-12 col-sm-6 col-md-4">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {idx + 1}º Set (ex: 21-18) <span style={{ color: 'var(--error)' }}>*</span>:
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder={`Pontos do ${idx + 1}º set`}
                  value={pontosCadaSet[idx] || ''}
                  onChange={(e) => handlePontoSetChange(idx, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default BadmintonTenisMesaForm;
