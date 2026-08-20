import React from 'react';

/**
 * Calcula o IMC e sua classificação com base no peso (kg) e altura (m ou cm).
 * 
 * Regras de Classificação:
 * - Saudável (🟢): 18.5 até 24.9
 * - Atenção (🟡): 16.0 até 18.4 OU 25.0 até 29.9
 * - Necessita Atenção (🔴): abaixo de 16.0 OU a partir de 30.0
 */
export const calculateIMC = (peso, altura) => {
  if (peso === undefined || peso === null || peso === '' || 
      altura === undefined || altura === null || altura === '') {
    return null;
  }
  
  const p = parseFloat(peso);
  let h = parseFloat(altura);
  
  if (isNaN(p) || isNaN(h) || p <= 0 || h <= 0) {
    return null;
  }
  
  // Se a altura tiver sido informada em centímetros (ex: 175 em vez de 1.75)
  if (h > 3) {
    h = h / 100;
  }
  
  const imcVal = p / (h * h);
  if (!isFinite(imcVal) || imcVal <= 0) {
    return null;
  }

  // Arredonda para 1 casa decimal
  const roundedIMC = Math.round(imcVal * 10) / 10;

  let classification = '';
  let color = ''; 
  let badgeBg = '';
  let dotSymbol = '';

  if (roundedIMC < 16.0 || roundedIMC >= 30.0) {
    classification = 'Necessita Atenção';
    color = '#ef4444'; // Vermelho
    badgeBg = 'rgba(239, 68, 68, 0.12)';
    dotSymbol = '🔴';
  } else if ((roundedIMC >= 16.0 && roundedIMC < 18.5) || (roundedIMC >= 25.0 && roundedIMC < 30.0)) {
    classification = 'Atenção';
    color = '#eab308'; // Amarelo
    badgeBg = 'rgba(234, 179, 8, 0.12)';
    dotSymbol = '🟡';
  } else {
    classification = 'Saudável';
    color = '#22c55e'; // Verde
    badgeBg = 'rgba(34, 197, 94, 0.12)';
    dotSymbol = '🟢';
  }

  return {
    val: roundedIMC,
    formatted: roundedIMC.toFixed(1).replace('.', ','),
    classification,
    color,
    badgeBg,
    dotSymbol
  };
};

const IMCCard = ({ peso, altura, title = "IMC" }) => {
  const result = calculateIMC(peso, altura);

  if (!result) {
    return (
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-light, #e5e7eb)',
        padding: '16px 20px',
        marginTop: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h6 style={{ fontWeight: 700, color: 'var(--text, #1f2937)', margin: 0, fontSize: '0.875rem' }}>{title}</h6>
        </div>
        <p style={{ color: 'var(--text-tertiary, #6b7280)', fontSize: '0.875rem', margin: 0, fontStyle: 'italic' }}>
          Peso e altura ainda não foram informados.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-card, #ffffff)',
      borderRadius: 'var(--radius-lg, 12px)',
      border: '1px solid var(--border-light, #e5e7eb)',
      boxShadow: 'var(--shadow-xs, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
      padding: '20px',
      marginTop: '16px',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-tertiary, #6b7280)'
        }}>
          Índice de Massa Corporal
        </span>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-tertiary, #9ca3af)'
        }}>
          Cálculo automático
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #4b5563)', fontWeight: 600 }}>{title}</span>
          <span style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text, #111827)', lineHeight: 1.1 }}>
            {result.formatted}
          </span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '9999px',
          background: result.badgeBg,
          color: result.color,
          fontWeight: 700,
          fontSize: '0.9375rem',
          border: `1.5px solid ${result.color}44`
        }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: result.color,
            boxShadow: `0 0 8px ${result.color}88`
          }}></span>
          <span>{result.classification}</span>
        </div>
      </div>
    </div>
  );
};

export default IMCCard;
