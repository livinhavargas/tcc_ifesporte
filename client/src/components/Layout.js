import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Users, Calendar, Trophy, Bell, LogOut, Trash2, X, Sun, Moon, 
  GraduationCap, Menu, BarChart3 
} from 'lucide-react';
import Logo from './Logo';
import { getNotifications, markAllAsRead, clearNotifications } from '../utils/notifications';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('userName') || 'Usuário';
  const userPhoto = localStorage.getItem('foto');
  const userInitials = userName.substring(0, 2).toUpperCase();
  const userType = localStorage.getItem('tipo') || 'Estudante';
  const isStudent = userType.toLowerCase() === 'estudante';
  const displayUserType = isStudent ? 'Estudante' : 'Treinador(a)';
  const { isDark, toggleTheme } = useTheme();

  // Mobile drawer state (< 768px)
  const [mobileOpen, setMobileOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Resize listener to close mobile drawer on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  // Notifications update listener
  useEffect(() => {
    const updateNotifs = () => {
      setNotifications(getNotifications());
    };
    updateNotifs();
    window.addEventListener('notifications_updated', updateNotifs);
    return () => window.removeEventListener('notifications_updated', updateNotifs);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' ? 'active' : '';
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg)', position: 'relative', width: '100%', maxWidth: '100vw', overflowX: 'clip' }}>
      {/* ── Mobile Backdrop ── */}
      {mobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside 
        className={`sidebar-aside ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Menu Principal"
      >
        {/* Sidebar Header: Logo & Mobile Close Button */}
        <div style={{
          padding: '18px 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)',
          minHeight: '60px',
          gap: '8px'
        }}>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              overflow: 'hidden',
              minWidth: 0
            }}
            title="IFesporte Início"
          >
            <Logo height="36px" />
          </Link>

          {/* Mobile Close Button (shown only on mobile drawer) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="sidebar-toggle-btn d-flex d-md-none"
            title="Fechar menu"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info Card */}
        <div
          onClick={() => navigate('/perfil')}
          title="Ver Perfil"
          style={{
            margin: '10px 12px 14px',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{
            width: '36px', height: '36px',
            borderRadius: 'var(--radius-full)',
            background: userPhoto ? 'transparent' : 'var(--primary)',
            color: 'var(--text-inverse)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700,
            overflow: 'hidden', flexShrink: 0,
            boxShadow: 'var(--shadow-xs)'
          }}>
            {userPhoto ? (
              <img src={userPhoto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>
          <div className="user-meta" style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {userName}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              {displayUserType}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav 
          style={{ 
            flex: 1, 
            padding: '4px 8px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px',
            overflowY: 'auto'
          }}
        >
          <Link 
            to="/" 
            className={`sidebar-link ${isActive('/')}`}
            aria-label="Início"
          >
            <span className="sidebar-icon"><Home size={18} /></span>
            <span>Início</span>
          </Link>

          {!isStudent && (
            <Link 
              to="/alunos" 
              className={`sidebar-link ${isActive('/alunos')}`}
              aria-label="Alunos"
            >
              <span className="sidebar-icon"><Users size={18} /></span>
              <span>Alunos</span>
            </Link>
          )}

          <Link 
            to="/agenda" 
            className={`sidebar-link ${isActive('/agenda')}`}
            aria-label="Agenda"
          >
            <span className="sidebar-icon"><Calendar size={18} /></span>
            <span>Agenda</span>
          </Link>

          {isStudent && (
            <Link 
              to="/analises" 
              className={`sidebar-link ${isActive('/analises')}`}
              aria-label="Análises"
            >
              <span className="sidebar-icon"><BarChart3 size={18} /></span>
              <span>Análises</span>
            </Link>
          )}

          {!isStudent && (
            <Link 
              to="/educacao-fisica" 
              className={`sidebar-link ${isActive('/educacao-fisica')}`}
              aria-label="Educação Física"
            >
              <span className="sidebar-icon"><GraduationCap size={18} /></span>
              <span>Educação Física</span>
            </Link>
          )}

          {!isStudent && (
            <Link 
              to="/esportes" 
              className={`sidebar-link ${isActive('/esportes')}`}
              aria-label="Esportes"
            >
              <span className="sidebar-icon"><Trophy size={18} /></span>
              <span>Esportes</span>
            </Link>
          )}
        </nav>

        {/* Bottom Actions: Logout */}
        <div style={{ 
          padding: '12px 14px', 
          borderTop: '1px solid var(--border-light)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px' 
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              color: 'var(--error)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            className="hover-bg-error"
            aria-label="Sair da Conta"
          >
            <span className="sidebar-icon"><LogOut size={18} /></span>
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div 
        className="sidebar-main-content"
      >
        {/* Top Navbar — Fully Mobile-First */}
        <header 
          className="page-header"
          style={{
            height: 'var(--navbar-height)',
            background: 'var(--bg-navbar)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            transition: 'all var(--transition-base)'
          }}
        >
          {/* Left: Mobile Menu Button + Brand Logo on Mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="sidebar-toggle-btn d-flex d-md-none"
              title="Abrir menu lateral"
              aria-label="Abrir menu lateral"
              style={{ width: '36px', height: '36px', flexShrink: 0 }}
            >
              <Menu size={19} />
            </button>

            {/* Mobile Brand Link */}
            <Link 
              to="/" 
              className="d-flex d-md-none align-items-center gap-2 text-decoration-none"
              style={{ minWidth: 0 }}
            >
              <Logo height="24px" collapsed={true} />
              <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text)', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                IFesporte
              </span>
            </Link>
          </div>

          {/* Right: Theme Toggle, Notifications, Profile Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', flexShrink: 0 }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                height: '36px',
                padding: '0 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: isDark ? 'var(--warning)' : 'var(--text-secondary)',
                cursor: 'pointer',
                background: 'var(--bg-card)',
                transition: 'all var(--transition-fast)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
              title={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              aria-label="Alternar tema"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span className="d-none d-md-inline" style={{ color: 'var(--text-secondary)' }}>
                {isDark ? 'Claro' : 'Escuro'}
              </span>
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (unreadCount > 0) markAllAsRead();
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  position: 'relative',
                  background: 'var(--bg-card)',
                  transition: 'all var(--transition-fast)',
                  padding: 0
                }}
                title="Notificações"
                aria-label="Notificações"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--error)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    minWidth: '17px',
                    height: '17px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  width: 'min(300px, calc(100vw - 24px))',
                  maxHeight: '380px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg)'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>Notificações</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {notifications.length > 0 && (
                        <button 
                          onClick={clearNotifications}
                          style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                          title="Limpar todas"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => setShowNotifDropdown(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                        aria-label="Fechar notificações"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                        Nenhuma notificação recente.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          marginBottom: '4px',
                          background: n.unread ? 'var(--primary-light)' : 'transparent',
                          border: '1px solid var(--border-light)',
                          transition: 'all var(--transition-fast)'
                        }}>
                          <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text)', marginBottom: '2px' }}>{n.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: '4px', textAlign: 'right' }}>
                            {new Date(n.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div
              onClick={() => navigate('/perfil')}
              style={{
                width: '34px',
                height: '34px',
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
                border: '2px solid var(--border-light)',
                flexShrink: 0
              }}
              title="Acessar Perfil"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/perfil')}
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
        <main 
          className="page-main"
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--bg)',
            minWidth: 0,
            width: '100%'
          }}
        >
          <div className="main-container-fluid">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

