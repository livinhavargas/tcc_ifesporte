import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userName = localStorage.getItem('userName') || 'Usuário';
  const userType = localStorage.getItem('tipo') || 'usuario';

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

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row" style={{ backgroundColor: '#e8f0f7', borderBottom: '1px solid #dee2e6' }}>
        <div className="col-md-3 col-lg-2 d-flex align-items-center px-3 py-3" style={{ backgroundColor: '#f8f9fa' }}>
          <img src="/logo.svg" alt="IFEsporte" style={{ height: '50px' }} />
        </div>
        <main className="col-md-9 col-lg-10 d-flex justify-content-between align-items-center px-4">
          <h5 className="mb-0 text-dark">IFEsporte - Gerenciamento Esportivo</h5>
          <div className="position-relative">
            <button 
              className="btn btn-light border rounded-circle p-2 d-flex align-items-center justify-content-center"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ width: '45px', height: '45px' }}
            >
              <i className="bi bi-person-circle" style={{ fontSize: '20px' }}></i>
            </button>
            {showUserMenu && (
              <div 
                className="position-absolute bg-white border rounded shadow-lg p-2"
                style={{ right: 0, top: '50px', minWidth: '200px', zIndex: 1000 }}
              >
                <p className="px-3 pt-2 mb-0"><small><strong>{userName}</strong></small></p>
                <p className="px-3 mb-3"><small className="text-muted">{userType === 'admin' ? 'Professor (Admin)' : userType === 'treinador' ? 'Treinador' : 'Estudante'}</small></p>
                <hr className="my-2" />
                <button 
                  className="btn btn-sm btn-light w-100 text-start mb-2"
                  onClick={handleProfile}
                >
                  <i className="bi bi-person me-2"></i>Meu Perfil
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger w-100"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>Sair
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <div className="row">
        {/* Sidebar */}
        <nav id="sidebar" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse min-vh-100" style={{ backgroundColor: '#f8f9fa', borderRight: '1px solid #dee2e6' }}>
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/">
                  <i className="bi bi-house-door me-2"></i> Início
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/alunos">
                  <i className="bi bi-people me-2"></i> Alunos
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/agenda">
                  <i className="bi bi-calendar-event me-2"></i> Agenda
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/esportes">
                  <i className="bi bi-trophy me-2"></i> Esportes
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/analises">
                  <i className="bi bi-graph-up me-2"></i> Análises
                </Link>
              </li>
              {localStorage.getItem('tipo') === 'admin' && (
                <li className="nav-item">
                  <Link className="nav-link text-primary fw-bold" to="/admin">
                    <i className="bi bi-shield-lock me-2"></i> Área do Servidor
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
