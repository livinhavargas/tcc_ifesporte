/**
 * PROESP-Br (Versão 2021) - Motor de Cálculos e Classificações Normativas (Client)
 * 
 * Baseado no Manual Oficial do Projeto Esporte Brasil (PROESP-Br 2021 - 5ª Edição).
 * Referência: GAYA, A. et al. Projeto Esporte Brasil: Manual de medidas, testes e avaliações. UFRGS, 2021.
 * 
 * - Desempenho Motor: 5 categorias normativas (Fraco, Razoável, Bom, Muito bom, Excelência)
 * - Saúde: Zona Saudável vs Zona de Risco à Saúde (Cardiovascular, Central/Adiposidade, Musculoesquelética, Óssea)
 * - Faixa etária oficial: 6 a 17 anos (estratificado por sexo Masculino e Feminino)
 */

// ==========================================
// 1. CÁLCULO E PARSE ROBUSTO DE IDADE E DATAS
// ==========================================

export function parseDateParts(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return null;
    return {
      year: dateInput.getFullYear(),
      month: dateInput.getMonth(),
      day: dateInput.getDate()
    };
  }
  const str = String(dateInput).trim();
  // Se contiver formato ISO com tempo
  if (str.includes('T')) {
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth(),
      day: d.getUTCDate()
    };
  }
  // YYYY-MM-DD
  const mIso = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (mIso) {
    return {
      year: parseInt(mIso[1], 10),
      month: parseInt(mIso[2], 10) - 1,
      day: parseInt(mIso[3], 10)
    };
  }
  // DD/MM/YYYY
  const mBr = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (mBr) {
    return {
      year: parseInt(mBr[3], 10),
      month: parseInt(mBr[2], 10) - 1,
      day: parseInt(mBr[1], 10)
    };
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate()
  };
}

export function calculateAge(dataNascimento, dataAvaliacao = new Date()) {
  const birth = parseDateParts(dataNascimento);
  const evalDate = parseDateParts(dataAvaliacao);
  if (!birth || !evalDate) return null;

  let age = evalDate.year - birth.year;
  const m = evalDate.month - birth.month;
  if (m < 0 || (m === 0 && evalDate.day < birth.day)) {
    age--;
  }
  return age >= 0 ? age : null;
}

// ==========================================
// 2. NORMALIZAÇÃO DE SEXO E IDADE
// ==========================================

export function normalizeGender(sexo) {
  if (!sexo) return null;
  const s = String(sexo).trim().toUpperCase();
  if (s === 'M' || s.startsWith('MASC') || s === 'HOMEM' || s === 'MASCULINO') return 'M';
  if (s === 'F' || s.startsWith('FEM') || s === 'MULHER' || s === 'FEMININO') return 'F';
  return null;
}

export function normalizeAge(idade) {
  if (idade == null || isNaN(idade)) return null;
  const num = Math.floor(Number(idade));
  // As tabelas oficiais do PROESP-Br 2021 contemplam estritamente idades de 6 a 17 anos.
  if (num < 6 || num > 17) return null;
  return num;
}

// ==========================================
// 3. VALIDAÇÃO DE CADASTRO DO ALUNO PARA PROESP
// ==========================================

