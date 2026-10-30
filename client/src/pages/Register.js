import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, ArrowRight, ArrowLeft, Lock, User, HeartPulse, 
  Trophy, CheckCircle2, Check, Sun, Moon, ShieldCheck, MailCheck, FileText 
} from 'lucide-react';
import { addNotification } from '../utils/notifications';
import ModalidadesSelector from '../components/ModalidadesSelector';
import ModalidadePosicaoSelector from '../components/ModalidadePosicaoSelector';
import LgpdTermsModal, { LGPD_TERMS_VERSION } from '../components/LgpdTermsModal';
import { getStudentPositionForSport, isSportWithPositions } from '../utils/sportPositions';
import { useTheme } from '../contexts/ThemeContext';
import { apiUrl } from '../services/api';

export const isInstitutionalTrainerEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase().endsWith('@ifc.edu.br');
};

const Register = ({ isEmbedded = false, defaultType = '', onSuccess = null, onCancel = null }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLgpdModal, setShowLgpdModal] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [simulatedVerificationUrl, setSimulatedVerificationUrl] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: defaultType || 'estudante',
    telefone: '',
    sexo: 'Feminino',
    dataNascimento: '',
    cpf: '',
    rg: '',
    endereco: '',
    cidade: '',
    estado: '',
    turma: '',
    matricula: '',
    peso: '',
    altura: '',
    nomeResponsavel: '',
    telefoneResponsavel: '',
    alergias: '',
    lesoesAnteriores: '',
    restricoesMedicas: '',
    numeroCamisa: '',
    numeroCalcado: '',
    tamanhoCamisa: '',
    tamanhoCalcao: '',
    modalidades: [],
    posicoesPorModalidade: [],
    aceiteLgpd: false,
    versaoTermos: LGPD_TERMS_VERSION
  });

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];

  const handleInputChange = (e) => {
    let { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
      return;
    }
    
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

    const updatedData = {
      ...formData,
      [name]: value
    };

    if (name === 'email') {
      updatedData.tipo = isInstitutionalTrainerEmail(value) ? 'Treinador' : 'estudante';
    }

    setFormData(updatedData);
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
        setError('Preencha todos os campos obrigatórios da Etapa 1.');
        return;
      }
      if (formData.senha.length < 8) {
        setError('A senha deve ter no mínimo 8 caracteres.');
        return;
      }
      if (formData.senha !== formData.confirmarSenha) {
        setError('As senhas não coincidem.');
        return;
      }
      const resolvedTipo = isInstitutionalTrainerEmail(formData.email) ? 'Treinador' : 'estudante';
      if (formData.tipo !== resolvedTipo) {
        setFormData(prev => ({ ...prev, tipo: resolvedTipo }));
      }
    }
    if (step === 2) {
      if (formData.tipo === 'estudante') {
        if (!formData.sexo || !formData.dataNascimento || !formData.matricula || !formData.telefone || !formData.cpf || !formData.cidade || !formData.estado) {
          setError('Preencha os campos obrigatórios: Gênero, Data de Nascimento, Matrícula, Telefone, CPF, Cidade e Estado.');
          return;
        }
        if (formData.cpf.length < 14) {
          setError('CPF inválido ou incompleto.');
          return;
        }
        if (formData.rg) {
          const cleanRG = formData.rg.replace(/[^a-zA-Z0-9]/g, '');
          if (cleanRG.length < 7) {
            setError('RG inválido ou incompleto.');
            return;
          }
        }
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.aceiteLgpd) {
      setError('É obrigatório aceitar os Termos de Uso e a Política de Privacidade (LGPD) para concluir o cadastro.');
      return;
    }

    setLoading(true);
    setError('');
    const resolvedTipo = isInstitutionalTrainerEmail(formData.email) ? 'Treinador' : 'estudante';
    const payload = { ...formData, tipo: resolvedTipo };
    delete payload.confirmarSenha;
    try {
      const response = await fetch(apiUrl('/api/users/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        addNotification('Novo Cadastro Realizado', `O usuário ${formData.nome} (${resolvedTipo}) cadastrou-se no sistema.`);
        if (data.emailSimulado && data.verificationUrl) {
          setSimulatedVerificationUrl(data.verificationUrl);
        }
        if (data.emailErro) {
          setEmailWarning(data.emailErro);
        }
        if (isEmbedded && onSuccess) {
          onSuccess();
        } else {
          setRegistrationCompleted(true);
        }
      } else {
        setError(data.message || data.mensagem || 'Erro ao realizar cadastro');
        setStep(1); 
      }
    } catch (err) {
      setError('Erro de conexão ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isEmbedded ? "w-100" : ""} style={isEmbedded ? {} : { minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 'clamp(24px, 4vw, 48px) clamp(12px, 3vw, 24px)', position: 'relative' }}>
      {!isEmbedded && (
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: isDark ? 'var(--warning)' : 'var(--text-secondary)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-xs)',
            transition: 'all var(--transition-fast)'
          }}
          title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span>{isDark ? 'Claro' : 'Escuro'}</span>
        </button>
      )}
      <div style={{ width: '100%', maxWidth: isEmbedded ? '100%' : '850px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: 'clamp(20px, 4vw, 40px)', boxShadow: isEmbedded ? 'none' : 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
        
        {registrationCompleted ? (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'var(--success-light)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <MailCheck size={34} />
            </div>
            <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.35rem', marginBottom: '10px' }}>
              Cadastro Realizado com Sucesso!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', maxWidth: '540px', margin: '0 auto 20px', lineHeight: 1.6 }}>
              Enviamos um e-mail de confirmação do seu cadastro para <strong>{formData.email}</strong> com o link para verificar seu endereço eletrônico e o resumo de privacidade da sua conta.
            </p>
            <div
              style={{
                maxWidth: '520px',
                margin: '0 auto 28px',
                background: 'var(--bg)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left'
              }}
            >
              <ShieldCheck size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>
                Seu aceite aos <strong>Termos de Uso e Política de Privacidade (LGPD – Lei nº 13.709/2018)</strong> foi registrado com segurança. Você já pode acessar sua conta normalmente.
              </span>
            </div>
            {simulatedVerificationUrl && (
              <div
                style={{
                  maxWidth: '520px',
                  margin: '0 auto 24px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontSize: '0.8rem',
                  color: 'var(--text)',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                  {emailWarning ? 'Atenção no Envio SMTP (Gmail):' : 'Modo de Teste Local (SMTP ainda não configurado no .env):'}
                </div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {emailWarning || (
                    <>
                      Para receber e-mails reais na caixa de entrada, preencha <code>SMTP_USER</code> e <code>SMTP_PASS</code> em <code>server/.env</code>. Você pode testar a confirmação agora clicando abaixo:
                    </>
                  )}
                </div>
                <a
                  href={simulatedVerificationUrl}
                  style={{ color: 'var(--primary)', fontWeight: 700, wordBreak: 'break-all' }}
                >
                  Confirmar E-mail Agora (Link de Teste)
                </a>
              </div>
            )}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-primary fw-bold px-5 py-2 rounded-3"
            >
              Ir para o Login <ArrowRight size={16} className="ms-2" />
            </button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <h2 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.375rem', marginBottom: '8px' }}>Criação de Conta</h2>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '0 0 20px' }}>
                {step === 1 && 'Etapa 1 de 3: Informações de Acesso'}
                {step === 2 && 'Etapa 2 de 3: Dados Complementares'}
                {step === 3 && 'Etapa 3 de 3: Confirmação dos Dados e LGPD'}
              </p>
              <div style={{ maxWidth: '300px', margin: '0 auto', height: '6px', background: 'var(--border-light)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${(step / 3) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.3s ease' }}></div>
              </div>
            </div>

            {error && <div style={{ background: 'var(--error-light)', color: 'var(--error-text)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} />{error}</div>}

            {step === 1 && (
              <div>
                <div className="row g-3 mb-4">
                  <div className="col-md-12">
                    <label className="form-label">Nome Completo *</label>
                    <input type="text" className="form-control" name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Seu nome completo" />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">E-mail *</label>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} placeholder="exemplo@instituicao.edu.br" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Senha *</label>
                    <input type="password" className="form-control" name="senha" value={formData.senha} onChange={handleInputChange} placeholder="Mínimo 8 caracteres" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirmar Senha *</label>
                    <input type="password" className="form-control" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleInputChange} placeholder="Repita a senha" />
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-5">
                  {isEmbedded && onCancel ? (
                    <button type="button" onClick={onCancel} className="btn btn-outline-secondary fw-bold px-4 rounded-3">Cancelar</button>
                  ) : (
                    <Link to="/login" className="btn btn-outline-secondary fw-bold px-4 rounded-3">Cancelar</Link>
                  )}
                  <button onClick={nextStep} className="btn btn-primary fw-bold px-5 rounded-3">Próximo <ArrowRight size={16} className="ms-2" /></button>
                </div>
              </div>
            )}

            {step === 2 && formData.tipo === 'Treinador' && (
              <div>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={18} style={{ color: 'var(--primary)' }} />Dados do Treinador</h6>
                <div
                  style={{
                    background: 'var(--success-light)',
                    color: 'var(--success-text)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span>Perfil de Treinador confirmado automaticamente pelo e-mail institucional ({formData.email}).</span>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label">Telefone</label>
                    <input type="text" className="form-control" name="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-5">
                  <button onClick={prevStep} className="btn btn-outline-secondary fw-bold px-4 rounded-3"><ArrowLeft size={16} className="me-2" />Voltar</button>
                  <button onClick={nextStep} className="btn btn-primary fw-bold px-5 rounded-3">Próximo <ArrowRight size={16} className="ms-2" /></button>
                </div>
              </div>
            )}

            {step === 2 && formData.tipo === 'estudante' && (
              <div>
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={18} style={{ color: 'var(--primary)' }} />Dados do Estudante</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Gênero *</label>
                    <select className="form-select bg-light border-0" name="sexo" value={formData.sexo} onChange={handleInputChange}>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Data de Nascimento *</label>
                    <input type="date" className="form-control bg-light border-0" name="dataNascimento" value={formData.dataNascimento} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small text-muted">Turma</label>
                    <select className="form-select bg-light border-0" name="turma" value={formData.turma} onChange={handleInputChange}>
                      <option value="">Selecione...</option>
                      {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small text-muted">Matrícula *</label>
                    <input type="text" className="form-control bg-light border-0" name="matricula" value={formData.matricula} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small text-muted">Telefone *</label>
                    <input type="text" className="form-control bg-light border-0" name="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">CPF *</label>
                    <input type="text" className="form-control bg-light border-0" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">RG</label>
                    <input type="text" className="form-control bg-light border-0" name="rg" value={formData.rg} onChange={handleInputChange} placeholder="00.000.000-0" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Logradouro</label>
                    <input type="text" className="form-control bg-light border-0" name="endereco" value={formData.endereco} onChange={handleInputChange} placeholder="Rua, Bairro, Nº" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small text-muted">Cidade *</label>
                    <input type="text" className="form-control bg-light border-0" name="cidade" value={formData.cidade} onChange={handleInputChange} placeholder="Ex: Vitória" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-bold small text-muted">Estado *</label>
                    <input type="text" className="form-control bg-light border-0" name="estado" value={formData.estado} onChange={handleInputChange} placeholder="Ex: ES" maxLength="2" style={{ textTransform: 'uppercase' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Peso em kg</label>
                    <input type="number" step="0.1" className="form-control bg-light border-0" name="peso" value={formData.peso} onChange={handleInputChange} placeholder="Ex: 65.5" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Altura em metros</label>
                    <input type="number" step="0.01" className="form-control bg-light border-0" name="altura" value={formData.altura} onChange={handleInputChange} placeholder="Ex: 1.75" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Nome do Responsável</label>
                    <input type="text" className="form-control bg-light border-0" name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleInputChange} placeholder="Nome do pai, mãe ou responsável" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Telefone do Responsável</label>
                    <input type="text" className="form-control bg-light border-0" name="telefoneResponsavel" value={formData.telefoneResponsavel} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                  </div>
                  
                  <div className="col-md-12 mt-4 mb-2">
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={18} style={{ color: 'var(--primary)' }} />Informações Esportivas</h6>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Nº da Camiseta</label>
                    <input type="number" className="form-control bg-light border-0" name="numeroCamisa" value={formData.numeroCamisa} onChange={handleInputChange} placeholder="Ex: 10" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Nº do Calçado</label>
                    <input type="number" className="form-control bg-light border-0" name="numeroCalcado" value={formData.numeroCalcado} onChange={handleInputChange} placeholder="Ex: 40" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Tamanho da Camisa</label>
                    <select className="form-select bg-light border-0" name="tamanhoCamisa" value={formData.tamanhoCamisa} onChange={handleInputChange}>
                      <option value="">Selecione...</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Tamanho do Calção</label>
                    <select className="form-select bg-light border-0" name="tamanhoCalcao" value={formData.tamanhoCalcao} onChange={handleInputChange}>
                      <option value="">Selecione...</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                    </select>
                  </div>

                  <div className="col-md-12 mt-4 mb-2">
                    <h6 style={{ fontWeight: 700, color: 'var(--text)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><HeartPulse size={18} style={{ color: 'var(--error)' }} />Informações Médicas</h6>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-bold small text-muted">Alergias</label>
                    <input type="text" className="form-control bg-light border-0" name="alergias" value={formData.alergias} onChange={handleInputChange} placeholder="Ex: Rinite, Medicamentos..." />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Lesões Anteriores</label>
                    <textarea className="form-control bg-light border-0" name="lesoesAnteriores" rows="2" value={formData.lesoesAnteriores} onChange={handleInputChange} placeholder="Descreva se houver"></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Restrições Médicas</label>
                    <textarea className="form-control bg-light border-0" name="restricoesMedicas" rows="2" value={formData.restricoesMedicas} onChange={handleInputChange} placeholder="Descreva se houver"></textarea>
                  </div>
                </div>
                <hr className="my-4 text-muted" />
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={18} style={{ color: 'var(--primary)' }} />Modalidade(s) de Interesse</h6>
                <ModalidadesSelector 
                  selected={formData.modalidades}
                  onChange={(novos) => setFormData(prev => ({ ...prev, modalidades: novos }))}
                  gender={formData.sexo}
                />
                <ModalidadePosicaoSelector
                  selectedModalidades={formData.modalidades}
                  posicoesPorModalidade={formData.posicoesPorModalidade}
                  onChange={(novasPos) => setFormData(prev => ({ ...prev, posicoesPorModalidade: novasPos }))}
                />
                <div className="d-flex justify-content-between mt-5">
                  <button onClick={prevStep} className="btn btn-outline-secondary fw-bold px-4 rounded-3"><ArrowLeft size={16} className="me-2" />Voltar</button>
                  <button onClick={nextStep} className="btn btn-primary fw-bold px-5 rounded-3">Próximo <ArrowRight size={16} className="ms-2" /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ background: 'var(--success-light)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
                  <div>
                    <h6 style={{ fontWeight: 700, color: 'var(--success-text)', marginBottom: '2px', fontSize: '0.9375rem' }}>Quase lá, {formData.nome.split(' ')[0]}!</h6>
                    <small style={{ color: 'var(--success-text)', opacity: 0.8 }}>Confirme se os dados abaixo estão corretos e aceite os termos de privacidade (LGPD) antes de finalizar.</small>
                  </div>
                </div>
                <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                  <div className="row g-3 text-muted small">
                    <div className="col-6"><strong>Nome:</strong> {formData.nome}</div>
                    <div className="col-6"><strong>Email:</strong> {formData.email}</div>
                    <div className="col-6"><strong>Tipo de Conta:</strong> {formData.tipo === 'estudante' ? 'Estudante / Atleta' : 'Treinador'}</div>
                    {formData.tipo === 'estudante' && (
                      <>
                        <div className="col-6"><strong>Gênero:</strong> {formData.sexo}</div>
                        <div className="col-6"><strong>Data Nasc.:</strong> {formData.dataNascimento ? new Date(formData.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</div>
                        <div className="col-6"><strong>CPF:</strong> {formData.cpf}</div>
                        <div className="col-6"><strong>RG:</strong> {formData.rg}</div>
                        <div className="col-6"><strong>Matrícula:</strong> {formData.matricula}</div>
                        <div className="col-6"><strong>Telefone:</strong> {formData.telefone}</div>
                        <div className="col-6"><strong>Turma:</strong> {formData.turma || '-'}</div>
                        <div className="col-6"><strong>Peso:</strong> {formData.peso ? formData.peso + ' kg' : '-'}</div>
                        <div className="col-6"><strong>Altura:</strong> {formData.altura ? formData.altura + ' m' : '-'}</div>
                        <div className="col-6"><strong>Nome Responsável:</strong> {formData.nomeResponsavel || '-'}</div>
                        <div className="col-6"><strong>Tel. Responsável:</strong> {formData.telefoneResponsavel || '-'}</div>
                        <div className="col-12"><strong>Logradouro:</strong> {formData.endereco ? `${formData.endereco}, ` : ''}{formData.cidade || '-'}{formData.estado ? ` - ${formData.estado}` : ''}</div>
                        <div className="col-3"><strong>Nº Camisa:</strong> {formData.numeroCamisa || '-'}</div>
                        <div className="col-3"><strong>Nº Calçado:</strong> {formData.numeroCalcado || '-'}</div>
                        <div className="col-3"><strong>Tam. Camisa:</strong> {formData.tamanhoCamisa || '-'}</div>
                        <div className="col-3"><strong>Tam. Calção:</strong> {formData.tamanhoCalcao || '-'}</div>
                        <div className="col-12"><strong>Alergias:</strong> {formData.alergias || '-'}</div>
                        <div className="col-6"><strong>Lesões Anteriores:</strong> {formData.lesoesAnteriores || '-'}</div>
                        <div className="col-6"><strong>Restrições Médicas:</strong> {formData.restricoesMedicas || '-'}</div>
                        <div className="col-12">
                          <strong>Modalidades e Posições:</strong> {formData.modalidades.length > 0 ? (
                            formData.modalidades.map(m => {
                              const pos = getStudentPositionForSport(formData, m);
                              return isSportWithPositions(m) ? `${m} (${pos || 'Indefinido'})` : m;
                            }).join(', ')
                          ) : 'Nenhuma'}
                        </div>
                      </>
                    )}
                    {formData.tipo === 'Treinador' && (
                      <div className="col-6"><strong>Telefone:</strong> {formData.telefone || '-'}</div>
                    )}
                  </div>
                </div>

                {/* Seção de Verificação de E-mail e Conformidade LGPD */}
                <div
                  style={{
                    background: 'var(--bg)',
                    border: '1.5px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                      <h6 style={{ margin: 0, fontWeight: 700, fontSize: '0.925rem', color: 'var(--text)' }}>
                        Proteção de Dados Pessoais (LGPD) e Confirmação por E-mail
                      </h6>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLgpdModal(true)}
                      className="btn btn-sm btn-outline-primary fw-bold rounded-3"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                    >
                      <FileText size={14} />
                      Ler Termos e Política de Privacidade
                    </button>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '14px' }}>
                    Em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>, seus dados serão utilizados exclusivamente para gestão esportiva institucional, acompanhamento físico/técnico e comunicação acadêmica. Ao concluir o cadastro, enviaremos um <strong>e-mail de confirmação</strong> para <strong>{formData.email}</strong> com um link de verificação.
                  </p>

                  <label
                    htmlFor="aceiteLgpd"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      color: 'var(--text)',
                      fontWeight: 500,
                      background: 'var(--bg-card)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${formData.aceiteLgpd ? 'var(--primary)' : 'var(--border)'}`
                    }}
                  >
                    <input
                      id="aceiteLgpd"
                      type="checkbox"
                      name="aceiteLgpd"
                      checked={formData.aceiteLgpd}
                      onChange={handleInputChange}
                      style={{ accentColor: 'var(--primary)', width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }}
                    />
                    <span>
                      Declaro que li e concordo com os{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowLgpdModal(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: 'var(--primary)',
                          fontWeight: 700,
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                      >
                        Termos de Uso e a Política de Privacidade (LGPD)
                      </button>
                      , autorizando o tratamento dos dados informados para as finalidades institucionais do IFesporte. *
                    </span>
                  </label>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button onClick={prevStep} className="btn btn-outline-secondary fw-bold px-4 rounded-3" disabled={loading}><ArrowLeft size={16} className="me-2" />Editar Dados</button>
                  <button onClick={handleSubmit} className="btn btn-primary fw-bold px-5 rounded-3" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <Check size={16} className="me-2" />}
                    Finalizar Cadastro
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <LgpdTermsModal
        isOpen={showLgpdModal}
        onClose={() => setShowLgpdModal(false)}
        onAccept={() => setFormData(prev => ({ ...prev, aceiteLgpd: true }))}
      />
    </div>
  );
};

export default Register;
