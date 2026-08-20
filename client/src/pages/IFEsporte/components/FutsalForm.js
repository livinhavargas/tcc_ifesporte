import React, { useState, useEffect } from 'react';
import ContextoSelector from './ContextoSelector';

const FutsalForm = ({ formData, setFormData, handleInputChange, handleSubmit, students, setMensagem }) => {
  const [tipoAnalise, setTipoAnalise] = useState('');
  const [formInfo, setFormInfo] = useState({});

  // Auto-detectar tipoAnalise APENAS em EDIT mode
  useEffect(() => {
    if (formData.editingId) {
      if (formData.tipoAnalise && structures[formData.tipoAnalise]) {
        setTipoAnalise(formData.tipoAnalise);
      } else if (formData.subtipo && structures[formData.subtipo]) {
        setTipoAnalise(formData.subtipo);
      } else if (formData.respostas && Object.keys(formData.respostas).length > 0) {
        const keys = Object.keys(formData.respostas);
        for (const typeKey of Object.keys(structures)) {
          const match = structures[typeKey].some(s => s.fields.some(f => keys.includes(f.key)));
          if (match) {
            setTipoAnalise(typeKey);
            break;
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.editingId]);

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
      { section: 'Finalização', fields: [{ key: 'Ataque Ind - Precisão', label: 'Precisão das finalizações' }, { key: 'Ataque Ind - Potência', label: 'Potência do chute' }, { key: 'Ataque Ind - Momento', label: 'Escolha do momento para finalizar' }, { key: 'Ataque Ind - Ambas Pernas', label: 'Finalizações com ambas as pernas' }, { key: 'Ataque Ind - Pressão', label: 'Finalizações sob pressão' }, { key: 'Ataque Ind - Aproveitamento', label: 'Aproveitamento das oportunidades criadas' }, { key: 'Ataque Ind - Controle Corporal', label: 'Controle corporal durante a finalização' }] },
      { section: 'Drible e Condução', fields: [{ key: 'Ataque Ind - Controle Bola', label: 'Controle da bola' }, { key: 'Ataque Ind - Dribles 1x1', label: 'Dribles em situações de 1x1' }, { key: 'Ataque Ind - Mudança Direção', label: 'Mudança rápida de direção' }, { key: 'Ataque Ind - Proteção', label: 'Proteção da bola' }, { key: 'Ataque Ind - Condução Velocidade', label: 'Condução em velocidade' }, { key: 'Ataque Ind - Eliminar Adversários', label: 'Capacidade de eliminar adversários' }] },
      { section: 'Passe e Construção', fields: [{ key: 'Ataque Ind - Precisão Passe', label: 'Precisão dos passes' }, { key: 'Ataque Ind - Passes Rápidos', label: 'Passes rápidos' }, { key: 'Ataque Ind - Passes Verticais', label: 'Passes verticais' }, { key: 'Ataque Ind - Assistências', label: 'Assistências' }, { key: 'Ataque Ind - Criação', label: 'Criação de oportunidades' }, { key: 'Ataque Ind - Visão', label: 'Visão de jogo' }, { key: 'Ataque Ind - Decisão', label: 'Tomada de decisão' }] },
      { section: 'Movimentação sem a bola', fields: [{ key: 'Ataque Ind - Desmarcação', label: 'Desmarcação' }, { key: 'Ataque Ind - Rotações', label: 'Rotações ofensivas' }, { key: 'Ataque Ind - Ataque Espaços', label: 'Ataque aos espaços' }, { key: 'Ataque Ind - Ocupação Quadra', label: 'Ocupação da quadra' }, { key: 'Ataque Ind - Sincronização', label: 'Sincronização com os companheiros' }] },
      { section: 'Transição Ofensiva', fields: [{ key: 'Ataque Ind - Reação Recuperação', label: 'Reação após recuperar a posse' }, { key: 'Ataque Ind - Velocidade Contra-ataque', label: 'Velocidade para iniciar contra-ataques' }, { key: 'Ataque Ind - Eficiência Superioridade', label: 'Eficiência na superioridade numérica' }, { key: 'Ataque Ind - Participação Transições', label: 'Participação nas transições rápidas' }] },
      { section: 'Inteligência Ofensiva', fields: [{ key: 'Ataque Ind - Leitura', label: 'Leitura do jogo' }, { key: 'Ataque Ind - Escolha Jogadas', label: 'Escolha das jogadas' }, { key: 'Ataque Ind - Espaços Reduzidos', label: 'Aproveitamento dos espaços reduzidos' }, { key: 'Ataque Ind - Adaptação', label: 'Adaptação às diferentes situações da partida' }] }
    ],
    'Individual - Defesa': [
      { section: 'Marcação Individual', fields: [{ key: 'Defesa Ind - Posicionamento', label: 'Posicionamento defensivo' }, { key: 'Defesa Ind - Postura', label: 'Postura corporal' }, { key: 'Defesa Ind - Aproximação', label: 'Aproximação ao adversário' }, { key: 'Defesa Ind - Controle Espaço', label: 'Controle do espaço' }, { key: 'Defesa Ind - Eficiência Marcação', label: 'Eficiência da marcação' }] },
      { section: 'Pressão na Bola', fields: [{ key: 'Defesa Ind - Intensidade Pressão', label: 'Intensidade da pressão' }, { key: 'Defesa Ind - Tempo Abordagem', label: 'Tempo da abordagem' }, { key: 'Defesa Ind - Recuperação Posse', label: 'Recuperação da posse' }, { key: 'Defesa Ind - Forçar Erros', label: 'Forçar erros do adversário' }] },
      { section: 'Recuperação da Posse', fields: [{ key: 'Defesa Ind - Desarmes', label: 'Desarmes' }, { key: 'Defesa Ind - Interceptações', label: 'Interceptações' }, { key: 'Defesa Ind - Antecipações', label: 'Antecipações' }, { key: 'Defesa Ind - Recuperações', label: 'Recuperações de bola' }] },
      { section: 'Cobertura Defensiva', fields: [{ key: 'Defesa Ind - Cobertura Companheiros', label: 'Cobertura aos companheiros' }, { key: 'Defesa Ind - Fechamento Linhas', label: 'Fechamento das linhas de passe' }, { key: 'Defesa Ind - Trocas Marcação', label: 'Trocas de marcação' }, { key: 'Defesa Ind - Ocupação Defensiva', label: 'Ocupação dos espaços defensivos' }] },
      { section: 'Transição Defensiva', fields: [{ key: 'Defesa Ind - Reação Perda', label: 'Reação após perder a posse' }, { key: 'Defesa Ind - Velocidade Recomposição', label: 'Velocidade de recomposição' }, { key: 'Defesa Ind - Organização Contra-ataques', label: 'Organização durante contra-ataques adversários' }] },
      { section: 'Inteligência Defensiva', fields: [{ key: 'Defesa Ind - Leitura', label: 'Leitura do jogo' }, { key: 'Defesa Ind - Antecipação Geral', label: 'Antecipação' }, { key: 'Defesa Ind - Comunicação', label: 'Comunicação' }, { key: 'Defesa Ind - Decisão', label: 'Tomada de decisão' }, { key: 'Defesa Ind - Disciplina Tática', label: 'Disciplina tática' }] }
    ],
    'Individual - Goleiro': [
      { section: 'Defesa das Finalizações', fields: [{ key: 'Goleiro - Posicionamento', label: 'Posicionamento' }, { key: 'Goleiro - Reflexo', label: 'Reflexo' }, { key: 'Goleiro - Tempo Reação', label: 'Tempo de reação' }, { key: 'Goleiro - Chutes Próximos', label: 'Defesa de chutes próximos' }, { key: 'Goleiro - Chutes Média', label: 'Defesa de chutes de média distância' }, { key: 'Goleiro - Um contra Um', label: 'Defesa em situações de 1x1' }, { key: 'Goleiro - Regularidade Defesas', label: 'Regularidade das defesas' }] },
      { section: 'Saídas do Gol', fields: [{ key: 'Goleiro - Tempo Saída', label: 'Tempo da saída' }, { key: 'Goleiro - Cobertura', label: 'Cobertura do goleiro' }, { key: 'Goleiro - Interceptação Passes', label: 'Interceptação de passes' }, { key: 'Goleiro - Segurança Divididas', label: 'Segurança nas divididas' }] },
      { section: 'Distribuição da Bola', fields: [{ key: 'Goleiro - Passes Curtos', label: 'Precisão dos passes curtos' }, { key: 'Goleiro - Passes Longos', label: 'Precisão dos passes longos' }, { key: 'Goleiro - Reposição Rápida', label: 'Reposição rápida' }, { key: 'Goleiro - Lançamentos', label: 'Lançamentos para contra-ataques' }, { key: 'Goleiro - Construção Ofensiva', label: 'Participação na construção ofensiva' }] },
      { section: 'Goleiro-Linha', fields: [{ key: 'Goleiro - Controle Bola', label: 'Controle da bola' }, { key: 'Goleiro - Circulação Ofensiva', label: 'Participação na circulação ofensiva' }, { key: 'Goleiro - Decisão Goleiro-Linha', label: 'Tomada de decisão' }, { key: 'Goleiro - Segurança Posse', label: 'Segurança durante a posse' }] },
      { section: 'Comunicação', fields: [{ key: 'Goleiro - Organização Defesa', label: 'Organização da defesa' }, { key: 'Goleiro - Comunicação Companheiros', label: 'Comunicação com os companheiros' }, { key: 'Goleiro - Liderança', label: 'Liderança' }, { key: 'Goleiro - Bolas Paradas', label: 'Orientação durante bolas paradas' }] },
      { section: 'Inteligência de Jogo', fields: [{ key: 'Goleiro - Leitura Jogadas', label: 'Leitura das jogadas' }, { key: 'Goleiro - Momento Saída', label: 'Escolha do momento para sair do gol' }, { key: 'Goleiro - Controle Emocional', label: 'Controle emocional' }, { key: 'Goleiro - Regularidade Partida', label: 'Regularidade durante toda a partida' }] }
    ],
    'Coletiva - Ataque': [
      { section: 'Organização Ofensiva', fields: [{ key: 'Ataque Col - Circulação', label: 'Circulação da bola' }, { key: 'Ataque Col - Ocupação Espaços', label: 'Ocupação dos espaços' }, { key: 'Ataque Col - Rotações', label: 'Rotações ofensivas' }, { key: 'Ataque Col - Mobilidade', label: 'Mobilidade' }, { key: 'Ataque Col - Comunicação Ofensiva', label: 'Comunicação ofensiva' }] },
      { section: 'Construção das Jogadas', fields: [{ key: 'Ataque Col - Sequência Passes', label: 'Sequência de passes' }, { key: 'Ataque Col - Tabelas', label: 'Tabelas' }, { key: 'Ataque Col - Quebra Linhas', label: 'Quebra de linhas' }, { key: 'Ataque Col - Movimentação Coordenada', label: 'Movimentação coordenada' }, { key: 'Ataque Col - Jogadas Treinadas', label: 'Execução das jogadas treinadas' }] },
      { section: 'Criação de Oportunidades', fields: [{ key: 'Ataque Col - Chances Claras', label: 'Criação de chances claras' }, { key: 'Ataque Col - Superioridade Numérica', label: 'Aproveitamento da superioridade numérica' }, { key: 'Ataque Col - Decisões Ofensivas', label: 'Qualidade das decisões ofensivas' }, { key: 'Ataque Col - Último Passe', label: 'Eficiência no último passe' }] },
      { section: 'Finalização Coletiva', fields: [{ key: 'Ataque Col - Qualidade Finalizações', label: 'Qualidade das finalizações' }, { key: 'Ataque Col - Eficiência Ofensiva', label: 'Eficiência ofensiva' }, { key: 'Ataque Col - Aproveitamento Oportunidades', label: 'Aproveitamento das oportunidades' }, { key: 'Ataque Col - Variedade Ataque', label: 'Variedade das formas de ataque' }] },
      { section: 'Transição Ofensiva', fields: [{ key: 'Ataque Col - Velocidade Contra-ataques', label: 'Velocidade dos contra-ataques' }, { key: 'Ataque Col - Organização Transições', label: 'Organização das transições' }, { key: 'Ataque Col - Recuperações Posse', label: 'Aproveitamento das recuperações de posse' }, { key: 'Ataque Col - Conversão', label: 'Conversão das oportunidades' }] },
      { section: 'Sistema com Goleiro-Linha', fields: [{ key: 'Ataque Col - GL Organização', label: 'Organização ofensiva' }, { key: 'Ataque Col - GL Circulação', label: 'Circulação da bola' }, { key: 'Ataque Col - GL Momentos', label: 'Escolha dos momentos para utilizar o goleiro-linha' }, { key: 'Ataque Col - GL Eficiência', label: 'Eficiência da estratégia' }] },
      { section: 'Inteligência Tática', fields: [{ key: 'Ataque Col - Cumprimento Modelo', label: 'Cumprimento do modelo de jogo' }, { key: 'Ataque Col - Sincronização', label: 'Sincronização dos atletas' }, { key: 'Ataque Col - Comunicação Tática', label: 'Comunicação' }, { key: 'Ataque Col - Decisão Coletiva', label: 'Tomada de decisão coletiva' }] }
    ],
    'Coletiva - Defesa': [
      { section: 'Organização Defensiva', fields: [{ key: 'Defesa Col - Compactação', label: 'Compactação' }, { key: 'Defesa Col - Distância Jogadores', label: 'Distância entre jogadores' }, { key: 'Defesa Col - Organização Sistema', label: 'Organização do sistema defensivo' }, { key: 'Defesa Col - Cobertura', label: 'Cobertura' }] },
      { section: 'Pressão', fields: [{ key: 'Defesa Col - Pressão Saída', label: 'Pressão na saída adversária' }, { key: 'Defesa Col - Coordenação Pressão', label: 'Coordenação da pressão' }, { key: 'Defesa Col - Intensidade Marcação', label: 'Intensidade da marcação' }, { key: 'Defesa Col - Recuperação Rápida', label: 'Recuperação rápida da posse' }] },
      { section: 'Marcação', fields: [{ key: 'Defesa Col - Marcação Individual', label: 'Eficiência da marcação individual' }, { key: 'Defesa Col - Marcação Zona', label: 'Eficiência da marcação por zona' }, { key: 'Defesa Col - Trocas Defensivas', label: 'Trocas defensivas' }, { key: 'Defesa Col - Fechamento Linhas', label: 'Fechamento das linhas de passe' }] },
      { section: 'Proteção da Área', fields: [{ key: 'Defesa Col - Defesa Finalizações', label: 'Defesa das finalizações' }, { key: 'Defesa Col - Cobertura Pivô', label: 'Cobertura do pivô adversário' }, { key: 'Defesa Col - Bolas Paradas', label: 'Defesa das bolas paradas' }, { key: 'Defesa Col - Segundo Rebote', label: 'Controle do segundo rebote' }] },
      { section: 'Transição Defensiva', fields: [{ key: 'Defesa Col - Reação Perda', label: 'Reação após perder a posse' }, { key: 'Defesa Col - Recomposição', label: 'Recomposição' }, { key: 'Defesa Col - Contra-ataques', label: 'Organização contra contra-ataques' }, { key: 'Defesa Col - Retorno Jogadores', label: 'Retorno dos jogadores' }] },
      { section: 'Comunicação e Organização', fields: [{ key: 'Defesa Col - Comunicação Atletas', label: 'Comunicação entre os atletas' }, { key: 'Defesa Col - Liderança Defensiva', label: 'Liderança defensiva' }, { key: 'Defesa Col - Coordenação Movimentos', label: 'Coordenação dos movimentos' }, { key: 'Defesa Col - Disciplina Tática', label: 'Disciplina tática' }] }
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
    let text = "Desempenho Ofensivo no Futsal: ";
    const decisao = Number(getMedia(['Ataque Ind - Momento', 'Ataque Ind - Decisão', 'Ataque Ind - Escolha Jogadas'], info));
    if (decisao >= 4) text += "O atleta demonstra uma altíssima capacidade de tomar decisões acertadas em curtos espaços de tempo, evitando finalizações precipitadas e compreendendo a dinâmica intensa da quadra. ";
    else if (decisao <= 2) text += "Toma decisões precipitadas e muitas vezes erra a leitura da jogada, optando por finalizações precipitadas de baixa probabilidade em vez de dar prosseguimento. ";
    else text += "Possui leitura funcional da quadra, mas as decisões sob forte pressão ainda sofrem oscilação e podem ser refinadas. ";
    
    const criacao = Number(getMedia(['Ataque Ind - Assistências', 'Ataque Ind - Criação', 'Ataque Ind - Passes Verticais'], info));
    if (criacao >= 4) text += "Destaque absoluto na construção, ditando o ritmo, efetuando infiltrações velozes e fornecendo o passe vertical com precisão invejável. ";
    else if (criacao <= 2) text += "Dificuldade na construção ofensiva. Joga de costas ou lateralmente, apresentando falhas graves no passe em progressão e pouca verticalidade. ";
    
    const movimentacao = Number(getMedia(['Ataque Ind - Rotações', 'Ataque Ind - Sincronização', 'Ataque Ind - Ocupação Quadra'], info));
    if (movimentacao >= 4) text += "A sincronização tática do atleta nas rotações ofensivas e padrões de movimentação fluem perfeitamente. ";
    else if (movimentacao <= 2) text += "Apresenta estagnação e quebra a sincronia das rotações da equipe, demonstrando confusão tática em movimentações coordenadas. ";
    
    return text;
  };

  const gerarDiagnosticoIndDefesa = (info) => {
    let text = "Desempenho Defensivo no Futsal: ";
    const pressao = Number(getMedia(['Defesa Ind - Intensidade Pressão', 'Defesa Ind - Forçar Erros', 'Defesa Ind - Recuperação Posse'], info));
    if (pressao >= 4) text += "Altíssima intensidade ao aplicar pressão na bola, sufocando o adversário nos espaços exíguos e forçando sucessivos erros. Excelente agressividade defensiva. ";
    else if (pressao <= 2) text += "Passividade no combate direto. Permite ao adversário tempo e conforto para pensar e executar suas ações ofensivas. ";
    else text += "Nível mediano de pressão e marcação. Cumpre sua função, mas não sobressai como um agente recuperador de posse. ";
    
    const cobertura = Number(getMedia(['Defesa Ind - Cobertura Companheiros', 'Defesa Ind - Trocas Marcação', 'Defesa Ind - Fechamento Linhas'], info));
    if (cobertura >= 4) text += "Exímio leitor das trocas de marcação. Flutua, acompanha infiltrações e fecha linhas de passe com precisão milimétrica. ";
    else if (cobertura <= 2) text += "Constantes falhas na cobertura e atraso considerável durante as trocas de marcação, deixando os companheiros expostos. ";
    
    return text;
  };

  const gerarDiagnosticoGoleiro = (info) => {
    let text = "Avaliação do Goleiro de Futsal: ";
    const defesa = Number(getMedia(['Goleiro - Chutes Próximos', 'Goleiro - Um contra Um', 'Goleiro - Reflexo'], info));
    if (defesa >= 4) text += "Atleta de extrema explosão e reflexos excepcionais em finalizações de queima-roupa e situações cara-a-cara, transmitindo máxima segurança sob as traves. ";
    else if (defesa <= 2) text += "Lentidão acentuada para defesas próximas e deficiência de cobertura visual no 1 contra 1. Sofre com bolas velozes e chutes de bico. ";
    else text += "Performance razoável na meta, defendendo o que se espera de sua posição, mas precisando aprimorar reações agudas em chutes repentinos. ";
    
    const golLinha = Number(getMedia(['Goleiro - Circulação Ofensiva', 'Goleiro - Decisão Goleiro-Linha', 'Goleiro - Segurança Posse'], info));
    if (golLinha >= 4) text += "Destaca-se imensamente como goleiro-linha/goleiro-construtor. Atua com naturalidade no campo ofensivo e acerta na tomada de decisão, agindo como verdadeiro quinto homem. ";
    else if (golLinha <= 2) text += "Apresenta nervosismo e limitações severas com a posse de bola avançada. Perfil quase que inteiramente defensivo e conservador. ";
    
    return text;
  };

  const gerarDiagnosticoColAtaque = (info) => {
    let text = "Organização Ofensiva Coletiva (Futsal): ";
    const organizacao = Number(getMedia(['Ataque Col - Circulação', 'Ataque Col - Rotações', 'Ataque Col - Mobilidade'], info));
    if (organizacao >= 4) text += "A equipe apresenta fluidez formidável em quadra, com rotações agressivas, excelente movimentação sem a bola e obediência total ao modelo de jogo do futsal moderno. ";
    else if (organizacao <= 2) text += "O time joga de forma engessada, estática, excessivamente dependente de lances isolados ou genialidade de um único jogador. Falta rodízio estruturado. ";
    else text += "Equipe apresenta certa mobilidade, contudo por vezes carece de mais paciência ou rotação profunda, apressando o último passe e perdendo o volume. ";
    
    const finalizacao = Number(getMedia(['Ataque Col - Qualidade Finalizações', 'Ataque Col - Eficiência Ofensiva', 'Ataque Col - Aproveitamento Oportunidades'], info));
    if (finalizacao >= 4) text += "O aproveitamento é alto, conseguindo converter muito do volume criado através de boa infiltração e quebra de linhas eficiente. ";
    else if (finalizacao <= 2) text += "Desperdício alto de gols feitos ou extrema ineficácia em penetrar defesas fechadas. ";
    
    return text;
  };

  const gerarDiagnosticoColDefesa = (info) => {
    let text = "Solidez Defensiva Coletiva (Futsal): ";
    const compactacao = Number(getMedia(['Defesa Col - Compactação', 'Defesa Col - Trocas Defensivas', 'Defesa Col - Fechamento Linhas'], info));
    if (compactacao >= 4) text += "Estrutura defensiva muito compacta e reativa. As coberturas funcionam e as linhas de passe pelo meio estão sempre congestionadas. ";
    else if (compactacao <= 2) text += "Excesso de espaços na defesa, os jogadores não se comunicam e as trocas de marcação resultam em atletas adversários completamente livres pelo miolo. ";
    else text += "Sistema razoavelmente postado, porém sofre quando submetido a intensa variação tática ou bolas paradas ensaiadas. ";
    
    const transicao = Number(getMedia(['Defesa Col - Reação Perda', 'Defesa Col - Recomposição', 'Defesa Col - Retorno Jogadores'], info));
    if (transicao <= 2) text += "Recomposição letárgica. O time toma muitos gols de contra-ataque por desleixo ou fadiga no retorno defensivo imediato. ";
    
    return text;
  };

  const structure = structures[tipoAnalise] || [];

  return (
    <div className="card-flat shadow-sm border p-4 bg-white border-top border-4 border-orange">
      <h5 className="fw-bold mb-4 text-blue-dark">Análise Técnica - Futsal Profissional</h5>
      
      <form onSubmit={internalHandleSubmit}>
        <div className="row g-3 mb-4 border-bottom pb-4">
          <div className="col-md-3">
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
          <div className="col-md-3">
            <ContextoSelector modalidade={formData.modalidade || 'Futsal'} value={formData.contexto} onChange={handleInputChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold small text-muted">Data da Análise</label>
            <input type="date" className="form-control bg-light" name="data" value={formData.data} onChange={handleInputChange} required />
          </div>
          <div className="col-md-3">
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
              <small className="text-muted mt-1 d-block">Nas análises coletivas, a avaliação ficará atribuída ao líder/selecionado no cadastro.</small>
            )}
          </div>
        </div>

        {tipoAnalise && (
          <div className="mt-4 p-0">
            <p className="small text-muted mb-4">Avalie de 1 a 5 cada um dos critérios (1 = Insuficiente, 5 = Excelente) aplicados à intensidade do futsal.</p>

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
              <textarea className="form-control bg-white" name="observacoes" rows="2" value={formData.observacoes} onChange={handleInputChange} placeholder="Comentários extras sobre o posicionamento, inteligência tática, emocional..."></textarea>
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

export default FutsalForm;
