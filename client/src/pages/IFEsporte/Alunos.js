import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

const Alunos = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:7777/api/students', {
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

  const filteredStudents = students.filter(student =>
    student.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciamento de Alunos</h2>
        <button className="btn btn-primary">Novo Aluno</button>
      </div>

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
        <div className="text-center">Carregando...</div>
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
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student._id} onClick={() => setSelectedStudent(student)} style={{ cursor: 'pointer' }}>
                      <td>{student.nome}</td>
                      <td>{student.matricula}</td>
                      <td>{student.serie}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2">Editar</button>
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
                  <div className="row">
                    <div className="col-6"><strong>Sexo:</strong> {selectedStudent.sexo}</div>
                    <div className="col-6"><strong>Altura:</strong> {selectedStudent.altura}m</div>
                    <div className="col-6"><strong>Peso:</strong> {selectedStudent.peso}kg</div>
                    <div className="col-6"><strong>IMC:</strong> {selectedStudent.imc}</div>
                  </div>
                  <hr />
                  <h6>Esportes Praticados:</h6>
                  <div>
                    {selectedStudent.esportes && selectedStudent.esportes.length > 0 ? (
                      selectedStudent.esportes.map((e, idx) => (
                        <span key={idx} className="badge bg-secondary me-1">{e}</span>
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
                Selecione um aluno para ver os detalhes.
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Alunos;
