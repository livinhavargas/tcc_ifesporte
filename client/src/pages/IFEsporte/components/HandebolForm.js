import React, { useState, useEffect } from 'react';

const HandebolForm = ({ formData, setFormData, handleInputChange, handleSubmit, students, setMensagem }) => {
  const [tipoAnalise, setTipoAnalise] = useState('');
  const [formInfo, setFormInfo] = useState({});

  useEffect(() => {
    setFormInfo(formData.respostas || {});
  }, [formData.respostas]);

  const handleSliderChange = (key, value) => {
    const val = Number(value);
    setFormInfo(prev => ({ ...prev, [key]: val }));
    setFormData(prev => ({
      ...prev,
      respostas: { ...prev.respostas, [key]: val }
    }));
  };

  const handleTipoChange = (e) => {
    setTipoAnalise(e.target.value);
    setFormInfo({});
    setFormData(prev => ({ ...prev, respostas: {} }));
  };

  const internalHandleSubmit = (e) => {
    e.preventDefault();
    if (!tipoAnalise) {
      setMensagem('Por favor, selecione o tipo de análise (Ex: Individual - Ataque).');
      return;
    }

    let diagnostico = '';
    if (tipoAnalise === 'Individual - Ataque') diagnostico = gerarDiagnosticoIndAtaque(formInfo);
    else if (tipoAnalise === 'Individual - Defesa') diagnostico = gerarDiagnosticoIndDefesa(formInfo);
    else if (tipoAnalise === 'Coletiva - Ataque') diagnostico = gerarDiagnosticoColAtaque(formInfo);
    else if (tipoAnalise === 'Coletiva - Defesa') diagnostico = gerarDiagnosticoColDefesa(formInfo);

    const tipoFinal = tipoAnalise.includes('Coletiva') ? 'Coletiva' : 'Individual';
    handleSubmit(e, diagnostico, tipoFinal);
  };

  const structures = {
    'Individual - Ataque': [
      { section: 'Arremessos', fields: [{ key: 'Ataque Ind - Precisao Arremessos', label: 'Precisão dos arremessos' }, { key: 'Ataque Ind - Potencia', label: 'Potência dos arremessos' }, { key: 'Ataque Ind - Momento', label: 'Escolha do momento para finalizar' }, { key: 'Ataque Ind - Variedade', label: 'Variedade dos tipos de arremesso' }, { key: 'Ataque Ind - Aproveitamento', label: 'Aproveitamento das oportunidades' }, { key: 'Ataque Ind - Controle Corporal', label: 'Controle corporal durante a finalização' }, { key: 'Ataque Ind - Pressao', label: 'Eficiência em situações de pressão' }] },
      { section: 'Passe e Construção', fields: [{ key: 'Ataque Ind - Precisao Passes', label: 'Precisão dos passes' }, { key: 'Ataque Ind - Velocidade Passes', label: 'Velocidade dos passes' }, { key: 'Ataque Ind - Passes Profundidade', label: 'Passes em profundidade' }, { key: 'Ataque Ind - Assistencias', label: 'Assistências' }, { key: 'Ataque Ind - Circulacao', label: 'Circulação da bola' }, { key: 'Ataque Ind - Visao', label: 'Visão de jogo' }, { key: 'Ataque Ind - Decisao Passe', label: 'Tomada de decisão' }] },
      { section: 'Drible e Progressão', fields: [{ key: 'Ataque Ind - Controle Bola', label: 'Controle da bola' }, { key: 'Ataque Ind - Dribles 1x1', label: 'Dribles em situações de um contra um' }, { key: 'Ataque Ind - Mudancas Direcao', label: 'Mudanças de direção' }, { key: 'Ataque Ind - Protecao Bola', label: 'Proteção da bola' }, { key: 'Ataque Ind - Progressao', label: 'Progressão ofensiva' }, { key: 'Ataque Ind - Romper Linhas', label: 'Capacidade de romper linhas defensivas' }] },
      { section: 'Movimentação sem a Bola', fields: [{ key: 'Ataque Ind - Desmarcacao', label: 'Desmarcação' }, { key: 'Ataque Ind - Ataque Espacos', label: 'Ataque aos espaços' }, { key: 'Ataque Ind - Ocupacao', label: 'Ocupação das zonas ofensivas' }, { key: 'Ataque Ind - Sincronizacao', label: 'Sincronização com os companheiros' }, { key: 'Ataque Ind - Superioridade', label: 'Movimentações para gerar superioridade numérica' }] },
      { section: 'Inteligência Ofensiva', fields: [{ key: 'Ataque Ind - Leitura Defesa', label: 'Leitura da defesa adversária' }, { key: 'Ataque Ind - Escolha Jogadas', label: 'Escolha das jogadas' }, { key: 'Ataque Ind - Tomada Decisao Ofensiva', label: 'Tomada de decisão' }, { key: 'Ataque Ind - Participacao Sistemas', label: 'Participação nos sistemas ofensivos' }, { key: 'Ataque Ind - Adaptacao', label: 'Adaptação às diferentes situações da partida' }] },
      { section: 'Transição Ofensiva', fields: [{ key: 'Ataque Ind - Reacao Recuperacao', label: 'Reação após recuperar a posse' }, { key: 'Ataque Ind - Velocidade Contra-ataque', label: 'Velocidade para iniciar contra-ataques' }, { key: 'Ataque Ind - Eficiencia Contra-ataque', label: 'Eficiência nos contra-ataques' }, { key: 'Ataque Ind - Aproveitamento Superioridade', label: 'Aproveitamento das situações de superioridade numérica' }] }
    ],
    'Individual - Defesa': [
      { section: 'Marcação Individual', fields: [{ key: 'Defesa Ind - Posicionamento', label: 'Posicionamento defensivo' }, { key: 'Defesa Ind - Postura Corporal', label: 'Postura corporal' }, { key: 'Defesa Ind - Controle Distancia', label: 'Controle da distância' }, { key: 'Defesa Ind - Eficiencia Marcacao', label: 'Eficiência na marcação' }, { key: 'Defesa Ind - Contencao', label: 'Contenção do adversário' }] },
      { section: 'Recuperação da Posse', fields: [{ key: 'Defesa Ind - Interceptacoes', label: 'Interceptações' }, { key: 'Defesa Ind - Recuperacoes Bola', label: 'Recuperações de bola' }, { key: 'Defesa Ind - Antecipacoes', label: 'Antecipações' }, { key: 'Defesa Ind - Desarmes', label: 'Desarmes' }, { key: 'Defesa Ind - Provocar Erros', label: 'Capacidade de provocar erros ofensivos' }] },
      { section: 'Contato Defensivo', fields: [{ key: 'Defesa Ind - Uso Corpo', label: 'Uso correto do corpo' }, { key: 'Defesa Ind - Controle Contato', label: 'Controle do contato físico' }, { key: 'Defesa Ind - Equilibrio', label: 'Equilíbrio' }, { key: 'Defesa Ind - Bloqueios Defensivos', label: 'Eficiência nos bloqueios defensivos' }, { key: 'Defesa Ind - Disciplina', label: 'Disciplina para evitar exclusões' }] },
      { section: 'Cobertura Defensiva', fields: [{ key: 'Defesa Ind - Cobertura Companheiros', label: 'Cobertura aos companheiros' }, { key: 'Defesa Ind - Fechamento Linhas', label: 'Fechamento das linhas de passe' }, { key: 'Defesa Ind - Trocas Marcacao', label: 'Trocas de marcação' }, { key: 'Defesa Ind - Ocupacao Espacos', label: 'Ocupação dos espaços defensivos' }] },
      { section: 'Inteligência Defensiva', fields: [{ key: 'Defesa Ind - Leitura Jogadas', label: 'Leitura das jogadas' }, { key: 'Defesa Ind - Antecipacao Jogadas', label: 'Antecipação' }, { key: 'Defesa Ind - Comunicacao', label: 'Comunicação' }, { key: 'Defesa Ind - Tomada Decisao', label: 'Tomada de decisão' }, { key: 'Defesa Ind - Disciplina Tatica', label: 'Disciplina tática' }] },
      { section: 'Transição Defensiva', fields: [{ key: 'Defesa Ind - Reacao Perda', label: 'Reação após perder a posse' }, { key: 'Defesa Ind - Recomposicao', label: 'Recomposição' }, { key: 'Defesa Ind - Retorno Defensivo', label: 'Retorno defensivo' }, { key: 'Defesa Ind - Contra-ataques Adversarios', label: 'Organização durante contra-ataques adversários' }] }
    ],
    'Coletiva - Ataque': [
      { section: 'Organização Ofensiva', fields: [{ key: 'Ataque Col - Circulacao Bola', label: 'Circulação da bola' }, { key: 'Ataque Col - Ritmo Ofensivo', label: 'Ritmo ofensivo' }, { key: 'Ataque Col - Amplitude', label: 'Amplitude' }, { key: 'Ataque Col - Profundidade', label: 'Profundidade' }, { key: 'Ataque Col - Ocupacao Espacos', label: 'Ocupação dos espaços' }, { key: 'Ataque Col - Comunicacao Ofensiva', label: 'Comunicação ofensiva' }] },
      { section: 'Sistemas Ofensivos', fields: [{ key: 'Ataque Col - Jogadas Ensaiadas', label: 'Execução das jogadas ensaiadas' }, { key: 'Ataque Col - Movimentacoes Coletivas', label: 'Movimentações coletivas' }, { key: 'Ataque Col - Cruzamentos', label: 'Cruzamentos' }, { key: 'Ataque Col - Bloqueios Ofensivos', label: 'Bloqueios ofensivos' }, { key: 'Ataque Col - Trocas Posicao', label: 'Trocas de posição' }, { key: 'Ataque Col - Sincronizacao', label: 'Sincronização da equipe' }] },
      { section: 'Criação de Oportunidades', fields: [{ key: 'Ataque Col - Qualidade Oportunidades', label: 'Qualidade das oportunidades criadas' }, { key: 'Ataque Col - Superioridade Numerica', label: 'Aproveitamento da superioridade numérica' }, { key: 'Ataque Col - Ultimo Passe', label: 'Eficiência no último passe' }, { key: 'Ataque Col - Romper Defesa', label: 'Capacidade de romper a defesa adversária' }] },
      { section: 'Finalizações', fields: [{ key: 'Ataque Col - Qualidade Arremessos', label: 'Qualidade dos arremessos' }, { key: 'Ataque Col - Aproveitamento Finalizacoes', label: 'Aproveitamento das finalizações' }, { key: 'Ataque Col - Variedade Finalizacoes', label: 'Variedade das finalizações' }, { key: 'Ataque Col - Eficiencia Ofensiva', label: 'Eficiência ofensiva coletiva' }] },
      { section: 'Contra-Ataques', fields: [{ key: 'Ataque Col - Velocidade Transicao', label: 'Velocidade da transição ofensiva' }, { key: 'Ataque Col - Organizacao Contra-ataques', label: 'Organização dos contra-ataques' }, { key: 'Ataque Col - Conversao Oportunidades', label: 'Conversão das oportunidades' }, { key: 'Ataque Col - Tomada Decisao', label: 'Tomada de decisão durante a transição' }] },
      { section: 'Inteligência Tática', fields: [{ key: 'Ataque Col - Cumprimento Sistema', label: 'Cumprimento do sistema ofensivo' }, { key: 'Ataque Col - Comunicacao', label: 'Comunicação' }, { key: 'Ataque Col - Sincronizacao Atletas', label: 'Sincronização entre os atletas' }, { key: 'Ataque Col - Adaptacao', label: 'Adaptação às mudanças da defesa adversária' }] }
    ],
    'Coletiva - Defesa': [
      { section: 'Organização Defensiva', fields: [{ key: 'Defesa Col - Compactacao', label: 'Compactação' }, { key: 'Defesa Col - Distancia Jogadores', label: 'Distância entre jogadores' }, { key: 'Defesa Col - Organizacao Sistema', label: 'Organização do sistema defensivo' }, { key: 'Defesa Col - Cobertura Setores', label: 'Cobertura entre setores' }] },
      { section: 'Sistemas Defensivos', fields: [{ key: 'Defesa Col - Eficiencia Sistema', label: 'Eficiência do sistema defensivo utilizado' }, { key: 'Defesa Col - Coordenacao Movimentacoes', label: 'Coordenação das movimentações' }, { key: 'Defesa Col - Trocas Marcacao', label: 'Trocas de marcação' }, { key: 'Defesa Col - Adaptacao', label: 'Adaptação às ações ofensivas adversárias' }] },
      { section: 'Pressão Defensiva', fields: [{ key: 'Defesa Col - Intensidade Marcacao', label: 'Intensidade da marcação' }, { key: 'Defesa Col - Pressao Portador', label: 'Pressão sobre o portador da bola' }, { key: 'Defesa Col - Recuperacao Posse', label: 'Recuperação da posse' }, { key: 'Defesa Col - Interceptacao Linhas', label: 'Interceptação das linhas de passe' }] },
      { section: 'Proteção da Área', fields: [{ key: 'Defesa Col - Fechamento Seis Metros', label: 'Fechamento da região dos seis metros' }, { key: 'Defesa Col - Contestacao Arremessos', label: 'Contestação dos arremessos' }, { key: 'Defesa Col - Cobertura Pivos', label: 'Cobertura dos pivôs' }, { key: 'Defesa Col - Jogadas Proximas', label: 'Defesa das jogadas próximas à área' }] },
      { section: 'Transição Defensiva', fields: [{ key: 'Defesa Col - Retorno Defensivo', label: 'Retorno defensivo' }, { key: 'Defesa Col - Organizacao Pos-perda', label: 'Organização após perda da posse' }, { key: 'Defesa Col - Contra-ataques', label: 'Defesa contra contra-ataques' }, { key: 'Defesa Col - Velocidade Recomposicao', label: 'Velocidade da recomposição' }] },
      { section: 'Comunicação e Organização', fields: [{ key: 'Defesa Col - Comunicacao', label: 'Comunicação entre os atletas' }, { key: 'Defesa Col - Lideranca', label: 'Liderança defensiva' }, { key: 'Defesa Col - Coordenacao Coletiva', label: 'Coordenação coletiva' }, { key: 'Defesa Col - Disciplina Tatica', label: 'Disciplina tática' }] }
    ]
  };

  const getMedia = (keys, info) => {
    let sum = 0;
    let count = 0;
    keys.forEach(k => {
      if (info[k]) {
        sum += info[k];
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : 'N/A';
  };

  const gerarDiagnosticoIndAtaque = (info) => {
    let text = "Desempenho Ofensivo no Handebol: ";
    const arremessos = Number(getMedia(['Ataque Ind - Precisao Arremessos', 'Ataque Ind - Momento', 'Ataque Ind - Aproveitamento'], info));
    if (arremessos >= 4) text += "O atleta demonstra alta qualidade nos arremessos, selecionando os momentos corretos para a finalização e gerando excelente conversão para a equipe. ";
    else if (arremessos <= 2) text += "Nota-se dificuldade e precipitação no momento de arremessar, forçando finalizações em situações adversas. ";
    else text += "Desempenho mediano nos arremessos, cumprindo o papel, mas passível de melhoria no momento da tomada de decisão. ";
    
    const criacao = Number(getMedia(['Ataque Ind - Precisao Passes', 'Ataque Ind - Assistencias', 'Ataque Ind - Visao'], info));
    if (criacao >= 4) text += "Apresenta excepcional visão de quadra e capacidade na distribuição de jogo. ";
    else if (criacao <= 2) text += "Dificuldade na criação e circulação de passes ofensivos rápidos. ";
    
    return text;
  };

  const gerarDiagnosticoIndDefesa = (info) => {
    let text = "Desempenho Defensivo no Handebol: ";
    const marcacao = Number(getMedia(['Defesa Ind - Posicionamento', 'Defesa Ind - Postura Corporal', 'Defesa Ind - Eficiencia Marcacao'], info));
    if (marcacao >= 4) text += "O atleta exibe postura corporal correta e posicionamento preciso nas flutuações da marcação. ";
    else if (marcacao <= 2) text += "Apresenta fragilidade no combate individual direto e tempo de reação tardio. ";
    
    return text;
  };

  const gerarDiagnosticoColAtaque = (info) => {
    let text = "Organização Ofensiva Coletiva (Handebol): ";
    const organizacao = Number(getMedia(['Ataque Col - Circulacao Bola', 'Ataque Col - Ritmo Ofensivo', 'Ataque Col - Ocupacao Espacos'], info));
    if (organizacao >= 4) text += "A equipe detém controle rítmico do ataque, circulando a bola com velocidade e aproveitando os pontas. ";
    else if (organizacao <= 2) text += "Falta agressividade coletiva. A bola circula de forma perimetral sem penetração. ";
    
    return text;
  };

  const gerarDiagnosticoColDefesa = (info) => {
    let text = "Solidez Defensiva Coletiva (Handebol): ";
    const compactacao = Number(getMedia(['Defesa Col - Compactacao', 'Defesa Col - Organizacao Sistema', 'Defesa Col - Fechamento Seis Metros'], info));
    if (compactacao >= 4) text += "Sistema defensivo bem coordenado, flutuando com excelente timing e anulando pivôs. ";
    else if (compactacao <= 2) text += "Defesa espaçada e sem cobertura central, permitindo infiltrações fáceis. ";
    
    return text;
  };

  const structure = structures[tipoAnalise] || [];

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font)',
    outline: 'none',
    transition: 'all var(--transition-fast)',
    background: 'var(--bg)',
    minHeight: '44px'
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-md)',
      padding: '32px',
      marginBottom: '32px'
    }}>
      <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '24px', fontSize: '1.0625rem' }}>
        Análise Técnica - Handebol
      </h5>
      
      <form onSubmit={internalHandleSubmit}>
        <div className="row g-3 mb-4" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '24px' }}>
          <div className="col-md-4">
            <label className="form-label text-muted small fw-bold">Tipo de Análise</label>
            <select className="form-select" value={tipoAnalise} onChange={handleTipoChange} required style={{ ...inputStyle, borderColor: 'var(--primary)', fontWeight: 600 }}>
              <option value="">Selecione...</option>
              <option value="Individual - Ataque">Análise Individual – Ataque</option>
              <option value="Individual - Defesa">Análise Individual – Defesa</option>
              <option value="Coletiva - Ataque">Análise Coletiva – Ataque</option>
              <option value="Coletiva - Defesa">Análise Coletiva – Defesa</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label text-muted small fw-bold">Data da Análise</label>
            <input type="date" className="form-control" name="data" value={formData.data} onChange={handleInputChange} required style={inputStyle} />
          </div>
          <div className="col-md-4">
            <label className="form-label text-muted small fw-bold">Aluno Avaliado</label>
            <select className="form-select" name="aluno" value={formData.aluno} onChange={handleInputChange} required style={inputStyle}>
              {students.length === 0 ? (
                <option value="">Nenhum atleta cadastrado.</option>
              ) : (
                <option value="">Selecione...</option>
              )}
              {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
            </select>
            {tipoAnalise.includes('Coletiva') && (
              <small style={{ color: 'var(--text-tertiary)', display: 'block', marginTop: '6px', fontSize: '0.75rem' }}>Nas análises coletivas, esta ficha ficará associada ao capitão/representante escolhido.</small>
            )}
          </div>
        </div>

        {tipoAnalise && (
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '24px' }}>Avalie de 1 a 5 cada um dos critérios abaixo relativos à modalidade de Handebol (1 = Insuficiente, 5 = Excelente).</p>

            {structure.map((sec, idx) => (
              <div key={idx} style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                border: '1px solid var(--border-light)',
                marginBottom: '20px'
              }}>
                <h6 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '16px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <i className="bi bi-record-circle me-2"></i>{sec.section}
                </h6>
                <div className="row g-4">
                  {sec.fields.map(field => (
                    <div key={field.key} className="col-md-6">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                        <label style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.8125rem' }}>{field.label}</label>
                        <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>{formInfo[field.key] || 3} / 5</span>
                      </div>
                      <input 
                        type="range" 
                        className="form-range" 
                        min="1" max="5" step="1" 
                        value={formInfo[field.key] || 3} 
                        onChange={(e) => handleSliderChange(field.key, e.target.value)} 
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        <span>Precisa Melhorar</span>
                        <span>Excelente</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginBottom: '24px' }}>
              <label className="form-label text-muted small fw-bold">Anotações Adicionais (Opcional)</label>
              <textarea className="form-control" name="observacoes" rows="2" value={formData.observacoes} onChange={handleInputChange} placeholder="Comentários extras sobre o posicionamento, agressividade, disciplina etc..." style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}></textarea>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                <i className="bi bi-magic me-2"></i> Gerar Relatório Técnico
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default HandebolForm;
