import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import ModalidadesSelector from '../../components/ModalidadesSelector';

const Alunos = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const userType = localStorage.getItem('tipo');

  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    serie: '1A',
    sexo: 'Feminino',
    idade: '',
    esportes: [],
    email: '',
    telefone: '',
    altura: '',
    peso: ''
  });

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleAddStudent = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!formData.nome || !formData.sexo) {
      setMensagem('Preencha os campos obrigatórios (Nome, Gênero)');
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
        setMensagem('Erro ao adicionar aluno');
        return;
      }

      setMensagem('✅ Aluno adicionado!');
      setTimeout(() => {
        setFormData({ nome: '', matricula: '', serie: '1EM', sexo: 'M', idade: '', esportes: [], email: '', telefone: '', altura: '', peso: '' });
        setShowForm(false);
        setMensagem('');
        fetchStudents();
      }, 1500);
    } catch (error) {
      setMensagem('Erro no servidor');
    }
  };

  const filteredStudents = students.filter(student =>
    (student.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.matricula || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

  const getImcStatusColor = (imc) => {
    if (!imc) return '#ccc';
    if (imc < 18.5) return '#eab308'; // amarelo
    if (imc >= 18.5 && imc <= 24.9) return '#22c55e'; // verde
    if (imc >= 25 && imc <= 29.9) return '#f97316'; // laranja
    return '#ef4444'; // vermelho
  };

  return (
    <Layout>
      {/* Search Bar Row */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div className="flex-grow-1 me-4">
          <input 
            type="text" 
            className="form-control form-control-lg border-0 shadow-sm rounded-pill px-4" 
            placeholder="Buscar aluno..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: '#fff', fontSize: '1.1rem' }}
          />
        </div>
        {userType === 'admin' && (
          <button 
            className="btn btn-light shadow-sm rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: '60px', height: '60px', fontSize: '2rem', color: '#B9C9DF' }}
            onClick={() => setShowForm(!showForm)}
          >
            <i className={`bi bi-${showForm ? 'x' : 'plus'}`}></i>
          </button>
        )}
      </div>

      {showForm && userType === 'admin' && (
        <div className="card-flat p-4 mb-5 shadow-sm border">
          <h5 className="fw-bold mb-4 text-blue-dark">Adicionar Aluno</h5>
          {mensagem && <div className={`alert ${mensagem.includes('✅') ? 'alert-success' : 'alert-danger'}`}>{mensagem}</div>}
          <form onSubmit={handleAddStudent}>
            <div className="row g-3">
              <div className="col-md-6">
                <input type="text" className="form-control" name="nome" placeholder="Nome *" value={formData.nome} onChange={handleInputChange} required />
              </div>
              <div className="col-md-3">
                <input type="text" className="form-control" name="matricula" placeholder="Matrícula (Op)" value={formData.matricula} onChange={handleInputChange} />
              </div>
              <div className="col-md-3">
                <select className="form-select" name="serie" value={formData.serie} onChange={handleInputChange}>
                  {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <select className="form-select" name="sexo" value={formData.sexo} onChange={handleInputChange} required>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>
              <div className="col-md-3">
                <input type="number" className="form-control" name="idade" placeholder="Idade" value={formData.idade} onChange={handleInputChange} />
              </div>
              <div className="col-md-3">
                <input type="number" step="0.01" className="form-control" name="altura" placeholder="Altura (ex: 1.75)" value={formData.altura} onChange={handleInputChange} />
              </div>
              <div className="col-md-3">
                <input type="number" step="0.1" className="form-control" name="peso" placeholder="Peso (ex: 70.5)" value={formData.peso} onChange={handleInputChange} />
              </div>
              <div className="col-12 mt-3 mb-2">
                <label className="fw-bold small mb-2 text-muted">Modalidades de Interesse</label>
                <ModalidadesSelector 
                  selected={formData.esportes}
                  onChange={(novos) => setFormData({...formData, esportes: novos})}
                />
              </div>
              <div className="col-12 text-end mt-4">
                <button type="submit" className="btn btn-primary px-5">Salvar</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="row g-4">
          {filteredStudents.map(student => (
            <div className="col-md-6 col-xl-4" key={student._id}>
              <div className="card-flat p-4 h-100 position-relative shadow-sm cursor-pointer hover-bg-light" onClick={() => window.location.href=`/alunos/${student._id}`} style={{transition: '0.2s'}}>
                
                {/* Header: Avatar and Name */}
                <div className="d-flex align-items-center mb-3">
                  {student.foto ? (
                    <img src={student.foto} alt="Perfil" className="rounded-circle shadow-sm me-3" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                  ) : (
                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 text-orange bg-blue-dark" style={{ width: '60px', height: '60px', fontSize: '1.8rem' }}>
                      {student.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h5 className="fw-bold text-blue-dark mb-0">{student.nome}</h5>
                    <div className="text-blue-dark small">{student.matricula} - {student.serie || 'S/ Turma'}</div>
                  </div>
                </div>

                {/* Sports Pills */}
                <div className="d-flex flex-wrap gap-2 mb-4 mt-3">
                  {student.esportes && student.esportes.length > 0 ? (
                    student.esportes.map(esp => (
                      <span key={esp} className="pill-orange">{esp}</span>
                    ))
                  ) : (
                    <span className="text-muted small">Sem modalidades</span>
                  )}
                </div>

                {/* Info Block */}
                <div className="bg-blue-light p-3 rounded-4 mt-auto">
                  <div className="row text-blue-dark small gx-0">
                    <div className="col-6 mb-2">Sexo:</div>
                    <div className="col-6 mb-2 text-end">{student.sexo === 'M' ? 'Masculino' : 'Feminino'}</div>
                    
                    <div className="col-6 mb-2">Altura:</div>
                    <div className="col-6 mb-2 text-end">{student.altura ? `${student.altura}m` : '-'}</div>
                    
                    <div className="col-6 mb-2">Peso:</div>
                    <div className="col-6 mb-2 text-end">{student.peso ? `${student.peso}kg` : '-'}</div>
                    
                    <div className="col-6 mt-1">IMC:</div>
                    <div className="col-6 mt-1 text-end d-flex justify-content-end align-items-center">
                      <span className="me-2">{student.imc ? student.imc : '-'}</span>
                      <div className="rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: getImcStatusColor(student.imc) }}></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="col-12 text-center text-muted py-5">
              Nenhum aluno encontrado.
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Alunos;
