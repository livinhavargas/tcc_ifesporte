import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-dark text-white">
          <h2>Painel Administrativo (Área do Servidor)</h2>
        </div>
        <div className="card-body">
          <p>Bem-vindo à área de gerenciamento do sistema.</p>
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card bg-light mb-3">
                <div className="card-body text-center">
                  <h5 className="card-title">Usuários</h5>
                  <p className="card-text">Gerenciar contas de treinadores e administradores.</p>
                  <button className="btn btn-primary">Acessar</button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light mb-3">
                <div className="card-body text-center">
                  <h5 className="card-title">Configurações</h5>
                  <p className="card-text">Ajustes globais do sistema IFEsporte.</p>
                  <button className="btn btn-primary">Acessar</button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light mb-3">
                <div className="card-body text-center">
                  <h5 className="card-title">Relatórios</h5>
                  <p className="card-text">Visualizar estatísticas gerais do projeto.</p>
                  <button className="btn btn-primary">Acessar</button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <a href="/" className="btn btn-secondary">Voltar para Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
