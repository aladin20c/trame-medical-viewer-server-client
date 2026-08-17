import { useState } from 'react';
import { SliderControl, ToggleControl } from './CommonControls';

function RenderTab({
  resolution,
  onResolutionChange,
  onTrigger,
  styles
}) {
  const [bgColor, setBgColor] = useState('#1a1a1a');

  const [orientationType, setOrientationType] = useState('cube');
  const [orientationSize, setOrientationSize] = useState(30);
  const [orientationVisible, setOrientationVisible] = useState(true);

  const [labelsVisible, setLabelsVisible] = useState(true);
  const [labelsSize, setLabelsSize] = useState(14);


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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px'
          }}
        >
          <input
            type="color"
            value={bgColor}
            onChange={(e) =>
              handleBgColorChange(e.target.value)
            }
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
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)'
            }}
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
          checked={orientationVisible}
          onChange={handleOrientationVisibilityChange}
          styles={styles}
        />

        <select
          style={styles.select}
          value={orientationType}
          onChange={(e) =>
            handleOrientationTypeChange(e.target.value)
          }
          disabled={!orientationVisible}
        >
          <option value="cube">
            Anatomical Cube
          </option>

          <option value="axes">
            Axes
          </option>

          <option value="cat">
            Cat
          </option>

          <option value="human">
            Human Figure
          </option>

          <option value="brain">
            Brain
          </option>

          <option value="heart">
            Heart
          </option>

          <option value="skull">
            Skull
          </option>

          <option value="spine">
            Spine
          </option>

          <option value="lungs">
            Lungs
          </option>

          <option value="liver">
            Liver
          </option>

          <option value="kidney">
            Kidney
          </option>

          <option value="stomach">
            Stomach
          </option>
        </select>

        <SliderControl
          label="Size"
          value={orientationSize}
          min={5}
          max={100}
          unit="%"
          onChange={handleOrientationSizeChange}
          styles={styles}
          disabled={!orientationVisible}
        />
      </div>
      {/*
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Anatomical Labels
        </div>

        <ToggleControl
          label="Show"
          checked={labelsVisible}
          onChange={handleLabelsVisibilityChange}
          styles={styles}
        />

        <SliderControl
          label="Size"
          value={labelsSize}
          min={8}
          max={32}
          unit="px"
          onChange={handleLabelsSizeChange}
          styles={styles}
          disabled={!labelsVisible}
        />
      </div>
      */}
    </>
  );
}

export default RenderTab;