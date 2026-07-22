import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ModalidadesSelector from '../components/ModalidadesSelector';

const Register = () => {
  const [tipo, setTipo] = useState('estudante');
  const [formData, setFormData] = useState({
    nome: '',
    username: '',
    email: '',
    senha: '',
    adminCode: '',
    matricula: '',
    sexo: 'Feminino',
    esportes: []
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = { ...formData, tipo };

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Erro ao realizar cadastro');
      }
    } catch (err) {
      setError('Erro de conexão ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-main py-5">
      <div className="card-flat p-5 shadow-sm" style={{ width: '100%', maxWidth: '540px' }}>
        <div className="text-center mb-4">
          <img src="/logo.png" alt="IFEsporte" style={{ height: '50px', marginBottom: '20px' }} />
          <h4 className="fw-bold text-blue-dark">Crie sua conta</h4>
          <p className="text-muted">Preencha os dados abaixo para se cadastrar</p>
        </div>

        {error && <div className="alert alert-danger rounded-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-bold small text-blue-dark">Tipo de usuário</label>
            <div className="d-flex rounded-3 overflow-hidden border">
              <div 
                className={`flex-fill text-center p-3 cursor-pointer fw-bold ${tipo === 'admin' ? 'bg-orange-active text-blue-dark border-end' : 'bg-white text-muted border-end'}`}
                onClick={() => setTipo('admin')}
              >
                <i className="bi bi-shield-check d-block fs-5 mb-1"></i>
                Administrador
              </div>
              <div 
                className={`flex-fill text-center p-3 cursor-pointer fw-bold ${tipo === 'estudante' ? 'bg-orange-active text-blue-dark' : 'bg-white text-muted'}`}
                onClick={() => setTipo('estudante')}
              >
                <i className="bi bi-mortarboard d-block fs-5 mb-1"></i>
                Estudante
              </div>
            </div>
          </div>

          {tipo === 'estudante' && (
            <div className="alert alert-primary bg-blue-light border-0 text-blue-dark d-flex align-items-start mb-4 rounded-3">
              <i className="bi bi-info-circle-fill me-3 mt-1"></i>
              <small>Estudantes devem informar sua matrícula para vinculação ao sistema.</small>
            </div>
          )}

          {tipo === 'admin' && (
            <div className="mb-4">
              <label className="form-label fw-bold small text-blue-dark">Código Administrativo</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-key"></i></span>
                <input type="text" className="form-control border-start-0 ps-0" name="adminCode" placeholder="Código fornecido pela escola" value={formData.adminCode} onChange={handleInputChange} required />
              </div>
            </div>
          )}

          {tipo === 'estudante' && (
            <div className="mb-4">
              <label className="form-label fw-bold small text-blue-dark">Matrícula (Opcional)</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-card-text"></i></span>
                <input type="text" className="form-control border-start-0 ps-0" name="matricula" placeholder="Digite sua matrícula (se possuir)" value={formData.matricula} onChange={handleInputChange} />
              </div>
            </div>
          )}

          {tipo === 'estudante' && (
            <div className="mb-4">
              <label className="form-label fw-bold small text-blue-dark">Gênero</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-gender-ambiguous"></i></span>
                <select className="form-select border-start-0 ps-0" name="sexo" value={formData.sexo} onChange={handleInputChange} required>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="form-label fw-bold small text-blue-dark">Nome Completo</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-person"></i></span>
              <input type="text" className="form-control border-start-0 ps-0" name="nome" placeholder="Escolha um nome" value={formData.nome} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small text-blue-dark">Nome de usuário (Login)</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-at"></i></span>
              <input type="text" className="form-control border-start-0 ps-0" name="username" placeholder="Escolha um usuário" value={formData.username} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small text-blue-dark">E-mail</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-envelope"></i></span>
              <input type="email" className="form-control border-start-0 ps-0" name="email" placeholder="Digite seu e-mail" value={formData.email} onChange={handleInputChange} required />
            </div>
          </div>

          {tipo === 'estudante' && (
            <div className="col-12 mt-3 mb-2">
              <label className="form-label text-blue-dark small fw-bold mb-2">Modalidades de Interesse (Opcional)</label>
              <ModalidadesSelector 
                selected={formData.esportes}
                onChange={(novos) => setFormData({...formData, esportes: novos})}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="form-label fw-bold small text-blue-dark">Senha</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-lock"></i></span>
              <input type="password" className="form-control border-start-0 ps-0" name="senha" placeholder="Crie uma senha" value={formData.senha} onChange={handleInputChange} required />
              <span className="input-group-text bg-white cursor-pointer text-muted border-start-0"><i className="bi bi-eye"></i></span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-3 mb-4 rounded-3 fw-bold mt-3" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Cadastrar
          </button>
        </form>

        <div className="text-center text-muted small fw-bold">
          Já tem uma conta? <Link to="/login" className="text-blue-dark text-decoration-none ms-1">Fazer Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
