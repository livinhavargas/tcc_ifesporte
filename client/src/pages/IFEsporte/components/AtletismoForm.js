import React, { useMemo, useEffect } from 'react';
import NumberStepper from '../../../components/NumberStepper';

export const PROVAS_ATLETISMO = [
  { id: '100m', label: '100m rasos', grupo: 'Velocidade' },
  { id: '100m_barreiras', label: '100m com barreiras', grupo: 'Velocidade' },
  { id: '110m_barreiras', label: '110m com barreiras', grupo: 'Velocidade' },
  { id: '200m', label: '200m rasos', grupo: 'Velocidade' },
  { id: '400m', label: '400m rasos', grupo: 'Velocidade' },
  { id: '400m_barreiras', label: '400m com barreiras', grupo: 'Velocidade' },

  { id: '800m', label: '800m rasos', grupo: 'Meio-Fundo / Fundo', distanciaKm: 0.8 },
  { id: '1500m', label: '1500m rasos', grupo: 'Meio-Fundo / Fundo', distanciaKm: 1.5 },
  { id: '3000m', label: '3000m rasos', grupo: 'Meio-Fundo / Fundo', distanciaKm: 3.0 },
  { id: '5000m', label: '5000m rasos', grupo: 'Meio-Fundo / Fundo', distanciaKm: 5.0 },

  { id: 'revezamento_4x100m', label: 'Revezamento 4x100m', grupo: 'Revezamento' },
  { id: 'revezamento_4x400m', label: 'Revezamento 4x400m', grupo: 'Revezamento' },

  { id: 'salto_altura', label: 'Salto em Altura', grupo: 'Saltos' },
  { id: 'salto_distancia', label: 'Salto em Distância', grupo: 'Saltos' },
  { id: 'salto_triplo', label: 'Salto Triplo', grupo: 'Saltos' },

  { id: 'arremesso_peso', label: 'Arremesso de Peso', grupo: 'Lançamentos' },
  { id: 'lancamento_disco', label: 'Lançamento de Disco', grupo: 'Lançamentos' },
  { id: 'lancamento_dardo', label: 'Lançamento de Dardo', grupo: 'Lançamentos' },

  { id: 'pentatlo', label: 'Pentatlo', grupo: 'Combinadas' }
];

// Utilitário para cálculo de Pace automático
export const calculatePace = (tempoStr, distanciaKm) => {
  if (!tempoStr || !distanciaKm) return '';

  const clean = String(tempoStr).trim();
  let totalSegundos = 0;

  if (clean.includes(':')) {
    const parts = clean.split(':');
    if (parts.length === 2) {
      const min = parseFloat(parts[0]) || 0;
      const seg = parseFloat(parts[1]) || 0;
      totalSegundos = min * 60 + seg;
    } else if (parts.length === 3) {
      const h = parseFloat(parts[0]) || 0;
      const min = parseFloat(parts[1]) || 0;
      const seg = parseFloat(parts[2]) || 0;
      totalSegundos = h * 3600 + min * 60 + seg;
    }
  } else {
    totalSegundos = parseFloat(clean) || 0;
  }

  if (totalSegundos <= 0) return '';

  const segundosPorKm = totalSegundos / distanciaKm;
  const paceMin = Math.floor(segundosPorKm / 60);
  const paceSeg = Math.round(segundosPorKm % 60);

  return `${paceMin}'${String(paceSeg).padStart(2, '0')}"/km`;
};

const normalizeProvaStr = (str) => {
  return (str || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]/g, "");
};

