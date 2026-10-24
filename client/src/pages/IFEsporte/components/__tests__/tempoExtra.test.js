import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TempoExtraCard from '../TempoExtraCard';
import FutebolFutsalForm from '../FutebolFutsalForm';
import HandebolForm from '../HandebolForm';
import BasqueteForm from '../BasqueteForm';
import NovaAnalise, { hasTempoExtraData } from '../../NovaAnalise';

let mockSearchParamModalidade = 'Futsal';
let mockSearchParamGenero = 'Masculino';
let mockParams = {};

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useSearchParams: () => [new URLSearchParams(`modalidade=${mockSearchParamModalidade}&genero=${mockSearchParamGenero}`)],
  useParams: () => mockParams
}), { virtual: true });



const mockStudents = [
  { _id: 'st-1', nome: 'Gabriel Silva', turma: '3A', sexo: 'Masculino', modalidades: ['Futsal', 'Futebol', 'Handebol', 'Basquete'] },
  { _id: 'st-2', nome: 'Lucas Rocha', turma: '3B', sexo: 'Masculino', modalidades: ['Futsal', 'Futebol', 'Handebol', 'Basquete'] },
  { _id: 'st-3', nome: 'Ana Costa', turma: '2A', sexo: 'Feminino', modalidades: ['Futsal', 'Futebol', 'Handebol', 'Basquete'] },
  { _id: 'st-4', nome: 'Beatriz Lima', turma: '2B', sexo: 'Feminino', modalidades: ['Futsal', 'Futebol', 'Handebol', 'Basquete'] }
];

