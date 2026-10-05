import React from 'react';
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

  const handlePlacarChange = (team, val) => {
    const updatedPlacar = { ...placarObj, [team]: val };
    setFormData(prev => ({
      ...prev,
      placar: updatedPlacar
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

  // Cartões
  const cartoes = Array.isArray(dados.cartoes) ? dados.cartoes : [];
  const handleAddCartao = () => {
    updateDados({ cartoes: [...cartoes, { atletaId: '', atletaNome: '', tipo: 'Amarelo' }] });
  };
  const handleRemoveCartao = (idx) => {
    updateDados({ cartoes: cartoes.filter((_, i) => i !== idx) });
  };
  const handleCartaoChange = (idx, field, val) => {
    const updated = [...cartoes];
    if (field === 'atletaId') {
      const at = students.find(s => s._id === val);
      updated[idx] = { ...updated[idx], atletaId: val, atletaNome: at ? at.nome : '' };
    } else {
      updated[idx] = { ...updated[idx], [field]: val };
    }
    updateDados({ cartoes: updated });
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

  // Faltas sofridas
  const faltasSofridasLista = Array.isArray(dados.faltasSofridasLista) ? dados.faltasSofridasLista : [];
  const handleFaltasSofridasQtdChange = (qtd) => {
    const current = [...faltasSofridasLista];
    if (qtd > current.length) {
      while (current.length < qtd) {
        current.push({ sofreuId: '', cobrouId: '', foiPenalti: false, resultouGol: false });
      }
    } else {
      current.splice(qtd);
    }
    updateDados({
      faltasSofridasQtd: qtd,
      faltasSofridasLista: current
    });
  };
  const handleFaltaSofridaChange = (idx, field, val) => {
    const updated = [...faltasSofridasLista];
    updated[idx] = { ...updated[idx], [field]: val };
    updateDados({ faltasSofridasLista: updated });
  };

  // Faltas cometidas (quem cometeu)
  const faltasCometidasAtletas = Array.isArray(dados.faltasCometidasAtletas) ? dados.faltasCometidasAtletas : [];
  const handleAddFaltaCometidaAtleta = () => {
    updateDados({ faltasCometidasAtletas: [...faltasCometidasAtletas, ''] });
  };
  const handleRemoveFaltaCometidaAtleta = (idx) => {
    updateDados({ faltasCometidasAtletas: faltasCometidasAtletas.filter((_, i) => i !== idx) });
  };
  const handleFaltaCometidaAtletaChange = (idx, val) => {
    const updated = [...faltasCometidasAtletas];
    updated[idx] = val;
    updateDados({ faltasCometidasAtletas: updated });
  };

  // Desempate (Pênaltis em caso de Empate)
  const penaltisCobrancas = Array.isArray(dados.penaltisCobrancas) ? dados.penaltisCobrancas : [];
  const handleAddPenaltiCobranca = () => {
    const updated = [...penaltisCobrancas, { atletaId: '', atletaNome: '', resultado: 'Acertou' }];
    const acertos = updated.filter(p => p.resultado === 'Acertou').length;
    const erros = updated.filter(p => p.resultado === 'Errou').length;
    updateDados({
      penaltisCobrancas: updated,
      penaltisAcertos: acertos,
      penaltisErros: erros
    });
  };
  const handleRemovePenaltiCobranca = (idx) => {
    const updated = penaltisCobrancas.filter((_, i) => i !== idx);
    const acertos = updated.filter(p => p.resultado === 'Acertou').length;
    const erros = updated.filter(p => p.resultado === 'Errou').length;
    updateDados({
      penaltisCobrancas: updated,
      penaltisAcertos: acertos,
      penaltisErros: erros
    });
  };
  const handlePenaltiCobrancaChange = (idx, field, val) => {
    const updated = [...penaltisCobrancas];
    if (field === 'atletaId') {
      const at = students.find(s => s._id === val);
      updated[idx] = { ...updated[idx], atletaId: val, atletaNome: at ? at.nome : '' };
    } else {
      updated[idx] = { ...updated[idx], [field]: val };
    }
    const acertos = updated.filter(p => p.resultado === 'Acertou').length;
    const erros = updated.filter(p => p.resultado === 'Errou').length;
    updateDados({
      penaltisCobrancas: updated,
      penaltisAcertos: acertos,
      penaltisErros: erros
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

      {/* 3. Placar */}
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
              ariaLabel="Gols nossa equipe"
            />
          </div>
          <span style={{ fontWeight: 800, color: 'var(--text-tertiary)' }}>X</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Adversário:</span>
            <NumberStepper
              value={placarObj.adv || 0}
              onChange={(v) => handlePlacarChange('adv', v)}
              min={0}
              ariaLabel="Gols adversário"
            />
          </div>
        </div>
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
                    <option key={s._id} value={s._id}>{s.nome} {s.turma ? `(${s.turma})` : ''}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveGol(idx)}
                  className="btn btn-sm text-danger"
                  style={{ padding: '4px 8px', background: 'transparent', border: 'none' }}
                  title="Remover"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Faltas Cometidas & 9. Defesas */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-light)', height: '100%' }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>
              Faltas Cometidas
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Quantidade:</span>
              <NumberStepper
                value={dados.faltasCometidasQtd || 0}
                onChange={(v) => updateDados({ faltasCometidasQtd: v })}
                min={0}
                ariaLabel="Quantidade de faltas cometidas"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Atletas que cometeram faltas:</span>
              <button
                type="button"
                onClick={handleAddFaltaCometidaAtleta}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
              >
                <Plus size={12} /> Atleta
              </button>
            </div>
            {faltasCometidasAtletas.map((atletaId, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <select
                  className="form-select form-select-sm"
                  value={atletaId}
                  onChange={(e) => handleFaltaCometidaAtletaChange(idx, e.target.value)}
                >
                  <option value="">Selecione o atleta</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.nome}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveFaltaCometidaAtleta(idx)}
                  className="btn btn-sm text-danger"
                  style={{ padding: '2px 6px', background: 'transparent', border: 'none' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
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
                ariaLabel="Quantidade de defesas"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6. Faltas Sofridas */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
            Faltas Sofridas
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Qtd:</span>
            <NumberStepper
              value={dados.faltasSofridasQtd || 0}
              onChange={handleFaltasSofridasQtdChange}
              min={0}
              ariaLabel="Faltas sofridas"
            />
          </div>
        </div>

        {faltasSofridasLista.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faltasSofridasLista.map((falta, idx) => (
              <div key={idx} style={{
                background: 'var(--bg)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.75rem', minWidth: '55px' }}>Falta {idx + 1}:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ flex: '1 1 140px' }}
                  value={falta.sofreuId || ''}
                  onChange={(e) => handleFaltaSofridaChange(idx, 'sofreuId', e.target.value)}
                >
                  <option value="">Quem sofreu?</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
                </select>

                <select
                  className="form-select form-select-sm"
                  style={{ flex: '1 1 140px' }}
                  value={falta.cobrouId || ''}
                  onChange={(e) => handleFaltaSofridaChange(idx, 'cobrouId', e.target.value)}
                >
                  <option value="">Quem cobrou/bateu?</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(falta.foiPenalti)}
                    onChange={(e) => handleFaltaSofridaChange(idx, 'foiPenalti', e.target.checked)}
                  />
                  Foi pênalti?
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(falta.resultouGol)}
                    onChange={(e) => handleFaltaSofridaChange(idx, 'resultouGol', e.target.checked)}
                  />
                  Resultou em gol?
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Cartões */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
            Cartões
          </label>
          <button
            type="button"
            onClick={handleAddCartao}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <Plus size={14} /> Adicionar Cartão
          </button>
        </div>

        {cartoes.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: 0 }}>
            Nenhum cartão registrado.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cartoes.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="form-select form-select-sm"
                  value={c.atletaId || ''}
                  onChange={(e) => handleCartaoChange(idx, 'atletaId', e.target.value)}
                  style={{ flex: '1 1 180px' }}
                >
                  <option value="">Selecione o atleta</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
                </select>

                <select
                  className="form-select form-select-sm"
                  value={c.tipo || 'Amarelo'}
                  onChange={(e) => handleCartaoChange(idx, 'tipo', e.target.value)}
                  style={{ width: '130px' }}
                >
                  <option value="Amarelo">🟨 Amarelo</option>
                  <option value="Vermelho">🟥 Vermelho</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleRemoveCartao(idx)}
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
                  <option value="Pênalti">Pênalti</option>
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
                ⚽ Desempate por Pênaltis <span style={{ color: 'var(--error)' }}>* (Obrigatório em caso de Empate)</span>
              </h6>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Registre os atletas que cobraram pênaltis e o resultado de cada cobrança.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPenaltiCobranca}
              className="btn btn-sm btn-primary"
              style={{ fontSize: '0.75rem', padding: '4px 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} /> Adicionar Cobrança
            </button>
          </div>
          
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                Total de Acertos (Gols):
              </label>
              <div>
                <NumberStepper
                  value={dados.penaltisAcertos || 0}
                  onChange={(v) => updateDados({ penaltisAcertos: v })}
                  min={0}
                  ariaLabel="Acertos de pênaltis"
                />
              </div>
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                Total de Erros (Perdidos):
              </label>
              <div>
                <NumberStepper
                  value={dados.penaltisErros || 0}
                  onChange={(v) => updateDados({ penaltisErros: v })}
                  min={0}
                  ariaLabel="Erros de pênaltis"
                />
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Atletas que participaram das cobranças ({penaltisCobrancas.length}):
            </span>
            {penaltisCobrancas.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--error)', margin: 0, fontWeight: 600 }}>
                ⚠️ Em caso de empate, clique no botão acima para adicionar as cobranças de pênaltis.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {penaltisCobrancas.map((cob, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '80px' }}>
                      {idx + 1}ª Cobrança:
                    </span>
                    <select
                      className="form-select form-select-sm"
                      value={cob.atletaId || ''}
                      onChange={(e) => handlePenaltiCobrancaChange(idx, 'atletaId', e.target.value)}
                      style={{ flex: '1', minWidth: '160px' }}
                      required
                    >
                      <option value="">Selecione o atleta batedor *</option>
                      {students.map(s => <option key={s._id} value={s._id}>{s.nome} {s.turma ? `(${s.turma})` : ''}</option>)}
                    </select>
                    <select
                      className="form-select form-select-sm"
                      value={cob.resultado || 'Acertou'}
                      onChange={(e) => handlePenaltiCobrancaChange(idx, 'resultado', e.target.value)}
                      style={{ width: '120px', fontWeight: 600, color: cob.resultado === 'Acertou' ? 'var(--success)' : 'var(--error)' }}
                    >
                      <option value="Acertou">⚽ Converteu</option>
                      <option value="Errou">❌ Perdeu</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemovePenaltiCobranca(idx)}
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

export default FutebolFutsalForm;
