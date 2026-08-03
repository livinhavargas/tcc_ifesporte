import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Analises from './IFesporte/Analises';

const Perfil = () => {
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('tipo');
  
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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
    if (!isEditing) return;
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
      const payload = { ...profileData, serie: profileData.turma };

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
        setIsEditing(false);
        fetchProfile();
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem('Erro ao atualizar perfil.');
      }
    } catch (error) {
      setMensagem('Erro de conexão ao servidor.');
    }
  };

  const fieldStyle = isEditing ? {
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
  } : {
    width: '100%',
    padding: '10px 0',
    border: 'none',
    borderBottom: '1px dashed var(--border)',
    borderRadius: 0,
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: 'var(--text)',
    background: 'transparent',
    minHeight: 'auto',
    pointerEvents: 'none'
  };

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>Meu Perfil</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0' }}>Visualize e mantenha seus dados atualizados.</p>
          </div>
          <div>
            {!isEditing ? (
              <button 
                type="button" 
                onClick={() => setIsEditing(true)} 
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="bi bi-pencil-square"></i> Editar Perfil
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => {
                  fetchProfile();
                  setIsEditing(false);
                }} 
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="bi bi-x-circle"></i> Cancelar Edição
              </button>
            )}
          </div>
        </div>

        {mensagem && (
          <div style={{
            background: mensagem.includes('✅') ? 'var(--success-light)' : 'var(--error-light)',
            color: mensagem.includes('✅') ? '#065F46' : '#991B1B',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <i className={`bi ${mensagem.includes('✅') ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>{mensagem}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '32px',
              marginBottom: '32px'
            }}>
              
              {/* Photo Area */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
                 <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                   {profileData.foto ? (
                     <img src={profileData.foto} alt="Perfil" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg)' }} />
                   ) : (
                     <div style={{
                       width: '100%', height: '100%', borderRadius: '50%',
                       background: 'var(--primary)', color: 'var(--text-inverse)',
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       fontWeight: 700, fontSize: '3rem', border: '4px solid var(--bg)'
                     }}>
                       {profileData.nome ? profileData.nome.charAt(0).toUpperCase() : 'U'}
                     </div>
                   )}
                   {isEditing && (
                     <>
                       <label htmlFor="fotoInput" style={{
                         position: 'absolute', bottom: '0', right: '0',
                         background: 'var(--primary)', color: '#fff',
                         width: '36px', height: '36px', borderRadius: '50%',
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         cursor: 'pointer', boxShadow: 'var(--shadow-sm)', border: '2px solid #fff'
                       }}>
                         <i className="bi bi-camera-fill"></i>
                       </label>
                       <input type="file" id="fotoInput" className="d-none" accept="image/*" onChange={handlePhotoChange} />
                     </>
                   )}
                 </div>
              </div>

              {/* Informações Pessoais */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  <i className="bi bi-person-lines-fill"></i>
                </div>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Informações Pessoais</h6>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Nome Completo</label>
                    <input type="text" name="nome" value={profileData.nome} onChange={handleInputChange} required readOnly={!isEditing} style={fieldStyle} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">E-mail</label>
                    <input type="email" name="email" value={profileData.email} onChange={handleInputChange} required readOnly={!isEditing} style={fieldStyle} />
                  </div>

                  {userType === 'estudante' && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label text-muted small mb-1">CPF</label>
                        <input type="text" name="cpf" value={profileData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small mb-1">Data de Nascimento</label>
                        <input type="date" name="dataNascimento" value={profileData.dataNascimento} onChange={handleInputChange} readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small mb-1">Gênero</label>
                        {isEditing ? (
                          <select name="sexo" value={profileData.sexo} onChange={handleInputChange} style={fieldStyle}>
                            <option value="">Selecione...</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Outro">Outro</option>
                          </select>
                        ) : (
                          <input type="text" value={profileData.sexo || '-'} readOnly style={fieldStyle} />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contato */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  <i className="bi bi-telephone-fill"></i>
                </div>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Contato e Localização</h6>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Telefone / Celular</label>
                    <input type="text" name="telefone" value={profileData.telefone} onChange={handleInputChange} placeholder="(00) 00000-0000" readOnly={!isEditing} style={fieldStyle} />
                  </div>
                  {userType === 'estudante' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label text-muted small mb-1">Endereço Completo</label>
                        <input type="text" name="endereco" value={profileData.endereco} onChange={handleInputChange} placeholder="Rua, Número, Bairro, CEP" readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small mb-1">Nome do Responsável</label>
                        <input type="text" name="nomeResponsavel" value={profileData.nomeResponsavel} onChange={handleInputChange} placeholder="Nome do Responsável" readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small mb-1">Telefone do Responsável</label>
                        <input type="text" name="telefoneResponsavel" value={profileData.telefoneResponsavel} onChange={handleInputChange} placeholder="(00) 00000-0000" readOnly={!isEditing} style={fieldStyle} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Dados Escolares e Físicos */}
              {userType === 'estudante' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                      <i className="bi bi-backpack-fill"></i>
                    </div>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Dados Escolares e Físicos</h6>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1">Matrícula</label>
                        <input type="text" name="matricula" value={profileData.matricula} onChange={handleInputChange} readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1">Turma</label>
                        {isEditing ? (
                          <select name="turma" value={profileData.turma} onChange={handleInputChange} style={fieldStyle}>
                            <option value="">Selecione...</option>
                            {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : (
                          <input type="text" value={profileData.turma || '-'} readOnly style={fieldStyle} />
                        )}
                      </div>
                      <div className="col-md-2">
                        <label className="form-label text-muted small mb-1">Idade</label>
                        <input type="number" name="idade" value={profileData.idade} onChange={handleInputChange} readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label text-muted small mb-1">Peso (kg)</label>
                        <input type="number" step="0.1" name="peso" value={profileData.peso} onChange={handleInputChange} readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label text-muted small mb-1">Altura (m)</label>
                        <input type="number" step="0.01" name="altura" value={profileData.altura} onChange={handleInputChange} readOnly={!isEditing} style={fieldStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Informações Esportivas e Médicas */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--error-light)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                      <i className="bi bi-heart-pulse-fill"></i>
                    </div>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Informações Esportivas e Médicas</h6>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1">Nº da Camisa</label>
                        <input type="number" name="numeroCamisa" value={profileData.numeroCamisa} onChange={handleInputChange} readOnly={!isEditing} placeholder="Ex: 10" style={fieldStyle} />
                      </div>
                      <div className="col-md-9">
                        <label className="form-label text-muted small mb-1">Alergias</label>
                        <input type="text" name="alergias" value={profileData.alergias} onChange={handleInputChange} readOnly={!isEditing} placeholder="Descreva alergias a medicamentos, alimentos, etc" style={fieldStyle} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small mb-1">Lesões Anteriores</label>
                        {isEditing ? (
                          <textarea name="lesoesAnteriores" rows="2" value={profileData.lesoesAnteriores} onChange={handleInputChange} placeholder="Descreva se houver" style={fieldStyle}></textarea>
                        ) : (
                          <div style={{ ...fieldStyle, minHeight: '38px', whiteSpace: 'pre-wrap' }}>{profileData.lesoesAnteriores || '-'}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small mb-1">Restrições Médicas</label>
                        {isEditing ? (
                          <textarea name="restricoesMedicas" rows="2" value={profileData.restricoesMedicas} onChange={handleInputChange} placeholder="Descreva se houver" style={fieldStyle}></textarea>
                        ) : (
                          <div style={{ ...fieldStyle, minHeight: '38px', whiteSpace: 'pre-wrap' }}>{profileData.restricoesMedicas || '-'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modalidades */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                      <i className="bi bi-trophy-fill"></i>
                    </div>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Modalidade(s) de Interesse</h6>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                    {!isEditing && profileData.esportes.length === 0 ? (
                      <div style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: '0.875rem' }}>Nenhuma modalidade selecionada.</div>
                    ) : (
                      <div className="row g-4">
                        {Object.entries(modalidadesCategorizadas).map(([categoria, lista]) => {
                          const listaSelecionada = lista.filter(mod => profileData.esportes.includes(mod));
                          if (!isEditing && listaSelecionada.length === 0) return null;

                          return (
                            <div key={categoria} className="col-md-6 col-lg-4">
                              <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{categoria}</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(isEditing ? lista : listaSelecionada).map(mod => {
                                  const isChecked = profileData.esportes.includes(mod);
                                  return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} key={mod}>
                                      <input 
                                        type="checkbox" 
                                        id={`mod-${mod}`} 
                                        checked={isChecked}
                                        onChange={() => handleModalidadeToggle(mod)}
                                        disabled={!isEditing}
                                        style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', opacity: !isEditing ? 0.8 : 1 }}
                                      />
                                      <label style={{ fontSize: '0.8125rem', color: 'var(--text)', cursor: isEditing ? 'pointer' : 'default', fontWeight: 500 }} htmlFor={`mod-${mod}`}>
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

              {/* Save button */}
              {isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                    <i className="bi bi-save-fill"></i> Salvar Alterações
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Sessão Minhas Análises */}
      {userType === 'estudante' && !loading && (
        <div style={{
          maxWidth: '900px',
          margin: '32px auto 0',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          padding: '32px'
        }}>
          <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '24px', fontSize: '1.125rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="bi bi-clipboard2-data-fill" style={{ color: 'var(--primary)' }}></i>Minhas Análises
          </h4>
          <Analises embebed={true} />
        </div>
      )}
    </Layout>
  );
};

export default Perfil;