export function validateStudentForPROESP(student, dataAvaliacao = new Date()) {
  if (!student) {
    return {
      isValid: false,
      reason: 'sem_aluno',
      message: 'Nenhum aluno foi selecionado para a avaliação física.'
    };
  }

  const normalizedGender = normalizeGender(student.sexo);
  if (!normalizedGender) {
    return {
      isValid: false,
      reason: 'sexo_invalido',
      message: 'O sexo/gênero do aluno está ausente ou inválido no cadastro. Para avaliar a aptidão física segundo as tabelas oficiais do PROESP-Br 2021, é obrigatório preencher o sexo (Masculino ou Feminino) no cadastro do aluno.'
    };
  }

  if (!student.dataNascimento) {
    return {
      isValid: false,
      reason: 'data_nascimento_ausente',
      message: 'A data de nascimento do aluno não está cadastrada. O protocolo oficial do PROESP-Br exige o cálculo exato da idade na data da avaliação. Por favor, preencha a data de nascimento no cadastro do aluno antes de iniciar a avaliação.'
    };
  }

  const age = calculateAge(student.dataNascimento, dataAvaliacao);
  if (age === null) {
    return {
      isValid: false,
      reason: 'idade_invalida',
      message: 'Não foi possível determinar a idade do aluno a partir da data de nascimento informada. Por favor, verifique e corrija a data de nascimento no cadastro do aluno.'
    };
  }

  if (age < 6 || age > 17) {
    return {
      isValid: false,
      reason: 'idade_fora_da_faixa',
      message: `A idade calculada do aluno (${age} anos na data da avaliação) está fora da faixa etária atendida pelas tabelas oficiais do PROESP-Br (6 a 17 anos). O protocolo é validado cientificamente exclusivamente para crianças e adolescentes nessa faixa etária.`
    };
  }

  return {
    isValid: true,
    sexo: normalizedGender,
    idade: age,
    dataNascimento: student.dataNascimento
  };
}

// ==========================================
// 4. CÁLCULOS DERIVADOS E TESTES MOTORES
// ==========================================

export function calculateIMC(massaCorporalKg, estaturaCm) {
  if (!massaCorporalKg || !estaturaCm || Number(massaCorporalKg) <= 0 || Number(estaturaCm) <= 0) return null;
  const massa = Number(massaCorporalKg);
  const estaturaMetros = Number(estaturaCm) / 100;
  const imc = massa / (estaturaMetros * estaturaMetros);
  return Number(imc.toFixed(1));
}

export function calculateRCE(perimetroCinturaCm, estaturaCm) {
  if (!perimetroCinturaCm || !estaturaCm || Number(perimetroCinturaCm) <= 0 || Number(estaturaCm) <= 0) return null;
  const rce = Number(perimetroCinturaCm) / Number(estaturaCm);
  return Number(rce.toFixed(2));
}

/**
 * Corrida/Caminhada de 6 Minutos (PROESP-Br 2021)
 * Protocolo oficial (Págs. 12 e 39):
 * - Resultado avaliado: Distância total percorrida em metros (sem decimais) em 6 minutos fixos.
 * - Registro na ficha: nº de voltas na pista, metros percorridos na última volta incompleta e Total em m.
 * - Fórmula: Total = (voltas * perimetroPista) + metrosUltimaVolta
 * - Validações: voltas >= 0, perimetroPista > 0, 0 <= metrosUltimaVolta < perimetroPista.
 */
export function calculate6MinTotal(voltas, perimetroPista, metrosUltimaVolta, totalMetrosDireto) {
  const hasVoltas = voltas !== null && voltas !== undefined && voltas !== '';
  const hasUltima = metrosUltimaVolta !== null && metrosUltimaVolta !== undefined && metrosUltimaVolta !== '';
  const hasTotal = totalMetrosDireto !== null && totalMetrosDireto !== undefined && totalMetrosDireto !== '';

  if (!hasVoltas && !hasUltima && hasTotal) {
    const t = Number(totalMetrosDireto);
    return (!isNaN(t) && t > 0) ? Math.round(t) : null;
  }

  const v = hasVoltas ? Number(voltas) : 0;
  const p = (perimetroPista !== null && perimetroPista !== undefined && perimetroPista !== '') ? Number(perimetroPista) : 200;
  const u = hasUltima ? Number(metrosUltimaVolta) : 0;

  if (isNaN(v) || isNaN(p) || isNaN(u)) return null;
  if (v < 0 || p <= 0 || u < 0) return null;
  if (p > 0 && u >= p) return null; // Metros da última volta deve ser menor que a pista
  if (v === 0 && u === 0) return null;

  return Math.round((v * p) + u);
}

