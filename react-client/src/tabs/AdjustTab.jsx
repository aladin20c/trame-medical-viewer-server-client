import { SliderControl } from './CommonControls';

function AdjustTab({ onTrigger, styles }) {
  return (
    <>
      <SliderControl label="Brightness" value={65} styles={styles} />
      <SliderControl label="Contrast" value={80} styles={styles} />
      <SliderControl label="Window Width" value={400} min={1} max={4000} styles={styles} />
      <SliderControl label="Window Level" value={40} min={-1000} max={3000} styles={styles} />

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Color Map</div>
        <select style={styles.select}>
          <option>Grayscale</option>
          <option>Hot Metal</option>
          <option>Cool</option>
          <option>Bone</option>
          <option>PET Heat</option>
        </select>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Lighting</div>
        <SliderControl label="Ambient" value={0.3} min={0} max={1} styles={styles} />
        <SliderControl label="Diffuse" value={0.8} min={0} max={1} styles={styles} />
        <SliderControl label="Specular" value={0.5} min={0} max={1} styles={styles} />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Presets</div>
        <button style={styles.button} onClick={() => onTrigger("preset_ct_abdomen")}>
          CT Abdomen
        </button>
        <button style={styles.button} onClick={() => onTrigger("preset_ct_lung")}>
          CT Lung
        </button>
        <button style={styles.button} onClick={() => onTrigger("preset_ct_bone")}>
          CT Bone
        </button>
        <button style={styles.button} onClick={() => onTrigger("preset_mri_brain")}>
          MRI Brain
        </button>
      </div>
    </>
  );
}

export default AdjustTab;