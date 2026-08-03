export const generateSmartCronograma = (modalidade, dataInicioStr, dataFimStr, competicaoAlvoStr, frequencia, incluirTransicao) => {
  const dInicio = new Date(`${dataInicioStr}T00:00:00`);
  const dFim = new Date(`${dataFimStr}T00:00:00`);
  const dAlvo = new Date(`${competicaoAlvoStr}T00:00:00`);

  const totalDays = (dFim - dInicio) / (1000 * 3600 * 24);
  const totalWeeks = Math.ceil(totalDays / 7) || 1;

  // Distribuição Inteligente das Fases
  let pPrep = 0.4, pComp = 0.5, pTrans = 0.1;
  
  if (!incluirTransicao) {
    if (totalWeeks < 8) {
      pPrep = 0.4; pComp = 0.6; pTrans = 0;
    } else {
      pPrep = 0.5; pComp = 0.5; pTrans = 0;
    }
  } else {
    if (totalWeeks < 8) {
      pPrep = 0.3; pComp = 0.6; pTrans = 0.1;
    } else if (totalWeeks > 16) {
      pPrep = 0.5; pComp = 0.4; pTrans = 0.1;
    }
  }

  // Ajuste do tempo caso não haja transição
  let actualDays = totalDays;
  if (!incluirTransicao) {
    actualDays = (dAlvo - dInicio) / (1000 * 3600 * 24);
  }

  const prepDays = Math.floor(actualDays * pPrep);
  const compDays = Math.floor(actualDays * pComp);

  const fimPrep = new Date(dInicio.getTime() + (prepDays * 24 * 3600 * 1000));
  const inicioComp = new Date(fimPrep.getTime() + (24 * 3600 * 1000));
  let fimComp = new Date(dAlvo.getTime()); // Termina na competição
  
  if (!incluirTransicao && fimComp < dFim) {
      fimComp = new Date(dFim.getTime()); // Ajuste final se necessário
  }

  const inicioTrans = new Date(fimComp.getTime() + (24 * 3600 * 1000));

  // Geração das datas dos treinos
  const generateTreinos = (start, end, typeStr) => {
    let treinos = [];
    let current = new Date(start);
    const allowed = [];
    if (frequencia >= 1) allowed.push(1); // Seg
    if (frequencia >= 2) allowed.push(3); // Qua
    if (frequencia >= 3) allowed.push(5); // Sex
    if (frequencia >= 4) allowed.push(2); // Ter
    if (frequencia >= 5) allowed.push(4); // Qui
    if (frequencia >= 6) allowed.push(6); // Sab
    if (frequencia >= 7) allowed.push(0); // Dom

    while (current <= end) {
      if (allowed.includes(current.getDay())) {
        treinos.push({ data: current.toISOString(), tipo: typeStr });
      }
      current.setDate(current.getDate() + 1);
    }
    return treinos;
  };

  const treinosPrep = generateTreinos(dInicio, fimPrep, 'Físico/Técnico');
  const treinosComp = generateTreinos(inicioComp, fimComp, 'Tático/Simulação');
  let treinosTrans = [];
  if (incluirTransicao) {
    treinosTrans = generateTreinos(inicioTrans, dFim, 'Recuperativo');
  }

  // Dicionários Esportivos Inteligentes
  const getConteudo = (tipoFase, isLongo) => {
    const mod = (modalidade || '').toLowerCase();
    
    // Handebol
    if (mod.includes('handebol')) {
      if (tipoFase === 'Preparatória') return `Objetivo: Construção da base aeróbica e força específica para o Handebol, focando em saltos e arremessos.
Focos Principais: Passes curtos, movimentação sem bola, defesas 6x0 e 5x1 básicas.
Capacidades Físicas: Resistência cardiovascular, explosão muscular (pernas/braços).
Técnica: Arremessos de apoio e suspensão, fintas, bloqueios defensivos.
${isLongo ? 'Foco estendido no aprimoramento individual de cada atleta e ganho de massa magra.' : 'Abordagem intensiva devido ao curto período.'}`;
      
      if (tipoFase === 'Competitiva') return `Objetivo: Pico de performance tática e velocidade de jogo visando a competição.
Ênfase Tática: Transições ofensivas rápidas, contra-ataques diretos, sincronia na defesa 5x1 e 3x2x1.
Situações Reais: Treinamentos em superioridade e inferioridade numérica, tiros de 7 metros.
Aspectos Psicológicos: Tomada de decisão rápida, controle emocional em placares apertados.`;
      
      return `Objetivo: Recuperação ativa pós-competição.
Focos: Jogos recreativos, prevenção de lesões em ombros e joelhos.
Controle de Carga: Volume baixo, intensidade mínima.`;
    }

    // Futsal
    if (mod.includes('futsal')) {
      if (tipoFase === 'Preparatória') return `Objetivo: Condicionamento aeróbico/anaeróbico e aperfeiçoamento dos fundamentos do Futsal.
Focos Principais: Passes rápidos, controle de sola, finalizações de média distância, marcação individual e zona.
Capacidades Físicas: Agilidade, resistência de velocidade, tempo de reação.
Técnica: Domínio orientado, passes paralelos e diagonais, cobertura defensiva.
${isLongo ? 'Período longo focado em hipertrofia e fortalecimento do core e articulações.' : 'Preparação compacta com foco em resistência de quadra.'}`;
      
      if (tipoFase === 'Competitiva') return `Objetivo: Refinamento do sistema de jogo e jogadas ensaiadas.
Ênfase Tática: Posse de bola sob pressão, movimentação do Pivô, goleiro linha, saída de pressão.
Situações Reais: Treino de bolas paradas (escanteios, faltas e laterais), transição defesa-ataque rápida.
Aspectos Psicológicos: Comunicação em quadra, foco defensivo, confiança na finalização.`;
      
      return `Objetivo: Descanso ativo muscular e recuperação neurológica.
Focos: Alongamento profundo, treinos leves, recreação com esportes complementares.
Controle de Carga: Evitar treinos com bola intensos, focar na recuperação de tornozelos e joelhos.`;
    }

    // Atletismo
    if (mod.includes('atletismo')) {
        if (tipoFase === 'Preparatória') return `Objetivo: Base cardiorrespiratória e correção de biomecânica.
Focos Principais: Técnica de corrida, respiração, coordenação intra e intermuscular.
Capacidades Físicas: Resistência aeróbica, força máxima, flexibilidade.
Técnica: Educativos de corrida (Skiping, Anfersen, Hop), posicionamento de largada.
${isLongo ? 'Acúmulo de grande volume de treinamento (quilometragem/repetições).' : 'Manutenção rápida da base e ajuste biomecânico intensivo.'}`;
        
        if (tipoFase === 'Competitiva') return `Objetivo: Polimento (Tapering) e alcance do pico de velocidade/explosão.
Ênfase Tática: Controle de ritmo (Pacing), estratégia de prova, aceleração.
Situações Reais: Tiros na distância específica da prova com descanso simulando eliminatórias.
Aspectos Psicológicos: Visualização da prova, foco, controle da ansiedade de largada.`;
        
        return `Objetivo: Regeneração profunda e reavaliação física.
Focos: Terapias manuais, liberação miofascial, corridas muito leves.
Controle de Carga: Volume e intensidade extremamente reduzidos.`;
    }

    // Vôlei
    if (mod.includes('vôlei') || mod.includes('volei')) {
      if (tipoFase === 'Preparatória') return `Objetivo: Desenvolvimento físico global, focado em impulsão vertical e tempo de bola.
Focos Principais: Saque, recepção, manchete, toque por cima, bloqueios individuais.
Capacidades Físicas: Potência elástica, resistência de saltos, agilidade lateral.
Técnica: Passadas de ataque, posicionamento corporal na defesa.
${isLongo ? 'Trabalho intenso de musculação focada em membros inferiores e core.' : 'Adaptação rápida à quadra com saltos controlados.'}`;
      
      if (tipoFase === 'Competitiva') return `Objetivo: Sincronização do sistema ofensivo/defensivo e consistência.
Ênfase Tática: Cobertura de ataque, variações de levantamento, sistemas de recepção e leitura de bloqueio.
Situações Reais: Jogos-treino com placar reduzido, treino de saque sob pressão, contra-ataque.
Aspectos Psicológicos: Resiliência em sequências de pontos perdidos, agressividade no saque.`;
      
      return `Objetivo: Recuperação muscular e articular, especialmente ombros e joelhos.
Focos: Fortalecimento estabilizador, gelo, alongamento e descanso mental.
Controle de Carga: Sessões curtas sem impacto articular (sem saltos).`;
    }

    // Genérico
    if (tipoFase === 'Preparatória') return `Objetivo: Elevar o condicionamento físico geral, resistência aeróbica e força. 
Principais Focos: Aprimoramento da técnica básica, fundamentos e postura. 
Capacidades Físicas Trabalhadas: Força de base, flexibilidade, mobilidade e resistência.
${isLongo ? 'Volume de treino alto e intensidade progressiva.' : 'Volume adaptado ao pouco tempo antes da competição.'}`;

    if (tipoFase === 'Competitiva') return `Objetivo: Atingir o pico de performance, redução do volume e aumento da intensidade.
Ênfase Tática: Simulação de situações de jogo/prova, tomadas de decisão sob pressão.
Preparação para Competição: Ajuste de estratégias, estudo dos adversários e foco psicológico máximo.`;

    return `Objetivo: Recuperação e reparação de danos teciduais.
Descrição: Momento de redução drástica de carga.
Prevenção de Lesões: Fisioterapia preventiva, liberação miofascial e planejamento da próxima temporada.`;
  };

  const isLongo = totalWeeks > 12;

  const fases = [
    {
      nome: 'Preparatória',
      dataInicio: dInicio.toISOString(),
      dataFim: fimPrep.toISOString(),
      objetivo: getConteudo('Preparatória', isLongo),
      semanas: Math.ceil(prepDays / 7) || 1,
      treinos: treinosPrep
    },
    {
      nome: 'Competitiva',
      dataInicio: inicioComp.toISOString(),
      dataFim: fimComp.toISOString(),
      objetivo: getConteudo('Competitiva', isLongo),
      semanas: Math.ceil(compDays / 7) || 1,
      treinos: treinosComp
    }
  ];

  if (incluirTransicao) {
    fases.push({
      nome: 'Transição',
      dataInicio: inicioTrans.toISOString(),
      dataFim: dFim.toISOString(),
      objetivo: getConteudo('Transição', isLongo),
      semanas: Math.ceil(((dFim - inicioTrans) / (1000 * 3600 * 24)) / 7) || 1,
      treinos: treinosTrans
    });
  }

  return fases;
};
