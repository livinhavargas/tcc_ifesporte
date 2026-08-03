import React from 'react';
import Layout from '../../components/Layout';
import Logo from '../../components/Logo';

export default function AdminDashboard() {
  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>Painel Administrativo</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0' }}>Gerencie as configurações gerais e dados institucionais.</p>
          </div>
          <a href="/" className="btn btn-secondary">Voltar</a>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }} className="hover-lift">
              <div>
                <div style={{
                  width: '64px', height: '64px', borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', marginBottom: '20px'
                }}>
                  <i className="bi bi-people-fill"></i>
                </div>
                <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px', fontSize: '1rem' }}>Usuários</h4>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginBottom: '24px' }}>Gerenciar contas de treinadores e administradores.</p>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }}>Acessar</button>
            </div>
          </div>
          <div className="col-md-4">
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }} className="hover-lift">
              <div>
                <div style={{
                  width: '64px', height: '64px', borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', marginBottom: '20px'
                }}>
                  <i className="bi bi-gear-fill"></i>
                </div>
                <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px', fontSize: '1rem' }}>Configurações</h4>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginBottom: '24px' }}>
                  Ajustes globais do sistema <Logo height="14px" style={{ display: 'inline-block', verticalAlign: 'baseline', marginLeft: '4px' }} />.
                </p>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }}>Acessar</button>
            </div>
          </div>
          <div className="col-md-4">
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }} className="hover-lift">
              <div>
                <div style={{
                  width: '64px', height: '64px', borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', marginBottom: '20px'
                }}>
                  <i className="bi bi-bar-chart-fill"></i>
                </div>
                <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px', fontSize: '1rem' }}>Relatórios</h4>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginBottom: '24px' }}>Visualizar estatísticas gerais do projeto.</p>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }}>Acessar</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
