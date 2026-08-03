import React, { useState, useEffect } from 'react';
import { generateSmartCronograma } from '../../utils/cronogramaGenerator';

const Cronogramas = ({ modalidade, categoria }) => {
  const [cronogramas, setCronogramas] = useState([]);
  const [view, setView] = useState('list'); // 'list', 'form', 'preview', 'view'
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '', dataInicio: '', dataFim: '', competicaoAlvo: '', diasPorSemana: 3, incluirTransicao: true
  });

  const [fasesGeradas, setFasesGeradas] = useState([]);

  useEffect(() => {
    fetchCronogramas();
  }, [modalidade]);

  const fetchCronogramas = async () => {
    try {
      const res = await fetch(`/api/cronogramas?modalidade=${encodeURIComponent(modalidade)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCronogramas(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGerarPreview = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.dataInicio || !formData.dataFim || !formData.competicaoAlvo) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    const dI = new Date(`${formData.dataInicio}T00:00:00`);
    const dA = new Date(`${formData.competicaoAlvo}T00:00:00`);
    const dF = new Date(`${formData.dataFim}T00:00:00`);
    
    if (dI >= dA || dA > dF) {
      alert("Ordem de datas inválida. A ordem correta é: Início -> Competição Alvo -> Fim (Fim pode ser igual a Alvo se não houver transição).");
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const fases = generateSmartCronograma(modalidade, formData.dataInicio, formData.dataFim, formData.competicaoAlvo, parseInt(formData.diasPorSemana), formData.incluirTransicao);
      setFasesGeradas(fases);
      setIsGenerating(false);
      setView('preview');
    }, 1500);
  };

  const handleFaseChange = (index, field, value) => {
    const novas = [...fasesGeradas];
    novas[index][field] = value;
    setFasesGeradas(novas);
  };

  const handleSave = async () => {
    const totalSemanas = fasesGeradas.reduce((acc, curr) => acc + (curr.semanas || 0), 0);
    const totalTreinos = fasesGeradas.reduce((acc, curr) => acc + (curr.treinos?.length || 0), 0);

    const payload = {
      ...formData, 
      categoria, 
      modalidade, 
      fases: fasesGeradas, 
      removerEventosAntigos: !!selected,
      quantidadeSemanas: totalSemanas,
      quantidadeTreinos: totalTreinos
    };

    try {
      const url = selected ? `/api/cronogramas/${selected._id}` : '/api/cronogramas';
      const method = selected ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Cronograma salvo com sucesso!");
        fetchCronogramas();
        setView('list');
      } else {
        const errorData = await res.json();
        console.error("Erro ao salvar cronograma:", errorData);
        alert(`Erro ao salvar o cronograma: ${errorData.message || 'Erro interno no servidor'}`);
      }
    } catch (err) {
      console.error("Exceção ao salvar:", err);
      alert("Erro de conexão ao salvar o cronograma. Verifique o console.");
    }
  };

  const handleEdit = (crono) => {
    setSelected(crono);
    const hasTrans = crono.fases && crono.fases.some(f => f.nome === 'Transição');
    
    setFormData({
      titulo: crono.titulo || '',
      dataInicio: crono.dataInicio ? crono.dataInicio.split('T')[0] : '',
      dataFim: crono.dataFim ? crono.dataFim.split('T')[0] : '',
      competicaoAlvo: crono.competicaoAlvo ? crono.competicaoAlvo.split('T')[0] : '',
      diasPorSemana: crono.diasPorSemana || 3,
      incluirTransicao: hasTrans
    });
    setFasesGeradas(crono.fases || []);
    setView('preview');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este cronograma e todos os seus treinos (caso sincronizados)?")) return;
    try {
      await fetch(`/api/cronogramas/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCronogramas();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncAgenda = async (crono) => {
    if (!window.confirm("Sincronizar com a Agenda? Isso verificará conflitos e injetará todos os treinos.")) return;
    
    try {
      const allNewEventIds = [];
      for (const fase of crono.fases) {
        for (const treino of fase.treinos) {
          const ev = {
            titulo: `${crono.titulo} - Treino ${crono.modalidade}`,
            data: treino.data,
            horaInicial: '14:00',
            localNome: crono.modalidade,
            descricao: `Fase: ${fase.nome} | Objetivo: ${treino.tipo} | Categoria: ${crono.categoria}`,
            tipo: 'Treino',
            modalidade: crono.modalidade,
            categoria: crono.categoria
          };
          const res = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(ev)
          });
          const evData = await res.json();
          if (evData && evData._id) allNewEventIds.push(evData._id);
        }
      }
      
      await fetch(`/api/cronogramas/${crono._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ eventosVinculados: allNewEventIds })
      });
      
      alert("Agenda sincronizada com sucesso!");
      fetchCronogramas();
      setView('list');
    } catch (e) {
      console.error(e);
      alert("Erro ao sincronizar com agenda.");
    }
  };

  const handleView = (crono) => {
    setSelected(crono);
    setView('view');
  };

  const filtered = cronogramas.filter(c => 
    c.titulo.toLowerCase().includes(search.toLowerCase())
  );

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
    <div>
      {/* -------------------- VIEW = LIST -------------------- */}
      {view === 'list' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-calendar-range" style={{ color: 'var(--accent)' }}></i>Cronogramas
            </h5>
            <button className="btn btn-primary" onClick={() => { setSelected(null); setFormData({titulo: '', dataInicio: '', dataFim: '', competicaoAlvo: '', diasPorSemana: 3, incluirTransicao: true}); setView('form'); }}>
              <i className="bi bi-plus-lg me-2"></i>Novo Cronograma
            </button>
          </div>
          
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
            padding: '4px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="bi bi-search" style={{ color: 'var(--text-tertiary)' }}></i>
            <input 
              type="text" 
              placeholder="Pesquisar por nome do cronograma..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, border: 'none', background: 'transparent', minHeight: '38px', paddingLeft: 0 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 16px' }}>
                <i className="bi bi-calendar-x" style={{ fontSize: '2.5rem', color: 'var(--text-tertiary)', opacity: 0.5, display: 'block', marginBottom: '12px' }}></i>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Nenhum cronograma encontrado para esta modalidade.</p>
              </div>
            ) : (
              filtered.map(c => {
                const totalSemanas = c.fases.reduce((acc, curr) => acc + curr.semanas, 0);
                return (
                  <div key={c._id} style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    padding: '24px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '280px'
                  }} className="hover-lift">
                    {c.eventosVinculados && c.eventosVinculados.length > 0 && (
                      <span className="badge" style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--success-light)', color: 'var(--success)', fontWeight: 600 }}>Sincronizado</span>
                    )}
                    
                    <div>
                      <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 8px', fontSize: '0.9375rem' }}>{c.titulo}</h5>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.6875rem', fontWeight: 600 }}>{categoria}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}><i className="bi bi-clock-history me-1"></i> {totalSemanas} semanas</span>
                      </div>
                      
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <li style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><i className="bi bi-person me-2" style={{ color: 'var(--primary)' }}></i><strong>Treinador:</strong> {c.treinadorResponsavel || 'Não informado'}</li>
                        <li style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><i className="bi bi-flag me-2" style={{ color: 'var(--accent)' }}></i><strong>Competição:</strong> {c.competicaoAlvo ? new Date(c.competicaoAlvo).toLocaleDateString('pt-BR') : 'Não informada'}</li>
                        <li style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><i className="bi bi-calendar-event me-2" style={{ color: 'var(--primary)' }}></i><strong>Período:</strong> {c.dataInicio ? new Date(c.dataInicio).toLocaleDateString('pt-BR') : 'N/A'} a {c.dataFim ? new Date(c.dataFim).toLocaleDateString('pt-BR') : 'N/A'}</li>
                        <li style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><i className="bi bi-lightning me-2" style={{ color: 'var(--warning)' }}></i><strong>Frequência:</strong> {c.diasPorSemana}x semana</li>
                      </ul>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1.5px solid var(--border-light)', paddingTop: '16px' }}>
                      <button className="btn btn-outline-primary" style={{ flex: 1, padding: '8px' }} onClick={() => handleView(c)}><i className="bi bi-eye"></i> Visualizar</button>
                      <button className="btn btn-outline-secondary" style={{ width: '40px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleEdit(c)}><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-outline-danger" style={{ width: '40px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDelete(c._id)}><i className="bi bi-trash"></i></button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* -------------------- VIEW = FORM (NOVO) -------------------- */}
      {view === 'form' && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)',
          padding: '32px',
          position: 'relative'
        }}>
          {isGenerating && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(3px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              zIndex: 10
            }}>
               <div className="spinner-border" style={{ width: '3rem', height: '3rem', color: 'var(--primary)' }} role="status"></div>
               <h5 style={{ fontWeight: 700, color: 'var(--text)', marginTop: '16px' }}>IA analisando dados...</h5>
               <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>Gerando periodização baseada na modalidade e tempo disponível.</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
               <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.0625rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <i className="bi bi-magic" style={{ color: 'var(--primary)' }}></i>Gerador Inteligente de Cronograma
               </h5>
               <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginTop: '4px' }}>{modalidade} · {categoria}</span>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '1.25rem' }} onClick={() => setView('list')}><i className="bi bi-x-lg"></i></button>
          </div>
          
          <form onSubmit={handleGerarPreview}>
            <div className="row g-3">
              <div className="col-md-9">
                <label className="form-label text-muted small fw-bold">Nome do Cronograma</label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleInputChange} placeholder="Ex: Preparação para JESC" required style={inputStyle} />
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold">Frequência (Treinos/sem)</label>
                <select name="diasPorSemana" value={formData.diasPorSemana} onChange={handleInputChange} required style={inputStyle}>
                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} {n === 1 ? 'treino' : 'treinos'}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">Data Inicial (Base)</label>
                <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleInputChange} required style={inputStyle} />
              </div>
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">Data Competição Alvo</label>
                <input type="date" name="competicaoAlvo" value={formData.competicaoAlvo} onChange={handleInputChange} required style={{ ...inputStyle, borderColor: 'var(--primary)' }} />
              </div>
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">Data Final (Fim do Ciclo)</label>
                <input type="date" name="dataFim" value={formData.dataFim} onChange={handleInputChange} required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="incluirTransicao" name="incluirTransicao" checked={formData.incluirTransicao} onChange={handleInputChange} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                  <label htmlFor="incluirTransicao" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Incluir Fase de Transição</label>
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-cpu me-2"></i>Gerar e Revisar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* -------------------- VIEW = PREVIEW (EDICAO POS-GERACAO) -------------------- */}
      {view === 'preview' && (
        <div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <div>
               <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.0625rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <i className="bi bi-pencil-square" style={{ color: 'var(--accent)' }}></i>Revisão do Cronograma
               </h5>
               <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: '4px 0 0' }}>Você pode ajustar as semanas e a descrição de cada fase gerada antes de salvar.</p>
             </div>
             <button className="btn btn-secondary" onClick={() => setView('form')}><i className="bi bi-arrow-left me-2"></i>Voltar</button>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
             {fasesGeradas.map((f, i) => (
                <div key={i} style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '24px'
                }}>
                  <div className="row g-4">
                    <div className="col-md-4" style={{ borderRight: '1.5px solid var(--border-light)', paddingRight: '20px' }}>
                      <h5 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '16px', fontSize: '0.9375rem' }}>{f.nome}</h5>
                      <div style={{ marginBottom: '12px' }}>
                        <label className="form-label text-muted small fw-bold">Total de Semanas</label>
                        <input type="number" value={f.semanas} onChange={(e) => handleFaseChange(i, 'semanas', parseInt(e.target.value))} min="1" style={inputStyle} />
                      </div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span><i className="bi bi-calendar me-1"></i> Início: {new Date(f.dataInicio).toLocaleDateString('pt-BR')}</span>
                        <span><i className="bi bi-calendar-check me-1"></i> Fim: {new Date(f.dataFim).toLocaleDateString('pt-BR')}</span>
                        <span><i className="bi bi-activity me-1"></i> {f.treinos?.length} treinos nesta fase</span>
                      </div>
                    </div>
                    <div className="col-md-8 ps-md-4">
                      <label className="form-label text-muted small fw-bold">Foco e Objetivos da Fase</label>
                      <textarea rows="6" value={f.objetivo} onChange={(e) => handleFaseChange(i, 'objetivo', e.target.value)} style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }}></textarea>
                    </div>
                  </div>
                </div>
             ))}
           </div>
           
           <div style={{ display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-card)', padding: '16px 24px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
             <button className="btn btn-success" onClick={handleSave}>
               <i className="bi bi-check-lg me-2"></i> Confirmar e Salvar
             </button>
           </div>
        </div>
      )}

      {/* -------------------- VIEW = VISUALIZAR -------------------- */}
      {view === 'view' && selected && (
        <div className="printable-cronograma">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }} className="d-print-none">
            <button className="btn btn-secondary" onClick={() => setView('list')}>
              <i className="bi bi-arrow-left me-2"></i>Voltar
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline-primary" onClick={() => window.print()}>
                <i className="bi bi-file-earmark-pdf me-2"></i>Exportar PDF
              </button>
              {(!selected.eventosVinculados || selected.eventosVinculados.length === 0) && (
                <button className="btn btn-success" onClick={() => handleSyncAgenda(selected)}>
                  <i className="bi bi-calendar-check me-2"></i>Sincronizar com Agenda
                </button>
              )}
            </div>
          </div>
          
          {/* Header Card */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
            color: '#fff',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge" style={{ background: 'var(--accent)', color: '#fff', marginBottom: '12px' }}>{selected.categoria}</span>
                <h3 style={{ color: '#fff', fontWeight: 700, margin: '0 0 6px', fontSize: '1.25rem' }}>{selected.titulo}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.875rem' }}><i className="bi bi-geo-alt me-2"></i>{selected.modalidade}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h5 style={{ color: '#fff', fontWeight: 700, margin: '0 0 4px', fontSize: '1rem' }}><i className="bi bi-flag me-2" style={{ color: 'var(--accent)' }}></i>{new Date(selected.competicaoAlvo).toLocaleDateString('pt-BR')}</h5>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: 0 }}>Data Alvo</p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: '0 0 4px' }}>Período Total</p>
                <h6 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.875rem' }}>{selected.dataInicio ? new Date(selected.dataInicio).toLocaleDateString('pt-BR') : 'N/A'} a {selected.dataFim ? new Date(selected.dataFim).toLocaleDateString('pt-BR') : 'N/A'}</h6>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: '0 0 4px' }}>Total de Semanas</p>
                <h6 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.875rem' }}>{selected.fases ? selected.fases.reduce((acc, curr) => acc + (curr.semanas || 0), 0) : 0} semanas</h6>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: '0 0 4px' }}>Volume Previsto</p>
                <h6 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.875rem' }}>{selected.fases ? selected.fases.reduce((acc, curr) => acc + (curr.treinos?.length || 0), 0) : 0} sessões</h6>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: '0 0 4px' }}>Frequência</p>
                <h6 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.875rem' }}>{selected.diasPorSemana}x na semana</h6>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: '0 0 4px' }}>Treinador Responsável</p>
                <h6 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.875rem' }}>{selected.treinadorResponsavel || 'Não informado'}</h6>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: '0 0 4px' }}>Data de Criação</p>
                <h6 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.875rem' }}>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</h6>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: '0 0 4px' }}>Última Edição</p>
                <h6 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.875rem' }}>{selected.updatedAt ? new Date(selected.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}</h6>
              </div>
            </div>
          </div>
          
          {/* Timeline Visual */}
          <div style={{ marginBottom: '32px' }} className="d-none d-md-block">
            <h6 style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Linha do Tempo Visual</h6>
            <div style={{ display: 'flex', borderRadius: 'var(--radius-full)', overflow: 'hidden', height: '24px', boxShadow: 'var(--shadow-xs)' }}>
              {selected.fases && selected.fases.map((f, idx) => {
                const totalSemanas = selected.fases.reduce((acc, curr) => acc + (curr.semanas || 0), 0);
                const perc = totalSemanas === 0 ? 0 : (f.semanas / totalSemanas) * 100;
                const colors = ['#3b82f6', '#f97316', '#22c55e'];
                return (
                  <div key={idx} style={{
                    width: `${perc}%`, background: colors[idx % 3],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '0.75rem', borderRight: '1px solid #fff'
                  }} title={f.nome}>
                    {perc > 15 ? f.nome : ''}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cards das Fases */}
          <div className="row g-4">
            {selected.fases && selected.fases.map((fase, index) => {
              const icons = ['bi-activity', 'bi-trophy', 'bi-battery-charging'];
              const colors = ['var(--primary)', 'var(--accent)', 'var(--success)'];
              
              return (
                <div key={index} className="col-md-4">
                  <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    padding: '24px',
                    borderTop: `4px solid ${colors[index % 3]}`,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}>
                    <h5 style={{ fontWeight: 700, color: colors[index % 3], marginBottom: '16px', fontSize: '0.9375rem' }}>
                      <i className={`bi ${icons[index % 3]} me-2`}></i> {index + 1}. {fase.nome}
                    </h5>
                    
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><i className="bi bi-calendar me-2"></i> {fase.dataInicio ? new Date(fase.dataInicio).toLocaleDateString('pt-BR') : 'N/A'} a {fase.dataFim ? new Date(fase.dataFim).toLocaleDateString('pt-BR') : 'N/A'}</li>
                      <li style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><i className="bi bi-clock-history me-2"></i> {fase.semanas} semanas</li>
                      <li style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><i className="bi bi-check2-circle me-2"></i> {fase.treinos?.length || 0} sessões</li>
                    </ul>
                    
                    <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', marginTop: 'auto' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.75rem', display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Conteúdo Programado:</span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{fase.objetivo}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              .d-print-none { display: none !important; }
              body { background: white !important; }
              .card-flat { border: 1px solid #ddd !important; box-shadow: none !important; color: black !important; }
              .bg-blue-dark { background-color: #f8f9fa !important; color: black !important; }
              .text-white, .text-white-50 { color: black !important; }
            }
          `}} />
        </div>
      )}
    </div>
  );
};

export default Cronogramas;
