/**
 * Regra centralizada para definir quais modalidades possuem suporte ao sistema de análise.
 * Modalidades SEM análise: Xadrez, Tênis de Mesa (Individual / Dupla / Misto), Vôlei de Praia e Badminton.
 */

export const UNSUPPORTED_ANALYSIS_SPORTS = [
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
  'vôlei de praia (dupla)',
  'badminton'
];

export const isSportAnalysisSupported = (modalidadeStr) => {
  if (!modalidadeStr) return false;
  const modLower = modalidadeStr.toLowerCase().trim();
  return !UNSUPPORTED_ANALYSIS_SPORTS.some(unsupported => modLower.includes(unsupported));
};
