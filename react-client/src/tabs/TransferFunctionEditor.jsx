import React, { useState, useRef, useEffect, useCallback } from 'react';

const TransferFunctionEditor = ({ onTrigger, onGetState, styles, width = 300, height = 150, dataRange = [-1000, 3000] }) => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [controlPoints, setControlPoints] = useState([
    { intensity: -1000, opacity: 0, color: [0, 0, 0] },
    { intensity: -200, opacity: 0.1, color: [0.3, 0.2, 0.1] },
    { intensity: 40, opacity: 0.5, color: [0.8, 0.5, 0.4] },
    { intensity: 400, opacity: 0.95, color: [1, 0.9, 0.8] },
    { intensity: 3000, opacity: 1.0, color: [1, 1, 1] },
  ]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const [selectedPreset, setSelectedPreset] = useState('Soft Tissue');
  const [selectedPalette, setSelectedPalette] = useState('Default');
  
  const presets = {
    'Soft Tissue': {
      displayRange: [-1000, 3000],
      points: [
        { intensity: -1000, opacity: 0.0, color: [0.0, 0.0, 0.0] },
        { intensity: -200, opacity: 0.0, color: [0.3, 0.2, 0.1] },
        { intensity: -50, opacity: 0.05, color: [0.6, 0.4, 0.3] },
        { intensity: 40, opacity: 0.4, color: [0.9, 0.7, 0.5] },
        { intensity: 80, opacity: 0.6, color: [0.9, 0.8, 0.6] },
        { intensity: 200, opacity: 0.8, color: [1.0, 0.9, 0.7] },
        { intensity: 400, opacity: 0.95, color: [1.0, 1.0, 1.0] },
        { intensity: 3000, opacity: 1.0, color: [1.0, 1.0, 1.0] },
      ]
    },
    'Bone': {
      displayRange: [-1000, 3000],
      points: [
        { intensity: -1000, opacity: 0.0, color: [0.0, 0.0, 0.0] },
        { intensity: -200, opacity: 0.0, color: [0.1, 0.1, 0.1] },
        { intensity: 200, opacity: 0.0, color: [0.5, 0.5, 0.5] },
        { intensity: 350, opacity: 0.2, color: [0.7, 0.7, 0.7] },
        { intensity: 450, opacity: 0.5, color: [0.8, 0.8, 0.8] },
        { intensity: 800, opacity: 0.8, color: [0.9, 0.9, 0.9] },
        { intensity: 1200, opacity: 0.95, color: [1.0, 1.0, 1.0] },
        { intensity: 3000, opacity: 1.0, color: [1.0, 1.0, 1.0] },
      ]
    },
    'Lung': {
      displayRange: [-1000, 100],
      points: [
        { intensity: -1000, opacity: 0.0, color: [0.0, 0.0, 0.0] },
        { intensity: -900, opacity: 0.1, color: [0.1, 0.1, 0.2] },
        { intensity: -800, opacity: 0.3, color: [0.2, 0.2, 0.3] },
        { intensity: -700, opacity: 0.5, color: [0.3, 0.3, 0.4] },
        { intensity: -600, opacity: 0.6, color: [0.4, 0.4, 0.5] },
        { intensity: -500, opacity: 0.7, color: [0.5, 0.4, 0.4] },
        { intensity: -400, opacity: 0.5, color: [0.6, 0.5, 0.4] },
        { intensity: -200, opacity: 0.2, color: [0.8, 0.7, 0.6] },
        { intensity: 0, opacity: 0.0, color: [0.9, 0.8, 0.7] },
        { intensity: 100, opacity: 0.0, color: [1.0, 0.9, 0.8] },
      ]
    },
    'Brain': {
      displayRange: [-1000, 3000],
      points: [
        { intensity: -1000, opacity: 0.0, color: [0.0, 0.0, 0.0] },
        { intensity: 0, opacity: 0.0, color: [0.2, 0.2, 0.3] },
        { intensity: 20, opacity: 0.3, color: [0.4, 0.4, 0.5] },
        { intensity: 35, opacity: 0.6, color: [0.6, 0.5, 0.5] },
        { intensity: 50, opacity: 0.8, color: [0.8, 0.7, 0.6] },
        { intensity: 100, opacity: 1.0, color: [1.0, 1.0, 1.0] },
        { intensity: 3000, opacity: 1.0, color: [1.0, 1.0, 1.0] },
      ]
    },
    'Full Range': {
      displayRange: [dataRange[0], dataRange[1]],
      points: [
        { intensity: dataRange[0], opacity: 0.0, color: [0.0, 0.0, 0.0] },
        { intensity: (dataRange[0] + dataRange[1]) / 2, opacity: 0.3, color: [0.5, 0.5, 0.5] },
        { intensity: dataRange[1], opacity: 1.0, color: [1.0, 1.0, 1.0] },
      ]
    },
  };

  const palettes = {
    'Default': [
      { color: [1, 1, 1], name: 'White' },
      { color: [1, 0.8, 0.6], name: 'Light Orange' },
      { color: [0.8, 0.6, 0.4], name: 'Brown' },
      { color: [0.6, 0.4, 0.2], name: 'Dark Brown' },
      { color: [0.4, 0.2, 0.1], name: 'Very Dark Brown' },
      { color: [0, 0, 0], name: 'Black' },
    ],
    'Hot': [
      { color: [1, 0, 0], name: 'Red' },
      { color: [1, 0.3, 0], name: 'Orange' },
      { color: [1, 0.7, 0], name: 'Yellow' },
      { color: [1, 1, 1], name: 'White' },
    ],
    'Cool': [
      { color: [0, 0.2, 1], name: 'Blue' },
      { color: [0, 0.6, 1], name: 'Light Blue' },
      { color: [0, 1, 1], name: 'Cyan' },
      { color: [1, 1, 1], name: 'White' },
    ],
    'Grayscale': [
      { color: [0, 0, 0], name: 'Black' },
      { color: [0.3, 0.3, 0.3], name: 'Dark Gray' },
      { color: [0.6, 0.6, 0.6], name: 'Gray' },
      { color: [0.8, 0.8, 0.8], name: 'Light Gray' },
      { color: [1, 1, 1], name: 'White' },
    ],
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await onGetState(
          'transfer_function_points',
          'transfer_function_preset',
          'transfer_function_palette',
        );
        const values = response.state;
        
        if (values.transfer_function_points) {
          const points = values.transfer_function_points;
          if (Array.isArray(points) && points.length >= 2) {
            setControlPoints(points);
          }
        }
        
        if (values.transfer_function_preset) {
          setSelectedPreset(values.transfer_function_preset);
        }
        
        if (values.transfer_function_palette) {
          setSelectedPalette(values.transfer_function_palette);
        }
      } catch (error) {
        console.error('Failed to load transfer function settings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSettings();
  }, [onGetState]);

  // Convert HU values to normalized (0-1) for canvas display
  const normalizeIntensity = useCallback((hu) => {
    const [lo, hi] = dataRange;
    return (hu - lo) / (hi - lo);
  }, [dataRange]);

  // Convert normalized (0-1) to HU values
  const denormalizeIntensity = useCallback((normalized) => {
    const [lo, hi] = dataRange;
    return lo + normalized * (hi - lo);
  }, [dataRange]);

  // Interpolate lines with Catmull-Rom spline
  const interpolatePoints = (points, numSamples = 200) => {
    if (points.length < 2) return points;
    
    const sortedPoints = [...points].sort((a, b) => a.intensity - b.intensity);
    const result = [];
    
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p0 = sortedPoints[Math.max(0, i - 1)];
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];
      const p3 = sortedPoints[Math.min(sortedPoints.length - 1, i + 2)];
      
      const steps = Math.floor(numSamples / (sortedPoints.length - 1));
      
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const intensity = catmullRomInterp(p0.intensity, p1.intensity, p2.intensity, p3.intensity, t);
        const opacity = catmullRomInterp(p0.opacity, p1.opacity, p2.opacity, p3.opacity, t);
        
        const color = [
          catmullRomInterp(p0.color[0], p1.color[0], p2.color[0], p3.color[0], t),
          catmullRomInterp(p0.color[1], p1.color[1], p2.color[1], p3.color[1], t),
          catmullRomInterp(p0.color[2], p1.color[2], p2.color[2], p3.color[2], t),
        ];
        
        result.push({
          intensity: Math.max(dataRange[0], Math.min(dataRange[1], intensity)),
          opacity: Math.max(0, Math.min(1, opacity)),
          color: color.map(c => Math.max(0, Math.min(1, c))),
        });
      }
    }
    
    const last = sortedPoints[sortedPoints.length - 1];
    result.push({ ...last });
    
    return result;
  };

  const catmullRomInterp = (p0, p1, p2, p3, t) => {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
  };

  // Apply palette to control points
  const applyPalette = useCallback((paletteName) => {
    if (!paletteName) return;
    
    const palette = palettes[paletteName];
    if (!palette) return;
    
    const newPoints = [...controlPoints];
    const sortedPoints = [...controlPoints].sort((a, b) => a.intensity - b.intensity);
    
    sortedPoints.forEach((point, index) => {
      const normalizedIndex = index / (sortedPoints.length - 1);
      const colorIndex = Math.round(normalizedIndex * (palette.length - 1));
      const color = palette[Math.min(colorIndex, palette.length - 1)].color;
      
      const originalIndex = controlPoints.indexOf(point);
      newPoints[originalIndex] = {
        ...newPoints[originalIndex],
        color: [...color],
      };
    });
    
    setControlPoints(newPoints);
    updateBackend(newPoints);
  }, [controlPoints, palettes]);

  // Draw transfer function with interpolation
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Interpolate points for smooth rendering
    const interpolatedPoints = interpolatePoints(controlPoints, 200);

    // Draw color gradient background
    for (let i = 0; i < w; i++) {
      const normalizedIntensity = i / w;
      const actualIntensity = denormalizeIntensity(normalizedIntensity);
      
      // Find closest interpolated points
      let closestPoint = interpolatedPoints[0];
      for (const point of interpolatedPoints) {
        if (point.intensity >= actualIntensity) {
          closestPoint = point;
          break;
        }
      }
      
      const [r, g, b] = closestPoint.color;
      ctx.fillStyle = `rgb(${r * 255},${g * 255},${b * 255})`;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(i, 0, 1, h);
    }
    ctx.globalAlpha = 1.0;

    // Draw opacity curve
    ctx.beginPath();
    ctx.moveTo(0, h);
    
    interpolatedPoints.forEach((point, i) => {
      const x = normalizeIntensity(point.intensity) * w;
      const y = h - point.opacity * h;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prev = interpolatedPoints[i - 1];
        const cpx = normalizeIntensity((prev.intensity + point.intensity) / 2) * w;
        const cpy = h - (prev.opacity + point.opacity) / 2 * h;
        ctx.quadraticCurveTo(cpx, cpy, x, y);
      }
    });
    
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.strokeStyle = '#4CAF80';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw control points
    controlPoints.forEach((point, index) => {
      const x = normalizeIntensity(point.intensity) * w;
      const y = h - point.opacity * h;
      
      const isSelected = index === selectedPoint;
      const isHovered = index === hoveredPoint;
      
      const gradient2 = ctx.createRadialGradient(x, y, 0, x, y, 10);
      gradient2.addColorStop(0, isSelected ? 'rgba(255, 107, 53, 0.4)' : 'rgba(76, 175, 128, 0.3)');
      gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient2;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 6 : isHovered ? 5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#FF6B35' : isHovered ? '#6BCB8F' : '#4CAF80';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0.1; i < 1; i += 0.1) {
      const x = i * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      
      const y = i * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

  }, [controlPoints, selectedPoint, hoveredPoint, dataRange, normalizeIntensity, denormalizeIntensity]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Send to backend with actual HU values
  const updateBackend = useCallback((points) => {
    if (!onTrigger) return;
    
    // Sort points by intensity
    const sortedPoints = [...points].sort((a, b) => a.intensity - b.intensity);
    
    // Extract values in the format backend expects
    const intensities = sortedPoints.map(p => p.intensity);
    const opacities = sortedPoints.map(p => p.opacity);
    const colors = sortedPoints.flatMap(p => p.color);
    
    onTrigger('set_transfer_function', [{
      preset: selectedPreset,
      intensities: intensities,
      opacities: opacities,
      colors: colors
    }]);
  }, [onTrigger, selectedPreset]);

  // Enhanced mouse handling with window-level event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging && selectedPoint !== null) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // Allow dragging even when mouse is outside canvas
        const rawX = (e.clientX - rect.left) * scaleX / canvas.width;
        const rawY = 1 - (e.clientY - rect.top) * scaleY / canvas.height;
        
        // Clamp values to [0, 1] range
        const normalizedX = Math.max(0, Math.min(1, rawX));
        const normalizedY = Math.max(0, Math.min(1, rawY));
        
        const newIntensity = denormalizeIntensity(normalizedX);
        const newOpacity = normalizedY;
        
        const newPoints = [...controlPoints];
        newPoints[selectedPoint] = {
          ...newPoints[selectedPoint],
          intensity: newIntensity,
          opacity: newOpacity,
        };
        
        // Ensure points stay in order
        if (selectedPoint > 0 && newPoints[selectedPoint].intensity <= newPoints[selectedPoint - 1].intensity) {
          newPoints[selectedPoint].intensity = newPoints[selectedPoint - 1].intensity + 1;
        }
        if (selectedPoint < newPoints.length - 1 && newPoints[selectedPoint].intensity >= newPoints[selectedPoint + 1].intensity) {
          newPoints[selectedPoint].intensity = newPoints[selectedPoint + 1].intensity - 1;
        }
        
        setControlPoints(newPoints);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        updateBackend(controlPoints);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, selectedPoint, controlPoints, denormalizeIntensity, updateBackend]);

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const normalizedX = (e.clientX - rect.left) * scaleX / canvas.width;
    const normalizedY = 1 - (e.clientY - rect.top) * scaleY / canvas.height;
    
    return {
      x: denormalizeIntensity(Math.max(0, Math.min(1, normalizedX))),
      y: Math.max(0, Math.min(1, normalizedY)),
    };
  };

  const findClosestPoint = (point) => {
    let minDist = Infinity;
    let closest = null;
    controlPoints.forEach((cp, index) => {
      const normalizedIntensity = normalizeIntensity(cp.intensity);
      const normalizedPointX = normalizeIntensity(point.x);
      const dist = Math.hypot(normalizedIntensity - normalizedPointX, cp.opacity - point.y);
      if (dist < minDist) {
        minDist = dist;
        closest = index;
      }
    });
    return minDist < 0.05 ? closest : null;
  };

  const handleMouseDown = (e) => {
    if (isLoading) return;
    
    const point = getCanvasPoint(e);
    const closest = findClosestPoint(point);
    if (closest !== null) {
      setSelectedPoint(closest);
      setIsDragging(true);
    } else if (controlPoints.length < 10) {
      const newPoints = [...controlPoints, {
        intensity: point.x,
        opacity: point.y,
        color: [0.8, 0.8, 0.8]
      }].sort((a, b) => a.intensity - b.intensity);
      setControlPoints(newPoints);
      const newIndex = newPoints.findIndex(p => p.intensity === point.x && p.opacity === point.y);
      setSelectedPoint(newIndex);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) {
      // Hover detection
      const point = getCanvasPoint(e);
      const closest = findClosestPoint(point);
      setHoveredPoint(closest);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      updateBackend(controlPoints);
    }
  };

  const handleDeletePoint = () => {
    if (selectedPoint !== null && controlPoints.length > 2) {
      const newPoints = controlPoints.filter((_, i) => i !== selectedPoint);
      setControlPoints(newPoints);
      setSelectedPoint(null);
      updateBackend(newPoints);
    }
  };

  const handleColorChange = (color) => {
    if (selectedPoint !== null) {
      const r = parseInt(color.substr(1, 2), 16) / 255;
      const g = parseInt(color.substr(3, 2), 16) / 255;
      const b = parseInt(color.substr(5, 2), 16) / 255;
      const newPoints = [...controlPoints];
      newPoints[selectedPoint] = {
        ...newPoints[selectedPoint],
        color: [r, g, b]
      };
      setControlPoints(newPoints);
      updateBackend(newPoints);
    }
  };

  const handlePresetChange = (presetName) => {
    setSelectedPreset(presetName);
    const preset = presets[presetName];
    if (preset && preset.points) {
      const newPoints = JSON.parse(JSON.stringify(preset.points));
      setControlPoints(newPoints);
      updateBackend(newPoints);
    }
  };

  const handlePaletteSelect = (paletteName) => {
    setSelectedPalette(paletteName);
    applyPalette(paletteName);
  };

  return (
    <>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Transfer Function
          {selectedPoint !== null && controlPoints.length > 2 && (
            <button 
              onClick={handleDeletePoint}
              disabled={isLoading}
              style={{
                background: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                padding: '2px 8px',
                cursor: 'pointer',
                fontSize: '11px',
                marginLeft: '10px',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              Delete Point
            </button>
          )}
        </div>

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setHoveredPoint(null);
          }}
          style={{
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '6px',
            cursor: isDragging ? 'grabbing' : 'crosshair',
            background: '#1a1a2e',
            width: '100%',
            height: 'auto',
            opacity: isLoading ? 0.5 : 1,
            pointerEvents: isLoading ? 'none' : 'auto',
          }}
        />

        {/* Selected point info and color picker */}
        {selectedPoint !== null && (
          <div style={{ 
            marginTop: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '6px 8px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '4px',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.8)' }}>
              Point {selectedPoint + 1}:
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
              HU: {Math.round(controlPoints[selectedPoint].intensity)} | 
              Opacity: {(controlPoints[selectedPoint].opacity * 100).toFixed(0)}%
            </span>
            <input
              type="color"
              disabled={isLoading}
              value={`#${controlPoints[selectedPoint].color.map(c => 
                Math.round(c * 255).toString(16).padStart(2, '0')
              ).join('')}`}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{ 
                width: '28px', 
                height: '28px', 
                padding: '2px',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                cursor: 'pointer',
                background: '#1a1a1a',
                WebkitAppearance: 'none',
              }}
            />
          </div>
        )}

        {/* Presets dropdown */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
            Presets
          </div>
          <select
            style={styles.select}
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            disabled={isLoading}
          >
            {Object.keys(presets).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Palettes */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
            Color Palettes
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            flexWrap: 'wrap',
            justifyContent: 'flex-start'
          }}>
            {Object.keys(palettes).map(name => (
              <button
                key={name}
                onClick={() => handlePaletteSelect(name)}
                disabled={isLoading}
                style={{
                  background: selectedPalette === name ? 'rgba(76, 175, 128, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: selectedPalette === name ? '1px solid #4CAF80' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  transition: 'all 0.2s',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '2px',
            marginTop: '6px',
            height: '10px',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            {palettes[selectedPalette]?.map((color, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  background: `rgb(${color.color[0] * 255}, ${color.color[1] * 255}, ${color.color[2] * 255})`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Intensity scale labels */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '10px', 
          color: 'rgba(255,255,255,0.4)',
          marginTop: '8px',
          padding: '0 2px'
        }}>
          <span>{dataRange[0]} HU</span>
          <span>Intensity</span>
          <span>{dataRange[1]} HU</span>
        </div>
      </div>
    </>
  );
};

export default TransferFunctionEditor;