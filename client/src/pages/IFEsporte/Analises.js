import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';

const Analises = ({ embebed = false, defaultModalidade = '' }) => {
  const [students, setStudents] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [searchParams] = useSearchParams();
  const alunoIdParam = searchParams.get('alunoId');
  
  const userType = localStorage.getItem('tipo');

  // Modalidades válidas para análise
  const modalidadesValidas = ['Basquete', 'Futsal', 'Futebol', 'Handebol', 'Vôlei de Quadra', 'Vôlei de Praia (Duplas)'];

  const [formData, setFormData] = useState({
    aluno: '',
    modalidade: '',
    data: '',
    categoria: 'Geral',
    observacoes: '',
    resultado: 'Bom'
  });

  // Keep formData.modalidade up-to-date with defaultModalidade
  useEffect(() => {
    if (embebed && defaultModalidade) {
      setFormData(prev => ({ ...prev, modalidade: defaultModalidade }));
    }
  }, [embebed, defaultModalidade]);

  useEffect(() => {
    fetchStudents();
    fetchAnalyses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/analysis', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (alunoIdParam) {
          setAnalyses(data.filter(a => a.aluno && a.aluno._id === alunoIdParam));
        } else if (userType === 'estudante') {
          const userEmail = localStorage.getItem('userEmail');
          setAnalyses(data.filter(a => a.aluno && a.aluno.email === userEmail));
        } else {
          setAnalyses(data);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        setMensagem(error.message || 'Erro ao salvar análise');
        return;
      }

      setMensagem('✅ Análise salva com sucesso!');
      setTimeout(() => {
        setFormData({ 
          aluno: '', 
          modalidade: embebed ? defaultModalidade : '', 
          data: '', 
          categoria: 'Geral', 
          observacoes: '', 
          resultado: 'Bom' 
        });
        setShowForm(false);
        setMensagem('');
        fetchAnalyses();
      }, 1500);
    } catch (error) {
      setMensagem('Erro de conexão ao servidor.');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Tem certeza que deseja excluir esta análise?')) return;
    try {
      await fetch(`/api/analysis/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const content = (
    <div className={embebed ? "" : "card-flat p-4"}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-0">Análises de Desempenho</h3>
          <p className="text-muted mb-0">Avaliações táticas e técnicas dos atletas</p>
        </div>
        {userType === 'admin' && (
          <button className="btn btn-primary fw-bold shadow-sm" onClick={() => setShowForm(!showForm)}>
            <i className={`bi bi-${showForm ? 'x-circle' : 'plus-circle'} me-2`}></i>{showForm ? 'Cancelar' : 'Nova Análise'}
          </button>
        )}
      </div>

      {showForm && userType === 'admin' && (
        <div className="card shadow-sm border-0 mb-4 bg-light">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">Registrar Nova Análise</h5>
            {mensagem && <div className={`alert ${mensagem.includes('✅') ? 'alert-success' : 'alert-danger'}`}>{mensagem}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold small text-muted">Aluno</label>
                  <select className="form-select" name="aluno" value={formData.aluno} onChange={handleInputChange} required>
                    <option value="">Selecione um aluno...</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
                  </select>
                </div>
                {!embebed && (
                  <div className="col-md-4">
                    <label className="form-label fw-bold small text-muted">Modalidade</label>
                    <select className="form-select" name="modalidade" value={formData.modalidade} onChange={handleInputChange} required>
                      <option value="">Selecione a modalidade...</option>
                      {modalidadesValidas.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}
                <div className={embebed ? "col-md-8" : "col-md-4"}>
                  <label className="form-label fw-bold small text-muted">Data</label>
                  <input type="date" className="form-control" name="data" value={formData.data} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label fw-bold small text-muted">Categoria</label>
                  <select className="form-select" name="categoria" value={formData.categoria} onChange={handleInputChange} required>
                    <option value="Ataque">Ataque</option>
                    <option value="Defesa">Defesa</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold small text-muted">Resultado</label>
                  <select className="form-select" name="resultado" value={formData.resultado} onChange={handleInputChange} required>
                    <option value="Excelente">Excelente</option>
                    <option value="Bom">Bom</option>
                    <option value="Regular">Regular</option>
                    <option value="Precisa Melhorar">Precisa Melhorar</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold small text-muted">Observações</label>
                  <input type="text" className="form-control" name="observacoes" placeholder="Comentário breve (opcional)" value={formData.observacoes} onChange={handleInputChange} />
                </div>
              </div>
              <div className="text-end">
                <button type="submit" className="btn btn-primary fw-bold">Salvar Análise</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
             <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
          ) : analyses.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">Data</th>
                    <th>Atleta</th>
                    <th>Modalidade</th>
                    <th>Categoria</th>
                    <th>Observações</th>
                    <th>Resultado</th>
                    {userType === 'admin' && <th className="text-end pe-4">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {analyses.map(analise => (
                    <tr key={analise._id}>
                      <td className="ps-4 text-muted">{new Date(analise.data).toLocaleDateString('pt-BR')}</td>
                      <td className="fw-bold">{analise.aluno?.nome || 'Atleta Removido'}</td>
                      <td><span className="badge bg-secondary">{analise.modalidade}</span></td>
                      <td>{analise.categoria}</td>
                      <td className="small text-muted">{analise.observacoes || '-'}</td>
                      <td>
                        <span className={`badge ${
                          analise.resultado === 'Excelente' ? 'bg-success' :
                          analise.resultado === 'Bom' ? 'bg-primary' :
                          analise.resultado === 'Regular' ? 'bg-warning text-dark' : 'bg-danger'
                        }`}>
                          {analise.resultado}
                        </span>
                      </td>
                      {userType === 'admin' && (
                        <td className="text-end pe-4">
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(analise._id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-card-checklist fs-1 mb-2 d-block"></i>
              Nenhuma análise de desempenho registrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (embebed) {
    return content;
  }

  return (
    <Layout>
      {content}
    </Layout>
  );
};

export default Analises;
