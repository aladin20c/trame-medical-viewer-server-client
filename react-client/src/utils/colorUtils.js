/**
 * Converts an RGB array [r, g, b] with values 0-1 to hex color string
 */
export const rgbArrayToHex = (rgbArray) => {
  if (!Array.isArray(rgbArray) || rgbArray.length !== 3) {
    console.warn('Invalid RGB array:', rgbArray);
    return '#1a1a1a';
  }

  const [r, g, b] = rgbArray.map((value) => {
    const normalized = Math.round(Math.min(Math.max(value, 0), 1) * 255);
    return normalized.toString(16).padStart(2, '0');
  });

  return `#${r}${g}${b}`;
};

/**
 * Converts a hex color string to RGB array [r, g, b] with values 0-1
 */
export const hexToRgbArray = (hex) => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r / 255, g / 255, b / 255];
};