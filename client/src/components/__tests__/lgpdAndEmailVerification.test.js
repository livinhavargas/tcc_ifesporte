import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register, { isInstitutionalTrainerEmail } from '../../pages/Register';
import Login from '../../pages/Login';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/register' }),
  useSearchParams: () => [new URLSearchParams('token=token-teste-123')]
}), { virtual: true });

const { sendWelcomeAndVerificationEmail } = require('../../../../server/utils/emailService');

describe('Verificação de E-mail, Reconhecimento @ifc.edu.br e Conformidade LGPD no Cadastro', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Reconhece automaticamente @ifc.edu.br como Treinador e outros domínios como Estudante', () => {
    expect(isInstitutionalTrainerEmail('professor@ifc.edu.br')).toBe(true);
    expect(isInstitutionalTrainerEmail('TREINADOR@IFC.EDU.BR')).toBe(true);
    expect(isInstitutionalTrainerEmail('aluno@gmail.com')).toBe(false);
    expect(isInstitutionalTrainerEmail('aluno@estudante.ifc.edu.br')).toBe(false);
  });

  test('Bloqueia o envio do cadastro na Etapa 3 se os Termos de Uso e Política de Privacidade (LGPD) não forem aceitos', async () => {
    render(<Register />);

    // Etapa 1 com e-mail institucional @ifc.edu.br (reconhecido como Treinador sem seletor manual)
    fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), { target: { value: 'Treinador LGPD' } });
    fireEvent.change(screen.getByPlaceholderText('exemplo@instituicao.edu.br'), { target: { value: 'lgpd@ifc.edu.br' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByPlaceholderText('Repita a senha'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByText(/Próximo/i));

    // Etapa 2 (Treinador - sem Código de Acesso)
    expect(screen.queryByPlaceholderText('Ex: 123')).not.toBeInTheDocument();
    expect(screen.getByText(/Perfil de Treinador confirmado automaticamente/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Próximo/i));

    // Etapa 3 - Tentar finalizar sem aceitar LGPD
    const finishBtn = screen.getByText(/Finalizar Cadastro/i);
    fireEvent.click(finishBtn);

    expect(
      screen.getByText(/É obrigatório aceitar os Termos de Uso e a Política de Privacidade \(LGPD\)/i)
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('Permite ler e aceitar os Termos LGPD no modal, envia aceiteLgpd=true e tipo=Treinador para @ifc.edu.br', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        mensagem: 'Usuário cadastrado com sucesso! Enviamos um e-mail de confirmação para o seu endereço.',
        emailEnviado: true,
        emailSimulado: true
      })
    });

    render(<Register />);

    // Etapa 1
    fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), { target: { value: 'Maria Treinadora' } });
    fireEvent.change(screen.getByPlaceholderText('exemplo@instituicao.edu.br'), { target: { value: 'maria@ifc.edu.br' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByPlaceholderText('Repita a senha'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByText(/Próximo/i));

    // Etapa 2 (Treinador reconhecido pelo @ifc.edu.br)
    fireEvent.click(screen.getByText(/Próximo/i));

    // Abrir modal da LGPD e clicar em "Li e Concordo com os Termos"
    fireEvent.click(screen.getByText(/Ler Termos e Política de Privacidade/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/1\. Finalidade e Necessidade do Tratamento/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Li e Concordo com os Termos/i));

    // Checkbox deve estar marcado
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    // Finalizar cadastro
    fireEvent.click(screen.getByText(/Finalizar Cadastro/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/api/users/register');
    const bodySent = JSON.parse(options.body);
    expect(bodySent.tipo).toBe('Treinador');
    expect(bodySent.aceiteLgpd).toBe(true);
    expect(bodySent.versaoTermos).toBe('1.0');
    expect(bodySent.codigoConvite).toBeUndefined();

    // Redireciona para o Login e exibe a mensagem "Cadastro realizado com Sucesso!" acima do formulário
    expect(sessionStorage.getItem('registerSuccessMessage')).toBe('Cadastro realizado com Sucesso!');
    render(<Login onLogin={jest.fn()} />);
    expect(screen.getByText('Cadastro realizado com Sucesso!')).toBeInTheDocument();
  });

  test('emailService gera URL de verificação de e-mail com token e informações da LGPD', async () => {
    const result = await sendWelcomeAndVerificationEmail({
      to: 'atleta@ifesporte.edu.br',
      nome: 'João Silva',
      tipo: 'estudante',
      verificationToken: 'abc123token',
      lgpdConsentDate: new Date('2026-10-30T12:00:00Z'),
      versaoTermos: '1.0'
    });

    expect(result.sent).toBe(true);
    expect(result.verificationUrl).toContain('/verificar-email?token=abc123token');
  });
});
