import React from 'react';

// SVG Vector Icons for each exact sport modality
const SportSVG = ({ type, size = 24, color = 'currentColor', style = {} }) => {
  const iconStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
    ...style
  };

  switch (type) {
    // 1. Atletismo: Bonequinho correndo (Running athlete)
    case 'atletismo':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <circle cx="14" cy="4" r="2" fill={color} stroke="none" />
          <path d="M7 21h3l1.5-4.5 3.5-3.5" />
          <path d="M11 11.5l-2-2 3-3.5 4.5 2 3-1" />
          <path d="M6 13l2.5-1.5" />
        </svg>
      );

    // 2. Badminton: Peteca (Shuttlecock)
    case 'badminton':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <path d="M9.5 17.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5v-1.5h-5v1.5z" fill={color} />
          <path d="M7 4.5l2.5 11.5" />
          <path d="M17 4.5l-2.5 11.5" />
          <path d="M12 4.5v11.5" />
          <path d="M8.5 9h7" />
          <path d="M9.2 13h5.6" />
        </svg>
      );

    // 3. Tênis de Mesa: Raquete e bola de tênis de mesa (Table tennis)
    case 'tenis-de-mesa':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <path d="M10 14l-6 6" strokeWidth="2.5" />
          <ellipse cx="14.5" cy="9.5" rx="5" ry="5.8" transform="rotate(15 14.5 9.5)" />
          <circle cx="7" cy="7" r="1.8" fill={color} stroke="none" />
        </svg>
      );

    // 4. Xadrez: Peão de xadrez (Chess Pawn)
    case 'xadrez':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <circle cx="12" cy="5" r="2.2" />
          <path d="M9 9h6" />
          <path d="M12 9c-2 0-3.5 2.5-3.5 6h7c0-3.5-1.5-6-3.5-6z" />
          <path d="M6 18h12v3H6z" />
        </svg>
      );

    // 5. Basquete: Bola de basquete (Basketball)
    case 'basquete':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 2.5v19" />
          <path d="M2.5 12h19" />
          <path d="M5.75 5.75c3.5 3.5 3.5 9 0 12.5" />
          <path d="M18.25 5.75c-3.5 3.5-3.5 9 0 12.5" />
        </svg>
      );

    // 6. Futsal: Tênis esportivo (Sneaker/Shoe)
    case 'futsal':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <path d="M3 18h18" strokeWidth="2.5" />
          <path d="M3 18v-4c0-1.5 1-2.5 2.5-2.5h1.8l3-3 4.5 4 4.5.5c1.5 0 2.7.8 2.7 2.2V18" />
          <path d="M9 11.5l2 2" />
          <path d="M11 9.5l2 2" />
          <path d="M15 14v4" />
        </svg>
      );

    // 7. Futebol: Bola de futebol (Football ball)
    case 'futebol':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 8.5l2.5 1.8v3l-2.5 1.8-2.5-1.8v-3z" fill={color} stroke="none" opacity="0.15" />
          <path d="M12 8.5l2.5 1.8v3l-2.5 1.8-2.5-1.8v-3z" />
          <path d="M12 8.5V2.5" />
          <path d="M14.5 10.3l5.5-2.5" />
          <path d="M14.5 13.3l4 4" />
          <path d="M9.5 13.3l-4 4" />
          <path d="M9.5 10.3l-5.5-2.5" />
        </svg>
      );

    // 8. Handebol: Mão (Hand)
    case 'handebol':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <path d="M18 11V6a1.5 1.5 0 0 0-3 0v4.5" />
          <path d="M15 5V3.5a1.5 1.5 0 0 0-3 0V11" />
          <path d="M12 5.5V4a1.5 1.5 0 0 0-3 0v7.5" />
          <path d="M9 7.5V6a1.5 1.5 0 0 0-3 0v7.5c0 4 3 6.5 6 6.5h3c3.5 0 5-2 5-5v-4" />
        </svg>
      );

    // 9. Voleibol: Bola de vôlei (Volleyball)
    case 'voleibol':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 2.5c-1.2 3-1.2 6 0 9" />
          <path d="M12 11.5c1.2 3 1.2 6 0 9" />
          <path d="M2.5 12c3-1.2 6-1.2 9 0" />
          <path d="M11.5 12c3 1.2 6 1.2 9 0" />
          <path d="M5.3 5.3c3.2.8 6.4.8 9.6 0" />
          <path d="M9.1 18.7c3.2-.8 6.4-.8 9.6 0" />
        </svg>
      );

    // 10. Vôlei de Praia: Sol (Sun)
    case 'volei-praia':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
  }
};

/**
 * Intelligent helper to detect sport or atletismo submodality from text
 */
export const detectSport = (text) => {
  if (!text || typeof text !== 'string') return null;
  const str = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Vôlei de praia check
  if (str.includes('praia')) return 'volei-praia';

  // Voleibol check
  if (str.includes('volei') || str.includes('voleibol')) return 'voleibol';

  // Futsal check
  if (str.includes('futsal') || str.includes('salao')) return 'futsal';

  // Futebol check
  if (str.includes('futebol') || str.includes('campo') || str.includes('society')) return 'futebol';

  // Basquete check
  if (str.includes('basquete') || str.includes('basquetebol')) return 'basquete';

  // Handebol check
  if (str.includes('handebol') || str.includes('handball')) return 'handebol';

  // Badminton check
  if (str.includes('badminton') || str.includes('peteca')) return 'badminton';

  // Xadrez check
  if (str.includes('xadrez') || str.includes('chess')) return 'xadrez';

  // Tênis de mesa check
  if (str.includes('tenis de mesa') || str.includes('ping pong') || str.includes('ping-pong')) return 'tenis-de-mesa';

  // Atletismo & submodalidades check
  const atletismoKeywords = [
    'atletismo', 'corrida', 'corridas', '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m',
    'revezamento', '4x100', '4x400', 'salto', 'saltos', 'distancia', 'triplo', 'altura', 'vara',
    'arremesso', 'lancamento', 'lancamentos', 'peso', 'disco', 'dardo', 'martelo',
    'marcha atletica', 'cross country', 'pista', 'maratona'
  ];

  if (atletismoKeywords.some(keyword => str.includes(keyword))) {
    return 'atletismo';
  }

  return null;
};

/**
 * Normalized key mapping for exact sport names
 */
export const normalizeSportKey = (sportName) => {
  if (!sportName) return 'atletismo';
  const detected = detectSport(sportName);
  if (detected) return detected;

  const name = sportName.toLowerCase();
  if (name.includes('atletismo')) return 'atletismo';
  if (name.includes('badminton')) return 'badminton';
  if (name.includes('mesa')) return 'tenis-de-mesa';
  if (name.includes('xadrez')) return 'xadrez';
  if (name.includes('basquete')) return 'basquete';
  if (name.includes('futsal')) return 'futsal';
  if (name.includes('futebol')) return 'futebol';
  if (name.includes('handebol')) return 'handebol';
  if (name.includes('praia')) return 'volei-praia';
  if (name.includes('volei')) return 'voleibol';

  return 'atletismo';
};

/**
 * Main SportIcon Component
 */
const SportIcon = ({ sport, text, size = 24, color = 'currentColor', style = {} }) => {
  const targetKey = sport ? normalizeSportKey(sport) : (text ? detectSport(text) : null);
  if (!targetKey) return null;
  return <SportSVG type={targetKey} size={size} color={color} style={style} />;
};

export default SportIcon;
