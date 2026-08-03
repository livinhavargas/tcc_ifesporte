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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font)' }}>
      {/* Left Panel — Branding */}
      <div style={{
        flex: '0 0 42%',
        background: 'linear-gradient(160deg, #1E5EFF 0%, #1A4FDB 50%, #0F3299 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '64px 48px',
        position: 'relative',
        overflow: 'hidden'
      }} className="d-none d-lg-flex">
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}></div>
        <div style={{ position: 'absolute', bottom: '-120px', left: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }}></div>

        <div style={{ maxWidth: '360px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '40px' }}>
            <Logo height="72px" circleColor="#fff" textColor="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontWeight: 300, fontSize: '1.375rem', marginBottom: '20px', lineHeight: 1.5 }}>
            Tecnologia e esporte<br/>trabalhando juntos.
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem', lineHeight: 1.7 }}>
            Gerencie atletas, modalidades, treinamentos, eventos e análises de desempenho em um único ambiente moderno, seguro e intuitivo.
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 32px',
        background: 'var(--bg)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 36px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-light)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ marginBottom: '20px' }} className="d-flex justify-content-center">
              <Logo height="48px" />
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
              Bem-vindo de volta
            </h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
              Faça login para continuar.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--error-light)',
              color: '#991B1B',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi bi-exclamation-triangle-fill"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text)', marginBottom: '6px' }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)', fontSize: '0.875rem'
                }}>
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="exemplo@instituicao.edu.br"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${emailError ? 'var(--error)' : 'var(--border)'}`,
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font)',
                    outline: 'none',
                    transition: 'all var(--transition-fast)',
                    background: 'var(--bg-input)'
                  }}
                  onFocus={e => { if (!emailError) e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--shadow-focus)'; }}
                  onBlur={e => { if (!emailError) e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {emailError && <div style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 600, marginTop: '4px' }}>{emailError}</div>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text)', marginBottom: '6px' }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)', fontSize: '0.875rem'
                }}>
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  placeholder="Sua senha de acesso"
                  value={formData.senha}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 40px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border)',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font)',
                    outline: 'none',
                    transition: 'all var(--transition-fast)',
                    background: 'var(--bg-input)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--shadow-focus)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.9375rem'
                  }}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </span>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                />
                Lembrar-me
              </label>
              <Link to="/esqueci-senha" style={{ textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--primary)' }}>
                Esqueci minha senha
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!emailError}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: loading || emailError ? '#94A3B8' : 'var(--primary)',
                color: '#fff',
                fontFamily: 'var(--font)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                cursor: loading || emailError ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-base)',
                boxShadow: '0 2px 8px rgba(30, 94, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading && <span className="spinner-border spinner-border-sm"></span>}
              Entrar
            </button>
          </form>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Não tem uma conta?{' '}
            <Link to="/register" style={{ textDecoration: 'none', fontWeight: 700, color: 'var(--primary)' }}>Criar Conta</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
