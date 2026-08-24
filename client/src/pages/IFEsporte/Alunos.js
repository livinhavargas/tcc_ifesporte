import React, { useState, useEffect } from 'react';
import { 
  Plus, X, Search, UserPlus, CheckCircle2, AlertTriangle, User, 
  Users, HeartPulse, Trophy, ChevronRight 
} from 'lucide-react';
import Layout from '../../components/Layout';
import ModalidadesSelector from '../../components/ModalidadesSelector';
import SportIcon from '../../components/SportIcon';
import { addNotification } from '../../utils/notifications';
import IMCCard from '../../components/IMCCard';

const Alunos = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const userType = localStorage.getItem('tipo');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurma, setFilterTurma] = useState('');
  const [filterGenero, setFilterGenero] = useState('');
  const [filterIdade, setFilterIdade] = useState('');
  const [filterCidade, setFilterCidade] = useState('');

  const [formData, setFormData] = useState({
    nome: '', sexo: 'Feminino', dataNascimento: '', cpf: '', rg: '', endereco: '',
    cidade: '', estado: '',
    matricula: '', turma: '', telefone: '', nomeResponsavel: '', telefoneResponsavel: '',
    peso: '', altura: '', alergias: '', lesoesAnteriores: '', restricoesMedicas: '',
    numeroCamisa: '', numeroCalcado: '', tamanhoCamisa: '', tamanhoCalcao: '', modalidades: []
  });

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];
  const generosDisponiveis = ['Feminino', 'Masculino', 'Outro'];
  const faixasEtarias = ['Sub15', 'Sub16', 'Sub17', 'Sub19'];
  const cidadesDisponiveis = ['Praia Grande', 'São João do Sul', 'Sombrio', 'Balneário Gaivota', 'Araranguá', 'Torres', 'Outra'];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erro da API:', data.mensagem || response.statusText);
        setStudents([]);
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        setLoading(false);
        return;
      }

      setStudents(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Falha na requisição:', error);
      setStudents([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'cpf') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    if (name === 'rg') {
      value = value.replace(/[^a-zA-Z0-9]/g, '');
      if (value.length > 9) value = value.slice(0, 9);
      if (value.length > 8) {
        value = value.replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9]{3})([a-zA-Z0-9]{3})([a-zA-Z0-9]{1})$/, '$1.$2.$3-$4');
      } else if (value.length > 5) {
        value = value.replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9]{3})([a-zA-Z0-9]{1,3})$/, '$1.$2.$3');
      } else if (value.length > 2) {
        value = value.replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9]{1,3})$/, '$1.$2');
      }
    }
    
    if (name === 'telefone' || name === 'telefoneResponsavel') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!formData.nome || !formData.sexo || !formData.matricula || !formData.telefone || !formData.cpf || !formData.dataNascimento || !formData.cidade || !formData.estado) {
      setMensagem('Preencha os campos obrigatórios (*): Nome, Gênero, Data Nasc., Matrícula, CPF, Telefone, Cidade e Estado.');
      return;
    }
    if (formData.cpf.length < 14) {
      setMensagem('CPF inválido ou incompleto.');
      return;
    }
    if (formData.rg) {
      const cleanRG = formData.rg.replace(/[^a-zA-Z0-9]/g, '');
      if (cleanRG.length < 7) {
        setMensagem('RG inválido ou incompleto.');
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        esportes: formData.modalidades 
      };

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('✅ Aluno cadastrado com sucesso!');
        addNotification('Novo Aluno Cadastrado', `O atleta ${formData.nome} foi cadastrado no sistema com sucesso.`);
        setFormData({
          nome: '', sexo: 'Feminino', dataNascimento: '', cpf: '', rg: '', endereco: '',
          cidade: '', estado: '',
          matricula: '', turma: '', telefone: '', nomeResponsavel: '', telefoneResponsavel: '',
          peso: '', altura: '', alergias: '', lesoesAnteriores: '', restricoesMedicas: '',
          numeroCamisa: '', numeroCalcado: '', tamanhoCamisa: '', tamanhoCalcao: '', modalidades: []
        });
        fetchStudents();
        setTimeout(() => { setShowForm(false); setMensagem(''); }, 1500);
      } else {
        setMensagem(data.message || data.mensagem || 'Erro ao cadastrar aluno.');
      }
    } catch (error) {
      setMensagem('Erro de conexão ao salvar aluno.');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.matricula?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurma = !filterTurma || (student.turma || student.serie) === filterTurma;
    const matchesGenero = !filterGenero || student.sexo === filterGenero;
    
    let matchesIdade = true;
    if (filterIdade) {
      const age = calculateAge(student.dataNascimento);
      if (age === null) {
        matchesIdade = false;
      } else {
        if (filterIdade === 'Sub15') matchesIdade = age <= 15;
        else if (filterIdade === 'Sub16') matchesIdade = age === 16;
        else if (filterIdade === 'Sub17') matchesIdade = age === 17;
        else if (filterIdade === 'Sub19') matchesIdade = age === 18 || age === 19;
      }
    }

    const mainCities = ['praia grande', 'são joão do sul', 'sombrio', 'balneário gaivota', 'araranguá', 'torres'];
    let matchesCidade = true;
    if (filterCidade) {
      const studentCidade = (student.cidade || '').trim().toLowerCase();
      if (filterCidade === 'Outra') {
        matchesCidade = studentCidade !== '' && !mainCities.includes(studentCidade);
      } else {
        matchesCidade = studentCidade === filterCidade.toLowerCase();
      }
    }

    return matchesSearch && matchesTurma && matchesGenero && matchesIdade && matchesCidade;
  });

  const inputStyle = {
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border)',
    fontFamily: 'var(--font)',
    fontSize: '0.875rem',
    minHeight: '44px'
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>Meus Atletas</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0' }}>Gerencie todos os alunos inscritos nos seus esportes.</p>
          </div>
          {userType !== 'estudante' && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}
              style={{ borderRadius: 'var(--radius-md)', padding: '10px 24px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {showForm ? <X size={18} /> : <Plus size={18} />}
              <span>{showForm ? 'Cancelar' : 'Novo Aluno'}</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)',
          padding: '16px 20px',
          marginBottom: '24px'
        }}>
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-4">
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input type="text" placeholder="Buscar aluno..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '38px', background: 'var(--bg)', width: '100%' }} />
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <select className="form-select" value={filterTurma} onChange={(e) => setFilterTurma(e.target.value)} style={inputStyle}>
                <option value="">Todas as Turmas</option>
                {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-6 col-lg-2">
              <select className="form-select" value={filterGenero} onChange={(e) => setFilterGenero(e.target.value)} style={inputStyle}>
                <option value="">Todos (Gênero)</option>
                {generosDisponiveis.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="col-6 col-lg-2">
              <select className="form-select" value={filterIdade} onChange={(e) => setFilterIdade(e.target.value)} style={inputStyle}>
                <option value="">Todas as Idades</option>
                {faixasEtarias.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="col-6 col-lg-2">
              <select className="form-select" value={filterCidade} onChange={(e) => setFilterCidade(e.target.value)} style={inputStyle}>
                <option value="">Todas as Cidades</option>
                {cidadesDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        {showForm && userType !== 'estudante' && (
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)',
            padding: '32px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.0625rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={20} style={{ color: 'var(--primary)' }} />
                <span>Cadastrar Novo Atleta</span>
              </h4>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            {mensagem && (
              <div style={{
                background: mensagem.includes('✅') ? 'var(--success-light)' : 'var(--error-light)',
                color: mensagem.includes('✅') ? 'var(--success-text)' : 'var(--error-text)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                {mensagem.includes('✅') ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                <span>{mensagem}</span>
              </div>
            )}
            
            <form onSubmit={handleAddStudent}>
              {/* Section A: Personal Data */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} />
                </div>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Dados Pessoais e Acadêmicos</h6>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">Nome Completo *</label>
                    <input type="text" className="form-control" name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Nome do estudante" required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Gênero *</label>
                    <select className="form-select" name="sexo" value={formData.sexo} onChange={handleInputChange} required>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Data de Nascimento *</label>
                    <input type="date" className="form-control" name="dataNascimento" value={formData.dataNascimento} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Matrícula *</label>
                    <input type="text" className="form-control" name="matricula" value={formData.matricula} onChange={handleInputChange} placeholder="Ex: 202312345" required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Turma</label>
                    <select className="form-select" name="turma" value={formData.turma} onChange={handleInputChange}>
                      <option value="">Selecione...</option>
                      {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">CPF *</label>
                    <input type="text" className="form-control" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">RG (Opcional)</label>
                    <input type="text" className="form-control" name="rg" value={formData.rg} onChange={handleInputChange} placeholder="00.000.000-0" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Telefone *</label>
                    <input type="text" className="form-control" name="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="(00) 00000-0000" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Logradouro (Opcional)</label>
                    <input type="text" className="form-control" name="endereco" value={formData.endereco} onChange={handleInputChange} placeholder="Rua, Bairro, Nº" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Cidade *</label>
                    <input type="text" className="form-control" name="cidade" value={formData.cidade} onChange={handleInputChange} placeholder="Ex: Vitória" required />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Estado *</label>
                    <input type="text" className="form-control" name="estado" value={formData.estado} onChange={handleInputChange} placeholder="Ex: ES" maxLength="2" style={{ textTransform: 'uppercase' }} required />
                  </div>
                </div>
              </div>

              <div className="row g-4 mb-4">
                {/* Section B: Guardian */}
                <div className="col-lg-6">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} />
                    </div>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Dados do Responsável</h6>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', height: 'calc(100% - 44px)' }}>
                    <div className="mb-3">
                      <label className="form-label">Nome do Responsável</label>
                      <input type="text" className="form-control" name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleInputChange} placeholder="Nome do pai, mãe ou responsável" />
                    </div>
                    <div>
                      <label className="form-label">Telefone do Responsável</label>
                      <input type="text" className="form-control" name="telefoneResponsavel" value={formData.telefoneResponsavel} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                </div>

                {/* Section C: Medical */}
                <div className="col-lg-6">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--error-light)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HeartPulse size={16} />
                    </div>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Informações Físicas e Médicas</h6>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', height: 'calc(100% - 44px)' }}>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label">Peso (kg)</label>
                        <input type="number" step="0.1" className="form-control" name="peso" value={formData.peso} onChange={handleInputChange} placeholder="Ex: 65.5" />
                      </div>
                      <div className="col-6">
                        <label className="form-label">Altura (m)</label>
                        <input type="number" step="0.01" className="form-control" name="altura" value={formData.altura} onChange={handleInputChange} placeholder="Ex: 1.75" />
                      </div>
                    </div>
                    <IMCCard peso={formData.peso} altura={formData.altura} />
                    <div className="mb-3">
                      <label className="form-label">Alergias</label>
                      <input type="text" className="form-control" name="alergias" value={formData.alergias} onChange={handleInputChange} placeholder="Medicamentos, insetos, etc." />
                    </div>
                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label">Lesões Anteriores</label>
                        <textarea className="form-control" name="lesoesAnteriores" rows="2" value={formData.lesoesAnteriores} onChange={handleInputChange}></textarea>
                      </div>
                      <div className="col-6">
                        <label className="form-label">Restrições Médicas</label>
                        <textarea className="form-control" name="restricoesMedicas" rows="2" value={formData.restricoesMedicas} onChange={handleInputChange}></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section D: Sports */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={16} />
                </div>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Perfil Esportivo</h6>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <label className="form-label">Nº da Camiseta (Opcional)</label>
                    <input type="number" className="form-control" name="numeroCamisa" value={formData.numeroCamisa} onChange={handleInputChange} placeholder="Ex: 10" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Nº do Calçado (Opcional)</label>
                    <input type="number" className="form-control" name="numeroCalcado" value={formData.numeroCalcado} onChange={handleInputChange} placeholder="Ex: 40" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tamanho da Camisa (Opcional)</label>
                    <select className="form-select" name="tamanhoCamisa" value={formData.tamanhoCamisa} onChange={handleInputChange}>
                      <option value="">Selecione...</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tamanho do Calção (Opcional)</label>
                    <select className="form-select" name="tamanhoCalcao" value={formData.tamanhoCalcao} onChange={handleInputChange}>
                      <option value="">Selecione...</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ marginBottom: '12px' }}>Vincular Modalidades</label>
                  <ModalidadesSelector 
                    selected={formData.modalidades}
                    onChange={(novos) => setFormData({...formData, modalidades: novos})}
                    gender={formData.sexo}
                  />
                  <small style={{ color: 'var(--text-tertiary)', display: 'block', marginTop: '8px', fontSize: '0.75rem' }}>Isso adicionará o aluno imediatamente aos elencos selecionados.</small>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-light)', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ borderRadius: 'var(--radius-md)', padding: '10px 24px' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-md)', padding: '10px 32px' }}>
                  Salvar Atleta
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Student Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {filteredStudents.map(student => {
              const arrEsportes = student.modalidades?.length > 0 ? student.modalidades : (student.esportes || []);
              return (
                <div key={student._id}
                  onClick={() => window.location.href=`/alunos/${student._id}`}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)'
                  }}
                  className="hover-lift"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    {student.foto ? (
                      <img src={student.foto} alt="Perfil" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: '48px', height: '48px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--primary)',
                        color: 'var(--text-inverse)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '1.125rem', flexShrink: 0
                      }}>
                        {student.nome ? student.nome.charAt(0).toUpperCase() : 'A'}
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.nome}</h6>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                        {student.turma || student.serie || 'S/ Turma'}{student.matricula ? ` · ${student.matricula}` : ''}
                      </span>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {arrEsportes && arrEsportes.length > 0 ? (
                      <>
                        {arrEsportes.slice(0, 3).map((esp, idx) => (
                          <span key={idx} style={{
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <SportIcon sport={esp} size={14} />
                            <span>{esp}</span>
                          </span>
                        ))}
                        {arrEsportes.length > 3 && (
                          <span style={{
                            background: 'var(--border-light)',
                            color: 'var(--text-secondary)',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}>
                            +{arrEsportes.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontStyle: 'italic' }}>Sem modalidades vinculadas</span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredStudents.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Users size={42} style={{ color: 'var(--text-tertiary)', opacity: 0.4, marginBottom: '12px' }} />
                <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Nenhum aluno encontrado</h5>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Ajuste os filtros ou cadastre um novo aluno.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Alunos;
