import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';

const Profile = () => {
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('tipo');
  
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [profileData, setProfileData] = useState({
    nome: '', email: '', telefone: '', cpf: '', rg: '', dataNascimento: '',
    sexo: '', cep: '', endereco: '', complemento: '', cidade: '', estado: '',
    instituicao: '', cargo: '', modalidadePrincipal: '', experiencia: '', registroProfissional: '', foto: '',
    peso: '', altura: '', idade: '', matricula: '', serie: '', esportes: []
  });
  
  const fileInputRef = useRef(null);

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
        ...profileData,
        ...data,
        dataNascimento: data.dataNascimento ? data.dataNascimento.split('T')[0] : ''
      });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      if (response.ok) {
        setMensagem('✅ Perfil atualizado com sucesso!');
        localStorage.setItem('userName', profileData.nome);
        if (profileData.foto) localStorage.setItem('foto', profileData.foto);
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem('Erro ao atualizar perfil.');
      }
    } catch (error) {
      setMensagem('Erro de conexão ao servidor.');
    }
  };

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
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>Meu Perfil</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0' }}>Gerencie suas informações pessoais e credenciais.</p>
          </div>
          <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8125rem', padding: '6px 16px' }}>
            {userType ? userType.toUpperCase() : ''}
          </span>
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
          }}>{mensagem}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px' }}><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="row g-4">
              
              {/* Coluna Esquerda */}
              <div className="col-lg-4">
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '32px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{ position: 'relative', width: '130px', height: '130px', cursor: 'pointer', marginBottom: '20px' }} onClick={() => fileInputRef.current.click()}>
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
                    <div style={{
                      position: 'absolute', bottom: '0', right: '0',
                      background: 'var(--accent)', color: '#fff',
                      width: '36px', height: '36px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)', border: '2px solid #fff'
                    }}>
                      <i className="bi bi-camera-fill"></i>
                    </div>
                  </div>
                  <input type="file" className="d-none" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                  
                  <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px', fontSize: '1.125rem' }}>{profileData.nome}</h4>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>{profileData.email}</p>
                  
                  <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', width: '100%', margin: '24px 0' }} />
                  
                  <div style={{ width: '100%', textAlign: 'left' }}>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '12px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="bi bi-bar-chart-fill" style={{ color: 'var(--accent)' }}></i> Estatísticas
                    </h6>
                    <div style={{
                      background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '16px',
                      color: 'var(--text-tertiary)', fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic'
                    }}>
                      Módulo de estatísticas em desenvolvimento.
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita */}
              <div className="col-lg-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Informações Pessoais */}
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '28px'
                }}>
                  <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 20px', fontSize: '0.9375rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Informações Pessoais</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Nome Completo</label>
                      <input type="text" name="nome" value={profileData.nome} onChange={handleInputChange} required style={inputStyle} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">E-mail</label>
                      <input type="email" name="email" value={profileData.email} onChange={handleInputChange} required style={inputStyle} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">CPF</label>
                      <input type="text" name="cpf" value={profileData.cpf || ''} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">RG</label>
                      <input type="text" name="rg" value={profileData.rg || ''} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Data de Nasc.</label>
                      <input type="date" name="dataNascimento" value={profileData.dataNascimento || ''} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Telefone</label>
                      <input type="text" name="telefone" value={profileData.telefone || ''} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Sexo</label>
                      <select name="sexo" value={profileData.sexo || ''} onChange={handleInputChange} style={inputStyle}>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div className="col-md-8">
                      <label className="form-label text-muted small fw-bold">Endereço</label>
                      <input type="text" name="endereco" value={profileData.endereco || ''} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Cidade/UF</label>
                      <input type="text" name="cidade" value={profileData.cidade || ''} onChange={handleInputChange} style={inputStyle} />
                    </div>
                  </div>
                </div>

                {/* Informações Profissionais */}
                {userType !== 'estudante' && (
                  <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    padding: '28px'
                  }}>
                    <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 20px', fontSize: '0.9375rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Informações Profissionais</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Instituição</label>
                        <input type="text" name="instituicao" value={profileData.instituicao || ''} onChange={handleInputChange} style={inputStyle} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Cargo</label>
                        <input type="text" name="cargo" value={profileData.cargo || ''} onChange={handleInputChange} style={inputStyle} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">Modalidade Principal</label>
                        <input type="text" name="modalidadePrincipal" value={profileData.modalidadePrincipal || ''} onChange={handleInputChange} style={inputStyle} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">Registro Profissional</label>
                        <input type="text" name="registroProfissional" value={profileData.registroProfissional || ''} onChange={handleInputChange} style={inputStyle} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">Experiência</label>
                        <input type="text" name="experiencia" value={profileData.experiencia || ''} onChange={handleInputChange} style={inputStyle} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Segurança */}
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '28px'
                }}>
                  <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 20px', fontSize: '0.9375rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-shield-lock-fill" style={{ color: 'var(--accent)' }}></i>Segurança e Acesso
                  </h5>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '16px'
                  }}>
                    <div>
                      <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 2px', fontSize: '0.8125rem' }}>Senha de Acesso</h6>
                      <small style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>A última alteração foi há muito tempo.</small>
                    </div>
                    <button type="button" className="btn btn-outline-primary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>Alterar Senha</button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <button type="button" className="btn btn-outline-danger" onClick={handleLogout} style={{ padding: '10px 24px' }}>
                    <i className="bi bi-box-arrow-left me-2"></i> Sair da Conta
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 32px' }}>
                    Salvar Alterações
                  </button>
                </div>

              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
