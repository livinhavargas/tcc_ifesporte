import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validação automática de E-mail
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setEmailError('E-mail inválido.');
      } else {
        setEmailError('');
      }
    }
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('tipo', data.tipo);
        localStorage.setItem('userName', data.nome);
        localStorage.setItem('userId', data.id);
        if (data.foto) localStorage.setItem('foto', data.foto);
        
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        onLogin(data.token, data.tipo, data.email);
        navigate('/');
      } else {
        setError(data.message || 'Erro ao realizar login. Verifique suas credenciais.');
      }
    } catch (err) {
      setError('Erro de conexão ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-white">
      {/* Área Institucional - Lado Esquerdo (40%) */}
      <div className="d-none d-lg-flex flex-column justify-content-center align-items-center bg-blue-dark text-white p-5" style={{ flex: '0 0 40%' }}>
        <div className="text-center w-100 d-flex flex-column align-items-center" style={{ maxWidth: '400px' }}>
          <div className="mb-5 d-flex justify-content-center w-100">
            <Logo height="80px" circleColor="#fff" textColor="#fff" />
          </div>
          <h4 className="fw-light mb-4 text-center">Tecnologia e esporte trabalhando juntos.</h4>
          <p className="text-white-50 text-center" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            Gerencie atletas, modalidades, treinamentos, eventos e análises de desempenho em um único ambiente moderno, seguro e intuitivo.
          </p>
        </div>
      </div>

      {/* Área de Autenticação - Lado Direito (60%) */}
      <div className="d-flex flex-column justify-content-center align-items-center p-4 p-md-5 w-100 bg-main">
        <div className="card-flat p-4 p-md-5 shadow-sm" style={{ width: '100%', maxWidth: '480px', borderRadius: '16px' }}>
          <div className="text-center mb-5 d-flex flex-column align-items-center">
            <h2 className="fw-bold text-blue-dark mb-4">Bem-vindo ao</h2>
            <div className="mb-4 d-flex justify-content-center w-100">
              <Logo height="56px" />
            </div>
            <p className="text-muted">Faça login para continuar.</p>
          </div>

          {error && <div className="alert alert-danger rounded-3 fw-bold small"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-bold small text-blue-dark">E-mail</label>
              <div className={`input-group ${emailError ? 'border border-danger rounded' : ''}`}>
                <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px' }}>
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  name="email"
                  placeholder="exemplo@instituicao.edu.br"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{ borderRadius: '0 10px 10px 0' }}
                />
              </div>
              {emailError && <div className="text-danger small mt-1 fw-bold">{emailError}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small text-blue-dark">Senha</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px' }}>
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 ps-0 border-end-0"
                  name="senha"
                  placeholder="Sua senha de acesso"
                  value={formData.senha}
                  onChange={handleInputChange}
                  required
                />
                <span 
                  className="input-group-text bg-white cursor-pointer text-muted" 
                  style={{ borderRadius: '0 10px 10px 0' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />
                <label className="form-check-label text-muted small fw-bold cursor-pointer" htmlFor="rememberMe">
                  Lembrar-me
                </label>
              </div>
              <Link to="/esqueci-senha" className="text-decoration-none fw-bold small text-blue-dark">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-3 mb-4 fw-bold"
              disabled={loading || !!emailError}
              style={{ borderRadius: '10px', transition: '0.3s' }}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              Entrar
            </button>
          </form>

          <div className="text-center text-muted small fw-bold">
            Não tem uma conta? <Link to="/register" className="text-blue-dark text-decoration-none ms-1">Criar Conta</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
