import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import XadrezForm from '../XadrezForm';
import TenisMesaForm from '../TenisMesaForm';
import BadmintonForm from '../BadmintonForm';

const mockStudents = [
  { _id: 'student-1', nome: 'Carlos Silva', turma: '3A', matricula: '2023001' },
  { _id: 'student-2', nome: 'Mariana Souza', turma: '3B', matricula: '2023002' },
  { _id: 'student-3', nome: 'Lucas Oliveira', turma: '2A', matricula: '2023003' }
];

describe('Correções na Seleção de Atletas — Testes Unitários', () => {

  // ========================================================
  // 1. XADREZ
  // ========================================================
  describe('1. XadrezForm', () => {
    test('Possui apenas uma caixa de seleção para o nosso atleta e uma caixa para o adversário lado a lado', () => {
      let formData = {
        modalidade: 'Xadrez',
        categoria: 'Masculino',
        equipeAdversaria: '',
        resultado: 'Vitória',
        aluno: '',
        atletas: [],
        dadosEspecificos: {}
      };
      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      const { container } = render(
        <XadrezForm
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      // Confirma que os labels "Atleta" e "Adversário" existem
      const labels = Array.from(container.querySelectorAll('label.form-label'));
      const labelTexts = labels.map(l => l.textContent.trim());
      expect(labelTexts).toContain('Atleta *');
      expect(labelTexts).toContain('Adversário *');

      // Confirma que NÃO existe o texto anterior "Nome do Atleta" ou segunda caixa de texto
      expect(screen.queryByPlaceholderText('Informe ou selecione o nome do atleta')).not.toBeInTheDocument();

      // Confirma que o campo do adversário é um input de texto
      const advInput = screen.getByPlaceholderText('Digite o nome do adversário');
      expect(advInput).toBeInTheDocument();
      fireEvent.change(advInput, { target: { value: 'Magnus Carlsen' } });
      expect(setFormData).toHaveBeenCalled();

      // Confirma que o campo Atleta é um select com as opções dos alunos
      const selects = Array.from(container.querySelectorAll('select.form-select'));
      // select[0] é Gênero, select[1] é Atleta
      const atletaSelect = selects[1];
      expect(atletaSelect).toBeInTheDocument();
      expect(screen.getByText('Carlos Silva (3A) · 2023001')).toBeInTheDocument();

      // Seleciona um aluno
      fireEvent.change(atletaSelect, { target: { value: 'student-1' } });
      expect(setFormData).toHaveBeenCalled();
    });
  });

  // ========================================================
  // 2. TÊNIS DE MESA
  // ========================================================
  describe('2. TenisMesaForm', () => {
    test('No formato Individual exibe apenas uma caixa para nosso atleta e oculta o segundo campo', () => {
      let formData = {
        modalidade: 'Tênis de Mesa',
        categoria: 'Masculino',
        equipeAdversaria: '',
        resultado: 'Vitória',
        aluno: '',
        atletas: [],
        dadosEspecificos: { formatoPartida: 'Individual' }
      };
      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      const { container } = render(
        <TenisMesaForm
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      // Deve exibir label "Atleta *" e "Atleta Adversário *"
      const labels = Array.from(container.querySelectorAll('label.form-label')).map(l => l.textContent.trim());
      expect(labels).toContain('Atleta *');
      expect(labels).toContain('Atleta Adversário *');

      // Não deve exibir "1º Atleta" nem "2º Atleta" nem "Dupla Adversária"
      expect(labels.some(l => l.includes('1º Atleta'))).toBe(false);
      expect(labels.some(l => l.includes('2º Atleta'))).toBe(false);
      expect(labels.some(l => l.includes('Dupla Adversária'))).toBe(false);
      expect(screen.queryByPlaceholderText('Informe ou selecione o nome do atleta')).not.toBeInTheDocument();
    });

    test('No formato Em Dupla exibe dois campos para nossos atletas e impede selecionar o mesmo atleta', () => {
      let formData = {
        modalidade: 'Tênis de Mesa',
        categoria: 'Misto',
        equipeAdversaria: '',
        resultado: 'Vitória',
        aluno: 'student-1',
        atletas: ['student-1'],
        dadosEspecificos: {
          formatoPartida: 'Em Dupla',
          atleta1: 'student-1',
          atleta1Nome: 'Carlos Silva'
        }
      };
      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      const { container } = render(
        <TenisMesaForm
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      // Deve exibir 1º Atleta e 2º Atleta
      const labels = Array.from(container.querySelectorAll('label.form-label')).map(l => l.textContent.trim());
      expect(labels.some(l => l.includes('1º Atleta'))).toBe(true);
      expect(labels.some(l => l.includes('2º Atleta'))).toBe(true);
      expect(labels.some(l => l.includes('Dupla Adversária'))).toBe(true);

      // O select do 2º atleta não deve conter o atleta 1 (Carlos Silva) para evitar duplicatas
      const selects = Array.from(container.querySelectorAll('select.form-select'));
      // select[0]=Gênero, select[1]=Formato, select[2]=1º Atleta, select[3]=2º Atleta
      const atleta2Select = selects[3];
      expect(atleta2Select).toBeDefined();

      const optionsInAtleta2 = Array.from(atleta2Select.querySelectorAll('option')).map(o => o.value);
      expect(optionsInAtleta2).not.toContain('student-1');
      expect(optionsInAtleta2).toContain('student-2');
      expect(optionsInAtleta2).toContain('student-3');
    });

    test('Alternância dinâmica de Em Dupla para Individual remove o 2º atleta imediatamente', () => {
      let formData = {
        modalidade: 'Tênis de Mesa',
        categoria: 'Misto',
        equipeAdversaria: 'Adversários',
        resultado: 'Vitória',
        aluno: 'student-1',
        atletas: ['student-1', 'student-2'],
        dadosEspecificos: {
          formatoPartida: 'Em Dupla',
          atleta1: 'student-1',
          atleta1Nome: 'Carlos Silva',
          atleta2: 'student-2',
          atleta2Nome: 'Mariana Souza',
          nomeDupla: 'Carlos Silva e Mariana Souza'
        }
      };
      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });
      const onUpdateDados = jest.fn();

      const { container } = render(
        <TenisMesaForm
          formData={formData}
          setFormData={setFormData}
          onUpdateDados={onUpdateDados}
          students={mockStudents}
        />
      );

      // select[1] é o de Formato
      const allSelects = Array.from(container.querySelectorAll('select.form-select'));
      const selectFormato = allSelects[1];
      fireEvent.change(selectFormato, { target: { value: 'Individual' } });

      // Verifica se a atualização de dados limpou atleta2 e nomeDupla
      expect(onUpdateDados).toHaveBeenCalledWith(expect.objectContaining({
        formatoPartida: 'Individual',
        atleta1: 'student-1',
        atleta2: undefined,
        atleta2Nome: undefined,
        nomeDupla: undefined
      }));
    });
  });

  // ========================================================
  // 3. BADMINTON
  // ========================================================
  describe('3. BadmintonForm', () => {
    test('Exibe o campo Atleta ao lado de Atleta Adversário de forma independente', () => {
      let formData = {
        modalidade: 'Badminton',
        categoria: 'Feminino',
        equipeAdversaria: '',
        resultado: 'Vitória',
        aluno: '',
        atletas: [],
        dadosEspecificos: { formatoPartida: 'Individual' }
      };
      const setFormData = jest.fn((updater) => {
        formData = typeof updater === 'function' ? updater(formData) : updater;
      });

      const { container } = render(
        <BadmintonForm
          formData={formData}
          setFormData={setFormData}
          students={mockStudents}
        />
      );

      // Campo Atleta adicionado e Atleta Adversário mantido
      const labels = Array.from(container.querySelectorAll('label.form-label')).map(l => l.textContent.trim());
      expect(labels).toContain('Atleta *');
      expect(labels).toContain('Atleta Adversário *');

      // Confirma que Atleta é select com a lista de alunos
      const selects = Array.from(container.querySelectorAll('select.form-select'));
      // select[0] é Formato, select[1] é Atleta
      const atletaSelect = selects[1];
      expect(atletaSelect).toBeInTheDocument();
      expect(screen.getByText('Mariana Souza (3B) · 2023002')).toBeInTheDocument();

      // Seleciona um atleta
      fireEvent.change(atletaSelect, { target: { value: 'student-2' } });
      expect(setFormData).toHaveBeenCalled();

      // Digita no atleta adversário
      const advInput = screen.getByPlaceholderText('Digite o nome do atleta adversário');
      fireEvent.change(advInput, { target: { value: 'Adversária de Vitória' } });
      expect(setFormData).toHaveBeenCalled();
    });
  });

});
