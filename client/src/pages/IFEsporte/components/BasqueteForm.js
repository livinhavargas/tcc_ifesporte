import React, { useState, useEffect } from 'react';
import ContextoSelector from './ContextoSelector';

const BasqueteForm = ({ formData, setFormData, handleInputChange, handleSubmit, students, setMensagem }) => {
  const [tipoAnalise, setTipoAnalise] = useState('');
  const [formInfo, setFormInfo] = useState({});

  const basqueteStructures = {
    'Individual - Ataque': [
      {
        section: 'Finalização',
        fields: [
          { key: 'Finalização - Seleção dos arremessos', label: 'Seleção dos arremessos' },
          { key: 'Finalização - Mecânica do arremesso', label: 'Mecânica do arremesso' },
          { key: 'Finalização - Aproveitamento de média distância', label: 'Aproveitamento de média distância' },
          { key: 'Finalização - Aproveitamento de três pontos', label: 'Aproveitamento de três pontos' },
          { key: 'Finalização - Aproveitamento nas infiltrações', label: 'Aproveitamento nas infiltrações' },
          { key: 'Finalização - Aproveitamento nos lances livres', label: 'Aproveitamento nos lances livres' },
          { key: 'Finalização - Controle corporal', label: 'Controle corporal durante a finalização' }
        ]
      },
      {
        section: 'Criação ofensiva',
        fields: [
          { key: 'Criação ofensiva - Visão de jogo', label: 'Visão de jogo' },
          { key: 'Criação ofensiva - Leitura da defesa adversária', label: 'Leitura da defesa adversária' },
          { key: 'Criação ofensiva - Capacidade de criar espaços', label: 'Capacidade de criar espaços' },
          { key: 'Criação ofensiva - Qualidade dos passes', label: 'Qualidade dos passes' },
          { key: 'Criação ofensiva - Assistências', label: 'Assistências' },
          { key: 'Criação ofensiva - Tomada de decisão', label: 'Tomada de decisão' },
          { key: 'Criação ofensiva - Criatividade ofensiva', label: 'Criatividade ofensiva' }
        ]
      },
      {
        section: 'Controle de bola',
        fields: [
          { key: 'Controle de bola - Domínio da bola', label: 'Domínio da bola' },
          { key: 'Controle de bola - Segurança na condução', label: 'Segurança durante a condução' },
          { key: 'Controle de bola - Mudança de direção', label: 'Mudança de direção' },
          { key: 'Controle de bola - Proteção da bola', label: 'Proteção da bola' },
          { key: 'Controle de bola - Eficiência no drible', label: 'Eficiência no drible' },
          { key: 'Controle de bola - Controle sob pressão', label: 'Controle sob pressão' }
        ]
      },
      {
        section: 'Movimentação sem a bola',
        fields: [
          { key: 'Movimentação - Desmarcação', label: 'Desmarcação' },
          { key: 'Movimentação - Corte à cesta', label: 'Corte em direção à cesta' },
          { key: 'Movimentação - Ocupação dos espaços', label: 'Ocupação dos espaços' },
          { key: 'Movimentação - Leitura de movimentações', label: 'Leitura das movimentações ofensivas' },
          { key: 'Movimentação - Posicionamento', label: 'Posicionamento' }
        ]
      },
      {
        section: 'Transição ofensiva',
        fields: [
          { key: 'Transição ofensiva - Velocidade', label: 'Velocidade na transição' },
          { key: 'Transição ofensiva - Participação contra-ataques', label: 'Participação em contra-ataques' },
          { key: 'Transição ofensiva - Decisão contra-ataque', label: 'Decisão durante o contra-ataque' },
          { key: 'Transição ofensiva - Aproveitamento de oportunidades', label: 'Aproveitamento das oportunidades' }
        ]
      }
    ],
    'Individual - Defesa': [
      {
        section: 'Defesa individual',
        fields: [
          { key: 'Defesa individual - Posicionamento defensivo', label: 'Posicionamento defensivo' },
          { key: 'Defesa individual - Postura defensiva', label: 'Postura defensiva' },
          { key: 'Defesa individual - Movimentação lateral', label: 'Movimentação lateral' },
          { key: 'Defesa individual - Marcação do adversário', label: 'Marcação do adversário' },
          { key: 'Defesa individual - Contestação dos arremessos', label: 'Contestação dos arremessos' },
          { key: 'Defesa individual - Impedir infiltrações', label: 'Capacidade de impedir infiltrações' }
        ]
      },
      {
        section: 'Recuperação da posse',
        fields: [
          { key: 'Recuperação - Roubos de bola', label: 'Roubos de bola' },
          { key: 'Recuperação - Antecipações', label: 'Antecipações' },
          { key: 'Recuperação - Interceptações', label: 'Interceptações' },
          { key: 'Recuperação - Recuperações após erro', label: 'Recuperações após erro' }
        ]
      },
      {
        section: 'Proteção do garrafão',
        fields: [
          { key: 'Proteção do garrafão - Bloqueios (tocos)', label: 'Bloqueios (tocos)' },
          { key: 'Proteção do garrafão - Ajuda defensiva', label: 'Ajuda defensiva' },
          { key: 'Proteção do garrafão - Defesa próxima à cesta', label: 'Defesa próxima à cesta' },
          { key: 'Proteção do garrafão - Disputa de espaço', label: 'Disputa de espaço físico' }
        ]
      },
      {
        section: 'Rebotes',
        fields: [
          { key: 'Rebotes - Rebotes defensivos', label: 'Rebotes defensivos' },
          { key: 'Rebotes - Posicionamento', label: 'Posicionamento para o rebote' },
          { key: 'Rebotes - Box Out', label: 'Box Out' },
          { key: 'Rebotes - Tempo de reação', label: 'Tempo de reação' }
        ]
      },
      {
        section: 'Inteligência defensiva',
        fields: [
          { key: 'Inteligência defensiva - Comunicação', label: 'Comunicação defensiva' },
          { key: 'Inteligência defensiva - Trocas de marcação', label: 'Trocas de marcação' },
          { key: 'Inteligência defensiva - Leitura de jogadas', label: 'Leitura das jogadas' },
          { key: 'Inteligência defensiva - Recuperação após trocas', label: 'Recuperação após trocas' }
        ]
      }
    ],
    'Coletiva - Ataque': [
      {
        section: 'Organização ofensiva',
        fields: [
          { key: 'Organização ofensiva - Espaçamento da quadra', label: 'Espaçamento da quadra' },
          { key: 'Organização ofensiva - Circulação da bola', label: 'Circulação da bola' },
          { key: 'Organização ofensiva - Movimentação coletiva', label: 'Movimentação coletiva' },
          { key: 'Organização ofensiva - Execução de jogadas', label: 'Execução das jogadas treinadas' },
          { key: 'Organização ofensiva - Comunicação ofensiva', label: 'Comunicação ofensiva' }
        ]
      },
      {
        section: 'Construção das jogadas',
        fields: [
          { key: 'Construção - Qualidade dos passes', label: 'Qualidade dos passes' },
          { key: 'Construção - Ritmo ofensivo', label: 'Ritmo ofensivo' },
          { key: 'Construção - Escolha dos arremessos', label: 'Escolha dos arremessos' },
          { key: 'Construção - Criação de espaços', label: 'Criação de espaços' },
          { key: 'Construção - Eficiência infiltrações', label: 'Eficiência nas infiltrações' }
        ]
      },
      {
        section: 'Aproveitamento ofensivo',
        fields: [
          { key: 'Aproveitamento - Geral dos arremessos', label: 'Aproveitamento geral dos arremessos' },
          { key: 'Aproveitamento - Três pontos', label: 'Aproveitamento de três pontos' },
          { key: 'Aproveitamento - Lances livres', label: 'Aproveitamento dos lances livres' },
          { key: 'Aproveitamento - Próximo à cesta', label: 'Aproveitamento próximo à cesta' }
        ]
      },
      {
        section: 'Transição ofensiva',
        fields: [
          { key: 'Transição - Velocidade', label: 'Velocidade dos contra-ataques' },
          { key: 'Transição - Organização', label: 'Organização da transição' },
          { key: 'Transição - Tomada de decisão', label: 'Tomada de decisão' },
          { key: 'Transição - Conversão de oportunidades', label: 'Conversão das oportunidades' }
        ]
      },
      {
        section: 'Jogo coletivo',
        fields: [
          { key: 'Jogo coletivo - Assistências da equipe', label: 'Assistências da equipe' },
          { key: 'Jogo coletivo - Compartilhamento de bola', label: 'Compartilhamento da bola' },
          { key: 'Jogo coletivo - Participação de todos', label: 'Participação de todos os atletas' },
          { key: 'Jogo coletivo - Sincronia ofensiva', label: 'Sincronia ofensiva' }
        ]
      }
    ],
    'Coletiva - Defesa': [
      {
        section: 'Organização defensiva',
        fields: [
          { key: 'Organização defensiva - Compactação', label: 'Compactação defensiva' },
          { key: 'Organização defensiva - Comunicação', label: 'Comunicação' },
          { key: 'Organização defensiva - Sincronização', label: 'Sincronização' },
          { key: 'Organização defensiva - Cobertura', label: 'Cobertura' }
        ]
      },
      {
        section: 'Marcação',
        fields: [
          { key: 'Marcação - Individual', label: 'Eficiência da marcação individual' },
          { key: 'Marcação - Por zona', label: 'Eficiência da marcação por zona (quando utilizada)' },
          { key: 'Marcação - Trocas', label: 'Trocas defensivas' },
          { key: 'Marcação - Ajuda', label: 'Ajuda defensiva' }
        ]
      },
      {
        section: 'Recuperação da posse',
        fields: [
          { key: 'Recuperação - Pressão na bola', label: 'Pressão na bola' },
          { key: 'Recuperação - Roubos de bola', label: 'Roubos de bola' },
          { key: 'Recuperação - Interceptações', label: 'Interceptações' },
          { key: 'Recuperação - Recuperações', label: 'Recuperações após erros' }
        ]
      },
      {
        section: 'Proteção do garrafão',
        fields: [
          { key: 'Proteção do garrafão - Defesa próxima à cesta', label: 'Defesa próxima à cesta' },
          { key: 'Proteção do garrafão - Contestação', label: 'Contestação dos arremessos' },
          { key: 'Proteção do garrafão - Bloqueios', label: 'Bloqueios da equipe' },
          { key: 'Proteção do garrafão - Controle', label: 'Controle do garrafão' }
        ]
      },
      {
        section: 'Rebotes',
        fields: [
          { key: 'Rebotes - Defensivos', label: 'Rebotes defensivos' },
          { key: 'Rebotes - Box Out coletivo', label: 'Box Out coletivo' },
          { key: 'Rebotes - Segunda bola concedida', label: 'Segunda bola concedida ao adversário' }
        ]
      },
      {
        section: 'Transição defensiva',
        fields: [
          { key: 'Transição defensiva - Retorno', label: 'Retorno para a defesa' },
          { key: 'Transição defensiva - Organização pós-perda', label: 'Organização após perda da posse' },
          { key: 'Transição defensiva - Defesa contra-ataques', label: 'Defesa dos contra-ataques' }
        ]
      }
    ]
  };

  const structure = basqueteStructures[tipoAnalise] || [];

  // Auto-detectar tipoAnalise APENAS em EDIT mode
  useEffect(() => {
    if (formData.editingId) {
      // Em EDIT: detectar o tipoAnalise a partir dos dados salvos
      if (formData.tipoAnalise && basqueteStructures[formData.tipoAnalise]) {
        setTipoAnalise(formData.tipoAnalise);
      } else if (formData.subtipo && basqueteStructures[formData.subtipo]) {
        setTipoAnalise(formData.subtipo);
      } else if (formData.respostas && Object.keys(formData.respostas).length > 0) {
        const keys = Object.keys(formData.respostas);
        for (const typeKey of Object.keys(basqueteStructures)) {
          const match = basqueteStructures[typeKey].some(s => s.fields.some(f => keys.includes(f.key)));
          if (match) {
            setTipoAnalise(typeKey);
            break;
          }
        }
      }
    }
    // Em CREATE: tipoAnalise começa vazio, o treinador seleciona manualmente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.editingId]);

  // Quando tipoAnalise muda, inicializar os critérios
  useEffect(() => {
    if (structure.length > 0) {
      if (formData.editingId) {
        // EDIT mode: usar dados reais do banco
        setFormInfo(formData.respostas || {});
      } else {
        // CREATE mode: sempre inicializar com defaults
        const newAnswers = {};
        structure.forEach(s => {
          s.fields.forEach(f => {
            newAnswers[f.key] = 3;
          });
        });
        setFormInfo(newAnswers);
        setFormData(prev => ({
          ...prev,
          respostas: newAnswers
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoAnalise]);

  const handleSliderChange = (key, value) => {
    const val = Number(value);
    setFormInfo(prev => ({ ...prev, [key]: val }));
    setFormData(prev => ({
      ...prev,
      respostas: {
        ...prev.respostas,
        [key]: val
      }
    }));
  };

  const gerarDiagnosticoIndividualAtaque = (respostas) => {
    let notaTotal = 0;
    let totalCrit = 0;
    let sumFinalizacao = 0, countFinalizacao = 0;
    let sumCriacao = 0, countCriacao = 0;
    let sumControle = 0, countControle = 0;
    let sumMovimentacao = 0, countMovimentacao = 0;
    let sumTransicao = 0, countTransicao = 0;

    for (let key in respostas) {
      let val = respostas[key];
      notaTotal += val;
      totalCrit++;
      if (key.includes('Finalização')) { sumFinalizacao += val; countFinalizacao++; }
      if (key.includes('Criação')) { sumCriacao += val; countCriacao++; }
      if (key.includes('Controle')) { sumControle += val; countControle++; }
      if (key.includes('Movimentação')) { sumMovimentacao += val; countMovimentacao++; }
      if (key.includes('Transição')) { sumTransicao += val; countTransicao++; }
    }

    const nFinalizacao = (sumFinalizacao / countFinalizacao) || 0;
    const nCriacao = (sumCriacao / countCriacao) || 0;
    const nControle = (sumControle / countControle) || 0;
    const nMovimentacao = (sumMovimentacao / countMovimentacao) || 0;
    const nTransicao = (sumTransicao / countTransicao) || 0;
    const indiceGeral = (notaTotal / totalCrit).toFixed(1);

    const isFinalizador = nFinalizacao > 3.5 && nCriacao <= 3.0;
    const isCriador = nCriacao > 3.5 && nFinalizacao <= 3.0;

    let pontosFortes = [];
    let pontosFracos = [];

    if (nFinalizacao >= 4) pontosFortes.push('Excelente aproveitamento nos arremessos e ótima mecânica');
    else if (nFinalizacao < 3) pontosFracos.push('Baixo aproveitamento ofensivo e seleção de arremessos questionável');

    if (nCriacao >= 4) pontosFortes.push('Notável capacidade de criar jogadas e ótima visão de quadra');
    else if (nCriacao < 3) pontosFracos.push('Dificuldade na criação ofensiva e pouca visão de jogo');

    if (nControle >= 4) pontosFortes.push('Segurança na condução da bola sob pressão');
    else if (nControle < 3) pontosFracos.push('Excesso de perdas de posse e controle de bola inseguro');

    if (nMovimentacao >= 4) pontosFortes.push('Movimentação inteligente sem a bola (cortes e desmarques eficientes)');
    else if (nMovimentacao < 3) pontosFracos.push('Pouca ocupação de espaços e movimentação passiva sem a posse');

    let text = `O atleta apresentou uma nota geral ofensiva de ${indiceGeral}.\n\n`;
    
    if (isFinalizador) {
      text += `Perfil Analisado: O jogador atua prioritariamente como um finalizador ofensivo. Observa-se que sua criação de jogadas não acompanha seu ímpeto para finalizar.\n`;
      if (respostas['Finalização - Seleção dos arremessos'] < 3) {
        text += `Alerta: Constatamos que o atleta vem forçando arremessos de baixa qualidade, o que afeta sua eficiência ofensiva. É fundamental trabalhar a leitura de jogo antes do chute.\n`;
      }
    } else if (isCriador) {
      text += `Perfil Analisado: O jogador assume um papel fundamental de construtor (playmaker) para o time, privilegiando o passe à finalização.\n`;
    } else {
      text += `Perfil Analisado: O atleta demonstrou um comportamento ofensivo híbrido, envolvendo-se tanto em finalizações quanto na articulação de jogadas.\n`;
    }

    if (respostas['Controle de bola - Controle sob pressão'] < 3 || respostas['Controle de bola - Proteção da bola'] < 3) {
      text += `\nDeficiências no Domínio: Foram identificadas perdas de posse excessivas ou dificuldades acentuadas quando submetido à marcação forte, sugerindo falha na proteção da bola.\n`;
    }

    text += `\n**Pontos Fortes:**\n`;
    pontosFortes.forEach(p => text += `- ${p}\n`);
    if (pontosFortes.length === 0) text += `- Nenhum destaque positivo evidente nesta avaliação.\n`;

    text += `\n**Aspectos a Melhorar:**\n`;
    pontosFracos.forEach(p => text += `- ${p}\n`);
    if (pontosFracos.length === 0) text += `- O atleta não apresentou deficiências graves neste momento.\n`;
    
    return text;
  };

  const gerarDiagnosticoIndividualDefesa = (respostas) => {
    let notaTotal = 0;
    let totalCrit = 0;
    let sumInd = 0, countInd = 0;
    let sumRec = 0, countRec = 0;
    let sumGarrafao = 0, countGarrafao = 0;
    let sumRebotes = 0, countRebotes = 0;
    let sumIntel = 0, countIntel = 0;

    for (let key in respostas) {
      let val = respostas[key];
      notaTotal += val;
      totalCrit++;
      if (key.includes('Defesa individual')) { sumInd += val; countInd++; }
      if (key.includes('Recuperação')) { sumRec += val; countRec++; }
      if (key.includes('Proteção do garrafão')) { sumGarrafao += val; countGarrafao++; }
      if (key.includes('Rebotes')) { sumRebotes += val; countRebotes++; }
      if (key.includes('Inteligência')) { sumIntel += val; countIntel++; }
    }

    const nInd = (sumInd / countInd) || 0;
    const nRec = (sumRec / countRec) || 0;
    const nGarrafao = (sumGarrafao / countGarrafao) || 0;
    const nRebotes = (sumRebotes / countRebotes) || 0;
    const nIntel = (sumIntel / countIntel) || 0;
    const indiceGeral = (notaTotal / totalCrit).toFixed(1);

    let text = `O atleta encerrou o período com uma eficiência defensiva e índice técnico geral de ${indiceGeral}.\n\n`;

    let pontosFortes = [];
    let pontosFracos = [];

    if (nInd >= 4) pontosFortes.push('Defesa sólida na marcação 1x1 e postura lateral agressiva');
    else if (nInd < 3) pontosFracos.push('Postura defensiva ruim, permitindo infiltrações frequentes do oponente');

    if (nGarrafao >= 4) pontosFortes.push('Excelente proteção do aro (contestação/tocos)');
    else if (nGarrafao < 3) pontosFracos.push('Vulnerabilidade na defesa de contato físico no garrafão');

    if (respostas['Rebotes - Box Out'] < 3) {
      pontosFracos.push('Ausência sistemática do fundamento Box Out, cedendo rebotes ofensivos adversários');
    } else if (nRebotes >= 4) {
      pontosFortes.push('Atuação implacável nos rebotes defensivos e no bloqueio (Box Out)');
    }

    if (nIntel >= 4) pontosFortes.push('Ótima leitura de trocas e alta capacidade de comunicação na quadra');
    else if (nIntel < 3) pontosFracos.push('Erros nas trocas de marcação (switch) e ausência de comunicação');

    text += `**Pontos Fortes:**\n`;
    pontosFortes.forEach(p => text += `- ${p}\n`);
    if (pontosFortes.length === 0) text += `- Nenhum destaque positivo evidente nesta avaliação.\n`;

    text += `\n**Principais Deficiências Observadas:**\n`;
    pontosFracos.forEach(p => text += `- ${p}\n`);
    if (pontosFracos.length === 0) text += `- Estrutura defensiva individual sem pontos críticos.\n`;

    return text;
  };

  const gerarDiagnosticoColetivoAtaque = (respostas) => {
    let notaTotal = 0;
    let totalCrit = 0;
    let sumOrg = 0, countOrg = 0;
    let sumConstrucao = 0, countConstrucao = 0;
    let sumAproveitamento = 0, countAproveitamento = 0;
    let sumJogoCol = 0, countJogoCol = 0;

    for (let key in respostas) {
      let val = respostas[key];
      notaTotal += val;
      totalCrit++;
      if (key.includes('Organização')) { sumOrg += val; countOrg++; }
      if (key.includes('Construção')) { sumConstrucao += val; countConstrucao++; }
      if (key.includes('Aproveitamento')) { sumAproveitamento += val; countAproveitamento++; }
      if (key.includes('Jogo coletivo')) { sumJogoCol += val; countJogoCol++; }
    }

    const nOrg = (sumOrg / countOrg) || 0;
    const nJogoCol = (sumJogoCol / countJogoCol) || 0;
    const nAproveitamento = (sumAproveitamento / countAproveitamento) || 0;
    const indiceGeral = (notaTotal / totalCrit).toFixed(1);

    const isIsolado = nJogoCol < 3 && respostas['Jogo coletivo - Compartilhamento de bola'] < 3;

    let text = `Desempenho Coletivo (Ataque) - Nota Ofensiva da Equipe: ${indiceGeral}.\n\n`;

    if (isIsolado) {
      text += `Diagnóstico Tático: A equipe apresentou forte dependência de ações individuais (Isolation), mostrando grande deficiência no compartilhamento da bola. Faltou construção coletiva.\n\n`;
    } else if (nJogoCol >= 4 && nOrg >= 4) {
      text += `Diagnóstico Tático: A equipe executou de maneira primorosa seus sistemas, movendo bem a bola e mantendo um excelente ritmo coletivo, evidenciando uma sintonia fina.\n\n`;
    } else {
      text += `Diagnóstico Tático: A equipe alternou entre momentos de fluidez e individualismo ao longo da avaliação.\n\n`;
    }

    let pontosFortes = [];
    let pontosFracos = [];

    if (respostas['Organização ofensiva - Espaçamento da quadra'] >= 4) pontosFortes.push('Ótimo "spacing" (espaçamento), punindo a defesa adversária');
    else if (respostas['Organização ofensiva - Espaçamento da quadra'] < 3) pontosFracos.push('Aglomeração de jogadores em faixas curtas (péssimo espaçamento)');

    if (nAproveitamento >= 4) pontosFortes.push('Alta taxa de conversão nos arremessos');
    else if (nAproveitamento < 3) pontosFracos.push('Baixo aproveitamento ofensivo (arremessos e infiltrações)');

    text += `**Pontos Fortes Coletivos:**\n`;
    pontosFortes.forEach(p => text += `- ${p}\n`);
    if (pontosFortes.length === 0) text += `- Nenhum.\n`;

    text += `\n**Deficiências da Equipe:**\n`;
    pontosFracos.forEach(p => text += `- ${p}\n`);
    if (pontosFracos.length === 0) text += `- Nenhuma.\n`;

    return text;
  };

  const gerarDiagnosticoColetivoDefesa = (respostas) => {
    let notaTotal = 0;
    let totalCrit = 0;
    let sumOrg = 0, countOrg = 0;
    let sumRec = 0, countRec = 0;
    let sumGarrafao = 0, countGarrafao = 0;
    let sumTransicao = 0, countTransicao = 0;

    for (let key in respostas) {
      let val = respostas[key];
      notaTotal += val;
      totalCrit++;
      if (key.includes('Organização')) { sumOrg += val; countOrg++; }
      if (key.includes('Recuperação')) { sumRec += val; countRec++; }
      if (key.includes('Proteção do garrafão')) { sumGarrafao += val; countGarrafao++; }
      if (key.includes('Transição')) { sumTransicao += val; countTransicao++; }
    }

    const nOrg = (sumOrg / countOrg) || 0;
    const nGarrafao = (sumGarrafao / countGarrafao) || 0;
    const nTransicao = (sumTransicao / countTransicao) || 0;
    const indiceGeral = (notaTotal / totalCrit).toFixed(1);

    let text = `Desempenho Coletivo (Defesa) - Eficiência Defensiva: ${indiceGeral}.\n\n`;

    text += `A avaliação estrutural mapeou o comportamento defensivo global do time:\n\n`;

    let pontosFortes = [];
    let pontosFracos = [];

    if (nOrg >= 4) pontosFortes.push('Excelente compactação, sincronização nas coberturas e comunicação viva');
    else if (nOrg < 3) pontosFracos.push('Atraso nas coberturas, má comunicação defensiva e falta de sincronia');

    if (nGarrafao >= 4) pontosFortes.push('Intimidação no garrafão, travando as principais vias de infiltração');
    else if (nGarrafao < 3) pontosFracos.push('Garrafão desprotegido, cedendo bandejas fáceis e sendo dominados fisicamente');

    if (respostas['Transição defensiva - Retorno'] < 3) {
      pontosFracos.push('Transição defensiva muito lenta; jogadores não acompanham o contra-ataque adversário ("Transition D" precária)');
    }

    if (respostas['Rebotes - Segunda bola concedida'] < 3) {
      pontosFracos.push('Ineficiência coletiva no Box Out, cedendo preciosos rebotes ofensivos que puniram o time');
    }

    text += `**Setores Positivos:**\n`;
    pontosFortes.forEach(p => text += `- ${p}\n`);
    if (pontosFortes.length === 0) text += `- O time não obteve destaque defensivo suficiente.\n`;

    text += `\n**Vulnerabilidades Observadas:**\n`;
    pontosFracos.forEach(p => text += `- ${p}\n`);
    if (pontosFracos.length === 0) text += `- A equipe apresentou uma consistência defensiva admirável sem pontos soltos.\n`;
    
    return text;
  };

  const internalHandleSubmit = (e) => {
    e.preventDefault();
    if (!tipoAnalise) {
      setMensagem('Por favor, selecione o tipo de análise (Ataque Individual, etc.)');
      return;
    }

    let diagnostico = '';
    if (tipoAnalise === 'Individual - Ataque') diagnostico = gerarDiagnosticoIndividualAtaque(formInfo);
    else if (tipoAnalise === 'Individual - Defesa') diagnostico = gerarDiagnosticoIndividualDefesa(formInfo);
    else if (tipoAnalise === 'Coletiva - Ataque') diagnostico = gerarDiagnosticoColetivoAtaque(formInfo);
    else if (tipoAnalise === 'Coletiva - Defesa') diagnostico = gerarDiagnosticoColetivoDefesa(formInfo);

    const tipoFinal = tipoAnalise.includes('Coletiva') ? 'Coletiva' : 'Individual';

    handleSubmit(e, diagnostico, tipoFinal);
  };

  const isColetiva = tipoAnalise.includes('Coletiva');

  return (
    <div className="card-flat shadow-sm mb-5 border p-4 bg-white border-top border-4 border-orange">
      <h5 className="fw-bold mb-4 text-blue-dark">Motor Analítico: Basquete</h5>
      
      <form onSubmit={internalHandleSubmit}>
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <label className="form-label fw-bold small text-muted">Tipo de Análise</label>
            <select className="form-select bg-light" value={tipoAnalise} onChange={(e) => setTipoAnalise(e.target.value)} required>
              <option value="">Selecione...</option>
              <option value="Individual - Ataque">Individual – Ataque</option>
              <option value="Individual - Defesa">Individual – Defesa</option>
              <option value="Coletiva - Ataque">Coletiva – Ataque</option>
              <option value="Coletiva - Defesa">Coletiva – Defesa</option>
            </select>
          </div>
          <div className="col-md-3">
            <ContextoSelector modalidade={formData.modalidade || 'Basquete'} value={formData.contexto} onChange={handleInputChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold small text-muted">Data da Análise</label>
            <input type="date" className="form-control bg-light" name="data" value={formData.data} onChange={handleInputChange} required />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold small text-muted">Aluno(s) Avaliado(s) / Equipe</label>
            <select className="form-select bg-light" name="aluno" value={formData.aluno} onChange={handleInputChange} required>
              {students.length === 0 ? (
                <option value="">Nenhum atleta cadastrado nesta modalidade.</option>
              ) : (
                <option value="">{isColetiva ? 'Selecione o capitão/âncora da equipe...' : 'Selecione um aluno...'}</option>
              )}
              {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
            </select>
            {isColetiva && <small className="text-muted mt-1 d-block">Nas avaliações coletivas, selecione o capitão ou representante. A avaliação engloba a equipe toda.</small>}
          </div>
        </div>

        {tipoAnalise && structure.length > 0 && (
          <div className="mt-4 p-4 border rounded bg-light">
            <h6 className="fw-bold text-blue-dark mb-3"><i className="bi bi-clipboard2-data me-2"></i> {tipoAnalise}</h6>
            <p className="small text-muted mb-4">Avalie de 1 a 5 cada um dos critérios abaixo (1 = Insuficiente, 5 = Excelente).</p>

            {structure.map((sec, idx) => (
              <div key={idx} className="bg-light p-4 rounded-4 mb-4 border">
                <h6 className="fw-bold text-orange mb-3 border-bottom pb-2"><i className="bi bi-record-circle me-2"></i>{sec.section}</h6>
                <div className="row g-3">
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

            <div className="mt-5 border-top pt-4">
              <label className="form-label fw-bold small text-muted">Notas ou Comentários (opcional)</label>
              <textarea className="form-control bg-white" name="observacoes" rows="2" value={formData.observacoes} onChange={handleInputChange} placeholder="Comentários extras sobre o desempenho..."></textarea>
            </div>
            
            <div className="row mt-4">
              <div className="col-12 text-end">
                <button type="submit" className="btn btn-orange px-5 py-2 fw-bold rounded-pill text-white shadow-sm">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {formData?.editingId ? 'Salvar Alterações' : 'Salvar Análise'}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BasqueteForm;
