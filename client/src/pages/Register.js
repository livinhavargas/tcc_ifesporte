import { useState } from 'react';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [tipo, setTipo] = useState('estudante');
  const [matricula, setMatricula] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (senha !== confirmSenha) {
      setMensagem('As senhas não coincidem');
      return;
    }

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, tipo, matricula: tipo === 'estudante' ? matricula : undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        return setMensagem(data.mensagem || 'Erro ao registrar');
      }

      setMensagem('Usuário registrado com sucesso! Redirecionando para login...');
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmSenha('');
      setTipo('estudante');
      setMatricula('');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    }
  };

  return (
    <div
      className="bg-primary d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh' }}
    >
      <div className="container">
          <div id="register-row" className="row justify-content-center align-items-center">
            <div id="register-column" className="col-md-7">
              <div
                id="register-box"
                className="col-md-12 p-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
              >
                <form id="register-form" className="form" onSubmit={handleRegister}>
                  <div className="text-center mb-4">
                    <img src="/logo.svg" alt="IFEsporte" style={{ height: '80px', marginBottom: '15px' }} />
                  </div>
                  <h3 className="text-center text-dark mb-2">Crie sua conta</h3>
                  <p className="text-center text-muted mb-4">Preencha os dados abaixo para se cadastrar</p>

                  {mensagem && <p className={`text-center mb-3 ${mensagem.includes('sucesso') ? 'text-success' : 'text-danger'}`}>{mensagem}</p>}

                  <div className="form-group mb-3">
                    <label htmlFor="tipo" className="form-label fw-bold">Tipo de usuário:</label><br />
                    <div className="d-flex gap-3 mb-3">
                      <div className="form-check">
                        <input
                          type="radio"
                          name="tipo"
                          id="admin"
                          className="form-check-input"
                          value="admin"
                          checked={tipo === 'admin'}
                          onChange={(e) => setTipo(e.target.value)}
                        />
                        <label htmlFor="admin" className="form-check-label">
                          <i className="bi bi-shield-lock me-2"></i>Professor (Admin)
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          name="tipo"
                          id="treinador"
                          className="form-check-input"
                          value="treinador"
                          checked={tipo === 'treinador'}
                          onChange={(e) => setTipo(e.target.value)}
                        />
                        <label htmlFor="treinador" className="form-check-label">
                          <i className="bi bi-person-badge me-2"></i>Treinador
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          name="tipo"
                          id="estudante"
                          className="form-check-input"
                          value="estudante"
                          checked={tipo === 'estudante'}
                          onChange={(e) => setTipo(e.target.value)}
                        />
                        <label htmlFor="estudante" className="form-check-label">
                          <i className="bi bi-mortarboard me-2"></i>Estudante
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="nome" className="form-label fw-bold">Nome completo:</label>
                    <input
                      type="text"
                      name="nome"
                      id="nome"
                      className="form-control"
                      placeholder="Digite seu nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>

                  {tipo === 'estudante' && (
                    <div className="form-group mb-3">
                      <label htmlFor="matricula" className="form-label fw-bold">Matrícula:</label>
                      <input
                        type="text"
                        name="matricula"
                        id="matricula"
                        className="form-control"
                        placeholder="Digite sua matrícula"
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group mb-3">
                    <label htmlFor="email" className="form-label fw-bold">Email:</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="form-control"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="senha" className="form-label fw-bold">Senha:</label>
                    <input
                      type="password"
                      name="senha"
                      id="senha"
                      className="form-control"
                      placeholder="Crie uma senha forte"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="confirmSenha" className="form-label fw-bold">Confirmar Senha:</label>
                    <input
                      type="password"
                      name="confirmSenha"
                      id="confirmSenha"
                      className="form-control"
                      placeholder="Confirme sua senha"
                      value={confirmSenha}
                      onChange={(e) => setConfirmSenha(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group d-flex justify-content-between mt-4">
                    <input
                      type="submit"
                      name="submit"
                      className="btn btn-primary btn-md px-5"
                      value="Cadastrar"
                    />
                    <a href="/login" className="btn btn-outline-secondary btn-md px-5">Voltar para login</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  );

}
