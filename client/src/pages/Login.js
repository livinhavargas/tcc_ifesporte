import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
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

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('tipo', data.tipo);
        localStorage.setItem('userName', data.nome);
        localStorage.setItem('userId', data.id);
        if (data.foto) localStorage.setItem('foto', data.foto);
        
        onLogin(data.token, data.tipo, data.email);
        navigate('/');
      } else {
        setError(data.message || 'Erro ao realizar login');
      }
    } catch (err) {
      setError('Erro de conexão ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-main">
      <div className="card-flat p-5 shadow-sm" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="text-center mb-5">
          <img src="/logo.png" alt="IFEsporte" style={{ height: '70px', marginBottom: '20px' }} />
          <h4 className="fw-bold text-blue-dark">Bem-vindo de volta!</h4>
          <p className="text-muted">Faça login para acessar sua conta</p>
        </div>

        {error && <div className="alert alert-danger rounded-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-bold small text-blue-dark">Nome de usuário ou e-mail</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                name="email"
                placeholder="Digite seu e-mail"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small text-blue-dark">Senha</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                name="senha"
                placeholder="Digite sua senha"
                value={formData.senha}
                onChange={handleInputChange}
                required
              />
              <span className="input-group-text bg-white cursor-pointer text-muted border-start-0">
                <i className="bi bi-eye"></i>
              </span>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-5">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="rememberMe" />
              <label className="form-check-label text-muted small" htmlFor="rememberMe">
                Lembrar-me
              </label>
            </div>
            <Link to="#" className="text-decoration-none fw-bold small text-blue-dark">
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-3 mb-4 rounded-3 fw-bold"
            disabled={loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Entrar
          </button>
        </form>

        <div className="text-center text-muted small fw-bold">
          Não tem uma conta? <Link to="/register" className="text-blue-dark text-decoration-none ms-1">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
