import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}), { virtual: true });
import ModalidadePosicaoSelector from '../ModalidadePosicaoSelector';
import {
  SPORT_POSITIONS_MAP,
  FUTEBOL_CATEGORIES,
  getStudentPositionForSport,
  getStudentPositionsForSport,
  isSportWithPositions
} from '../../utils/sportPositions';
import Register from '../../pages/Register';

// Importa também utilitários do servidor para testar validação e sanitização estrita
const {
  validatePosicoesPorModalidade,
  sanitizePosicoesPorModalidade
} = require('../../../../server/utils/sportPositions');

describe('Ajustes no Cadastro de Estudantes e Treinadores', () => {

  describe('1. Múltiplas Posições - Helpers do Frontend (sportPositions.js)', () => {
    test('Identifica corretamente modalidades que possuem posições', () => {
      expect(isSportWithPositions('Basquetebol')).toBe(true);
      expect(isSportWithPositions('Futsal')).toBe(true);
      expect(isSportWithPositions('Futebol')).toBe(true);
      expect(isSportWithPositions('Handebol')).toBe(true);
      expect(isSportWithPositions('Voleibol')).toBe(true);
      expect(isSportWithPositions('Xadrez')).toBe(false);
      expect(isSportWithPositions('Badminton')).toBe(false);
    });

    test('getStudentPositionsForSport retorna array de posições quando atleta tem múltiplas posições', () => {
      const student = {
        posicoesPorModalidade: [
          { modalidade: 'Futsal', posicao: 'Fixo, Ala Direito', posicoes: ['Fixo', 'Ala Direito'] },
          { modalidade: 'Basquetebol', posicao: 'Armador (1)', posicoes: ['Armador (1)'] }
        ]
      };

      expect(getStudentPositionsForSport(student, 'Futsal')).toEqual(['Fixo', 'Ala Direito']);
      expect(getStudentPositionsForSport(student, 'Basquetebol')).toEqual(['Armador (1)']);
      expect(getStudentPositionsForSport(student, 'Handebol')).toEqual([]);
    });

    test('getStudentPositionForSport retorna posições separadas por vírgula para manter compatibilidade', () => {
      const student = {
        posicoesPorModalidade: [
          { modalidade: 'Futsal', posicao: 'Fixo, Ala Direito', posicoes: ['Fixo', 'Ala Direito'] },
          { modalidade: 'Voleibol', posicao: 'Levantador', posicoes: ['Levantador'] }
        ]
      };

      expect(getStudentPositionForSport(student, 'Futsal')).toBe('Fixo, Ala Direito');
      expect(getStudentPositionForSport(student, 'Voleibol')).toBe('Levantador');
    });

    test('Retrocompatibilidade: Trata registros antigos que possuem apenas posicao como string', () => {
      const legacyStudent = {
        posicoesPorModalidade: [
          { modalidade: 'Futebol', posicao: 'Goleiro' },
          { modalidade: 'Handebol', posicao: 'Armador Central, Pivô' }
        ]
      };

      expect(getStudentPositionsForSport(legacyStudent, 'Futebol')).toEqual(['Goleiro']);
      expect(getStudentPositionForSport(legacyStudent, 'Futebol')).toBe('Goleiro');
      expect(getStudentPositionsForSport(legacyStudent, 'Handebol')).toEqual(['Armador Central', 'Pivô']);
      expect(getStudentPositionForSport(legacyStudent, 'Handebol')).toBe('Armador Central, Pivô');
    });

    test('Retorna Indefinido quando modalidade está vinculada mas sem posições definidas', () => {
      const student = {
        modalidades: ['Futsal'],
        posicoesPorModalidade: []
      };

      expect(getStudentPositionsForSport(student, 'Futsal')).toEqual([]);
      expect(getStudentPositionForSport(student, 'Futsal')).toBe('Indefinido');
    });
  });

  describe('2. Múltiplas Posições - Validação e Sanitização do Backend (server/utils/sportPositions.js)', () => {
    test('Valida com sucesso múltiplas posições válidas enviadas no array posicoes', () => {
      const posicoes = [
        { modalidade: 'Futsal', posicoes: ['Fixo', 'Ala Direito', 'Pivô'] },
        { modalidade: 'Handebol', posicoes: ['Goleiro', 'Pivô'] }
      ];
      const result = validatePosicoesPorModalidade(['Futsal', 'Handebol'], posicoes);
      expect(result.isValid).toBe(true);
    });

    test('Rejeita posição inválida dentro de lista múltipla', () => {
      const posicoes = [
        { modalidade: 'Futsal', posicoes: ['Fixo', 'PosicaoInventada'] }
      ];
      const result = validatePosicoesPorModalidade(['Futsal'], posicoes);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('PosicaoInventada');
    });

    test('Sanitiza e sincroniza gerando posicoes (array) e posicao (string retrocompatível)', () => {
      const input = [
        { modalidade: 'Futsal', posicoes: ['Ala Esquerdo', 'Fixo'] },
        { modalidade: 'Basquetebol', posicao: 'Armador (1)' } // formato legado
      ];
      const sanitized = sanitizePosicoesPorModalidade(['Futsal', 'Basquetebol', 'Voleibol'], input);

      expect(sanitized).toHaveLength(3);

      const futsal = sanitized.find(s => s.modalidade === 'Futsal');
      expect(futsal.posicoes).toEqual(['Ala Esquerdo', 'Fixo']);
      expect(futsal.posicao).toBe('Ala Esquerdo, Fixo');

      const basquete = sanitized.find(s => s.modalidade === 'Basquetebol');
      expect(basquete.posicoes).toEqual(['Armador (1)']);
      expect(basquete.posicao).toBe('Armador (1)');

      const volei = sanitized.find(s => s.modalidade === 'Voleibol');
      expect(volei.posicoes).toEqual([]);
      expect(volei.posicao).toBe('Indefinido');
    });
  });

  describe('3. Componente ModalidadePosicaoSelector', () => {
    test('Permite selecionar e desmarcar posições individualmente', () => {
      const handleChange = jest.fn();
      const posicoesPorModalidade = [
        { modalidade: 'Futsal', posicao: 'Fixo', posicoes: ['Fixo'] }
      ];

      const { rerender } = render(
        <ModalidadePosicaoSelector
          selectedModalidades={['Futsal']}
          posicoesPorModalidade={posicoesPorModalidade}
          onChange={handleChange}
        />
      );

      // Deve exibir badge para 'Fixo' com botão de remover
      expect(screen.getByText('Fixo')).toBeInTheDocument();
      expect(screen.getByTitle('Desmarcar Fixo')).toBeInTheDocument();

      // Abrir dropdown
      const trigger = screen.getByText('1 posição(ões) selecionada(s)');
      fireEvent.click(trigger);

      // Clicar em 'Ala Direito' para adicionar segunda posição
      const alaDireitoOption = screen.getByText('Ala Direito');
      fireEvent.click(alaDireitoOption);

      expect(handleChange).toHaveBeenCalledWith([
        {
          modalidade: 'Futsal',
          posicao: 'Fixo, Ala Direito',
          posicoes: ['Fixo', 'Ala Direito']
        }
      ]);

      // Agora simular estado com 2 posições e desmarcar uma pelo botão 'x'
      rerender(
        <ModalidadePosicaoSelector
          selectedModalidades={['Futsal']}
          posicoesPorModalidade={[
            { modalidade: 'Futsal', posicao: 'Fixo, Ala Direito', posicoes: ['Fixo', 'Ala Direito'] }
          ]}
          onChange={handleChange}
        />
      );

      const btnRemoveFixo = screen.getByTitle('Desmarcar Fixo');
      fireEvent.click(btnRemoveFixo);

      expect(handleChange).toHaveBeenLastCalledWith([
        {
          modalidade: 'Futsal',
          posicao: 'Ala Direito',
          posicoes: ['Ala Direito']
        }
      ]);
    });

    test('Agrupa posições do Futebol por categorias existentes', () => {
      const handleChange = jest.fn();
      render(
        <ModalidadePosicaoSelector
          selectedModalidades={['Futebol']}
          posicoesPorModalidade={[]}
          onChange={handleChange}
        />
      );

      // Abrir seletor
      const trigger = screen.getByText('Selecione uma ou mais posições...');
      fireEvent.click(trigger);

      // Verifica presença das categorias oficiais e posições
      expect(screen.getAllByText('Goleiro').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Lateral ou Ala')).toBeInTheDocument();
      expect(screen.getByText('Zagueiro')).toBeInTheDocument();
      expect(screen.getByText('Meio Campista')).toBeInTheDocument();
      expect(screen.getByText('Atacante')).toBeInTheDocument();

      // Verifica posições específicas
      expect(screen.getByText('Zagueiro Lado Direito')).toBeInTheDocument();
      expect(screen.getByText('Centroavante')).toBeInTheDocument();
    });

    test('Modo readOnly renderiza badges de todas as posições selecionadas', () => {
      render(
        <ModalidadePosicaoSelector
          selectedModalidades={['Futsal']}
          posicoesPorModalidade={[
            { modalidade: 'Futsal', posicao: 'Ala Direito, Pivô', posicoes: ['Ala Direito', 'Pivô'] }
          ]}
          readOnly={true}
        />
      );

      expect(screen.getByText('Ala Direito')).toBeInTheDocument();
      expect(screen.getByText('Pivô')).toBeInTheDocument();
      expect(screen.queryByTitle(/Desmarcar/i)).not.toBeInTheDocument();
    });
  });

  describe('4. Remoção do texto "(Opcional)" dos formulários de cadastro (Register.js)', () => {
    test('Não exibe a palavra "(Opcional)" ou "(opcional)" em nenhum rótulo ou título do cadastro', () => {
      render(
        <Register />
      );

      // Avançar para a Etapa 2 para Treinador (usando e-mail institucional @ifc.edu.br)
      fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), { target: { value: 'Treinador Teste' } });
      fireEvent.change(screen.getByPlaceholderText('exemplo@instituicao.edu.br'), { target: { value: 'treinador@ifc.edu.br' } });
      fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: '12345678' } });
      fireEvent.change(screen.getByPlaceholderText('Repita a senha'), { target: { value: '12345678' } });

      const nextButton = screen.getByText(/Próximo/i);
      fireEvent.click(nextButton);

      // Verificar Etapa 2 do Treinador: Telefone não deve ter "(Opcional)" e não deve existir Código de Acesso
      expect(screen.getByText('Telefone')).toBeInTheDocument();
      expect(screen.queryByText(/Código de Acesso/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Telefone \(Opcional\)/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\(Opcional\)/i)).not.toBeInTheDocument();

      // Voltar para a Etapa 1 e informar e-mail de Estudante
      fireEvent.click(screen.getByText(/Voltar/i));
      fireEvent.change(screen.getByPlaceholderText('exemplo@instituicao.edu.br'), { target: { value: 'estudante@gmail.com' } });
      fireEvent.click(screen.getByText(/Próximo/i));

      // Verificar campos da Etapa 2 do Estudante
      expect(screen.getByText('Turma')).toBeInTheDocument();
      expect(screen.getByText('RG')).toBeInTheDocument();
      expect(screen.getByText('Logradouro')).toBeInTheDocument();
      expect(screen.getByText('Peso em kg')).toBeInTheDocument();
      expect(screen.getByText('Altura em metros')).toBeInTheDocument();
      expect(screen.getByText('Nome do Responsável')).toBeInTheDocument();
      expect(screen.getByText('Telefone do Responsável')).toBeInTheDocument();
      expect(screen.getByText('Nº da Camiseta')).toBeInTheDocument();
      expect(screen.getByText('Nº do Calçado')).toBeInTheDocument();
      expect(screen.getByText('Tamanho da Camisa')).toBeInTheDocument();
      expect(screen.getByText('Tamanho do Calção')).toBeInTheDocument();
      expect(screen.getByText('Alergias')).toBeInTheDocument();
      expect(screen.getByText('Lesões Anteriores')).toBeInTheDocument();
      expect(screen.getByText('Restrições Médicas')).toBeInTheDocument();
      expect(screen.getByText('Modalidade(s) de Interesse')).toBeInTheDocument();

      // NENHUM rótulo deve conter "(Opcional)"
      expect(screen.queryByText(/\(Opcional\)/i)).not.toBeInTheDocument();

      // Campos obrigatórios continuam com asterisco
      expect(screen.getByText(/Gênero \*/i)).toBeInTheDocument();
      expect(screen.getByText(/Data de Nascimento \*/i)).toBeInTheDocument();
      expect(screen.getByText(/Matrícula \*/i)).toBeInTheDocument();
      expect(screen.getByText(/Telefone \*/i)).toBeInTheDocument();
      expect(screen.getByText(/CPF \*/i)).toBeInTheDocument();
      expect(screen.getByText(/Cidade \*/i)).toBeInTheDocument();
      expect(screen.getByText(/Estado \*/i)).toBeInTheDocument();
    });
  });
});
