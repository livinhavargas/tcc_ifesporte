import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';

const dicionarioAtributos = {
  'Futebol/Futsal': {
    'Goleiro': ['reflexo', 'posicionamento', 'saidaDoGol', 'reposicao', 'agilidade'],
    'Defensor': ['desarme', 'posicionamento', 'forcaFisica', 'velocidade', 'passe'],
    'Atacante': ['finalizacao', 'drible', 'velocidade', 'visaoDeJogo', 'posicionamento'],
    'Geral': ['passe', 'fisico', 'tatica', 'coletividade', 'finalizacao']
  },
  'Vôlei de Quadra': {
    'Levantador': ['precisao', 'visaoDeJogo', 'saque', 'defesa', 'agilidade'],
    'Líbero': ['recepcao', 'defesa', 'reflexo', 'agilidade', 'posicionamento'],
    'Atacante': ['cortada', 'bloqueio', 'salto', 'saque', 'forca'],
    'Geral': ['saque', 'recepcao', 'tatica', 'coletividade', 'fisico']
  },
  'Basquete': {
    'Armador': ['passe', 'visao', 'drible', 'arremesso3pts', 'velocidade'],
    'Pivô': ['rebote', 'toco', 'forca', 'arremessoCurto', 'posicionamento'],
    'Geral': ['passe', 'fisico', 'tatica', 'arremesso', 'defesa']
  },
  'Geral': {
    'Geral': ['tecnica', 'tatica', 'fisico', 'mental', 'coletividade']
  }
};

const getAtributos = (mod, sub) => {
  let cat = 'Geral';
  if (mod && (mod.includes('Futebol') || mod.includes('Futsal'))) cat = 'Futebol/Futsal';
  else if (mod && mod.includes('Vôlei')) cat = 'Vôlei de Quadra';
  else if (mod && mod.includes('Basquete')) cat = 'Basquete';

  if (dicionarioAtributos[cat] && dicionarioAtributos[cat][sub]) {
    return dicionarioAtributos[cat][sub];
  }
  return dicionarioAtributos['Geral']['Geral'];
};

