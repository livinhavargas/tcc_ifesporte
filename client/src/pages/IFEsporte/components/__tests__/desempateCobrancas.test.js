import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisputaDesempateCobrancas from '../DisputaDesempateCobrancas';
import FutebolFutsalForm from '../FutebolFutsalForm';
import HandebolForm from '../HandebolForm';
import NovaAnalise from '../../NovaAnalise';
import CourseLogo from '../../../../components/CourseLogo';
import EducacaoFisica from '../../EducacaoFisica';

// Mock do react-router-dom
let mockSearchParamModalidade = 'Futsal';
let mockSearchParamGenero = 'Masculino';
let mockParams = {};

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useSearchParams: () => [new URLSearchParams(`modalidade=${mockSearchParamModalidade}&genero=${mockSearchParamGenero}`), jest.fn()],
  useParams: () => mockParams
}), { virtual: true });

const mockStudents = [
  { _id: 'atleta-1', nome: 'Carlos Silva', turma: '1º A', sexo: 'Masculino', modalidades: ['Futsal', 'Futebol', 'Handebol'] },
  { _id: 'atleta-2', nome: 'Mariana Souza', turma: '2º B', sexo: 'Feminino', modalidades: ['Futsal', 'Futebol', 'Handebol'] },
  { _id: 'atleta-3', nome: 'Gabriel Santos', turma: '1º H', sexo: 'Masculino', modalidades: ['Futsal', 'Futebol', 'Handebol'] },
  { _id: 'atleta-4', nome: 'Lucas Oliveira', turma: '2º H', sexo: 'Masculino', modalidades: ['Futsal', 'Futebol', 'Handebol'] }
];

