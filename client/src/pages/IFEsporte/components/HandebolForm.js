import React from 'react';
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

  // Gols marcados
  const golsMarcados = Array.isArray(dados.golsMarcados) ? dados.golsMarcados : [];
  const handleAddGol = () => {
    updateDados({ golsMarcados: [...golsMarcados, { atletaId: '', atletaNome: '' }] });
  };
  const handleRemoveGol = (idx) => {
    updateDados({ golsMarcados: golsMarcados.filter((_, i) => i !== idx) });
  };
  const handleGolAtletaChange = (idx, atletaId) => {
    const at = students.find(s => s._id === atletaId);
    const updated = [...golsMarcados];
    updated[idx] = { atletaId, atletaNome: at ? at.nome : '' };
    updateDados({ golsMarcados: updated });
  };

  // 7 metros da nossa equipe
  const seteMetrosNossaEquipeLista = Array.isArray(dados.seteMetrosNossaEquipeLista) ? dados.seteMetrosNossaEquipeLista : [];
  const handleSeteMetrosNossaQtdChange = (qtd) => {
    const current = [...seteMetrosNossaEquipeLista];
    if (qtd > current.length) {
      while (current.length < qtd) {
        current.push({ atletaId: '', resultouGol: false });
      }
    } else {
      current.splice(qtd);
    }
    updateDados({
      seteMetrosNossaEquipeQtd: qtd,
      seteMetrosNossaEquipeLista: current
    });
  };
  const handleSeteMetrosNossaItemChange = (idx, field, val) => {
    const updated = [...seteMetrosNossaEquipeLista];
    updated[idx] = { ...updated[idx], [field]: val };
    updateDados({ seteMetrosNossaEquipeLista: updated });
  };

  // 7 metros do outro time (quem causou)
  const seteMetrosOutroTimeCausadores = Array.isArray(dados.seteMetrosOutroTimeCausadores) ? dados.seteMetrosOutroTimeCausadores : [];
  const handleAddSeteMetrosCausador = () => {
    updateDados({ seteMetrosOutroTimeCausadores: [...seteMetrosOutroTimeCausadores, ''] });
  };
  const handleRemoveSeteMetrosCausador = (idx) => {
    updateDados({ seteMetrosOutroTimeCausadores: seteMetrosOutroTimeCausadores.filter((_, i) => i !== idx) });
  };
  const handleSeteMetrosCausadorChange = (idx, val) => {
    const updated = [...seteMetrosOutroTimeCausadores];
    updated[idx] = val;
    updateDados({ seteMetrosOutroTimeCausadores: updated });
  };

  // Dois minutos
  const doisMinutosLista = Array.isArray(dados.doisMinutosLista) ? dados.doisMinutosLista : [];
  const handleAddDoisMinutos = () => {
    updateDados({ doisMinutosLista: [...doisMinutosLista, ''] });
  };
  const handleRemoveDoisMinutos = (idx) => {
    updateDados({ doisMinutosLista: doisMinutosLista.filter((_, i) => i !== idx) });
  };
  const handleDoisMinutosChange = (idx, val) => {
    const updated = [...doisMinutosLista];
    updated[idx] = val;
    updateDados({ doisMinutosLista: updated });
  };

  // Gols sofridos
  const golsSofridosOrigens = Array.isArray(dados.golsSofridosOrigens) ? dados.golsSofridosOrigens : [];
  const handleGolsSofridosQtdChange = (qtd) => {
    const current = [...golsSofridosOrigens];
    if (qtd > current.length) {
      while (current.length < qtd) current.push('Situação de jogo');
    } else {
      current.splice(qtd);
    }
    updateDados({
      golsSofridosQtd: qtd,
      golsSofridosOrigens: current
    });
  };
  const handleGolSofridoOrigemChange = (idx, origem) => {
    const updated = [...golsSofridosOrigens];
    updated[idx] = origem;
    updateDados({ golsSofridosOrigens: updated });
  };

  // Desempate (7 Metros em caso de Empate)
  const desempateSeteMetrosLista = Array.isArray(dados.desempateSeteMetrosLista) ? dados.desempateSeteMetrosLista : [];
  const handleAddDesempateSeteMetros = () => {
    const updated = [...desempateSeteMetrosLista, { atletaId: '', atletaNome: '', resultado: 'Acertou' }];
    const acertos = updated.filter(p => p.resultado === 'Acertou').length;
    const erros = updated.filter(p => p.resultado === 'Errou').length;
    updateDados({
      desempateSeteMetrosLista: updated,
      desempateSeteMetrosAcertos: acertos,
      desempateSeteMetrosErros: erros
    });
  };
  const handleRemoveDesempateSeteMetros = (idx) => {
    const updated = desempateSeteMetrosLista.filter((_, i) => i !== idx);
    const acertos = updated.filter(p => p.resultado === 'Acertou').length;
    const erros = updated.filter(p => p.resultado === 'Errou').length;
    updateDados({
      desempateSeteMetrosLista: updated,
      desempateSeteMetrosAcertos: acertos,
      desempateSeteMetrosErros: erros
    });
  };
  const handleDesempateSeteMetrosChange = (idx, field, val) => {
    const updated = [...desempateSeteMetrosLista];
    if (field === 'atletaId') {
      const at = students.find(s => s._id === val);
      updated[idx] = { ...updated[idx], atletaId: val, atletaNome: at ? at.nome : '' };
    } else {
      updated[idx] = { ...updated[idx], [field]: val };
    }
    const acertos = updated.filter(p => p.resultado === 'Acertou').length;
    const erros = updated.filter(p => p.resultado === 'Errou').length;
    updateDados({
      desempateSeteMetrosLista: updated,
      desempateSeteMetrosAcertos: acertos,
      desempateSeteMetrosErros: erros
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

      {/* 3. Placar (Campo para DIGITAR) */}
      <div style={{
        background: 'var(--bg)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        border: '1px solid var(--border-light)'
      }}>
        <label className="form-label" style={{ fontWeight: 700 }}>
          Placar <span style={{ color: 'var(--error)' }}>*</span>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Digite o placar (ex: 28 x 24)"
          value={typeof formData.placar === 'string' ? formData.placar : (formData.placar ? `${formData.placar.nos || 0} x ${formData.placar.adv || 0}` : '')}
          onChange={(e) => setFormData({ ...formData, placar: e.target.value })}
          required
        />
      </div>

      {/* 4. Gols Marcados (Opcional) */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
            Gols Marcados
          </label>
          <button
            type="button"
            onClick={handleAddGol}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <Plus size={14} /> Adicionar Autor do Gol
          </button>
        </div>

        {golsMarcados.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Nenhum gol registrado individualmente.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {golsMarcados.map((gol, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', minWidth: '45px' }}>
                  Gol {idx + 1}:
                </span>
                <select
                  className="form-select form-select-sm"
                  value={gol.atletaId || ''}
                  onChange={(e) => handleGolAtletaChange(idx, e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Selecione o atleta</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.nome}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveGol(idx)}
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

      {/* 5. 7 Metros do Outro Time & 6. 7 Metros da Nossa Equipe */}
      <div className="row g-3">
        {/* 5. 7 metros do outro time */}
        <div className="col-12 col-md-6">
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-light)', height: '100%' }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>
              7 Metros do Outro Time
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Quantidade:</span>
              <NumberStepper
                value={dados.seteMetrosOutroTimeQtd || 0}
                onChange={(v) => updateDados({ seteMetrosOutroTimeQtd: v })}
                min={0}
                ariaLabel="7 metros do outro time"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quem causou:</span>
              <button
                type="button"
                onClick={handleAddSeteMetrosCausador}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
              >
                <Plus size={12} /> Atleta
              </button>
            </div>
            {seteMetrosOutroTimeCausadores.map((atletaId, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <select
                  className="form-select form-select-sm"
                  value={atletaId}
                  onChange={(e) => handleSeteMetrosCausadorChange(idx, e.target.value)}
                >
                  <option value="">Selecione quem causou</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveSeteMetrosCausador(idx)}
                  className="btn btn-sm text-danger"
                  style={{ padding: '2px 6px', background: 'transparent', border: 'none' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 7 metros da nossa equipe */}
        <div className="col-12 col-md-6">
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-light)', height: '100%' }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>
              7 Metros da Nossa Equipe
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Quantidade:</span>
              <NumberStepper
                value={dados.seteMetrosNossaEquipeQtd || 0}
                onChange={handleSeteMetrosNossaQtdChange}
                min={0}
                ariaLabel="7 metros da nossa equipe"
              />
            </div>

            {seteMetrosNossaEquipeLista.map((item, idx) => (
              <div key={idx} style={{
                background: 'var(--bg)',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '8px',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Arremesso {idx + 1}:</span>
                  <select
                    className="form-select form-select-sm"
                    value={item.atletaId || ''}
                    onChange={(e) => handleSeteMetrosNossaItemChange(idx, 'atletaId', e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">Quem arremessou?</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(item.resultouGol)}
                    onChange={(e) => handleSeteMetrosNossaItemChange(idx, 'resultouGol', e.target.checked)}
                  />
                  Resultou em gol?
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Dois Minutos & 9. Defesas */}
      <div className="row g-3">
        {/* 7. Dois minutos */}
        <div className="col-12 col-md-6">
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-light)', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                Dois Minutos
              </label>
              <button
                type="button"
                onClick={handleAddDoisMinutos}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                <Plus size={14} /> Atleta
              </button>
            </div>

            {doisMinutosLista.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: 0 }}>
                Nenhum atleta tomou dois minutos.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {doisMinutosLista.map((atletaId, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <select
                      className="form-select form-select-sm"
                      value={atletaId}
                      onChange={(e) => handleDoisMinutosChange(idx, e.target.value)}
                    >
                      <option value="">Selecione quem tomou</option>
                      {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoisMinutos(idx)}
                      className="btn btn-sm text-danger"
                      style={{ padding: '2px 6px', background: 'transparent', border: 'none' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 9. Defesas */}
        <div className="col-12 col-md-6">
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-light)', height: '100%' }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>
              Defesas
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Quantidade de Defesas:</span>
              <NumberStepper
                value={dados.defesasQtd || 0}
                onChange={(v) => updateDados({ defesasQtd: v })}
                min={0}
                ariaLabel="Defesas"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 8. Gols Sofridos */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
            Gols Sofridos
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Quantidade:</span>
            <NumberStepper
              value={dados.golsSofridosQtd || 0}
              onChange={handleGolsSofridosQtdChange}
              min={0}
              ariaLabel="Gols sofridos"
            />
          </div>
        </div>

        {golsSofridosOrigens.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {golsSofridosOrigens.map((origem, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '90px' }}>
                  Gol sofrido {idx + 1}:
                </span>
                <select
                  className="form-select form-select-sm"
                  value={origem}
                  onChange={(e) => handleGolSofridoOrigemChange(idx, e.target.value)}
                  style={{ maxWidth: '240px' }}
                >
                  <option value="Situação de jogo">Situação de jogo</option>
                  <option value="7 metros">7 metros</option>
                  <option value="Falta">Falta</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 11. SOMENTE EM CASO DE EMPATE (OBRIGATÓRIO) */}
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
                🤾 Desempate por 7 Metros <span style={{ color: 'var(--error)' }}>*</span>
              </h6>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Registre os atletas que arremessaram os 7m e o resultado de cada cobrança.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddDesempateSeteMetros}
              className="btn btn-sm btn-primary"
              style={{ fontSize: '0.75rem', padding: '4px 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} /> Adicionar Cobrança de 7m
            </button>
          </div>
          
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                Total de Acertos (Gols de 7m):
              </label>
              <div>
                <NumberStepper
                  value={dados.desempateSeteMetrosAcertos || 0}
                  onChange={(v) => updateDados({ desempateSeteMetrosAcertos: v })}
                  min={0}
                  ariaLabel="Acertos de 7 metros"
                />
              </div>
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                Total de Erros (Perdidos de 7m):
              </label>
              <div>
                <NumberStepper
                  value={dados.desempateSeteMetrosErros || 0}
                  onChange={(v) => updateDados({ desempateSeteMetrosErros: v })}
                  min={0}
                  ariaLabel="Erros de 7 metros"
                />
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Atletas que cobraram 7m ({desempateSeteMetrosLista.length}):
            </span>
            {desempateSeteMetrosLista.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--error)', margin: 0, fontWeight: 600 }}>
                ⚠️ Em caso de empate, clique no botão acima para adicionar as cobranças de 7 metros.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {desempateSeteMetrosLista.map((cob, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '80px' }}>
                      {idx + 1}ª Cobrança:
                    </span>
                    <select
                      className="form-select form-select-sm"
                      value={cob.atletaId || ''}
                      onChange={(e) => handleDesempateSeteMetrosChange(idx, 'atletaId', e.target.value)}
                      style={{ flex: '1', minWidth: '160px' }}
                      required
                    >
                      <option value="">Selecione o atleta arremessador *</option>
                      {students.map(s => <option key={s._id} value={s._id}>{s.nome} {s.turma ? `(${s.turma})` : ''}</option>)}
                    </select>
                    <select
                      className="form-select form-select-sm"
                      value={cob.resultado || 'Acertou'}
                      onChange={(e) => handleDesempateSeteMetrosChange(idx, 'resultado', e.target.value)}
                      style={{ width: '120px', fontWeight: 600, color: cob.resultado === 'Acertou' ? 'var(--success)' : 'var(--error)' }}
                    >
                      <option value="Acertou">🤾 Converteu</option>
                      <option value="Errou">❌ Perdeu</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveDesempateSeteMetros(idx)}
                      className="btn btn-sm text-danger"
                      style={{ padding: '2px 6px', background: 'transparent', border: 'none' }}
                      title="Remover cobrança"
                    >
                      <Trash2 size={15} />
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

export default HandebolForm;