export function calculateBestAttempt(t1, t2, isLowerBetter = false) {
  const val1 = t1 !== null && t1 !== undefined && t1 !== '' ? Number(t1) : null;
  const val2 = t2 !== null && t2 !== undefined && t2 !== '' ? Number(t2) : null;

  if (val1 !== null && !isNaN(val1) && (val2 === null || isNaN(val2))) return val1;
  if (val2 !== null && !isNaN(val2) && (val1 === null || isNaN(val1))) return val2;
  if (val1 === null || isNaN(val1) || val2 === null || isNaN(val2)) return null;

  return isLowerBetter ? Math.min(val1, val2) : Math.max(val1, val2);
}

// ==========================================
// 5. TABELAS NORMATIVAS OFICIAIS PROESP-BR 2021
// Estratificadas por Sexo e Idade (6 a 17 anos)
// ==========================================

export const PROESP_TABLES = {
  // 1. Flexibilidade: Sentar e Alcançar (cm) - Pág. 27 e Pág. 21 (Saúde)
  sentarAlcançar: {
    isLowerBetter: false,
    M: {
      6: [34.3, 41.3, 50.4, 74],
      7: [33.3, 39.7, 48, 68.5],
      8: [32.3, 38.4, 46, 64],
      9: [31.3, 37.2, 44.6, 61.5],
      10: [30.4, 36.5, 43.9, 60.8],
      11: [29.8, 35.7, 43, 59.3],
      12: [29.4, 35.2, 42.2, 57.9],
      13: [29.1, 35.3, 42.9, 60.6],
      14: [28.7, 35.7, 44.8, 67.2],
      15: [28.4, 36.4, 47, 73.8],
      16: [28.4, 36.8, 48.1, 76.6],
      17: [28.7, 36.9, 48, 76.2],
    },
    F: {
      6: [37, 43.9, 52.6, 73.4],
      7: [35.3, 41.9, 50, 69.1],
      8: [33.8, 40.1, 47.9, 65.7],
      9: [32.4, 38.7, 46.3, 63.6],
      10: [31.3, 37.6, 45.4, 62.6],
      11: [30.6, 36.8, 44.3, 61],
      12: [30.4, 36.4, 43.7, 60.1],
      13: [30.3, 36.7, 44.6, 62.9],
      14: [30.1, 37.3, 46.6, 69.5],
      15: [29.6, 37.9, 48.9, 77.1],
      16: [29.2, 37.9, 49.6, 80.1],
      17: [28.9, 37.5, 49, 79],
    },
    // Critério de Saúde (Moreira et al. 2009 - Pág. 21): valor < cutoff -> Risco | >= cutoff -> Saudável
    saudeCutoff: {
      M: { 6: 29.0, 7: 29.0, 8: 32.5, 9: 29.0, 10: 29.5, 11: 29.5, 12: 29.5, 13: 26.5, 14: 30.5, 15: 31.0, 16: 34.5, 17: 34.0 },
      F: { 6: 40.5, 7: 40.5, 8: 39.5, 9: 35.0, 10: 36.5, 11: 34.5, 12: 39.5, 13: 38.5, 14: 38.5, 15: 38.5, 16: 39.5, 17: 39.5 },
    }
  },

  // 2. Resistência Muscular Localizada: Abdominais em 1 Minuto (repetições) - Pág. 28 e Pág. 22 (Saúde)
  abdominais1Min: {
    isLowerBetter: false,
    M: {
      6: [18, 23, 28, 39],
      7: [20, 26, 31, 43],
      8: [23, 28, 34, 46],
      9: [25, 30, 36, 48],
      10: [26, 32, 37, 49],
      11: [27, 33, 39, 50],
      12: [29, 35, 40, 52],
      13: [30, 36, 42, 54],
      14: [32, 38, 44, 57],
      15: [34, 40, 47, 60],
      16: [35, 42, 48, 62],
      17: [36, 43, 49, 63],
    },
    F: {
      6: [17, 22, 27, 37],
      7: [19, 24, 30, 40],
      8: [20, 26, 32, 43],
      9: [21, 27, 33, 45],
      10: [22, 28, 34, 45],
      11: [23, 29, 34, 46],
      12: [23, 29, 35, 46],
      13: [24, 30, 36, 48],
      14: [24, 30, 36, 49],
      15: [24, 30, 36, 49],
      16: [23, 30, 36, 49],
      17: [23, 30, 36, 48],
    },
    // Critério de Saúde (Lemos 2012 - Pág. 22): valor < cutoff -> Risco | >= cutoff -> Saudável
    saudeCutoff: {
      M: { 6: 18, 7: 18, 8: 24, 9: 26, 10: 31, 11: 37, 12: 41, 13: 42, 14: 43, 15: 45, 16: 46, 17: 47 },
      F: { 6: 18, 7: 18, 8: 18, 9: 20, 10: 26, 11: 30, 12: 30, 13: 33, 14: 34, 15: 34, 16: 34, 17: 34 },
    }
  },

  // 3. Força Explosiva de Membros Superiores: Arremesso de Medicine Ball 2kg (cm) - Pág. 29 e Pág. 23 (Saúde)
  arremessoMedicineBall: {
    isLowerBetter: false,
    M: {
      6: [136.2, 155, 180.4, 249],
      7: [154.9, 175.6, 201.4, 261.4],
      8: [173.4, 195.9, 223.3, 284.3],
      9: [192.2, 216.8, 247, 315.3],
      10: [209.2, 235.7, 268.8, 345.4],
      11: [230.1, 259.2, 295.1, 376.8],
      12: [255.2, 287.7, 327.4, 416.2],
      13: [295.6, 334, 380, 479.7],
      14: [348.5, 394, 446.5, 554.5],
      15: [405.1, 456.1, 513, 623.5],
      16: [448.3, 501.6, 560.1, 670.9],
      17: [486.8, 541.2, 600.2, 710.4],
    },
    F: {
      6: [129.7, 146.7, 167.5, 214.9],
      7: [141.7, 160, 182.1, 230.5],
      8: [156.6, 176.5, 200.4, 252.2],
      9: [174.1, 195.9, 222.2, 279.6],
      10: [191.9, 215.6, 244.4, 308.1],
      11: [214.3, 240.3, 271.9, 341.9],
      12: [236.8, 265.1, 299, 372.2],
      13: [261.3, 292.2, 328.3, 403.5],
      14: [283.5, 316.6, 354.5, 431.8],
      15: [299.9, 334.2, 373.5, 452.9],
      16: [309.7, 344.7, 385.1, 468.1],
      17: [318.4, 353.8, 395.6, 484.1],
    },
    // Critério de Saúde Óssea (Mello 2020 - Pág. 23): valor < cutoff -> Risco | >= cutoff -> Saudável
    saudeCutoff: {
      M: { 6: 147.0, 7: 168.7, 8: 190.0, 9: 210.0, 10: 232.0, 11: 260.0, 12: 290.0, 13: 335.0, 14: 400.0, 15: 440.0, 16: 480.0, 17: 500.0 },
      F: { 6: 125.0, 7: 140.0, 8: 158.1, 9: 175.0, 10: 202.0, 11: 228.0, 12: 260.0, 13: 280.0, 14: 290.0, 15: 306.0, 16: 310.0, 17: 315.0 },
    }
  },

  // 4. Potência de Membros Inferiores: Salto Horizontal (cm) - Pág. 30
  saltoHorizontal: {
    isLowerBetter: false,
    M: {
      6: [100.1, 111.6, 125.7, 158],
      7: [107.5, 119, 133, 164.2],
      8: [114.7, 126.3, 140.2, 170.7],
      9: [122.2, 134, 147.9, 178.1],
      10: [129.6, 141.6, 155.8, 185.9],
      11: [136.6, 148.9, 163.3, 193.4],
      12: [143.1, 155.9, 170.6, 201.2],
      13: [152.6, 166.2, 181.9, 213.9],
      14: [164, 178.9, 195.8, 230],
      15: [175.3, 191.4, 209.5, 245.6],
      16: [182.6, 199.4, 218.2, 255.3],
      17: [188.5, 205.9, 225.1, 262.6],
    },
    F: {
      6: [88.3, 99.3, 112.9, 143.2],
      7: [96.2, 107.4, 120.9, 151.1],
      8: [103.5, 114.7, 128.4, 158.5],
      9: [110.8, 122.2, 136, 166.3],
      10: [117.7, 129.3, 143.4, 174.1],
      11: [123.9, 135.9, 150.4, 181.8],
      12: [128, 140.4, 155.4, 187.7],
      13: [130.8, 143.8, 159.4, 193.1],
      14: [132, 145.7, 162, 197.4],
      15: [131.8, 146.3, 163.6, 200.8],
      16: [131.2, 146.3, 164.4, 203.3],
      17: [130.5, 146.3, 165.2, 205.7],
    },
  },

  // 5. Agilidade: Teste do Quadrado de 4x4 Metros (segundos - MENOR É MELHOR) - Pág. 31
  // Cutoffs ordenados: [maxExcelencia, maxMuitoBom, maxBom, maxRazoavel]
  quadrado4x4: {
    isLowerBetter: true,
    M: {
      6: [6.2, 7.1, 7.6, 8.07],
      7: [6.01, 6.9, 7.39, 7.85],
      8: [5.85, 6.71, 7.2, 7.65],
      9: [5.69, 6.53, 7, 7.45],
      10: [5.54, 6.35, 6.81, 7.25],
      11: [5.37, 6.15, 6.6, 7.02],
      12: [5.22, 5.98, 6.41, 6.82],
      13: [5.08, 5.8, 6.22, 6.62],
      14: [4.93, 5.62, 6.03, 6.42],
      15: [4.76, 5.42, 5.81, 6.19],
      16: [4.62, 5.24, 5.62, 5.99],
      17: [4.47, 5.07, 5.43, 5.79],
    },
    F: {
      6: [6.67, 7.67, 8.26, 8.85],
      7: [6.32, 7.35, 7.93, 8.47],
      8: [6.09, 7.09, 7.64, 8.15],
      9: [5.97, 6.87, 7.37, 7.85],
      10: [5.81, 6.66, 7.14, 7.6],
      11: [5.67, 6.49, 6.95, 7.39],
      12: [5.61, 6.37, 6.82, 7.27],
      13: [5.47, 6.25, 6.7, 7.15],
      14: [5.32, 6.11, 6.58, 7.05],
      15: [5.21, 6, 6.48, 6.97],
      16: [5.12, 5.92, 6.42, 6.92],
      17: [5.02, 5.84, 6.36, 6.88],
    },
  },

  // 6. Velocidade de Deslocamento: Corrida de 20 Metros (segundos - MENOR É MELHOR) - Pág. 32 e Pág. 24 (Saúde)
  corrida20m: {
    isLowerBetter: true,
    M: {
      6: [3.61, 4.21, 4.57, 4.94],
      7: [3.52, 4.08, 4.42, 4.75],
      8: [3.44, 3.97, 4.28, 4.59],
      9: [3.37, 3.86, 4.15, 4.44],
      10: [3.3, 3.76, 4.03, 4.3],
      11: [3.22, 3.65, 3.91, 4.16],
      12: [3.14, 3.56, 3.8, 4.04],
      13: [3.04, 3.44, 3.68, 3.91],
      14: [2.92, 3.3, 3.54, 3.78],
      15: [2.78, 3.16, 3.39, 3.63],
      16: [2.68, 3.05, 3.28, 3.53],
      17: [2.58, 2.95, 3.19, 3.43],
    },
    F: {
      6: [3.98, 4.56, 4.91, 5.27],
      7: [3.84, 4.39, 4.72, 5.05],
      8: [3.72, 4.23, 4.55, 4.86],
      9: [3.6, 4.09, 4.39, 4.68],
      10: [3.5, 3.97, 4.25, 4.53],
      11: [3.41, 3.86, 4.14, 4.41],
      12: [3.34, 3.79, 4.06, 4.33],
      13: [3.27, 3.73, 4, 4.28],
      14: [3.2, 3.67, 3.96, 4.25],
      15: [3.11, 3.61, 3.91, 4.22],
      16: [3.03, 3.55, 3.87, 4.21],
      17: [2.95, 3.49, 3.83, 4.19],
    },
    // Critério de Saúde Óssea (Mello 2020 - Pág. 24): valor > cutoff -> Risco | <= cutoff -> Saudável
    saudeCutoff: {
      M: { 6: 4.81, 7: 4.52, 8: 4.31, 9: 4.25, 10: 4.09, 11: 4.0, 12: 3.88, 13: 3.72, 14: 3.54, 15: 3.4, 16: 3.28, 17: 3.22 },
      F: { 6: 5.22, 7: 4.88, 8: 4.66, 9: 4.58, 10: 4.44, 11: 4.36, 12: 4.28, 13: 4.17, 14: 4.16, 15: 4.07, 16: 4.01, 17: 3.91 },
    }
  },

  // 7. Aptidão Cardiorrespiratória: Corrida/Caminhada de 6 Minutos (metros) - Pág. 26 e Pág. 19 (Saúde)
  corrida6Min: {
    isLowerBetter: false,
    M: {
      6: [730, 827, 956, 1317],
      7: [752, 849, 975, 1303],
      8: [774, 871, 995, 1301],
      9: [797, 895, 1018, 1310],
      10: [817, 917, 1040, 1323],
      11: [837, 939, 1062, 1339],
      12: [860, 965, 1090, 1367],
      13: [895, 1005, 1136, 1422],
      14: [939, 1058, 1197, 1499],
      15: [986, 1113, 1262, 1585],
      16: [1015, 1149, 1306, 1644],
      17: [1038, 1177, 1341, 1692],
    },
    F: {
      6: [672, 768, 901, 1277],
      7: [691, 780, 892, 1159],
      8: [707, 792, 896, 1132],
      9: [720, 806, 911, 1149],
      10: [729, 819, 932, 1200],
      11: [736, 832, 954, 1251],
      12: [743, 836, 948, 1192],
      13: [749, 840, 948, 1179],
      14: [751, 848, 970, 1257],
      15: [748, 859, 1006, 1391],
      16: [746, 866, 1022, 1402],
      17: [744, 871, 1028, 1390],
    },
    // Critério de Saúde Cardiovascular (Bergmann 2009 / Lorenzi 2006 - Pág. 19): valor < cutoff -> Risco | >= cutoff -> Saudável
    saudeCutoff: {
      M: { 6: 675, 7: 730, 8: 768, 9: 820, 10: 856, 11: 930, 12: 966, 13: 995, 14: 1060, 15: 1130, 16: 1190, 17: 1190 },
      F: { 6: 630, 7: 683, 8: 715, 9: 745, 10: 790, 11: 840, 12: 900, 13: 940, 14: 985, 15: 1005, 16: 1070, 17: 1110 },
    }
  },
};

