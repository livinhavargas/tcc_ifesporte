import React from 'react';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="row mb-4">
        <div className="col-12">
          <h1>Olá, Treinador!</h1>
          <p className="text-muted">Bem-vindo ao IFEsporte. Aqui está o resumo das atividades esportivas do IFC.</p>
        </div>
      </div>

      <div className="row">
        {/* Próximos Treinos */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Próximos Treinos</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Futsal Masculino</strong>
                    <br />
                    <small className="text-muted">Ginásio - 14:00</small>
                  </div>
                  <span className="badge bg-info rounded-pill">Hoje</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Atletismo (Velocidade)</strong>
                    <br />
                    <small className="text-muted">Pista - 16:30</small>
                  </div>
                  <span className="badge bg-info rounded-pill">Hoje</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Handebol Feminino</strong>
                    <br />
                    <small className="text-muted">Quadra B - 08:00</small>
                  </div>
                  <span className="badge bg-secondary rounded-pill">Amanhã</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Eventos Futuros */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Eventos Futuros</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>JIFC 2026 - Etapa Regional</strong>
                  <br />
                  <small className="text-muted">Data: 20/07/2026 - Blumenau/SC</small>
                </li>
                <li className="list-group-item">
                  <strong>Torneio Amistoso de Vôlei</strong>
                  <br />
                  <small className="text-muted">Data: 15/06/2026 - Campus Araquari</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card bg-light border-0 shadow-sm text-center p-3">
            <h3>42</h3>
            <p className="mb-0">Alunos Ativos</p>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-light border-0 shadow-sm text-center p-3">
            <h3>6</h3>
            <p className="mb-0">Modalidades</p>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-light border-0 shadow-sm text-center p-3">
            <h3>12</h3>
            <p className="mb-0">Treinos p/ Semana</p>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-light border-0 shadow-sm text-center p-3">
            <h3>2</h3>
            <p className="mb-0">Eventos Próximos</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
