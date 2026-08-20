import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Trophy, Bell, LogOut, Trash2, X } from 'lucide-react';
import Logo from './Logo';
import { getNotifications, markAllAsRead, clearNotifications } from '../utils/notifications';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('userName') || 'Usuário';
  const userPhoto = localStorage.getItem('foto');
  const userInitials = userName.substring(0, 2).toUpperCase();
  const userType = localStorage.getItem('tipo') || 'Estudante';
  const displayUserType = userType.charAt(0).toUpperCase() + userType.slice(1);

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    const updateNotifs = () => {
      setNotifications(getNotifications());
    };
    updateNotifs();
    window.addEventListener('notifications_updated', updateNotifs);
    return () => window.removeEventListener('notifications_updated', updateNotifs);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' ? 'active' : '';
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const unreadCount = notifications.filter(n => n.unread).length;

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
        <div style={{ padding: '24px 24px 8px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
            <Logo height="42px" style={{ marginLeft: '16px' }} />
          </Link>
        </div>

        {/* User Info */}
        <div
          style={{
            margin: '8px 16px 16px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{
            width: '36px', height: '36px',
            borderRadius: 'var(--radius-full)',
            background: userPhoto ? 'transparent' : 'var(--primary)',
            color: 'var(--text-inverse)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700,
            overflow: 'hidden', flexShrink: 0
          }}>
            {userPhoto ? (
              <img src={userPhoto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {userName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              {displayUserType}
            </div>
          </div>
        </div>

        {/* Nav Menu */}
        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link to="/" className={`sidebar-link ${isActive('/')}`}>
            <Home size={18} />
            <span>Início</span>
          </Link>

          <Link to="/alunos" className={`sidebar-link ${isActive('/alunos')}`}>
            <Users size={18} />
            <span>Alunos</span>
          </Link>

          <Link to="/agenda" className={`sidebar-link ${isActive('/agenda')}`}>
            <Calendar size={18} />
            <span>Agenda</span>
          </Link>

          <Link to="/esportes" className={`sidebar-link ${isActive('/esportes')}`}>
            <Trophy size={18} />
            <span>Esportes</span>
          </Link>
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-light)' }}>
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
          >
            <LogOut size={18} />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
        {/* Top Navbar */}
        <header style={{
          height: 'var(--navbar-height)',
          background: 'var(--bg-navbar)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'relative',
          zIndex: 90
        }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>
              {getGreeting()}, <span style={{ color: 'var(--primary)' }}>{userName.split(' ')[0]}</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (unreadCount > 0) markAllAsRead();
                }}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  position: 'relative',
                  background: 'var(--bg-card)',
                  transition: 'all var(--transition-fast)'
                }}
                title="Notificações"
              >
                <Bell size={18} />
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
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Notification Popover Dropdown */}
              {showNotifDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '320px',
                  maxHeight: '400px',
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
                    padding: '12px 16px',
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
