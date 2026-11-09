import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IMCCard, { calculateIMC } from '../IMCCard';
import Perfil from '../../pages/Perfil';

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mocks do React Router
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/perfil' })
}), { virtual: true });

describe('1. Correção do Resultado do IMC', () => {
  test('calculateIMC calcula valor correto e formata sem vírgula no início', () => {
    // Peso 70kg, Altura 1.75m -> IMC ~ 22.86 -> 22.9
    const imc = calculateIMC(70, 1.75);
    expect(imc).not.toBeNull();
    expect(imc.val).toBe(22.9);
    // NÃO deve começar com vírgula
    expect(imc.formatted.startsWith(',')).toBe(false);
    expect(imc.formatted).toBe('22,9');
    expect(imc.classification).toBe('Saudável');
  });

  test('calculateIMC funciona com altura em centímetros sem vírgula antes do resultado', () => {
    // 60kg, 160cm -> 23.4
    const imc = calculateIMC(60, 160);
    expect(imc).not.toBeNull();
    expect(imc.val).toBe(23.4);
    expect(imc.formatted.startsWith(',')).toBe(false);
    expect(imc.formatted).toBe('23,4');
    expect(imc.classification).toBe('Saudável');
  });

  test('calculateIMC classifica e formata corretamente em todas as faixas', () => {
    // Abaixo de 16.0 -> Necessita Atenção
    const imcBaixo = calculateIMC(40, 1.75); // ~13.1
    expect(imcBaixo.formatted).toBe('13,1');
    expect(imcBaixo.formatted.startsWith(',')).toBe(false);
    expect(imcBaixo.classification).toBe('Necessita Atenção');

    // Entre 16.0 e 18.4 -> Atenção
    const imcAtenBaixo = calculateIMC(52, 1.75); // ~17.0
    expect(imcAtenBaixo.formatted).toBe('17,0');
    expect(imcAtenBaixo.formatted.startsWith(',')).toBe(false);
    expect(imcAtenBaixo.classification).toBe('Atenção');

    // Entre 25.0 e 29.9 -> Atenção
    const imcAtenAlto = calculateIMC(80, 1.75); // ~26.1
    expect(imcAtenAlto.formatted).toBe('26,1');
    expect(imcAtenAlto.formatted.startsWith(',')).toBe(false);
    expect(imcAtenAlto.classification).toBe('Atenção');

    // A partir de 30.0 -> Necessita Atenção
    const imcAlto = calculateIMC(100, 1.75); // ~32.7
    expect(imcAlto.formatted).toBe('32,7');
    expect(imcAlto.formatted.startsWith(',')).toBe(false);
    expect(imcAlto.classification).toBe('Necessita Atenção');
  });

  test('IMCCard exibe o valor formatado sem vírgula inicial na tela', () => {
    const { container } = render(<IMCCard peso={68} altura={1.72} />);
    // 68 / (1.72^2) = 22.98 -> 23.0 -> "23,0"
    expect(screen.getByText('23,0')).toBeInTheDocument();
    expect(screen.queryByText(',23,0')).toBeNull();
    expect(screen.queryByText(',23.0')).toBeNull();
  });
});

describe('2. Opção de Excluir Foto de Perfil no Frontend (Perfil.js)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('userId', 'user123');
    localStorage.setItem('tipo', 'estudante');
    localStorage.setItem('userName', 'João Silva');
    window.confirm = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Não exibe a opção de excluir foto se o usuário não tiver foto cadastrada', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        _id: 'user123',
        nome: 'João Silva',
        email: 'joao@ifesporte.edu.br',
        foto: ''
      })
    });

    render(<Perfil />);

    // Aguarda carregar dados
    await waitFor(() => {
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    });

    // Entra no modo de edição
    fireEvent.click(screen.getByText(/Editar Perfil/i));

    // Como não tem foto, o botão "Excluir foto" NÃO deve estar no documento
    expect(screen.queryByText(/Excluir foto/i)).toBeNull();
    // Mas a opção de adicionar foto deve estar presente
    expect(screen.getByText(/Adicionar foto/i)).toBeInTheDocument();
  });

  test('Exibe a opção de excluir foto quando o usuário possui foto cadastrada', async () => {
    localStorage.setItem('foto', 'data:image/png;base64,samplephoto');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        _id: 'user123',
        nome: 'João Silva',
        email: 'joao@ifesporte.edu.br',
        foto: 'data:image/png;base64,samplephoto'
      })
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Editar Perfil/i));

    // Opções de alterar foto E excluir foto devem estar presentes
    expect(screen.getByText(/Alterar foto/i)).toBeInTheDocument();
    expect(screen.getByText(/Excluir foto/i)).toBeInTheDocument();
  });

  test('Cancela a exclusão se o usuário não confirmar no diálogo', async () => {
    localStorage.setItem('foto', 'data:image/png;base64,samplephoto');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        _id: 'user123',
        nome: 'João Silva',
        email: 'joao@ifesporte.edu.br',
        foto: 'data:image/png;base64,samplephoto'
      })
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Editar Perfil/i));

    // Usuário clica em cancelar no confirm
    window.confirm.mockReturnValue(false);

    const deleteBtn = screen.getByText(/Excluir foto/i);
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('excluir'));
    // Foto deve continuar no localStorage
    expect(localStorage.getItem('foto')).toBe('data:image/png;base64,samplephoto');
  });

  test('Exclui a foto com sucesso após confirmação e atualiza a interface', async () => {
    localStorage.setItem('foto', 'data:image/png;base64,samplephoto');
    
    global.fetch = jest.fn().mockImplementation((url, options) => {
      const urlStr = String(url);
      if (options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ mensagem: 'Foto de perfil excluída com sucesso', foto: '' })
        });
      }
      if (urlStr.includes('physical-assessments')) {
        return Promise.resolve({
          ok: true,
          json: async () => []
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          _id: 'user123',
          nome: 'João Silva',
          email: 'joao@ifesporte.edu.br',
          foto: 'data:image/png;base64,samplephoto'
        })
      });
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Editar Perfil/i));

    // Confirma exclusão
    window.confirm.mockReturnValue(true);

    const deleteBtn = screen.getByText(/Excluir foto/i);
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText(/Foto de perfil excluída com sucesso/i)).toBeInTheDocument();
    });

    // Foto removida do localStorage
    expect(localStorage.getItem('foto')).toBeNull();
    // Botão de excluir foto desaparece
    expect(screen.queryByText(/Excluir foto/i)).toBeNull();
    // Botão de adicionar foto volta a aparecer
    expect(screen.getByText(/Adicionar foto/i)).toBeInTheDocument();
  });

  test('Portal do Treinador: Treinador consegue ver a opção de excluir foto somente quando possui foto', async () => {
    localStorage.setItem('tipo', 'treinador');
    localStorage.setItem('foto', 'data:image/png;base64,coachphoto');

    global.fetch = jest.fn().mockImplementation((url, options) => {
      const urlStr = String(url);
      if (options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ mensagem: 'Foto de perfil excluída com sucesso', foto: '' })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          _id: 'coach123',
          nome: 'Prof. Carlos Silva',
          email: 'carlos@ifesporte.edu.br',
          tipo: 'treinador',
          foto: 'data:image/png;base64,coachphoto'
        })
      });
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Editar Perfil/i));

    expect(screen.getByText(/Alterar foto/i)).toBeInTheDocument();
    expect(screen.getByText(/Excluir foto/i)).toBeInTheDocument();

    window.confirm.mockReturnValue(true);
    fireEvent.click(screen.getByText(/Excluir foto/i));

    await waitFor(() => {
      expect(screen.getByText(/Foto de perfil excluída com sucesso/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('foto')).toBeNull();
  });
});