const AtletismoForm = ({
  formData,
  setFormData,
  students = []
}) => {
  const dados = formData.dadosEspecificos || {};
  const rawSubtipo = formData.subtipoProva || '100m';
  const normRaw = normalizeProvaStr(rawSubtipo);

  const selectedProva = PROVAS_ATLETISMO.find(p => 
    p.id === rawSubtipo || 
    normalizeProvaStr(p.id) === normRaw ||
    normalizeProvaStr(p.label).includes(normRaw) ||
    normRaw.includes(normalizeProvaStr(p.label))
  ) || PROVAS_ATLETISMO[0];

  const selectedProvaId = selectedProva.id;

  const updateDados = (updates) => {
    setFormData(prev => ({
      ...prev,
      dadosEspecificos: {
        ...(prev.dadosEspecificos || {}),
        ...updates
      }
    }));
  };

  // Cálculo automático do Pace para 800m, 1500m, 3000m, 5000m
  const computedPace = useMemo(() => {
    if (selectedProva?.distanciaKm && dados.tempo) {
      return calculatePace(dados.tempo, selectedProva.distanciaKm);
    }
    return '';
  }, [selectedProva, dados.tempo]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      dadosEspecificos: {
        ...(prev.dadosEspecificos || {}),
        paceCalculado: computedPace || '',
        pace: computedPace || ''
      }
    }));
  }, [computedPace, setFormData]);

  // Tentativas dinâmicas para Saltos em Distância/Triplo e Arremessos/Lançamentos
  const distanciasTentativas = Array.isArray(dados.distanciasTentativas) ? dados.distanciasTentativas : [];
  const handleTentativasQtdChange = (qtd) => {
    const current = [...distanciasTentativas];
    if (qtd > current.length) {
      while (current.length < qtd) current.push('');
    } else {
      current.splice(qtd);
    }
    updateDados({
      quantidadeTentativas: qtd,
      distanciasTentativas: current
    });
  };

  const handleDistanciaTentativaChange = (idx, val) => {
    const updated = [...distanciasTentativas];
    updated[idx] = val;
    updateDados({ distanciasTentativas: updated });
  };

  // Revezamento (4 atletas obrigatórios)
  const atletasRevezamento = Array.isArray(dados.atletasRevezamento) ? dados.atletasRevezamento : ['', '', '', ''];
  const temposIndividuais = Array.isArray(dados.temposIndividuais) ? dados.temposIndividuais : ['', '', '', ''];

  const handleRevezamentoAtletaChange = (idx, val) => {
    const updated = [...atletasRevezamento];
    updated[idx] = val;
    updateDados({ atletasRevezamento: updated });
    // Atualiza lista de atletas vinculados na análise
    setFormData(prev => ({
      ...prev,
      atletas: updated.filter(Boolean)
    }));
  };

  const handleTempoIndividualChange = (idx, val) => {
    const updated = [...temposIndividuais];
    updated[idx] = val;
    updateDados({ temposIndividuais: updated });
  };

  // Pentatlo sub-fields
  const pentatloData = dados.pentatlo || {};
  const updatePentatlo = (field, val) => {
    updateDados({
      pentatlo: {
        ...(dados.pentatlo || {}),
        [field]: val
      }
    });
  };

  // Identificação do grupo de prova
  const isCorridasCurta = ['100m', '100m_barreiras', '110m_barreiras', '200m', '400m', '400m_barreiras'].includes(selectedProvaId);
  const isCorridasFundo = ['800m', '1500m', '3000m', '5000m'].includes(selectedProvaId);
  const isRevezamento = ['revezamento_4x100m', 'revezamento_4x400m'].includes(selectedProvaId);
  const isSaltoAltura = selectedProvaId === 'salto_altura';
  const isTentativasProva = ['salto_distancia', 'salto_triplo', 'arremesso_peso', 'lancamento_disco', 'lancamento_dardo'].includes(selectedProvaId);
  const isPentatlo = selectedProvaId === 'pentatlo';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ── GRUPO 1: 100m, 200m, 400m E PROVAS COM BARREIRAS ── */}
      {isCorridasCurta && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700 }}>
                1. Selecionar o Atleta <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={formData.aluno || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aluno: e.target.value }))}
                required
              >
                <option value="">Selecione o atleta</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.nome} {s.turma ? `(${s.turma})` : ''}</option>)}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700 }}>
                2. Quantos adversários tem <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <div>
                <NumberStepper
                  value={dados.quantidadeAdversarios || 0}
                  onChange={(v) => updateDados({ quantidadeAdversarios: v })}
                  min={0}
                  ariaLabel="Quantidade de adversários"
                />
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700 }}>
                3. Colocação <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 1º lugar, 2º lugar, 3º..."
                value={dados.colocacao || ''}
                onChange={(e) => updateDados({ colocacao: e.target.value })}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700 }}>
                4. Tempo
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 10.85s ou 00:10.85"
                value={dados.tempo || ''}
                onChange={(e) => updateDados({ tempo: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── GRUPO 2: 800m, 1500m, 3000m E 5000m (com Pace Automático) ── */}
      {isCorridasFundo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700 }}>
                1. Selecionar o Atleta <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={formData.aluno || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aluno: e.target.value }))}
                required
              >
                <option value="">Selecione o atleta</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.nome} {s.turma ? `(${s.turma})` : ''}</option>)}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700 }}>
                2. Quantos adversários tem <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <div>
                <NumberStepper
                  value={dados.quantidadeAdversarios || 0}
                  onChange={(v) => updateDados({ quantidadeAdversarios: v })}
                  min={0}
                  ariaLabel="Quantidade de adversários"
                />
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontWeight: 700 }}>
                3. Colocação <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 1º lugar"
                value={dados.colocacao || ''}
                onChange={(e) => updateDados({ colocacao: e.target.value })}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontWeight: 700 }}>
                4. Tempo
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 02:15 ou 135 (segundos)"
                value={dados.tempo || ''}
                onChange={(e) => updateDados({ tempo: e.target.value })}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                5. Pace Calculado Automaticamente
              </label>
              <input
                type="text"
                className="form-control"
                value={computedPace || '—'}
                readOnly
                style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  border: '1.5px solid var(--primary)'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── GRUPO 3: REVEZAMENTOS 4x100m E 4x400m ── */}
      {isRevezamento && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '10px', display: 'block' }}>
              1. Selecionar os Quatro Atletas que Correram <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <div className="row g-2">
              {[0, 1, 2, 3].map((pos) => (
                <div key={pos} className="col-12 col-sm-6">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Atleta {pos + 1} <span style={{ color: 'var(--error)' }}>*</span>:</span>
                  <select
                    className="form-select form-select-sm"
                    value={atletasRevezamento[pos] || ''}
                    onChange={(e) => handleRevezamentoAtletaChange(pos, e.target.value)}
                    required
                  >
                    <option value="">Selecione o atleta {pos + 1}</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.nome} {s.turma ? `(${s.turma})` : ''}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontWeight: 700 }}>
                2. Quantas equipes participaram <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <div>
                <NumberStepper
                  value={dados.quantidadeEquipes || 0}
                  onChange={(v) => updateDados({ quantidadeEquipes: v })}
                  min={0}
                  ariaLabel="Quantidade de equipes"
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontWeight: 700 }}>
                3. Colocação <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 1º lugar"
                value={dados.colocacao || ''}
                onChange={(e) => updateDados({ colocacao: e.target.value })}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontWeight: 700 }}>
                4. Tempo Final da Equipe
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Tempo total (ex: 42.80s)"
                value={dados.tempo || ''}
                onChange={(e) => updateDados({ tempo: e.target.value })}
              />
            </div>
          </div>

          {/* 5. Tempo individual por atleta */}
          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>
              5. Tempo Individual por Atleta
            </label>
            <div className="row g-2">
              {[0, 1, 2, 3].map((pos) => (
                <div key={pos} className="col-12 col-sm-6 col-md-3">
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tempo Atleta {pos + 1}:</span>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: 10.50s"
                    value={temposIndividuais[pos] || ''}
                    onChange={(e) => handleTempoIndividualChange(pos, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GRUPO 4: SALTO EM ALTURA ── */}
      {isSaltoAltura && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700 }}>
                1. Selecionar o Atleta <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={formData.aluno || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aluno: e.target.value }))}
                required
              >
                <option value="">Selecione o atleta</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.nome} {s.turma ? `(${s.turma})` : ''}</option>)}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700 }}>
                2. Quantos adversários tem <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <div>
                <NumberStepper
                  value={dados.quantidadeAdversarios || 0}
                  onChange={(v) => updateDados({ quantidadeAdversarios: v })}
                  min={0}
                  ariaLabel="Quantidade de adversários"
                />
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700 }}>
                3. Colocação <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 1º lugar"
                value={dados.colocacao || ''}
                onChange={(e) => updateDados({ colocacao: e.target.value })}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700 }}>
                4. Maior altura pulada
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 1.85m ou 185 cm"
                value={dados.maiorAltura || ''}
                onChange={(e) => updateDados({ maiorAltura: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── GRUPO 5 & 6: SALTO DISTÂNCIA/TRIPLO & ARREMESSO PESO/DISCO/DARDO (TENTATIVAS) ── */}
      {isTentativasProva && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontWeight: 700 }}>
                1. Selecionar o Atleta <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={formData.aluno || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aluno: e.target.value }))}
                required
              >
                <option value="">Selecione o atleta</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.nome} {s.turma ? `(${s.turma})` : ''}</option>)}
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontWeight: 700 }}>
                2. Quantos adversários tem <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <div>
                <NumberStepper
                  value={dados.quantidadeAdversarios || 0}
                  onChange={(v) => updateDados({ quantidadeAdversarios: v })}
                  min={0}
                  ariaLabel="Quantidade de adversários"
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label" style={{ fontWeight: 700 }}>
                3. Colocação <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 1º lugar"
                value={dados.colocacao || ''}
                onChange={(e) => updateDados({ colocacao: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                4. Selecionar quantas tentativas teve
              </label>
              <NumberStepper
                value={dados.quantidadeTentativas || 0}
                onChange={handleTentativasQtdChange}
                min={0}
                max={10}
                ariaLabel="Quantidade de tentativas"
              />
            </div>

            {/* 5. Informar a distância de cada tentativa */}
            {distanciasTentativas.length > 0 ? (
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: '8px', display: 'block' }}>
                  5. Distância de cada tentativa
                </label>
                <div className="row g-2">
                  {distanciasTentativas.map((dist, idx) => (
                    <div key={idx} className="col-12 col-sm-6 col-md-4 col-lg-3">
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tentativa {idx + 1}:</span>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Ex: 6.45m"
                        value={dist || ''}
                        onChange={(e) => handleDistanciaTentativaChange(idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: 0, fontStyle: 'italic' }}>
                Nenhuma tentativa registrada.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── GRUPO 7: PENTATLO ── */}
      {isPentatlo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Seção 0: Informações Gerais */}
          <div style={{ background: 'var(--bg-card)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <h6 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '14px', fontSize: '0.9375rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              PENTATLO — Informações Gerais
            </h6>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  1. Selecionar o Atleta <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.aluno || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, aluno: e.target.value }))}
                  required
                >
                  <option value="">Selecione o atleta</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.nome} {s.turma ? `(${s.turma})` : ''}</option>)}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  2. Quantos adversários tem <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div>
                  <NumberStepper
                    value={dados.quantidadeAdversarios || 0}
                    onChange={(v) => updateDados({ quantidadeAdversarios: v })}
                    min={0}
                    ariaLabel="Quantidade de adversários"
                  />
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  3. Colocação Geral <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: 1º lugar geral"
                  value={dados.colocacao || ''}
                  onChange={(e) => updateDados({ colocacao: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h6 style={{ fontWeight: 800, color: 'var(--text)', margin: '4px 0 0' }}>
              Provas Específicas do Pentatlo:
            </h6>

            {/* Prova 1: Corrida com barreiras */}
            <div style={{ background: 'var(--bg-card)', padding: '16px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '10px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏃 1. Corrida com Barreiras</span>
              </div>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Tempo da Corrida com Barreiras:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: 14.5s"
                    value={pentatloData.barreirasTempo || ''}
                    onChange={(e) => updatePentatlo('barreirasTempo', e.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Colocação Específica na Prova:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: 1º lugar"
                    value={pentatloData.barreirasColocacao || ''}
                    onChange={(e) => updatePentatlo('barreirasColocacao', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Prova 2: Corrida 800m */}
            <div style={{ background: 'var(--bg-card)', padding: '16px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '10px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⏱️ 2. Corrida 800m</span>
              </div>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Tempo dos 800m:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: 02:20"
                    value={pentatloData.corrida800mTempo || ''}
                    onChange={(e) => updatePentatlo('corrida800mTempo', e.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Colocação Específica nos 800m:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: 2º lugar"
                    value={pentatloData.corrida800mColocacao || ''}
                    onChange={(e) => updatePentatlo('corrida800mColocacao', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Prova 3: Arremesso de peso */}
            <div style={{ background: 'var(--bg-card)', padding: '16px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '10px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎯 3. Arremesso de Peso</span>
              </div>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Distância do Arremesso:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: 12.30m"
                    value={pentatloData.arremessoPesoDistancia || ''}
                    onChange={(e) => updatePentatlo('arremessoPesoDistancia', e.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Colocação no Arremesso:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: 1º lugar"
                    value={pentatloData.arremessoPesoColocacao || ''}
                    onChange={(e) => updatePentatlo('arremessoPesoColocacao', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Prova 4: Salto em altura */}
            <div style={{ background: 'var(--bg-card)', padding: '16px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '10px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🪜 4. Salto em Altura</span>
              </div>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Altura Alcançada:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: 1.70m"
                    value={pentatloData.saltoAlturaAltura || ''}
                    onChange={(e) => updatePentatlo('saltoAlturaAltura', e.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Colocação no Salto em Altura:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: 3º lugar"
                    value={pentatloData.saltoAlturaColocacao || ''}
                    onChange={(e) => updatePentatlo('saltoAlturaColocacao', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Prova 5: Salto em distância */}
            <div style={{ background: 'var(--bg-card)', padding: '16px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '10px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📏 5. Salto em Distância</span>
              </div>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Distância Alcançada:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: 5.80m"
                    value={pentatloData.saltoDistanciaDistancia || ''}
                    onChange={(e) => updatePentatlo('saltoDistanciaDistancia', e.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Colocação no Salto em Distância:
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ex: 1º lugar"
                    value={pentatloData.saltoDistanciaColocacao || ''}
                    onChange={(e) => updatePentatlo('saltoDistanciaColocacao', e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AtletismoForm;
