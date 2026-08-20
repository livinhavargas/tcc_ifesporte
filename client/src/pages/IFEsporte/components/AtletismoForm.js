import React, { useEffect } from 'react';
import ContextoSelector from './ContextoSelector';

const atletismoForms = {
  '100m': {
    'Saída': ['Tempo de reação', 'Explosão inicial', 'Posicionamento na largada', 'Técnica da saída'],
    'Aceleração': ['Aceleração', 'Frequência das passadas', 'Comprimento das passadas', 'Coordenação dos braços', 'Inclinação corporal'],
    'Velocidade Máxima': ['Manutenção da velocidade', 'Estabilidade corporal', 'Relaxamento muscular', 'Oscilações durante a corrida'],
    'Final da prova': ['Queda de rendimento', 'Manutenção da técnica', 'Resistência à fadiga']
  },
  '200m': {
    'Saída': ['Tempo de reação', 'Explosão inicial', 'Posicionamento na largada', 'Técnica da saída'],
    'Aceleração': ['Aceleração', 'Frequência das passadas', 'Comprimento das passadas', 'Coordenação dos braços', 'Inclinação corporal'],
    'Velocidade Máxima': ['Manutenção da velocidade', 'Estabilidade corporal', 'Relaxamento muscular', 'Oscilações durante a corrida'],
    'Curva': ['Eficiência na curva', 'Equilíbrio corporal', 'Saída da curva', 'Transição curva-reta', 'Manutenção da velocidade após a curva'],
    'Final da prova': ['Queda de rendimento', 'Manutenção da técnica', 'Resistência à fadiga']
  },
  '400m': {
    'Distribuição do esforço': ['Ritmo inicial', 'Ritmo intermediário', 'Ritmo final', 'Manutenção da velocidade', 'Resistência à fadiga', 'Técnica durante toda a prova']
  },
  '800m': {
    'Geral': ['Estratégia de prova', 'Ritmo', 'Posicionamento', 'Economia de corrida', 'Sprint final', 'Controle do esforço']
  },
  '1500m': {
    'Geral': ['Ritmo', 'Regularidade', 'Posicionamento', 'Economia de movimento', 'Resistência', 'Sprint final']
  },
  '3000m': {
    'Geral': ['Regularidade do ritmo', 'Cadência', 'Economia de corrida', 'Resistência', 'Controle da fadiga']
  },
  '5000m': {
    'Geral': ['Ritmo', 'Regularidade', 'Economia de corrida', 'Resistência', 'Recuperação após acelerações', 'Controle do esforço']
  },
  'Revezamento 100m': {
    'Corredor 1': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 2': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 3': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 4': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Desempenho da Equipe': ['Sincronização', 'Tempo das trocas', 'Eficiência nas zonas de passagem', 'Perda de velocidade durante as trocas', 'Organização da equipe']
  },
  'Revezamento 4x100': {
    'Corredor 1': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 2': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 3': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 4': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Desempenho da Equipe': ['Sincronização', 'Tempo das trocas', 'Eficiência nas zonas de passagem', 'Perda de velocidade durante as trocas', 'Organização da equipe']
  },
  'Revezamento 400m': {
    'Corredor 1': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 2': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 3': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 4': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Desempenho da Equipe': ['Sincronização', 'Tempo das trocas', 'Eficiência nas zonas de passagem', 'Perda de velocidade durante as trocas', 'Organização da equipe', 'Estratégia da ordem dos corredores', 'Distribuição do esforço da equipe', 'Manutenção do ritmo coletivo']
  },
  'Revezamento 4x400': {
    'Corredor 1': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 2': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 3': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Corredor 4': ['Saída', 'Velocidade', 'Recepção do bastão', 'Entrega do bastão'],
    'Desempenho da Equipe': ['Sincronização', 'Tempo das trocas', 'Eficiência nas zonas de passagem', 'Perda de velocidade durante as trocas', 'Organização da equipe', 'Estratégia da ordem dos corredores', 'Distribuição do esforço da equipe', 'Manutenção do ritmo coletivo']
  },
  'Pentatlo': {
    'Provas e Transições': ['Ritmo e Distribuição do Esforço', 'Técnica de Prova', 'Recuperação entre Provas', 'Manutenção da Eficiência'],
    'Desempenho Geral': ['Resistência à Fadiga', 'Consistência do Desempenho', 'Preparação Física e Mental']
  },
  '100m com Barreiras': {
    'Largada e Aproximação': ['Tempo de reação', 'Explosão na saída', 'Ritmo de aproximação à 1ª barreira'],
    'Transposição de Barreiras': ['Ataque à barreira', 'Perda de altura', 'Ação da perna de ataque e de reboque', 'Manutenção do ritmo entre barreiras'],
    'Sprint Final': ['Aceleração pós-última barreira', 'Manutenção da velocidade', 'Resistência à fadiga']
  },
  '110m com Barreiras': {
    'Largada e Aproximação': ['Tempo de reação', 'Explosão na saída', 'Ritmo de aproximação à 1ª barreira'],
    'Transposição de Barreiras': ['Ataque à barreira', 'Perda de altura', 'Ação da perna de ataque e de reboque', 'Manutenção do ritmo entre barreiras'],
    'Sprint Final': ['Aceleração pós-última barreira', 'Manutenção da velocidade', 'Resistência à fadiga']
  },
  'Distância': {
    'Corrida de aproximação': ['Velocidade', 'Ritmo', 'Estabilidade'],
    'Impulsão': ['Precisão na tábua', 'Potência', 'Técnica da impulsão'],
    'Fase aérea': ['Controle corporal', 'Equilíbrio', 'Técnica'],
    'Aterrissagem': ['Extensão das pernas', 'Aproveitamento da distância', 'Técnica da queda']
  },
  'Altura': {
    'Geral': ['Corrida de aproximação', 'Curva de aproximação', 'Impulsão', 'Passagem sobre o sarrafo', 'Controle corporal', 'Aterrissagem']
  },
  'Triplo': {
    'Hop': ['Equilíbrio', 'Potência', 'Técnica'],
    'Step': ['Manutenção da velocidade', 'Coordenação', 'Estabilidade'],
    'Jump': ['Impulsão final', 'Controle corporal', 'Aterrissagem']
  },
  'Peso': {
    'Geral': ['Postura inicial', 'Deslocamento', 'Transferência de força', 'Potência', 'Técnica de lançamento', 'Equilíbrio final']
  },
  'Dardo': {
    'Geral': ['Corrida de aproximação', 'Ritmo', 'Cruzamento dos passos', 'Transferência de força', 'Técnica de lançamento', 'Equilíbrio após o lançamento']
  },
  'Disco': {
    'Geral': ['Rotação', 'Equilíbrio', 'Velocidade angular', 'Técnica de lançamento', 'Controle corporal', 'Finalização do movimento']
  }
};

