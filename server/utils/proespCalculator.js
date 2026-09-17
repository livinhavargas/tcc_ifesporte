/**
 * PROESP-Br (Versão 2021) - Motor de Cálculos e Classificações Normativas
 * 
 * Baseado no Manual de Medidas, Testes e Avaliações do PROESP-Br 2021.
 * Categorias de Desempenho: Fraco (<P20), Razoável (P20-P40), Bom (P40-P70), Muito bom (P70-P90), Excelência (>=P90)
 * Critérios de Saúde: Zona saudável vs Zona de risco à saúde
 */

// ==========================================
// 1. CÁLCULOS DERIVADOS
// ==========================================

function calculateIMC(massaCorporalKg, estaturaCm) {
  if (!massaCorporalKg || !estaturaCm || massaCorporalKg <= 0 || estaturaCm <= 0) return null;
  const estaturaMetros = estaturaCm / 100;
  const imc = massaCorporalKg / (estaturaMetros * estaturaMetros);
  return Number(imc.toFixed(1));
}

function calculateRCE(perimetroCinturaCm, estaturaCm) {
  if (!perimetroCinturaCm || !estaturaCm || perimetroCinturaCm <= 0 || estaturaCm <= 0) return null;
  const rce = perimetroCinturaCm / estaturaCm;
  return Number(rce.toFixed(2));
}

function calculate6MinTotal(voltas, perimetroPista, metrosUltimaVolta) {
  const v = voltas != null && voltas !== '' ? Number(voltas) : 0;
  const p = perimetroPista != null && perimetroPista !== '' ? Number(perimetroPista) : 0;
  const u = metrosUltimaVolta != null && metrosUltimaVolta !== '' ? Number(metrosUltimaVolta) : 0;
  if (v < 0 || p < 0 || u < 0) return null;
  if (v === 0 && u === 0) return null;
  return Math.round((v * p) + u);
}

function calculateBestAttempt(t1, t2, isLowerBetter = false) {
  const val1 = t1 !== null && t1 !== undefined && t1 !== '' ? Number(t1) : null;
  const val2 = t2 !== null && t2 !== undefined && t2 !== '' ? Number(t2) : null;

  if (val1 !== null && !isNaN(val1) && (val2 === null || isNaN(val2))) return val1;
  if (val2 !== null && !isNaN(val2) && (val1 === null || isNaN(val1))) return val2;
  if (val1 === null || isNaN(val1) || val2 === null || isNaN(val2)) return null;

  return isLowerBetter ? Math.min(val1, val2) : Math.max(val1, val2);
}

