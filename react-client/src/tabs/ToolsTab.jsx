function ToolsTab({ onTrigger, styles }) {
  return (
    <>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Camera</div>
        <button style={styles.button} onClick={() => onTrigger("reset_camera")}>
          Reset Camera
        </button>
        <button style={styles.button} onClick={() => onTrigger("start_animation")}>
          Start Animation
        </button>
        <button style={styles.button} onClick={() => onTrigger("screenshot")}>
          Screenshot
        </button>
        <button style={styles.button} onClick={() => onTrigger("toggle_fullscreen")}>
          Fullscreen
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Measurements</div>
        <button style={styles.button} onClick={() => onTrigger("tool_distance")}>
          Distance
        </button>
        <button style={styles.button} onClick={() => onTrigger("tool_angle")}>
          Angle
        </button>
        <button style={styles.button} onClick={() => onTrigger("tool_roi")}>
          ROI Analysis
        </button>
        <button style={styles.button} onClick={() => onTrigger("tool_probe")}>
          Probe Value
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Annotations</div>
        <button style={styles.button} onClick={() => onTrigger("add_text")}>
          Add Text
        </button>
        <button style={styles.button} onClick={() => onTrigger("add_arrow")}>
          Add Arrow
        </button>
        <button style={styles.button} onClick={() => onTrigger("clear_annotations")}>
          Clear All
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Export</div>
        <button style={styles.button} onClick={() => onTrigger("export_dicom")}>
          DICOM
        </button>
        <button style={styles.button} onClick={() => onTrigger("export_nifti")}>
          NIfTI
        </button>
        <button style={styles.button} onClick={() => onTrigger("export_obj")}>
          OBJ / STL
        </button>
        <button style={styles.button} onClick={() => onTrigger("export_screenshot")}>
          Screenshot Series
        </button>
      </div>
    </>
  );
}

export default ToolsTab;