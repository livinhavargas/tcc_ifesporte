import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userType = localStorage.getItem('tipo'); // admin or estudante
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];
  const modalidadesDisponiveis = [
    'Basquete', 'Futsal', 'Futebol', 'Handebol', 'Vôlei de Quadra', 'Vôlei de Praia', 
    'Badminton', 'Xadrez',
    'Atletismo - Corridas - 100 metros rasos', 'Atletismo - Corridas - 200 metros rasos', 'Atletismo - Corridas - 400 metros rasos',
    'Atletismo - Corridas - 800 metros meio-fundo', 'Atletismo - Corridas - 1500 metros meio-fundo', 'Atletismo - Corridas - 3000 metros', 
    'Atletismo - Corridas - 5000 metros', 'Atletismo - Corridas - Revezamento',
    'Atletismo - Saltos - Distância', 'Atletismo - Saltos - Altura', 'Atletismo - Saltos - Triplo',
    'Atletismo - Lançamentos - Peso', 'Atletismo - Lançamentos - Disco', 'Atletismo - Lançamentos - Dardo',
    'Tênis de Mesa - Individual', 'Tênis de Mesa - Dupla'
  ];

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStudent(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleModalidadeToggle = (mod) => {
    if (!isEditing) return;
    setStudent(prev => {
      const isSelected = prev.esportes.includes(mod);
      if (isSelected) {
        return { ...prev, esportes: prev.esportes.filter(m => m !== mod) };
      }
      return { ...prev, esportes: [...prev.esportes, mod] };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(student)
      });
      if (response.ok) {
        setMensagem('✅ Ficha atualizada com sucesso!');
        setIsEditing(false);
        fetchStudent();
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem('Erro ao atualizar aluno.');
      }
    } catch (error) {
      setMensagem('Erro de conexão ao servidor.');
    }
  };

  const getImcData = () => {
    if (!student || !student.peso || !student.altura) return { valor: '-', cor: '#ccc', status: 'N/A' };
    const peso = parseFloat(student.peso);
    const altura = parseFloat(student.altura);
    const imc = (peso / (altura * altura)).toFixed(2);
    
    let cor = '#ccc';
    let status = 'Desconhecido';

    if (imc < 18.5) { cor = '#eab308'; status = 'Abaixo do peso (Alerta)'; }
    else if (imc >= 18.5 && imc <= 24.9) { cor = '#22c55e'; status = 'Peso saudável'; }
    else if (imc >= 25 && imc <= 29.9) { cor = '#f97316'; status = 'Sobrepeso (Alerta)'; }
    else { cor = '#ef4444'; status = 'Obesidade (Atenção)'; }

    return { valor: imc, cor, status };
  };

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o aluno ${student.nome}? Esta ação apagará também suas análises de desempenho.`)) {
      return;
    }
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        window.location.href = '/alunos';
      } else {
        alert('Erro ao excluir aluno');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão ao excluir');
    }
  };

  if (loading) {return (
    <Layout>
      <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
    </Layout>
  );}

  if (!student) return (
    <Layout>
      <div className="text-center py-5">Aluno não encontrado.</div>
    </Layout>
  );

  const imcData = getImcData();

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button className="btn btn-light rounded-circle shadow-sm me-4 d-flex align-items-center justify-content-center text-muted" style={{width:'50px', height:'50px', fontSize: '1.5rem'}} onClick={() => navigate('/alunos')}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h2 className="fw-bold text-blue-dark mb-0">Ficha do Atleta</h2>
          {userType === 'admin' && (
            <button className="btn btn-outline-danger ms-4 shadow-sm fw-bold" onClick={handleDelete}>
              <i className="bi bi-trash"></i> Excluir
            </button>
          )}
        </div>
        
        <button 
          className="btn btn-orange text-white fw-bold px-4 rounded-pill shadow-sm"
          onClick={() => navigate(`/analises?alunoId=${id}`)}
        >
          <i className="bi bi-bar-chart-fill me-2"></i> Análises de Desempenho
        </button>
      </div>

      {mensagem && <div className={`alert ${mensagem.includes('✅') ? 'alert-success' : 'alert-danger'}`}>{mensagem}</div>}

      <div className="row g-4">
        {/* Lado Esquerdo - Info Principal */}
        <div className="col-lg-4">
          <div className="card-flat p-4 text-center h-100 shadow-sm border-0">
            <div className="d-inline-block position-relative mb-4">
              <div className="d-flex align-items-center justify-content-center bg-blue-dark text-white rounded-circle shadow-sm mb-3" style={{ width: '180px', height: '180px', fontSize: '4rem', margin: '0 auto', overflow: 'hidden' }}>
                {student.foto ? (
                  <img src={student.foto} alt="Perfil" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  student.nome.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <h3 className="fw-bold text-blue-dark mb-1">{student.nome}</h3>
            <p className="text-muted mb-4">{student.matricula || 'Sem Matrícula'} - {student.serie || 'Sem Turma'}</p>

            <div className="bg-blue-light rounded-4 p-4 text-start mb-4">
              <h5 className="fw-bold text-blue-dark border-bottom pb-2 mb-3">Contato</h5>
              <div className="mb-2"><i className="bi bi-envelope-fill me-2 text-muted"></i> <strong>{student.email || '-'}</strong></div>
              <div><i className="bi bi-telephone-fill me-2 text-muted"></i> <strong>{student.telefone || '-'}</strong></div>
            </div>

            <div className="bg-orange-light rounded-4 p-4 text-start">
              <h5 className="fw-bold text-blue-dark border-bottom pb-2 mb-3">Saúde Física (IMC)</h5>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">IMC Atual</span>
                <span className="fw-bold fs-4" style={{color: imcData.cor}}>{imcData.valor}</span>
              </div>
              <div className="d-flex align-items-center mt-2">
                <div className="rounded-circle me-2" style={{width: '12px', height: '12px', backgroundColor: imcData.cor}}></div>
                <span className="small fw-bold text-muted">{imcData.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - Ficha Completa */}
        <div className="col-lg-8">
          <div className="card-flat p-5 h-100 shadow-sm border-0 position-relative">
            {userType === 'admin' && !isEditing && (
              <button className="btn btn-outline-primary position-absolute top-0 end-0 m-4 rounded-pill fw-bold" onClick={() => setIsEditing(true)}>
                <i className="bi bi-pencil-fill me-2"></i>Editar Ficha
              </button>
            )}

            <h4 className="fw-bold text-blue-dark mb-4">Informações Gerais</h4>
            
            <form onSubmit={handleSave}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Nome Completo</label>
                  <input type="text" className="form-control" name="nome" value={student.nome} onChange={handleInputChange} disabled={!isEditing} required />
                </div>
                
                <div className="col-md-3">
                  <label className="form-label text-muted small fw-bold">Matrícula</label>
                  <input type="text" className="form-control" name="matricula" value={student.matricula || ''} onChange={handleInputChange} disabled={!isEditing} />
                </div>

                <div className="col-md-3">
                  <label className="form-label text-muted small fw-bold">Turma</label>
                  <select className="form-select" name="serie" value={student.serie || ''} onChange={handleInputChange} disabled={!isEditing}>
                    <option value="">Selecione...</option>
                    {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted small fw-bold">Gênero</label>
                  <select className="form-select" name="sexo" value={student.sexo || ''} onChange={handleInputChange} disabled={!isEditing} required>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted small fw-bold">Idade</label>
                  <input type="number" className="form-control" name="idade" value={student.idade || ''} onChange={handleInputChange} disabled={!isEditing} />
                </div>

                <div className="col-md-2">
                  <label className="form-label text-muted small fw-bold">Peso (kg)</label>
                  <input type="number" step="0.1" className="form-control" name="peso" value={student.peso || ''} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                
                <div className="col-md-2">
                  <label className="form-label text-muted small fw-bold">Altura (m)</label>
                  <input type="number" step="0.01" className="form-control" name="altura" value={student.altura || ''} onChange={handleInputChange} disabled={!isEditing} />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Telefone</label>
                  <input type="text" className="form-control" name="telefone" value={student.telefone || ''} onChange={handleInputChange} disabled={!isEditing} />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Email</label>
                  <input type="email" className="form-control" name="email" value={student.email || ''} onChange={handleInputChange} disabled={!isEditing} />
                </div>

                <div className="col-12 mt-4">
                  <label className="form-label text-muted small fw-bold mb-3">Modalidades Vinculadas</label>
                  <div className="d-flex flex-wrap gap-2 p-3 bg-light rounded-4 border">
                    {modalidadesDisponiveis.map(mod => {
                      const isSelected = student.esportes && student.esportes.includes(mod);
                      if (!isEditing && !isSelected) return null; // Show only selected when not editing
                      return (
                        <div 
                          key={mod} 
                          onClick={() => handleModalidadeToggle(mod)}
                          className={`px-3 py-2 rounded-pill small border ${isSelected ? 'bg-orange-active border-orange text-blue-dark fw-bold' : 'bg-white text-muted'} ${isEditing ? 'cursor-pointer' : ''}`}
                        >
                          {mod}
                        </div>
                      )
                    })}
                    {!isEditing && (!student.esportes || student.esportes.length === 0) && (
                      <span className="text-muted small py-2">Nenhuma modalidade vinculada.</span>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="col-12 text-end mt-5">
                    <button type="button" className="btn btn-light me-3 px-4 fw-bold" onClick={() => { setIsEditing(false); fetchStudent(); }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary px-5 fw-bold">Salvar Alterações</button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentProfile;
