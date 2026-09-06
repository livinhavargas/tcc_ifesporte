// Catálogo de posições oficiais por modalidade esportiva no IFesporte

const SPORT_POSITIONS_MAP = {
  'Basquetebol': [
    'Armador (1)',
    'Ala-Armador (2)',
    'Ala (3)',
    'Ala-Pivô (4)',
    'Pivô (5)',
    'Não sei'
  ],
  'Futsal': [
    'Goleiro',
    'Fixo',
    'Ala Direito',
    'Ala Esquerdo',
    'Pivô',
    'Não sei'
  ],
  'Futebol': [
    'Goleiro',
    'Lateral ou Ala Direito',
    'Lateral ou Ala Esquerdo',
    'Zagueiro Lado Direito',
    'Zagueiro Lado Esquerdo',
    'Meio Defensivo',
    'Meio Central',
    'Meio Atacante',
    'Ponta Lado Direito',
    'Ponta Lado Esquerdo',
    'Centroavante',
    'Não sei'
  ],
  'Handebol': [
    'Goleiro',
    'Ponta Lado Direito',
    'Ponta Lado Esquerdo',
    'Armador Central',
    'Armador Lado Direito',
    'Armador Lado Esquerdo',
    'Pivô',
    'Não sei'
  ],
  'Voleibol': [
    'Levantador',
    'Líbero',
    'Central',
    'Oposto',
    'Ponteiro',
    'Não sei'
  ]
};

const FUTEBOL_CATEGORIES = [
  {
    categoria: 'Goleiro',
    posicoes: ['Goleiro']
  },
  {
    categoria: 'Lateral ou Ala',
    posicoes: ['Lateral ou Ala Direito', 'Lateral ou Ala Esquerdo']
  },
  {
    categoria: 'Zagueiro',
    posicoes: ['Zagueiro Lado Direito', 'Zagueiro Lado Esquerdo']
  },
  {
    categoria: 'Meio Campista',
    posicoes: ['Meio Defensivo', 'Meio Central', 'Meio Atacante']
  },
  {
    categoria: 'Atacante',
    posicoes: ['Ponta Lado Direito', 'Ponta Lado Esquerdo', 'Centroavante']
  }
];

const normalizeSportKey = (sportName) => {
  if (!sportName) return '';
  const s = sportName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  
  if (s.includes('basquete') || s.includes('basquetebol')) return 'Basquetebol';
  if (s === 'futsal') return 'Futsal';
  if (s === 'futebol') return 'Futebol';
  if (s === 'handebol') return 'Handebol';
  if ((s.includes('volei') || s.includes('voleibol')) && !s.includes('praia')) return 'Voleibol';
  
  return null;
};

const isSportWithPositions = (sportName) => {
  return normalizeSportKey(sportName) !== null;
};

const getPositionsForSport = (sportName) => {
  const key = normalizeSportKey(sportName);
  return key ? SPORT_POSITIONS_MAP[key] : [];
};

/**
 * Valida a lista de posicoesPorModalidade contra as modalidades do atleta.
 * Retorna { isValid: boolean, error?: string }
 */
const validatePosicoesPorModalidade = (modalidades = [], posicoesPorModalidade = []) => {
  if (!Array.isArray(posicoesPorModalidade)) {
    return { isValid: false, error: 'posicoesPorModalidade deve ser um array.' };
  }

  for (const item of posicoesPorModalidade) {
    if (!item || !item.modalidade) {
      return { isValid: false, error: 'Cada item de posição deve conter a propriedade "modalidade".' };
    }

    const sportKey = normalizeSportKey(item.modalidade);
    
    // Se a modalidade não suporta posições, não deve ter posição vinculada diferente de 'Não sei' ou vazia
    if (!sportKey) {
      return { 
        isValid: false, 
        error: `A modalidade "${item.modalidade}" não aceita definição de posições.` 
      };
    }

    const validPositions = SPORT_POSITIONS_MAP[sportKey];
    const pos = (item.posicao || '').trim();

    if (pos && !validPositions.includes(pos)) {
      return {
        isValid: false,
        error: `A posição "${pos}" não é válida para a modalidade "${item.modalidade}". Posições permitidas: ${validPositions.join(', ')}.`
      };
    }
  }

  return { isValid: true };
};

/**
 * Normaliza e sincroniza posicoesPorModalidade com as modalidades atuais.
 * - Remove modalidades excluídas
 * - Adiciona "Não sei" para modalidades novas com posições
 */
const sanitizePosicoesPorModalidade = (modalidades = [], posicoesPorModalidade = []) => {
  const sanitized = [];
  const currentPositionsMap = new Map();

  if (Array.isArray(posicoesPorModalidade)) {
    for (const item of posicoesPorModalidade) {
      if (item && item.modalidade) {
        const sportKey = normalizeSportKey(item.modalidade);
        if (sportKey) {
          currentPositionsMap.set(sportKey, item.posicao || 'Não sei');
        }
      }
    }
  }

  for (const mod of modalidades) {
    const sportKey = normalizeSportKey(mod);
    if (sportKey) {
      const existingPos = currentPositionsMap.get(sportKey);
      const validPositions = SPORT_POSITIONS_MAP[sportKey];
      const finalPos = existingPos && validPositions.includes(existingPos) ? existingPos : 'Não sei';

      // Evita duplicação no array
      if (!sanitized.some(s => normalizeSportKey(s.modalidade) === sportKey)) {
        sanitized.push({
          modalidade: mod,
          posicao: finalPos
        });
      }
    }
  }

  return sanitized;
};

module.exports = {
  SPORT_POSITIONS_MAP,
  FUTEBOL_CATEGORIES,
  normalizeSportKey,
  isSportWithPositions,
  getPositionsForSport,
  validatePosicoesPorModalidade,
  sanitizePosicoesPorModalidade
};
