import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoleiForm from '../VoleiForm';
import BadmintonForm from '../BadmintonForm';
import Layout from '../../../../components/Layout';
import { ThemeProvider } from '../../../../contexts/ThemeContext';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}), { virtual: true });

describe('Ajustes nas Avaliações Técnicas e Portal do Estudante', () => {

  // ========================================================
  // 1. VOLEIBOL E VÔLEI DE PRAIA
  // ========================================================
  describe('1. Voleibol e Vôlei de Praia — Avaliação Técnica', () => {
    const testCases = [
      { name: 'Voleibol', modalidade: 'Voleibol' },
      { name: 'Vôlei de Praia', modalidade: 'Vôlei de Praia' }
    ];

    testCases.forEach(({ name, modalidade }) => {
      test(`Exibe as 3 escolhas exatas com descrições nos 5 critérios para ${name}`, () => {
        let formData = {
          modalidade,
          categoria: 'Masculino',
          equipeAdversaria: 'Equipe Adversária',
          resultado: 'Vitória',
          aluno: '',
          atletas: [],
          dadosEspecificos: {}
        };
        const setFormData = jest.fn((updater) => {
          formData = typeof updater === 'function' ? updater(formData) : updater;
        });

        render(
          <VoleiForm
            formData={formData}
            setFormData={setFormData}
          />
        );

        // 1.1 Qualidade do Saque
        expect(screen.getByText('Qualidade do Saque')).toBeInTheDocument();
        const saqueOptions = screen.getByText('Qualidade do Saque').closest('div').querySelectorAll('option');
        const saqueTexts = Array.from(saqueOptions).map(o => o.textContent.trim());
        expect(saqueTexts).toEqual([
          'Selecione uma avaliação',
          'Positivo — Ace / Passe quebrado',
          'Médio — Bola viva / Saque fácil',
          'Negativo — Erro (rede/fora)'
        ]);

        // 1.2 Qualidade do Passe
        expect(screen.getByText('Qualidade do Passe')).toBeInTheDocument();
        const passeOptions = screen.getByText('Qualidade do Passe').closest('div').querySelectorAll('option');
        const passeTexts = Array.from(passeOptions).map(o => o.textContent.trim());
        expect(passeTexts).toEqual([
          'Selecione uma avaliação',
          'Positivo — Bola na mão',
          'Médio — Passe quebrado / Bola deslocada',
          'Negativo — Ace sofrido / Overpass (bola de graça)'
        ]);

        // 1.3 Qualidade do Ataque
        expect(screen.getByText('Qualidade do Ataque')).toBeInTheDocument();
        const ataqueOptions = screen.getByText('Qualidade do Ataque').closest('div').querySelectorAll('option');
        const ataqueTexts = Array.from(ataqueOptions).map(o => o.textContent.trim());
        expect(ataqueTexts).toEqual([
          'Selecione uma avaliação',
          'Positivo — Ponto direto / Bloqueio explorado',
          'Médio — Bola defendida / Ataque amortecido',
          'Negativo — Erro (rede/fora) / Toco (bloqueado)'
        ]);

        // 1.4 Qualidade do Levantamento
        expect(screen.getByText('Qualidade do Levantamento')).toBeInTheDocument();
        const levantamentoOptions = screen.getByText('Qualidade do Levantamento').closest('div').querySelectorAll('option');
        const levantamentoTexts = Array.from(levantamentoOptions).map(o => o.textContent.trim());
        expect(levantamentoTexts).toEqual([
          'Selecione uma avaliação',
          'Positivo — Bola na medida / Bloqueio quebrado',
          'Médio — Bola de segurança / Levantamento ajustado',
          'Negativo — Falta / Bola inatacável'
        ]);

        // 1.5 Qualidade do Bloqueio
        expect(screen.getByText('Qualidade do Bloqueio')).toBeInTheDocument();
        const bloqueioOptions = screen.getByText('Qualidade do Bloqueio').closest('div').querySelectorAll('option');
        const bloqueioTexts = Array.from(bloqueioOptions).map(o => o.textContent.trim());
        expect(bloqueioTexts).toEqual([
          'Selecione uma avaliação',
          'Positivo — Toco (stuff block) / Bola amortecida',
          'Médio — Espaço fechado / Ataque direcionado',
          'Negativo — Bloqueio explorado / Falta'
        ]);
      });

      test(`Permite selecionar e registrar as opções da avaliação técnica em ${name}`, () => {
        let formData = {
          modalidade,
          categoria: 'Feminino',
          equipeAdversaria: 'Rival',
          resultado: 'Vitória',
          aluno: '',
          atletas: [],
          dadosEspecificos: {}
        };
        const setFormData = jest.fn((updater) => {
          formData = typeof updater === 'function' ? updater(formData) : updater;
        });

        render(
          <VoleiForm
            formData={formData}
            setFormData={setFormData}
          />
        );

        // Seleciona opção no Saque
        const saqueSelect = screen.getByText('Qualidade do Saque').closest('div').querySelector('select');
        fireEvent.change(saqueSelect, { target: { value: 'Positivo — Ace / Passe quebrado' } });
        expect(setFormData).toHaveBeenCalled();
        expect(formData.dadosEspecificos.qualidadeSaque).toBe('Positivo — Ace / Passe quebrado');

        // Seleciona opção no Bloqueio
        const bloqueioSelect = screen.getByText('Qualidade do Bloqueio').closest('div').querySelector('select');
        fireEvent.change(bloqueioSelect, { target: { value: 'Positivo — Toco (stuff block) / Bola amortecida' } });
        expect(setFormData).toHaveBeenCalled();
        expect(formData.dadosEspecificos.qualidadeBloqueio).toBe('Positivo — Toco (stuff block) / Bola amortecida');
      });
    });
  });

  // ========================================================
  // 2. BADMINTON
  // ========================================================
  describe('2. Badminton — Avaliação Técnica', () => {
    test('Exibe exatamente as 3 opções especificadas em Qualidade do Saque e Qualidade do Ataque', () => {
      let formData = {
        modalidade: 'Badminton',
        categoria: 'Individual Masculino',
        equipeAdversaria: 'Adversário',
        resultado: 'Vitória',
        aluno: '',
        atletas: [],
        dadosEspecificos: {}
      };
      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      render(
        <BadmintonForm
          formData={formData}
          setFormData={setFormData}
          students={[]}
        />
      );

      // 2.1 Qualidade do Saque
      expect(screen.getByText('Qualidade do Saque')).toBeInTheDocument();
      const saqueSelect = screen.getByText('Qualidade do Saque').closest('div').querySelector('select');
      const saqueOptions = Array.from(saqueSelect.querySelectorAll('option')).map(o => o.textContent.trim());
      expect(saqueOptions).toEqual([
        'Selecione uma avaliação',
        'Positivo — Ponto direto',
        'Médio — Saque fácil',
        'Negativo — Erro (rede/fora)'
      ]);
      // Garante que não existem optgroups nem opções extras
      expect(saqueSelect.querySelectorAll('optgroup').length).toBe(0);
      expect(saqueOptions.length).toBe(4); // placeholder + 3 escolhas

      // 2.2 Qualidade do Ataque
      expect(screen.getByText('Qualidade do Ataque')).toBeInTheDocument();
      const ataqueSelect = screen.getByText('Qualidade do Ataque').closest('div').querySelector('select');
      const ataqueOptions = Array.from(ataqueSelect.querySelectorAll('option')).map(o => o.textContent.trim());
      expect(ataqueOptions).toEqual([
        'Selecione uma avaliação',
        'Positivo — Ponto direto',
        'Médio — Ataque amortecido',
        'Negativo — Erro (rede/fora)'
      ]);
      expect(ataqueSelect.querySelectorAll('optgroup').length).toBe(0);
      expect(ataqueOptions.length).toBe(4); // placeholder + 3 escolhas

      // Seleção funciona e atualiza dadosEspecificos
      fireEvent.change(saqueSelect, { target: { value: 'Positivo — Ponto direto' } });
      expect(setFormData).toHaveBeenCalled();
      expect(formData.dadosEspecificos.qualidadeSaque).toBe('Positivo — Ponto direto');

      fireEvent.change(ataqueSelect, { target: { value: 'Médio — Ataque amortecido' } });
      expect(setFormData).toHaveBeenCalled();
      expect(formData.dadosEspecificos.qualidadeAtaque).toBe('Médio — Ataque amortecido');
    });
  });

  // ========================================================
  // 3. PORTAL DO ESTUDANTE — REMOÇÃO DA ABA ANÁLISE
  // ========================================================
  describe('3. Portal do Estudante — Remoção da aba Análise', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('Não exibe a aba ou link de Análise no menu de navegação do estudante', () => {
      localStorage.setItem('tipo', 'Estudante');
      localStorage.setItem('userName', 'João Silva');

      render(
        <ThemeProvider>
          <Layout>
            <div>Conteúdo do Estudante</div>
          </Layout>
        </ThemeProvider>
      );

      // Links esperados para o estudante: Início e Agenda
      expect(screen.getByText('Início')).toBeInTheDocument();
      expect(screen.getByText('Agenda')).toBeInTheDocument();

      // Confirma que Análise / Análises NÃO está presente
      expect(screen.queryByText('Análises')).not.toBeInTheDocument();
      expect(screen.queryByText('Análise')).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /análises/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /análise/i })).not.toBeInTheDocument();
    });
  });

});
