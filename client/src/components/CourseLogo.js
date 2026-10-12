import React from 'react';

/**
 * Componente oficial de identidade visual para os Cursos Técnicos de Educação Física:
 * 1ª Logo: Informática para Internet (badge abobadada verde com telas responsivas)
 * 2ª Logo: Hospedagem (badge abobadada azul com janelas e estrelas em "H")
 * 
 * - Vetor nítido de alta resolução
 * - Fundo 100% transparente
 * - Proporção preservada (400:320)
 * - Compatível com Dark Mode e Light Mode
 */
const CourseLogo = ({ 
  course, 
  size = 32, 
  className = '', 
  style = {},
  alt = ''
}) => {
  if (!course) return null;

  const norm = String(course).toLowerCase().trim();
  const isInfo = norm.includes('informatica') || norm.includes('informática') || norm.includes('internet');
  const isHosp = norm.includes('hospedagem') || norm.includes('hotel');

  if (!isInfo && !isHosp) {
    return null;
  }

  const logoSrc = isInfo ? '/images/logo_informatica.svg' : '/images/logo_hospedagem.svg';
  const logoAlt = alt || (isInfo ? 'Logo Informática para Internet' : 'Logo Hospedagem');
  const courseTitle = isInfo ? 'Informática para Internet' : 'Hospedagem';

  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 32;
  const calculatedWidth = Math.round(numericSize * 1.25);

  return (
    <img
      src={logoSrc}
      alt={logoAlt}
      title={courseTitle}
      className={`course-logo-badge ${className}`}
      style={{
        height: `${numericSize}px`,
        width: `${calculatedWidth}px`,
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.16))',
        transition: 'transform var(--transition-fast, 0.15s ease)',
        ...style
      }}
    />
  );
};

export default CourseLogo;
