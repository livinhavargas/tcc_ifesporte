import React from 'react';

const XadrezForm = ({
  formData,
  setFormData,
  onUpdateDados,
  students = []
}) => {
  const dados = formData.dadosEspecificos || {};
  const corSelecionada = dados.cor || dados.corPecas || '';

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

  const handleGeneroChange = (novoGenero) => {
    setFormData(prev => ({
      ...prev,
      categoria: novoGenero,
      dadosEspecificos: {
        ...(prev.dadosEspecificos || {}),
        genero: novoGenero
      }
    }));
  };

  const currentStudentId = formData.aluno 
    ? (typeof formData.aluno === 'object' ? formData.aluno._id : formData.aluno)
    : '';

  const currentNome = dados.nomeAtleta || (typeof formData.aluno === 'object' ? formData.aluno?.nome : '');

  const handleSelectStudent = (studentId) => {
    if (!studentId) {
      setFormData(prev => ({
        ...prev,
        aluno: '',
        atletas: []
      }));
      updateDados({ nomeAtleta: '' });
      return;
    }
    const st = students.find(s => s._id === studentId);
    if (st) {
      setFormData(prev => ({
        ...prev,
        aluno: st._id,
        atletas: [st._id]
      }));
      updateDados({ nomeAtleta: st.nome });
    }
  };

  const handleCorChange = (cor) => {
    updateDados({ cor, corPecas: cor });
  };

  const selectedGenero = dados.genero || (['Feminino', 'Masculino'].includes(formData.categoria) ? formData.categoria : '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. Gênero (Apenas Feminino e Masculino, sem Misto) */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Gênero <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
        </label>
        <select
          className="form-select"
          value={selectedGenero}
          onChange={(e) => handleGeneroChange(e.target.value)}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600, height: '42px' }}
          required
        >
          <option value="">Selecione o gênero</option>
          <option value="Feminino">Feminino</option>
          <option value="Masculino">Masculino</option>
        </select>
      </div>

      {/* 2. Atleta (Nossa Equipe) e Adversário lado a lado em duas colunas equilibradas */}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
            Atleta <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
          </label>
          <select
            className="form-select"
            value={currentStudentId}
            onChange={(e) => handleSelectStudent(e.target.value)}
            style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', height: '42px' }}
            required
          >
            <option value="">Selecione o atleta</option>
            {students.map(st => (
              <option key={st._id} value={st._id}>
                {st.nome} {st.turma ? `(${st.turma})` : ''} {st.matricula ? `· ${st.matricula}` : ''}
              </option>
            ))}
            {currentStudentId && !students.some(s => s._id === currentStudentId) && (
              <option value={currentStudentId}>
                {currentNome || 'Atleta Selecionado'}
              </option>
            )}
          </select>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
            Adversário <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite o nome do adversário"
            value={formData.equipeAdversaria || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, equipeAdversaria: e.target.value }))}
            style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', height: '42px' }}
            required
          />
        </div>
      </div>

      {/* 3. Cor com a qual o atleta está jogando (Brancas ou Pretas) */}
      <div>
        <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Cor com a qual o atleta está jogando <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${corSelecionada === 'Brancas' ? 'var(--primary)' : 'var(--border)'}`,
              background: corSelecionada === 'Brancas' ? 'var(--primary-light)' : 'var(--bg)',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: corSelecionada === 'Brancas' ? 'var(--primary)' : 'var(--text)',
              transition: 'all var(--transition-fast)'
            }}>
              <input
                type="radio"
                name="corPecas"
                value="Brancas"
                checked={corSelecionada === 'Brancas'}
                onChange={() => handleCorChange('Brancas')}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>Brancas</span>
            </label>

            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${corSelecionada === 'Pretas' ? 'var(--primary)' : 'var(--border)'}`,
              background: corSelecionada === 'Pretas' ? 'var(--primary-light)' : 'var(--bg)',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: corSelecionada === 'Pretas' ? 'var(--primary)' : 'var(--text)',
              transition: 'all var(--transition-fast)'
            }}>
              <input
                type="radio"
                name="corPecas"
                value="Pretas"
                checked={corSelecionada === 'Pretas'}
                onChange={() => handleCorChange('Pretas')}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>Pretas</span>
            </label>
          </div>
        </div>

      {/* 4. Resultado Final */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Resultado Final <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
        </label>
        <select
          className="form-select"
          value={formData.resultado || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, resultado: e.target.value }))}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600, height: '42px' }}
          required
        >
          <option value="">Selecione o resultado</option>
          <option value="Vitória">Vitória</option>
          <option value="Empate">Empate</option>
          <option value="Derrota">Derrota</option>
        </select>
      </div>

      {/* 5. Observações do treinador */}
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

export default XadrezForm;
