import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Analises from './IFesporte/Analises';

const Perfil = () => {
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('tipo');
  
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Sempre começa em modo visualização

  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    telefone: '',
    peso: '',
    altura: '',
    idade: '',
    matricula: '',
    turma: '',
    cpf: '',
    endereco: '',
    dataNascimento: '',
    nomeResponsavel: '',
    telefoneResponsavel: '',
    foto: '',
    esportes: [],
    sexo: '',
    alergias: '',
    lesoesAnteriores: '',
    restricoesMedicas: '',
    numeroCamisa: ''
  });

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];
  
  const modalidadesCategorizadas = {
    'Modalidades Coletivas': ['Futebol', 'Futsal', 'Basquete', 'Handebol', 'Voleibol', 'Vôlei de Praia'],
    'Modalidades Individuais': ['Xadrez', 'Badminton'],
    'Tênis de Mesa': ['Tênis de Mesa - Individual', 'Tênis de Mesa - Dupla'],
    'Atletismo - Corridas': [
      '100m rasos', '200m rasos', '400m rasos', '800m', 
      '1500m', '3000m', '5000m', 'Revezamento 4x100', 'Revezamento 4x400'
    ],
    'Atletismo - Saltos': ['Salto em Distância', 'Salto em Altura', 'Salto Triplo'],
    'Atletismo - Lançamentos': ['Lançamento de Disco', 'Lançamento de Dardo', 'Arremesso de Peso']
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setProfileData({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        peso: data.peso || '',
        altura: data.altura || '',
        idade: data.idade || '', 
        matricula: data.matricula || '',
        turma: data.turma || data.serie || '', 
        cpf: data.cpf || '',
        endereco: data.endereco || '',
        dataNascimento: data.dataNascimento || '',
        nomeResponsavel: data.nomeResponsavel || '',
        telefoneResponsavel: data.telefoneResponsavel || '',
        foto: data.foto || '',
        esportes: data.esportes || [],
        sexo: data.sexo || '',
        alergias: data.alergias || '',
        lesoesAnteriores: data.lesoesAnteriores || '',
        restricoesMedicas: data.restricoesMedicas || '',
        numeroCamisa: data.numeroCamisa || ''
      });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'cpf') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    if (name === 'telefone' || name === 'telefoneResponsavel') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }

    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModalidadeToggle = (mod) => {
    if (!isEditing) return; // Não permite toggle se não estiver editando
    setProfileData(prev => {
      const isSelected = prev.esportes.includes(mod);
      if (isSelected) {
        return { ...prev, esportes: prev.esportes.filter(m => m !== mod) };
      }
      return { ...prev, esportes: [...prev.esportes, mod] };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const payload = { ...profileData, serie: profileData.turma }; // Retrocompatibilidade

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setMensagem('✅ Perfil atualizado com sucesso!');
        localStorage.setItem('userName', profileData.nome);
        setIsEditing(false); // Volta para modo visualização
        fetchProfile(); // Recarrega os dados fresquinhos do banco
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem('Erro ao atualizar perfil.');
      }
    } catch (error) {
      setMensagem('Erro de conexão ao servidor.');
    }
  };

  const inputClass = isEditing ? 'form-control bg-light' : 'form-control-plaintext text-dark fw-medium border-0 px-2 bg-transparent';
  const selectClass = isEditing ? 'form-select bg-light' : 'form-select text-dark fw-medium border-0 px-2 bg-transparent appearance-none';

  return (
    <Layout>
      <div className="card-flat p-4 p-md-5 mx-auto mb-5 shadow-sm" style={{ maxWidth: '900px', borderRadius: '16px' }}>
        
        {/* HEADER DO PERFIL */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3 border-bottom pb-4">
          <div>
            <h2 className="fw-bold text-blue-dark mb-1">Meu Perfil</h2>
            <p className="text-muted mb-0">Visualize e mantenha seus dados atualizados.</p>
          </div>
          
          <div>
            {!isEditing ? (
              <button 
                type="button" 
                onClick={() => setIsEditing(true)} 
                className="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center transition-all"
                style={{ transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}
              >
                <i className="bi bi-pencil-square me-2"></i> Editar Perfil
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => {
                  fetchProfile(); // Recarrega os dados originais caso desista de editar
                  setIsEditing(false);
                }} 
                className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center"
              >
                <i className="bi bi-x-circle me-2"></i> Cancelar Edição
              </button>
            )}
          </div>
        </div>

        {mensagem && <div className={`alert ${mensagem.includes('✅') ? 'alert-success' : 'alert-danger'} fw-bold rounded-3 shadow-sm`}><i className={`bi ${mensagem.includes('✅') ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>{mensagem}</div>}

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="row g-4">
              
              {/* FOTO */}
              <div className="col-12 text-center mb-4">
                 <div className="d-inline-block position-relative">
                   {profileData.foto ? (
                     <img src={profileData.foto} alt="Perfil" className="rounded-circle shadow-sm" style={{width: '140px', height: '140px', objectFit: 'cover', border: '4px solid white'}} />
                   ) : (
                     <div className="rounded-circle bg-blue-dark text-white d-flex align-items-center justify-content-center fw-bold shadow-sm mx-auto" style={{width: '140px', height: '140px', fontSize: '3rem', border: '4px solid white'}}>
                       {profileData.nome ? profileData.nome.charAt(0).toUpperCase() : 'U'}
                     </div>
                   )}
                   {isEditing && (
                     <>
                       <label htmlFor="fotoInput" className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow" style={{ cursor: 'pointer', right: '5px', bottom: '5px' }}>
                         <i className="bi bi-camera-fill"></i>
                       </label>
                       <input type="file" id="fotoInput" className="d-none" accept="image/*" onChange={handlePhotoChange} />
                     </>
                   )}
                 </div>
              </div>

              {/* DADOS BÁSICOS */}
              <div className="col-12"><h6 className="fw-bold text-orange border-bottom pb-2 mb-3"><i className="bi bi-person-lines-fill me-2"></i>Informações Pessoais</h6></div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold mb-1">Nome Completo</label>
                <input type="text" className={inputClass} name="nome" value={profileData.nome} onChange={handleInputChange} required readOnly={!isEditing} />
              </div>
              
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold mb-1">E-mail</label>
                <input type="email" className={inputClass} name="email" value={profileData.email} onChange={handleInputChange} required readOnly={!isEditing} />
              </div>

              {userType === 'estudante' && (
                <>
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">CPF</label>
                    <input type="text" className={inputClass} name="cpf" value={profileData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" readOnly={!isEditing} />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">Data de Nascimento</label>
                    <input type="date" className={inputClass} name="dataNascimento" value={profileData.dataNascimento} onChange={handleInputChange} readOnly={!isEditing} />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">Gênero</label>
                    {isEditing ? (
                      <select className={selectClass} name="sexo" value={profileData.sexo} onChange={handleInputChange}>
                        <option value="">Selecione...</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                      </select>
                    ) : (
                      <div className={inputClass}>{profileData.sexo || '-'}</div>
                    )}
                  </div>
                </>
              )}

              {/* CONTATO */}
              <div className="col-12 mt-5"><h6 className="fw-bold text-orange border-bottom pb-2 mb-3"><i className="bi bi-telephone-fill me-2"></i>Contato</h6></div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold mb-1">Telefone / Celular</label>
                <input type="text" className={inputClass} name="telefone" value={profileData.telefone} onChange={handleInputChange} placeholder="(00) 00000-0000" readOnly={!isEditing} />
              </div>

              {userType === 'estudante' && (
                <>
                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold mb-1">Endereço Completo</label>
                    <input type="text" className={inputClass} name="endereco" value={profileData.endereco} onChange={handleInputChange} placeholder="Rua, Número, Bairro, CEP" readOnly={!isEditing} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold mb-1">Nome do Responsável</label>
                    <input type="text" className={inputClass} name="nomeResponsavel" value={profileData.nomeResponsavel} onChange={handleInputChange} placeholder="Nome do Responsável" readOnly={!isEditing} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold mb-1">Telefone do Responsável</label>
                    <input type="text" className={inputClass} name="telefoneResponsavel" value={profileData.telefoneResponsavel} onChange={handleInputChange} placeholder="(00) 00000-0000" readOnly={!isEditing} />
                  </div>
                </>
              )}

              {/* DADOS ESCOLARES E ESPORTIVOS (Estudante) */}
              {userType === 'estudante' && (
                <>
                  <div className="col-12 mt-5"><h6 className="fw-bold text-orange border-bottom pb-2 mb-3"><i className="bi bi-backpack-fill me-2"></i>Dados Escolares e Físicos</h6></div>

                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold mb-1">Matrícula</label>
                    <input type="text" className={inputClass} name="matricula" value={profileData.matricula} onChange={handleInputChange} readOnly={!isEditing} />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold mb-1">Turma</label>
                    {isEditing ? (
                      <select className={selectClass} name="turma" value={profileData.turma} onChange={handleInputChange}>
                        <option value="">Selecione...</option>
                        {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <div className={inputClass}>{profileData.turma || '-'}</div>
                    )}
                  </div>
                  
                  <div className="col-md-2">
                    <label className="form-label text-muted small fw-bold mb-1">Idade</label>
                    <input type="number" className={inputClass} name="idade" value={profileData.idade} onChange={handleInputChange} readOnly={!isEditing} />
                  </div>
                  
                  <div className="col-md-2">
                    <label className="form-label text-muted small fw-bold mb-1">Peso (kg)</label>
                    <input type="number" step="0.1" className={inputClass} name="peso" value={profileData.peso} onChange={handleInputChange} readOnly={!isEditing} />
                  </div>
                  
                  <div className="col-md-2">
                    <label className="form-label text-muted small fw-bold mb-1">Altura (m)</label>
                    <input type="number" step="0.01" className={inputClass} name="altura" value={profileData.altura} onChange={handleInputChange} readOnly={!isEditing} />
                  </div>

                  {/* INFORMAÇÕES ESPORTIVAS E MÉDICAS */}
                  <div className="col-12 mt-5"><h6 className="fw-bold text-orange border-bottom pb-2 mb-3"><i className="bi bi-heart-pulse-fill me-2 text-danger"></i>Informações Esportivas e Médicas</h6></div>

                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold mb-1">Nº da Camisa</label>
                    <input type="number" className={inputClass} name="numeroCamisa" value={profileData.numeroCamisa} onChange={handleInputChange} readOnly={!isEditing} placeholder="Ex: 10" />
                  </div>

                  <div className="col-md-9">
                    <label className="form-label text-muted small fw-bold mb-1">Alergias</label>
                    <input type="text" className={inputClass} name="alergias" value={profileData.alergias} onChange={handleInputChange} readOnly={!isEditing} placeholder="Descreva alergias a medicamentos, alimentos, etc" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold mb-1">Lesões Anteriores</label>
                    {isEditing ? (
                      <textarea className={inputClass} name="lesoesAnteriores" rows="2" value={profileData.lesoesAnteriores} onChange={handleInputChange} placeholder="Descreva se houver"></textarea>
                    ) : (
                      <div className={inputClass} style={{ minHeight: '38px', whiteSpace: 'pre-wrap' }}>{profileData.lesoesAnteriores || '-'}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold mb-1">Restrições Médicas</label>
                    {isEditing ? (
                      <textarea className={inputClass} name="restricoesMedicas" rows="2" value={profileData.restricoesMedicas} onChange={handleInputChange} placeholder="Descreva se houver"></textarea>
                    ) : (
                      <div className={inputClass} style={{ minHeight: '38px', whiteSpace: 'pre-wrap' }}>{profileData.restricoesMedicas || '-'}</div>
                    )}
                  </div>

                  {/* MODALIDADES */}
                  <div className="col-12 mt-5">
                    <h6 className="fw-bold text-orange border-bottom pb-2 mb-3"><i className="bi bi-trophy-fill me-2"></i>Modalidade(s) de Interesse</h6>
                    
                    {!isEditing && profileData.esportes.length === 0 ? (
                      <div className="text-muted fst-italic py-3">Nenhuma modalidade selecionada.</div>
                    ) : (
                      <div className="row g-4 mt-1">
                        {Object.entries(modalidadesCategorizadas).map(([categoria, lista]) => {
                          // Se não estiver editando, só mostrar categorias que tem alguma modalidade selecionada
                          const listaSelecionada = lista.filter(mod => profileData.esportes.includes(mod));
                          if (!isEditing && listaSelecionada.length === 0) return null;

                          return (
                            <div key={categoria} className="col-md-6 col-lg-4">
                              <div className="fw-bold text-muted small mb-2">{categoria}</div>
                              <div className="d-flex flex-column gap-2">
                                {(isEditing ? lista : listaSelecionada).map(mod => {
                                  const isChecked = profileData.esportes.includes(mod);
                                  return (
                                    <div className="form-check" key={mod}>
                                      <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id={`mod-${mod}`} 
                                        checked={isChecked}
                                        onChange={() => handleModalidadeToggle(mod)}
                                        disabled={!isEditing}
                                        style={!isEditing ? { opacity: 0.8 } : {}}
                                      />
                                      <label className={`form-check-label small ${!isEditing && 'fw-medium text-dark'}`} htmlFor={`mod-${mod}`}>
                                        {mod}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* SAVE BUTTON */}
              {isEditing && (
                <div className="col-12 text-end mt-5 border-top pt-4">
                  <button type="submit" className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow d-flex align-items-center ms-auto">
                    <i className="bi bi-save2-fill me-2"></i> Salvar Alterações
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {/* SESSÃO MINHAS ANÁLISES (APENAS ESTUDANTE) */}
      {userType === 'estudante' && (
        <div className="card-flat p-4 p-md-5 mx-auto mb-5 shadow-sm bg-white border-top border-4 border-primary" style={{ maxWidth: '900px', borderRadius: '16px' }}>
          <h4 className="fw-bold text-blue-dark mb-4 border-bottom pb-3"><i className="bi bi-clipboard2-data-fill me-2 text-primary"></i>Minhas Análises</h4>
          <Analises embebed={true} />
        </div>
      )}
    </Layout>
  );
};

export default Perfil;
