import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import ModalidadesSelector from '../../components/ModalidadesSelector';

const Profile = () => {
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('tipo');
  
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [profileData, setProfileData] = useState({
    nome: '', email: '', telefone: '', cpf: '', rg: '', dataNascimento: '',
    sexo: '', cep: '', endereco: '', complemento: '', cidade: '', estado: '',
    instituicao: '', cargo: '', modalidadePrincipal: '', experiencia: '', registroProfissional: '', foto: '',
    // Retrocompatibilidade
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

  return (
    <Layout>
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-blue-dark mb-0">Meu Perfil</h2>
          <span className="badge bg-orange px-3 py-2 fs-6 rounded-pill text-white shadow-sm">
            {userType.toUpperCase()}
          </span>
        </div>

        {mensagem && <div className={`alert ${mensagem.includes('✅') ? 'alert-success' : 'alert-danger'} fw-bold rounded-3 shadow-sm`}>{mensagem}</div>}

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="row g-4">
              
              {/* Cuna Esquerda (Foto e Resumo) */}
              <div className="col-lg-4">
                <div className="card-flat p-4 text-center">
                  <div className="d-inline-block position-relative cursor-pointer mb-3" onClick={() => fileInputRef.current.click()}>
                    {profileData.foto ? (
                      <img src={profileData.foto} alt="Perfil" className="rounded-circle bg-light border shadow-sm" style={{width: '150px', height: '150px', objectFit: 'cover'}} />
                    ) : (
                      <div className="rounded-circle bg-blue-dark text-white d-flex align-items-center justify-content-center fw-bold display-4 mx-auto shadow-sm" style={{width: '150px', height: '150px'}}>
                        {profileData.nome ? profileData.nome.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="position-absolute bottom-0 end-0 bg-orange text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', border: '3px solid white', transform: 'translate(10%, 10%)'}}>
                      <i className="bi bi-camera-fill"></i>
                    </div>
                  </div>
                  <input type="file" className="d-none" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                  <h4 className="fw-bold text-blue-dark mb-1">{profileData.nome}</h4>
                  <p className="text-muted small mb-0">{profileData.email}</p>
                  
                  <hr className="my-4" />
                  
                  <div className="text-start">
                    <h6 className="fw-bold text-blue-dark mb-3"><i className="bi bi-bar-chart-fill text-orange me-2"></i> Estatísticas</h6>
                    <div className="bg-light p-3 rounded-3 mb-2 text-center text-muted small">
                      Módulo de estatísticas em desenvolvimento.
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita (Formulários) */}
              <div className="col-lg-8">
                
                {/* Informações Pessoais */}
                <div className="card-flat p-4 mb-4">
                  <h5 className="fw-bold text-blue-dark mb-4 border-bottom pb-2">Informações Pessoais</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Nome Completo</label>
                      <input type="text" className="form-control bg-light" name="nome" value={profileData.nome} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">E-mail</label>
                      <input type="email" className="form-control bg-light" name="email" value={profileData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">CPF</label>
                      <input type="text" className="form-control bg-light" name="cpf" value={profileData.cpf || ''} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">RG</label>
                      <input type="text" className="form-control bg-light" name="rg" value={profileData.rg || ''} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Data de Nasc.</label>
                      <input type="date" className="form-control bg-light" name="dataNascimento" value={profileData.dataNascimento || ''} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Telefone</label>
                      <input type="text" className="form-control bg-light" name="telefone" value={profileData.telefone || ''} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Sexo</label>
                      <select className="form-select bg-light" name="sexo" value={profileData.sexo || ''} onChange={handleInputChange}>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div className="col-md-8">
                      <label className="form-label text-muted small fw-bold">Endereço</label>
                      <input type="text" className="form-control bg-light" name="endereco" value={profileData.endereco || ''} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small fw-bold">Cidade/UF</label>
                      <input type="text" className="form-control bg-light" name="cidade" value={profileData.cidade || ''} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>

                {/* Informações Profissionais (Não exibir para estudantes puros) */}
                {userType !== 'estudante' && (
                  <div className="card-flat p-4 mb-4">
                    <h5 className="fw-bold text-blue-dark mb-4 border-bottom pb-2">Informações Profissionais</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Instituição</label>
                        <input type="text" className="form-control bg-light" name="instituicao" value={profileData.instituicao || ''} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Cargo</label>
                        <input type="text" className="form-control bg-light" name="cargo" value={profileData.cargo || ''} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">Modalidade Principal</label>
                        <input type="text" className="form-control bg-light" name="modalidadePrincipal" value={profileData.modalidadePrincipal || ''} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">Registro Profissional</label>
                        <input type="text" className="form-control bg-light" name="registroProfissional" value={profileData.registroProfissional || ''} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">Experiência</label>
                        <input type="text" className="form-control bg-light" name="experiencia" value={profileData.experiencia || ''} onChange={handleInputChange} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Segurança */}
                <div className="card-flat p-4 mb-4">
                  <h5 className="fw-bold text-blue-dark mb-4 border-bottom pb-2"><i className="bi bi-shield-lock-fill text-orange me-2"></i>Segurança e Acesso</h5>
                  <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                    <div>
                      <h6 className="fw-bold mb-1">Senha de Acesso</h6>
                      <small className="text-muted">A última alteração foi há muito tempo.</small>
                    </div>
                    <button type="button" className="btn btn-outline-primary btn-sm fw-bold px-3">Alterar Senha</button>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button type="button" className="btn btn-danger px-4 py-2 rounded-3 fw-bold" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-left me-2"></i> Sair
                  </button>
                  <button type="submit" className="btn btn-primary px-5 py-2 rounded-3 fw-bold shadow-sm" style={{fontSize: '1.1rem'}}>
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
