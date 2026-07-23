import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
export default function AdminDashboard() {
  return (
    <Layout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div className="d-flex align-items-center">
            <div className="bg-blue-dark rounded-pill me-3" style={{ width: '12px', height: '40px' }}></div>
            <h2 className="fw-bold text-blue-dark mb-0">Painel Administrativo</h2>
          </div>
          <a href="/" className="btn btn-outline-primary rounded-pill fw-bold px-4">Voltar</a>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card-flat p-4 h-100 shadow-sm border hover-bg-light transition-hover text-center">
              <i className="bi bi-people-fill text-orange mb-3 d-block" style={{ fontSize: '3rem' }}></i>
              <h4 className="fw-bold text-blue-dark mb-2">Usuários</h4>
              <p className="text-muted small mb-4">Gerenciar contas de treinadores e administradores.</p>
              <button className="btn btn-primary rounded-pill px-4 fw-bold w-100">Acessar</button>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-flat p-4 h-100 shadow-sm border hover-bg-light transition-hover text-center">
              <i className="bi bi-gear-fill text-orange mb-3 d-block" style={{ fontSize: '3rem' }}></i>
              <h4 className="fw-bold text-blue-dark mb-2">Configurações</h4>
              <p className="text-muted small mb-4">Ajustes globais do sistema <Logo height="14px" style={{ display: 'inline-block', verticalAlign: 'baseline' }} />.</p>
              <button className="btn btn-primary rounded-pill px-4 fw-bold w-100">Acessar</button>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-flat p-4 h-100 shadow-sm border hover-bg-light transition-hover text-center">
              <i className="bi bi-bar-chart-fill text-orange mb-3 d-block" style={{ fontSize: '3rem' }}></i>
              <h4 className="fw-bold text-blue-dark mb-2">Relatórios</h4>
              <p className="text-muted small mb-4">Visualizar estatísticas gerais do projeto.</p>
              <button className="btn btn-primary rounded-pill px-4 fw-bold w-100">Acessar</button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .transition-hover:hover {
          transform: translateY(-5px);
          transition: transform 0.2s ease-in-out;
        }
      `}</style>
    </Layout>
  );
}
