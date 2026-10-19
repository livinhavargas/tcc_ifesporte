import React, { useEffect } from 'react';
import NumberStepper from '../../../components/NumberStepper';

const TenisMesaForm = ({
  formData,
  setFormData,
  onUpdateDados,
  students = []
}) => {
  const dados = formData.dadosEspecificos || {};
  const formato = dados.formatoPartida || 'Individual';
  const isDupla = formato === 'Dupla' || formato === 'Em Dupla';

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

  // Resolução dos atletas conforme o formato
  const atleta1Id = dados.atleta1 || (isDupla
    ? (formData.atletas?.[0]?._id || formData.atletas?.[0] || (formData.aluno ? (typeof formData.aluno === 'object' ? formData.aluno._id : formData.aluno) : ''))
    : (formData.aluno ? (typeof formData.aluno === 'object' ? formData.aluno._id : formData.aluno) : (formData.atletas?.[0]?._id || formData.atletas?.[0] || '')));

  const atleta2Id = isDupla
    ? (dados.atleta2 || (formData.atletas?.[1]?._id || formData.atletas?.[1] || ''))
    : '';

  // Seleção de atleta quando formato for Individual
  const handleSelectAtletaIndividual = (studentId) => {
    if (!studentId) {
      setFormData(prev => ({
        ...prev,
        aluno: '',
        atletas: []
      }));
      updateDados({
        nomeAtleta: '',
        atleta1: undefined,
        atleta1Nome: undefined,
        atleta2: undefined,
        atleta2Nome: undefined,
        nomeDupla: undefined
      });
      return;
    }
    const st = students.find(s => s._id === studentId);
    if (st) {
      setFormData(prev => ({
        ...prev,
        aluno: st._id,
        atletas: [st._id]
      }));
      updateDados({
        nomeAtleta: st.nome,
        atleta1: st._id,
        atleta1Nome: st.nome,
        atleta2: undefined,
        atleta2Nome: undefined,
        nomeDupla: undefined
      });
    }
  };

  // Seleção de atleta quando formato for Em Dupla (1º ou 2º Atleta)
  const handleSelectAtletaDupla = (pos, studentId) => {
    let next1 = pos === 1 ? studentId : atleta1Id;
    let next2 = pos === 2 ? studentId : atleta2Id;

    // Não permitir selecionar o mesmo atleta duas vezes na mesma dupla:
    if (pos === 1 && studentId && studentId === next2) {
      next2 = '';
    } else if (pos === 2 && studentId && studentId === next1) {
      next1 = '';
    }

    const st1 = students.find(s => s._id === next1);
    const st2 = students.find(s => s._id === next2);

    const nomes = [st1?.nome || (pos === 1 && !next1 ? '' : dados.atleta1Nome), st2?.nome || (pos === 2 && !next2 ? '' : dados.atleta2Nome)].filter(Boolean);
    const nomeDupla = nomes.join(' e ');

    const newAtletas = [next1, next2].filter(Boolean);
    const primaryAluno = next1 || next2 || '';

    setFormData(prev => ({
      ...prev,
      aluno: primaryAluno,
      atletas: newAtletas
    }));

    updateDados({
      atleta1: next1 || undefined,
      atleta1Nome: st1?.nome || undefined,
      atleta2: next2 || undefined,
      atleta2Nome: st2?.nome || undefined,
      nomeDupla: nomeDupla || undefined,
      nomeAtleta: nomeDupla || undefined
    });
  };

  // Alteração dinâmica do Formato (Individual ou Em Dupla)
  const handleFormatoChange = (novoFormato) => {
    const isNowDupla = novoFormato === 'Dupla' || novoFormato === 'Em Dupla';
    if (!isNowDupla) {
      // Ajuste imediato para Individual: mantém apenas um atleta e remove o segundo atleta completamente
      const currentAtleta1 = atleta1Id;
      const st1 = students.find(s => s._id === currentAtleta1);
      const st1Nome = st1?.nome || dados.atleta1Nome || dados.nomeAtleta || '';

      const updatedDados = {
        formatoPartida: 'Individual',
        atleta1: currentAtleta1 || undefined,
        atleta1Nome: st1Nome || undefined,
        nomeAtleta: st1Nome || undefined,
        atleta2: undefined,
        atleta2Nome: undefined,
        nomeDupla: undefined
      };

      if (onUpdateDados) {
        onUpdateDados(updatedDados);
      }

      setFormData(prev => ({
        ...prev,
        aluno: currentAtleta1 || '',
        atletas: currentAtleta1 ? [currentAtleta1] : [],
        dadosEspecificos: {
          ...(prev.dadosEspecificos || {}),
          ...updatedDados
        }
      }));
    } else {
      // Ajuste imediato para Em Dupla
      const st1 = students.find(s => s._id === atleta1Id);
      const st1Nome = st1?.nome || dados.atleta1Nome || dados.nomeAtleta || '';

      const updatedDados = {
        formatoPartida: 'Em Dupla',
        atleta1: atleta1Id || undefined,
        atleta1Nome: st1Nome || undefined,
        nomeDupla: st1Nome || undefined
      };

      if (onUpdateDados) {
        onUpdateDados(updatedDados);
      }

      setFormData(prev => ({
        ...prev,
        aluno: atleta1Id || '',
        atletas: atleta1Id ? [atleta1Id] : [],
        dadosEspecificos: {
          ...(prev.dadosEspecificos || {}),
          ...updatedDados
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

  const selectedGenero = dados.genero || (['Misto', 'Feminino', 'Masculino'].includes(formData.categoria) ? formData.categoria : '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. Gênero */}
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
          <option value="Misto">Misto</option>
          <option value="Feminino">Feminino</option>
          <option value="Masculino">Masculino</option>
        </select>
      </div>

      {/* 2. Individual ou em Dupla */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Individual ou em Dupla <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
        </label>
        <select
          className="form-select"
          value={isDupla ? 'Em Dupla' : 'Individual'}
          onChange={(e) => handleFormatoChange(e.target.value)}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600, height: '42px' }}
          required
        >
          <option value="Individual">Individual</option>
          <option value="Em Dupla">Em Dupla</option>
        </select>
      </div>

      {/* 3. Seleção de Atletas e Adversário conforme o formato escolhido */}
      {!isDupla ? (
        /* INDIVIDUAL: apenas um campo para nosso atleta e um campo para atleta adversário, lado a lado */
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
              Atleta <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
            </label>
            <select
              className="form-select"
              value={atleta1Id}
              onChange={(e) => handleSelectAtletaIndividual(e.target.value)}
              style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', height: '42px' }}
              required
            >
              <option value="">Selecione o atleta</option>
              {students.map(st => (
                <option key={st._id} value={st._id}>
                  {st.nome} {st.turma ? `(${st.turma})` : ''} {st.matricula ? `· ${st.matricula}` : ''}
                </option>
              ))}
              {atleta1Id && !students.some(s => s._id === atleta1Id) && (
                <option value={atleta1Id}>
                  {dados.atleta1Nome || dados.nomeAtleta || 'Atleta Selecionado'}
                </option>
              )}
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
              Atleta Adversário <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Digite o nome do atleta adversário"
              value={formData.equipeAdversaria || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, equipeAdversaria: e.target.value }))}
              style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', height: '42px' }}
              required
            />
          </div>
        </div>
      ) : (
        /* EM DUPLA: até dois atletas da nossa equipe lado a lado, e campo da dupla adversária independente */
        <>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
                1º Atleta <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={atleta1Id}
                onChange={(e) => handleSelectAtletaDupla(1, e.target.value)}
                style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', height: '42px' }}
              >
                <option value="">Selecione o 1º atleta</option>
                {students
                  .filter(st => st._id !== atleta2Id)
                  .map(st => (
                    <option key={st._id} value={st._id}>
                      {st.nome} {st.turma ? `(${st.turma})` : ''} {st.matricula ? `· ${st.matricula}` : ''}
                    </option>
                  ))}
                {atleta1Id && !students.some(s => s._id === atleta1Id) && (
                  <option value={atleta1Id}>
                    {dados.atleta1Nome || '1º Atleta Selecionado'}
                  </option>
                )}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
                2º Atleta <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>(opcional)</span>
              </label>
              <select
                className="form-select"
                value={atleta2Id}
                onChange={(e) => handleSelectAtletaDupla(2, e.target.value)}
                style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', height: '42px' }}
              >
                <option value="">Selecione o 2º atleta</option>
                {students
                  .filter(st => st._id !== atleta1Id)
                  .map(st => (
                    <option key={st._id} value={st._id}>
                      {st.nome} {st.turma ? `(${st.turma})` : ''} {st.matricula ? `· ${st.matricula}` : ''}
                    </option>
                  ))}
                {atleta2Id && !students.some(s => s._id === atleta2Id) && (
                  <option value={atleta2Id}>
                    {dados.atleta2Nome || '2º Atleta Selecionado'}
                  </option>
                )}
              </select>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
                Dupla Adversária <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite os nomes da dupla adversária"
                value={formData.equipeAdversaria || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, equipeAdversaria: e.target.value }))}
                style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', height: '42px' }}
                required
              />
            </div>
          </div>
        </>
      )}

      {/* 4. Resultado Final por Sets */}
      <div>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '8px', display: 'block' }}>
          Resultado Final por Sets <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
        </label>
        <select
          className="form-select"
          value={formData.resultado || ''}
          onChange={(e) => handleResultadoChange(e.target.value)}
          style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600, height: '42px' }}
          required
        >
          <option value="">Selecione o resultado</option>
          <option value="Vitória" disabled={setsAdv > setsNos}>Vitória</option>
          <option value="Derrota" disabled={setsNos > setsAdv}>Derrota</option>
        </select>
      </div>

      {/* 5. Placar dos Sets */}
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

      {/* 6. Observações do treinador */}
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
