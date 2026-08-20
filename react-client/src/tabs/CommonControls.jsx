// CommonControls.jsx
import React from 'react';

export function SliderControl({ 
  label, 
  value, 
  min = 0, 
  max = 100, 
  step = 1, 
  unit = '',
  onChange, 
  onCommit,
  styles, 
  disabled = false 
}) {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (onChange) onChange(newValue);
  };

  const handleMouseUp = () => {
    if (onCommit) onCommit(value);
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Enter' && onCommit) {
      onCommit(value);
    }
  };

  return (
    <div style={{ marginBottom: '12px', opacity: disabled ? 0.5 : 1 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <span style={{ 
          fontSize: '11px', 
          color: 'rgba(255,255,255,0.7)',
          fontWeight: '500'
        }}>
          {label}
        </span>
        <span style={{ 
          fontSize: '10px', 
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'monospace'
        }}>
          {typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onKeyUp={handleKeyUp}
        disabled={disabled}
        style={{
          width: '100%',
          height: '4px',
          WebkitAppearance: 'none',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      />
    </div>
  );
}

export function ToggleControl({ 
  label, 
  checked, 
  onChange, 
  styles, 
  disabled = false 
}) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '12px',
      opacity: disabled ? 0.5 : 1
    }}>
      <span style={{ 
        fontSize: '11px', 
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500'
      }}>
        {label}
      </span>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          background: checked ? '#4CAF80' : 'rgba(255,255,255,0.15)',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
          padding: 0,
        }}
      >
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: '2px',
          left: checked ? '20px' : '2px',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  );
}

export function ColorPicker({ 
  label, 
  value, 
  onChange, 
  styles, 
  disabled = false 
}) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      marginBottom: '12px',
      opacity: disabled ? 0.5 : 1
    }}>
      <span style={{ 
        fontSize: '11px', 
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500'
      }}>
        {label}
      </span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '28px',
          height: '28px',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '6px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '2px',
          background: value,
          WebkitAppearance: 'none',
        }}
      />
      <span style={{ 
        fontSize: '10px', 
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'monospace'
      }}>
        {value}
      </span>
    </div>
  );
}