const getFormStructure = (modalidadeStr) => {
  if (!modalidadeStr) return null;
  const match = Object.keys(atletismoForms).find(key => modalidadeStr.includes(key));
  return match ? { key: match, structure: atletismoForms[match] } : null;
};

const AtletismoForm = ({ formData, setFormData, handleInputChange, handleSubmit, students, setMensagem }) => {
  const formInfo = getFormStructure(formData.modalidade);
  const structure = formInfo?.structure || {};
  const isRevezamento = formInfo?.key?.includes('Revezamento');

  // Inicializa respostas vazias ao montar se nao estiver editando
  useEffect(() => {
    if (formInfo && !formData.editingId && (!formData.respostas || Object.keys(formData.respostas).length === 0)) {
      const novasRespostas = {};
      Object.entries(structure).forEach(([section, items]) => {
        items.forEach(item => {
          novasRespostas[`${section} - ${item}`] = 3;
        });
      });
      setFormData(prev => ({ ...prev, respostas: novasRespostas }));
    }
  }, [formData.modalidade, formData.editingId]);

  const handleRespostaChange = (key, val) => {
    setFormData(prev => ({
      ...prev,
      respostas: { ...prev.respostas, [key]: Number(val) }
    }));
  };

  const generateDiagnostic = () => {
    let text = "";
    let minNota = 6, maxNota = -1;
    let minAtr = '', maxAtr = '';
    let soma = 0, count = 0;
    
    Object.keys(formData.respostas || {}).forEach(key => {
      const nota = Number(formData.respostas[key]);
      soma += nota;
      count++;
      if (nota > maxNota) { maxNota = nota; maxAtr = key; }
      if (nota < minNota) { minNota = nota; minAtr = key; }
    });
    
    if (count === 0) return "";

    const media = (soma / count).toFixed(1);
    const nivel = media >= 4.5 ? 'Excelente' : media >= 3.5 ? 'Bom' : media >= 2.5 ? 'Regular' : 'Atenção';
    
    const formatAtr = (atr) => atr.split(' - ').pop();
    const sectionName = (atr) => atr.split(' - ')[0];
    const sub = formInfo?.key || 'Atletismo';
    
    if (isRevezamento) {
      text += `A equipe obteve um Índice Técnico Geral ${nivel} (${media}) na prova de Revezamento ${sub}. `;
      text += `O principal ponto forte apresentado foi "${formatAtr(maxAtr)}" no contexto de ${sectionName(maxAtr)} (Nota ${maxNota}). `;
      if (minNota < 4) {
        text += `Aspectos que precisam ser melhorados: a equipe demonstrou maior dificuldade em "${formatAtr(minAtr)}" (${sectionName(minAtr)}), com nota ${minNota}. `;
        if (minAtr.toLowerCase().includes('troca') || minAtr.toLowerCase().includes('bastão')) {
          text += `Como recomendação, é fundamental intensificar o treinamento focado na sincronia das passagens de bastão para evitar perda de velocidade nas zonas de troca. `;
        }
      }
    } else {
      text += `O atleta obteve uma Nota Técnica Geral ${nivel} (${media}) na prova de ${sub}. `;
      text += `O principal ponto forte identificado foi "${formatAtr(maxAtr)}" na fase de ${sectionName(maxAtr)} (Nota ${maxNota}). `;
      if (minNota < 4) {
        text += `Aspecto que precisa ser aprimorado: houve perda de desempenho técnico em "${formatAtr(minAtr)}" durante a fase de ${sectionName(minAtr)} (Nota ${minNota}). `;
      }
      
      // Regras Específicas
      if (sub === '200m' && minAtr.toLowerCase().includes('curva')) {
        text += `Identificou-se uma perda sensível de rendimento durante a curva ou na transição para a reta, sendo recomendado foco técnico nesta etapa. `;
      }
      if (sub === '400m') {
        if (minNota < 4 && minAtr.includes('Ritmo')) {
          text += `A distribuição de esforço não foi ideal, prejudicando a manutenção da velocidade. É sugerido trabalhar a resistência de velocidade. `;
        } else {
          text += `O atleta distribuiu corretamente o esforço ao longo da corrida. `;
        }
      }
      if (sub === '800m' && (minAtr.includes('Sprint final') || minAtr.includes('Controle do esforço'))) {
        text += `Houve indícios de aceleração precoce ou perda excessiva de rendimento na parte final. Melhorar a estratégia de prova é crucial. `;
      }
      if (sub === '1500m') {
        text += `A estratégia adotada apresentou consistência, porém requer ajustes na cadência e economia de movimento. `;
      }
      if (sub === '3000m' || sub === '5000m') {
        if (minNota < 3.5) {
          text += `Foram notadas grandes variações e oscilações significativas de desempenho, afetando a regularidade do ritmo. `;
        } else {
          text += `Houve constância e excelente controle de fadiga durante toda a prova. `;
        }
      }
      if (sub === 'Distância' && minNota < 4) {
        text += `O relatório aponta que a fase de ${sectionName(minAtr)} foi onde ocorreu a maior perda de rendimento e performance. `;
      }
      if (sub === 'Altura' && minNota < 4) {
        text += `Durante a análise técnica, a etapa de ${formatAtr(minAtr)} foi a que apresentou maior dificuldade para o atleta. `;
      }
      if (sub === 'Triplo' && minNota < 4) {
        text += `Na avaliação mecânica, a fase de ${sectionName(minAtr)} necessita de maior desenvolvimento e treino específico de pliometria. `;
      }
      if (sub === 'Peso' && (minAtr.includes('Transferência') || minAtr.includes('Técnica'))) {
        text += `O diagnóstico indica falhas na transferência de força e execução técnica do arremesso, o que diminui a potência final. `;
      }
      if (sub === 'Dardo' && minNota < 4) {
        text += `A avaliação apontou possíveis perdas de potência e eficiência técnica durante a execução, especificamente em ${formatAtr(minAtr)}. `;
      }
      if (sub === 'Disco' && (minAtr.includes('Sincronização') || minAtr.includes('Estabilidade') || minAtr.includes('Rotação'))) {
        text += `Destaca-se a necessidade imperativa de melhorar a sincronização e estabilidade do eixo corporal durante o giro. `;
      }
    }
    
    text += `Conclusão técnica: A análise indica que o atleta possui características consistentes, mas a margem de melhoria reside no refinamento das especificidades táticas e coordenativas da prova.`;
    return text;
  };

  const processSubmit = (e) => {
    e.preventDefault();
    if (!formData.aluno) {
      setMensagem('Preencha o Aluno Avaliado.');
      return;
    }
    const diagnostico = generateDiagnostic();
    
    // Injetamos o diagnóstico
    handleSubmit(e, diagnostico, isRevezamento ? 'Coletiva' : 'Individual');
  };

  return (
    <div className="card-flat shadow-sm mb-5 border p-4 bg-white border-top border-4 border-orange">
      <h5 className="fw-bold mb-4 text-blue-dark">Avaliação Técnica - {formInfo?.key || formData.modalidade}</h5>
      
      <form onSubmit={processSubmit}>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold small text-muted">Aluno(s) Avaliado(s) / Equipe</label>
            <select className="form-select bg-light" name="aluno" value={formData.aluno} onChange={handleInputChange} required>
              {(() => {
                const filteredStudents = students.filter(s => {
                  if (formData.modalidade?.includes('100m com Barreiras')) return s.sexo === 'Feminino';
                  if (formData.modalidade?.includes('110m com Barreiras')) return s.sexo === 'Masculino';
                  return true;
                });

                if (filteredStudents.length === 0) {
                  return <option value="">Nenhum atleta elegível cadastrado nesta modalidade.</option>;
                }
                return (
                  <>
                    <option value="">Selecione o aluno/líder da equipe...</option>
                    {filteredStudents.map(s => <option key={s._id} value={s._id}>{s.nome} ({s.sexo})</option>)}
                  </>
                );
              })()}
            </select>
            {isRevezamento && <small className="text-muted mt-1 d-block">Para análise de revezamento, selecione o líder ou um dos membros da equipe. A avaliação englobará todos.</small>}
          </div>
          <div className="col-md-6">
            <ContextoSelector modalidade={formData.modalidade || 'Atletismo'} value={formData.contexto} onChange={handleInputChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold small text-muted">Data da Análise</label>
            <input type="date" className="form-control bg-light" name="data" value={formData.data} onChange={handleInputChange} required />
          </div>
        </div>

        {Object.entries(structure).map(([section, items]) => (
          <div key={section} className="bg-light p-4 rounded-4 mb-4 border">
            <h6 className="fw-bold text-orange mb-3 border-bottom pb-2"><i className="bi bi-record-circle me-2"></i>{section}</h6>
            <div className="row g-4">
              {items.map(item => {
                const key = `${section} - ${item}`;
                return (
                  <div key={key} className="col-md-6">
                    <div className="d-flex justify-content-between mb-1">
                      <label className="fw-bold text-blue-dark">{item}</label>
                      <span className="badge bg-blue-dark text-white fw-bold">{formData.respostas[key] || 3} / 5</span>
                    </div>
                    <input 
                      type="range" 
                      className="form-range" 
                      min="1" max="5" step="1" 
                      value={formData.respostas[key] || 3} 
                      onChange={(e) => handleRespostaChange(key, e.target.value)} 
                    />
                    <div className="d-flex justify-content-between small text-muted">
                      <span>Precisa Melhorar</span>
                      <span>Excelente</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="row mt-4">
          <div className="col-12 text-end">
            <button type="submit" className="btn btn-orange px-5 py-2 fw-bold rounded-pill text-white shadow-sm">
              <i className="bi bi-check-circle-fill me-2"></i>
              {formData?.editingId ? 'Salvar Alterações' : 'Salvar Análise'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AtletismoForm;
