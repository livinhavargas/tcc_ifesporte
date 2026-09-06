import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, ArrowRight, ArrowLeft, Lock, User, HeartPulse, 
  Trophy, CheckCircle2, Check, Sun, Moon 
} from 'lucide-react';
import { addNotification } from '../utils/notifications';
import ModalidadesSelector from '../components/ModalidadesSelector';
import ModalidadePosicaoSelector from '../components/ModalidadePosicaoSelector';
import { getStudentPositionForSport, isSportWithPositions } from '../utils/sportPositions';
import { useTheme } from '../contexts/ThemeContext';
import { apiUrl } from '../services/api';

const Register = ({ isEmbedded = false, defaultType = '', onSuccess = null, onCancel = null }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: defaultType || 'Treinador',
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
    codigoConvite: ''
  });

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];



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

    setFormData({
      ...formData,
      [name]: value
    });
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
    }
    if (step === 2) {
      if (formData.tipo === 'Treinador') {
        if (!formData.codigoConvite) {
          setError('O Código de Acesso é obrigatório para Treinadores.');
          return;
        }
        if (formData.codigoConvite !== '123') {
          setError('Código de Acesso inválido.');
          return;
        }
      } else if (formData.tipo === 'estudante') {
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
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const payload = { ...formData };
    delete payload.confirmarSenha;
    try {
      const response = await fetch(apiUrl('/api/users/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        addNotification('Novo Cadastro Realizado', `O usuário ${formData.nome} (${formData.tipo}) cadastrou-se no sistema.`);
        if (isEmbedded && onSuccess) onSuccess();
        else navigate('/login');
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
    <div className={isEmbedded ? "w-100" : ""} style={isEmbedded ? {} : { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '48px 24px', position: 'relative' }}>
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
      <div style={{ width: '100%', maxWidth: isEmbedded ? '100%' : '850px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '40px', boxShadow: isEmbedded ? 'none' : 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.375rem', marginBottom: '8px' }}>Criação de Conta</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '0 0 20px' }}>
            {step === 1 && 'Etapa 1 de 3: Informações de Acesso'}
            {step === 2 && 'Etapa 2 de 3: Dados Complementares'}
            {step === 3 && 'Etapa 3 de 3: Confirmação dos Dados'}
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
                <label className="form-label">Tipo de Usuário *</label>
                <select className="form-select" name="tipo" value={formData.tipo} onChange={handleInputChange} disabled={isEmbedded}>
                  <option value="Treinador">Treinador</option>
                  <option value="estudante">Estudante / Atleta</option>
                </select>
              </div>
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
            <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={18} style={{ color: 'var(--primary)' }} />Validação de Acesso</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">Código de Acesso (Fornecido pela direção) *</label>
                <input type="text" className="form-control" name="codigoConvite" value={formData.codigoConvite} onChange={handleInputChange} placeholder="Ex: 123" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Telefone (Opcional)</label>
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
                <label className="form-label fw-bold small text-muted">Turma (Opcional)</label>
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
                <label className="form-label fw-bold small text-muted">RG (Opcional)</label>
                <input type="text" className="form-control bg-light border-0" name="rg" value={formData.rg} onChange={handleInputChange} placeholder="00.000.000-0" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">Logradouro (Opcional)</label>
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
                <label className="form-label fw-bold small text-muted">Peso em kg (Opcional)</label>
                <input type="number" step="0.1" className="form-control bg-light border-0" name="peso" value={formData.peso} onChange={handleInputChange} placeholder="Ex: 65.5" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">Altura em metros (Opcional)</label>
                <input type="number" step="0.01" className="form-control bg-light border-0" name="altura" value={formData.altura} onChange={handleInputChange} placeholder="Ex: 1.75" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">Nome do Responsável (Opcional)</label>
                <input type="text" className="form-control bg-light border-0" name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleInputChange} placeholder="Nome do pai, mãe ou responsável" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">Telefone do Responsável (Opcional)</label>
                <input type="text" className="form-control bg-light border-0" name="telefoneResponsavel" value={formData.telefoneResponsavel} onChange={handleInputChange} placeholder="(00) 00000-0000" />
              </div>
              
              <div className="col-md-12 mt-4 mb-2">
                <h6 style={{ fontWeight: 700, color: 'var(--text)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={18} style={{ color: 'var(--primary)' }} />Informações Esportivas</h6>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold small text-muted">Nº da Camiseta (Opcional)</label>
                <input type="number" className="form-control bg-light border-0" name="numeroCamisa" value={formData.numeroCamisa} onChange={handleInputChange} placeholder="Ex: 10" />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold small text-muted">Nº do Calçado (Opcional)</label>
                <input type="number" className="form-control bg-light border-0" name="numeroCalcado" value={formData.numeroCalcado} onChange={handleInputChange} placeholder="Ex: 40" />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold small text-muted">Tamanho da Camisa (Opcional)</label>
                <select className="form-select bg-light border-0" name="tamanhoCamisa" value={formData.tamanhoCamisa} onChange={handleInputChange}>
                  <option value="">Selecione...</option>
                  <option value="P">P</option>
                  <option value="M">M</option>
                  <option value="G">G</option>
                  <option value="GG">GG</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold small text-muted">Tamanho do Calção (Opcional)</label>
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
                <label className="form-label fw-bold small text-muted">Alergias (Opcional)</label>
                <input type="text" className="form-control bg-light border-0" name="alergias" value={formData.alergias} onChange={handleInputChange} placeholder="Ex: Rinite, Medicamentos..." />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">Lesões Anteriores (Opcional)</label>
                <textarea className="form-control bg-light border-0" name="lesoesAnteriores" rows="2" value={formData.lesoesAnteriores} onChange={handleInputChange} placeholder="Descreva se houver"></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">Restrições Médicas (Opcional)</label>
                <textarea className="form-control bg-light border-0" name="restricoesMedicas" rows="2" value={formData.restricoesMedicas} onChange={handleInputChange} placeholder="Descreva se houver"></textarea>
              </div>
            </div>
            <hr className="my-4 text-muted" />
            <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={18} style={{ color: 'var(--primary)' }} />Modalidade(s) de Interesse (Opcional)</h6>
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
                <small style={{ color: 'var(--success-text)', opacity: 0.8 }}>Confirme se os dados abaixo estão corretos antes de finalizar.</small>
              </div>
            </div>
            <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
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
                          return isSportWithPositions(m) ? `${m} (${pos || 'Não sei'})` : m;
                        }).join(', ')
                      ) : 'Nenhuma'}
                    </div>
                  </>
                )}
                {formData.tipo === 'Treinador' && (
                  <>
                    <div className="col-6"><strong>Telefone:</strong> {formData.telefone || '-'}</div>
                    <div className="col-6"><strong>Código Informado:</strong> {formData.codigoConvite}</div>
                  </>
                )}
              </div>
            </div>
            <div className="d-flex justify-content-between mt-5">
              <button onClick={prevStep} className="btn btn-outline-secondary fw-bold px-4 rounded-3" disabled={loading}><ArrowLeft size={16} className="me-2" />Editar Dados</button>
              <button onClick={handleSubmit} className="btn btn-primary fw-bold px-5 rounded-3" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <Check size={16} className="me-2" />}
                Finalizar Cadastro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