function calculateAge(dataNascimento, dataAvaliacao = new Date()) {
  if (!dataNascimento) return null;
  const birthDate = new Date(dataNascimento);
  const evalDate = new Date(dataAvaliacao);
  if (isNaN(birthDate.getTime()) || isNaN(evalDate.getTime())) return null;

  let age = evalDate.getFullYear() - birthDate.getFullYear();
  const m = evalDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && evalDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

// ==========================================
// 2. TABELAS NORMATIVAS PROESP-BR 2021
// Estratificadas por Sexo e Idade (6 a 17 anos)
// Formato dos pontos de corte percentílicos: [P20, P40, P70, P90]
// Regra padrão (maior é melhor):
// < P20 => Fraco
// >= P20 e < P40 => Razoável
// >= P40 e < P70 => Bom
// >= P70 e < P90 => Muito bom
// >= P90 => Excelência
//
// Regra invertida (menor é melhor - Agilidade e Velocidade):
// > P20 => Fraco
// <= P20 e > P40 => Razoável
// <= P40 e > P70 => Bom
// <= P70 e > P90 => Muito bom
// <= P90 => Excelência
// ==========================================

const PROESP_TABLES = {
  // 1. Flexibilidade: Sentar e Alcançar (cm)
  sentarAlcançar: {
    isLowerBetter: false,
    M: {
      6: [12.0, 15.0, 19.0, 24.0],
      7: [13.0, 16.0, 20.0, 25.0],
      8: [13.0, 16.0, 20.0, 26.0],
      9: [13.0, 16.0, 20.0, 26.0],
      10: [13.0, 16.0, 21.0, 27.0],
      11: [13.0, 16.0, 21.0, 28.0],
      12: [14.0, 17.0, 22.0, 29.0],
      13: [14.0, 18.0, 23.0, 31.0],
      14: [15.0, 19.0, 25.0, 33.0],
      15: [16.0, 21.0, 27.0, 36.0],
      16: [18.0, 23.0, 29.0, 38.0],
      17: [19.0, 24.0, 31.0, 40.0]
    },
    F: {
      6: [15.0, 18.0, 22.0, 26.0],
      7: [16.0, 19.0, 23.0, 28.0],
      8: [16.0, 20.0, 24.0, 29.0],
      9: [17.0, 20.0, 25.0, 30.0],
      10: [17.0, 21.0, 26.0, 32.0],
      11: [18.0, 22.0, 27.0, 33.0],
      12: [19.0, 23.0, 28.0, 35.0],
      13: [20.0, 24.0, 29.0, 36.0],
      14: [21.0, 25.0, 30.0, 37.0],
      15: [22.0, 26.0, 31.0, 38.0],
      16: [23.0, 27.0, 32.0, 39.0],
      17: [23.0, 27.0, 33.0, 40.0]
    },
    // Critério de Saúde (ponto de corte mínimo para Zona Saudável)
    saudeCutoff: {
      M: { 6: 15, 7: 16, 8: 16, 9: 16, 10: 16, 11: 16, 12: 17, 13: 18, 14: 19, 15: 21, 16: 23, 17: 24 },
      F: { 6: 18, 7: 19, 8: 20, 9: 20, 10: 21, 11: 22, 12: 23, 13: 24, 14: 25, 15: 26, 16: 27, 17: 27 }
    }
  },

  // 2. Abdominais em 1 Minuto (repetições)
  abdominais1Min: {
    isLowerBetter: false,
    M: {
      6: [11, 16, 23, 30],
      7: [14, 19, 26, 33],
      8: [17, 22, 29, 36],
      9: [20, 25, 32, 39],
      10: [22, 27, 34, 41],
      11: [24, 29, 36, 43],
      12: [26, 31, 38, 46],
      13: [29, 34, 41, 49],
      14: [31, 37, 44, 52],
      15: [33, 39, 46, 54],
      16: [35, 41, 48, 56],
      17: [36, 42, 49, 57]
    },
    F: {
      6: [10, 14, 20, 27],
      7: [12, 17, 23, 30],
      8: [15, 20, 26, 33],
      9: [17, 22, 28, 35],
      10: [19, 24, 30, 37],
      11: [20, 25, 31, 38],
      12: [21, 26, 32, 39],
      13: [22, 27, 33, 40],
      14: [22, 27, 33, 41],
      15: [22, 27, 34, 41],
      16: [22, 28, 34, 42],
      17: [23, 28, 34, 42]
    },
    saudeCutoff: {
      M: { 6: 16, 7: 19, 8: 22, 9: 25, 10: 27, 11: 29, 12: 31, 13: 34, 14: 37, 15: 39, 16: 41, 17: 42 },
      F: { 6: 14, 7: 17, 8: 20, 9: 22, 10: 24, 11: 25, 12: 26, 13: 27, 14: 27, 15: 27, 16: 28, 17: 28 }
    }
  },

  // 3. Arremesso de Medicine Ball 2kg (cm)
  arremessoMedicineBall: {
    isLowerBetter: false,
    M: {
      6: [130, 150, 180, 210],
      7: [150, 175, 205, 240],
      8: [175, 200, 235, 275],
      9: [200, 225, 265, 310],
      10: [225, 255, 300, 350],
      11: [250, 285, 335, 390],
      12: [280, 320, 375, 435],
      13: [320, 365, 425, 490],
      14: [365, 415, 480, 550],
      15: [415, 470, 540, 615],
      16: [465, 520, 595, 675],
      17: [505, 560, 640, 720]
    },
    F: {
      6: [120, 140, 165, 195],
      7: [135, 155, 185, 220],
      8: [155, 175, 210, 250],
      9: [175, 200, 235, 280],
      10: [195, 220, 260, 310],
      11: [215, 245, 290, 345],
      12: [235, 270, 320, 380],
      13: [260, 295, 350, 415],
      14: [280, 320, 375, 440],
      15: [295, 335, 395, 460],
      16: [305, 345, 405, 475],
      17: [315, 355, 415, 485]
    }
  },

  // 4. Salto Horizontal (cm)
  saltoHorizontal: {
    isLowerBetter: false,
    M: {
      6: [85, 100, 118, 135],
      7: [95, 110, 128, 146],
      8: [105, 120, 138, 156],
      9: [115, 130, 148, 166],
      10: [123, 138, 157, 176],
      11: [130, 146, 165, 185],
      12: [138, 154, 175, 195],
      13: [148, 165, 187, 210],
      14: [158, 177, 200, 224],
      15: [168, 188, 212, 236],
      16: [177, 197, 222, 246],
      17: [183, 203, 228, 252]
    },
    F: {
      6: [75, 90, 106, 122],
      7: [85, 100, 116, 133],
      8: [95, 110, 126, 143],
      9: [103, 118, 135, 152],
      10: [110, 125, 142, 160],
      11: [116, 131, 149, 167],
      12: [121, 136, 154, 173],
      13: [126, 141, 159, 178],
      14: [129, 144, 162, 181],
      15: [131, 146, 164, 183],
      16: [132, 147, 165, 184],
      17: [133, 148, 166, 185]
    }
  },

  // 5. Quadrado de 4x4 metros - Agilidade (segundos com centésimos - MENOR É MELHOR)
  quadrado4x4: {
    isLowerBetter: true,
    M: {
      6: [7.30, 6.80, 6.20, 5.70],
      7: [6.90, 6.45, 5.90, 5.45],
      8: [6.55, 6.15, 5.65, 5.25],
      9: [6.25, 5.85, 5.40, 5.05],
      10: [6.00, 5.60, 5.20, 4.88],
      11: [5.75, 5.40, 5.00, 4.72],
      12: [5.55, 5.20, 4.83, 4.56],
      13: [5.35, 5.00, 4.65, 4.40],
      14: [5.15, 4.82, 4.48, 4.24],
      15: [4.98, 4.65, 4.32, 4.10],
      16: [4.84, 4.52, 4.20, 3.98],
      17: [4.74, 4.42, 4.10, 3.88]
    },
    F: {
      6: [7.60, 7.10, 6.50, 6.00],
      7: [7.20, 6.70, 6.15, 5.70],
      8: [6.85, 6.40, 5.88, 5.45],
      9: [6.50, 6.10, 5.60, 5.22],
      10: [6.25, 5.85, 5.40, 5.02],
      11: [6.05, 5.65, 5.22, 4.86],
      12: [5.85, 5.48, 5.08, 4.72],
      13: [5.70, 5.32, 4.94, 4.60],
      14: [5.58, 5.20, 4.82, 4.50],
      15: [5.50, 5.12, 4.75, 4.44],
      16: [5.45, 5.06, 4.70, 4.40],
      17: [5.42, 5.02, 4.66, 4.36]
    }
  },

  // 6. Corrida de 20 Metros - Velocidade (segundos com centésimos - MENOR É MELHOR)
  corrida20m: {
    isLowerBetter: true,
    M: {
      6: [5.10, 4.75, 4.35, 4.00],
      7: [4.80, 4.50, 4.15, 3.82],
      8: [4.55, 4.28, 3.95, 3.66],
      9: [4.35, 4.08, 3.78, 3.52],
      10: [4.15, 3.90, 3.62, 3.38],
      11: [3.98, 3.75, 3.48, 3.25],
      12: [3.82, 3.60, 3.34, 3.12],
      13: [3.65, 3.44, 3.19, 2.98],
      14: [3.48, 3.28, 3.05, 2.85],
      15: [3.35, 3.16, 2.94, 2.75],
      16: [3.24, 3.06, 2.85, 2.67],
      17: [3.18, 3.00, 2.79, 2.61]
    },
    F: {
      6: [5.30, 4.95, 4.55, 4.20],
      7: [5.00, 4.68, 4.32, 3.98],
      8: [4.75, 4.45, 4.10, 3.80],
      9: [4.50, 4.22, 3.90, 3.62],
      10: [4.30, 4.02, 3.72, 3.46],
      11: [4.12, 3.86, 3.58, 3.32],
      12: [3.98, 3.72, 3.45, 3.20],
      13: [3.88, 3.62, 3.36, 3.12],
      14: [3.80, 3.55, 3.29, 3.06],
      15: [3.75, 3.50, 3.24, 3.02],
      16: [3.72, 3.46, 3.21, 2.98],
      17: [3.70, 3.44, 3.18, 2.96]
    }
  },

  // 7. Corrida/Caminhada de 6 Minutos - Aptidão Cardiorrespiratória (metros)
  corrida6Min: {
    isLowerBetter: false,
    M: {
      6: [620, 710, 820, 940],
      7: [690, 780, 890, 1010],
      8: [750, 840, 950, 1070],
      9: [800, 890, 1000, 1120],
      10: [840, 930, 1040, 1160],
      11: [880, 970, 1080, 1200],
      12: [920, 1010, 1120, 1240],
      13: [960, 1050, 1160, 1280],
      14: [1000, 1090, 1200, 1320],
      15: [1040, 1130, 1240, 1360],
      16: [1070, 1160, 1270, 1390],
      17: [1100, 1190, 1300, 1420]
    },
    F: {
      6: [580, 670, 780, 900],
      7: [640, 730, 840, 960],
      8: [690, 780, 890, 1010],
      9: [730, 820, 930, 1050],
      10: [760, 850, 960, 1080],
      11: [790, 880, 990, 1110],
      12: [810, 900, 1010, 1130],
      13: [830, 920, 1030, 1150],
      14: [840, 930, 1040, 1160],
      15: [850, 940, 1050, 1170],
      16: [860, 950, 1060, 1180],
      17: [870, 960, 1070, 1190]
    },
    saudeCutoff: {
      M: { 6: 710, 7: 780, 8: 840, 9: 890, 10: 930, 11: 970, 12: 1010, 13: 1050, 14: 1090, 15: 1130, 16: 1160, 17: 1190 },
      F: { 6: 670, 7: 730, 8: 780, 9: 820, 10: 850, 11: 880, 12: 900, 13: 920, 14: 930, 15: 940, 16: 950, 17: 960 }
    }
  }
};

// Pontos de corte de IMC para Saúde (PROESP-Br / CONBRACE)
// Faixa saudável: [min, max]
const IMC_SAUDE_TABLE = {
  M: {
    6: [13.4, 18.0],
    7: [13.6, 18.8],
    8: [13.9, 19.8],
    9: [14.2, 20.8],
    10: [14.6, 21.8],
    11: [15.0, 22.8],
    12: [15.5, 23.8],
    13: [16.1, 24.8],
    14: [16.7, 25.6],
    15: [17.3, 26.4],
    16: [17.9, 27.2],
    17: [18.4, 27.8]
  },
  F: {
    6: [13.2, 17.8],
    7: [13.4, 18.6],
    8: [13.7, 19.6],
    9: [14.1, 20.6],
    10: [14.5, 21.6],
    11: [15.0, 22.6],
    12: [15.6, 23.6],
    13: [16.2, 24.6],
    14: [16.8, 25.4],
    15: [17.3, 26.0],
    16: [17.7, 26.6],
    17: [18.0, 27.0]
  }
};

// ==========================================
// 3. MOTOR DE CLASSIFICAÇÃO
// ==========================================

function normalizeGender(sexo) {
  if (!sexo) return null;
  const s = String(sexo).trim().toUpperCase();
  if (s === 'M' || s.startsWith('MASC') || s === 'HOMEM' || s === 'MASCULINO') return 'M';
  if (s === 'F' || s.startsWith('FEM') || s === 'MULHER' || s === 'FEMININO') return 'F';
  return null;
}

function normalizeAge(idade) {
  if (idade == null || isNaN(idade)) return null;
  const num = Math.floor(Number(idade));
  if (num < 6) return 6; // Limite inferior PROESP
  if (num > 17) return 17; // Limite superior PROESP (17+)
  return num;
}

function classifyPerformanceTest(testKey, value, sexo, idade) {
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

  const cutoffs = testConfig[gender][age]; // [P20, P40, P70, P90]
  const val = Number(value);

  if (testConfig.isLowerBetter) {
    // Menor é melhor (ex: Agilidade 4x4, Corrida 20m)
    // cutoffs: [P20, P40, P70, P90] onde P20 é maior tempo e P90 é menor tempo
    if (val > cutoffs[0]) return 'Fraco';
    if (val > cutoffs[1]) return 'Razoável';
    if (val > cutoffs[2]) return 'Bom';
    if (val > cutoffs[3]) return 'Muito bom';
    return 'Excelência';
  } else {
    // Maior é melhor
    if (val < cutoffs[0]) return 'Fraco';
    if (val < cutoffs[1]) return 'Razoável';
    if (val < cutoffs[2]) return 'Bom';
    if (val < cutoffs[3]) return 'Muito bom';
    return 'Excelência';
  }
}

function classifyHealthIndicator(indicatorKey, value, sexo, idade) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Dados insuficientes para classificação';
  }

  const gender = normalizeGender(sexo);
  const age = normalizeAge(idade);
  const val = Number(value);

  if (indicatorKey === 'rce') {
    // Razão Cintura-Estatura: Critério de Saúde universal PROESP-Br
    // RCE <= 0.50 -> Zona saudável | RCE > 0.50 -> Zona de risco à saúde
    return val <= 0.50 ? 'Zona saudável' : 'Zona de risco à saúde';
  }

  if (indicatorKey === 'imc') {
    if (!gender || age === null) return 'Dados insuficientes para classificação';
    const range = IMC_SAUDE_TABLE[gender]?.[age];
    if (!range) return 'Dados insuficientes para classificação';
    const [min, max] = range;
    return (val >= min && val <= max) ? 'Zona saudável' : 'Zona de risco à saúde';
  }

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
function classifyPROESP({ idade, sexo, medidas = {}, testes = {} }) {
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
    testes.corrida6Min?.metrosUltimaVolta
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

module.exports = {
  calculateIMC,
  calculateRCE,
  calculate6MinTotal,
  calculateBestAttempt,
  calculateAge,
  normalizeGender,
  normalizeAge,
  classifyPerformanceTest,
  classifyHealthIndicator,
  classifyPROESP,
  PROESP_TABLES,
  IMC_SAUDE_TABLE
};
