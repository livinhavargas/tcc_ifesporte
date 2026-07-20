import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, senha: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.mensagem || 'Erro no login');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('tipo', data.tipo);
      localStorage.setItem('userName', data.nome);
      localStorage.setItem('userId', data.id);
      onLogin(data.token, data.tipo);
      navigate('/');
    } catch (error) {
      setMensagem('Erro na conexão com o servidor');
    }
  };

  return (
    <div 
      className="bg-primary d-flex align-items-center justify-content-center" 
      style={{ minHeight: '100vh' }}
    >
      <div className="container">
          <div id="login-row" className="row justify-content-center align-items-center">
            <div id="login-column" className="col-md-6">
              <div id="login-box" className="col-md-12 p-4" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <form id="login-form" className="form" onSubmit={handleSubmit}>
                  <div className="text-center mb-4">
                    <img src="/logo.svg" alt="IFEsporte" style={{ height: '80px', marginBottom: '15px' }} />
                  </div>
                  <h3 className="text-center text-dark mb-2">Bem-vindo de volta!</h3>
                  <p className="text-center text-muted mb-4">Faça login para acessar sua conta</p>

                  {mensagem && <p className="text-danger text-center mb-3">{mensagem}</p>}

                  <div className="form-group mb-3">
                    <label htmlFor="username" className="form-label fw-bold">Usuário ou Email:</label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="form-control"
                      placeholder="Digite seu usuário ou e-mail"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="password" className="form-label fw-bold">Senha:</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="form-control"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group d-flex justify-content-between mt-4">
                    <input
                      type="submit"
                      name="submit"
                      className="btn btn-primary btn-md px-5"
                      value="Entrar"
                    />
                    <a href="/register" className="btn btn-outline-secondary btn-md px-5">
                      Criar conta
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
