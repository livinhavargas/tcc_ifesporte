import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';

const SportDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('alunos');
  
  const isAtletismo = id.toLowerCase() === 'atletismo';

  const atletismoSubcats = [
    '100 metros rasos', '200 metros rasos', '400 metros rasos',
    '800 metros', '1500 metros', '3000 metros', '5000 metros'
  ];

  return (
    <Layout>
      <div className="mb-4">
        <h2 className="text-capitalize">{id}</h2>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/esportes">Esportes</a></li>
            <li className="breadcrumb-item active" aria-current="page">{id}</li>
          </ol>
        </nav>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'alunos' ? 'active' : ''}`}
            onClick={() => setActiveTab('alunos')}
          >
            Alunos
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'analises' ? 'active' : ''}`}
            onClick={() => setActiveTab('analises')}
          >
            Análises
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'cronogramas' ? 'active' : ''}`}
            onClick={() => setActiveTab('cronogramas')}
          >
            Cronogramas
          </button>
        </li>
      </ul>

      {activeTab === 'alunos' && (
        <div>
          {isAtletismo && (
            <div className="mb-3">
              <h6>Filtrar por prova:</h6>
              <select className="form-select w-auto">
                <option>Todas as provas</option>
                {atletismoSubcats.map(sub => <option key={sub}>{sub}</option>)}
              </select>
            </div>
          )}
          <div className="alert alert-light border shadow-sm">
            <p>Lista de alunos inscritos em <strong>{id}</strong> aparecerá aqui.</p>
          </div>
        </div>
      )}

      {activeTab === 'analises' && (
        <div>
          <div className="d-flex justify-content-between mb-3">
            <h4>Histórico de Análises</h4>
            <button className="btn btn-success" data-bs-toggle="collapse" data-bs-target="#newAnalysisForm">Nova Análise</button>
          </div>

          <div className="collapse mb-4" id="newAnalysisForm">
            <div className="card card-body border-success shadow-sm">
              <h5>Registrar Desempenho</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Aluno Avaliado</label>
                  <select className="form-select">
                    <option>Selecione um aluno...</option>
                    <option>João Silva</option>
                    <option>Maria Oliveira</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tipo</label>
                  <select className="form-select">
                    <option>Treino</option>
                    <option>Avaliação</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Categoria</label>
                  <input type="text" className="form-control" placeholder="Ex: Ataque, Goleiro..." />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Passes Certos</label>
                  <input type="number" className="form-control" defaultValue="0" />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Passes Errados</label>
                  <input type="number" className="form-control" defaultValue="0" />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Contra-ataques</label>
                  <input type="number" className="form-control" defaultValue="0" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Situações de Jogo</label>
                  <input type="number" className="form-control" defaultValue="0" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Desemp. Defensivo</label>
                  <input type="number" className="form-control" defaultValue="0" />
                </div>
                <div className="col-12 text-end mt-3">
                  <button className="btn btn-success">Salvar Análise</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body">
              <p className="text-muted">Nenhuma análise registrada para esta modalidade ainda.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cronogramas' && (
        <div>
          <div className="d-flex justify-content-between mb-3">
            <h4>Planejamento de Treinos</h4>
            <button className="btn btn-primary">Gerar Novo Cronograma</button>
          </div>
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <p className="text-muted">Utilize o gerador para criar uma estrutura de treinamento automática.</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SportDetail;
