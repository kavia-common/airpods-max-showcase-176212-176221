//
// PUBLIC_INTERFACE
/**
 * Constants for Three.js scene setup, rendering configuration, and defaults.
 */
export const RENDERER_CLEAR_COLOR = 0x000000;
export const RENDERER_CLEAR_ALPHA = 0.0; // transparent background for overlay sections
export const TONE_MAPPING = 'ACESFilmicToneMapping';
export const OUTPUT_COLOR_SPACE = 'SRGBColorSpace';
export const MAX_PIXEL_RATIO = 1.8; // cap for performance

export const CAMERA_DEFAULTS = {
  fov: 45,
  near: 0.1,
  far: 100,
  // initial position to frame a product at world origin
  position: { x: 0.5, y: 0.35, z: 2.2 },
  lookAt: { x: 0, y: 0, z: 0 },
};

export const LIGHTS = {
  hemisphere: {
    skyColor: 0xffffff,
    groundColor: 0x444444,
    intensity: 0.65,
  },
  keyDirectional: {
    color: 0xffffff,
    intensity: 1.1,
    position: { x: 3, y: 2, z: 2 },
  },
  fillDirectional: {
    color: 0xffffff,
    intensity: 0.5,
    position: { x: -2.5, y: 1.5, z: -1.5 },
  },
  rimDirectional: {
    color: 0xffffff,
    intensity: 0.8,
    position: { x: 0.5, y: 3.5, z: -3.5 },
  },
};

// PUBLIC_INTERFACE
export const FALLBACK_GEO = {
  color: 0x888888,
  metalness: 0.2,
  roughness: 0.65,
};
