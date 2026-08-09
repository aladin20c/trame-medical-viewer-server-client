import { useState } from 'react';

const styles = {
  sidebar: (isHovered) => ({
    position: 'absolute',
    right: '24px',
    top: '24px',
    bottom: '24px',
    width: '260px',
    background: isHovered 
      ? 'rgba(20, 20, 20, 0.85)' 
      : 'rgba(20, 20, 20, 0.4)',
    backdropFilter: isHovered ? 'blur(20px)' : 'blur(8px)',
    borderRadius: '16px',
    padding: '16px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: isHovered 
      ? '1px solid rgba(255, 255, 255, 0.15)' 
      : '1px solid rgba(255, 255, 255, 0.06)',
    boxShadow: isHovered 
      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
      : '0 4px 16px rgba(0, 0, 0, 0.15)',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  tabs: {
    display: 'flex',
    gap: '2px',
    marginBottom: '16px',
    padding: '2px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
  },
  tab: (isActive) => ({
    flex: 1,
    padding: '6px 8px',
    fontSize: '11px',
    fontWeight: '500',
    textAlign: 'center',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s',
    background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    color: isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
    border: 'none',
    fontFamily: 'inherit',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }),
  scrollArea: {
    overflowY: 'auto',
    flex: 1,
    paddingRight: '6px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
  },
  section: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'rgba(255, 255, 255, 0.35)',
    marginBottom: '10px',
  },
  sliderGroup: {
    marginBottom: '10px',
  },
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    marginBottom: '4px',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  value: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontVariantNumeric: 'tabular-nums',
  },
  slider: {
    width: '100%',
    height: '2px',
    appearance: 'none',
    background: 'rgba(255, 255, 255, 0.12)',
    borderRadius: '1px',
    outline: 'none',
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    padding: '6px 10px',
    marginBottom: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '6px 10px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: '6px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '4px',
    marginBottom: '6px',
  },
  smallButton: {
    flex: 1,
    padding: '5px 8px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '10px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
    textAlign: 'center',
  },
};

function SliderControl({ label, value, min = 0, max = 100, unit = '', onChange }) {
  return (
    <div style={styles.sliderGroup}>
      <div style={styles.label}>
        <span>{label}</span>
        <span style={styles.value}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={styles.slider}
      />
    </div>
  );
}

const TABS = {
  RENDER: 'Render',
  VIEW: 'View',
  ADJUST: 'Adjust',
  TOOLS: 'Tools',
};

function Sidebar({ resolution, onResolutionChange, onTrigger }) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.RENDER);

  const renderTab = (
    <>
      <SliderControl
        label="Resolution"
        value={resolution}
        min={3}
        max={60}
        onChange={onResolutionChange}
      />
      <SliderControl label="Opacity" value={70} unit="%" />
      <SliderControl label="Threshold" value={50} />
      <SliderControl label="Sample Distance" value={0.5} min={0.1} max={2} />
      
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Quality</div>
        <select style={styles.select}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select style={styles.select}>
          <option>CPU Rendering</option>
          <option>GPU Rendering</option>
        </select>
      </div>
    </>
  );

  const viewTab = (
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

      <SliderControl label="Slice Position" value={128} min={0} max={256} />
      <SliderControl label="Zoom" value={1} min={0.5} max={3} />
    </>
  );

  const adjustTab = (
    <>
      <SliderControl label="Brightness" value={65} />
      <SliderControl label="Contrast" value={80} />
      <SliderControl label="Window Width" value={400} min={1} max={4000} />
      <SliderControl label="Window Level" value={40} min={-1000} max={3000} />
      
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
        <SliderControl label="Ambient" value={0.3} min={0} max={1} />
        <SliderControl label="Diffuse" value={0.8} min={0} max={1} />
        <SliderControl label="Specular" value={0.5} min={0} max={1} />
      </div>
    </>
  );

  const toolsTab = (
    <>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Camera</div>
        <button 
          style={styles.button}
          onClick={() => onTrigger("reset_camera")}
        >
          Reset Camera
        </button>
        <button 
          style={styles.button}
          onClick={() => onTrigger("start_animation")}
        >
          Start Animation
        </button>
        <button style={styles.button}>
          Screenshot
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Measurements</div>
        <button style={styles.button}>Distance</button>
        <button style={styles.button}>Angle</button>
        <button style={styles.button}>ROI Analysis</button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Export</div>
        <button style={styles.button}>DICOM</button>
        <button style={styles.button}>NIfTI</button>
        <button style={styles.button}>OBJ/STL</button>
      </div>
    </>
  );

  return (
    <div
      style={styles.sidebar(isHovered)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.tabs}>
        {Object.values(TABS).map(tab => (
          <button
            key={tab}
            style={styles.tab(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={styles.scrollArea}>
        {activeTab === TABS.RENDER && renderTab}
        {activeTab === TABS.VIEW && viewTab}
        {activeTab === TABS.ADJUST && adjustTab}
        {activeTab === TABS.TOOLS && toolsTab}
      </div>
    </div>
  );
}

export default Sidebar;