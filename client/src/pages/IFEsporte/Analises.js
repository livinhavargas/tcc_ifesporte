import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import SportIcon from '../../components/SportIcon';
import { addNotification } from '../../utils/notifications';
import AtletismoForm from './components/AtletismoForm';
import BasqueteForm from './components/BasqueteForm';
import FutebolForm from './components/FutebolForm';
import FutsalForm from './components/FutsalForm';
import HandebolForm from './components/HandebolForm';
import VoleiForm from './components/VoleiForm';
import ContextoSelector, { isCollectiveSport } from './components/ContextoSelector';
import { isSportAnalysisSupported } from '../../utils/sportAnalysisRules';
import { apiUrl } from '../../services/api';

const dicionarioAtributos = {
  'Futebol/Futsal': {
    'Goleiro': ['reflexo', 'posicionamento', 'saidaDoGol', 'reposicao', 'agilidade'],
    'Defensor': ['desarme', 'posicionamento', 'forcaFisica', 'velocidade', 'passe'],
    'Atacante': ['finalizacao', 'drible', 'velocidade', 'visaoDeJogo', 'posicionamento'],
    'Geral': ['passe', 'fisico', 'tatica', 'coletividade', 'finalizacao']
  },
  'Voleibol': {
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
  else if (mod && (mod.includes('Vôlei') || mod.includes('Volei') || mod.includes('Voleibol'))) cat = 'Voleibol';
  else if (mod && mod.includes('Basquete')) cat = 'Basquete';

  if (dicionarioAtributos[cat] && dicionarioAtributos[cat][sub]) {
    return dicionarioAtributos[cat][sub];
  }
  return dicionarioAtributos['Geral']['Geral'];
};

export const parseDiagnostic = (rawText) => {
  if (!rawText) return null;

  // 1. Remover seções de recomendações completamente
  let text = rawText
    .replace(/\*{0,2}Recomendaç[õo]es[\s\S]*$/i, '')
    .replace(/\*{0,2}Recomendaç[ãa]o[\s\S]*$/i, '')
    .trim();

  // 2. Remover marcadores de markdown (ex: **)
  text = text.replace(/\*\*/g, '').trim();

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let desempenho = '';
  let diagnostico = '';
  let pontosFortes = [];
  let deficiencias = [];
  let outros = [];

  let currentSection = 'intro';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (lower.startsWith('pontos fortes') || lower.includes('pontos fortes')) {
      currentSection = 'fortes';
      continue;
    } else if (
      lower.startsWith('deficiências') || 
      lower.startsWith('deficiencias') || 
      lower.startsWith('pontos fracos') || 
      lower.includes('deficiências da equipe') || 
      lower.includes('deficiências do atleta') ||
      lower.includes('pontos a evoluir')
    ) {
      currentSection = 'deficiencias';
      continue;
    } else if (lower.startsWith('diagnóstico') || lower.startsWith('diagnostico')) {
      currentSection = 'diagnostico';
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const val = line.slice(colonIdx + 1).trim();
        if (val) diagnostico += (diagnostico ? ' ' : '') + val;
      }
      continue;
    }

    if (currentSection === 'intro') {
      if (lower.startsWith('desempenho') || (lower.includes('nota') && lower.includes(':'))) {
        desempenho += (desempenho ? ' ' : '') + line;
      } else {
        diagnostico += (diagnostico ? ' ' : '') + line;
      }
    } else if (currentSection === 'diagnostico') {
      diagnostico += (diagnostico ? ' ' : '') + line;
    } else if (currentSection === 'fortes') {
      const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
      if (cleanLine && cleanLine.toLowerCase() !== 'nenhum.' && cleanLine.toLowerCase() !== 'nenhum') {
        pontosFortes.push(cleanLine);
      }
    } else if (currentSection === 'deficiencias') {
      const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
      if (cleanLine && cleanLine.toLowerCase() !== 'nenhum.' && cleanLine.toLowerCase() !== 'nenhum') {
        deficiencias.push(cleanLine);
      }
    } else {
      outros.push(line);
    }
  }

  return {
    desempenho,
    diagnostico,
    pontosFortes,
    deficiencias,
    outros
  };
};