// Pontos de corte de IMC para Saúde Cardiovascular (PROESP-Br 2021 - Bergmann 2009 - Pág. 18)
// Valores críticos: IMC <= cutoff -> Zona Saudável | IMC > cutoff -> Zona de Risco à Saúde
export const IMC_SAUDE_TABLE = {
  M: { 6: 17.7, 7: 17.8, 8: 19.2, 9: 19.3, 10: 20.7, 11: 22.1, 12: 22.2, 13: 22.0, 14: 22.2, 15: 23.0, 16: 24.0, 17: 25.4 },
  F: { 6: 17.0, 7: 17.1, 8: 18.2, 9: 19.1, 10: 20.9, 11: 22.3, 12: 22.6, 13: 22.0, 14: 22.0, 15: 22.4, 16: 24.0, 17: 24.0 },
};

// ==========================================
// 6. MOTOR DE CLASSIFICAÇÃO
// ==========================================

export function classifyPerformanceTest(testKey, value, sexo, idade) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Dados insuficientes para classificação';
  }

  const gender = normalizeGender(sexo);
  const age = normalizeAge(idade);

  if (!gender || age === null) {
    return 'Dados insuficientes para classificação';
  }

  const testConfig = PROESP_TABLES[testKey];
  if (!testConfig || !testConfig[gender] || !testConfig[gender][age]) {
    return 'Dados insuficientes para classificação';
  }

  const cutoffs = testConfig[gender][age];
  const val = Number(value);

  if (testConfig.isLowerBetter) {
    // Menor é melhor (ex: Agilidade 4x4, Corrida 20m)
    // cutoffs: [maxExcelencia, maxMuitoBom, maxBom, maxRazoavel]
    if (val <= cutoffs[0]) return 'Excelência';
    if (val <= cutoffs[1]) return 'Muito bom';
    if (val <= cutoffs[2]) return 'Bom';
    if (val <= cutoffs[3]) return 'Razoável';
    return 'Fraco';
  } else {
    // Maior é melhor (Corrida 6min, Sentar e alcançar, Abdominais, Medicine Ball, Salto)
    // cutoffs: [minRazoavel, minBom, minMuitoBom, minExcelencia]
    if (val < cutoffs[0]) return 'Fraco';
    if (val < cutoffs[1]) return 'Razoável';
    if (val < cutoffs[2]) return 'Bom';
    if (val < cutoffs[3]) return 'Muito bom';
    return 'Excelência';
  }
}

