import React, { useState, useEffect } from 'react';

const FutebolForm = ({ formData, setFormData, handleInputChange, handleSubmit, students, setMensagem }) => {
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
    else if (tipoAnalise === 'Individual - Goleiro') diagnostico = gerarDiagnosticoGoleiro(formInfo);
    else if (tipoAnalise === 'Coletiva - Ataque') diagnostico = gerarDiagnosticoColAtaque(formInfo);
    else if (tipoAnalise === 'Coletiva - Defesa') diagnostico = gerarDiagnosticoColDefesa(formInfo);

    const tipoFinal = tipoAnalise.includes('Coletiva') ? 'Coletiva' : 'Individual';
    handleSubmit(e, diagnostico, tipoFinal);
  };

  const structures = {
    'Individual - Ataque': [
      { section: 'Finalização', fields: [{ key: 'Ataque Ind - Finalização', label: 'Qualidade da finalização' }, { key: 'Ataque Ind - Precisão Chutes', label: 'Precisão dos chutes' }, { key: 'Ataque Ind - Momento', label: 'Escolha do momento para finalizar' }, { key: 'Ataque Ind - Ambos Pés', label: 'Finalizações com ambos os pés' }, { key: 'Ataque Ind - Cabeça', label: 'Finalizações de cabeça' }, { key: 'Ataque Ind - Aproveitamento', label: 'Aproveitamento das oportunidades criadas' }, { key: 'Ataque Ind - Controle Corporal', label: 'Controle corporal durante a finalização' }] },
      { section: 'Condução e Drible', fields: [{ key: 'Ataque Ind - Controle Bola', label: 'Controle da bola' }, { key: 'Ataque Ind - Dribles 1x1', label: 'Dribles em situações de 1x1' }, { key: 'Ataque Ind - Mudança Direção', label: 'Mudanças de direção' }, { key: 'Ataque Ind - Proteção', label: 'Proteção da bola' }, { key: 'Ataque Ind - Velocidade', label: 'Progressão em velocidade' }, { key: 'Ataque Ind - Superar Marcação', label: 'Capacidade de superar a marcação' }] },
      { section: 'Passe e Criação', fields: [{ key: 'Ataque Ind - Qualidade Passe', label: 'Qualidade dos passes' }, { key: 'Ataque Ind - Precisão Passe', label: 'Precisão dos passes' }, { key: 'Ataque Ind - Passes Progressivos', label: 'Passes progressivos' }, { key: 'Ataque Ind - Passes Profundidade', label: 'Passes em profundidade' }, { key: 'Ataque Ind - Cruzamentos', label: 'Cruzamentos' }, { key: 'Ataque Ind - Assistências', label: 'Assistências' }, { key: 'Ataque Ind - Criação', label: 'Criação de oportunidades' }, { key: 'Ataque Ind - Visão', label: 'Visão de jogo' }] },
      { section: 'Movimentação sem a bola', fields: [{ key: 'Ataque Ind - Desmarcação', label: 'Desmarcação' }, { key: 'Ataque Ind - Ataque Espaços', label: 'Ataque aos espaços' }, { key: 'Ataque Ind - Temporização', label: 'Temporização das corridas' }, { key: 'Ataque Ind - Posicionamento', label: 'Posicionamento ofensivo' }, { key: 'Ataque Ind - Leitura Movimentações', label: 'Leitura das movimentações da equipe' }] },
      { section: 'Inteligência Ofensiva', fields: [{ key: 'Ataque Ind - Decisão', label: 'Tomada de decisão' }, { key: 'Ataque Ind - Escolha', label: 'Escolha das jogadas' }, { key: 'Ataque Ind - Leitura Defesa', label: 'Leitura da defesa adversária' }, { key: 'Ataque Ind - Participação Construção', label: 'Participação na construção ofensiva' }, { key: 'Ataque Ind - Adaptação', label: 'Adaptação às situações de jogo' }] },
      { section: 'Transição Ofensiva', fields: [{ key: 'Ataque Ind - Reação Recuperação', label: 'Reação após recuperar a posse' }, { key: 'Ataque Ind - Velocidade Contra-ataque', label: 'Velocidade para iniciar contra-ataques' }, { key: 'Ataque Ind - Participação Transições', label: 'Participação nas transições' }, { key: 'Ataque Ind - Eficiência Contra-ataque', label: 'Eficiência durante contra-ataques' }] }
    ],
    'Individual - Defesa': [
      { section: 'Marcação Individual', fields: [{ key: 'Defesa Ind - Posicionamento', label: 'Posicionamento' }, { key: 'Defesa Ind - Distância', label: 'Distância em relação ao adversário' }, { key: 'Defesa Ind - Tempo Abordagem', label: 'Tempo de abordagem' }, { key: 'Defesa Ind - Controle Espaço', label: 'Controle do espaço' }, { key: 'Defesa Ind - Eficiência Marcação', label: 'Eficiência na marcação' }] },
      { section: 'Recuperação da Posse', fields: [{ key: 'Defesa Ind - Desarmes', label: 'Desarmes' }, { key: 'Defesa Ind - Interceptações', label: 'Interceptações' }, { key: 'Defesa Ind - Antecipações', label: 'Antecipações' }, { key: 'Defesa Ind - Recuperações', label: 'Recuperações da posse' }, { key: 'Defesa Ind - Pressão', label: 'Pressão exercida' }] },
      { section: 'Duelos', fields: [{ key: 'Defesa Ind - Duelos Terrestres', label: 'Duelos terrestres' }, { key: 'Defesa Ind - Duelos Aéreos', label: 'Duelos aéreos' }, { key: 'Defesa Ind - Disputas Físicas', label: 'Disputas físicas' }, { key: 'Defesa Ind - Tempo Reação', label: 'Tempo de reação' }] },
      { section: 'Cobertura Defensiva', fields: [{ key: 'Defesa Ind - Cobertura', label: 'Cobertura aos companheiros' }, { key: 'Defesa Ind - Reposição', label: 'Reposição defensiva' }, { key: 'Defesa Ind - Compactação', label: 'Compactação' }, { key: 'Defesa Ind - Ocupação', label: 'Ocupação dos espaços' }] },
      { section: 'Inteligência Defensiva', fields: [{ key: 'Defesa Ind - Leitura', label: 'Leitura do jogo' }, { key: 'Defesa Ind - Antecipação Jogadas', label: 'Antecipação das jogadas' }, { key: 'Defesa Ind - Comunicação', label: 'Comunicação' }, { key: 'Defesa Ind - Decisão', label: 'Tomada de decisão' }, { key: 'Defesa Ind - Organização', label: 'Organização defensiva' }] },
      { section: 'Transição Defensiva', fields: [{ key: 'Defesa Ind - Reação Perda', label: 'Reação após perder a posse' }, { key: 'Defesa Ind - Velocidade Recomposição', label: 'Velocidade de recomposição' }, { key: 'Defesa Ind - Recuperação Posição', label: 'Recuperação da posição' }, { key: 'Defesa Ind - Contra-ataques Adversários', label: 'Organização durante contra-ataques adversários' }] }
    ],
    'Individual - Goleiro': [
      { section: 'Defesa das Finalizações', fields: [{ key: 'Goleiro - Posicionamento', label: 'Posicionamento' }, { key: 'Goleiro - Reflexo', label: 'Reflexo' }, { key: 'Goleiro - Tempo Reação', label: 'Tempo de reação' }, { key: 'Goleiro - Chutes Rasteiros', label: 'Defesa de chutes rasteiros' }, { key: 'Goleiro - Chutes Altos', label: 'Defesa de chutes altos' }, { key: 'Goleiro - Um contra Um', label: 'Defesa em situações de 1x1' }, { key: 'Goleiro - Consistência', label: 'Consistência das defesas' }] },
      { section: 'Jogo Aéreo', fields: [{ key: 'Goleiro - Cruzamentos', label: 'Saídas em cruzamentos' }, { key: 'Goleiro - Segurança', label: 'Segurança nas bolas altas' }, { key: 'Goleiro - Tempo Saída', label: 'Tempo da saída' }, { key: 'Goleiro - Domínio Área', label: 'Domínio da área' }] },
      { section: 'Distribuição da Bola', fields: [{ key: 'Goleiro - Reposição Mãos', label: 'Reposições com as mãos' }, { key: 'Goleiro - Reposição Pés', label: 'Reposições com os pés' }, { key: 'Goleiro - Precisão Lançamentos', label: 'Precisão dos lançamentos' }, { key: 'Goleiro - Participação Construção', label: 'Participação na construção' }, { key: 'Goleiro - Velocidade Reiniciar', label: 'Velocidade para reiniciar o jogo' }] },
      { section: 'Participação Tática', fields: [{ key: 'Goleiro - Cobertura Linha', label: 'Cobertura da última linha' }, { key: 'Goleiro - Goleiro-Líbero', label: 'Atuação como goleiro-líbero' }, { key: 'Goleiro - Posicionamento Fora', label: 'Posicionamento fora da área' }, { key: 'Goleiro - Leitura Jogadas', label: 'Leitura das jogadas' }] },
      { section: 'Comunicação', fields: [{ key: 'Goleiro - Organização', label: 'Organização da defesa' }, { key: 'Goleiro - Orientação', label: 'Orientação aos companheiros' }, { key: 'Goleiro - Liderança', label: 'Liderança' }, { key: 'Goleiro - Bolas Paradas', label: 'Comunicação durante bolas paradas' }] },
      { section: 'Inteligência de Jogo', fields: [{ key: 'Goleiro - Decisão', label: 'Tomada de decisão' }, { key: 'Goleiro - Momento Saída', label: 'Escolha do momento para sair do gol' }, { key: 'Goleiro - Controle Emocional', label: 'Controle emocional' }, { key: 'Goleiro - Regularidade', label: 'Regularidade na partida' }] }
    ],
    'Coletiva - Ataque': [
      { section: 'Organização Ofensiva', fields: [{ key: 'Ataque Col - Construção Defesa', label: 'Construção desde a defesa' }, { key: 'Ataque Col - Circulação', label: 'Circulação da bola' }, { key: 'Ataque Col - Posse', label: 'Posse de bola' }, { key: 'Ataque Col - Ocupação Espaços', label: 'Ocupação dos espaços' }, { key: 'Ataque Col - Amplitude', label: 'Amplitude' }, { key: 'Ataque Col - Profundidade', label: 'Profundidade' }, { key: 'Ataque Col - Mobilidade', label: 'Mobilidade ofensiva' }] },
      { section: 'Construção das Jogadas', fields: [{ key: 'Ataque Col - Sequência Passes', label: 'Sequência de passes' }, { key: 'Ataque Col - Triangulações', label: 'Qualidade das triangulações' }, { key: 'Ataque Col - Inversões', label: 'Inversões de jogo' }, { key: 'Ataque Col - Progressão Linhas', label: 'Progressão entre linhas' }, { key: 'Ataque Col - Jogadas Trabalhadas', label: 'Eficiência das jogadas trabalhadas' }] },
      { section: 'Criação de Oportunidades', fields: [{ key: 'Ataque Col - Chances Claras', label: 'Criação de chances claras' }, { key: 'Ataque Col - Cruzamentos', label: 'Cruzamentos' }, { key: 'Ataque Col - Passes Decisivos', label: 'Passes decisivos' }, { key: 'Ataque Col - Terço Final', label: 'Aproveitamento do último terço' }, { key: 'Ataque Col - Decisões', label: 'Qualidade das decisões ofensivas' }] },
      { section: 'Finalização', fields: [{ key: 'Ataque Col - Qualidade Finalização', label: 'Qualidade das finalizações' }, { key: 'Ataque Col - Eficiência', label: 'Eficiência ofensiva' }, { key: 'Ataque Col - Aproveitamento', label: 'Aproveitamento das oportunidades' }, { key: 'Ataque Col - Variedade', label: 'Variedade das formas de finalização' }] },
      { section: 'Transição Ofensiva', fields: [{ key: 'Ataque Col - Velocidade Contra-ataques', label: 'Velocidade dos contra-ataques' }, { key: 'Ataque Col - Organização Transição', label: 'Organização durante a transição' }, { key: 'Ataque Col - Eficiência Transição', label: 'Eficiência das transições' }, { key: 'Ataque Col - Superioridade Numérica', label: 'Aproveitamento da superioridade' }] },
      { section: 'Inteligência Tática', fields: [{ key: 'Ataque Col - Cumprimento Modelo', label: 'Cumprimento do modelo de jogo' }, { key: 'Ataque Col - Sincronização Setores', label: 'Sincronização entre setores' }, { key: 'Ataque Col - Comunicação', label: 'Comunicação' }, { key: 'Ataque Col - Decisão Coletiva', label: 'Tomada de decisão coletiva' }] }
    ],
    'Coletiva - Defesa': [
      { section: 'Organização Defensiva', fields: [{ key: 'Defesa Col - Compactação', label: 'Compactação' }, { key: 'Defesa Col - Distância Linhas', label: 'Distância entre linhas' }, { key: 'Defesa Col - Organização Bloco', label: 'Organização do bloco defensivo' }, { key: 'Defesa Col - Cobertura Setores', label: 'Cobertura entre setores' }] },
      { section: 'Pressão', fields: [{ key: 'Defesa Col - Pressão Saída', label: 'Pressão na saída de bola' }, { key: 'Defesa Col - Coordenação Pressão', label: 'Coordenação da pressão' }, { key: 'Defesa Col - Intensidade', label: 'Intensidade da marcação' }, { key: 'Defesa Col - Eficiência Recuperação', label: 'Eficiência da recuperação da posse' }] },
      { section: 'Cobertura', fields: [{ key: 'Defesa Col - Coberturas Defensivas', label: 'Coberturas defensivas' }, { key: 'Defesa Col - Trocas Marcação', label: 'Trocas de marcação' }, { key: 'Defesa Col - Ajuda Defensiva', label: 'Ajuda defensiva' }, { key: 'Defesa Col - Proteção Espaços', label: 'Proteção dos espaços' }] },
      { section: 'Defesa da Área', fields: [{ key: 'Defesa Col - Cruzamentos', label: 'Defesa dos cruzamentos' }, { key: 'Defesa Col - Marcação Área', label: 'Marcação dentro da área' }, { key: 'Defesa Col - Bolas Paradas', label: 'Defesa em bolas paradas' }, { key: 'Defesa Col - Segundas Bolas', label: 'Controle das segundas bolas' }] },
      { section: 'Transição Defensiva', fields: [{ key: 'Defesa Col - Reação Perda', label: 'Reação imediata após perder a posse' }, { key: 'Defesa Col - Recomposição', label: 'Recomposição' }, { key: 'Defesa Col - Contra-ataques', label: 'Organização contra contra-ataques' }, { key: 'Defesa Col - Recuperação Estrutura', label: 'Recuperação da estrutura defensiva' }] },
      { section: 'Comunicação e Organização', fields: [{ key: 'Defesa Col - Comunicação', label: 'Comunicação entre os atletas' }, { key: 'Defesa Col - Liderança', label: 'Liderança defensiva' }, { key: 'Defesa Col - Coordenação Movimentos', label: 'Coordenação dos movimentos' }, { key: 'Defesa Col - Disciplina Tática', label: 'Disciplina tática' }] }
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
    let text = "Desempenho Ofensivo: ";
    const mediaAprov = Number(getMedia(['Ataque Ind - Aproveitamento', 'Ataque Ind - Momento', 'Ataque Ind - Precisão Chutes'], info));
    if (mediaAprov >= 4) text += "O atleta demonstra um nível técnico excepcional na finalização, sendo letal em suas decisões e apresentando ótimo aproveitamento das oportunidades criadas. ";
    else if (mediaAprov <= 2) text += "O atleta encontra dificuldades severas no aproveitamento de oportunidades, forçando finalizações de baixa probabilidade ou demonstrando instabilidade no momento de concluir. ";
    else text += "O atleta apresenta um índice razoável de conclusão de jogadas, mas há espaço para aprimoramento na precisão e tomada de decisão. ";
    
    const criacao = Number(getMedia(['Ataque Ind - Visão', 'Ataque Ind - Criação', 'Ataque Ind - Passes Progressivos'], info));
    if (criacao >= 4) text += "Atua não apenas como finalizador, mas participa ativamente e com alta qualidade da construção ofensiva da equipe, distribuindo passes em profundidade com grande visão de jogo. ";
    else if (criacao <= 2) text += "Sua participação na construção é passiva, atuando mais como finalizador isolado do que como criador. ";
    
    const movimentacao = Number(getMedia(['Ataque Ind - Desmarcação', 'Ataque Ind - Ataque Espaços'], info));
    if (movimentacao >= 4) text += "Sua leitura de espaços e temporização de corridas são excelentes, criando linhas de passe frequentemente. ";
    
    return text;
  };

  const gerarDiagnosticoIndDefesa = (info) => {
    let text = "Desempenho Defensivo: ";
    const pressao = Number(getMedia(['Defesa Ind - Desarmes', 'Defesa Ind - Pressão', 'Defesa Ind - Interceptações'], info));
    if (pressao >= 4) text += "Jogador demonstra altíssima capacidade de pressionar e recuperar a posse, antecipando jogadas com segurança técnica. ";
    else if (pressao <= 2) text += "Deficiente na recuperação da posse, perdendo o tempo de abordagem com certa facilidade. ";
    else text += "Desempenho mediano em desarmes e pressão, cumprindo as exigências básicas mas sem imposição. ";
    
    const duelos = Number(getMedia(['Defesa Ind - Duelos Terrestres', 'Defesa Ind - Duelos Aéreos', 'Defesa Ind - Disputas Físicas'], info));
    if (duelos >= 4) text += "Vence a imensa maioria dos embates físicos, oferecendo excelente segurança para o sistema. ";
    else if (duelos <= 2) text += "Fragilidade notável nos duelos físicos, sendo superado com facilidade pelos atacantes. ";
    
    const transicao = Number(getMedia(['Defesa Ind - Reação Perda', 'Defesa Ind - Velocidade Recomposição'], info));
    if (transicao <= 2) text += "Transição defensiva lenta: o atleta demora muito a reagir após a perda da bola. ";
    
    return text;
  };

  const gerarDiagnosticoGoleiro = (info) => {
    let text = "Avaliação do Goleiro: ";
    const defesa = Number(getMedia(['Goleiro - Reflexo', 'Goleiro - Consistência', 'Goleiro - Chutes Rasteiros', 'Goleiro - Um contra Um'], info));
    if (defesa >= 4) text += "Apresenta reflexos extremamente apurados, defendendo com máxima consistência em situações de alta complexidade. ";
    else if (defesa <= 2) text += "Demonstrou vulnerabilidade técnica e instabilidade no tempo de reação das defesas primárias. ";
    else text += "Sua capacidade de proteção do gol é condizente com a média, com algumas inconsistências pontuais. ";
    
    const aereo = Number(getMedia(['Goleiro - Cruzamentos', 'Goleiro - Domínio Área', 'Goleiro - Segurança'], info));
    if (aereo >= 4) text += "Domina completamente sua grande área nas disputas de bolas altas, com tempos de saída corretíssimos. ";
    else if (aereo <= 2) text += "Saídas precipitadas ou ausência de imposição no jogo aéreo, cedendo segundas bolas perigosas. ";
    
    const participacao = Number(getMedia(['Goleiro - Participação Construção', 'Goleiro - Goleiro-Líbero', 'Goleiro - Cobertura Linha'], info));
    if (participacao >= 4) text += "Perfil moderno e altamente participativo, sustentando a construção ofensiva e agindo impecavelmente como líbero na cobertura da zaga. ";
    else if (participacao <= 2) text += "Perfil quase que inteiramente reativo. Fica restrito a defender a própria meta, com baixa ou nenhuma participação construtiva ou leitura de profundidade defensiva. ";
    
    return text;
  };

  const gerarDiagnosticoColAtaque = (info) => {
    let text = "Organização Ofensiva (Equipe): ";
    const organizacao = Number(getMedia(['Ataque Col - Circulação', 'Ataque Col - Ocupação Espaços', 'Ataque Col - Amplitude'], info));
    if (organizacao >= 4) text += "A equipe demonstra profunda maturidade tática. Ocupa perfeitamente os espaços em amplitude, não dependendo de individualidades, mas sim de uma forte circulação coletiva. ";
    else if (organizacao <= 2) text += "O time é excessivamente dependente de jogadas individuais e lances isolados, com desorganização gritante na circulação do passe. ";
    else text += "Organização funcional, mas por vezes apresenta estagnação na circulação da bola ou espaçamentos errôneos. ";
    
    const finalizacao = Number(getMedia(['Ataque Col - Chances Claras', 'Ataque Col - Eficiência', 'Ataque Col - Aproveitamento'], info));
    if (finalizacao >= 4) text += "O aproveitamento no último terço é letal, e a equipe consegue agredir as defesas por meio de infiltrações de grande qualidade. ";
    else if (finalizacao <= 2) text += "Extrema dificuldade de furar blocos e um pífio aproveitamento de conversão nos poucos lances que cria. A equipe é inofensiva na área. ";
    
    text += "\n\nRecomendações: ";
    if (organizacao <= 3) text += "Treinos táticos de manutenção de posse com foco em ocupação de corredores laterais e zonas interiores simultaneamente (Jogo de Posição). ";
    if (finalizacao <= 3) text += "Criar dinâmicas de finalizações após progressão por zonas com número de toques limitados para forçar o instinto coletivo. ";
    
    return text;
  };

  const gerarDiagnosticoColDefesa = (info) => {
    let text = "Solidez Defensiva (Equipe): ";
    const compactacao = Number(getMedia(['Defesa Col - Compactação', 'Defesa Col - Distância Linhas', 'Defesa Col - Organização Bloco'], info));
    if (compactacao >= 4) text += "A equipe ostenta um bloco defensivo quase impenetrável. A distância entre as linhas é muito enxuta e a cobertura entre os setores funcionou com excelência tática. ";
    else if (compactacao <= 2) text += "Apresenta graves fraturas estruturais. O time fica excessivamente espaçado, expondo os setores e permitindo passes verticais pelo miolo do campo facilmente. ";
    else text += "O comportamento de bloco é aceitável, contudo sofre pontualmente com perdas de cobertura e distanciamento exagerado em momentos de desatenção. ";
    
    const pressao = Number(getMedia(['Defesa Col - Pressão Saída', 'Defesa Col - Intensidade', 'Defesa Col - Eficiência Recuperação'], info));
    if (pressao >= 4) text += "Notável intensidade nos gatilhos de pressão, desarmando o adversário no campo de ataque corriqueiramente. ";
    else if (pressao <= 2) text += "Baixíssima intensidade na pressão. O adversário encontra extrema facilidade e tempo para organizar sua construção desde trás. ";
    
    const transicao = Number(getMedia(['Defesa Col - Reação Perda', 'Defesa Col - Recomposição'], info));
    if (transicao <= 2) text += "Pânico na recomposição: falhas gigantescas de recomposição foram observadas na transição defensiva. ";
    
    text += "\n\nRecomendações: ";
    if (compactacao <= 3) text += "Exercícios em meio-campo (caixas demarcadas) para treinar movimentação sincronizada da linha de 4 e volantes (efeito sanfona/basculação). ";
    if (pressao <= 3) text += "Adotar jogos reduzidos de perde-pressiona imediatos para incentivar a agressividade após perda da posse (regras de desarme em até 3s). ";
    
    return text;
  };

  const structure = structures[tipoAnalise] || [];

  return (
    <div className="card-flat shadow-sm border p-4 bg-white border-top border-4 border-orange">
      <h5 className="fw-bold mb-4 text-blue-dark">Análise Técnica - Futebol Profissional</h5>
      
      <form onSubmit={internalHandleSubmit}>
        <div className="row g-3 mb-4 border-bottom pb-4">
          <div className="col-md-4">
            <label className="form-label fw-bold small text-muted">Tipo de Análise</label>
            <select className="form-select bg-light border-orange text-blue-dark fw-bold" value={tipoAnalise} onChange={handleTipoChange} required>
              <option value="">Selecione...</option>
              <option value="Individual - Ataque">Análise Individual – Ataque</option>
              <option value="Individual - Defesa">Análise Individual – Defesa</option>
              <option value="Individual - Goleiro">Análise Individual – Goleiro</option>
              <option value="Coletiva - Ataque">Análise Coletiva – Ataque</option>
              <option value="Coletiva - Defesa">Análise Coletiva – Defesa</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold small text-muted">Data da Análise</label>
            <input type="date" className="form-control bg-light" name="data" value={formData.data} onChange={handleInputChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold small text-muted">Aluno(s) Avaliado(s) / Equipe</label>
            <select className="form-select bg-light" name="aluno" value={formData.aluno} onChange={handleInputChange} required>
              {students.length === 0 ? (
                <option value="">Nenhum atleta cadastrado.</option>
              ) : (
                <option value="">Selecione...</option>
              )}
              {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
            </select>
            {tipoAnalise.includes('Coletiva') && (
              <small className="text-muted mt-1 d-block">Nas análises coletivas, esta ficha ficará ancorada no capitão/representante selecionado.</small>
            )}
          </div>
        </div>

        {tipoAnalise && (
          <div className="mt-4 p-0">
            <p className="small text-muted mb-4">Avalie de 1 a 5 cada um dos critérios abaixo (1 = Insuficiente, 5 = Excelente).</p>

            {structure.map((sec, idx) => (
              <div key={idx} className="bg-light p-4 rounded-4 mb-4 border">
                <h6 className="fw-bold text-orange mb-3 border-bottom pb-2"><i className="bi bi-record-circle me-2"></i>{sec.section}</h6>
                <div className="row g-4">
                  {sec.fields.map(field => (
                    <div key={field.key} className="col-md-6">
                      <div className="d-flex justify-content-between mb-1">
                        <label className="fw-bold text-blue-dark">{field.label}</label>
                        <span className="badge bg-blue-dark text-white fw-bold">{formInfo[field.key] || 3} / 5</span>
                      </div>
                      <input 
                        type="range" 
                        className="form-range" 
                        min="1" max="5" step="1" 
                        value={formInfo[field.key] || 3} 
                        onChange={(e) => handleSliderChange(field.key, e.target.value)} 
                      />
                      <div className="d-flex justify-content-between small text-muted">
                        <span>Precisa Melhorar</span>
                        <span>Excelente</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="mb-4 pt-3 border-top">
              <label className="form-label fw-bold small text-muted">Anotações Adicionais (Opcional)</label>
              <textarea className="form-control bg-white" name="observacoes" rows="2" value={formData.observacoes} onChange={handleInputChange} placeholder="Comentários extras sobre o desempenho tático, físico ou emocional..."></textarea>
            </div>
            
            <div className="row mt-4">
              <div className="col-12 text-end">
                <button type="submit" className="btn btn-orange px-5 py-2 fw-bold rounded-pill text-white shadow-sm">
                  <i className="bi bi-magic me-2"></i> Gerar Relatório Técnico
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default FutebolForm;
