import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

const Alunos = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const userType = localStorage.getItem('tipo');

  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    serie: '1EM',
    sexo: 'M',
    idade: '',
    esportes: [],
    email: '',
    telefone: '',
    altura: '',
    peso: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!formData.nome || !formData.matricula || !formData.idade) {
      setMensagem('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        setMensagem(error.message || 'Erro ao adicionar aluno');
        return;
      }

      setMensagem('✅ Aluno adicionado com sucesso!');
      setTimeout(() => {
        setFormData({
          nome: '',
          matricula: '',
          serie: '1EM',
          sexo: 'M',
          idade: '',
          esportes: [],
          email: '',
          telefone: '',
          altura: '',
          peso: ''
        });
        setShowForm(false);
        setMensagem('');
        fetchStudents();
      }, 1500);
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredStudents = students.filter(student =>
    student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciamento de Alunos</h2>
        {(userType === 'admin' || userType === 'treinador') && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <i className="bi bi-plus-circle me-2"></i>{showForm ? 'Cancelar' : 'Novo Aluno'}
          </button>
        )}
      </div>

      {/* Formulário de adicionar aluno */}
      {showForm && (userType === 'admin' || userType === 'treinador') && (
        <div className="card mb-4 shadow-sm border-0">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Adicionar Novo Aluno</h5>
          </div>
          <div className="card-body">
            {mensagem && <p className={`text-${mensagem.includes('✅') ? 'success' : 'danger'}`}>{mensagem}</p>}
            <form onSubmit={handleAddStudent}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="nome" className="form-label fw-bold">Nome *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="matricula" className="form-label fw-bold">Matrícula *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="matricula"
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-3 mb-3">
                  <label htmlFor="serie" className="form-label fw-bold">Ano Escolar *</label>
                  <select
                    className="form-select"
                    id="serie"
                    name="serie"
                    value={formData.serie}
                    onChange={handleInputChange}
                  >
                    <option value="1EM">1º EM</option>
                    <option value="2EM">2º EM</option>
                    <option value="3EM">3º EM</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="sexo" className="form-label fw-bold">Sexo *</label>
                  <select
                    className="form-select"
                    id="sexo"
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleInputChange}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="idade" className="form-label fw-bold">Idade *</label>
                  <input
                    type="number"
                    className="form-control"
                    id="idade"
                    name="idade"
                    value={formData.idade}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-3 mb-3">
                  <label htmlFor="altura" className="form-label">Altura (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="altura"
                    name="altura"
                    value={formData.altura}
                    onChange={handleInputChange}
                    placeholder="Ex: 1.75"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="peso" className="form-label">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    id="peso"
                    name="peso"
                    value={formData.peso}
                    onChange={handleInputChange}
                    placeholder="Ex: 70"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="telefone" className="form-label">Telefone</label>
                  <input
                    type="text"
                    className="form-control"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success">
                <i className="bi bi-check-circle me-2"></i>Adicionar Aluno
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="card mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar aluno por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-8">
            <div className="table-responsive">
              <table className="table table-hover bg-white shadow-sm rounded">
                <thead className="table-dark">
                  <tr>
                    <th>Nome</th>
                    <th>Matrícula</th>
                    <th>Série</th>
                    <th>Idade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student._id} style={{ cursor: 'pointer' }}>
                      <td onClick={() => setSelectedStudent(student)}>{student.nome}</td>
                      <td>{student.matricula}</td>
                      <td>{student.serie}</td>
                      <td>{student.idade}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setSelectedStudent(student)}
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-4">
            {selectedStudent ? (
              <div className="card shadow-sm border-0">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">Ficha do Atleta</h5>
                </div>
                <div className="card-body">
                  <h4>{selectedStudent.nome}</h4>
                  <p className="text-muted">{selectedStudent.matricula} - {selectedStudent.serie}</p>
                  <hr />
                  <div><strong>Idade:</strong> {selectedStudent.idade} anos</div>
                  <div><strong>Sexo:</strong> {selectedStudent.sexo === 'M' ? 'Masculino' : selectedStudent.sexo === 'F' ? 'Feminino' : 'Outro'}</div>
                  {selectedStudent.altura && <div><strong>Altura:</strong> {selectedStudent.altura}m</div>}
                  {selectedStudent.peso && <div><strong>Peso:</strong> {selectedStudent.peso}kg</div>}
                  {selectedStudent.imc && (
                    <div>
                      <strong>IMC:</strong> {selectedStudent.imc}
                      <span style={{ marginLeft: '10px', display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: selectedStudent.imc < 25 ? 'green' : selectedStudent.imc < 30 ? 'orange' : 'red' }}></span>
                    </div>
                  )}
                  <hr />
                  <h6>Esportes Praticados:</h6>
                  <div>
                    {selectedStudent.esportes && selectedStudent.esportes.length > 0 ? (
                      selectedStudent.esportes.map((e, idx) => (
                        <span key={idx} className="badge bg-secondary me-1 mb-1">{e}</span>
                      ))
                    ) : (
                      <span className="text-muted">Nenhum esporte registrado</span>
                    )}
                  </div>
                  <hr />
                  <h6>Contato:</h6>
                  <p className="mb-1"><i className="bi bi-envelope me-2"></i> {selectedStudent.email || 'N/A'}</p>
                  <p><i className="bi bi-telephone me-2"></i> {selectedStudent.telefone || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <div className="alert alert-info">
                Clique em um aluno para ver os detalhes.
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Alunos;
