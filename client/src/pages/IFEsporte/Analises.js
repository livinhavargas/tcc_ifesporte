import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import AtletismoForm from './components/AtletismoForm';
import BasqueteForm from './components/BasqueteForm';
import FutebolForm from './components/FutebolForm';
import FutsalForm from './components/FutsalForm';
import HandebolForm from './components/HandebolForm';
import VoleiForm from './components/VoleiForm';

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
  let entries = Object.entries(respostas || {});
  
  if (entries.length > 0 && entries[0][0].includes(' - ')) {
    const groups = {};
    entries.forEach(([key, val]) => {
      const section = key.split(' - ')[0];
      if (!groups[section]) groups[section] = { sum: 0, count: 0 };
      groups[section].sum += Number(val);
      groups[section].count += 1;
    });
    entries = Object.entries(groups).map(([section, data]) => [section, data.sum / data.count]);
  }

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
         return <polygon key={level} points={pts} fill={isEdge ? "var(--bg)" : "none"} stroke={isEdge ? "var(--border)" : "var(--border-light)"} strokeWidth={isEdge ? "1" : "0.5"}/>
       })}
       
       {entries.map((_, i) => {
         const p = getPoint(5, i);
         return <line key={`l${i}`} x1="50" y1="50" x2={p.x} y2={p.y} stroke="var(--border-light)" strokeWidth="0.5"/>
       })}
       
       <polygon points={points} fill="rgba(30, 94, 255, 0.2)" stroke="var(--primary)" strokeWidth="1.5"/>
       {entries.map(([, val], i) => {
         const p = getPoint(val, i);
         return <circle key={`c${i}`} cx={p.x} cy={p.y} r="1.5" fill="var(--primary)" />
       })}
       
       {entries.map(([atr], i) => {
         const p = getPoint(5, i, 47);
         let anchor = "middle";
         if (p.x < 45) anchor = "end";
         else if (p.x > 55) anchor = "start";
         
         let dy = p.y > 50 ? 3 : -1;
         
         const formatAttr = s => s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
         const label = formatAttr(atr);
         const shortLabel = label.length > 10 ? label.substring(0,8)+'.' : label;
         return <text key={`t${i}`} x={p.x} y={p.y+dy} fontSize="3.5" textAnchor={anchor} fill="var(--text-secondary)" fontWeight="bold">{shortLabel}</text>;
       })}
    </svg>
  );
};

