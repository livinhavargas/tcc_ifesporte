import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import ModalidadesSelector from '../../components/ModalidadesSelector';

const Profile = () => {
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('tipo');
  
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    telefone: '',
    peso: '',
    altura: '',
    idade: '',
    matricula: '',
    serie: '',
    foto: '',
    esportes: []
  });

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];
  
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
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        peso: data.peso || '',
        altura: data.altura || '',
        idade: data.idade || '', 
        matricula: data.matricula || '',
        serie: data.serie || '', 
        foto: data.foto || '',
        esportes: data.esportes || []
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
      <div className="card-flat p-5 mx-auto" style={{ maxWidth: '800px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-blue-dark mb-0">Meu Perfil</h2>
        </div>

        {mensagem && <div className={`alert ${mensagem.includes('✅') ? 'alert-success' : 'alert-danger'}`}>{mensagem}</div>}

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="row g-4">
              
              <div className="col-12 text-center mb-3">
                 <div className="d-inline-block position-relative cursor-pointer" onClick={() => fileInputRef.current.click()}>
                   {profileData.foto ? (
                     <img src={profileData.foto} alt="Perfil" className="rounded-circle bg-light border shadow-sm" style={{width: '120px', height: '120px', objectFit: 'cover'}} />
                   ) : (
                     <div className="rounded-circle bg-blue-dark text-white d-flex align-items-center justify-content-center fw-bold fs-1 mx-auto shadow-sm" style={{width: '120px', height: '120px'}}>
                       {profileData.nome ? profileData.nome.charAt(0).toUpperCase() : 'U'}
                     </div>
                   )}
                   <div className="position-absolute bottom-0 end-0 bg-orange text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px', border: '3px solid white', transform: 'translate(10%, 10%)'}}>
                     <i className="bi bi-camera-fill"></i>
                   </div>
                 </div>
                 <input type="file" className="d-none" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Nome Completo</label>
                <input type="text" className="form-control" name="nome" value={profileData.nome} onChange={handleInputChange} required />
              </div>
              
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">E-mail</label>
                <input type="email" className="form-control" name="email" value={profileData.email} onChange={handleInputChange} required />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Telefone</label>
                <input type="text" className="form-control" name="telefone" value={profileData.telefone} onChange={handleInputChange} />
              </div>

              {userType === 'estudante' && (
                <>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">Turma</label>
                    <select className="form-select" name="serie" value={profileData.serie} onChange={handleInputChange}>
                      <option value="">Selecione...</option>
                      {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold">Idade</label>
                    <input type="number" className="form-control" name="idade" value={profileData.idade} onChange={handleInputChange} />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold">Peso (kg)</label>
                    <input type="number" step="0.1" className="form-control" name="peso" value={profileData.peso} onChange={handleInputChange} />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold">Altura (m)</label>
                    <input type="number" step="0.01" className="form-control" name="altura" value={profileData.altura} onChange={handleInputChange} />
                  </div>

                  <div className="col-12 mt-4">
                    <label className="form-label text-muted small fw-bold mb-3">Modalidades de Interesse</label>
                    <ModalidadesSelector 
                      selected={profileData.esportes} 
                      onChange={(novos) => setProfileData({...profileData, esportes: novos})} 
                    />
                  </div>
                </>
              )}

              <div className="col-12 d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
                <button type="button" className="btn btn-outline-danger px-4 rounded-3 fw-bold" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-left me-2"></i> Sair da Conta
                </button>
                <button type="submit" className="btn btn-primary px-5 py-3 rounded-3 fw-bold shadow-sm">
                  Salvar Alterações
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
