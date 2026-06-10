import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav id="sidebar" className="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse min-vh-100">
          <div className="position-sticky pt-3">
            <h3 className="text-white text-center mb-4">IFEsporte</h3>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link text-white" to="/">
                  <i className="bi bi-house-door me-2"></i> Início
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/alunos">
                  <i className="bi bi-people me-2"></i> Alunos
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/agenda">
                  <i className="bi bi-calendar-event me-2"></i> Agenda
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/esportes">
                  <i className="bi bi-trophy me-2"></i> Esportes
                </Link>
              </li>
            </ul>
            <hr className="bg-light" />
            <div className="mt-auto">
              <button onClick={handleLogout} className="btn btn-outline-danger w-100">
                Sair
              </button>
            </div>
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
