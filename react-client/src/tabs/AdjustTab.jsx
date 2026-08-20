import { useState, useEffect } from 'react';
import { SliderControl, ToggleControl } from './CommonControls';
import TransferFunctionEditor from './TransferFunctionEditor';

function AdjustTab({ onTrigger, onGetState, styles }) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Window/Level settings
  const [brightness, setBrightness] = useState(65);
  const [contrast, setContrast] = useState(80);
  const [windowWidth, setWindowWidth] = useState(400);
  const [windowLevel, setWindowLevel] = useState(40);
  
  // Lighting settings
  const [ambient, setAmbient] = useState(0.3);
  const [diffuse, setDiffuse] = useState(0.8);
  const [specular, setSpecular] = useState(0.5);
  const [specularPower, setSpecularPower] = useState(32);
  
  // Cinematic rendering settings
  const [cinematicEnabled, setCinematicEnabled] = useState(false);
  const [cinematicQuality, setCinematicQuality] = useState('medium');
  const [cinematicScattering, setCinematicScattering] = useState(0.5);

  const qualityOptions = [
    'low',
    'medium',
    'high',
    'ultra',
  ];

  // Load settings from backend
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await onGetState(
          'brightness',
          'contrast',
          'window_width',
          'window_level',
          'lighting_ambient',
          'lighting_diffuse',
          'lighting_specular',
          'lighting_specular_power',
          'cinematic_rendering_enabled',
          'cinematic_quality',
          'cinematic_scattering',
        );
        const values = response.state;
        
        if (values.brightness !== undefined) setBrightness(values.brightness);
        if (values.contrast !== undefined) setContrast(values.contrast);
        if (values.window_width !== undefined) setWindowWidth(values.window_width);
        if (values.window_level !== undefined) setWindowLevel(values.window_level);

        if (values.lighting_ambient !== undefined) setAmbient(values.lighting_ambient);
        if (values.lighting_diffuse !== undefined) setDiffuse(values.lighting_diffuse);
        if (values.lighting_specular !== undefined) setSpecular(values.lighting_specular);
        if (values.lighting_specular_power !== undefined) setSpecularPower(values.lighting_specular_power);
        
        if (values.cinematic_rendering_enabled !== undefined) setCinematicEnabled(values.cinematic_rendering_enabled);
        if (values.cinematic_quality) setCinematicQuality(values.cinematic_quality);
        if (values.cinematic_scattering !== undefined) setCinematicScattering(values.cinematic_scattering);
        
      } catch (error) {
        console.error('Failed to load adjust settings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [onGetState]);

  // Window/Level handlers
  const handleBrightnessChange = (value) => {
    setBrightness(value);
    onTrigger('set_brightness', [value]);
  };

  const handleContrastChange = (value) => {
    setContrast(value);
    onTrigger('set_contrast', [value]);
  };

  const handleWindowWidthChange = (value) => {
    setWindowWidth(value);
    onTrigger('set_window_width', [value]);
  };

  const handleWindowLevelChange = (value) => {
    setWindowLevel(value);
    onTrigger('set_window_level', [value]);
  };

  // Lighting handlers
  const handleAmbientChange = (value) => {
    setAmbient(value);
    onTrigger('set_lighting_ambient', [value]);
  };

  const handleDiffuseChange = (value) => {
    setDiffuse(value);
    onTrigger('set_lighting_diffuse', [value]);
  };

  const handleSpecularChange = (value) => {
    setSpecular(value);
    onTrigger('set_lighting_specular', [value]);
  };

  const handleSpecularPowerChange = (value) => {
    setSpecularPower(value);
    onTrigger('set_lighting_specular_power', [value]);
  };

  // Cinematic rendering handlers
  const handleCinematicToggle = (enabled) => {
    setCinematicEnabled(enabled);
    onTrigger('cinematic_rendering_toggle', [enabled]);
  };

  const handleQualityChange = (quality) => {
    setCinematicQuality(quality);
    onTrigger('set_cinematic_quality', [quality]);// low, medium, high, ultra
  };

  const handleScatteringChange = (value) => {
    setCinematicScattering(value);
    onTrigger('set_cinematic_scattering', [value]);
  };


  return (
    <>
      {/* Window/Level */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Window / Level</div>
        <SliderControl
          label="Brightness"
          value={brightness}
          min={0}
          max={100}
          onChange={setBrightness}
          onCommit={handleBrightnessChange}
          styles={styles}
          disabled={isLoading}
        />
        <SliderControl
          label="Contrast"
          value={contrast}
          min={0}
          max={100}
          onChange={setContrast}
          onCommit={handleContrastChange}
          styles={styles}
          disabled={isLoading}
        />
        <SliderControl
          label="Window Width"
          value={windowWidth}
          min={1}
          max={4000}
          onChange={setWindowWidth}
          onCommit={handleWindowWidthChange}
          styles={styles}
          disabled={isLoading}
        />
        <SliderControl
          label="Window Level"
          value={windowLevel}
          min={-1000}
          max={3000}
          onChange={setWindowLevel}
          onCommit={handleWindowLevelChange}
          styles={styles}
          disabled={isLoading}
        />
      </div>

      {/* Transfer Function */}
      <TransferFunctionEditor
        onTrigger={onTrigger}
        onGetState={onGetState}
        styles={styles}
      />

      {/* Lighting */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Lighting</div>
        <SliderControl
          label="Ambient"
          value={ambient}
          min={0}
          max={1}
          step={0.01}
          onChange={setAmbient}
          onCommit={handleAmbientChange}
          styles={styles}
          disabled={isLoading}
        />
        <SliderControl
          label="Diffuse"
          value={diffuse}
          min={0}
          max={1}
          step={0.01}
          onChange={setDiffuse}
          onCommit={handleDiffuseChange}
          styles={styles}
          disabled={isLoading}
        />
        <SliderControl
          label="Specular"
          value={specular}
          min={0}
          max={1}
          step={0.01}
          onChange={setSpecular}
          onCommit={handleSpecularChange}
          styles={styles}
          disabled={isLoading}
        />
        <SliderControl
          label="Specular Power"
          value={specularPower}
          min={1}
          max={100}
          onChange={setSpecularPower}
          onCommit={handleSpecularPowerChange}
          styles={styles}
          disabled={isLoading}
        />
      </div>

      {/* Cinematic Rendering Toggle */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Cinematic Rendering</div>
        <ToggleControl
          label="Enable"
          disabled={isLoading}
          checked={cinematicEnabled}
          onChange={handleCinematicToggle}
          styles={styles}
        />
        
        {cinematicEnabled && (
          <>
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                Quality
              </div>
              <select
                style={styles.select}
                value={cinematicQuality}
                onChange={(e) => handleQualityChange(e.target.value)}
                disabled={isLoading}
              >
                {qualityOptions.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <SliderControl
              label="Scattering"
              value={cinematicScattering}
              min={0}
              max={1}
              step={0.01}
              onChange={setCinematicScattering}
              onCommit={handleScatteringChange}
              styles={styles}
              disabled={isLoading}
            />
          </>
        )}
      </div>
    </>
  );
}

export default AdjustTab;