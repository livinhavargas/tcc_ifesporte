import React, { useState, useEffect } from 'react';
import { 
  Pencil, X, Save, Camera, User, Phone, Mail, GraduationCap, 
  HeartPulse, Trophy, IdCard, BadgeInfo, Shirt, ShieldAlert, 
  Activity, BarChart3, CheckCircle2, AlertTriangle, MapPin, 
  PhoneCall, Scale, Ruler, Calendar, UserCheck
} from 'lucide-react';
import Layout from '../components/Layout';
import Analises from './IFesporte/Analises';
import SportIcon from '../components/SportIcon';
import { addNotification } from '../utils/notifications';
import ModalidadesSelector from '../components/ModalidadesSelector';
import IMCCard from '../components/IMCCard';

const Perfil = () => {
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('tipo');
  
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    telefone: '',
    peso: '',
    altura: '',
    idade: '',
    matricula: '',
    turma: '',
    cpf: '',
    endereco: '',
    dataNascimento: '',
    nomeResponsavel: '',
    telefoneResponsavel: '',
    foto: '',
    esportes: [],
    sexo: '',
    alergias: '',
    lesoesAnteriores: '',
    restricoesMedicas: '',
    numeroCamisa: ''
  });

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];
  


  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setProfileData({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        peso: data.peso || '',
        altura: data.altura || '',
        idade: data.idade || '', 
        matricula: data.matricula || '',
        turma: data.turma || data.serie || '', 
        cpf: data.cpf || '',
        rg: data.rg || '',
        endereco: data.endereco || '',
        cidade: data.cidade || '',
        estado: data.estado || '',
        dataNascimento: data.dataNascimento ? data.dataNascimento.split('T')[0] : '',
        nomeResponsavel: data.nomeResponsavel || '',
        telefoneResponsavel: data.telefoneResponsavel || '',
        foto: data.foto || '',
        esportes: data.esportes || [],
        sexo: data.sexo || '',
        alergias: data.alergias || '',
        lesoesAnteriores: data.lesoesAnteriores || '',
        restricoesMedicas: data.restricoesMedicas || '',
        numeroCamisa: data.numeroCamisa || '',
        numeroCalcado: data.numeroCalcado || '',
        tamanhoCamisa: data.tamanhoCamisa || '',
        tamanhoCalcao: data.tamanhoCalcao || ''
      });
      setLoading(false);
    } catch (error) {
      console.error(error);
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
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }

    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        setMensagem('✅ Perfil atualizado com sucesso!');
        addNotification('Perfil Atualizado', 'Seus dados de perfil foram atualizados com sucesso.');
        setIsEditing(false);
        if (profileData.nome) localStorage.setItem('userName', profileData.nome);
        if (profileData.foto) localStorage.setItem('foto', profileData.foto);
        setTimeout(() => setMensagem(''), 4000);
      } else {
        setMensagem('❌ Erro ao atualizar perfil.');
      }
    } catch (error) {
      setMensagem('❌ Erro de conexão ao salvar.');
    }
  };

  const fieldStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font)',
    outline: 'none',
    transition: 'all var(--transition-fast)',
    background: isEditing ? 'var(--bg-input)' : 'var(--bg-hover)',
    color: 'var(--text)',
    cursor: isEditing ? 'text' : 'default'
  };

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>Meu Perfil</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0' }}>Visualize e mantenha seus dados atualizados.</p>
          </div>
          <div>
            {!isEditing ? (
              <button 
                type="button" 
                onClick={() => setIsEditing(true)} 
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Pencil size={16} /> Editar Perfil
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => {
                  fetchProfile();
                  setIsEditing(false);
                }} 
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <X size={16} /> Cancelar Edição
              </button>
            )}
          </div>
        </div>

        {mensagem && (
          <div style={{
            background: mensagem.includes('✅') ? 'var(--success-light)' : 'var(--error-light)',
            color: mensagem.includes('✅') ? '#065F46' : '#991B1B',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            {mensagem.includes('✅') ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{mensagem}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '32px',
              marginBottom: '32px'
            }}>
              
              {/* Photo Area */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
                 <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                   {profileData.foto ? (
                     <img src={profileData.foto} alt="Perfil" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg)' }} />
                   ) : (
                     <div style={{
                       width: '100%', height: '100%', borderRadius: '50%',
                       background: 'var(--primary)', color: 'var(--text-inverse)',
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       fontWeight: 700, fontSize: '3rem', border: '4px solid var(--bg)'
                     }}>
                       {profileData.nome ? profileData.nome.charAt(0).toUpperCase() : 'U'}
                     </div>
                   )}
                   {isEditing && (
                     <>
                       <label htmlFor="fotoInput" style={{
                         position: 'absolute', bottom: '0', right: '0',
                         background: 'var(--primary)', color: '#fff',
                         width: '36px', height: '36px', borderRadius: '50%',
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         cursor: 'pointer', boxShadow: 'var(--shadow-sm)', border: '2px solid #fff'
                       }}>
                         <Camera size={18} />
                       </label>
                       <input type="file" id="fotoInput" className="d-none" accept="image/*" onChange={handlePhotoChange} />
                     </>
                   )}
                 </div>
              </div>

              {/* Informações Pessoais */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} />
                </div>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Informações Pessoais</h6>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} /> Nome Completo
                    </label>
                    <input type="text" name="nome" value={profileData.nome} onChange={handleInputChange} required readOnly={!isEditing} style={fieldStyle} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={14} /> E-mail
                    </label>
                    <input type="email" name="email" value={profileData.email} onChange={handleInputChange} required readOnly={!isEditing} style={fieldStyle} />
                  </div>

                  {userType === 'estudante' && (
                    <>
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <BadgeInfo size={14} /> CPF
                        </label>
                        <input type="text" name="cpf" value={profileData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <BadgeInfo size={14} /> RG
                        </label>
                        <input type="text" name="rg" value={profileData.rg} onChange={handleInputChange} placeholder="00.000.000-0" readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> Data de Nascimento
                        </label>
                        <input type="date" name="dataNascimento" value={profileData.dataNascimento} onChange={handleInputChange} readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <UserCheck size={14} /> Gênero
                        </label>
                        {isEditing ? (
                          <select name="sexo" value={profileData.sexo} onChange={handleInputChange} style={fieldStyle}>
                            <option value="">Selecione...</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Outro">Outro</option>
                          </select>
                        ) : (
                          <input type="text" value={profileData.sexo || '-'} readOnly style={fieldStyle} />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contato */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={16} />
                </div>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Contato e Localização</h6>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={14} /> Telefone / Celular
                    </label>
                    <input type="text" name="telefone" value={profileData.telefone} onChange={handleInputChange} placeholder="(00) 00000-0000" readOnly={!isEditing} style={fieldStyle} />
                  </div>
                  {userType === 'estudante' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} /> Logradouro
                        </label>
                        <input type="text" name="endereco" value={profileData.endereco} onChange={handleInputChange} placeholder="Rua, Bairro, Nº" readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} /> Cidade
                        </label>
                        <input type="text" name="cidade" value={profileData.cidade} onChange={handleInputChange} placeholder="Ex: Vitória" readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} /> Estado
                        </label>
                        <input type="text" name="estado" value={profileData.estado} onChange={handleInputChange} placeholder="Ex: ES" maxLength="2" style={{ ...fieldStyle, textTransform: 'uppercase' }} readOnly={!isEditing} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={14} /> Nome do Responsável
                        </label>
                        <input type="text" name="nomeResponsavel" value={profileData.nomeResponsavel} onChange={handleInputChange} placeholder="Nome do Responsável" readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <PhoneCall size={14} /> Telefone do Responsável
                        </label>
                        <input type="text" name="telefoneResponsavel" value={profileData.telefoneResponsavel} onChange={handleInputChange} placeholder="(00) 00000-0000" readOnly={!isEditing} style={fieldStyle} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Dados Escolares e Físicos */}
              {userType === 'estudante' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GraduationCap size={16} />
                    </div>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Dados Escolares e Físicos</h6>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <IdCard size={14} /> Matrícula
                        </label>
                        <input type="text" name="matricula" value={profileData.matricula} onChange={handleInputChange} readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <GraduationCap size={14} /> Turma
                        </label>
                        {isEditing ? (
                          <select name="turma" value={profileData.turma} onChange={handleInputChange} style={fieldStyle}>
                            <option value="">Selecione...</option>
                            {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : (
                          <input type="text" value={profileData.turma || '-'} readOnly style={fieldStyle} />
                        )}
                      </div>
                      <div className="col-md-2">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> Idade
                        </label>
                        <input type="number" name="idade" value={profileData.idade} onChange={handleInputChange} readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Scale size={14} /> Peso (kg)
                        </label>
                        <input type="number" step="0.1" name="peso" value={profileData.peso} onChange={handleInputChange} readOnly={!isEditing} style={fieldStyle} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Ruler size={14} /> Altura (m)
                        </label>
                        <input type="number" step="0.01" name="altura" value={profileData.altura} onChange={handleInputChange} readOnly={!isEditing} style={fieldStyle} />
                      </div>
                    </div>

                    <IMCCard peso={profileData.peso} altura={profileData.altura} />
                  </div>

                  {/* Informações Esportivas */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trophy size={16} />
                    </div>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Informações Esportivas</h6>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Shirt size={14} /> Nº da Camiseta
                        </label>
                        <input type="number" name="numeroCamisa" value={profileData.numeroCamisa} onChange={handleInputChange} readOnly={!isEditing} placeholder="Ex: 10" style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Shirt size={14} /> Nº do Calçado
                        </label>
                        <input type="number" name="numeroCalcado" value={profileData.numeroCalcado} onChange={handleInputChange} readOnly={!isEditing} placeholder="Ex: 40" style={fieldStyle} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Shirt size={14} /> Tamanho da Camisa
                        </label>
                        {isEditing ? (
                          <select name="tamanhoCamisa" value={profileData.tamanhoCamisa} onChange={handleInputChange} style={fieldStyle}>
                            <option value="">Selecione...</option>
                            <option value="P">P</option>
                            <option value="M">M</option>
                            <option value="G">G</option>
                            <option value="GG">GG</option>
                          </select>
                        ) : (
                          <input type="text" value={profileData.tamanhoCamisa || '-'} readOnly style={fieldStyle} />
                        )}
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Shirt size={14} /> Tamanho do Calção
                        </label>
                        {isEditing ? (
                          <select name="tamanhoCalcao" value={profileData.tamanhoCalcao} onChange={handleInputChange} style={fieldStyle}>
                            <option value="">Selecione...</option>
                            <option value="P">P</option>
                            <option value="M">M</option>
                            <option value="G">G</option>
                            <option value="GG">GG</option>
                          </select>
                        ) : (
                          <input type="text" value={profileData.tamanhoCalcao || '-'} readOnly style={fieldStyle} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informações Médicas */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--error-light)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HeartPulse size={16} />
                    </div>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Informações Médicas</h6>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                    <div className="row g-3">
                      <div className="col-md-12">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldAlert size={14} /> Alergias
                        </label>
                        <input type="text" name="alergias" value={profileData.alergias} onChange={handleInputChange} readOnly={!isEditing} placeholder="Descreva alergias a medicamentos, alimentos, etc" style={fieldStyle} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Activity size={14} /> Lesões Anteriores
                        </label>
                        {isEditing ? (
                          <textarea name="lesoesAnteriores" rows="2" value={profileData.lesoesAnteriores} onChange={handleInputChange} placeholder="Descreva se houver" style={fieldStyle}></textarea>
                        ) : (
                          <div style={{ ...fieldStyle, minHeight: '38px', whiteSpace: 'pre-wrap' }}>{profileData.lesoesAnteriores || '-'}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small mb-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HeartPulse size={14} /> Restrições Médicas
                        </label>
                        {isEditing ? (
                          <textarea name="restricoesMedicas" rows="2" value={profileData.restricoesMedicas} onChange={handleInputChange} placeholder="Descreva se houver" style={fieldStyle}></textarea>
                        ) : (
                          <div style={{ ...fieldStyle, minHeight: '38px', whiteSpace: 'pre-wrap' }}>{profileData.restricoesMedicas || '-'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modalidades */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trophy size={16} />
                    </div>
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.875rem' }}>Modalidade(s) de Interesse</h6>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                    <div style={isEditing ? {} : { pointerEvents: 'none', opacity: 0.85 }}>
                      <ModalidadesSelector 
                        selected={profileData.esportes || []}
                        onChange={(novos) => setProfileData(prev => ({ ...prev, esportes: novos }))}
                        gender={profileData.sexo}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Save button */}
              {isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                    <Save size={16} /> Salvar Alterações
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Sessão Minhas Análises */}
      {userType === 'estudante' && !loading && (
        <div style={{
          maxWidth: '900px',
          margin: '32px auto 0',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          padding: '32px'
        }}>
          <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '24px', fontSize: '1.125rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} style={{ color: 'var(--primary)' }} />
            <span>Minhas Análises</span>
          </h4>
          <Analises embebed={true} />
        </div>
      )}
    </Layout>
  );
};

export default Perfil;