describe('Ajustes no Portal do Treinador — Educação Física e Disputas de Desempate', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('tipo', 'treinador');
    mockSearchParamModalidade = 'Futsal';
    mockSearchParamGenero = 'Masculino';
    mockParams = {};
    global.fetch = jest.fn((url) => {
      if (typeof url === 'string' && url.includes('/api/students')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStudents)
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. EDUCAÇÃO FÍSICA: Hospedagem/Eventos e Edição de Nome da Turma
  // =========================================================================
  describe('1. Educação Física', () => {
    test('1.1. CourseLogo exibe título e alt "Hospedagem/Eventos"', () => {
      const { rerender } = render(<CourseLogo course="hospedagem" />);
      const img1 = screen.getByRole('img');
      expect(img1).toHaveAttribute('title', 'Hospedagem/Eventos');
      expect(img1).toHaveAttribute('alt', 'Logo Hospedagem/Eventos');

      rerender(<CourseLogo course="Hospedagem/Eventos" />);
      const img2 = screen.getByRole('img');
      expect(img2).toHaveAttribute('title', 'Hospedagem/Eventos');
    });

    test('1.1. Tela de Educação Física exibe "Hospedagem/Eventos" e botão de acessar', async () => {
      const mockCourses = [
        {
          nome: 'Hospedagem/Eventos',
          slug: 'hospedagem',
          descricao: 'Curso Técnico Integrado ao Ensino Médio em Hospedagem/Eventos',
          totalTurmas: 2,
          totalAlunos: 40,
          totalRelatorios: 10
        },
        {
          nome: 'Informática para Internet',
          slug: 'informatica-para-internet',
          descricao: 'Curso Técnico Integrado em Informática',
          totalTurmas: 4,
          totalAlunos: 80,
          totalRelatorios: 20
        }
      ];

      global.fetch = jest.fn((url) => {
        if (typeof url === 'string' && url.includes('/api/educacao-fisica/cursos')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCourses) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(<EducacaoFisica />);

      await waitFor(() => {
        expect(screen.getByText('Hospedagem/Eventos')).toBeInTheDocument();
        expect(screen.getByText(/Acessar Turmas de Hospedagem\/Eventos/i)).toBeInTheDocument();
      });
    });

    test('1.2. Permite editar o nome da turma cadastrada e salva com sucesso preservando _id e dados', async () => {
      let putBody = null;
      const mockClassDetail = {
        _id: 'turma-h1',
        curso: 'Hospedagem/Eventos',
        turma: '1º H',
        anoLetivo: '2026',
        horariosSemanais: [{ diaSemana: 'Segunda-feira', horario: '09:00', duracaoMinutos: 45 }],
        relatorios: [{ _id: 'rel-1', data: '2026-10-20', horario: '09:00', conteudo: 'Handebol escolar' }],
        alunos: [mockStudents[2]]
      };

      global.fetch = jest.fn((url, options) => {
        if (typeof url === 'string' && url.includes('/api/educacao-fisica/turma/turma-h1/nome')) {
          putBody = JSON.parse(options.body);
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Nome da turma atualizado com sucesso.', turma: putBody.turma })
          });
        }
        if (typeof url === 'string' && url.includes('/api/educacao-fisica/turma/turma-h1')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockClassDetail) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      // Renderiza com turmaId na URL simulando acesso direto à turma
      jest.spyOn(URLSearchParams.prototype, 'get').mockImplementation((param) => {
        if (param === 'turmaId') return 'turma-h1';
        if (param === 'curso') return 'hospedagem';
        return null;
      });

      render(<EducacaoFisica />);

      await waitFor(() => {
        expect(screen.getByText(/1º H — Hospedagem\/Eventos/i)).toBeInTheDocument();
      });

      // Botão discreto de editar nome
      const editBtn = screen.getByRole('button', { name: /Editar nome da turma/i });
      expect(editBtn).toBeInTheDocument();

      fireEvent.click(editBtn);

      // Campo de edição do nome
      const input = screen.getByLabelText(/Novo nome da turma/i);
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('1º H');

      fireEvent.change(input, { target: { value: '1º H (Vespertino)' } });

      // Salvar
      const saveBtn = screen.getByRole('button', { name: /Salvar/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(putBody).toEqual({ turma: '1º H (Vespertino)' });
      });

      // Interface atualizada imediatamente
      await waitFor(() => {
        expect(screen.getByText(/1º H \(Vespertino\) — Hospedagem\/Eventos/i)).toBeInTheDocument();
      });

      // Histórico de aulas e alunos continuam preservados na tela
      expect(screen.getByText(/Handebol escolar/i)).toBeInTheDocument();

      // Clica na aba de alunos para conferir os vínculos de alunos da turma
      fireEvent.click(screen.getByText(/Alunos da Turma/i));
      expect(screen.getByText(/Gabriel Santos/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 2. DISPUTAS DE DESEMPATE — COBRANÇAS INDIVIDUAIS
  // =========================================================================
  describe('2. Disputas de Desempate (Futsal, Futebol e Handebol)', () => {
    test('2.1 e 2.8. A seção de cobranças de desempate só aparece quando indicado que foi para o desempate', () => {
      const formData = {
        modalidade: 'Futsal',
        categoria: 'Masculino',
        placar: { nos: 2, adv: 2 },
        dadosEspecificos: {
          foiParaPenaltis: false,
          placar1Tempo: { nos: 1, adv: 1 },
          placar2Tempo: { nos: 1, adv: 1 }
        }
      };

      const setFormData = jest.fn();
      const { rerender } = render(
        <FutebolFutsalForm
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      // Desempate desmarcado: seção de pênaltis oculta
      expect(screen.queryByText(/Placar de desempate - Disputa de Pênaltis/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Adicionar Cobrador/i })).not.toBeInTheDocument();

      // Marca o desempate
      const desempateCheckbox = screen.getByRole('checkbox', { name: /Foi para os pênaltis/i });
      fireEvent.click(desempateCheckbox);
      expect(setFormData).toHaveBeenCalled();

      // Rerender com foiParaPenaltis = true
      const formDataComPenaltis = {
        ...formData,
        dadosEspecificos: {
          ...formData.dadosEspecificos,
          foiParaPenaltis: true
        }
      };

      rerender(
        <FutebolFutsalForm
          formData={formDataComPenaltis}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      // Agora a seção de desempate e cobranças deve estar visível
      expect(screen.getByText(/Placar de desempate - Disputa de Pênaltis/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Adicionar Cobrador/i })).toBeInTheDocument();
    });

    test('2.2, 2.3, 2.4. Componente DisputaDesempateCobrancas permite múltiplos participantes, impede repetição, e permite marcar Gol / Não fez gol', () => {
      let currentCobrancas = [];
      const handleChange = jest.fn((newVal) => {
        currentCobrancas = newVal;
      });

      const { rerender } = render(
        <DisputaDesempateCobrancas
          cobrancas={currentCobrancas}
          onChange={handleChange}
          eligibleStudents={mockStudents.filter(s => s.sexo === 'Masculino')}
          modalidade="Futsal"
        />
      );

      // Inicialmente vazio
      expect(screen.getByText(/Nenhum cobrador adicionado/i)).toBeInTheDocument();

      // Clicar em Adicionar Cobrador
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Cobrador/i }));
      expect(handleChange).toHaveBeenCalled();

      // Atualiza props com a 1ª cobrança
      currentCobrancas = [
        { atletaId: 'atleta-1', atletaNome: 'Carlos Silva', resultado: 'Gol' }
      ];

      rerender(
        <DisputaDesempateCobrancas
          cobrancas={currentCobrancas}
          onChange={handleChange}
          eligibleStudents={mockStudents.filter(s => s.sexo === 'Masculino')}
          modalidade="Futsal"
        />
      );

      expect(screen.getByText('1ª Cobrança:')).toBeInTheDocument();
      const selectAtleta1 = screen.getByLabelText(/Atleta cobrança 1/i);
      expect(selectAtleta1.value).toBe('atleta-1');

      const selectResultado1 = screen.getByLabelText(/Resultado cobrança 1/i);
      expect(selectResultado1.value).toBe('Gol');

      // Alterar resultado para "Não fez gol"
      fireEvent.change(selectResultado1, { target: { value: 'Não fez gol' } });
      expect(handleChange).toHaveBeenCalledWith([
        { atletaId: 'atleta-1', atletaNome: 'Carlos Silva', resultado: 'Não fez gol' }
      ]);

      // Adicionar 2ª cobrança
      currentCobrancas = [
        { atletaId: 'atleta-1', atletaNome: 'Carlos Silva', resultado: 'Não fez gol' },
        { atletaId: 'atleta-3', atletaNome: 'Gabriel Santos', resultado: 'Gol' }
      ];

      rerender(
        <DisputaDesempateCobrancas
          cobrancas={currentCobrancas}
          onChange={handleChange}
          eligibleStudents={mockStudents.filter(s => s.sexo === 'Masculino')}
          modalidade="Futsal"
        />
      );

      expect(screen.getByText('2ª Cobrança:')).toBeInTheDocument();

      // Verifica que no dropdown da 2ª cobrança o atleta-1 (Carlos) não aparece duplicado
      const selectAtleta2 = screen.getByLabelText(/Atleta cobrança 2/i);
      const optionsSelect2 = Array.from(selectAtleta2.querySelectorAll('option')).map(o => o.value);
      expect(optionsSelect2).not.toContain('atleta-1');
      expect(optionsSelect2).toContain('atleta-3');
      expect(optionsSelect2).toContain('atleta-4');

      // Remover 1ª cobrança
      const removeBtn1 = screen.getByLabelText(/Remover cobrança 1/i);
      fireEvent.click(removeBtn1);
      expect(handleChange).toHaveBeenCalledWith([
        { atletaId: 'atleta-3', atletaNome: 'Gabriel Santos', resultado: 'Gol' }
      ]);
    });

    test('2.5 e 2.7. Salvar análise de Futsal com cobranças de desempate e recuperar na edição', async () => {
      let postBody = null;
      global.fetch = jest.fn((url, options) => {
        if (typeof url === 'string' && url.includes('/api/students')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStudents) });
        }
        if (options && options.method === 'POST') {
          postBody = JSON.parse(options.body);
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ _id: 'an-pen-1', ...postBody }) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      mockSearchParamModalidade = 'Futsal';
      const { container } = render(<NovaAnalise />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Digite o nome da equipe adversária')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText('Digite o nome da equipe adversária'), {
        target: { value: 'Colégio Rival' }
      });

      fireEvent.change(screen.getByLabelText(/Resultado Final/i), {
        target: { value: 'Vitória' }
      });

      // Ativar desempate (Pênaltis)
      const chk = screen.getByRole('checkbox', { name: /Foi para os pênaltis/i });
      fireEvent.click(chk);

      // Clicar em Adicionar Cobrador
      const addBtn = screen.getByRole('button', { name: /Adicionar Cobrador/i });
      fireEvent.click(addBtn);

      // Define placar dos pênaltis: 3 x 2
      const penaltisNos = screen.getByLabelText('Nossa equipe');
      const penaltisAdv = screen.getByLabelText('Adversário');
      fireEvent.change(penaltisNos, { target: { value: '3' } });
      fireEvent.change(penaltisAdv, { target: { value: '2' } });

      // Salva
      fireEvent.click(screen.getByRole('button', { name: /Salvar Análise/i }));

      await waitFor(() => {
        expect(postBody).not.toBeNull();
      });

      expect(postBody.dadosEspecificos.foiParaPenaltis).toBe(true);
      expect(Array.isArray(postBody.dadosEspecificos.penaltisCobrancas)).toBe(true);
      expect(postBody.dadosEspecificos.penaltisCobrancas.length).toBeGreaterThan(0);
      expect(postBody.dadosEspecificos.penaltisCobrancas[0].resultado).toBe('Gol');
    });

    test('Handebol: Desempate por cobranças de 7 metros utiliza DisputaDesempateCobrancas', async () => {
      mockSearchParamModalidade = 'Handebol';
      const formData = {
        modalidade: 'Handebol',
        categoria: 'Masculino',
        placar: { nos: 20, adv: 20 },
        dadosEspecificos: {
          foiParaPenaltis: true,
          desempateSeteMetrosLista: [
            { atletaId: 'atleta-1', atletaNome: 'Carlos Silva', resultado: 'Gol' },
            { atletaId: 'atleta-3', atletaNome: 'Gabriel Santos', resultado: 'Não fez gol' }
          ]
        }
      };

      const setFormData = jest.fn();
      render(
        <HandebolForm
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      expect(screen.getByText(/Placar de desempate - Cobranças de 7 Metros/i)).toBeInTheDocument();
      expect(screen.getByText('1ª Cobrança:')).toBeInTheDocument();
      expect(screen.getByText('2ª Cobrança:')).toBeInTheDocument();

      const resultadoCob2 = screen.getByLabelText(/Resultado cobrança 2/i);
      expect(resultadoCob2.value).toBe('Não fez gol');
    });
  });
});
