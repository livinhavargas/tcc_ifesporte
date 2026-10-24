import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TempoExtraCard from '../TempoExtraCard';
import FutebolFutsalForm from '../FutebolFutsalForm';
import HandebolForm from '../HandebolForm';
import BasqueteForm from '../BasqueteForm';
import NovaAnalise from '../../NovaAnalise';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useSearchParams: () => [new URLSearchParams('modalidade=Futsal&genero=Masculino')],
  useParams: () => ({})
}), { virtual: true });

const mockStudents = [
  { _id: 'st-1', nome: 'Gabriel Silva', turma: '3A', sexo: 'Masculino' },
  { _id: 'st-2', nome: 'Lucas Rocha', turma: '3B', sexo: 'Masculino' },
  { _id: 'st-3', nome: 'Ana Costa', turma: '2A', sexo: 'Feminino' },
  { _id: 'st-4', nome: 'Beatriz Lima', turma: '2B', sexo: 'Feminino' }
];

describe('Reestruturação da Tela de Criação de Análises — Tempo Extra', () => {

  // ========================================================
  // 1. FUTSAL E FUTEBOL
  // ========================================================
  describe('1. Futsal e Futebol — Tempo Extra e Soma de Placares', () => {
    test('TempoExtraCard renderiza placar independente e critérios técnicos sem campos gerais/resultado final', () => {
      let formData = {
        modalidade: 'Futsal',
        categoria: 'Masculino',
        equipeAdversaria: 'Colégio Rival',
        resultado: 'Vitória',
        placar: { nos: 2, adv: 1 },
        dadosEspecificos: {
          placar1Tempo: { nos: 1, adv: 0 },
          placar2Tempo: { nos: 1, adv: 1 },
          tempoExtra: {}
        }
      };

      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      render(
        <TempoExtraCard
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      // Card Tempo Extra
      expect(screen.getByRole('heading', { name: /Tempo Extra/i })).toBeInTheDocument();
      expect(screen.getByText('Placar do Tempo Extra')).toBeInTheDocument();

      // Confirma que NÃO contém informações gerais nem resultado final
      expect(screen.queryByText('Informações Gerais do Registro')).not.toBeInTheDocument();
      expect(screen.queryByText('Resultado Final')).not.toBeInTheDocument();
      expect(screen.queryByText('Foi para os pênaltis')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Digite o nome da equipe adversária')).not.toBeInTheDocument();

      // Confirma critérios técnicos de Futsal/Futebol
      expect(screen.getByText('Pênaltis (Tempo Extra)')).toBeInTheDocument();
      expect(screen.getByText('Faltas')).toBeInTheDocument();
      expect(screen.getByText('Cartões')).toBeInTheDocument();
    });

    test('Soma automática: Gols no Tempo Extra são somados ao total da partida (2x1 + 1x0 = 3x1)', () => {
      let formData = {
        modalidade: 'Futebol',
        categoria: 'Masculino',
        equipeAdversaria: 'Time B',
        resultado: 'Vitória',
        placar: { nos: 2, adv: 1 },
        dadosEspecificos: {
          placar1Tempo: { nos: 1, adv: 1 },
          placar2Tempo: { nos: 1, adv: 0 },
          tempoExtra: {
            placar: { nos: '', adv: '' }
          }
        }
      };

      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      const { container, rerender } = render(
        <TempoExtraCard
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      // Registrar 1 gol para Nossa Equipe no Tempo Extra
      const nosInput = container.querySelector('input[aria-label="Gols nossa equipe tempo extra"]');
      fireEvent.change(nosInput, { target: { value: '1' } });

      expect(setFormData).toHaveBeenCalled();
      expect(formData.placar).toEqual({ nos: 3, adv: 1 });
      expect(Number(formData.dadosEspecificos.tempoExtra.placar.nos)).toBe(1);

      // Re-renderizar FutebolFutsalForm com os novos dados e conferir o total acumulado
      rerender(
        <FutebolFutsalForm
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      expect(screen.getByText(/3 x 1/)).toBeInTheDocument();
      expect(screen.getByText(/Tempo Regulamentar: 2 x 1 \+ Tempo Extra: 1 x 0/)).toBeInTheDocument();
    });

    test('Alterar e remover gols do Tempo Extra recalcula corretamente e preserva o tempo regulamentar', () => {
      let formData = {
        modalidade: 'Futsal',
        categoria: 'Masculino',
        equipeAdversaria: 'Rival',
        resultado: 'Vitória',
        placar: { nos: 3, adv: 1 },
        dadosEspecificos: {
          placar1Tempo: { nos: 1, adv: 1 },
          placar2Tempo: { nos: 1, adv: 0 },
          tempoExtra: {
            placar: { nos: 1, adv: 0 }
          }
        }
      };

      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      const { container } = render(
        <TempoExtraCard
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      // Alterar gols do adversário no Tempo Extra para 1 (Total deve ir para 3x2)
      const advInput = container.querySelector('input[aria-label="Gols adversário tempo extra"]');
      fireEvent.change(advInput, { target: { value: '1' } });

      expect(formData.placar).toEqual({ nos: 3, adv: 2 });
      expect(formData.dadosEspecificos.placar1Tempo).toEqual({ nos: 1, adv: 1 });
      expect(formData.dadosEspecificos.placar2Tempo).toEqual({ nos: 1, adv: 0 });

      // Remover valores do Tempo Extra (limpar inputs) -> deve voltar para 2x1
      fireEvent.change(advInput, { target: { value: '' } });
      const nosInput = container.querySelector('input[aria-label="Gols nossa equipe tempo extra"]');
      fireEvent.change(nosInput, { target: { value: '' } });

      expect(formData.placar).toEqual({ nos: 2, adv: 1 });
      expect(formData.dadosEspecificos.placar1Tempo).toEqual({ nos: 1, adv: 1 });
      expect(formData.dadosEspecificos.placar2Tempo).toEqual({ nos: 1, adv: 0 });
    });
  });

  // ========================================================
  // 2. HANDEBOL E BASQUETE
  // ========================================================
  describe('2. Handebol e Basquete — Tempo Extra e Critérios Específicos', () => {
    test('Handebol: Card Tempo Extra contém gols 7m, cartões, 2 minutos, e soma gols ao total', () => {
      let formData = {
        modalidade: 'Handebol',
        categoria: 'Masculino',
        equipeAdversaria: 'Equipe H',
        resultado: 'Vitória',
        placar: { nos: 20, adv: 20 },
        dadosEspecificos: {
          placar1Tempo: { nos: 10, adv: 10 },
          placar2Tempo: { nos: 10, adv: 10 },
          tempoExtra: {}
        }
      };

      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      const { container } = render(
        <TempoExtraCard
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      // Confirma critérios específicos do Handebol no Tempo Extra
      expect(screen.getByText('Gols de 7 Metros')).toBeInTheDocument();
      expect(screen.getByText('Punições - Dois Minutos')).toBeInTheDocument();

      // Adicionar 2 gols no tempo extra para nossa equipe
      const nosInput = container.querySelector('input[aria-label="Gols nossa equipe tempo extra"]');
      fireEvent.change(nosInput, { target: { value: '2' } });

      const advInput = container.querySelector('input[aria-label="Gols adversário tempo extra"]');
      fireEvent.change(advInput, { target: { value: '1' } });

      expect(formData.placar).toEqual({ nos: 22, adv: 21 });
      expect(formData.dadosEspecificos.placar1Tempo).toEqual({ nos: 10, adv: 10 });
      expect(formData.dadosEspecificos.placar2Tempo).toEqual({ nos: 10, adv: 10 });
    });

    test('Basquete: Card Tempo Extra contém cestas de 2pts, 3pts, lances livres, faltas, e soma pontos ao total', () => {
      let formData = {
        modalidade: 'Basquete',
        categoria: 'Masculino',
        equipeAdversaria: 'Basquete Club',
        resultado: 'Vitória',
        placar: { nos: 70, adv: 70 },
        dadosEspecificos: {
          placar1Tempo: { nos: 35, adv: 35 },
          placar2Tempo: { nos: 35, adv: 35 },
          tempoExtra: {}
        }
      };

      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      const { container } = render(
        <TempoExtraCard
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      // Confirma critérios específicos do Basquete no Tempo Extra
      expect(screen.getByText('Cestas de 2 Pontos')).toBeInTheDocument();
      expect(screen.getByText('Cestas de 3 Pontos')).toBeInTheDocument();
      expect(screen.getByText('Lances Livres')).toBeInTheDocument();
      expect(screen.getByText('Faltas')).toBeInTheDocument();

      // Adicionar pontuação no tempo extra: 8 x 5
      const nosInput = container.querySelector('input[aria-label="Pontos nossa equipe tempo extra"]');
      fireEvent.change(nosInput, { target: { value: '8' } });

      const advInput = container.querySelector('input[aria-label="Pontos adversário tempo extra"]');
      fireEvent.change(advInput, { target: { value: '5' } });

      expect(formData.placar).toEqual({ nos: 78, adv: 75 });
      expect(formData.dadosEspecificos.placar1Tempo).toEqual({ nos: 35, adv: 35 });
      expect(formData.dadosEspecificos.placar2Tempo).toEqual({ nos: 35, adv: 35 });
    });
  });

  // ========================================================
  // 3. CAMPOS OPCIONAIS E AUSÊNCIA DE RÓTULOS 'OPCIONAL'
  // ========================================================
  describe('3. Campos Opcionais e Integridade', () => {
    test('Não exibe a palavra "Opcional" nem asteriscos nos campos do Tempo Extra', () => {
      const formData = {
        modalidade: 'Futsal',
        categoria: 'Masculino',
        equipeAdversaria: 'Rival',
        resultado: 'Vitória',
        placar: { nos: 2, adv: 1 },
        dadosEspecificos: {
          placar1Tempo: { nos: 1, adv: 0 },
          placar2Tempo: { nos: 1, adv: 1 },
          tempoExtra: {}
        }
      };

      const { container } = render(
        <TempoExtraCard
          formData={formData}
          setFormData={jest.fn()}
          students={mockStudents}
        />
      );

      // Não deve ter a palavra "Opcional"
      expect(screen.queryByText(/Opcional/i)).not.toBeInTheDocument();

      // Não deve ter asteriscos no card de Tempo Extra
      const stars = Array.from(container.querySelectorAll('span')).filter(s => s.textContent === '*');
      expect(stars.length).toBe(0);
    });
  });

  // ========================================================
  // 4. LAYOUT DE 2 COLUNAS EM NOVA ANALISE
  // ========================================================
  describe('4. Layout de 2 Colunas em NovaAnalise', () => {
    test('Para Futsal, renderiza a classe analysis-two-col-layout com Coluna Esquerda e Card Tempo Extra à Direita', async () => {
      // Mock global fetch para students
      global.fetch = jest.fn((url) => {
        if (url.includes('/api/students')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockStudents)
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      let container;
      await React.act(async () => {
        const renderResult = render(<NovaAnalise />);
        container = renderResult.container;
      });

      // Verifica se a classe analysis-two-col-layout existe
      const twoColLayout = container.querySelector('.analysis-two-col-layout');
      expect(twoColLayout).toBeInTheDocument();

      // Verifica as colunas esquerda e direita
      const mainCol = container.querySelector('.analysis-main-column');
      const overtimeCol = container.querySelector('.analysis-overtime-column');

      expect(mainCol).toBeInTheDocument();
      expect(overtimeCol).toBeInTheDocument();

      // Análise normal dentro da coluna principal
      expect(mainCol.querySelector('input[placeholder="Digite o nome da equipe adversária"]')).toBeInTheDocument();

      // Tempo Extra dentro da coluna de tempo extra
      expect(overtimeCol.textContent).toContain('Tempo Extra');
      expect(overtimeCol.textContent).toContain('Placar do Tempo Extra');
    });

    test('Recuperação de dados salvos no Tempo Extra quando editando análise existente', () => {
      const savedFormData = {
        modalidade: 'Futsal',
        categoria: 'Masculino',
        equipeAdversaria: 'Rival',
        resultado: 'Vitória',
        placar: { nos: 4, adv: 2 },
        dadosEspecificos: {
          placar1Tempo: { nos: 2, adv: 1 },
          placar2Tempo: { nos: 1, adv: 1 },
          tempoExtra: {
            placar: { nos: 1, adv: 0 },
            faltasCometidas: 2,
            penaltisDefendidos: 1
          }
        }
      };

      const { container } = render(
        <TempoExtraCard
          formData={savedFormData}
          setFormData={jest.fn()}
          students={mockStudents}
        />
      );

      // Deve recuperar o placar 1 x 0 do Tempo Extra
      const nosInput = container.querySelector('input[aria-label="Gols nossa equipe tempo extra"]');
      const advInput = container.querySelector('input[aria-label="Gols adversário tempo extra"]');
      expect(nosInput.value).toBe('1');
      expect(advInput.value).toBe('0');

      // Deve recuperar as faltas cometidas e pênaltis defendidos
      const faltasCometidasInput = container.querySelector('input[aria-label="Faltas cometidas no tempo extra"]');
      const penaltisDefendidosInput = container.querySelector('input[aria-label="Pênaltis defendidos no tempo extra"]');
      expect(faltasCometidasInput.value).toBe('2');
      expect(penaltisDefendidosInput.value).toBe('1');
    });

    test('Quando Tempo Extra não foi preenchido, os campos aparecem vazios (sem dados inventados)', () => {
      const historicalFormData = {
        modalidade: 'Handebol',
        categoria: 'Masculino',
        equipeAdversaria: 'Rival',
        resultado: 'Vitória',
        placar: { nos: 22, adv: 20 },
        dadosEspecificos: {
          placar1Tempo: { nos: 11, adv: 10 },
          placar2Tempo: { nos: 11, adv: 10 }
          // Sem tempoExtra registrado (análise histórica)
        }
      };

      const { container } = render(
        <TempoExtraCard
          formData={historicalFormData}
          setFormData={jest.fn()}
          students={mockStudents}
        />
      );

      // Campos de placar devem estar vazios com placeholder "0"
      const nosInput = container.querySelector('input[aria-label="Gols nossa equipe tempo extra"]');
      const advInput = container.querySelector('input[aria-label="Gols adversário tempo extra"]');
      expect(nosInput.value).toBe('');
      expect(advInput.value).toBe('');

      // Dois minutos devem estar vazios
      const doisMinNos = container.querySelector('input[aria-label="Dois minutos nossa equipe no tempo extra"]');
      expect(doisMinNos.value).toBe('');
    });
  });
});
