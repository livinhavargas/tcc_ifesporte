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
    descricao: '',
    eventoObrigatorio: false
  });

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
        descricao: eventData.descricao || '',
        eventoObrigatorio: eventData.eventoObrigatorio || false
      });
    } else if (show && !eventData) {
      setFormData({
        titulo: '', tipo: 'Treino', data: '', horaInicial: '', horaFinal: '',
        localNome: '', modalidade: '', descricao: '', eventoObrigatorio: false
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

  // If student, just view mode
  const isReadOnly = userType === 'estudante';

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div className="modal-header bg-light border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold text-dark">{eventData?._id ? 'Editar Evento' : 'Novo Evento'}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          
          <div className="modal-body p-4">
            <form onSubmit={handleSubmit}>
              
              <div className="mb-3">
                <input 
                  type="text" 
                  className="form-control form-control-lg border-0 border-bottom rounded-0 px-0 fs-4 fw-bold text-dark shadow-none" 
                  placeholder="Adicionar título" 
                  name="titulo" 
                  value={formData.titulo} 
                  onChange={handleChange} 
                  required 
                  readOnly={isReadOnly}
                  style={{ outline: 'none' }}
                />
              </div>

              <div className="row g-3 mb-3 mt-2">
                <div className="col-md-4">
                  <label className="form-label small text-muted mb-1"><i className="bi bi-tag-fill me-1"></i> Categoria</label>
                  <select className="form-select border-0 bg-light" name="tipo" value={formData.tipo} onChange={handleChange} disabled={isReadOnly}>
                    <option value="Treino">Treino</option>
                    <option value="Amistoso">Amistoso</option>
                    <option value="Campeonato">Campeonato</option>
                    <option value="Reunião">Reunião</option>
                    <option value="Avaliação">Avaliação</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small text-muted mb-1"><i className="bi bi-calendar-event me-1"></i> Data</label>
                  <input type="date" className="form-control border-0 bg-light" name="data" value={formData.data} onChange={handleChange} required readOnly={isReadOnly} />
                </div>
                <div className="col-md-2">
                  <label className="form-label small text-muted mb-1">Início</label>
                  <input type="time" className="form-control border-0 bg-light" name="horaInicial" value={formData.horaInicial} onChange={handleChange} required readOnly={isReadOnly} />
                </div>
                <div className="col-md-2">
                  <label className="form-label small text-muted mb-1">Fim</label>
                  <input type="time" className="form-control border-0 bg-light" name="horaFinal" value={formData.horaFinal} onChange={handleChange} readOnly={isReadOnly} />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-geo-alt text-muted fs-5 me-2"></i>
                    <input type="text" className="form-control border-0 bg-light" name="localNome" value={formData.localNome} onChange={handleChange} placeholder="Adicionar local" readOnly={isReadOnly} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-people text-muted fs-5 me-2"></i>
                    <input type="text" className="form-control border-0 bg-light" name="modalidade" value={formData.modalidade} onChange={handleChange} placeholder="Equipe / Modalidade" readOnly={isReadOnly} />
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-start mb-3">
                <i className="bi bi-text-left text-muted fs-5 me-2 mt-1"></i>
                <textarea className="form-control border-0 bg-light" name="descricao" rows="3" value={formData.descricao} onChange={handleChange} placeholder="Adicionar descrição ou anexos" readOnly={isReadOnly}></textarea>
              </div>

              <div className="d-flex align-items-center mb-4 ps-4">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" name="eventoObrigatorio" checked={formData.eventoObrigatorio} onChange={handleChange} disabled={isReadOnly} />
                  <label className="form-check-label text-danger fw-bold ms-2" htmlFor="flexSwitchCheckDefault">Marcar como Evento Importante (Prioridade)</label>
                </div>
              </div>

              {!isReadOnly && (
                <div className="d-flex justify-content-end gap-2 border-top pt-3">
                  {eventData?._id && (
                    <button type="button" className="btn btn-light text-danger fw-bold me-auto px-4 rounded-pill" onClick={() => onDelete(eventData._id)}>
                      Excluir
                    </button>
                  )}
                  <button type="button" className="btn btn-light fw-bold px-4 rounded-pill" onClick={onClose}>Cancelar</button>
                  <button type="submit" className="btn btn-primary fw-bold px-4 rounded-pill">Salvar</button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
