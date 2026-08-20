import React, { useState, useEffect } from 'react';
import ContextoSelector from './ContextoSelector';

const VoleiForm = ({ formData, setFormData, handleInputChange, handleSubmit, students, setMensagem }) => {
  const [tipoAnalise, setTipoAnalise] = useState('');
  const [formInfo, setFormInfo] = useState({});
  const [avaliarLevantamento, setAvaliarLevantamento] = useState(false);

  // Auto-detectar tipoAnalise APENAS em EDIT mode
  useEffect(() => {
    if (formData.editingId) {
      if (formData.tipoAnalise) {
        setTipoAnalise(formData.tipoAnalise);
      } else if (formData.subtipo && (formData.subtipo === 'Individual' || formData.subtipo === 'Coletiva')) {
        setTipoAnalise(formData.subtipo);
      } else if (formData.respostas && Object.keys(formData.respostas).length > 0) {
        setTipoAnalise('Individual');
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
      setMensagem('Por favor, selecione o tipo de análise (Ex: Análise Individual).');
      return;
    }

    let diagnostico = '';
    if (tipoAnalise === 'Individual') diagnostico = gerarDiagnosticoInd(formInfo);
    else if (tipoAnalise === 'Coletiva') diagnostico = gerarDiagnosticoCol(formInfo);

    const tipoFinal = tipoAnalise;
    handleSubmit(e, diagnostico, tipoFinal);
  };

  const indSections = [
    { section: 'Saque', fields: [{ key: 'Volei Ind - Precisao Saque', label: 'Precisão do saque' }, { key: 'Volei Ind - Potencia Saque', label: 'Potência' }, { key: 'Volei Ind - Regularidade Saque', label: 'Regularidade' }, { key: 'Volei Ind - Variedade Saque', label: 'Variedade (viagem, flutuante, tático)' }, { key: 'Volei Ind - Direcionamento Saque', label: 'Direcionamento' }, { key: 'Volei Ind - Eficiencia Saque', label: 'Eficiência para dificultar a recepção' }, { key: 'Volei Ind - Erros Saque', label: 'Controle de erros de saque' }] },
    { section: 'Recepção', fields: [{ key: 'Volei Ind - Qualidade Plataforma', label: 'Qualidade da plataforma' }, { key: 'Volei Ind - Posicionamento Recepcao', label: 'Posicionamento corporal' }, { key: 'Volei Ind - Controle Bola', label: 'Controle da bola' }, { key: 'Volei Ind - Precisao Recepcao', label: 'Precisão da recepção' }, { key: 'Volei Ind - Estabilidade Recepcao', label: 'Estabilidade técnica' }, { key: 'Volei Ind - Saques Fortes', label: 'Eficiência diante de saques fortes' }, { key: 'Volei Ind - Regularidade Recepcao', label: 'Regularidade' }] }
  ];
  
  if (avaliarLevantamento) {
    indSections.push(
      { section: 'Levantamento', fields: [{ key: 'Volei Ind - Precisao Levantamento', label: 'Precisão dos levantamentos' }, { key: 'Volei Ind - Distribuicao Levantamento', label: 'Distribuição das jogadas' }, { key: 'Volei Ind - Velocidade Levantamento', label: 'Velocidade do levantamento' }, { key: 'Volei Ind - Escolha Atacante', label: 'Escolha do atacante' }, { key: 'Volei Ind - Variacao Ofensiva', label: 'Variação ofensiva' }, { key: 'Volei Ind - Decisao Levantamento', label: 'Tomada de decisão' }, { key: 'Volei Ind - Criatividade', label: 'Criatividade' }] }
    );
  }

  indSections.push(
    { section: 'Ataque', fields: [{ key: 'Volei Ind - Tempo Ataque', label: 'Tempo de ataque' }, { key: 'Volei Ind - Potencia Ataque', label: 'Potência' }, { key: 'Volei Ind - Precisao Ataque', label: 'Precisão' }, { key: 'Volei Ind - Escolha Direcoes', label: 'Escolha das direções' }, { key: 'Volei Ind - Variedade Golpes', label: 'Variedade de golpes' }, { key: 'Volei Ind - Eficiencia Ofensiva', label: 'Eficiência ofensiva' }, { key: 'Volei Ind - Aproveitamento Ataque', label: 'Aproveitamento das oportunidades' }] },
    { section: 'Bloqueio', fields: [{ key: 'Volei Ind - Tempo Salto', label: 'Tempo do salto' }, { key: 'Volei Ind - Posicionamento Bloqueio', label: 'Posicionamento' }, { key: 'Volei Ind - Leitura Bloqueio', label: 'Leitura do ataque adversário' }, { key: 'Volei Ind - Fechamento Espacos', label: 'Fechamento dos espaços' }, { key: 'Volei Ind - Coordenacao Bloqueio', label: 'Coordenação com demais bloqueadores' }, { key: 'Volei Ind - Eficiencia Bloqueio', label: 'Eficiência do bloqueio' }] },
    { section: 'Defesa', fields: [{ key: 'Volei Ind - Posicionamento Defensivo', label: 'Posicionamento defensivo' }, { key: 'Volei Ind - Tempo Reacao', label: 'Tempo de reação' }, { key: 'Volei Ind - Controle Defesa', label: 'Controle das bolas defendidas' }, { key: 'Volei Ind - Cobertura Ataques', label: 'Cobertura dos ataques' }, { key: 'Volei Ind - Recuperacao Dificeis', label: 'Recuperação de bolas difíceis' }, { key: 'Volei Ind - Regularidade Defesa', label: 'Regularidade' }] },
    { section: 'Movimentação', fields: [{ key: 'Volei Ind - Deslocamento', label: 'Deslocamento' }, { key: 'Volei Ind - Agilidade', label: 'Agilidade' }, { key: 'Volei Ind - Cobertura Quadra', label: 'Cobertura da quadra' }, { key: 'Volei Ind - Posicionamento Rally', label: 'Posicionamento durante os rallys' }, { key: 'Volei Ind - Recuperacao Acao', label: 'Recuperação após cada ação' }] },
    { section: 'Inteligência Tática', fields: [{ key: 'Volei Ind - Leitura Jogo', label: 'Leitura do jogo' }, { key: 'Volei Ind - Tomada Decisao Tatica', label: 'Tomada de decisão' }, { key: 'Volei Ind - Comunicacao Tatica', label: 'Comunicação' }, { key: 'Volei Ind - Disciplina Tatica', label: 'Disciplina tática' }, { key: 'Volei Ind - Adaptacao', label: 'Adaptação às mudanças da partida' }] },
    { section: 'Aspectos Comportamentais', fields: [{ key: 'Volei Ind - Concentracao', label: 'Concentração' }, { key: 'Volei Ind - Controle Emocional', label: 'Controle emocional' }, { key: 'Volei Ind - Lideranca', label: 'Liderança' }, { key: 'Volei Ind - Comunicacao Comp', label: 'Comunicação' }, { key: 'Volei Ind - Comprometimento', label: 'Comprometimento' }, { key: 'Volei Ind - Regularidade Partida', label: 'Regularidade durante toda a partida' }] }
  );

  const structures = {
    'Individual': indSections,
    'Coletiva': [
      { section: 'Sistema de Recepção', fields: [{ key: 'Volei Col - Organizacao Recepcao', label: 'Organização da recepção' }, { key: 'Volei Col - Comunicacao Recepcao', label: 'Comunicação' }, { key: 'Volei Col - Cobertura Recepcao', label: 'Cobertura da quadra' }, { key: 'Volei Col - Qualidade Primeiro', label: 'Qualidade do primeiro toque' }, { key: 'Volei Col - Estabilidade Recepcao', label: 'Estabilidade da recepção' }] },
      { section: 'Distribuição Ofensiva', fields: [{ key: 'Volei Col - Variedade Jogadas', label: 'Variedade das jogadas' }, { key: 'Volei Col - Distribuicao Ataques', label: 'Distribuição dos ataques' }, { key: 'Volei Col - Velocidade Ofensiva', label: 'Velocidade ofensiva' }, { key: 'Volei Col - Uso Centrais', label: 'Uso dos centrais' }, { key: 'Volei Col - Diversificacao Atacantes', label: 'Diversificação dos atacantes' }, { key: 'Volei Col - Previsibilidade Ofensiva', label: 'Previsibilidade do sistema ofensivo' }] },
      { section: 'Ataque Coletivo', fields: [{ key: 'Volei Col - Eficiencia Ofensiva', label: 'Eficiência ofensiva' }, { key: 'Volei Col - Aproveitamento', label: 'Aproveitamento das oportunidades' }, { key: 'Volei Col - Coordenacao Levantador Atacantes', label: 'Coordenação entre levantador e atacantes' }, { key: 'Volei Col - Variedade Ataques', label: 'Variedade dos ataques' }, { key: 'Volei Col - Conversao Contra-ataques', label: 'Conversão dos contra-ataques' }] },
      { section: 'Sistema de Bloqueio', fields: [{ key: 'Volei Col - Organizacao Bloqueio', label: 'Organização do bloqueio' }, { key: 'Volei Col - Bloqueio Simples', label: 'Bloqueio simples' }, { key: 'Volei Col - Bloqueio Duplo', label: 'Bloqueio duplo' }, { key: 'Volei Col - Bloqueio Triplo', label: 'Bloqueio triplo' }, { key: 'Volei Col - Fechamento Corredores', label: 'Fechamento dos corredores' }, { key: 'Volei Col - Sincronizacao Bloqueio', label: 'Sincronização' }] },
      { section: 'Sistema Defensivo', fields: [{ key: 'Volei Col - Posicionamento Defensivo', label: 'Posicionamento defensivo' }, { key: 'Volei Col - Cobertura Ataques', label: 'Cobertura dos ataques' }, { key: 'Volei Col - Recuperacao Bolas', label: 'Recuperação das bolas' }, { key: 'Volei Col - Organizacao Pos-bloqueio', label: 'Organização após o bloqueio' }, { key: 'Volei Col - Defesa Dificeis', label: 'Defesa de bolas difíceis' }] },
      { section: 'Transição', fields: [{ key: 'Volei Col - Transicao Defesa-Ataque', label: 'Transição defesa-ataque' }, { key: 'Volei Col - Transicao Ataque-Defesa', label: 'Transição ataque-defesa' }, { key: 'Volei Col - Velocidade Reorganizacao', label: 'Velocidade de reorganização' }, { key: 'Volei Col - Eficiencia Pos-recuperacao', label: 'Eficiência após recuperações' }] },
      { section: 'Comunicação', fields: [{ key: 'Volei Col - Comunicacao Rallys', label: 'Comunicação durante os rallys' }, { key: 'Volei Col - Organizacao Quadra', label: 'Organização em quadra' }, { key: 'Volei Col - Lideranca', label: 'Liderança' }, { key: 'Volei Col - Cooperacao Atletas', label: 'Cooperação entre os atletas' }] },
      { section: 'Organização Tática', fields: [{ key: 'Volei Col - Cumprimento Sistema', label: 'Cumprimento do sistema de jogo' }, { key: 'Volei Col - Sincronizacao Coletiva', label: 'Sincronização coletiva' }, { key: 'Volei Col - Disciplina Tatica', label: 'Disciplina tática' }, { key: 'Volei Col - Adaptacao Mudancas', label: 'Adaptação às mudanças da partida' }, { key: 'Volei Col - Leitura Adversario', label: 'Leitura coletiva do adversário' }] }
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

  const gerarDiagnosticoInd = (info) => {
    let text = "Avaliação Individual de Voleibol: ";
    
    const ataque = Number(getMedia(['Volei Ind - Tempo Ataque', 'Volei Ind - Escolha Direcoes', 'Volei Ind - Eficiencia Ofensiva'], info));
    const recepcao = Number(getMedia(['Volei Ind - Qualidade Plataforma', 'Volei Ind - Precisao Recepcao', 'Volei Ind - Estabilidade Recepcao'], info));
    
    if (ataque >= 4 && recepcao >= 4) text += "O atleta apresenta um equilíbrio invejável entre os sistemas de ataque e passe. A recepção é estável, alimentando os levantadores com o 'passe A', ao passo que suas finalizações de ataque são venenosas e cheias de variação direcional. ";
    else if (ataque >= 4 && recepcao <= 2) text += "Destaque ofensivo indiscutível, virando bolas com altíssima precisão e potência, porém, é alvo frequente dos sacadores adversários, pois sua plataforma de recepção quebra consideravelmente, dificultando a construção do time. ";
    else if (ataque <= 2 && recepcao >= 4) text += "Excelente base de recepção e defesa, garantindo os primeiros toques na mão do levantador, mas ineficiente no momento da virada de bola, pecando no tempo de ataque e potência. ";
    else text += "Atuação regular, sem comprometer gravemente a estrutura tática mas longe do brilhantismo técnico nos momentos decisivos. ";
    
    const bloqueio = Number(getMedia(['Volei Ind - Tempo Salto', 'Volei Ind - Leitura Bloqueio', 'Volei Ind - Fechamento Espacos'], info));
    if (bloqueio >= 4) text += "Lê perfeitamente o levantador oponente, flutuando para as extremidades em sincronia e armando bloqueios pesados e bem posicionados. ";
    else if (bloqueio <= 2) text += "Salta antecipado no bloqueio e sofre com fintas do levantador adversário, frequentemente 'caindo' nos bloqueios simples e deixando a paralela exposta. ";
    
    const mental = Number(getMedia(['Volei Ind - Controle Emocional', 'Volei Ind - Concentracao'], info));
    if (mental <= 2) text += "Abandona as diretrizes táticas em momentos de pressão e sofre apagões mentais prolongados durante longos rallys. ";

    return text;
  };

  const gerarDiagnosticoCol = (info) => {
    let text = "Avaliação Coletiva e Dinâmica de Jogo (Voleibol): ";
    const recepcao = Number(getMedia(['Volei Col - Organizacao Recepcao', 'Volei Col - Qualidade Primeiro', 'Volei Col - Estabilidade Recepcao'], info));
    const transicao = Number(getMedia(['Volei Col - Transicao Defesa-Ataque', 'Volei Col - Velocidade Reorganizacao', 'Volei Col - Eficiencia Pos-recuperacao'], info));
    
    if (recepcao >= 4) text += "Equipe com sistema de recepção extremamente sólido e estável, o que possibilita um 'Side-out' perfeito. O passe refinado tira a marcação do bloqueio adversário. ";
    else if (recepcao <= 2) text += "O grande calcanhar de Aquiles: a equipe é varrida por saques adversários (aces diretos ou quebras de passe), forçando o levantador a jogar invariavelmente bolas 'sujas' para as pontas (jogo previsível). ";
    else text += "Oscilações na linha de passe, que em momentos chave obriga os atacantes de ponta a lidarem constantemente com bloqueio triplo devido à bola alta. ";
    
    const ataque = Number(getMedia(['Volei Col - Eficiencia Ofensiva', 'Volei Col - Coordenacao Levantador Atacantes', 'Volei Col - Diversificacao Atacantes'], info));
    if (ataque >= 4) text += "A distribuição coletiva ofensiva não é óbvia. Usa inteligentemente todas as zonas, com sintonia fina na bola de tempo e na 'pipe'. ";
    else if (ataque <= 2) text += "Dependência excessiva de um único atacante (provavelmente o oposto). A ofensiva se tornou tão previsível que o sistema de bloqueio oponente praticamente o marca de forma tripla o tempo todo. ";
    
    return text;
  };

  const structure = structures[tipoAnalise] || [];

  return (
    <div className="card-flat shadow-sm border p-4 bg-white border-top border-4 border-orange">
      <h5 className="fw-bold mb-4 text-blue-dark">Análise Técnica - Voleibol Profissional</h5>
      
      <form onSubmit={internalHandleSubmit}>
        <div className="row g-3 mb-4 border-bottom pb-4">
          <div className="col-md-3">
            <label className="form-label fw-bold small text-muted">Tipo de Análise</label>
            <select className="form-select bg-light border-orange text-blue-dark fw-bold" value={tipoAnalise} onChange={handleTipoChange} required>
              <option value="">Selecione...</option>
              <option value="Individual">Análise Individual</option>
              <option value="Coletiva">Análise Coletiva</option>
            </select>
          </div>
          <div className="col-md-3">
            <ContextoSelector modalidade={formData.modalidade || 'Voleibol'} value={formData.contexto} onChange={handleInputChange} />
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
            {tipoAnalise === 'Coletiva' && (
              <small className="text-muted mt-1 d-block">Nas análises coletivas, a avaliação ficará atribuída ao líder/selecionado no cadastro.</small>
            )}
          </div>
          {tipoAnalise === 'Individual' && (
            <div className="col-md-2 d-flex align-items-end mb-2">
              <div className="form-check form-switch mt-3 pt-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="avLevantamento" 
                  checked={avaliarLevantamento} 
                  onChange={() => setAvaliarLevantamento(!avaliarLevantamento)} 
                />
                <label className="form-check-label small fw-bold text-muted ms-1" htmlFor="avLevantamento">
                  Avaliar Levantador
                </label>
              </div>
            </div>
          )}
        </div>

        {tipoAnalise && (
          <div className="mt-4 p-0">
            <p className="small text-muted mb-4">Avalie de 1 a 5 os fundamentos interligados do vôlei (1 = Insuficiente, 5 = Excelente). O sistema calculará médias e emitirá o parecer.</p>

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
              <textarea className="form-control bg-white" name="observacoes" rows="2" value={formData.observacoes} onChange={handleInputChange} placeholder="Comentários extras sobre mecânica de ataque, liderança..."></textarea>
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

export default VoleiForm;
