import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = ({ isEmbedded = false, defaultType = '', onSuccess = null, onCancel = null }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Etapa 1
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: defaultType || 'Treinador', // Apenas Treinador ou estudante

    // Etapa 2 - Comuns / Gerais
    telefone: '',
    
    sexo: 'Feminino',
    dataNascimento: '',
    cpf: '',
    endereco: '',
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
    modalidades: [], // Array de strings para múltiplas seleções
    
    // Etapa 2 - Treinador
    codigoConvite: ''
  });

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];

  const modalidadesDisponiveis = {
    'Modalidades Coletivas': ['Futebol', 'Futsal', 'Basquete', 'Handebol', 'Voleibol', 'Vôlei de Praia'],
    'Modalidades Individuais': ['Xadrez', 'Badminton'],
    'Tênis de Mesa': ['Tênis de Mesa - Individual', 'Tênis de Mesa - Dupla'],
    'Atletismo - Corridas': [
      '100m rasos', '200m rasos', '400m rasos', '800m', 
      '1500m', '3000m', '5000m', 'Revezamento 4x100', 'Revezamento 4x400'
    ],
    'Atletismo - Saltos': ['Salto em Distância', 'Salto em Altura', 'Salto Triplo'],
    'Atletismo - Lançamentos': ['Lançamento de Disco', 'Lançamento de Dardo', 'Arremesso de Peso']
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

  const handleModalidadeChange = (modalidade) => {
    setFormData((prev) => {
      const atual = prev.modalidades || [];
      if (atual.includes(modalidade)) {
        return { ...prev, modalidades: atual.filter(m => m !== modalidade) };
      } else {
        return { ...prev, modalidades: [...atual, modalidade] };
      }
    });
  };

  const nextStep = () => {
    setError('');
    
    // Validações Etapa 1
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
    
    // Validações Etapa 2
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
        if (!formData.sexo || !formData.dataNascimento || !formData.matricula || !formData.telefone || !formData.cpf) {
          setError('Preencha os campos obrigatórios: Gênero, Data de Nascimento, Matrícula, Telefone e CPF.');
          return;
        }
        if (formData.cpf.length < 14) {
          setError('CPF inválido ou incompleto.');
          return;
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
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (isEmbedded && onSuccess) {
          onSuccess();
        } else {
          navigate('/login');
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
    <div className={isEmbedded ? "w-100" : "min-vh-100 d-flex align-items-center justify-content-center bg-main py-5"}>
      <div className={`card-flat p-5 ${!isEmbedded ? 'shadow-sm' : 'border'}`} style={{ width: '100%', maxWidth: isEmbedded ? '100%' : '850px', borderRadius: '16px', backgroundColor: isEmbedded ? '#f8fafc' : '#ffffff' }}>
        
        <div className="text-center mb-5">
          <h2 className="fw-bold text-blue-dark">Criação de Conta</h2>
          <p className="text-muted">
            {step === 1 && 'Etapa 1 de 3: Informações de Acesso'}
            {step === 2 && 'Etapa 2 de 3: Dados Complementares'}
            {step === 3 && 'Etapa 3 de 3: Confirmação dos Dados'}
          </p>
          
          <div className="progress mt-3 mx-auto" style={{ height: '8px', maxWidth: '300px' }}>
            <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        {error && <div className="alert alert-danger rounded-3 fw-bold small"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}

        {/* ETAPA 1 */}
        {step === 1 && (
          <div>
            <div className="row g-3 mb-4">
              <div className="col-md-12">
                <label className="form-label fw-bold small text-blue-dark">Tipo de Usuário *</label>
                <select className="form-select bg-light border-0" name="tipo" value={formData.tipo} onChange={handleInputChange} disabled={isEmbedded}>
                  <option value="Treinador">Treinador</option>
                  <option value="estudante">Estudante / Atleta</option>
                </select>
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold small text-blue-dark">Nome Completo *</label>
                <input type="text" className="form-control bg-light border-0" name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Seu nome completo" />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold small text-blue-dark">E-mail *</label>
                <input type="email" className="form-control bg-light border-0" name="email" value={formData.email} onChange={handleInputChange} placeholder="exemplo@instituicao.edu.br" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-blue-dark">Senha *</label>
                <input type="password" className="form-control bg-light border-0" name="senha" value={formData.senha} onChange={handleInputChange} placeholder="Mínimo 8 caracteres" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-blue-dark">Confirmar Senha *</label>
                <input type="password" className="form-control bg-light border-0" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleInputChange} placeholder="Repita a senha" />
              </div>
            </div>

            <div className="d-flex justify-content-between mt-5">
              {isEmbedded && onCancel ? (
                <button type="button" onClick={onCancel} className="btn btn-outline-secondary fw-bold px-4 rounded-3">Cancelar</button>
              ) : (
                <Link to="/login" className="btn btn-outline-secondary fw-bold px-4 rounded-3">Cancelar</Link>
              )}
              <button onClick={nextStep} className="btn btn-primary fw-bold px-5 rounded-3">Próximo <i className="bi bi-arrow-right ms-2"></i></button>
            </div>
          </div>
        )}

        {/* ETAPA 2 */}
        {step === 2 && formData.tipo === 'Treinador' && (
          <div>
            <h6 className="fw-bold text-blue-dark mb-3"><i className="bi bi-shield-lock-fill me-2"></i>Validação de Acesso</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">Código de Acesso (Fornecido pela direção) *</label>
                <input type="text" className="form-control bg-light border-0" name="codigoConvite" value={formData.codigoConvite} onChange={handleInputChange} placeholder="Ex: 123" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">Telefone (Opcional)</label>
                <input type="text" className="form-control bg-light border-0" name="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className="d-flex justify-content-between mt-5">
              <button onClick={prevStep} className="btn btn-outline-secondary fw-bold px-4 rounded-3"><i className="bi bi-arrow-left me-2"></i>Voltar</button>
              <button onClick={nextStep} className="btn btn-primary fw-bold px-5 rounded-3">Próximo <i className="bi bi-arrow-right ms-2"></i></button>
            </div>
          </div>
        )}

        {step === 2 && formData.tipo === 'estudante' && (
          <div>
            <h6 className="fw-bold text-blue-dark mb-3"><i className="bi bi-person-lines-fill me-2"></i>Dados do Estudante</h6>
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
                <label className="form-label fw-bold small text-muted">Endereço (Opcional)</label>
                <input type="text" className="form-control bg-light border-0" name="endereco" value={formData.endereco} onChange={handleInputChange} placeholder="Rua, Bairro, Nº" />
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
                <h6 className="fw-bold text-blue-dark border-bottom pb-2"><i className="bi bi-heart-pulse-fill me-2 text-danger"></i>Informações Esportivas e Médicas</h6>
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-bold small text-muted">Nº da Camisa (Opcional)</label>
                <input type="number" className="form-control bg-light border-0" name="numeroCamisa" value={formData.numeroCamisa} onChange={handleInputChange} placeholder="Ex: 10" />
              </div>
              <div className="col-md-9">
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

            <h6 className="fw-bold text-blue-dark mb-3"><i className="bi bi-trophy-fill me-2"></i>Modalidade(s) de Interesse (Opcional)</h6>
            <div className="row g-4">
              {Object.entries(modalidadesDisponiveis).map(([categoria, lista]) => (
                <div key={categoria} className="col-md-6 col-lg-4">
                  <div className="fw-bold text-muted small mb-2">{categoria}</div>
                  <div className="d-flex flex-column gap-2">
                    {lista.map(mod => (
                      <div className="form-check" key={mod}>
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id={`mod-${mod}`} 
                          checked={formData.modalidades.includes(mod)}
                          onChange={() => handleModalidadeChange(mod)}
                        />
                        <label className="form-check-label small" htmlFor={`mod-${mod}`}>
                          {mod}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between mt-5">
              <button onClick={prevStep} className="btn btn-outline-secondary fw-bold px-4 rounded-3"><i className="bi bi-arrow-left me-2"></i>Voltar</button>
              <button onClick={nextStep} className="btn btn-primary fw-bold px-5 rounded-3">Próximo <i className="bi bi-arrow-right ms-2"></i></button>
            </div>
          </div>
        )}

        {/* ETAPA 3 */}
        {step === 3 && (
          <div>
            <div className="alert alert-success bg-green-light border-0 text-success d-flex align-items-center mb-4 rounded-3 p-4">
              <i className="bi bi-check-circle-fill fs-2 me-3"></i>
              <div>
                <h6 className="fw-bold mb-1">Quase lá, {formData.nome.split(' ')[0]}!</h6>
                <small>Confirme se os dados abaixo estão corretos antes de finalizar.</small>
              </div>
            </div>

            <div className="bg-light p-4 rounded-3 mb-4">
              <div className="row g-3 text-muted small">
                <div className="col-6"><strong>Nome:</strong> {formData.nome}</div>
                <div className="col-6"><strong>Email:</strong> {formData.email}</div>
                <div className="col-6"><strong>Tipo de Conta:</strong> {formData.tipo === 'estudante' ? 'Estudante / Atleta' : 'Treinador'}</div>
                
                {formData.tipo === 'estudante' && (
                  <>
                    <div className="col-6"><strong>Gênero:</strong> {formData.sexo}</div>
                    <div className="col-6"><strong>Data Nasc.:</strong> {formData.dataNascimento ? new Date(formData.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</div>
                    <div className="col-6"><strong>CPF:</strong> {formData.cpf}</div>
                    <div className="col-6"><strong>Matrícula:</strong> {formData.matricula}</div>
                    <div className="col-6"><strong>Telefone:</strong> {formData.telefone}</div>
                    <div className="col-6"><strong>Turma:</strong> {formData.turma || '-'}</div>
                    <div className="col-6"><strong>Peso:</strong> {formData.peso ? formData.peso + ' kg' : '-'}</div>
                    <div className="col-6"><strong>Altura:</strong> {formData.altura ? formData.altura + ' m' : '-'}</div>
                    <div className="col-6"><strong>Nome Responsável:</strong> {formData.nomeResponsavel || '-'}</div>
                    <div className="col-6"><strong>Tel. Responsável:</strong> {formData.telefoneResponsavel || '-'}</div>
                    <div className="col-12"><strong>Endereço:</strong> {formData.endereco || '-'}</div>
                    <div className="col-3"><strong>Nº Camisa:</strong> {formData.numeroCamisa || '-'}</div>
                    <div className="col-9"><strong>Alergias:</strong> {formData.alergias || '-'}</div>
                    <div className="col-6"><strong>Lesões Anteriores:</strong> {formData.lesoesAnteriores || '-'}</div>
                    <div className="col-6"><strong>Restrições Médicas:</strong> {formData.restricoesMedicas || '-'}</div>
                    <div className="col-12">
                      <strong>Modalidades selecionadas:</strong> {formData.modalidades.length > 0 ? formData.modalidades.join(', ') : 'Nenhuma'}
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
              <button onClick={prevStep} className="btn btn-outline-secondary fw-bold px-4 rounded-3" disabled={loading}><i className="bi bi-arrow-left me-2"></i>Editar Dados</button>
              <button onClick={handleSubmit} className="btn btn-primary fw-bold px-5 rounded-3" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-lg me-2"></i>}
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
