import React from 'react';

const XadrezForm = ({
  formData,
  setFormData
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Equipe / Enxadrista Adversário & 2. Resultado */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label" style={{ fontWeight: 700 }}>
            Equipe / Enxadrista Adversário <span style={{ color: 'var(--error)' }}>*</span>
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

    </div>
  );
};

export default XadrezForm;
