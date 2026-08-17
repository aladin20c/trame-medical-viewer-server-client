import { useState, useEffect } from 'react';
import { SliderControl, ToggleControl } from './CommonControls';
import { rgbArrayToHex, hexToRgbArray } from './../utils/colorUtils';


function RenderTab({ onTrigger, onGetState, styles }) {
const [isLoading, setIsLoading] = useState(true);
const [bgColor, setBgColor] = useState('#1a1a1a');
const [orientationType, setOrientationType] = useState('cube');
const [orientationSize, setOrientationSize] = useState(30);
const [orientationVisible, setOrientationVisible] = useState(true);


  const orientationTypes = [
    "cube",
    "axes",
    "cat",
    "human",
    "brain",
    "heart",
    "skull",
    "spine",
    "lungs",
    "liver",
    "kidney",
    "stomach",
  ];


  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await onGetState(
          'background_color',
          'orientation_marker_type',
          'orientation_marker_size',
          'orientation_marker_visible',
        );
        const values = response.state;
        setBgColor(rgbArrayToHex(values.background_color));
        setOrientationType(values.orientation_marker_type);
        setOrientationSize(values.orientation_marker_size);
        setOrientationVisible(values.orientation_marker_visible);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSettings();
  }, []);


  const handleBgColorChange = (color) => {
    setBgColor(color);
    onTrigger('set_background_color', [color]);
  };

  const handleOrientationTypeChange = (type) => {
    setOrientationType(type);
    onTrigger('set_orientation_marker', [type]);
  };


  const handleOrientationSizeChange = (size) => {
    setOrientationSize(size);
    onTrigger('set_orientation_marker_size', [size]);
  };


  const handleOrientationVisibilityChange = (visible) => {
    setOrientationVisible(visible);
    onTrigger('set_orientation_marker_visibility', [visible]);
  };

  const handleLabelsVisibilityChange = (visible) => {
    setLabelsVisible(visible);
    onTrigger('toggle_anatomical_labels', [visible]);
  };


  const handleLabelsSizeChange = (size) => {
    setLabelsSize(size);
    onTrigger('set_labels', [size]);
  };


  return (
    <>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Background</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <input
            type="color"
            disabled={isLoading}
            value={bgColor}
            onChange={(e) => handleBgColorChange(e.target.value) }
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

          <span
            style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}
          >
            {bgColor}
          </span>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Orientation Marker
        </div>

        <ToggleControl
          label="Show"
          disabled={isLoading}
          checked={orientationVisible}
          onChange={handleOrientationVisibilityChange}
          styles={styles}
        />

        {orientationVisible && (
          <>
            <select
              style={styles.select}
              value={orientationType}
              onChange={(e) => handleOrientationTypeChange(e.target.value)}
              disabled={!orientationVisible || isLoading}
            >
              {orientationTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <SliderControl
              label="Size"
              value={orientationSize}
              min={5}
              max={100}
              unit="%"
              onChange={setOrientationSize}
              onCommit={handleOrientationSizeChange}
              styles={styles}
              disabled={!orientationVisible  || isLoading}
            />
          </>)
        }
      </div>
    </>
  );
}

export default RenderTab;