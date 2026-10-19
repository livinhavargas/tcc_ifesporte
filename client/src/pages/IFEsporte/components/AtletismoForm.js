import React from 'react';

export const PROVAS_ATLETISMO = [
  // Provas de Velocidade
  { id: '100m', label: '100m Rasos', grupo: 'Provas de Velocidade' },
  { id: '200m', label: '200m Rasos', grupo: 'Provas de Velocidade' },
  { id: '400m', label: '400m Rasos', grupo: 'Provas de Velocidade' },

  // Provas com Obstáculos
  { id: '100m_barreiras', label: '100m com Barreiras', grupo: 'Provas com Obstáculos', generoExclusivo: 'Feminino' },
  { id: '110m_barreiras', label: '110m com Barreiras', grupo: 'Provas com Obstáculos', generoExclusivo: 'Masculino' },
  { id: '400m_barreiras', label: '400m com Barreiras', grupo: 'Provas com Obstáculos' },

  // Provas de Meio Fundo
  { id: '800m', label: '800m Rasos', grupo: 'Provas de Meio Fundo' },
  { id: '1500m', label: '1.500m Rasos', grupo: 'Provas de Meio Fundo' },

  // Provas de Fundo
  { id: '3000m', label: '3.000m Rasos', grupo: 'Provas de Fundo' },
  { id: '5000m', label: '5.000m Rasos', grupo: 'Provas de Fundo' },
  { id: '10000m', label: '10.000m Rasos', grupo: 'Provas de Fundo' },

  // Provas de Revezamento
  { id: 'revezamento_4x100m', label: '4x100m', grupo: 'Provas de Revezamento' },
  { id: 'revezamento_4x400m', label: '4x400m', grupo: 'Provas de Revezamento' },

  // Provas de Saltos Verticais
  { id: 'salto_altura', label: 'Salto em Altura', grupo: 'Provas de Saltos Verticais' },
  { id: 'salto_vara', label: 'Salto com Vara', grupo: 'Provas de Saltos Verticais' },

  // Provas de Saltos Horizontais
  { id: 'salto_distancia', label: 'Salto em Distância', grupo: 'Provas de Saltos Horizontais' },
  { id: 'salto_triplo', label: 'Salto Triplo', grupo: 'Provas de Saltos Horizontais' },

  // Provas de Arremessos e Lançamentos (Ordem: Martelo, Peso, Dardo, Disco)
  { id: 'arremesso_martelo', label: 'Arremesso de Martelo', grupo: 'Provas de Arremessos e Lançamentos' },
  { id: 'arremesso_peso', label: 'Arremesso de Peso', grupo: 'Provas de Arremessos e Lançamentos' },
  { id: 'lancamento_dardo', label: 'Lançamento de Dardo', grupo: 'Provas de Arremessos e Lançamentos' },
  { id: 'lancamento_disco', label: 'Lançamento de Disco', grupo: 'Provas de Arremessos e Lançamentos' },

  // Prova Combinada
  { id: 'pentatlo', label: 'Pentatlo', grupo: 'Prova Combinada' }
];

export const getAtletismoGroup = (provaStr) => {
  const s = (provaStr || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_.-]/g, '');

  if (s.includes('pentatlo')) {
    return 'pentatlo'; // 2.5 Prova Combinada
  }
  if (s.includes('4x100') || s.includes('4x400') || s.includes('revezamento')) {
    return 'revezamento'; // 2.2 Revezamento
  }
  if (
    s.includes('saltoemaltura') || 
    (s.includes('altura') && !s.includes('pentatlo')) || 
    s.includes('saltocomvara') || 
    s.includes('vara')
  ) {
    return 'saltos_verticais'; // 2.3 Saltos Verticais
  }
  if (
    s.includes('distancia') || 
    s.includes('triplo') || 
    s.includes('martelo') || 
    s.includes('peso') || 
    s.includes('dardo') || 
    s.includes('disco')
  ) {
    return 'saltos_horizontais_lancamentos'; // 2.4 Saltos Horizontais e Arremesso/Lançamento
  }
  // 2.1 Velocidade, Obstáculo, Meio Fundo e Fundo
  return 'corridas';
};

