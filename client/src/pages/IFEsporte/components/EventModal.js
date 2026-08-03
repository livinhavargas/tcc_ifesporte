import React, { useState, useEffect } from 'react';

const EventModal = ({ show, eventData, onClose, onSave, onDelete, userType }) => {
  const [formData, setFormData] = useState({
    titulo: '', 
    tipo: 'Treino', 
    data: '', 
    horaInicial: '', 
    horaFinal: '',
    localNome: '', 
    modalidade: '',
    categoria: '',
    descricao: '',
    eventoObrigatorio: false
  });

  const [esportes, setEsportes] = useState([]);

  useEffect(() => {
    const fetchEsportes = async () => {
      try {
        const response = await fetch('/api/sports', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setEsportes(data);
        }
      } catch (err) {
        console.error("Erro ao buscar modalidades:", err);
      }
    };
    fetchEsportes();
  }, []);

  useEffect(() => {
    if (show && eventData) {
      setFormData({
        titulo: eventData.titulo || eventData.title || '',
        tipo: eventData.tipo || 'Treino',
        data: eventData.data ? eventData.data.split('T')[0] : (eventData.start ? new Date(eventData.start).toISOString().split('T')[0] : ''),
        horaInicial: eventData.horaInicial || eventData.hora || (eventData.start ? new Date(eventData.start).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : ''),
        horaFinal: eventData.horaFinal || (eventData.end ? new Date(eventData.end).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : ''),
        localNome: eventData.localNome || eventData.local || '',
        modalidade: eventData.modalidade || '',
        categoria: eventData.categoria || '',
        descricao: eventData.descricao || '',
        eventoObrigatorio: eventData.eventoObrigatorio || false
      });
    } else if (show && !eventData) {
      setFormData({
        titulo: '', tipo: 'Treino', data: '', horaInicial: '', horaFinal: '',
        localNome: '', modalidade: '', categoria: '', descricao: '', eventoObrigatorio: false
      });
    }
  }, [show, eventData]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...eventData, ...formData });
  };

  const isReadOnly = userType === 'estudante';

  const fieldStyle = {
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
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1050,
      padding: '24px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        overflow: 'auto',
        animation: 'fadeIn 0.2s ease'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.0625rem' }}>
            {eventData?._id ? 'Editar Evento' : 'Novo Evento'}
          </h5>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '1.25rem',
            color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px'
          }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        {/* Body */}
        <div style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Adicionar título" 
                name="titulo" 
                value={formData.titulo} 
                onChange={handleChange} 
                required 
                readOnly={isReadOnly}
                style={{
                  ...fieldStyle,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid var(--border)',
                  borderRadius: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  padding: '8px 0',
                  minHeight: 'auto',
                  color: 'var(--text)'
                }}
              />
            </div>

            {/* Row: Type, Date, Time */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                  <i className="bi bi-tag-fill me-1"></i> Categoria
                </label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} disabled={isReadOnly} style={fieldStyle}>
                  <option value="Treino">Treino</option>
                  <option value="Amistoso">Amistoso</option>
                  <option value="Campeonato">Campeonato</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="col-md-4">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                  <i className="bi bi-calendar-event me-1"></i> Data
                </label>
                <input type="date" name="data" value={formData.data} onChange={handleChange} required readOnly={isReadOnly} style={fieldStyle} />
              </div>
              <div className="col-md-2">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px' }}>Início</label>
                <input type="time" name="horaInicial" value={formData.horaInicial} onChange={handleChange} required readOnly={isReadOnly} style={fieldStyle} />
              </div>
              <div className="col-md-2">
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px' }}>Fim</label>
                <input type="time" name="horaFinal" value={formData.horaFinal} onChange={handleChange} readOnly={isReadOnly} style={fieldStyle} />
              </div>
            </div>

            {/* Row: Location, Sport, Category */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-geo-alt" style={{ color: 'var(--text-tertiary)', fontSize: '1rem' }}></i>
                  <input type="text" name="localNome" value={formData.localNome} onChange={handleChange} placeholder="Adicionar local" readOnly={isReadOnly} style={{ ...fieldStyle, flex: 1 }} />
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select name="modalidade" value={formData.modalidade} onChange={handleChange} disabled={isReadOnly} style={{ ...fieldStyle, flex: 1 }}>
                    <option value="">Modalidade</option>
                    {esportes.map(esp => (
                      <option key={esp._id} value={esp.nome}>{esp.nome}</option>
                    ))}
                  </select>
                  <select name="categoria" value={formData.categoria} onChange={handleChange} disabled={isReadOnly} style={{ ...fieldStyle, width: '130px', flex: 'none' }}>
                    <option value="">Categoria</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <i className="bi bi-text-left" style={{ color: 'var(--text-tertiary)', fontSize: '1rem', marginTop: '12px' }}></i>
              <textarea name="descricao" rows="3" value={formData.descricao} onChange={handleChange} placeholder="Adicionar descrição" readOnly={isReadOnly}
                style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical', flex: 1 }} />
            </div>

            {/* Priority Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingLeft: '4px' }}>
              <input type="checkbox" id="eventoObrigatorio" name="eventoObrigatorio" checked={formData.eventoObrigatorio} onChange={handleChange} disabled={isReadOnly}
                style={{ accentColor: 'var(--error)', width: '18px', height: '18px' }} />
              <label htmlFor="eventoObrigatorio" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--error)', cursor: 'pointer' }}>
                Marcar como Evento Importante (Prioridade)
              </label>
            </div>

            {/* Actions */}
            {!isReadOnly && (
              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: '10px',
                borderTop: '1px solid var(--border-light)', paddingTop: '16px'
              }}>
                {eventData?._id && (
                  <button type="button" onClick={() => onDelete(eventData._id)}
                    style={{
                      marginRight: 'auto', padding: '10px 20px', borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--error)', background: 'transparent',
                      color: 'var(--error)', fontFamily: 'var(--font)', fontWeight: 600,
                      fontSize: '0.8125rem', cursor: 'pointer', transition: 'all var(--transition-fast)'
                    }}>
                    Excluir
                  </button>
                )}
                <button type="button" onClick={onClose} className="btn btn-secondary" style={{ borderRadius: 'var(--radius-md)', padding: '10px 20px' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-md)', padding: '10px 24px' }}>
                  Salvar
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
