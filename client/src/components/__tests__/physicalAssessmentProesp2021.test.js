import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import PhysicalAssessmentTab from '../PhysicalAssessmentTab';
import {
  calculateAge,
  normalizeGender,
  normalizeAge,
  validateStudentForPROESP,
  calculate6MinTotal,
  classifyPerformanceTest,
  classifyHealthIndicator,
  classifyPROESP,
  PROESP_TABLES,
  IMC_SAUDE_TABLE
} from '../../utils/proespCalculator';

describe('PROESP-Br 2021 - Regras Oficiais, Sexo, Idade e Cálculos', () => {
  describe('1. Validação de Cadastro do Aluno (Sexo e Idade)', () => {
    test('Permite avaliação para estudante com sexo e idade válidos (6 a 17 anos)', () => {
      const student = {
        _id: '123',
        nome: 'João Silva',
        sexo: 'Masculino',
        dataNascimento: '2012-05-10' // 14 anos em 2026
      };
      const validation = validateStudentForPROESP(student, '2026-10-25');
      expect(validation.isValid).toBe(true);
      expect(validation.sexo).toBe('M');
      expect(validation.idade).toBe(14);
    });

    test('Bloqueia avaliação se o sexo estiver ausente ou inválido', () => {
      const studentWithoutSex = {
        _id: '124',
        nome: 'Aluno Sem Sexo',
        dataNascimento: '2012-05-10'
      };
      const val1 = validateStudentForPROESP(studentWithoutSex, '2026-10-25');
      expect(val1.isValid).toBe(false);
      expect(val1.message).toContain('sexo/gênero');

      const studentOtherSex = {
        _id: '125',
        nome: 'Aluno Outro',
        sexo: 'Outro',
        dataNascimento: '2012-05-10'
      };
      const val2 = validateStudentForPROESP(studentOtherSex, '2026-10-25');
      expect(val2.isValid).toBe(false);
      expect(val2.message).toContain('sexo/gênero');
    });

    test('Bloqueia avaliação se a data de nascimento estiver ausente', () => {
      const studentWithoutBirthDate = {
        _id: '126',
        nome: 'Sem Data Nasc',
        sexo: 'Feminino'
      };
      const val = validateStudentForPROESP(studentWithoutBirthDate, '2026-10-25');
      expect(val.isValid).toBe(false);
      expect(val.message).toContain('data de nascimento');
    });

    test('Bloqueia avaliação se a idade estiver fora da faixa oficial do PROESP-Br (6 a 17 anos)', () => {
      // 5 anos
      const student5 = {
        _id: '127',
        nome: 'Criança 5 anos',
        sexo: 'Masculino',
        dataNascimento: '2021-05-10'
      };
      const val5 = validateStudentForPROESP(student5, '2026-10-25');
      expect(val5.isValid).toBe(false);
      expect(val5.message).toContain('fora da faixa etária');

      // 18 anos
      const student18 = {
        _id: '128',
        nome: 'Jovem 18 anos',
        sexo: 'Feminino',
        dataNascimento: '2008-05-10'
      };
      const val18 = validateStudentForPROESP(student18, '2026-10-25');
      expect(val18.isValid).toBe(false);
      expect(val18.message).toContain('fora da faixa etária');
    });

    test('normalizeAge não faz clamp silencioso para idades fora de 6-17', () => {
      expect(normalizeAge(5)).toBeNull();
      expect(normalizeAge(18)).toBeNull();
      expect(normalizeAge(6)).toBe(6);
      expect(normalizeAge(17)).toBe(17);
    });

    test('normalizeGender aceita somente masculino e feminino com segurança', () => {
      expect(normalizeGender('Masculino')).toBe('M');
      expect(normalizeGender('MASC')).toBe('M');
      expect(normalizeGender('M')).toBe('M');
      expect(normalizeGender('Feminino')).toBe('F');
      expect(normalizeGender('FEM')).toBe('F');
      expect(normalizeGender('F')).toBe('F');
      expect(normalizeGender('Outro')).toBeNull();
      expect(normalizeGender(null)).toBeNull();
      expect(normalizeGender(undefined)).toBeNull();
    });
  });

  describe('2. Teste de Corrida/Caminhada de 6 Minutos (Protocolo Oficial)', () => {
    test('Calcula automaticamente a distância total: (Voltas * Pista) + Última Volta', () => {
      // 6 voltas em pista de 200m + 80m da última volta = 1280 m
      expect(calculate6MinTotal(6, 200, 80)).toBe(1280);
      // 5 voltas em pista de 400m + 150m da última volta = 2150 m
      expect(calculate6MinTotal(5, 400, 150)).toBe(2150);
      // 0 voltas + 100m da última volta = 100 m
      expect(calculate6MinTotal(0, 200, 100)).toBe(100);
    });

    test('Valida que última volta deve ser menor que a pista e não aceita valores negativos', () => {
      // Última volta igual ao perímetro da pista é inválida (equivale a mais uma volta completa)
      expect(calculate6MinTotal(5, 200, 200)).toBeNull();
      // Última volta maior que a pista é inválida
      expect(calculate6MinTotal(5, 200, 250)).toBeNull();
      // Voltas negativas
      expect(calculate6MinTotal(-1, 200, 50)).toBeNull();
      // Última volta negativa
      expect(calculate6MinTotal(5, 200, -10)).toBeNull();
      // Perímetro menor ou igual a zero
      expect(calculate6MinTotal(5, 0, 50)).toBeNull();
    });

    test('Aceita total informado diretamente quando não houver voltas', () => {
      expect(calculate6MinTotal('', '', '', 1150)).toBe(1150);
    });
  });

  describe('3. Auditoria de Classificações Normativas PROESP-Br 2021', () => {
    test('Corrida 6 min: classificação por limites oficiais (Pág. 26)', () => {
      // Rapazes 6 anos: cutoffs [730, 827, 956, 1317]
      expect(classifyPerformanceTest('corrida6Min', 729, 'M', 6)).toBe('Fraco');
      expect(classifyPerformanceTest('corrida6Min', 730, 'M', 6)).toBe('Razoável');
      expect(classifyPerformanceTest('corrida6Min', 826, 'M', 6)).toBe('Razoável');
      expect(classifyPerformanceTest('corrida6Min', 827, 'M', 6)).toBe('Bom');
      expect(classifyPerformanceTest('corrida6Min', 955, 'M', 6)).toBe('Bom');
      expect(classifyPerformanceTest('corrida6Min', 956, 'M', 6)).toBe('Muito bom');
      expect(classifyPerformanceTest('corrida6Min', 1316, 'M', 6)).toBe('Muito bom');
      expect(classifyPerformanceTest('corrida6Min', 1317, 'M', 6)).toBe('Excelência');

      // Moças 6 anos: cutoffs [672, 768, 901, 1277]
      expect(classifyPerformanceTest('corrida6Min', 671, 'F', 6)).toBe('Fraco');
      expect(classifyPerformanceTest('corrida6Min', 672, 'F', 6)).toBe('Razoável');
      expect(classifyPerformanceTest('corrida6Min', 767, 'F', 6)).toBe('Razoável');
      expect(classifyPerformanceTest('corrida6Min', 768, 'F', 6)).toBe('Bom');
      expect(classifyPerformanceTest('corrida6Min', 900, 'F', 6)).toBe('Bom');
      expect(classifyPerformanceTest('corrida6Min', 901, 'F', 6)).toBe('Muito bom');
      expect(classifyPerformanceTest('corrida6Min', 1276, 'F', 6)).toBe('Muito bom');
      expect(classifyPerformanceTest('corrida6Min', 1277, 'F', 6)).toBe('Excelência');
    });

    test('Quadrado 4x4m (Agilidade - menor é melhor, Pág. 31)', () => {
      // Rapazes 6 anos: [6.20, 7.10, 7.60, 8.07]
      expect(classifyPerformanceTest('quadrado4x4', 6.20, 'M', 6)).toBe('Excelência');
      expect(classifyPerformanceTest('quadrado4x4', 6.21, 'M', 6)).toBe('Muito bom');
      expect(classifyPerformanceTest('quadrado4x4', 7.10, 'M', 6)).toBe('Muito bom');
      expect(classifyPerformanceTest('quadrado4x4', 7.11, 'M', 6)).toBe('Bom');
      expect(classifyPerformanceTest('quadrado4x4', 7.60, 'M', 6)).toBe('Bom');
      expect(classifyPerformanceTest('quadrado4x4', 7.61, 'M', 6)).toBe('Razoável');
      expect(classifyPerformanceTest('quadrado4x4', 8.07, 'M', 6)).toBe('Razoável');
      expect(classifyPerformanceTest('quadrado4x4', 8.08, 'M', 6)).toBe('Fraco');
    });

    test('Corrida de 20m (Velocidade - menor é melhor, Pág. 32)', () => {
      // Rapazes 6 anos: [3.61, 4.21, 4.57, 4.94]
      expect(classifyPerformanceTest('corrida20m', 3.61, 'M', 6)).toBe('Excelência');
      expect(classifyPerformanceTest('corrida20m', 3.62, 'M', 6)).toBe('Muito bom');
      expect(classifyPerformanceTest('corrida20m', 4.21, 'M', 6)).toBe('Muito bom');
      expect(classifyPerformanceTest('corrida20m', 4.22, 'M', 6)).toBe('Bom');
      expect(classifyPerformanceTest('corrida20m', 4.57, 'M', 6)).toBe('Bom');
      expect(classifyPerformanceTest('corrida20m', 4.58, 'M', 6)).toBe('Razoável');
      expect(classifyPerformanceTest('corrida20m', 4.94, 'M', 6)).toBe('Razoável');
      expect(classifyPerformanceTest('corrida20m', 4.95, 'M', 6)).toBe('Fraco');
    });

    test('Sentar e Alcançar (Pág. 27)', () => {
      // Rapazes 6 anos: [34.3, 41.3, 50.4, 74.0]
      expect(classifyPerformanceTest('sentarAlcançar', 34.2, 'M', 6)).toBe('Fraco');
      expect(classifyPerformanceTest('sentarAlcançar', 34.3, 'M', 6)).toBe('Razoável');
      expect(classifyPerformanceTest('sentarAlcançar', 41.3, 'M', 6)).toBe('Bom');
      expect(classifyPerformanceTest('sentarAlcançar', 50.4, 'M', 6)).toBe('Muito bom');
      expect(classifyPerformanceTest('sentarAlcançar', 74.0, 'M', 6)).toBe('Excelência');
    });

    test('Abdominais em 1 min (Pág. 28)', () => {
      // Rapazes 6 anos: [18, 23, 28, 39]
      expect(classifyPerformanceTest('abdominais1Min', 17, 'M', 6)).toBe('Fraco');
      expect(classifyPerformanceTest('abdominais1Min', 18, 'M', 6)).toBe('Razoável');
      expect(classifyPerformanceTest('abdominais1Min', 23, 'M', 6)).toBe('Bom');
      expect(classifyPerformanceTest('abdominais1Min', 28, 'M', 6)).toBe('Muito bom');
      expect(classifyPerformanceTest('abdominais1Min', 39, 'M', 6)).toBe('Excelência');
    });

    test('Critérios de Saúde Cardiovascular: IMC (Bergmann 2009 - Pág. 18)', () => {
      // Rapazes 6 anos cutoff: 17.7 (<= é saudável, > é risco)
      expect(classifyHealthIndicator('imc', 17.7, 'M', 6)).toBe('Zona saudável');
      expect(classifyHealthIndicator('imc', 17.8, 'M', 6)).toBe('Zona de risco à saúde');

      // Moças 6 anos cutoff: 17.0
      expect(classifyHealthIndicator('imc', 17.0, 'F', 6)).toBe('Zona saudável');
      expect(classifyHealthIndicator('imc', 17.1, 'F', 6)).toBe('Zona de risco à saúde');
    });

    test('Critérios de Saúde: RCE (Pág. 20) <= 0.50 é saudável, > 0.50 é risco', () => {
      expect(classifyHealthIndicator('rce', 0.50)).toBe('Zona saudável');
      expect(classifyHealthIndicator('rce', 0.51)).toBe('Zona de risco à saúde');
    });

    test('Critérios de Saúde: Corrida 6 min (Pág. 19)', () => {
      // Rapazes 6 anos cutoff: 675
      expect(classifyHealthIndicator('corrida6Min', 675, 'M', 6)).toBe('Zona saudável');
      expect(classifyHealthIndicator('corrida6Min', 674, 'M', 6)).toBe('Zona de risco à saúde');
    });
  });
});

