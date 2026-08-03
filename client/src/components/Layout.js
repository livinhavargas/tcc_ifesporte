import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('userName') || 'Usuário';
  const userPhoto = localStorage.getItem('foto');
  const userInitials = userName.substring(0, 2).toUpperCase();
  const userType = localStorage.getItem('tipo') || 'Estudante';
  const displayUserType = userType.charAt(0).toUpperCase() + userType.slice(1);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' ? 'active' : '';
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 'var(--sidebar-width)',
        minWidth: '260px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 24px 8px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <Logo height="42px" />
          </Link>
        </div>

        {/* User Info */}
        <div
          style={{
            margin: '8px 16px 16px',
            padding: '14px 16px',
            background: 'var(--bg)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          onClick={() => navigate('/perfil')}
          onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--bg)'}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            background: userPhoto ? 'transparent' : 'var(--primary)',
            color: 'var(--text-inverse)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8125rem',
            fontWeight: 700,
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {userPhoto ? (
              <img src={userPhoto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{displayUserType}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 4px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '12px 24px 8px' }}>
            Menu
          </div>

          <Link className={`sidebar-link ${isActive('/')}`} to="/">
            <i className="bi bi-grid-1x2-fill sidebar-icon"></i> Início
          </Link>

          {userType !== 'estudante' && (
            <Link className={`sidebar-link ${isActive('/alunos')}`} to="/alunos">
              <i className="bi bi-people-fill sidebar-icon"></i> Alunos
            </Link>
          )}

          <Link className={`sidebar-link ${isActive('/agenda')}`} to="/agenda">
            <i className="bi bi-calendar3 sidebar-icon"></i> Agenda
          </Link>

          {userType !== 'estudante' && (
            <Link className={`sidebar-link ${isActive('/esportes')}`} to="/esportes">
              <i className="bi bi-trophy-fill sidebar-icon"></i> Modalidades
            </Link>
          )}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font)',
              fontWeight: 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all var(--transition-base)'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'var(--error-light)';
              e.currentTarget.style.color = 'var(--error)';
              e.currentTarget.style.borderColor = 'var(--error)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <i className="bi bi-box-arrow-left"></i> Sair
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Navbar */}
        <header style={{
          height: 'var(--navbar-height)',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          {/* Left: Greeting */}
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)' }}>
              {getGreeting()}, <span style={{ color: 'var(--primary)' }}>{userName.split(' ')[0]}</span>
            </span>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search (decorative) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 14px',
              color: 'var(--text-tertiary)',
              fontSize: '0.8125rem',
              minWidth: '200px',
              cursor: 'default'
            }}>
              <i className="bi bi-search" style={{ fontSize: '0.75rem' }}></i>
              <span>Pesquisar...</span>
            </div>

            {/* Notification bell (decorative) */}
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'default',
              position: 'relative'
            }}>
              <i className="bi bi-bell" style={{ fontSize: '1rem' }}></i>
            </div>

            {/* User Avatar */}
            <div
              onClick={() => navigate('/perfil')}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-full)',
                background: userPhoto ? 'transparent' : 'var(--primary)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'all var(--transition-fast)',
                border: '2px solid var(--border-light)'
              }}
            >
              {userPhoto ? (
                <img src={userPhoto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
          background: 'var(--bg)'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
