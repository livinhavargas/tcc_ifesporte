import React from 'react';

/**
 * Padrão Visual Único e Padronizado do IMC para todo o Portal do Treinador:
 * - Símbolo / Indicador: Bolinha sólida circular (●) rigorosamente à esquerda
 * - Cores padronizadas por classificação:
 *     * Saudável / Zona saudável:
 *         Cor/Ponto: #16a34a (Verde)
 *         Fundo: rgba(22, 163, 74, 0.12)
 *         Borda: rgba(22, 163, 74, 0.28)
 *     * Atenção:
 *         Cor/Ponto: #d97706 (Âmbar/Amarelo)
 *         Fundo: rgba(217, 119, 6, 0.12)
 *         Borda: rgba(217, 119, 6, 0.28)
 *     * Necessita Atenção / Zona de risco à saúde:
 *         Cor/Ponto: #dc2626 (Vermelho)
 *         Fundo: rgba(220, 38, 38, 0.12)
 *         Borda: rgba(220, 38, 38, 0.28)
 * - Formato: Badge Pill com bordas 9999px e padding 4px 10px
 * - Tipografia: Fonte do sistema, tamanho 0.75rem (12px), peso 700 (bold), line-height 1.2
 * - Espaçamento: gap fixo de 6px entre a bolinha e o texto
 * - Posição: bolinha sempre posicionada à esquerda do texto
 */

export const getIMCVisualConfig = (classification) => {
  if (!classification) {
    return {
      label: 'Não classificado',
      color: '#64748b',
      bg: 'rgba(100, 116, 139, 0.10)',
      border: 'rgba(100, 116, 139, 0.25)',
      dotColor: '#64748b'
    };
  }

  const norm = String(classification).trim().toLowerCase();

  // 1. Saudável / Zona saudável
  if (norm.includes('saudável') || norm.includes('saudavel')) {
    return {
      label: classification,
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.12)',
      border: 'rgba(22, 163, 74, 0.28)',
      dotColor: '#16a34a'
    };
  }

  // 2. Atenção (moderado)
  if ((norm.includes('atenção') || norm.includes('atencao')) && !norm.includes('necessita')) {
    return {
      label: classification,
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.12)',
      border: 'rgba(217, 119, 6, 0.28)',
      dotColor: '#d97706'
    };
  }

  // 3. Necessita Atenção / Zona de risco à saúde
  if (norm.includes('necessita') || norm.includes('risco') || norm.includes('perigo')) {
    return {
      label: classification,
      color: '#dc2626',
      bg: 'rgba(220, 38, 38, 0.12)',
      border: 'rgba(220, 38, 38, 0.28)',
      dotColor: '#dc2626'
    };
  }

  // Fallback neutro
  return {
    label: classification,
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.10)',
    border: 'rgba(100, 116, 139, 0.25)',
    dotColor: '#64748b'
  };
};

export const IMCBadge = ({ classification, className = '', style = {} }) => {
  if (!classification) return null;
  const cfg = getIMCVisualConfig(classification);

  return (
    <span
      className={`imc-standard-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontSize: '0.75rem',
        fontWeight: 700,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        verticalAlign: 'middle',
        ...style
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: cfg.dotColor,
          display: 'inline-block',
          flexShrink: 0
        }}
        aria-hidden="true"
      />
      <span>{cfg.label}</span>
    </span>
  );
};

/**
 * Retorna o HTML string do badge padronizado para uso em Ficha Completa, visualização de impressão e PDFs.
 */
export const renderIMCBadgeHtml = (classification) => {
  if (!classification) return '';
  const cfg = getIMCVisualConfig(classification);
  return `<span style="display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:9999px;background-color:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};font-size:0.75rem;font-weight:700;line-height:1.2;white-space:nowrap;vertical-align:middle;"><span style="width:7px;height:7px;border-radius:50%;background-color:${cfg.dotColor};display:inline-block;flex-shrink:0;"></span><span>${cfg.label}</span></span>`;
};

export default IMCBadge;