describe('4. Interface do PhysicalAssessmentTab - Verificação dos Botões de Exportar PDF', () => {
  const mockStudent = {
    _id: 'std_01',
    nome: 'Carlos Eduardo',
    sexo: 'Masculino',
    dataNascimento: '2012-04-15',
    modalidades: ['Futsal']
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('O botão duplicado "Exportar PDF" ao lado de "Nova Avaliação" foi REMOVIDO do cabeçalho', () => {
    // Renderiza a aba de aptidão física
    render(
      <PhysicalAssessmentTab 
        student={mockStudent} 
        userType="treinador" 
      />
    );

    // O botão "Nova Avaliação" DEVE existir
    const newEvalButton = screen.getByRole('button', { name: /nova avaliação/i });
    expect(newEvalButton).toBeInTheDocument();

    // No cabeçalho (ao lado de Nova Avaliação), NÃO deve existir botão com texto "Exportar PDF"
    const headerContainer = newEvalButton.parentElement;
    const exportInHeader = headerContainer.querySelector('button[title*="Exportar"]');
    expect(exportInHeader).toBeNull();
  });

  test('Aluno sem sexo ou sem data de nascimento exibe banner de aviso e bloqueia início da avaliação', () => {
    const incompleteStudent = {
      _id: 'std_incomplete',
      nome: 'Aluno Incompleto'
    };

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <PhysicalAssessmentTab 
        student={incompleteStudent} 
        userType="treinador" 
      />
    );

    // Banner de aviso DEVE estar presente
    expect(screen.getByText(/Atenção ao cadastro do aluno/i)).toBeInTheDocument();

    // Ao clicar em Nova Avaliação, deve emitir alerta e não abrir formulário
    const newEvalButton = screen.getByRole('button', { name: /nova avaliação/i });
    fireEvent.click(newEvalButton);

    expect(alertMock).toHaveBeenCalled();
    expect(screen.queryByText(/Testes de Aptidão Física \(PROESP-Br 2021\)/i)).toBeNull();
  });

  test('Preserva o botão de exportar PDF individual nas avaliações já realizadas', async () => {
    const assessmentMock = [{
      _id: 'eval_01',
      dataAvaliacao: '2026-05-10T10:00:00.000Z',
      horario: '10:00',
      modalidade: 'Futsal',
      medidas: { massaCorporal: 55, estatura: 165 },
      calculos: { imc: 20.2, corrida6MinTotal: 1200 },
      classificacoes: {
        desempenho: { corrida6Min: 'Muito bom' },
        saude: { imc: 'Zona saudável' }
      }
    }];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(assessmentMock)
      })
    );

    const { findByRole } = render(
      <PhysicalAssessmentTab 
        student={mockStudent} 
        userType="treinador" 
      />
    );

    // O botão individual de PDF da avaliação deve existir na lista
    const pdfButton = await findByRole('button', { name: /PDF/i });
    expect(pdfButton).toBeInTheDocument();
  });
});