export function classifyHealthIndicator(indicatorKey, value, sexo, idade) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Dados insuficientes para classificação';
  }

  const val = Number(value);

  // Razão Cintura-Estatura (Ashwell e Hsieh 2005 - Pág. 20): Universal para todas as idades e sexos
  // RCE <= 0.50 -> Zona Saudável | RCE > 0.50 -> Zona de Risco à Saúde
  if (indicatorKey === 'rce') {
    return val <= 0.50 ? 'Zona saudável' : 'Zona de risco à saúde';
  }

  const gender = normalizeGender(sexo);
  const age = normalizeAge(idade);

  if (!gender || age === null) {
    return 'Dados insuficientes para classificação';
  }

  // IMC (Bergmann 2009 - Pág. 18): valores <= cutoff -> Zona Saudável | > cutoff -> Zona de Risco à Saúde
  if (indicatorKey === 'imc') {
    const cutoff = IMC_SAUDE_TABLE[gender]?.[age];
    if (cutoff === undefined) return 'Dados insuficientes para classificação';
    return val <= cutoff ? 'Zona saudável' : 'Zona de risco à saúde';
  }

  // Corrida 20m para Saúde Óssea (Mello 2020 - Pág. 24): menor é melhor (tempo) -> <= cutoff -> Saudável | > cutoff -> Risco
  if (indicatorKey === 'corrida20m') {
    const cutoff = PROESP_TABLES.corrida20m?.saudeCutoff?.[gender]?.[age];
    if (cutoff === undefined) return 'Dados insuficientes para classificação';
    return val <= cutoff ? 'Zona saudável' : 'Zona de risco à saúde';
  }

  // Demais testes (Corrida 6min, Sentar e alcançar, Abdominais, Medicine Ball): maior é melhor -> >= cutoff -> Saudável | < cutoff -> Risco
  const testConfig = PROESP_TABLES[indicatorKey];
  if (testConfig && testConfig.saudeCutoff && gender && age !== null) {
    const cutoff = testConfig.saudeCutoff[gender]?.[age];
    if (cutoff !== undefined) {
      return val >= cutoff ? 'Zona saudável' : 'Zona de risco à saúde';
    }
  }

  return 'Dados insuficientes para classificação';
}

