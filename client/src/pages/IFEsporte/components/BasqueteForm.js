import React from 'react';
import NumberStepper from '../../../components/NumberStepper';
import { Plus, Trash2 } from 'lucide-react';

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

  const placarObj = typeof formData.placar === 'object' && formData.placar !== null 
    ? formData.placar 
    : { nos: 0, adv: 0 };

  const handlePlacarChange = (team, val) => {
    const updatedPlacar = { ...placarObj, [team]: val };
    setFormData(prev => ({
      ...prev,
      placar: updatedPlacar
    }));
  };

  // Cestas
  const cestas = Array.isArray(dados.cestas) ? dados.cestas : [];
  const handleAddCesta = () => {
    updateDados({ cestas: [...cestas, { atletaId: '', atletaNome: '', tipo: '2 pontos' }] });
  };
  const handleRemoveCesta = (idx) => {
    updateDados({ cestas: cestas.filter((_, i) => i !== idx) });
  };
  const handleCestaChange = (idx, field, val) => {
    const updated = [...cestas];
    if (field === 'atletaId') {
      const at = students.find(s => s._id === val);
      updated[idx] = { ...updated[idx], atletaId: val, atletaNome: at ? at.nome : '' };
    } else {
      updated[idx] = { ...updated[idx], [field]: val };
    }
    updateDados({ cestas: updated });
  };

  // Lances livres a favor
  const lancesFavorLista = Array.isArray(dados.lancesFavorLista) ? dados.lancesFavorLista : [];
  const handleLancesFavorQtdChange = (qtd) => {
    const current = [...lancesFavorLista];
    if (qtd > current.length) {
      while (current.length < qtd) {
        current.push({ atletaId: '', resultouCesta: false });
      }
    } else {
      current.splice(qtd);
    }
    updateDados({
      lancesLivresAFavorQtd: qtd,
      lancesFavorLista: current
    });
  };
  const handleLanceFavorChange = (idx, field, val) => {
    const updated = [...lancesFavorLista];
    updated[idx] = { ...updated[idx], [field]: val };
    updateDados({ lancesFavorLista: updated });
  };

  // Desempate (Lances Livres em caso de Empate)
  const desempateLancesLivres = Array.isArray(dados.desempateLancesLivres) ? dados.desempateLancesLivres : [];
  const handleAddDesempateLance = () => {
    const updated = [...desempateLancesLivres, { atletaId: '', atletaNome: '', acertos: 1, erros: 0 }];
    const totalAcertos = updated.reduce((sum, item) => sum + (parseInt(item.acertos, 10) || 0), 0);
    const totalErros = updated.reduce((sum, item) => sum + (parseInt(item.erros, 10) || 0), 0);
    updateDados({
      desempateLancesLivres: updated,
      desempateLancesAcertos: totalAcertos,
      desempateLancesErros: totalErros
    });
  };
  const handleRemoveDesempateLance = (idx) => {
    const updated = desempateLancesLivres.filter((_, i) => i !== idx);
    const totalAcertos = updated.reduce((sum, item) => sum + (parseInt(item.acertos, 10) || 0), 0);
    const totalErros = updated.reduce((sum, item) => sum + (parseInt(item.erros, 10) || 0), 0);
    updateDados({
      desempateLancesLivres: updated,
      desempateLancesAcertos: totalAcertos,
      desempateLancesErros: totalErros
    });
  };
  const handleDesempateLanceChange = (idx, field, val) => {
    const updated = [...desempateLancesLivres];
    if (field === 'atletaId') {
      const at = students.find(s => s._id === val);
      updated[idx] = { ...updated[idx], atletaId: val, atletaNome: at ? at.nome : '' };
    } else {
      updated[idx] = { ...updated[idx], [field]: val };
    }
    const totalAcertos = updated.reduce((sum, item) => sum + (parseInt(item.acertos, 10) || 0), 0);
    const totalErros = updated.reduce((sum, item) => sum + (parseInt(item.erros, 10) || 0), 0);
    updateDados({
      desempateLancesLivres: updated,
      desempateLancesAcertos: totalAcertos,
      desempateLancesErros: totalErros
    });
  };

  const isEmpate = formData.resultado === 'Empate';

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

      {/* 3. Placar (Number Stepper) */}
      <div style={{
        background: 'var(--bg)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        border: '1px solid var(--border-light)'
      }}>
        <label className="form-label" style={{ fontWeight: 700, marginBottom: '10px', display: 'block' }}>
          Placar <span style={{ color: 'var(--error)' }}>*</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nossa Equipe:</span>
            <NumberStepper
              value={placarObj.nos || 0}
              onChange={(v) => handlePlacarChange('nos', v)}
              min={0}
              ariaLabel="Pontos nossa equipe"
            />
          </div>
          <span style={{ fontWeight: 800, color: 'var(--text-tertiary)' }}>X</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Adversário:</span>
            <NumberStepper
              value={placarObj.adv || 0}
              onChange={(v) => handlePlacarChange('adv', v)}
              min={0}
              ariaLabel="Pontos adversário"
            />
          </div>
        </div>
      </div>

      {/* 4. Cestas (Opcional) */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
            Cestas
          </label>
          <button
            type="button"
            onClick={handleAddCesta}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <Plus size={14} /> Adicionar Cesta
          </button>
        </div>

        {cestas.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Nenhuma cesta registrada individualmente.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cestas.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="form-select form-select-sm"
                  value={c.atletaId || ''}
                  onChange={(e) => handleCestaChange(idx, 'atletaId', e.target.value)}
                  style={{ flex: '1 1 180px' }}
                >
                  <option value="">Selecione o atleta</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
                </select>

                <select
                  className="form-select form-select-sm"
                  value={c.tipo || '2 pontos'}
                  onChange={(e) => handleCestaChange(idx, 'tipo', e.target.value)}
                  style={{ width: '130px' }}
                >
                  <option value="2 pontos">2 Pontos</option>
                  <option value="3 pontos">3 Pontos</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleRemoveCesta(idx)}
                  className="btn btn-sm text-danger"
                  style={{ padding: '4px 8px', background: 'transparent', border: 'none' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Lances Livres a Favor */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
            Lances Livres a Favor
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Quantidade:</span>
            <NumberStepper
              value={dados.lancesLivresAFavorQtd || 0}
              onChange={handleLancesFavorQtdChange}
              min={0}
              ariaLabel="Lances livres a favor"
            />
          </div>
        </div>

        {lancesFavorLista.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lancesFavorLista.map((lance, idx) => (
              <div key={idx} style={{
                background: 'var(--bg)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.75rem', minWidth: '65px' }}>Lance {idx + 1}:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ flex: '1 1 180px' }}
                  value={lance.atletaId || ''}
                  onChange={(e) => handleLanceFavorChange(idx, 'atletaId', e.target.value)}
                >
                  <option value="">Quem arremessou?</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(lance.resultouCesta)}
                    onChange={(e) => handleLanceFavorChange(idx, 'resultouCesta', e.target.checked)}
                  />
                  Resultou em cesta?
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Lances Livres Contra */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
            Lances Livres Contra
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Quantidade:</span>
            <NumberStepper
              value={dados.lancesLivresContraQtd || 0}
              onChange={(v) => updateDados({ lancesLivresContraQtd: v })}
              min={0}
              ariaLabel="Lances livres contra"
            />
          </div>
        </div>
      </div>

      {/* 8. SOMENTE EM CASO DE EMPATE (OBRIGATÓRIO) */}
      {isEmpate && (
        <div style={{
          background: 'var(--warning-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px',
          border: '1.5px solid var(--warning)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h6 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>
                🏀 Desempate por Lances Livres <span style={{ color: 'var(--error)' }}>*</span>
              </h6>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Registre os atletas que arremessaram, a quantidade de acertos e erros de cada um.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddDesempateLance}
              className="btn btn-sm btn-primary"
              style={{ fontSize: '0.75rem', padding: '4px 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} /> Adicionar Arremessador
            </button>
          </div>
          
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                Total de Acertos de Lances Livres:
              </label>
              <div>
                <NumberStepper
                  value={dados.desempateLancesAcertos || 0}
                  onChange={(v) => updateDados({ desempateLancesAcertos: v })}
                  min={0}
                  ariaLabel="Acertos de lances livres"
                />
              </div>
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                Total de Erros de Lances Livres:
              </label>
              <div>
                <NumberStepper
                  value={dados.desempateLancesErros || 0}
                  onChange={(v) => updateDados({ desempateLancesErros: v })}
                  min={0}
                  ariaLabel="Erros de lances livres"
                />
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Atletas que arremessaram lances livres ({desempateLancesLivres.length}):
            </span>
            {desempateLancesLivres.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--error)', margin: 0, fontWeight: 600 }}>
                ⚠️ Em caso de empate, clique no botão acima para adicionar quem arremessou e os acertos/erros.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {desempateLancesLivres.map((lance, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ flex: '1', minWidth: '180px' }}>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                        Arremessador {idx + 1} *
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={lance.atletaId || ''}
                        onChange={(e) => handleDesempateLanceChange(idx, 'atletaId', e.target.value)}
                        required
                      >
                        <option value="">Selecione o atleta *</option>
                        {students.map(s => <option key={s._id} value={s._id}>{s.nome} {s.turma ? `(${s.turma})` : ''}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--success)', marginBottom: '2px' }}>
                        Acertos:
                      </label>
                      <NumberStepper
                        value={lance.acertos || 0}
                        onChange={(v) => handleDesempateLanceChange(idx, 'acertos', v)}
                        min={0}
                        ariaLabel={`Acertos arremessador ${idx + 1}`}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--error)', marginBottom: '2px' }}>
                        Erros:
                      </label>
                      <NumberStepper
                        value={lance.erros || 0}
                        onChange={(v) => handleDesempateLanceChange(idx, 'erros', v)}
                        min={0}
                        ariaLabel={`Erros arremessador ${idx + 1}`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDesempateLance(idx)}
                      className="btn btn-sm text-danger"
                      style={{ padding: '4px 6px', background: 'transparent', border: 'none', marginTop: '16px' }}
                      title="Remover arremessador"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default BasqueteForm;