const RadarChart = ({ respostas }) => {
  const entries = Object.entries(respostas || {});
  if(entries.length === 0) return null;
  const numAttrs = entries.length;
  const angleStep = (Math.PI * 2) / numAttrs;
  
  const getPoint = (val, i, maxR = 40) => {
    const r = (val / 5) * maxR;
    const angle = i * angleStep - Math.PI / 2;
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    return {x, y};
  };

  const points = entries.map(([, val], i) => {
    const p = getPoint(val, i);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-100 h-100">
       {[1,2,3,4,5].map(level => {
         const pts = entries.map((_, i) => {
           const p = getPoint(level, i);
           return `${p.x},${p.y}`;
         }).join(' ');
         const isEdge = level === 5;
         return <polygon key={level} points={pts} fill={isEdge ? "#f8fafc" : "none"} stroke={isEdge ? "#cbd5e1" : "#e2e8f0"} strokeWidth={isEdge ? "1" : "0.5"}/>
       })}
       
       {entries.map((_, i) => {
         const p = getPoint(5, i);
         return <line key={`l${i}`} x1="50" y1="50" x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="0.5"/>
       })}
       
       <polygon points={points} fill="rgba(249, 115, 22, 0.4)" stroke="#f97316" strokeWidth="1.5"/>
       {entries.map(([, val], i) => {
         const p = getPoint(val, i);
         return <circle key={`c${i}`} cx={p.x} cy={p.y} r="1.5" fill="#ea580c" />
       })}
       
       {entries.map(([atr], i) => {
         const p = getPoint(5, i, 47); // push label slightly outside the edge
         let anchor = "middle";
         if (p.x < 45) anchor = "end";
         else if (p.x > 55) anchor = "start";
         
         let dy = p.y > 50 ? 3 : -1;
         
         const formatAttr = s => s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
         const label = formatAttr(atr);
         const shortLabel = label.length > 10 ? label.substring(0,8)+'.' : label;
         return <text key={`t${i}`} x={p.x} y={p.y+dy} fontSize="3.5" textAnchor={anchor} fill="#475569" fontWeight="bold">{shortLabel}</text>;
       })}
    </svg>
  );
};

const Analises = ({ embebed = false, defaultModalidade = '' }) => {
  const [students, setStudents] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [searchParams] = useSearchParams();
  const alunoIdParam = searchParams.get('alunoId');
  const novaAnaliseParam = searchParams.get('novaAnalise');
  const modalidadeParam = searchParams.get('modalidade');
  
  const userType = localStorage.getItem('tipo');

  const modalidadesValidas = ['Basquete', 'Futsal', 'Futebol', 'Handebol', 'Vôlei de Quadra'];
  const subtipos = ['Geral', 'Atacante', 'Defensor', 'Goleiro', 'Levantador', 'Líbero', 'Armador', 'Pivô'];

  const [formData, setFormData] = useState({
    aluno: '',
    modalidade: '',
    data: new Date().toISOString().split('T')[0],
    subtipo: 'Geral',
    observacoes: '',
    respostas: {}
  });

  useEffect(() => {
    if (embebed && defaultModalidade) {
      setFormData(prev => ({ ...prev, modalidade: defaultModalidade }));
    }
  }, [embebed, defaultModalidade]);

  useEffect(() => {
    const attrs = getAtributos(formData.modalidade, formData.subtipo);
    const novasRespostas = {};
    attrs.forEach(a => novasRespostas[a] = 3);
    setFormData(prev => ({ ...prev, respostas: novasRespostas }));
  }, [formData.modalidade, formData.subtipo]);

  useEffect(() => {
    fetchStudents();
    fetchAnalyses();
  }, []);

  useEffect(() => {
    if (novaAnaliseParam === 'true') {
      setShowForm(true);
      setFormData(prev => ({
        ...prev,
        aluno: alunoIdParam || prev.aluno,
        modalidade: modalidadeParam || prev.modalidade
      }));
    }
  }, [novaAnaliseParam, alunoIdParam, modalidadeParam]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/analysis', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (alunoIdParam) {
          setAnalyses(data.filter(a => a.aluno && a.aluno._id === alunoIdParam));
        } else if (userType === 'estudante') {
          const userEmail = localStorage.getItem('userEmail');
          setAnalyses(data.filter(a => a.aluno && a.aluno.email === userEmail));
        } else {
          setAnalyses(data);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRespostaChange = (atr, val) => {
    setFormData(prev => ({
      ...prev,
      respostas: { ...prev.respostas, [atr]: Number(val) }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!formData.aluno || !formData.modalidade) {
      setMensagem('Preencha Aluno e Modalidade.');
      return;
    }

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        setMensagem(error.message || 'Erro ao salvar análise');
        return;
      }

      setMensagem('✅ Análise salva e diagnóstico gerado com sucesso!');
      setTimeout(() => {
        setFormData(prev => ({ 
          aluno: '', 
          modalidade: embebed ? defaultModalidade : prev.modalidade, 
          data: new Date().toISOString().split('T')[0], 
          subtipo: 'Geral', 
          observacoes: '', 
          respostas: {} 
        }));
        setShowForm(false);
        setMensagem('');
        fetchAnalyses();
      }, 2000);
    } catch (error) {
      setMensagem('Erro de conexão ao servidor.');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Tem certeza que deseja excluir esta análise?')) return;
    try {
      await fetch(`/api/analysis/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const currentAttrs = Object.keys(formData.respostas || {});

  const content = (
    <div className={embebed ? "" : "container-fluid p-0"}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-blue-dark mb-1">Inteligência Esportiva</h2>
          <p className="text-muted mb-0">Avalie os atletas e deixe o sistema gerar os diagnósticos.</p>
        </div>
        {userType !== 'estudante' && (
          <button className="btn btn-primary shadow-sm rounded-pill px-4 py-2 fw-bold" onClick={() => setShowForm(!showForm)}>
            <i className={`bi bi-${showForm ? 'x-lg' : 'clipboard-data'} me-2`}></i>
            {showForm ? 'Cancelar Avaliação' : 'Nova Avaliação'}
          </button>
        )}
      </div>

      {showForm && userType !== 'estudante' && (
        <div className="card-flat shadow-sm mb-5 border p-4 bg-white border-top border-4 border-orange">
          <h5 className="fw-bold mb-4 text-blue-dark">Motor Analítico</h5>
          {mensagem && <div className={`alert ${mensagem.includes('✅') ? 'alert-success' : 'alert-danger'} fw-bold`}>{mensagem}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-bold small text-muted">Aluno Avaliado</label>
                <select className="form-select bg-light" name="aluno" value={formData.aluno} onChange={handleInputChange} required>
                  <option value="">Selecione um aluno...</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold small text-muted">Data</label>
                <input type="date" className="form-control bg-light" name="data" value={formData.data} onChange={handleInputChange} required />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold small text-muted">Modalidade Referência</label>
                <select className="form-select bg-light" name="modalidade" value={formData.modalidade} onChange={handleInputChange} required>
                  <option value="">Selecione...</option>
                  {modalidadesValidas.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label fw-bold small text-muted">Posição/Função</label>
                <select className="form-select bg-light" name="subtipo" value={formData.subtipo} onChange={handleInputChange} required>
                  {subtipos.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {formData.modalidade && currentAttrs.length > 0 && (
              <div className="bg-light p-4 rounded-4 mb-4 border">
                <h6 className="fw-bold text-orange mb-3"><i className="bi bi-sliders me-2"></i>Avaliação Específica: {formData.modalidade} ({formData.subtipo})</h6>
                <div className="row g-4">
                  {currentAttrs.map(atr => (
                    <div key={atr} className="col-md-6">
                      <div className="d-flex justify-content-between mb-1">
                        <label className="fw-bold text-blue-dark text-capitalize">{atr.replace(/([A-Z])/g, ' $1')}</label>
                        <span className="badge bg-blue-dark text-white fw-bold">{formData.respostas[atr]} / 5</span>
                      </div>
                      <input 
                        type="range" 
                        className="form-range" 
                        min="1" max="5" step="1" 
                        value={formData.respostas[atr] || 3} 
                        onChange={(e) => handleRespostaChange(atr, e.target.value)} 
                      />
                      <div className="d-flex justify-content-between small text-muted">
                        <span>Fraco</span>
                        <span>Excelente</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="row">
              <div className="col-12 mb-4">
                <label className="form-label fw-bold small text-muted">Observações Adicionais (Opcional)</label>
                <textarea className="form-control bg-light" name="observacoes" rows="2" value={formData.observacoes} onChange={handleInputChange} placeholder="Comentários sobre a avaliação..."></textarea>
              </div>
              <div className="col-12 text-end">
                <button type="submit" className="btn btn-orange px-5 py-2 fw-bold rounded-pill text-white shadow-sm">
                  <i className="bi bi-magic me-2"></i> Processar e Salvar Avaliação
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
         <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
      ) : analyses.length > 0 ? (
        <div className="row g-4">
          {analyses.map(analise => {
            const nivel = analise.resultados?.indiceGeral >= 4.5 ? 'Excelente' :
                          analise.resultados?.indiceGeral >= 3.5 ? 'Bom' :
                          analise.resultados?.indiceGeral >= 2.5 ? 'Regular' : 'Atenção';
                          
            const color = nivel === 'Excelente' ? '#22c55e' :
                          nivel === 'Bom' ? '#3b82f6' :
                          nivel === 'Regular' ? '#f59e0b' : '#ef4444';
                          
            return (
              <div key={analise._id} className="col-md-6">
                <div className="card-flat p-4 h-100 shadow-sm border position-relative">
                  {userType !== 'estudante' && (
                    <button 
                      className="btn btn-sm btn-light text-danger position-absolute top-0 end-0 mt-3 me-3 rounded-circle shadow-sm"
                      onClick={() => handleDelete(analise._id)}
                      title="Excluir Análise"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                  
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-blue-dark fw-bold fs-4 shadow-sm" style={{width: '60px', height: '60px', border: `3px solid ${color}`}}>
                        {analise.resultados?.indiceGeral || '?'}
                      </div>
                      <div>
                        <h5 className="fw-bold text-blue-dark mb-1">{analise.aluno?.nome || 'Atleta Removido'}</h5>
                        <div className="text-muted small">
                          <i className="bi bi-calendar-event me-1"></i> {new Date(analise.data).toLocaleDateString('pt-BR')} 
                          <span className="mx-2">•</span> 
                          <span className="badge bg-light text-dark border">{analise.modalidade} ({analise.subtipo || 'Geral'})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row align-items-center mt-4">
                    <div className="col-5 text-center">
                      <div style={{ width: '100%', maxWidth: '160px', margin: '0 auto' }}>
                        {analise.respostas && Object.keys(analise.respostas).length > 0 ? (
                          <RadarChart respostas={analise.respostas} />
                        ) : (
                          <div className="text-muted small py-4 border rounded bg-light">Sem dados de Radar</div>
                        )}
                      </div>
                    </div>
                    <div className="col-7">
                      <h6 className="fw-bold text-orange mb-2"><i className="bi bi-robot me-2"></i>Diagnóstico Inteligente</h6>
                      <p className="small text-secondary mb-0" style={{ lineHeight: '1.5' }}>
                        {analise.diagnostico || 'Avaliação legada (sem diagnóstico automático).'}
                      </p>
                    </div>
                  </div>
                  
                  {analise.observacoes && (
                    <div className="mt-3 pt-3 border-top small text-muted">
                      <i className="bi bi-chat-quote-fill me-2 text-primary opacity-50"></i>
                      {analise.observacoes}
                    </div>
                  )}
                  
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5 card-flat border bg-light mt-4">
          <i className="bi bi-graph-up-arrow text-muted mb-3 d-block" style={{ fontSize: '3rem' }}></i>
          <h5 className="text-blue-dark fw-bold">Sem Diagnósticos</h5>
          <p className="text-muted">Crie a primeira avaliação para visualizar os dados.</p>
        </div>
      )}
    </div>
  );

  if (embebed) return content;

  return <Layout>{content}</Layout>;
};

export default Analises;
