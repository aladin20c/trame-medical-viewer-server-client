export function SliderControl({ label, value, min = 0, max = 100, unit = '', onChange, onCommit, styles }) {
  return (
    <div style={styles.sliderGroup}>
      <div style={styles.label}>
        <span>{label}</span>
        <span style={styles.value}>
          {value}{unit}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        onMouseUp={(e) =>
          onCommit(Number(e.target.value))
        }
        onTouchEnd={(e) =>
          onCommit(Number(e.target.value))
        }
        style={styles.slider}
      />
    </div>
  );
}

export function ToggleControl({ label, checked, onChange, styles }) {
  return (
    <div style={styles.toggleRow}>
      <span style={styles.toggleLabel}>{label}</span>
      <button style={styles.toggleButton(checked)} onClick={() => onChange(!checked)}>
        <div style={styles.toggleKnob(checked)} />
      </button>
    </div>
  );
}