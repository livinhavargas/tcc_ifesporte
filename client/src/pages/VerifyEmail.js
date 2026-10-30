import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, MailCheck, ArrowRight, Sun, Moon } from 'lucide-react';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';
import { apiUrl } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { isDark, toggleTheme } = useTheme();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Validando seu link de confirmação de e-mail...');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificação ausente na URL. Verifique o link enviado para o seu e-mail.');
        return;
      }

      try {
        const response = await fetch(apiUrl(`/api/users/verify-email/${encodeURIComponent(token)}`));
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.mensagem || 'E-mail verificado com sucesso!');
          if (data.email) setUserEmail(data.email);
        } else {
          setStatus('error');
          setMessage(data.mensagem || 'Não foi possível verificar o e-mail. O link pode ter expirado ou já ter sido utilizado.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Erro de conexão com o servidor ao tentar verificar seu e-mail.');
      }
    };

    verify();
  }, [token]);

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '24px',
        position: 'relative',
        fontFamily: 'var(--font)'
      }}
    >
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-full)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: isDark ? 'var(--warning)' : 'var(--text-secondary)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-xs)'
        }}
        title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        <span>{isDark ? 'Claro' : 'Escuro'}</span>
      </button>

      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-light)',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <Logo height="48px" />
        </div>

        {status === 'loading' && (
          <div style={{ padding: '24px 0' }}>
            <div className="spinner-border mb-3" style={{ color: 'var(--primary)', width: '2.5rem', height: '2.5rem' }} />
            <h4 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.2rem', marginBottom: '8px' }}>
              Verificando E-mail...
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              {message}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--success-light)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <MailCheck size={32} />
            </div>
            <h4 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.25rem', marginBottom: '10px' }}>
              E-mail Confirmado!
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
              {message}
            </p>
            {userEmail && (
              <div
                style={{
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>{userEmail}</span>
              </div>
            )}
            <div style={{ marginTop: '8px' }}>
              <Link
                to={isLoggedIn ? '/perfil' : '/login'}
                className="btn btn-primary fw-bold px-4 py-2 rounded-3"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>{isLoggedIn ? 'Ir para Meu Perfil' : 'Ir para o Login'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--error-light)',
                color: 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <AlertTriangle size={32} />
            </div>
            <h4 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.25rem', marginBottom: '10px' }}>
              Falha na Verificação
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to={isLoggedIn ? '/perfil' : '/login'}
                className="btn btn-primary fw-bold px-4 py-2 rounded-3"
              >
                {isLoggedIn ? 'Voltar ao Meu Perfil' : 'Ir para o Login'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

