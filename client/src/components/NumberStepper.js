import React from 'react';
import { Minus, Plus } from 'lucide-react';

const NumberStepper = ({
  value = 0,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  ariaLabel = 'Número',
  size = 'md', // 'sm' | 'md' | 'lg'
  unit = '',
  style = {}
}) => {
  const numValue = typeof value === 'number' ? value : (parseInt(value, 10) || 0);

  const handleDecrement = (e) => {
    e.preventDefault();
    if (disabled) return;
    const nextVal = numValue - step;
    if (min !== undefined && nextVal < min) return;
    onChange(nextVal);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    if (disabled) return;
    const nextVal = numValue + step;
    if (max !== undefined && nextVal > max) return;
    onChange(nextVal);
  };

  const handleInputChange = (e) => {
    if (disabled) return;
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      if (min !== undefined && parsed < min) {
        onChange(min);
      } else if (max !== undefined && parsed > max) {
        onChange(max);
      } else {
        onChange(parsed);
      }
    }
  };

  const isMin = min !== undefined && numValue <= min;
  const isMax = max !== undefined && numValue >= max;

  const heights = {
    sm: '32px',
    md: '38px',
    lg: '44px'
  };

  const btnWidths = {
    sm: '30px',
    md: '36px',
    lg: '42px'
  };

  const fontSizes = {
    sm: '0.8125rem',
    md: '0.9375rem',
    lg: '1.0625rem'
  };

  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-input)',
        height: heights[size] || '38px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)',
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
        maxWidth: '100%',
        ...style
      }}
      className="number-stepper-container"
    >
      {/* Botão Decrementar [-] */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isMin}
        style={{
          width: btnWidths[size] || '36px',
          height: '100%',
          border: 'none',
          background: 'transparent',
          color: (disabled || isMin) ? 'var(--text-tertiary)' : 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: (disabled || isMin) ? 'not-allowed' : 'pointer',
          transition: 'background-color var(--transition-fast)',
          padding: 0,
          flexShrink: 0
        }}
        aria-label={`Diminuir ${ariaLabel}`}
        tabIndex={disabled ? -1 : 0}
      >
        <Minus size={size === 'sm' ? 14 : 16} />
      </button>

      {/* Input de Valor */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minWidth: '40px', padding: '0 4px' }}>
        <input
          type="number"
          value={numValue}
          onChange={handleInputChange}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          aria-label={ariaLabel}
          style={{
            width: '100%',
            maxWidth: '65px',
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: fontSizes[size] || '0.9375rem',
            color: 'var(--text)',
            outline: 'none',
            padding: 0,
            MozAppearance: 'textfield'
          }}
        />
        {unit && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, marginLeft: '2px' }}>
            {unit}
          </span>
        )}
      </div>

      {/* Botão Incrementar [+] */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isMax}
        style={{
          width: btnWidths[size] || '36px',
          height: '100%',
          border: 'none',
          background: 'transparent',
          color: (disabled || isMax) ? 'var(--text-tertiary)' : 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: (disabled || isMax) ? 'not-allowed' : 'pointer',
          transition: 'background-color var(--transition-fast)',
          padding: 0,
          flexShrink: 0
        }}
        aria-label={`Aumentar ${ariaLabel}`}
        tabIndex={disabled ? -1 : 0}
      >
        <Plus size={size === 'sm' ? 14 : 16} />
      </button>
    </div>
  );
};

export default NumberStepper;
