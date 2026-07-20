import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsuario = async () => {
      if (!userId || !token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          setError('Erro ao carregar perfil');
          return;
        }

        const data = await response.json();
        setUsuario(data);
      } catch (err) {
        setError('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [userId, token, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="row mb-4">
        <div className="col-12">
          <h1>Meu Perfil</h1>
        </div>
      </div>

      {usuario && (
        <div className="row">
          <div className="col-md-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Informações Pessoais</h5>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-muted">Nome Completo</h6>
                    <p className="fs-5"><strong>{usuario.nome}</strong></p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">Tipo de Usuário</h6>
                    <p className="fs-5">
                      <span className={`badge ${usuario.tipo === 'admin' ? 'bg-danger' : usuario.tipo === 'treinador' ? 'bg-warning' : 'bg-info'}`}>
                        {usuario.tipo === 'admin' ? 'Professor (Admin)' : usuario.tipo === 'treinador' ? 'Treinador' : 'Estudante'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-muted">Email</h6>
                    <p className="fs-5">{usuario.email}</p>
                  </div>
                  {usuario.matricula && (
                    <div className="col-md-6">
                      <h6 className="text-muted">Matrícula</h6>
                      <p className="fs-5">{usuario.matricula}</p>
                    </div>
                  )}
                </div>

                <div className="row">
                  <div className="col-12">
                    <h6 className="text-muted">Data de Cadastro</h6>
                    <p className="fs-5">{new Date(usuario.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <hr />

                <div className="text-center">
                  <button className="btn btn-secondary me-2" onClick={() => navigate('/')}>
                    <i className="bi bi-arrow-left me-2"></i>Voltar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
