import * as THREE from 'three';
import {
  CAMERA_DEFAULTS,
  RENDERER_CLEAR_ALPHA,
  RENDERER_CLEAR_COLOR,
  TONE_MAPPING,
  OUTPUT_COLOR_SPACE,
  LIGHTS,
} from './constants';

// PUBLIC_INTERFACE
export function createRenderer({ canvas }) {
  /**
   * Creates and configures a WebGLRenderer bound to the provided canvas.
   * Applies color space, tone mapping, and transparent background for overlay layering.
   */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true, // keep background transparent to show page background
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });
  renderer.setClearColor(RENDERER_CLEAR_COLOR, RENDERER_CLEAR_ALPHA);

  // Configure color space and tone mapping
  if (THREE?.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (THREE?.ACESFilmicToneMapping) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
  } else {
    // fallback to THREE.ACESFilmicToneMapping constant if string provided in constants
    renderer.toneMapping = THREE[TONE_MAPPING] || THREE.NoToneMapping;
  }

  // Initial sizing; caller should set proper pixel ratio and size once DOM is known
  renderer.setSize(1, 1, false);
  return renderer;
}

// PUBLIC_INTERFACE
export function createCamera({ aspect }) {
  /**
   * Creates a PerspectiveCamera with sensible defaults and initial framing.
   */
  const { fov, near, far, position, lookAt } = CAMERA_DEFAULTS;
  const camera = new THREE.PerspectiveCamera(fov, aspect || 1, near, far);
  camera.position.set(position.x, position.y, position.z);
  camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
  return camera;
}

// PUBLIC_INTERFACE
export function createSceneWithLights() {
  /**
   * Creates a Scene with a subtle environment lighting rig:
   * - Hemisphere light for ambient sky/ground balance
   * - Directional key, fill, and rim lights
   */
  const scene = new THREE.Scene();

  // Hemisphere light
  const hemi = new THREE.HemisphereLight(
    LIGHTS.hemisphere.skyColor,
    LIGHTS.hemisphere.groundColor,
    LIGHTS.hemisphere.intensity
  );
  scene.add(hemi);

  // Key light
  const key = new THREE.DirectionalLight(
    LIGHTS.keyDirectional.color,
    LIGHTS.keyDirectional.intensity
  );
  key.position.set(
    LIGHTS.keyDirectional.position.x,
    LIGHTS.keyDirectional.position.y,
    LIGHTS.keyDirectional.position.z
  );
  scene.add(key);

  // Fill light
  const fill = new THREE.DirectionalLight(
    LIGHTS.fillDirectional.color,
    LIGHTS.fillDirectional.intensity
  );
  fill.position.set(
    LIGHTS.fillDirectional.position.x,
    LIGHTS.fillDirectional.position.y,
    LIGHTS.fillDirectional.position.z
  );
  scene.add(fill);

  // Rim light
  const rim = new THREE.DirectionalLight(
    LIGHTS.rimDirectional.color,
    LIGHTS.rimDirectional.intensity
  );
  rim.position.set(
    LIGHTS.rimDirectional.position.x,
    LIGHTS.rimDirectional.position.y,
    LIGHTS.rimDirectional.position.z
  );
  scene.add(rim);

  return scene;
}

// PUBLIC_INTERFACE
export function resizeRendererToDisplaySize(renderer, camera, maxPixelRatio = 2) {
  /**
   * Resizes renderer and updates camera aspect based on the canvas client size.
   * Caps device pixel ratio for performance.
   */
  const canvas = renderer.domElement;
  const dpr = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr);
  if (needResize) {
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    if (camera && camera.isPerspectiveCamera) {
      camera.aspect = width / height || 1;
      camera.updateProjectionMatrix();
    }
  }
  return needResize;
}

// PUBLIC_INTERFACE
export function disposeSceneResources(scene) {
  /**
   * Disposes known GPU resources in the scene to avoid leaks on unmount.
   */
  scene.traverse((obj) => {
    if (obj.isMesh) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            if (m.map) m.map.dispose?.();
            m.dispose?.();
          });
        } else {
          if (obj.material.map) obj.material.map.dispose?.();
          obj.material.dispose?.();
        }
      }
    }
  });
}