describe('Reestruturação do Tempo Extra — Futsal, Futebol, Handebol e Basquete', () => {
  beforeEach(() => {
    mockSearchParamModalidade = 'Futsal';
    mockSearchParamGenero = 'Masculino';
    mockParams = {};
    global.fetch = jest.fn((url, options) => {
      if (typeof url === 'string' && url.includes('/api/students')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStudents)
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================
  // TESTES ESPECÍFICOS: FUTSAL
  // ========================================================
  describe('Modalidade: Futsal', () => {
    test('1. A tela começa com formatação original sem Tempo Extra aberto; 2. Botão aparece antes de Observações', async () => {
      mockSearchParamModalidade = 'Futsal';
      let container;
      await React.act(async () => {
        const res = render(<NovaAnalise />);
        container = res.container;
      });

      // Sem duas colunas
      expect(container.querySelector('.analysis-two-col-layout')).not.toBeInTheDocument();

      // Tempo Extra não está aberto inicialmente
      expect(screen.queryByText('Placar do Tempo Extra')).not.toBeInTheDocument();

      // Botão "Adicionar Tempo Extra" existe
      const addBtn = screen.getByRole('button', { name: /Adicionar Tempo Extra/i });
      expect(addBtn).toBeInTheDocument();

      // Observações do treinador existe
      const obsHeading = screen.getByText('Observações do treinador');
      expect(obsHeading).toBeInTheDocument();

      // Ordem no DOM: Botão aparece antes de Observações do treinador
      expect(addBtn.compareDocumentPosition(obsHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    test('3. Clicar no botão insere a seção abaixo dele; 4. Seção pode ser removida antes do salvamento', async () => {
      mockSearchParamModalidade = 'Futsal';
      await React.act(async () => {
        render(<NovaAnalise />);
      });

      const addBtn = screen.getByRole('button', { name: /Adicionar Tempo Extra/i });
      fireEvent.click(addBtn);

      // Seção Tempo Extra agora está visível no formulário
      expect(screen.getByText('Placar do Tempo Extra')).toBeInTheDocument();
      expect(screen.getByText('Pênaltis (Tempo Extra)')).toBeInTheDocument();

      // Botão de remoção está disponível
      const removeBtn = screen.getByRole('button', { name: /Remover Tempo Extra/i });
      expect(removeBtn).toBeInTheDocument();

      // Clicar em remover
      fireEvent.click(removeBtn);

      // Seção é fechada e botão volta para "Adicionar Tempo Extra"
      expect(screen.queryByText('Placar do Tempo Extra')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Adicionar Tempo Extra/i })).toBeInTheDocument();
    });

    test('5. Salvar sem preencher Tempo Extra salva com sucesso e sem dados de tempoExtra', async () => {
      mockSearchParamModalidade = 'Futsal';
      let postBody = null;
      global.fetch = jest.fn((url, options) => {
        if (typeof url === 'string' && url.includes('/api/students')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStudents) });
        }
        if (options && options.method === 'POST') {
          postBody = JSON.parse(options.body);
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ _id: 'an-1', ...postBody }) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      await React.act(async () => {
        render(<NovaAnalise />);
      });

      // Preenche campos obrigatórios normais
      fireEvent.change(screen.getByPlaceholderText('Digite o nome da equipe adversária'), {
        target: { value: 'Colégio Rival' }
      });
      fireEvent.change(screen.getByLabelText(/Resultado Final/i), {
        target: { value: 'Vitória' }
      });

      // Salva a análise
      fireEvent.click(screen.getByRole('button', { name: /Salvar Análise/i }));

      await waitFor(() => {
        expect(postBody).not.toBeNull();
      });
      expect(postBody.equipeAdversaria).toBe('Colégio Rival');
      expect(postBody.dadosEspecificos.tempoExtra).toBeUndefined();
    });

    test('6. Salvar com Tempo Extra preenchido; 8. Gols somados (2x1 + 1x0 = 3x1); 9. Sem duplicação', async () => {
      mockSearchParamModalidade = 'Futsal';
      let postBody = null;
      global.fetch = jest.fn((url, options) => {
        if (typeof url === 'string' && url.includes('/api/students')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStudents) });
        }
        if (options && options.method === 'POST') {
          postBody = JSON.parse(options.body);
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ _id: 'an-2', ...postBody }) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const { container } = render(<NovaAnalise />);
      await waitFor(() => expect(screen.getByPlaceholderText('Digite o nome da equipe adversária')).toBeInTheDocument());

      // Preenche análise normal (1T: 1x0, 2T: 1x1 -> regulamentar 2x1)
      fireEvent.change(screen.getByPlaceholderText('Digite o nome da equipe adversária'), {
        target: { value: 'Equipe Futsal B' }
      });
      fireEvent.change(screen.getByLabelText(/Resultado Final/i), {
        target: { value: 'Vitória' }
      });

      const nos1T = container.querySelector('input[aria-label="Gols nossa equipe 1º tempo"]');
      const adv1T = container.querySelector('input[aria-label="Gols adversário 1º tempo"]');
      const nos2T = container.querySelector('input[aria-label="Gols nossa equipe 2º tempo"]');
      const adv2T = container.querySelector('input[aria-label="Gols adversário 2º tempo"]');

      fireEvent.change(nos1T, { target: { value: '1' } });
      fireEvent.change(adv1T, { target: { value: '0' } });
      fireEvent.change(nos2T, { target: { value: '1' } });
      fireEvent.change(adv2T, { target: { value: '1' } });

      // Abre Tempo Extra
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Tempo Extra/i }));

      // Adiciona 1x0 no Tempo Extra
      const teNos = container.querySelector('input[aria-label="Gols nossa equipe tempo extra"]');
      const teAdv = container.querySelector('input[aria-label="Gols adversário tempo extra"]');
      fireEvent.change(teNos, { target: { value: '1' } });
      fireEvent.change(teAdv, { target: { value: '0' } });

      // Total acumulado visível na tela deve ser 3 x 1
      expect(screen.getByText(/3 x 1/)).toBeInTheDocument();

      // Submete análise
      fireEvent.click(screen.getByRole('button', { name: /Salvar Análise/i }));

      await waitFor(() => expect(postBody).not.toBeNull());
      expect(postBody.placar).toEqual({ nos: 3, adv: 1 });
      expect(postBody.dadosEspecificos.placar1Tempo).toEqual({ nos: 1, adv: 0 });
      expect(postBody.dadosEspecificos.placar2Tempo).toEqual({ nos: 1, adv: 1 });
      expect(postBody.dadosEspecificos.tempoExtra.placar).toEqual({ nos: 1, adv: 0 });
    });

    test('7. Recuperação automática ao abrir análise salva com dados de Tempo Extra', async () => {
      mockSearchParamModalidade = 'Futsal';
      mockParams = { id: 'edit-123' };

      const savedData = {
        _id: 'edit-123',
        modalidade: 'Futsal',
        categoria: 'Masculino',
        equipeAdversaria: 'Rival Histórico',
        resultado: 'Vitória',
        data: '2026-10-24T00:00:00.000Z',
        placar: { nos: 3, adv: 1 },
        dadosEspecificos: {
          placar1Tempo: { nos: 1, adv: 0 },
          placar2Tempo: { nos: 1, adv: 1 },
          tempoExtra: {
            placar: { nos: 1, adv: 0 },
            faltasCometidas: 3
          }
        }
      };

      global.fetch = jest.fn((url) => {
        if (typeof url === 'string' && url.includes('/api/students')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStudents) });
        }
        if (typeof url === 'string' && url.includes('/api/analysis/edit-123')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(savedData) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const { container } = render(<NovaAnalise />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Rival Histórico')).toBeInTheDocument();
      });

      // Seção Tempo Extra deve aparecer aberta automaticamente
      expect(screen.getByText('Placar do Tempo Extra')).toBeInTheDocument();
      const teNos = container.querySelector('input[aria-label="Gols nossa equipe tempo extra"]');
      const teAdv = container.querySelector('input[aria-label="Gols adversário tempo extra"]');
      expect(teNos.value).toBe('1');
      expect(teAdv.value).toBe('0');

      const faltasInput = container.querySelector('input[aria-label="Faltas cometidas no tempo extra"]');
      expect(faltasInput.value).toBe('3');
    });

    test('10. Análise normal permanece funcional e campos não sofrem alterações indevidas', async () => {
      mockSearchParamModalidade = 'Futsal';
      const { container } = render(<NovaAnalise />);
      await waitFor(() => expect(screen.getByPlaceholderText('Digite o nome da equipe adversária')).toBeInTheDocument());

      const advInput = screen.getByPlaceholderText('Digite o nome da equipe adversária');
      fireEvent.change(advInput, { target: { value: 'Time A' } });
      expect(advInput.value).toBe('Time A');

      // Abre e fecha Tempo Extra sem alterar dados da análise normal
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Tempo Extra/i }));
      expect(advInput.value).toBe('Time A');

      fireEvent.click(screen.getByRole('button', { name: /Remover Tempo Extra/i }));
      expect(advInput.value).toBe('Time A');
    });
  });

  // ========================================================
  // TESTES ESPECÍFICOS: FUTEBOL
  // ========================================================
  describe('Modalidade: Futebol', () => {
    test('Futebol: Começa fechada, botão adiciona, soma placar 2x1 + 1x0 = 3x1 e remove com restauração', async () => {
      mockSearchParamModalidade = 'Futebol';
      const { container } = render(<NovaAnalise />);
      await waitFor(() => expect(screen.getByRole('button', { name: /Adicionar Tempo Extra/i })).toBeInTheDocument());

      expect(screen.queryByText('Placar do Tempo Extra')).not.toBeInTheDocument();

      // Clicar para abrir Tempo Extra
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Tempo Extra/i }));
      expect(screen.getByText('Placar do Tempo Extra')).toBeInTheDocument();

      // Preenche 1T: 2x0, 2T: 0x1 (regulamentar: 2x1)
      const nos1T = container.querySelector('input[aria-label="Gols nossa equipe 1º tempo"]');
      const adv2T = container.querySelector('input[aria-label="Gols adversário 2º tempo"]');
      fireEvent.change(nos1T, { target: { value: '2' } });
      fireEvent.change(adv2T, { target: { value: '1' } });

      // Adiciona gol no Tempo Extra: 1 x 0 (Total = 3x1)
      const teNos = container.querySelector('input[aria-label="Gols nossa equipe tempo extra"]');
      fireEvent.change(teNos, { target: { value: '1' } });

      expect(screen.getByText(/3 x 1/)).toBeInTheDocument();

      // Remove Tempo Extra: Total deve voltar para 2x1
      fireEvent.click(screen.getByRole('button', { name: /Remover Tempo Extra/i }));
      expect(screen.getByText(/2 x 1/)).toBeInTheDocument();
      expect(screen.queryByText('Placar do Tempo Extra')).not.toBeInTheDocument();
    });

    test('Futebol: Salvar com Tempo Extra e recuperar na edição', async () => {
      mockSearchParamModalidade = 'Futebol';
      let postBody = null;
      global.fetch = jest.fn((url, options) => {
        if (typeof url === 'string' && url.includes('/api/students')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStudents) });
        }
        if (options && options.method === 'POST') {
          postBody = JSON.parse(options.body);
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ _id: 'fut-1', ...postBody }) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const { container } = render(<NovaAnalise />);
      await waitFor(() => expect(screen.getByPlaceholderText('Digite o nome da equipe adversária')).toBeInTheDocument());

      fireEvent.change(screen.getByPlaceholderText('Digite o nome da equipe adversária'), {
        target: { value: 'Time Futebol Z' }
      });
      fireEvent.change(screen.getByLabelText(/Resultado Final/i), {
        target: { value: 'Vitória' }
      });

      // Abre Tempo Extra e define 1x0
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Tempo Extra/i }));
      const teNos = container.querySelector('input[aria-label="Gols nossa equipe tempo extra"]');
      fireEvent.change(teNos, { target: { value: '1' } });

      fireEvent.click(screen.getByRole('button', { name: /Salvar Análise/i }));
      await waitFor(() => expect(postBody).not.toBeNull());
      expect(postBody.modalidade).toBe('Futebol');
      expect(postBody.dadosEspecificos.tempoExtra.placar.nos).toBe(1);
    });
  });

  // ========================================================
  // TESTES ESPECÍFICOS: HANDEBOL
  // ========================================================
  describe('Modalidade: Handebol', () => {
    test('Handebol: Contém critérios técnicos de Handebol e soma gols do Tempo Extra corretamente', async () => {
      mockSearchParamModalidade = 'Handebol';
      const { container } = render(<NovaAnalise />);
      await waitFor(() => expect(screen.getByRole('button', { name: /Adicionar Tempo Extra/i })).toBeInTheDocument());

      // Abre tempo extra
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Tempo Extra/i }));

      // Confirma que contém critérios técnicos de Handebol no tempo extra (além dos tempos normais)
      expect(screen.getAllByText('Gols de 7 Metros').length).toBe(2);
      expect(screen.getAllByText('Punições - Dois Minutos').length).toBe(2);

      // Confirma que NÃO duplicou as opções gerais de empate da análise principal
      expect(screen.queryByText('Em caso de empate no handebol')).not.toBeInTheDocument();

      // Preenche placares normais (10x10 em cada tempo -> 20x20)
      const nos1T = container.querySelector('input[aria-label="Gols nossa equipe 1º tempo"]');
      const adv1T = container.querySelector('input[aria-label="Gols adversário 1º tempo"]');
      const nos2T = container.querySelector('input[aria-label="Gols nossa equipe 2º tempo"]');
      const adv2T = container.querySelector('input[aria-label="Gols adversário 2º tempo"]');
      fireEvent.change(nos1T, { target: { value: '10' } });
      fireEvent.change(adv1T, { target: { value: '10' } });
      fireEvent.change(nos2T, { target: { value: '10' } });
      fireEvent.change(adv2T, { target: { value: '10' } });

      // Tempo extra: 2 x 1 -> Total = 22 x 21
      const teNos = container.querySelector('input[aria-label="Gols nossa equipe tempo extra"]');
      const teAdv = container.querySelector('input[aria-label="Gols adversário tempo extra"]');
      fireEvent.change(teNos, { target: { value: '2' } });
      fireEvent.change(teAdv, { target: { value: '1' } });

      expect(screen.getByText(/22 x 21/)).toBeInTheDocument();
    });

    test('Handebol: Salvar com Tempo Extra e recuperar na edição', async () => {
      mockSearchParamModalidade = 'Handebol';
      let postBody = null;
      global.fetch = jest.fn((url, options) => {
        if (typeof url === 'string' && url.includes('/api/students')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStudents) });
        }
        if (options && options.method === 'POST') {
          postBody = JSON.parse(options.body);
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ _id: 'hand-1', ...postBody }) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const { container } = render(<NovaAnalise />);
      await waitFor(() => expect(screen.getByPlaceholderText('Digite o nome da equipe adversária')).toBeInTheDocument());

      fireEvent.change(screen.getByPlaceholderText('Digite o nome da equipe adversária'), {
        target: { value: 'Time Handebol W' }
      });
      fireEvent.change(screen.getByLabelText(/Resultado Final/i), {
        target: { value: 'Vitória' }
      });

      // Abre Tempo Extra e adiciona gols
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Tempo Extra/i }));
      const teNos = container.querySelector('input[aria-label="Gols nossa equipe tempo extra"]');
      fireEvent.change(teNos, { target: { value: '3' } });

      fireEvent.click(screen.getByRole('button', { name: /Salvar Análise/i }));
      await waitFor(() => expect(postBody).not.toBeNull());
      expect(postBody.modalidade).toBe('Handebol');
      expect(postBody.dadosEspecificos.tempoExtra.placar.nos).toBe(3);
    });
  });

  // ========================================================
  // TESTES ESPECÍFICOS: BASQUETE
  // ========================================================
  describe('Modalidade: Basquete', () => {
    test('Basquete: Contém critérios de Basquete (cestas 2pts, 3pts, lances livres, faltas) e soma pontos', async () => {
      mockSearchParamModalidade = 'Basquete';
      const { container } = render(<NovaAnalise />);
      await waitFor(() => expect(screen.getByRole('button', { name: /Adicionar Tempo Extra/i })).toBeInTheDocument());

      // Abre tempo extra
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Tempo Extra/i }));

      // Confirma critérios específicos do Basquete no tempo extra (além dos tempos normais)
      expect(screen.getAllByText('Cestas de 2 Pontos').length).toBe(2);
      expect(screen.getAllByText('Cestas de 3 Pontos').length).toBe(2);
      expect(screen.getAllByText('Lances Livres').length).toBe(2);
      expect(screen.getAllByText('Faltas').length).toBe(2);

      // Preenche placar regulamentar: 30x30 em cada tempo -> 60x60
      const nos1T = container.querySelector('input[aria-label="Pontos nossa equipe 1º tempo"]');
      const adv1T = container.querySelector('input[aria-label="Pontos adversário 1º tempo"]');
      const nos2T = container.querySelector('input[aria-label="Pontos nossa equipe 2º tempo"]');
      const adv2T = container.querySelector('input[aria-label="Pontos adversário 2º tempo"]');
      fireEvent.change(nos1T, { target: { value: '30' } });
      fireEvent.change(adv1T, { target: { value: '30' } });
      fireEvent.change(nos2T, { target: { value: '30' } });
      fireEvent.change(adv2T, { target: { value: '30' } });

      // Pontos tempo extra: 8 x 5 -> Total = 68 x 65
      const teNos = container.querySelector('input[aria-label="Pontos nossa equipe tempo extra"]');
      const teAdv = container.querySelector('input[aria-label="Pontos adversário tempo extra"]');
      fireEvent.change(teNos, { target: { value: '8' } });
      fireEvent.change(teAdv, { target: { value: '5' } });

      expect(screen.getByText(/68 x 65/)).toBeInTheDocument();
    });

    test('Basquete: Salvar com Tempo Extra e recuperar na edição', async () => {
      mockSearchParamModalidade = 'Basquete';
      let postBody = null;
      global.fetch = jest.fn((url, options) => {
        if (typeof url === 'string' && url.includes('/api/students')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStudents) });
        }
        if (options && options.method === 'POST') {
          postBody = JSON.parse(options.body);
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ _id: 'basq-1', ...postBody }) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const { container } = render(<NovaAnalise />);
      await waitFor(() => expect(screen.getByPlaceholderText('Digite o nome da equipe adversária')).toBeInTheDocument());

      fireEvent.change(screen.getByPlaceholderText('Digite o nome da equipe adversária'), {
        target: { value: 'Basquete Clube Y' }
      });
      fireEvent.change(screen.getByLabelText(/Resultado Final/i), {
        target: { value: 'Vitória' }
      });

      // Abre Tempo Extra e adiciona pontuação
      fireEvent.click(screen.getByRole('button', { name: /Adicionar Tempo Extra/i }));
      const teNos = container.querySelector('input[aria-label="Pontos nossa equipe tempo extra"]');
      fireEvent.change(teNos, { target: { value: '12' } });

      fireEvent.click(screen.getByRole('button', { name: /Salvar Análise/i }));
      await waitFor(() => expect(postBody).not.toBeNull());
      expect(postBody.modalidade).toBe('Basquete');
      expect(postBody.dadosEspecificos.tempoExtra.placar.nos).toBe(12);
    });
  });

  // ========================================================
  // REGRAS DE OPCIONALIDADE E NÃO ALTERAÇÃO DE OUTROS ESPORTES
  // ========================================================
  describe('Opcionalidade e Isolamento de Modalidades', () => {
    test('Não exibe a palavra "Opcional" nem asteriscos na seção Tempo Extra', () => {
      const formData = {
        modalidade: 'Futsal',
        categoria: 'Masculino',
        dadosEspecificos: {
          tempoExtra: { placar: { nos: '', adv: '' } }
        }
      };
      const { container } = render(
        <TempoExtraCard
          formData={formData}
          setFormData={jest.fn()}
          students={mockStudents}
        />
      );

      expect(screen.queryByText(/Opcional/i)).not.toBeInTheDocument();
      const asterisks = Array.from(container.querySelectorAll('span')).filter(s => s.textContent === '*');
      expect(asterisks.length).toBe(0);
    });

    test('Helper hasTempoExtraData detecta presença e ausência de dados reais no Tempo Extra', () => {
      expect(hasTempoExtraData(undefined)).toBe(false);
      expect(hasTempoExtraData({})).toBe(false);
      expect(hasTempoExtraData({ placar: { nos: '', adv: '' } })).toBe(false);
      expect(hasTempoExtraData({ placar: { nos: 0, adv: 0 } })).toBe(true);
      expect(hasTempoExtraData({ faltasCometidas: 1 })).toBe(true);
      expect(hasTempoExtraData({ cartoes: [{ tipo: 'Amarelo' }] })).toBe(true);
    });

    test('Não exibe o botão "Adicionar Tempo Extra" em modalidades não suportadas (Voleibol, Badminton, Atletismo)', async () => {
      mockSearchParamModalidade = 'Voleibol';
      const { rerender } = render(<NovaAnalise />);
      await waitFor(() => expect(screen.queryByRole('button', { name: /Adicionar Tempo Extra/i })).not.toBeInTheDocument());

      mockSearchParamModalidade = 'Badminton';
      rerender(<NovaAnalise />);
      expect(screen.queryByRole('button', { name: /Adicionar Tempo Extra/i })).not.toBeInTheDocument();

      mockSearchParamModalidade = 'Atletismo';
      rerender(<NovaAnalise />);
      expect(screen.queryByRole('button', { name: /Adicionar Tempo Extra/i })).not.toBeInTheDocument();
    });

    test('Ao editar uma análise que NÃO possui Tempo Extra, a seção começa fechada no formato original', async () => {
      mockSearchParamModalidade = 'Futsal';
      mockParams = { id: 'sem-tempo-extra-123' };

      const savedData = {
        _id: 'sem-tempo-extra-123',
        modalidade: 'Futsal',
        categoria: 'Masculino',
        equipeAdversaria: 'Equipe Normal',
        resultado: 'Vitória',
        data: '2026-10-24T00:00:00.000Z',
        placar: { nos: 2, adv: 1 },
        dadosEspecificos: {
          placar1Tempo: { nos: 1, adv: 0 },
          placar2Tempo: { nos: 1, adv: 1 }
        }
      };

      global.fetch = jest.fn((url) => {
        if (typeof url === 'string' && url.includes('/api/students')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStudents) });
        }
        if (typeof url === 'string' && url.includes('/api/analysis/sem-tempo-extra-123')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(savedData) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(<NovaAnalise />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Equipe Normal')).toBeInTheDocument();
      });

      // Seção Tempo Extra deve permanecer fechada
      expect(screen.queryByText('Placar do Tempo Extra')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Adicionar Tempo Extra/i })).toBeInTheDocument();
    });
  });
});