const Analises = ({ embebed = false, defaultModalidade = '', defaultGenero = '' }) => {
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
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    subtipo: 'Geral',
    observacoes: '',
    respostas: {}
  });

  useEffect(() => {
    if (embebed) {
      setFormData(prev => ({ ...prev, modalidade: defaultModalidade, categoria: defaultGenero }));
    }
  }, [embebed, defaultModalidade, defaultGenero]);

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

  const checkMatch = (esp, keyword) => {
    const e = (esp || '').toLowerCase();
    const k = (keyword || '').toLowerCase();
    if (e.includes(k)) return true;
    
    const parts = k.split('-').map(p => p.trim());
    
    if (k === 'atletismo') {
      const termos = ['atletismo', 'corrida', 'salto', 'arremesso', 'lançamento', '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', 'revezamento', 'distância', 'altura', 'triplo', 'peso', 'disco', 'dardo'];
      return termos.some(t => e.includes(t));
    }
    
    if (parts.length === 2 && parts[0] === 'atletismo') {
      const cat = parts[1];
      if (cat.includes('corrida')) {
        const termos = ['corrida', '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', 'revezamento'];
        return termos.some(t => e.includes(t));
      }
      if (cat.includes('salto')) {
        const termos = ['salto', 'distância', 'altura', 'triplo'];
        return termos.some(t => e.includes(t));
      }
      if (cat.includes('lançamento') || cat.includes('arremesso')) {
        const termos = ['lançamento', 'arremesso', 'peso', 'disco', 'dardo'];
        return termos.some(t => e.includes(t));
      }
    }
    
    if (parts.length === 3 && parts[0] === 'atletismo') {
      const leaf = parts[2];
      if (e.includes(leaf)) return true;
    }
    
    return false;
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        let data = await response.json();
        if (embebed && defaultModalidade) {
          data = data.filter(s => {
            if (defaultGenero && s.sexo !== defaultGenero) return false;
            const arr = s.modalidades?.length > 0 ? s.modalidades : (s.esportes || []);
            return arr.some(esp => checkMatch(esp, defaultModalidade));
          });
        }
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
        
        let filteredData = data;
        if (embebed) {
          filteredData = data.filter(a => 
            a.modalidade === defaultModalidade && 
            a.categoria === defaultGenero
          );
        }

        if (alunoIdParam) {
          setAnalyses(filteredData.filter(a => a.aluno && a.aluno._id === alunoIdParam));
        } else if (userType === 'estudante') {
          const userEmail = localStorage.getItem('userEmail');
          setAnalyses(filteredData.filter(a => a.aluno && a.aluno.email === userEmail));
        } else {
          setAnalyses(filteredData);
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

  const handleSubmit = async (e, diagnosticoStr = null, tipoAnaliseStr = 'Individual') => {
    e.preventDefault();
    setMensagem('');

    if (!formData.aluno || !formData.modalidade) {
      setMensagem('Preencha Aluno e Modalidade.');
      return;
    }

    try {
      const payload = { ...formData, tipoAnalise: tipoAnaliseStr };
      if (diagnosticoStr) {
         payload.diagnostico = diagnosticoStr;
      }
      
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
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
          categoria: embebed ? defaultGenero : prev.categoria,
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

  const content = (
    <div style={embebed ? {} : { maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>Inteligência Esportiva</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0' }}>Avalie os atletas e deixe o sistema gerar os diagnósticos.</p>
        </div>
        {userType !== 'estudante' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <i className={`bi bi-${showForm ? 'x-lg' : 'clipboard-data'} me-2`}></i>
            {showForm ? 'Cancelar Avaliação' : 'Nova Avaliação'}
          </button>
        )}
      </div>

      {showForm && userType !== 'estudante' && (
        formData.modalidade && formData.modalidade.includes('Atletismo') ? (
          <AtletismoForm 
            formData={formData} 
            setFormData={setFormData} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            students={students} 
            setMensagem={setMensagem} 
          />
        ) : formData.modalidade && formData.modalidade.includes('Basquete') ? (
          <BasqueteForm
            formData={formData} 
            setFormData={setFormData} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            students={students} 
            setMensagem={setMensagem} 
          />
        ) : formData.modalidade && formData.modalidade.includes('Futebol') ? (
          <FutebolForm
            formData={formData} 
            setFormData={setFormData} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            students={students} 
            setMensagem={setMensagem} 
          />
        ) : formData.modalidade && formData.modalidade.includes('Futsal') ? (
          <FutsalForm
            formData={formData} 
            setFormData={setFormData} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            students={students} 
            setMensagem={setMensagem} 
          />
        ) : formData.modalidade && formData.modalidade.includes('Handebol') ? (
          <HandebolForm
            formData={formData} 
            setFormData={setFormData} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            students={students} 
            setMensagem={setMensagem} 
          />
        ) : formData.modalidade && (formData.modalidade.includes('Vôlei') || formData.modalidade.includes('Voleibol')) ? (
          <VoleiForm
            formData={formData} 
            setFormData={setFormData} 
            handleInputChange={handleInputChange} 
            handleSubmit={handleSubmit} 
            students={students} 
            setMensagem={setMensagem} 
          />
        ) : (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '24px', fontSize: '1rem' }}>Motor Analítico</h5>
          {mensagem && (
            <div style={{
              background: mensagem.includes('✅') ? 'var(--success-light)' : 'var(--error-light)',
              color: mensagem.includes('✅') ? '#065F46' : '#991B1B',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>{mensagem}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">Aluno Avaliado</label>
                <select className="form-select" name="aluno" value={formData.aluno} onChange={handleInputChange} required style={inputStyle}>
                  {students.length === 0 ? (
                    <option value="">Nenhum atleta cadastrado nesta modalidade.</option>
                  ) : (
                    <option value="">Selecione um aluno...</option>
                  )}
                  {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold">Data</label>
                <input type="date" className="form-control" name="data" value={formData.data} onChange={handleInputChange} required style={inputStyle} />
              </div>
              {!embebed && (
                <div className="col-md-3">
                  <label className="form-label text-muted small fw-bold">Modalidade Referência</label>
                  <select className="form-select" name="modalidade" value={formData.modalidade} onChange={handleInputChange} required style={inputStyle}>
                    <option value="">Selecione...</option>
                    {modalidadesValidas.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
              <div className={embebed ? "col-md-5" : "col-md-2"}>
                <label className="form-label text-muted small fw-bold">Posição/Função</label>
                <select className="form-select" name="subtipo" value={formData.subtipo} onChange={handleInputChange} required style={inputStyle}>
                  {subtipos.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {formData.modalidade && currentAttrs.length > 0 && (
              <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border-light)' }}>
                <h6 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '20px', fontSize: '0.875rem' }}>
                  <i className="bi bi-sliders me-2"></i>Avaliação Específica: {formData.modalidade} ({formData.subtipo})
                </h6>
                <div className="row g-4">
                  {currentAttrs.map(atr => (
                    <div key={atr} className="col-md-6">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                        <label style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.8125rem' }} className="text-capitalize">{atr.replace(/([A-Z])/g, ' $1')}</label>
                        <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem' }}>{formData.respostas[atr]} / 5</span>
                      </div>
                      <input 
                        type="range" 
                        className="form-range" 
                        min="1" max="5" step="1" 
                        value={formData.respostas[atr] || 3} 
                        onChange={(e) => handleRespostaChange(atr, e.target.value)} 
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
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
                <label className="form-label text-muted small fw-bold">Observações Adicionais (Opcional)</label>
                <textarea className="form-control" name="observacoes" rows="2" value={formData.observacoes} onChange={handleInputChange} placeholder="Comentários sobre a avaliação..." style={inputStyle}></textarea>
              </div>
              <div className="col-12 text-end">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-magic me-2"></i> Processar e Salvar Avaliação
                </button>
              </div>
            </div>
          </form>
        </div>
        )
      )}

      {loading ? (
         <div style={{ textAlign: 'center', padding: '48px' }}><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
      ) : analyses.length > 0 ? (
        <div className="row g-4">
          {analyses.map(analise => {
            const nivel = analise.resultados?.indiceGeral >= 4.5 ? 'Excelente' :
                          analise.resultados?.indiceGeral >= 3.5 ? 'Bom' :
                          analise.resultados?.indiceGeral >= 2.5 ? 'Regular' : 'Atenção';
                          
            const color = nivel === 'Excelente' ? 'var(--success)' :
                          nivel === 'Bom' ? 'var(--primary)' :
                          nivel === 'Regular' ? 'var(--warning)' : 'var(--error)';
                          
            return (
              <div key={analise._id} className="col-md-6">
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '24px',
                  position: 'relative',
                  height: '100%'
                }}>
                  {userType !== 'estudante' && (
                    <button 
                      className="btn btn-light rounded-circle shadow-sm"
                      onClick={() => handleDelete(analise._id)}
                      title="Excluir Análise"
                      style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', padding: 0 }}
                    >
                      <i className="bi bi-trash" style={{ color: 'var(--error)' }}></i>
                    </button>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '16px' }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, shadow: 'var(--shadow-xs)', border: `2px solid ${color}`,
                        overflow: 'hidden', fontSize: '1.25rem', flexShrink: 0
                      }}>
                        {analise.aluno?.foto ? (
                          <img src={analise.aluno.foto} alt={analise.aluno.nome} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : (
                          analise.aluno?.nome ? analise.aluno.nome.charAt(0).toUpperCase() : '?'
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 4px', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {analise.aluno?.nome || 'Atleta Removido'} 
                          <span className="badge" style={{ background: color, color: '#fff', fontSize: '0.6875rem' }}>
                            <i className="bi bi-star-fill me-1"></i>
                            {analise.resultados?.indiceGeral || '?'}
                          </span>
                        </h5>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                          <i className="bi bi-calendar-event me-1"></i> {new Date(analise.data).toLocaleDateString('pt-BR')} 
                          <span className="mx-2">•</span> 
                          <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{analise.modalidade} ({analise.subtipo || 'Geral'})</span>
                        </div>
                      </div>
                    </div>
                  <div className="row align-items-center mt-3">
                    <div className="col-12 col-xl-5 text-center mb-3 mb-xl-0">
                      <div style={{ width: '100%', maxWidth: '160px', margin: '0 auto' }}>
                        {analise.respostas && Object.keys(analise.respostas).length > 0 ? (
                          <RadarChart respostas={analise.respostas} />
                        ) : (
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', padding: '24px 0', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>Sem dados de Radar</div>
                        )}
                      </div>
                    </div>
                    <div className="col-12 col-xl-7">
                      <h6 style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '8px', fontSize: '0.8125rem' }}>
                        <i className="bi bi-robot me-2"></i>Diagnóstico Inteligente
                      </h6>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, textAlign: 'justify' }}>
                        {analise.diagnostico || 'Avaliação legada (sem diagnóstico automático).'}
                      </p>
                    </div>
                  </div>
                  
                  {analise.observacoes && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      <i className="bi bi-chat-quote-fill me-2" style={{ color: 'var(--primary)', opacity: 0.7 }}></i>
                      {analise.observacoes}
                    </div>
                  )}
                  
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '48px 16px',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)'
        }}>
          <i className="bi bi-graph-up-arrow" style={{ color: 'var(--text-tertiary)', fontSize: '2rem', display: 'block', marginBottom: '12px' }}></i>
          <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Nenhuma análise encontrada</h5>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>Ainda não existem análises registradas para esta modalidade.</p>
        </div>
      )}
    </div>
  );

  if (embebed) return content;

  return <Layout>{content}</Layout>;
};

export default Analises;