/**
 * Função principal que recebe os dados do aluno e da avaliação
 * e devolve todas as classificações normativas de desempenho e de saúde
 */
export function classifyPROESP({ idade, sexo, medidas = {}, testes = {} }) {
  const gender = normalizeGender(sexo);
  const age = normalizeAge(idade);

  const imc = calculateIMC(medidas.massaCorporal, medidas.estatura);
  const rce = calculateRCE(medidas.perimetroCintura, medidas.estatura);

  // Cálculos de melhores tentativas
  const sentarMelhor = calculateBestAttempt(testes.sentarAlcançar?.tentativa1, testes.sentarAlcançar?.tentativa2);
  const abdominaisRep = testes.abdominais1Min?.repeticoes != null && testes.abdominais1Min?.repeticoes !== '' 
    ? Number(testes.abdominais1Min.repeticoes) 
    : null;
  const medBallMelhor = calculateBestAttempt(testes.arremessoMedicineBall?.tentativa1, testes.arremessoMedicineBall?.tentativa2);
  const saltoMelhor = calculateBestAttempt(testes.saltoHorizontal?.tentativa1, testes.saltoHorizontal?.tentativa2);
  const quadradoMelhor = calculateBestAttempt(testes.quadrado4x4?.tentativa1, testes.quadrado4x4?.tentativa2, true);
  const corrida20Melhor = calculateBestAttempt(testes.corrida20m?.tentativa1, testes.corrida20m?.tentativa2, true);
  
  const corrida6MinTotal = calculate6MinTotal(
    testes.corrida6Min?.voltas,
    testes.corrida6Min?.perimetroPista,
    testes.corrida6Min?.metrosUltimaVolta,
    testes.corrida6Min?.totalMetros
  );

  return {
    calculos: {
      imc,
      rce,
      corrida6MinTotal,
      sentarAlcançarMelhor: sentarMelhor,
      arremessoMedicineBallMelhor: medBallMelhor,
      saltoHorizontalMelhor: saltoMelhor,
      quadrado4x4Melhor: quadradoMelhor,
      corrida20mMelhor: corrida20Melhor
    },
    classificacoes: {
      desempenho: {
        corrida6Min: classifyPerformanceTest('corrida6Min', corrida6MinTotal, gender, age),
        sentarAlcançar: classifyPerformanceTest('sentarAlcançar', sentarMelhor, gender, age),
        abdominais1Min: classifyPerformanceTest('abdominais1Min', abdominaisRep, gender, age),
        arremessoMedicineBall: classifyPerformanceTest('arremessoMedicineBall', medBallMelhor, gender, age),
        saltoHorizontal: classifyPerformanceTest('saltoHorizontal', saltoMelhor, gender, age),
        quadrado4x4: classifyPerformanceTest('quadrado4x4', quadradoMelhor, gender, age),
        corrida20m: classifyPerformanceTest('corrida20m', corrida20Melhor, gender, age)
      },
      saude: {
        imc: classifyHealthIndicator('imc', imc, gender, age),
        rce: classifyHealthIndicator('rce', rce, gender, age),
        aptidaoCardiorrespiratoria: classifyHealthIndicator('corrida6Min', corrida6MinTotal, gender, age),
        flexibilidade: classifyHealthIndicator('sentarAlcançar', sentarMelhor, gender, age),
        resistenciaMuscular: classifyHealthIndicator('abdominais1Min', abdominaisRep, gender, age)
      }
    }
  };
}
