import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userName = localStorage.getItem('userName') || 'Usuário';
  const userPhoto = localStorage.getItem('foto');
  const userInitials = userName.substring(0, 2).toUpperCase();
  const userType = localStorage.getItem('tipo') || 'Estudante'; // lowercase internally maybe, but display as title case

  const displayUserType = userType === 'admin' ? 'Administrador' : 'Estudante';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tipo');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  const handleProfile = () => {
    navigate('/perfil');
    setShowUserMenu(false);
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path) && location.pathname !== '/' ? 'active' : '';
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Top Header Full Width */}
      <header className="w-100">
        {/* Faixa azul escura no topo */}
        <div className="bg-blue-top" style={{ height: '16px' }}></div>
        
        {/* Header content cinza/azul claro */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: '#D5DFE8' }}>
          <div>
            {/* O SVG oficial deve ter as cores originais (azul e laranja), sem filtros de inversão */}
            <img src="/logo.png" alt="IFEsporte" style={{ height: '65px' }} />
          </div>
          
          <div className="position-relative">
            <div 
              className="d-flex align-items-center cursor-pointer px-3 py-2 hover-bg-light"
              style={{ backgroundColor: '#E2E8F0', borderRadius: '12px', border: '1px solid #CBD5E1', transition: 'all 0.2s' }}
              onClick={() => navigate('/perfil')}
            >
              <div 
                className="d-flex align-items-center justify-content-center bg-blue-dark text-white rounded-circle shadow-sm me-3"
                style={{ width: '40px', height: '40px', fontSize: '0.9rem', overflow: 'hidden' }}
              >
                {userPhoto ? (
                  <img src={userPhoto} alt="Perfil" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <span className="fw-bold">{userInitials}</span>
                )}
              </div>
              <div className="text-start">
                <div className="fw-bold text-blue-dark" style={{ lineHeight: '1', fontSize: '1.1rem' }}>{userName}</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>{displayUserType}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body (Sidebar + Content) */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <aside className="bg-sidebar flex-shrink-0" style={{ width: '260px' }}>
          <nav className="pt-4">
            <Link className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
              <i className="bi bi-house-door-fill sidebar-icon"></i> Início
            </Link>
            
            {userType === 'admin' && (
              <Link className={`sidebar-link ${isActive('/alunos')}`} to="/alunos">
                <i className="bi bi-people-fill sidebar-icon"></i> Alunos
              </Link>
            )}
            
            <Link className={`sidebar-link ${isActive('/agenda')}`} to="/agenda">
              <i className="bi bi-calendar-event-fill sidebar-icon"></i> Agenda
            </Link>
            
            {userType === 'admin' && (
              <Link className={`sidebar-link ${isActive('/esportes')}`} to="/esportes">
                <i className="bi bi-trophy-fill sidebar-icon"></i> Esportes
              </Link>
            )}

            {userType === 'estudante' && (
              <Link className={`sidebar-link ${isActive('/analises')}`} to="/analises">
                <i className="bi bi-card-checklist sidebar-icon"></i> Minhas Análises
              </Link>
            )}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-grow-1 p-4 p-md-5 bg-main position-relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
