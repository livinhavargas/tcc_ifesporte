import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

const Analises = () => {
  const [students, setStudents] = useState([]);
  const [sports, setSports] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tipoAnalise, setTipoAnalise] = useState('individual');
  const [categoria, setCategoria] = useState('ataque');
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterSport, setFilterSport] = useState('');
  const userType = localStorage.getItem('tipo');

  const [metricas, setMetricas] = useState({
    passesCertos: 0,
    passesErrados: 0,
    contraAtaques: 0,
    situacoesJogo: 0,
    desempenhoDefensivo: 0,
    velocidade: 0,
    resistencia: 0,
    tecnica: 0,
    tacaoDeForca: 0,
    tomadas: 0,
    gols: 0,
    defesas: 0
  });

  const [observacoes, setObservacoes] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [modalidade, setModalidade] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchSports();
    fetchAnalyses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  const fetchSports = async () => {
    try {
      const response = await fetch('/api/sports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSports(data);
      }
    } catch (error) {
      console.error('Erro ao buscar modalidades:', error);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/analysis', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAnalyses(data);
      }
    } catch (error) {
      console.error('Erro ao buscar análises:', error);
    }
  };

  const handleMetricaChange = (metric, value) => {
    setMetricas(prev => ({
      ...prev,
      [metric]: parseInt(value) || 0
    }));
  };

  const handleSubmitAnalysis = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!selectedStudent || !modalidade || !periodo) {
      setMensagem('Selecione aluno, modalidade e período');
      return;
    }

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          aluno: selectedStudent._id,
          modalidade,
          tipoAnalise,
          categoria,
          metricas,
          observacoes,
          periodo,
          avaliador: localStorage.getItem('userId')
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        setMensagem(error.message || 'Erro ao salvar análise');
        return;
      }

      setMensagem('✅ Análise salva com sucesso!');
      setTimeout(() => {
        resetForm();
        fetchAnalyses();
      }, 1500);
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setTipoAnalise('individual');
    setCategoria('ataque');
    setShowForm(false);
    setMensagem('');
    setMetricas({
      passesCertos: 0,
      passesErrados: 0,
      contraAtaques: 0,
      situacoesJogo: 0,
      desempenhoDefensivo: 0,
      velocidade: 0,
      resistencia: 0,
      tecnica: 0,
      tacaoDeForca: 0,
      tomadas: 0,
      gols: 0,
      defesas: 0
    });
    setObservacoes('');
    setPeriodo('');
    setModalidade('');
  };

  const getAvaliacao = (metricasObj) => {
    if (!metricasObj) return { texto: 'Regular', cor: 'warning' };
    const valores = Object.values(metricasObj);
    if (valores.length === 0) return { texto: 'Regular', cor: 'warning' };
    const soma = valores.reduce((a, b) => a + b, 0);
    const media = soma / valores.length;

    if (media >= 8) return { texto: 'Excelente', cor: 'success' };
    if (media >= 6) return { texto: 'Bom', cor: 'info' };
    if (media >= 4) return { texto: 'Regular', cor: 'warning' };
    return { texto: 'Precisa Melhorar', cor: 'danger' };
  };

  const calcularAvaliacao = () => {
    const valores = Object.values(metricas);
    const soma = valores.reduce((a, b) => a + b, 0);
    const media = soma / valores.length;

    if (media >= 8) return { texto: 'Excelente', cor: 'success' };
    if (media >= 6) return { texto: 'Bom', cor: 'info' };
    if (media >= 4) return { texto: 'Regular', cor: 'warning' };
    return { texto: 'Precisa Melhorar', cor: 'danger' };
  };

  const avaliacao = calcularAvaliacao();

  const filteredAnalyses = analyses.filter(analysis => {
    if (filterStudent && analysis.aluno?.nome !== filterStudent) return false;
    if (filterSport && analysis.modalidade !== filterSport) return false;
    return true;
  });

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Análise de Desempenho</h2>
        {(userType === 'admin' || userType === 'treinador') && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <i className="bi bi-plus-circle me-2"></i>{showForm ? 'Cancelar' : 'Nova Análise'}
          </button>
        )}
      </div>

      {showForm && (userType === 'admin' || userType === 'treinador') && (
        <div className="card mb-4 shadow-sm border-0">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Criar Nova Análise de Desempenho</h5>
          </div>
          <div className="card-body">
            {mensagem && <p className={`text-${mensagem.includes('✅') ? 'success' : 'danger'}`}>{mensagem}</p>}
            
            <form onSubmit={handleSubmitAnalysis}>
              {/* Seleção de Aluno */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Aluno *</label>
                  <select 
                    className="form-select"
                    value={selectedStudent?._id || ''}
                    onChange={(e) => {
                      const student = students.find(s => s._id === e.target.value);
                      setSelectedStudent(student);
                    }}
                    required
                  >
                    <option value="">Selecione um aluno</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.nome} - {student.matricula}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Modalidade *</label>
                  <select 
                    className="form-select"
                    value={modalidade}
                    onChange={(e) => setModalidade(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma modalidade</option>
                    {sports.map(sport => (
                      <option key={sport._id} value={sport.nome}>{sport.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tipo de Análise e Categoria */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Tipo de Análise *</label>
                  <select 
                    className="form-select"
                    value={tipoAnalise}
                    onChange={(e) => setTipoAnalise(e.target.value)}
                  >
                    <option value="individual">Individual</option>
                    <option value="coletiva">Coletiva</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Categoria *</label>
                  <select 
                    className="form-select"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value="ataque">Ataque</option>
                    <option value="defesa">Defesa</option>
                    <option value="goleiro">Goleiro</option>
                    <option value="geral">Geral</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Período *</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    placeholder="Ex: Setembro 2024"
                    required
                  />
                </div>
              </div>

              {/* Métricas */}
              <div className="card bg-light mb-3">
                <div className="card-header">
                  <h6 className="mb-0">Variáveis de Avaliação (0-10)</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    {Object.keys(metricas).map((metrica, index) => (
                      <div key={metrica} className="col-md-6 mb-2">
                        <label className="form-label small">{metrica.replace(/([A-Z])/g, ' $1')}</label>
                        <input 
                          type="number"
                          min="0"
                          max="10"
                          className="form-control form-control-sm"
                          value={metricas[metrica]}
                          onChange={(e) => handleMetricaChange(metrica, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resultado */}
              <div className="alert alert-info">
                <strong>Resultado da Avaliação: </strong>
                <span className={`badge bg-${avaliacao.cor}`}>{avaliacao.texto}</span>
              </div>

              {/* Observações */}
              <div className="mb-3">
                <label className="form-label fw-bold">Observações</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Adicione observações sobre o desempenho"
                ></textarea>
              </div>

              <button type="submit" className="btn btn-success">
                <i className="bi bi-check-circle me-2"></i>Salvar Análise
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card mb-4 shadow-sm border-0">
        <div className="card-header bg-light">
          <h5 className="mb-0">Filtrar Análises</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Filtrar por Aluno</label>
              <select 
                className="form-select"
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
              >
                <option value="">Todos os alunos</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Filtrar por Modalidade</label>
              <select 
                className="form-select"
                value={filterSport}
                onChange={(e) => setFilterSport(e.target.value)}
              >
                <option value="">Todas as modalidades</option>
                {sports.map(sport => (
                  <option key={sport._id} value={sport.nome}>
                    {sport.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Análises Recentes</h5>
        </div>
        <div className="card-body">
          {filteredAnalyses.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover bg-white rounded">
                <thead className="table-dark">
                  <tr>
                    <th>Atleta</th>
                    <th>Modalidade</th>
                    <th>Categoria</th>
                    <th>Resultado</th>
                    <th>Data</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnalyses.map(analysis => {
                    const aval = getAvaliacao(analysis.metricas);
                    return (
                      <tr key={analysis._id}>
                        <td>
                          <strong>{analysis.aluno ? analysis.aluno.nome : 'N/A'}</strong>
                          {analysis.aluno && (
                            <>
                              <br />
                              <small className="text-muted">{analysis.aluno.matricula}</small>
                            </>
                          )}
                        </td>
                        <td>{analysis.modalidade}</td>
                        <td className="text-capitalize">{analysis.categoria}</td>
                        <td>
                          <span className={`badge bg-${aval.cor}`}>
                            {aval.texto}
                          </span>
                        </td>
                        <td>{new Date(analysis.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td>{analysis.observacoes || <span className="text-muted">Sem observações</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">Nenhuma análise cadastrada.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Analises;
