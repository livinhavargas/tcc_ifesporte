import React, { useState } from 'react';
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

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Top Header Full Width */}
      <header className="w-100">
        <div className="bg-blue-top" style={{ height: '16px' }}></div>
        
        <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: '#D5DFE8' }}>
          <div>
            <Link to="/" className="text-decoration-none d-flex align-items-center">
              <Logo height="48px" />
            </Link>
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
        <aside className="bg-sidebar flex-shrink-0 shadow-sm" style={{ width: '260px' }}>
          <nav className="pt-4 d-flex flex-column h-100 pb-4">
            
            <Link className={`sidebar-link ${isActive('/')}`} to="/">
              <i className="bi bi-grid-fill sidebar-icon"></i> Início
            </Link>
            
            {userType !== 'estudante' && (
              <Link className={`sidebar-link ${isActive('/perfil')}`} to="/perfil">
                <i className="bi bi-person-badge-fill sidebar-icon"></i> Meu Perfil
              </Link>
            )}

            {userType !== 'estudante' && (
              <Link className={`sidebar-link ${isActive('/alunos')}`} to="/alunos">
                <i className="bi bi-people-fill sidebar-icon"></i> Alunos
              </Link>
            )}

            {userType !== 'estudante' && (
              <Link className={`sidebar-link ${isActive('/esportes')}`} to="/esportes">
                <i className="bi bi-trophy-fill sidebar-icon"></i> Modalidades
              </Link>
            )}

            <Link className={`sidebar-link ${isActive('/agenda')}`} to="/agenda">
              <i className="bi bi-calendar-event-fill sidebar-icon"></i> Agenda
            </Link>

            {userType !== 'estudante' && (
              <Link className={`sidebar-link ${isActive('/analises')}`} to="/analises">
                <i className="bi bi-clipboard2-data-fill sidebar-icon"></i> Análises Esportivas
              </Link>
            )}

            {userType !== 'estudante' && (
              <Link className={`sidebar-link ${isActive('/relatorios')}`} to="/relatorios">
                <i className="bi bi-file-earmark-bar-graph-fill sidebar-icon"></i> Relatórios
              </Link>
            )}

            <div className="mt-auto px-4 w-100">
               <button onClick={handleLogout} className="btn btn-outline-danger w-100 fw-bold rounded-3">
                 <i className="bi bi-box-arrow-left me-2"></i> Sair
               </button>
            </div>
            
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-grow-1 p-4 p-md-5 bg-main position-relative overflow-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
