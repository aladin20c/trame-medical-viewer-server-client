import { SliderControl } from './CommonControls';

function ViewTab({ onTrigger, styles }) {
  return (
    <>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Orientation</div>
        <div style={styles.buttonGroup}>
          <button style={styles.smallButton}>Axial</button>
          <button style={styles.smallButton}>Coronal</button>
          <button style={styles.smallButton}>Sagittal</button>
        </div>
        <select style={styles.select}>
          <option>3D Perspective</option>
          <option>3D Orthographic</option>
          <option>2D Slice</option>
        </select>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Display</div>
        <div style={styles.buttonGroup}>
          <button style={styles.smallButton}>Volume</button>
          <button style={styles.smallButton}>Wireframe</button>
        </div>
        <div style={styles.buttonGroup}>
          <button style={styles.smallButton}>Points</button>
          <button style={styles.smallButton}>Surface</button>
        </div>
      </div>

      <SliderControl label="Slice Position" value={128} min={0} max={256} styles={styles} />
      <SliderControl label="Zoom" value={1} min={0.5} max={3} styles={styles} />
    </>
  );
}

export default ViewTab;