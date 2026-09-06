// Catálogo e funções utilitárias de posições por modalidade esportiva no frontend

export const SPORT_POSITIONS_MAP = {
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
 * Obtém a posição vinculada de um atleta para um determinado esporte/modalidade
 */
export const getStudentPositionForSport = (student, sportName) => {
  if (!student) return null;
  const sportKey = normalizeSportKey(sportName);
  if (!sportKey) return null;

  const list = student.posicoesPorModalidade || [];
  const item = list.find(p => normalizeSportKey(p.modalidade) === sportKey);
  
  if (item && item.posicao) {
    return item.posicao;
  }
  
  // Se o aluno está cadastrado no esporte mas ainda não tem posição definida
  const studentSports = student.modalidades || student.esportes || [];
  const isInSport = studentSports.some(s => normalizeSportKey(s) === sportKey);
  
  if (isInSport) {
    return 'Não sei';
  }
  
  return null;
};
