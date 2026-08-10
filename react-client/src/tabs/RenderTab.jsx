import { useState } from 'react';
import { SliderControl, ToggleControl } from './CommonControls';

function RenderTab({ resolution, onResolutionChange, onTrigger, styles }) {
  const [bgColor, setBgColor] = useState('#1a1a1a');
  const [orientationType, setOrientationType] = useState('cube');
  const [orientationSize, setOrientationSize] = useState(30);
  const [orientationVisible, setOrientationVisible] = useState(true);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [labelsSize, setLabelsSize] = useState(14);


  const handleBgColorChange = (color) => {
    setBgColor(color);
    onTrigger("set_background_color", [color]);
  };


  return (
    <>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Background</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => handleBgColorChange(e.target.value)}
            style={{
              width: '28px',
              height: '28px',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              cursor: 'pointer',
              padding: '2px',
              background: bgColor,
              WebkitAppearance: 'none',
            }}
          />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{bgColor}</span>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Orientation Marker</div>
        <ToggleControl label="Show" checked={orientationVisible} onChange={setOrientationVisible} styles={styles} />
        <select
          style={styles.select}
          value={orientationType}
          onChange={(e) => setOrientationType(e.target.value)}
          disabled={!orientationVisible}
        >
          <option value="cube">Cube</option>
          <option value="axes">Axes</option>
          <option value="human">Human Figure</option>
        </select>
        <SliderControl label="Size" value={orientationSize} min={10} max={100} unit="px" onChange={setOrientationSize} styles={styles} />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Anatomical Labels</div>
        <ToggleControl label="Show" checked={labelsVisible} onChange={setLabelsVisible} styles={styles} />
        <SliderControl label="Size" value={labelsSize} min={8} max={32} unit="px" onChange={setLabelsSize} styles={styles} />
      </div>
    </>
  );
}

export default RenderTab;