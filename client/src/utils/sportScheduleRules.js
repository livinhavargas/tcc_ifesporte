/**
 * Regra centralizada para definir quais modalidades possuem suporte ao sistema de cronogramas.
 * Modalidades SEM cronograma: Badminton, Xadrez, Tênis de Mesa (Individual / Dupla) e Vôlei de Praia.
 */

export const UNSUPPORTED_SCHEDULE_SPORTS = [
  'badminton',
  'xadrez',
  'tênis de mesa',
  'tenis de mesa',
  'tênis de mesa individual',
  'tenis de mesa individual',
  'tênis de mesa dupla',
  'tenis de mesa dupla',
  'tênis de mesa (individual)',
  'tênis de mesa (misto)',
  'vôlei de praia',
  'volei de praia',
  'vôlei de praia (dupla)'
];

export const isSportScheduleSupported = (modalidadeStr) => {
  if (!modalidadeStr) return false;
  const modLower = modalidadeStr.toLowerCase().trim();
  return !UNSUPPORTED_SCHEDULE_SPORTS.some(unsupported => modLower.includes(unsupported));
};