export const renderDiagnosticCard = (rawText) => {
  const parsed = parseDiagnostic(rawText);
  if (!parsed) {
    return (
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: 0, fontStyle: 'italic' }}>
        Avaliação registrada sem texto diagnóstico.
      </p>
    );
  }

  const { desempenho, diagnostico, pontosFortes, deficiencias, outros } = parsed;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {desempenho && (
        <div style={{
          background: 'var(--bg)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          borderLeft: '3px solid var(--primary)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--text)'
        }}>
          {desempenho}
        </div>
      )}

      {diagnostico && (
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: 1.55,
          textAlign: 'left'
        }}>
          {diagnostico}
        </p>
      )}

      {pontosFortes.length > 0 && (
        <div style={{
          background: 'var(--success-light)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', display: 'block', marginBottom: '4px' }}>
            Pontos Fortes:
          </span>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8125rem', color: 'var(--text)' }}>
            {pontosFortes.map((p, i) => (
              <li key={i} style={{ marginBottom: i < pontosFortes.length - 1 ? '2px' : 0 }}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {deficiencias.length > 0 && (
        <div style={{
          background: 'var(--error-light)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--error, #ef4444)', display: 'block', marginBottom: '4px' }}>
            Deficiências Identificadas:
          </span>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8125rem', color: 'var(--text)' }}>
            {deficiencias.map((d, i) => (
              <li key={i} style={{ marginBottom: i < deficiencias.length - 1 ? '2px' : 0 }}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {outros.length > 0 && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {outros.map((o, i) => <p key={i} style={{ margin: '0 0 4px' }}>{o}</p>)}
        </div>
      )}
    </div>
  );
};

const Analises = ({ embebed = false, defaultModalidade = '', defaultGenero = '' }) => {
  const [students, setStudents] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [searchParams] = useSearchParams();
  const alunoIdParam = searchParams.get('alunoId');
  const novaAnaliseParam = searchParams.get('novaAnalise');
  const modalidadeParam = searchParams.get('modalidade');
  const subtipoParam = searchParams.get('subtipo');
  const editIdParam = searchParams.get('editId');

  const userType = localStorage.getItem('tipo');

  const modalidadesValidas = ['Basquete', 'Futsal', 'Futebol', 'Handebol', 'Voleibol'];
  const subtipos = ['Geral', 'Atacante', 'Defensor', 'Goleiro', 'Levantador', 'Líbero', 'Armador', 'Pivô'];

  const [formData, setFormData] = useState({
    editingId: null,
    aluno: '',
    modalidade: '',
    categoria: '',
    contexto: 'Treino',
    data: new Date().toISOString().split('T')[0],
    subtipo: 'Geral',
    observacoes: '',
    respostas: {}
  });

  const handleStartEdit = (analise) => {
    setSelectedAnalysis(null);
    setShowForm(true);
    setFormData({
      editingId: analise._id,
      aluno: analise.aluno?._id || analise.aluno || '',
      modalidade: analise.modalidade || '',
      categoria: analise.categoria || 'Geral',
      contexto: analise.contexto || (isCollectiveSport(analise.modalidade) ? 'Jogo' : 'Treino'),
      data: analise.data ? analise.data.split('T')[0] : new Date().toISOString().split('T')[0],
      subtipo: analise.subtipo || 'Geral',
      observacoes: analise.observacoes || '',
      respostas: analise.respostas ? { ...analise.respostas } : {}
    });
  };

  useEffect(() => {
    if (embebed) {
      setFormData(prev => ({ ...prev, modalidade: defaultModalidade, categoria: defaultGenero }));
    }
  }, [embebed, defaultModalidade, defaultGenero]);

  // Apenas preenche respostas genéricas para modalidades SEM formulário especializado.
  // Atletismo, Basquete, Futebol, Futsal, Handebol e Voleibol possuem seus próprios
  // formulários que gerenciam critérios internamente — NÃO interferir.
  const hasSpecializedForm = (mod) => {
    if (!mod) return false;
    return mod.includes('Atletismo') || mod.includes('Basquete') || 
           mod.includes('Futebol') || mod.includes('Futsal') || 
           mod.includes('Handebol') || mod.includes('Vôlei') || 
           mod.includes('Voleibol');
  };

  useEffect(() => {
    if (!formData.editingId && !hasSpecializedForm(formData.modalidade)) {
      const attrs = getAtributos(formData.modalidade, formData.subtipo);
      const novasRespostas = {};
      attrs.forEach(a => novasRespostas[a] = 3);
      setFormData(prev => ({ ...prev, respostas: novasRespostas }));
    }
  }, [formData.modalidade, formData.subtipo, formData.editingId]);

  useEffect(() => {
    fetchStudents();
    fetchAnalyses();
  }, []);

  useEffect(() => {
    if (editIdParam && analyses.length > 0) {
      const target = analyses.find(a => a._id === editIdParam);
      if (target) {
        handleStartEdit(target);
      }
    } else if (novaAnaliseParam === 'true') {
      if (modalidadeParam && !isSportAnalysisSupported(modalidadeParam)) {
        setMensagem(`⚠️ A modalidade "${modalidadeParam}" não possui suporte ao sistema de análise.`);
        setShowForm(false);
        return;
      }
      setSelectedAnalysis(null);
      setShowForm(true);
      setFormData({
        editingId: null,
        aluno: alunoIdParam || '',
        modalidade: modalidadeParam || '',
        categoria: 'Geral',
        contexto: isCollectiveSport(modalidadeParam) ? 'Jogo' : 'Treino',
        data: new Date().toISOString().split('T')[0],
        subtipo: subtipoParam || 'Geral',
        tipoAnalise: '',
        observacoes: '',
        respostas: {}
      });
    }
  }, [novaAnaliseParam, alunoIdParam, modalidadeParam, subtipoParam, editIdParam, analyses]);

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
      const response = await fetch(apiUrl('/api/students'), {
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
      const response = await fetch(apiUrl('/api/analysis'), {
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
    if (e && e.preventDefault) e.preventDefault();
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

      const isEditing = Boolean(formData.editingId);
      const url = isEditing ? apiUrl(`/api/analysis/${formData.editingId}`) : apiUrl('/api/analysis');
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
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

      setMensagem(isEditing ? '✅ Análise atualizada com sucesso!' : '✅ Análise salva com sucesso!');
      addNotification(
        isEditing ? 'Análise Atualizada' : 'Nova Análise Gerada', 
        `Avaliação técnica de ${formData.modalidade || 'esporte'} foi ${isEditing ? 'atualizada' : 'gerada'}.`
      );

      setTimeout(() => {
        setFormData({ 
          editingId: null,
          aluno: '', 
          modalidade: embebed ? defaultModalidade : '', 
          categoria: embebed ? defaultGenero : '',
          contexto: 'Treino',
          data: new Date().toISOString().split('T')[0], 
          subtipo: 'Geral', 
          observacoes: '', 
          respostas: {} 
        });
        setShowForm(false);
        setMensagem('');
        fetchAnalyses();
      }, 1500);
    } catch (error) {
      setMensagem('Erro de conexão ao servidor.');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Tem certeza que deseja excluir esta análise?')) return;
    try {
      await fetch(apiUrl(`/api/analysis/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      addNotification('Análise Excluída', 'Uma avaliação técnica foi removida do sistema.');
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
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setSelectedAnalysis(null); }}>
            <i className={`bi bi-${showForm ? 'x-lg' : 'clipboard-data'} me-2`}></i>
            {showForm ? 'Cancelar Avaliação' : 'Nova Avaliação'}
          </button>
        )}
      </div>

      {showForm && userType !== 'estudante' ? (
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
          <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '24px', fontSize: '1rem' }}>
            {formData.editingId ? 'Editar Avaliação Técnica' : 'Nova Avaliação Técnica'}
          </h5>
          {mensagem && (
            <div style={{
              background: mensagem.includes('✅') ? 'var(--success-light)' : 'var(--error-light)',
              color: mensagem.includes('✅') ? 'var(--success-text)' : 'var(--error-text)',
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
              <div className="col-md-3">
                <ContextoSelector modalidade={formData.modalidade} value={formData.contexto} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div className={embebed ? "col-md-3" : "col-md-2"}>
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
                <button type="submit" className="btn btn-primary px-4 fw-bold">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {formData.editingId ? 'Salvar Alterações' : 'Salvar Análise'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )) : selectedAnalysis ? (
        <div className="fade-in" style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => setSelectedAnalysis(null)} 
                style={{ padding: '8px 18px', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="bi bi-arrow-left"></i> Voltar para Análises
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {userType !== 'estudante' && (
                <>
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={() => handleStartEdit(selectedAnalysis)}
                    style={{ padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className="bi bi-pencil"></i> Editar Análise
                  </button>
                  <button 
                    className="btn btn-outline-danger" 
                    onClick={() => {
                      const idToDelete = selectedAnalysis._id;
                      setSelectedAnalysis(null);
                      handleDelete(idToDelete);
                    }}
                    style={{ padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className="bi bi-trash"></i> Excluir Análise
                  </button>
                </>
              )}
              
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.8125rem', padding: '8px 12px' }}>
                Data: {new Date(selectedAnalysis.dataAvaliacao || selectedAnalysis.data).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, overflow: 'hidden', fontSize: '1.25rem', flexShrink: 0
              }}>
                {selectedAnalysis.aluno?.foto ? (
                  <img src={selectedAnalysis.aluno.foto} alt={selectedAnalysis.aluno.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedAnalysis.aluno?.nome ? selectedAnalysis.aluno.nome.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h4 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 4px', fontSize: '1.25rem' }}>
                  {selectedAnalysis.aluno?.nome || 'Atleta'}
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <SportIcon sport={selectedAnalysis.modalidade} size={14} />
                    <span>{selectedAnalysis.modalidade} {selectedAnalysis.subtipo ? `(${selectedAnalysis.subtipo})` : ''}</span>
                  </span>
                  <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <i className="bi bi-tag-fill me-1"></i> Contexto: {selectedAnalysis.contexto || (isCollectiveSport(selectedAnalysis.modalidade) ? 'Jogo' : 'Treino')}
                  </span>
                  {selectedAnalysis.aluno?.sexo && (
                    <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                      {selectedAnalysis.aluno.sexo}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Índice Geral</div>
                <span className="badge" style={{ background: 'var(--primary)', color: '#fff', fontSize: '1.125rem', padding: '6px 16px', fontWeight: 700 }}>
                  <i className="bi bi-star-fill me-1"></i> {selectedAnalysis.resultados?.indiceGeral || '5.0'}
                </span>
              </div>
            </div>

            <div className="row g-3 pt-3 border-top" style={{ fontSize: '0.875rem' }}>
              <div className="col-md-6">
                <span style={{ color: 'var(--text-tertiary)' }}>Atleta: </span>
                <strong style={{ color: 'var(--text)' }}>{selectedAnalysis.aluno?.nome || 'Atleta'}</strong>
              </div>
              <div className="col-md-6">
                <span style={{ color: 'var(--text-tertiary)' }}>Gênero: </span>
                <strong style={{ color: 'var(--text)' }}>{selectedAnalysis.aluno?.sexo || 'Não informado'}</strong>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <h6 style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '14px', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-robot" style={{ fontSize: '1.25rem' }}></i> Diagnóstico Inteligente Gerado
            </h6>
            {renderDiagnosticCard(selectedAnalysis.diagnostico)}
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px', border: '1px solid var(--border-light)' }}>
            <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '16px', fontSize: '0.9375rem' }}>Notas dos Critérios Avaliados</h6>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
              {selectedAnalysis.respostas && Object.entries(selectedAnalysis.respostas).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <span className="badge" style={{ background: Number(val) >= 4 ? 'var(--success)' : Number(val) >= 3 ? 'var(--primary)' : 'var(--warning)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, minWidth: '40px', padding: '6px 12px' }}>
                    {val} / 5
                  </span>
                </div>
              ))}
            </div>
          </div>

          {selectedAnalysis.observacoes && (
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '18px 20px', border: '1px solid var(--border-light)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '4px' }}><i className="bi bi-chat-quote-fill me-2" style={{ color: 'var(--primary)' }}></i>Observações:</strong>
              {selectedAnalysis.observacoes}
            </div>
          )}
        </div>
      ) : loading ? (
         <div style={{ textAlign: 'center', padding: '48px' }}><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
      ) : analyses.filter(a => isSportAnalysisSupported(a.modalidade)).length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: '24px'
        }}>
          {analyses.filter(a => isSportAnalysisSupported(a.modalidade)).map(analise => {
            const color = analise.resultados?.indiceGeral >= 4.0 ? 'var(--success)' :
                          analise.resultados?.indiceGeral >= 3.0 ? 'var(--primary)' : 'var(--warning)';

            return (
              <div 
                key={analise._id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-light)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '18px',
                  position: 'relative',
                  transition: 'all var(--transition-base)'
                }} 
                className="hover-lift"
              >
                {/* Header: Avatar, Name, Date, Modality, Score */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      border: `2.5px solid ${color}`,
                      overflow: 'hidden',
                      fontSize: '1.25rem',
                      flexShrink: 0,
                      background: 'var(--bg)'
                    }}>
                      {analise.aluno?.foto ? (
                        <img 
                          src={analise.aluno.foto} 
                          alt={analise.aluno.nome} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <span style={{ color: color }}>
                          {analise.aluno?.nome ? analise.aluno.nome.charAt(0).toUpperCase() : '?'}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h5 style={{
                        fontWeight: 700,
                        color: 'var(--text)',
                        margin: '0 0 4px',
                        fontSize: '1rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {analise.aluno?.nome || 'Atleta Removido'}
                      </h5>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        <span>
                          <i className="bi bi-calendar-event me-1"></i>
                          {new Date(analise.dataAvaliacao || analise.data).toLocaleDateString('pt-BR')}
                        </span>
                        <span>•</span>
                        <span style={{
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          fontSize: '0.6875rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <SportIcon sport={analise.modalidade} size={12} />
                          <span>{analise.modalidade} {analise.subtipo ? `(${analise.subtipo})` : ''}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score badge */}
                  <div style={{
                    textAlign: 'center',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: color === 'var(--success)' ? 'var(--success-light)' : color === 'var(--primary)' ? 'var(--primary-light)' : 'var(--warning-light)',
                    color: color === 'var(--success)' ? '#065F46' : color === 'var(--primary)' ? 'var(--primary)' : '#92400E',
                    border: `1px solid ${color}`,
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    flexShrink: 0
                  }}>
                    <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', opacity: 0.85, lineHeight: 1, marginBottom: '2px' }}>Nota</div>
                    <div>★ {analise.resultados?.indiceGeral || '5.0'}</div>
                  </div>
                </div>

                {/* Body: Diagnóstico Inteligente */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px'
                  }}>
                    <i className="bi bi-robot" style={{ fontSize: '0.875rem' }}></i>
                    <span>Diagnóstico Inteligente</span>
                  </div>

                  {renderDiagnosticCard(analise.diagnostico)}
                </div>

                {/* Footer: Context and Actions */}
                <div style={{
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <span style={{
                    background: 'var(--bg)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    <i className="bi bi-tag-fill me-1" style={{ color: 'var(--accent)' }}></i>
                    Contexto: {analise.contexto || (isCollectiveSport(analise.modalidade) ? 'Jogo' : 'Treino')}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      style={{ fontSize: '0.78125rem', fontWeight: 600, padding: '5px 12px', borderRadius: 'var(--radius-sm)' }}
                      onClick={() => setSelectedAnalysis(analise)}
                      title="Ver detalhes da análise"
                    >
                      <i className="bi bi-eye me-1"></i> Detalhes
                    </button>
                    {userType !== 'estudante' && (
                      <>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          style={{ fontSize: '0.78125rem', fontWeight: 600, padding: '5px 12px', borderRadius: 'var(--radius-sm)' }}
                          onClick={() => handleStartEdit(analise)}
                          title="Editar Análise"
                        >
                          <i className="bi bi-pencil me-1"></i> Editar
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          style={{ fontSize: '0.78125rem', fontWeight: 600, padding: '5px 12px', borderRadius: 'var(--radius-sm)' }}
                          onClick={() => handleDelete(analise._id)}
                          title="Excluir Análise"
                        >
                          <i className="bi bi-trash me-1"></i> Excluir
                        </button>
                      </>
                    )}
                  </div>
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
