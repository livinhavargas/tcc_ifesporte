import React from 'react';

const XadrezForm = ({
  formData,
  setFormData,
  onUpdateDados
}) => {
  const dados = formData.dadosEspecificos || {};
  const corSelecionada = dados.cor || dados.corPecas || '';

  const handleCorChange = (cor) => {
    if (onUpdateDados) {
      onUpdateDados({ cor, corPecas: cor });
    } else {
      setFormData(prev => ({
        ...prev,
        dadosEspecificos: {
          ...(prev.dadosEspecificos || {}),
          cor,
          corPecas: cor
        }
      }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Adversário (com opção de cor: Brancas ou Pretas) */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Adversário <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Digite o nome do adversário"
          value={formData.equipeAdversaria || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, equipeAdversaria: e.target.value }))}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '14px' }}
          required
        />

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
      </div>

      {/* Resultado Final */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Resultado Final <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
        </label>
        <select
          className="form-select"
          value={formData.resultado || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, resultado: e.target.value }))}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600 }}
          required
        >
          <option value="">Selecione o resultado</option>
          <option value="Vitória">Vitória</option>
          <option value="Empate">Empate</option>
          <option value="Derrota">Derrota</option>
        </select>
      </div>

      {/* Observações do treinador */}
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