export const isPrimeiroLugar = (colocacaoStr) => {
  if (!colocacaoStr) return false;
  const s = String(colocacaoStr)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (/^1\s*(º|o|°)?(\s*lugar)?$/i.test(s)) return true;
  if (/^1\s*(º|o|°)\b/i.test(s)) return true;
  if (/^1\s*st\b/i.test(s)) return true;
  if (s.startsWith('primeiro') || s.startsWith('campeao') || s.startsWith('ouro')) return true;
  if (/^1\s*(º|o|°)?\s*lugar\b/i.test(s)) return true;
  return false;
};

const labelStyle = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.8125rem',
  color: 'var(--text)',
  marginBottom: '6px'
};

const subLabelStyle = {
  display: 'block',
  fontWeight: 600,
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  marginBottom: '4px'
};

const sectionBoxStyle = {
  background: 'var(--bg)',
  borderRadius: 'var(--radius-md)',
  padding: '16px',
  border: '1px solid var(--border-light)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const AtletismoForm = ({
  formData,
  setFormData,
  students = []
}) => {
  const dados = formData.dadosEspecificos || {};
  const currentSubtipo = formData.subtipoProva || '100m Rasos';
  const group = getAtletismoGroup(currentSubtipo);

  const updateDados = (updates) => {
    setFormData(prev => ({
      ...prev,
      dadosEspecificos: {
        ...(prev.dadosEspecificos || {}),
        ...updates
      }
    }));
  };

  const handleGeneroChange = (genero) => {
    setFormData(prev => ({
      ...prev,
      categoria: genero,
      dadosEspecificos: {
        ...(prev.dadosEspecificos || {}),
        genero
      }
    }));
  };

  // Valor atual do gênero: exclusivamente 'Feminino' ou 'Masculino'
  const currentGenero = (formData.categoria === 'Masculino' || dados.genero === 'Masculino')
    ? 'Masculino'
    : 'Feminino';

  // Revezamento (4 atletas)
  const atletasRevezamento = Array.isArray(dados.atletasRevezamento) 
    ? [dados.atletasRevezamento[0] || '', dados.atletasRevezamento[1] || '', dados.atletasRevezamento[2] || '', dados.atletasRevezamento[3] || '']
    : ['', '', '', ''];

  const handleRevezamentoAtletaChange = (idx, val) => {
    const updated = [...atletasRevezamento];
    updated[idx] = val;
    updateDados({ atletasRevezamento: updated });
    setFormData(prev => ({
      ...prev,
      atletas: updated.filter(Boolean)
    }));
  };

  // Saltos Verticais (3 tentativas de Partida e 3 tentativas Posteriores)
  const tentativasPartida = Array.isArray(dados.tentativasPartida)
    ? [dados.tentativasPartida[0] || '', dados.tentativasPartida[1] || '', dados.tentativasPartida[2] || '']
    : ['', '', ''];

  const handleTentativaPartidaChange = (idx, val) => {
    const updated = [...tentativasPartida];
    updated[idx] = val;
    updateDados({ tentativasPartida: updated });
  };

  const tentativasPosteriores = Array.isArray(dados.tentativasPosteriores)
    ? [dados.tentativasPosteriores[0] || '', dados.tentativasPosteriores[1] || '', dados.tentativasPosteriores[2] || '']
    : ['', '', ''];

  const handleTentativaPosteriorChange = (idx, val) => {
    const updated = [...tentativasPosteriores];
    updated[idx] = val;
    updateDados({ tentativasPosteriores: updated });
  };

  // Saltos Horizontais e Arremesso/Lançamento (Exatamente 6 tentativas)
  const distanciasTentativas = Array.isArray(dados.distanciasTentativas)
    ? [
        dados.distanciasTentativas[0] || '',
        dados.distanciasTentativas[1] || '',
        dados.distanciasTentativas[2] || '',
        dados.distanciasTentativas[3] || '',
        dados.distanciasTentativas[4] || '',
        dados.distanciasTentativas[5] || ''
      ]
    : ['', '', '', '', '', ''];

  const handleDistanciaTentativaChange = (idx, val) => {
    const updated = [...distanciasTentativas];
    updated[idx] = val;
    updateDados({ distanciasTentativas: updated });
  };

  // Pentatlo
  const pentatloData = dados.pentatlo || {};
  const updatePentatlo = (field, val) => {
    updateDados({
      pentatlo: {
        ...(dados.pentatlo || {}),
        [field]: val
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ──────────────────────────────────────────────────────────────────
          2.1: Provas de Velocidade, Obstáculo, Meio Fundo e Fundo
          Atleta
          Gênero (Feminino / Masculino)
          Adversários
          Classificação
          Tempo
          Raia
          Tempo do Vencedor
          Observações do treinador
         ────────────────────────────────────────────────────────────────── */}
      {group === 'corridas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="row g-3">
            {/* Atleta */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Atleta <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={formData.aluno || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aluno: e.target.value }))}
                required
              >
                <option value="">Selecione o atleta</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.nome} {s.turma ? `(${s.turma})` : ''} {s.matricula ? `· ${s.matricula}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Gênero */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Gênero <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={currentGenero}
                onChange={(e) => handleGeneroChange(e.target.value)}
                required
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
          </div>

          <div className="row g-3">
            {/* Adversários */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Adversários <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Quantidade de adversários"
                value={dados.quantidadeAdversarios !== undefined && dados.quantidadeAdversarios !== null ? dados.quantidadeAdversarios : ''}
                onChange={(e) => updateDados({ quantidadeAdversarios: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>

            {/* Classificação */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Classificação <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
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

          <div className="row g-3">
            {/* Tempo */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Tempo
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 10.85s ou 00:10.85"
                value={dados.tempo || ''}
                onChange={(e) => updateDados({ tempo: e.target.value })}
              />
            </div>

            {/* Raia */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Raia
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Raia 4"
                value={dados.raia || ''}
                onChange={(e) => updateDados({ raia: e.target.value })}
              />
            </div>

            {/* Tempo do Vencedor */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Tempo do Vencedor
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 10.20s"
                value={dados.tempoVencedor || ''}
                onChange={(e) => updateDados({ tempoVencedor: e.target.value })}
              />
            </div>
          </div>

          {/* Observações do treinador */}
          <div>
            <label style={labelStyle}>
              Observações do treinador
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Digite aqui as observações..."
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          2.2: Provas de Revezamento (4x100m e 4x400m)
          Atletas (plural - 4 atletas)
          Gênero (Feminino / Masculino)
          Equipes
          Classificação
          Tempo
          Raia
          Tempo dos Vencedores
          Observações do treinador
         ────────────────────────────────────────────────────────────────── */}
      {group === 'revezamento' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Atletas */}
          <div style={sectionBoxStyle}>
            <label style={{ ...labelStyle, margin: 0 }}>
              Atletas <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
            </label>
            <div className="row g-2">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="col-12 col-sm-6">
                  <span style={subLabelStyle}>Atleta {idx + 1} <span style={{ color: 'var(--error, #ef4444)' }}>*</span>:</span>
                  <select
                    className="form-select form-select-sm"
                    value={atletasRevezamento[idx] || ''}
                    onChange={(e) => handleRevezamentoAtletaChange(idx, e.target.value)}
                    required
                  >
                    <option value="">Selecione o atleta {idx + 1}</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.nome} {s.turma ? `(${s.turma})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="row g-3">
            {/* Gênero */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Gênero <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={currentGenero}
                onChange={(e) => handleGeneroChange(e.target.value)}
                required
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>

            {/* Equipes */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Equipes <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Quantidade de equipes"
                value={dados.quantidadeEquipes !== undefined && dados.quantidadeEquipes !== null ? dados.quantidadeEquipes : ''}
                onChange={(e) => updateDados({ quantidadeEquipes: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>

            {/* Classificação */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Classificação <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
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

          <div className="row g-3">
            {/* Tempo */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Tempo
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 42.80s"
                value={dados.tempo || ''}
                onChange={(e) => updateDados({ tempo: e.target.value })}
              />
            </div>

            {/* Raia */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Raia
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Raia 3"
                value={dados.raia || ''}
                onChange={(e) => updateDados({ raia: e.target.value })}
              />
            </div>

            {/* Tempo dos Vencedores */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Tempo dos Vencedores
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 41.50s"
                value={dados.tempoVencedor || ''}
                onChange={(e) => updateDados({ tempoVencedor: e.target.value })}
              />
            </div>
          </div>

          {/* Observações do treinador */}
          <div>
            <label style={labelStyle}>
              Observações do treinador
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Digite aqui as observações..."
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          2.3: Provas de Saltos Verticais (Salto em Altura e Salto com Vara)
          Atleta
          Gênero (Feminino / Masculino)
          Adversários
          Classificação
          Altura de Partida — 3 tentativas
          Alturas Posteriores — 3 tentativas
          Altura Conseguida
          Altura do Vencedor
          Observações do treinador
         ────────────────────────────────────────────────────────────────── */}
      {group === 'saltos_verticais' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="row g-3">
            {/* Atleta */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Atleta <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={formData.aluno || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aluno: e.target.value }))}
                required
              >
                <option value="">Selecione o atleta</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.nome} {s.turma ? `(${s.turma})` : ''} {s.matricula ? `· ${s.matricula}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Gênero */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Gênero <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={currentGenero}
                onChange={(e) => handleGeneroChange(e.target.value)}
                required
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
          </div>

          <div className="row g-3">
            {/* Adversários */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Adversários <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Quantidade de adversários"
                value={dados.quantidadeAdversarios !== undefined && dados.quantidadeAdversarios !== null ? dados.quantidadeAdversarios : ''}
                onChange={(e) => updateDados({ quantidadeAdversarios: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>

            {/* Classificação */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Classificação <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
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

          {/* Altura de Partida — 3 tentativas */}
          <div style={sectionBoxStyle}>
            <label style={{ ...labelStyle, margin: 0 }}>
              Altura de Partida — 3 tentativas
            </label>
            <div className="row g-2">
              <div className="col-12 col-md-3">
                <span style={subLabelStyle}>Altura de Partida:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 1.50m"
                  value={dados.alturaPartida || ''}
                  onChange={(e) => updateDados({ alturaPartida: e.target.value })}
                />
              </div>
              <div className="col-4 col-md-3">
                <span style={subLabelStyle}>Tentativa 1:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: O, X, -"
                  value={tentativasPartida[0]}
                  onChange={(e) => handleTentativaPartidaChange(0, e.target.value)}
                />
              </div>
              <div className="col-4 col-md-3">
                <span style={subLabelStyle}>Tentativa 2:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: O, X, -"
                  value={tentativasPartida[1]}
                  onChange={(e) => handleTentativaPartidaChange(1, e.target.value)}
                />
              </div>
              <div className="col-4 col-md-3">
                <span style={subLabelStyle}>Tentativa 3:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: O, X, -"
                  value={tentativasPartida[2]}
                  onChange={(e) => handleTentativaPartidaChange(2, e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Alturas Posteriores — 3 tentativas */}
          <div style={sectionBoxStyle}>
            <label style={{ ...labelStyle, margin: 0 }}>
              Alturas Posteriores — 3 tentativas
            </label>
            <div className="row g-2">
              <div className="col-12 col-md-3">
                <span style={subLabelStyle}>Alturas Posteriores:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 1.55m"
                  value={dados.alturasPosteriores || ''}
                  onChange={(e) => updateDados({ alturasPosteriores: e.target.value })}
                />
              </div>
              <div className="col-4 col-md-3">
                <span style={subLabelStyle}>Tentativa 1:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: O, X, -"
                  value={tentativasPosteriores[0]}
                  onChange={(e) => handleTentativaPosteriorChange(0, e.target.value)}
                />
              </div>
              <div className="col-4 col-md-3">
                <span style={subLabelStyle}>Tentativa 2:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: O, X, -"
                  value={tentativasPosteriores[1]}
                  onChange={(e) => handleTentativaPosteriorChange(1, e.target.value)}
                />
              </div>
              <div className="col-4 col-md-3">
                <span style={subLabelStyle}>Tentativa 3:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: O, X, -"
                  value={tentativasPosteriores[2]}
                  onChange={(e) => handleTentativaPosteriorChange(2, e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="row g-3">
            {/* Altura Conseguida */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Altura Conseguida
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 1.85m"
                value={dados.alturaConseguida || ''}
                onChange={(e) => updateDados({ alturaConseguida: e.target.value })}
              />
            </div>

            {/* Altura do Vencedor */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Altura do Vencedor
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 1.90m"
                value={dados.alturaVencedor || ''}
                onChange={(e) => updateDados({ alturaVencedor: e.target.value })}
              />
            </div>
          </div>

          {/* Observações do treinador */}
          <div>
            <label style={labelStyle}>
              Observações do treinador
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Digite aqui as observações..."
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          2.4: Provas de Saltos Horizontais e Provas de Arremesso e Lançamento
          Atleta
          Gênero (Feminino / Masculino)
          Adversários
          Classificação
          Distância em Cada Tentativa — 6 tentativas
          Distância Conseguida
          Distância do Vencedor
          Observações do treinador
         ────────────────────────────────────────────────────────────────── */}
      {group === 'saltos_horizontais_lancamentos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="row g-3">
            {/* Atleta */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Atleta <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={formData.aluno || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aluno: e.target.value }))}
                required
              >
                <option value="">Selecione o atleta</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.nome} {s.turma ? `(${s.turma})` : ''} {s.matricula ? `· ${s.matricula}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Gênero */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Gênero <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={currentGenero}
                onChange={(e) => handleGeneroChange(e.target.value)}
                required
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
          </div>

          <div className="row g-3">
            {/* Adversários */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Adversários <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Quantidade de adversários"
                value={dados.quantidadeAdversarios !== undefined && dados.quantidadeAdversarios !== null ? dados.quantidadeAdversarios : ''}
                onChange={(e) => updateDados({ quantidadeAdversarios: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>

            {/* Classificação */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Classificação <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
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

          {/* Distância em Cada Tentativa — 6 tentativas */}
          <div style={sectionBoxStyle}>
            <label style={{ ...labelStyle, margin: 0 }}>
              Distância em Cada Tentativa — 6 tentativas
            </label>
            <div className="row g-2">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="col-12 col-sm-6 col-md-4">
                  <span style={subLabelStyle}>Tentativa {idx + 1}:</span>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={`Ex: ${idx === 2 ? 'X (queima)' : '6.45m'}`}
                    value={distanciasTentativas[idx]}
                    onChange={(e) => handleDistanciaTentativaChange(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="row g-3">
            {/* Distância Conseguida */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Distância Conseguida
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 6.50m"
                value={dados.distanciaConseguida || ''}
                onChange={(e) => updateDados({ distanciaConseguida: e.target.value })}
              />
            </div>

            {/* Distância do Vencedor */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Distância do Vencedor
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 6.75m"
                value={dados.distanciaVencedor || ''}
                onChange={(e) => updateDados({ distanciaVencedor: e.target.value })}
              />
            </div>
          </div>

          {/* Observações do treinador */}
          <div>
            <label style={labelStyle}>
              Observações do treinador
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Digite aqui as observações..."
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          2.5: Prova Combinada — Pentatlo
          Títulos exatos e SEM numeração:
          Atleta
          Gênero (Feminino / Masculino)
          Adversários
          Classificação Final
          Classificação Final do Vencedor
          Classificação 100m/110m com Barreiras
          Classificação Salto em Altura
          Classificação Arremesso de Peso
          Classificação Salto em Distância
          Classificação 800m
          Observações do treinador
         ────────────────────────────────────────────────────────────────── */}
      {group === 'pentatlo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="row g-3">
            {/* Atleta */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Atleta <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={formData.aluno || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aluno: e.target.value }))}
                required
              >
                <option value="">Selecione o atleta</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.nome} {s.turma ? `(${s.turma})` : ''} {s.matricula ? `· ${s.matricula}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Gênero */}
            <div className="col-12 col-md-6">
              <label style={labelStyle}>
                Gênero <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={currentGenero}
                onChange={(e) => handleGeneroChange(e.target.value)}
                required
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
          </div>

          <div className="row g-3">
            {/* Adversários */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Adversários <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Quantidade de adversários"
                value={dados.quantidadeAdversarios !== undefined && dados.quantidadeAdversarios !== null ? dados.quantidadeAdversarios : ''}
                onChange={(e) => updateDados({ quantidadeAdversarios: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>

            {/* Classificação Final */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Classificação Final <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 1º lugar — 3.450 pts"
                value={dados.classificacaoFinalPontos || dados.colocacao || ''}
                onChange={(e) => updateDados({ classificacaoFinalPontos: e.target.value, colocacao: e.target.value })}
                required
              />
            </div>

            {/* Classificação Final do Vencedor */}
            <div className="col-12 col-md-4">
              <label style={labelStyle}>
                Classificação Final do Vencedor
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 1º lugar — 3.820 pts"
                value={dados.classificacaoFinalVencedorPontos || ''}
                onChange={(e) => updateDados({ classificacaoFinalVencedorPontos: e.target.value })}
              />
            </div>
          </div>

          {/* Classificação 100m/110m com Barreiras */}
          <div style={sectionBoxStyle}>
            <label style={{ ...labelStyle, margin: 0 }}>
              Classificação 100m/110m com Barreiras
            </label>
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Classificação:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 1º lugar"
                  value={pentatloData.barreirasColocacao || ''}
                  onChange={(e) => updatePentatlo('barreirasColocacao', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Tempo da Prova:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 14.80s"
                  value={pentatloData.barreirasTempo || ''}
                  onChange={(e) => updatePentatlo('barreirasTempo', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Tempo do Vencedor:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 14.20s"
                  value={pentatloData.barreirasTempoVencedor || ''}
                  onChange={(e) => updatePentatlo('barreirasTempoVencedor', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Classificação Salto em Altura */}
          <div style={sectionBoxStyle}>
            <label style={{ ...labelStyle, margin: 0 }}>
              Classificação Salto em Altura
            </label>
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Classificação:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 2º lugar"
                  value={pentatloData.alturaColocacao || ''}
                  onChange={(e) => updatePentatlo('alturaColocacao', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Altura da Prova:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 1.75m"
                  value={pentatloData.alturaMarca || pentatloData.saltoAlturaAltura || ''}
                  onChange={(e) => updatePentatlo('alturaMarca', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Altura do Vencedor:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 1.85m"
                  value={pentatloData.alturaVencedor || ''}
                  onChange={(e) => updatePentatlo('alturaVencedor', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Classificação Arremesso de Peso */}
          <div style={sectionBoxStyle}>
            <label style={{ ...labelStyle, margin: 0 }}>
              Classificação Arremesso de Peso
            </label>
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Classificação:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 1º lugar"
                  value={pentatloData.pesoColocacao || pentatloData.arremessoPesoColocacao || ''}
                  onChange={(e) => updatePentatlo('pesoColocacao', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Distância da Prova:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 12.40m"
                  value={pentatloData.pesoMarca || pentatloData.arremessoPesoDistancia || ''}
                  onChange={(e) => updatePentatlo('pesoMarca', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Distância do Vencedor:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 13.10m"
                  value={pentatloData.pesoVencedor || ''}
                  onChange={(e) => updatePentatlo('pesoVencedor', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Classificação Salto em Distância */}
          <div style={sectionBoxStyle}>
            <label style={{ ...labelStyle, margin: 0 }}>
              Classificação Salto em Distância
            </label>
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Classificação:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 3º lugar"
                  value={pentatloData.distanciaColocacao || pentatloData.saltoDistanciaColocacao || ''}
                  onChange={(e) => updatePentatlo('distanciaColocacao', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Distância da Prova:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 5.90m"
                  value={pentatloData.distanciaMarca || pentatloData.saltoDistanciaDistancia || ''}
                  onChange={(e) => updatePentatlo('distanciaMarca', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Distância do Vencedor:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 6.25m"
                  value={pentatloData.distanciaVencedor || ''}
                  onChange={(e) => updatePentatlo('distanciaVencedor', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Classificação 800m */}
          <div style={sectionBoxStyle}>
            <label style={{ ...labelStyle, margin: 0 }}>
              Classificação 800m
            </label>
            <div className="row g-2">
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Classificação:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 2º lugar"
                  value={pentatloData.corrida800mColocacao || ''}
                  onChange={(e) => updatePentatlo('corrida800mColocacao', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Tempo da Prova:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 02:18.5"
                  value={pentatloData.corrida800mTempo || ''}
                  onChange={(e) => updatePentatlo('corrida800mTempo', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4">
                <span style={subLabelStyle}>Tempo do Vencedor:</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ex: 02:14.0"
                  value={pentatloData.corrida800mTempoVencedor || ''}
                  onChange={(e) => updatePentatlo('corrida800mTempoVencedor', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Observações do treinador */}
          <div>
            <label style={labelStyle}>
              Observações do treinador
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Digite aqui as observações..."
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default AtletismoForm;
