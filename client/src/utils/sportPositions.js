// Catálogo e funções utilitárias de posições por modalidade esportiva no frontend

export const SPORT_POSITIONS_MAP = {
  'Basquetebol': [
    'Armador (1)',
    'Ala-Armador (2)',
    'Ala (3)',
    'Ala-Pivô (4)',
    'Pivô (5)',
    'Indefinido'
  ],
  'Futsal': [
    'Goleiro',
    'Fixo',
    'Ala Direito',
    'Ala Esquerdo',
    'Pivô',
    'Indefinido'
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
    'Indefinido'
  ],
  'Handebol': [
    'Goleiro',
    'Ponta Lado Direito',
    'Ponta Lado Esquerdo',
    'Armador Central',
    'Armador Lado Direito',
    'Armador Lado Esquerdo',
    'Pivô',
    'Indefinido'
  ],
  'Voleibol': [
    'Levantador',
    'Líbero',
    'Central',
    'Oposto',
    'Ponteiro',
    'Indefinido'
  ]
};

export const FUTEBOL_CATEGORIES = [
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

export const normalizeSportKey = (sportName) => {
  if (!sportName) return null;
  const s = sportName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  
  if (s.includes('basquete') || s.includes('basquetebol')) return 'Basquetebol';
  if (s === 'futsal') return 'Futsal';
  if (s === 'futebol') return 'Futebol';
  if (s === 'handebol') return 'Handebol';
  if ((s.includes('volei') || s.includes('voleibol')) && !s.includes('praia')) return 'Voleibol';
  
  return null;
};

export const isSportWithPositions = (sportName) => {
  return normalizeSportKey(sportName) !== null;
};

export const getPositionsForSport = (sportName) => {
  const key = normalizeSportKey(sportName);
  return key ? SPORT_POSITIONS_MAP[key] : [];
};

/**
 * Obtém a lista de posições vinculadas de um atleta para um determinado esporte/modalidade como array de strings
 */
export const getStudentPositionsForSport = (student, sportName) => {
  if (!student) return [];
  const sportKey = normalizeSportKey(sportName);
  if (!sportKey) return [];

  const list = student.posicoesPorModalidade || [];
  const item = list.find(p => normalizeSportKey(p.modalidade) === sportKey);

  if (item) {
    if (Array.isArray(item.posicoes) && item.posicoes.length > 0) {
      return item.posicoes.filter(p => p && p !== 'Indefinido' && p !== 'Não sei');
    }
    if (typeof item.posicao === 'string' && item.posicao && item.posicao !== 'Indefinido' && item.posicao !== 'Não sei') {
      return item.posicao.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  return [];
};

/**
 * Obtém a posição vinculada de um atleta para um determinado esporte/modalidade como string
 * Se houver múltiplas posições, retorna-as separadas por vírgula para manter compatibilidade
 */
export const getStudentPositionForSport = (student, sportName) => {
  if (!student) return null;
  const sportKey = normalizeSportKey(sportName);
  if (!sportKey) return null;

  const positions = getStudentPositionsForSport(student, sportName);
  if (positions.length > 0) {
    return positions.join(', ');
  }

  const list = student.posicoesPorModalidade || [];
  const item = list.find(p => normalizeSportKey(p.modalidade) === sportKey);
  
  if (item && item.posicao) {
    return item.posicao === 'Não sei' ? 'Indefinido' : item.posicao;
  }
  
  // Se o aluno está cadastrado no esporte mas ainda não tem posição definida
  const studentSports = student.modalidades || student.esportes || [];
  const isInSport = studentSports.some(s => normalizeSportKey(s) === sportKey);
  
  if (isInSport) {
    return 'Indefinido';
  }
  
  return null;
};
