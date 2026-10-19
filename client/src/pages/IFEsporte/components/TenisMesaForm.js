import React, { useEffect } from 'react';
import NumberStepper from '../../../components/NumberStepper';

const TenisMesaForm = ({
  formData,
  setFormData,
  onUpdateDados
}) => {
  const dados = formData.dadosEspecificos || {};
  const formato = dados.formatoPartida || 'Individual';
  const isDupla = formato === 'Dupla';

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

  // Cálculo dos sets vencidos a partir dos 5 sets registrados
  const calculateSets = (customDados = dados) => {
    let setsNos = 0;
    let setsAdv = 0;
    for (let s = 1; s <= 5; s++) {
      const p = customDados[`placarSet${s}`];
      if (p && typeof p === 'object') {
        const pNos = parseInt(p.nos, 10) || 0;
        const pAdv = parseInt(p.adv, 10) || 0;
        if (pNos > 0 || pAdv > 0) {
          if (pNos > pAdv) setsNos += 1;
          else if (pAdv > pNos) setsAdv += 1;
        }
      }
    }
    return { setsNos, setsAdv };
  };

  const { setsNos, setsAdv } = calculateSets(dados);

  // Manipular alteração do placar de um set via NumberStepper
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

    const { setsNos: newNos, setsAdv: newAdv } = calculateSets(newDados);

    let newResultado = formData.resultado;
    if (newNos > newAdv) {
      newResultado = 'Vitória';
    } else if (newAdv > newNos) {
      newResultado = 'Derrota';
    }

    setFormData(prev => ({
      ...prev,
      resultado: newResultado,
      placar: { nos: newNos, adv: newAdv },
      dadosEspecificos: newDados
    }));
  };

  // Alteração do Formato (Individual ou Dupla)
  const handleFormatoChange = (novoFormato) => {
    updateDados({ formatoPartida: novoFormato });
  };

  // Alteração do Resultado Final por Sets com validação anti-contradição
  const handleResultadoChange = (novoResultado) => {
    if (setsNos > setsAdv && novoResultado === 'Derrota') {
      alert('Não é possível definir como Derrota, pois o placar dos sets indica vitória.');
      return;
    }
    if (setsAdv > setsNos && novoResultado === 'Vitória') {
      alert('Não é possível definir como Vitória, pois o placar dos sets indica derrota.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      resultado: novoResultado
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Individual ou em Dupla */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Individual ou em Dupla <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
        </label>
        <select
          className="form-select"
          value={formato}
          onChange={(e) => handleFormatoChange(e.target.value)}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600 }}
          required
        >
          <option value="Individual">Individual</option>
          <option value="Dupla">Dupla</option>
        </select>
      </div>

      {/* Atleta Adversário ou Dupla Adversária */}
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

      {/* Resultado Final por Sets */}
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
          <option value="Vitória" disabled={setsAdv > setsNos}>Vitória</option>
          <option value="Derrota" disabled={setsNos > setsAdv}>Derrota</option>
        </select>
      </div>

      {/* Placar dos Sets */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '12px', display: 'block' }}>
          Placar dos Sets
        </label>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3, 4, 5].map((setNum) => {
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

export default TenisMesaForm;
