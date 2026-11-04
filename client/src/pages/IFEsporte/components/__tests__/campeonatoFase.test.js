import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NovaAnalise from '../../NovaAnalise';
import VisualizarAnalise from '../../VisualizarAnalise';
import BadmintonForm from '../BadmintonForm';
import TenisMesaForm from '../TenisMesaForm';
import XadrezForm from '../XadrezForm';
import AtletismoForm from '../AtletismoForm';

let mockSearchParamModalidade = 'Futsal';
let mockSearchParamGenero = 'Masculino';
let mockSearchParamSubtipo = '';
let mockParams = {};

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useSearchParams: () => [new URLSearchParams(`modalidade=${mockSearchParamModalidade}&genero=${mockSearchParamGenero}${mockSearchParamSubtipo ? `&subtipo=${mockSearchParamSubtipo}` : ''}`)],
  useParams: () => mockParams
}), { virtual: true });

const mockStudents = [
  { _id: 'st-1', nome: 'Carlos Atleta', turma: '3A', sexo: 'Masculino', modalidades: ['Futsal', 'Futebol', 'Basquete', 'Handebol', 'Voleibol', 'Badminton', 'Tênis de Mesa', 'Xadrez', 'Atletismo'] }
];

describe('Campos Campeonato e Fase na Criação e Consulta de Análises', () => {
  beforeEach(() => {
    mockSearchParamModalidade = 'Futsal';
    mockSearchParamGenero = 'Masculino';
    mockSearchParamSubtipo = '';
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

  describe('1. Modalidades em Equipe (ex: Futsal, Basquete, Futebol, Handebol, Voleibol)', () => {
    test('Exibe campos Campeonato e Fase lado a lado antes de Observações do treinador com opções de equipe', async () => {
      mockSearchParamModalidade = 'Futsal';
      await React.act(async () => {
        render(<NovaAnalise />);
      });

      const campInput = screen.getByPlaceholderText('Nome do campeonato');
      expect(campInput).toBeInTheDocument();
      expect(screen.getByText('Campeonato')).toBeInTheDocument();
      // Não deve exibir (Opcional) no título
      expect(screen.queryByText(/Campeonato.*\(Opcional\)/i)).not.toBeInTheDocument();

      const faseSelect = screen.getByText('Fase').closest('div').querySelector('select');
      expect(faseSelect).toBeInTheDocument();
      expect(screen.getByText('Fase')).toBeInTheDocument();
      expect(screen.queryByText(/Fase.*\(Opcional\)/i)).not.toBeInTheDocument();

      // Opções da Fase para equipe
      const options = Array.from(screen.getByText('Fase').closest('div').querySelectorAll('option')).map(o => o.textContent);
      expect(options).toEqual([
        'Selecione a fase',
        'Fases de classificação',
        'Oitavas de final',
        'Quartas de final',
        'Semifinal',
        'Final'
      ]);

      // Ordem no DOM: Campeonato e Fase antes de Observações do treinador
      const obsHeading = screen.getByText('Observações do treinador');
      expect(campInput.compareDocumentPosition(obsHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    test('Permite preencher ambos os campos e envia no payload', async () => {
      mockSearchParamModalidade = 'Futsal';
      await React.act(async () => {
        render(<NovaAnalise />);
      });

      fireEvent.change(screen.getByPlaceholderText('Nome do campeonato'), { target: { value: 'Jogos Estudantis 2026' } });
      const faseSelect = screen.getByText('Fase').closest('div').querySelector('select');
      fireEvent.change(faseSelect, { target: { value: 'Semifinal' } });

      // Preenche campos obrigatórios de futsal
      fireEvent.change(screen.getByPlaceholderText('Digite o nome da equipe adversária'), { target: { value: 'Time Rival' } });
      const placar1T_nos = screen.getByRole('spinbutton', { name: /^Gols nossa equipe 1º tempo$/i });
      const placar1T_adv = screen.getByRole('spinbutton', { name: /^Gols adversário 1º tempo$/i });
      fireEvent.change(placar1T_nos, { target: { value: '2' } });
      fireEvent.change(placar1T_adv, { target: { value: '1' } });

      const submitBtn = screen.getByRole('button', { name: /Salvar Análise/i });
      await React.act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(global.fetch).toHaveBeenCalled();
      const postCalls = global.fetch.mock.calls.filter(c => c[1]?.method === 'POST');
      expect(postCalls.length).toBe(1);
      const postBody = JSON.parse(postCalls[0][1].body);
      expect(postBody.campeonato).toBe('Jogos Estudantis 2026');
      expect(postBody.fase).toBe('Semifinal');
    });

    test('Permite salvar com apenas o campeonato preenchido ou ambos vazios', async () => {
      mockSearchParamModalidade = 'Futsal';
      await React.act(async () => {
        render(<NovaAnalise />);
      });

      // Apenas campeonato
      fireEvent.change(screen.getByPlaceholderText('Nome do campeonato'), { target: { value: 'Copa Regional' } });
      fireEvent.change(screen.getByPlaceholderText('Digite o nome da equipe adversária'), { target: { value: 'Time Rival' } });
      const placar1T_nos = screen.getByRole('spinbutton', { name: /^Gols nossa equipe 1º tempo$/i });
      const placar1T_adv = screen.getByRole('spinbutton', { name: /^Gols adversário 1º tempo$/i });
      fireEvent.change(placar1T_nos, { target: { value: '2' } });
      fireEvent.change(placar1T_adv, { target: { value: '1' } });

      await React.act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Salvar Análise/i }));
      });

      const postCalls = global.fetch.mock.calls.filter(c => c[1]?.method === 'POST');
      expect(postCalls.length).toBe(1);
      const postBody = JSON.parse(postCalls[0][1].body);
      expect(postBody.campeonato).toBe('Copa Regional');
      expect(postBody.fase).toBe('');
    });
  });

  describe('2. Badminton', () => {
    test('Exibe campos Campeonato e Fase com as opções de modalidades em equipe', () => {
      let formData = {
        modalidade: 'Badminton',
        categoria: 'Geral',
        dadosEspecificos: {},
        campeonato: '',
        fase: ''
      };
      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      render(
        <BadmintonForm
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      expect(screen.getByText('Campeonato')).toBeInTheDocument();
      expect(screen.getByText('Fase')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nome do campeonato')).toBeInTheDocument();

      const options = Array.from(screen.getByText('Fase').closest('div').querySelectorAll('option')).map(o => o.textContent);
      expect(options).toEqual([
        'Selecione a fase',
        'Fases de classificação',
        'Oitavas de final',
        'Quartas de final',
        'Semifinal',
        'Final'
      ]);
    });
  });

  describe('3. Tênis de Mesa', () => {
    test('Exibe opções exclusivas para Tênis de Mesa no campo Fase', () => {
      let formData = {
        modalidade: 'Tênis de Mesa',
        categoria: 'Geral',
        dadosEspecificos: {},
        campeonato: '',
        fase: ''
      };
      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      render(
        <TenisMesaForm
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      expect(screen.getByText('Campeonato')).toBeInTheDocument();
      expect(screen.getByText('Fase')).toBeInTheDocument();

      const options = Array.from(screen.getByText('Fase').closest('div').querySelectorAll('option')).map(o => o.textContent);
      expect(options).toEqual([
        'Selecione a fase',
        'Primeira Rodada',
        'Segunda Rodada',
        'Oitavas de Final',
        'Quartas de Final',
        'Semifinais',
        'Finais'
      ]);

      // Garante que não usou as opções de equipe
      expect(options).not.toContain('Fases de classificação');
      expect(options).not.toContain('Semifinal');
    });
  });

  describe('4. Modalidades Individuais Restantes (Xadrez e Atletismo)', () => {
    test('Xadrez: Exibe apenas o campo Campeonato e NÃO exibe o campo Fase', () => {
      let formData = {
        modalidade: 'Xadrez',
        categoria: 'Geral',
        dadosEspecificos: {},
        campeonato: '',
        fase: ''
      };
      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      render(
        <XadrezForm
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      expect(screen.getByText('Campeonato')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nome do campeonato')).toBeInTheDocument();
      expect(screen.queryByText('Fase')).not.toBeInTheDocument();
    });

    test('Atletismo: Exibe apenas o campo Campeonato e NÃO exibe o campo Fase nas submodalidades', () => {
      let formData = {
        modalidade: 'Atletismo',
        subtipoProva: '100m',
        categoria: 'Geral',
        dadosEspecificos: {},
        campeonato: '',
        fase: ''
      };
      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      render(
        <AtletismoForm
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      expect(screen.getByText('Campeonato')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nome do campeonato')).toBeInTheDocument();
      expect(screen.queryByText('Fase')).not.toBeInTheDocument();
    });
  });

  describe('5. Edição, Consulta e Visualização', () => {
    test('Modo de edição: recupera valores preenchidos anteriormente de campeonato e fase', async () => {
      mockParams = { id: 'analysis-123' };
      global.fetch = jest.fn((url) => {
        if (typeof url === 'string' && url.includes('/api/students')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStudents) });
        }
        if (typeof url === 'string' && url.includes('/api/analysis/analysis-123')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              _id: 'analysis-123',
              modalidade: 'Futsal',
              categoria: 'Masculino',
              campeonato: 'Intercolegial 2026',
              fase: 'Final',
              equipeAdversaria: 'Rival FC',
              resultado: 'Vitória',
              placar: { nos: 3, adv: 1 },
              dadosEspecificos: {}
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      await React.act(async () => {
        render(<NovaAnalise />);
      });

      await waitFor(() => {
        const campInput = screen.getByPlaceholderText('Nome do campeonato');
        expect(campInput.value).toBe('Intercolegial 2026');
        const faseSelect = screen.getByText('Fase').closest('div').querySelector('select');
        expect(faseSelect.value).toBe('Final');
      });
    });

    test('VisualizarAnalise: Exibe campeonato e fase quando preenchidos e botão Exportar PDF', async () => {
      mockParams = { id: 'analysis-456' };
      global.fetch = jest.fn((url) => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            _id: 'analysis-456',
            modalidade: 'Basquetebol',
            categoria: 'Masculino',
            campeonato: 'Torneio Estadual',
            fase: 'Quartas de final',
            equipeAdversaria: 'Colégio Alpha',
            resultado: 'Vitória',
            placar: { nos: 70, adv: 65 },
            dadosEspecificos: {}
          })
        });
      });

      await React.act(async () => {
        render(<VisualizarAnalise />);
      });

      await waitFor(() => {
        expect(screen.getAllByText(/Torneio Estadual/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Quartas de final/i).length).toBeGreaterThan(0);
        expect(screen.getByRole('button', { name: /Exportar PDF/i })).toBeInTheDocument();
      });
    });

    test('VisualizarAnalise: Análise antiga sem campeonato e fase não exibe rótulos vazios', async () => {
      mockParams = { id: 'analysis-legacy' };
      global.fetch = jest.fn((url) => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            _id: 'analysis-legacy',
            modalidade: 'Futsal',
            categoria: 'Masculino',
            equipeAdversaria: 'Colégio Beta',
            resultado: 'Vitória',
            placar: { nos: 4, adv: 2 },
            dadosEspecificos: {}
          })
        });
      });

      await React.act(async () => {
        render(<VisualizarAnalise />);
      });

      await waitFor(() => {
        expect(screen.queryByText(/Campeonato:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Fase:/i)).not.toBeInTheDocument();
      });
    });
  });
});