describe('3. Backend - deleteUserPhoto e updateUser', () => {
  // Teste unitário dos controllers do server
  const { deleteUserPhoto, updateUser } = require('../../../../server/controllers/userController');
  const User = require('../../../../server/models/User');
  const Student = require('../../../../server/models/Student');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deleteUserPhoto remove a foto do usuário e sincroniza com Student se for estudante', async () => {
    const mockUser = {
      _id: 'u1',
      tipo: 'estudante',
      matricula: '2023001',
      email: 'aluno@ifesporte.edu.br',
      foto: 'base64fotodeum',
      save: jest.fn().mockResolvedValue(true)
    };

    const mockStudent = {
      _id: 's1',
      matricula: '2023001',
      foto: 'base64fotodeum',
      save: jest.fn().mockResolvedValue(true)
    };

    jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(Student, 'findOne').mockResolvedValue(mockStudent);

    const req = {
      params: { id: 'u1' },
      userId: 'u1',
      userTipo: 'estudante'
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await deleteUserPhoto(req, res);

    expect(mockUser.foto).toBe('');
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockStudent.foto).toBe('');
    expect(mockStudent.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      mensagem: 'Foto de perfil excluída com sucesso',
      foto: ''
    }));
  });

  test('deleteUserPhoto impede que um usuário comum exclua a foto de outro usuário', async () => {
    const req = {
      params: { id: 'outro-user' },
      userId: 'u1',
      userTipo: 'estudante'
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await deleteUserPhoto(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Acesso negado' });
  });

  test('Exclusão de foto de um usuário não afeta a foto de outro usuário', async () => {
    const mockUser1 = {
      _id: 'u1',
      tipo: 'treinador',
      foto: 'foto-user-1',
      save: jest.fn().mockResolvedValue(true)
    };

    const mockUser2 = {
      _id: 'u2',
      tipo: 'treinador',
      foto: 'foto-user-2-intacta',
      save: jest.fn().mockResolvedValue(true)
    };

    jest.spyOn(User, 'findById').mockImplementation((id) => {
      if (id === 'u1') return Promise.resolve(mockUser1);
      if (id === 'u2') return Promise.resolve(mockUser2);
      return Promise.resolve(null);
    });

    const req = {
      params: { id: 'u1' },
      userId: 'u1',
      userTipo: 'treinador'
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await deleteUserPhoto(req, res);

    // Foto do user 1 foi limpa
    expect(mockUser1.foto).toBe('');
    // Foto do user 2 continua intacta
    expect(mockUser2.foto).toBe('foto-user-2-intacta');
    expect(mockUser2.save).not.toHaveBeenCalled();
  });

  test('updateUser persiste a exclusão da foto quando foto é enviada como string vazia', async () => {
    const mockUser = {
      _id: 'u1',
      tipo: 'treinador',
      foto: 'foto-anterior',
      save: jest.fn().mockResolvedValue(true)
    };

    jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

    const req = {
      params: { id: 'u1' },
      body: {
        foto: ''
      }
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await updateUser(req, res);

    expect(mockUser.foto).toBe('');
    expect(mockUser.save).toHaveBeenCalled();
  });
});
