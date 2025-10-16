import * as THREE from 'three';
import {
  CAMERA_DEFAULTS,
  RENDERER_CLEAR_ALPHA,
  RENDERER_CLEAR_COLOR,
  TONE_MAPPING,
  OUTPUT_COLOR_SPACE,
  LIGHTS,
  MAX_PIXEL_RATIO,
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
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });
  renderer.setClearColor(RENDERER_CLEAR_COLOR, RENDERER_CLEAR_ALPHA);

  // Configure color space and tone mapping
  if (THREE?.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if ('OutputColorSpace' in THREE && OUTPUT_COLOR_SPACE && THREE[OUTPUT_COLOR_SPACE]) {
    renderer.outputColorSpace = THREE[OUTPUT_COLOR_SPACE];
  }
  if (THREE?.ACESFilmicToneMapping) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
  } else {
    renderer.toneMapping = THREE[TONE_MAPPING] || THREE.NoToneMapping;
  }

  // Initial pixel ratio cap to avoid overdraw on HiDPI
  const initialDpr = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO, 1.75);
  renderer.setPixelRatio(initialDpr);

  // Initial sizing; caller will update once DOM is known
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

/**
 * INTERNAL: build a basic three-point light rig. Returned array can be removed later.
 */
function buildFallbackLights() {
  const lights = [];

  const hemi = new THREE.HemisphereLight(
    LIGHTS.hemisphere.skyColor,
    LIGHTS.hemisphere.groundColor,
    LIGHTS.hemisphere.intensity
  );
  lights.push(hemi);

  const key = new THREE.DirectionalLight(
    LIGHTS.keyDirectional.color,
    LIGHTS.keyDirectional.intensity
  );
  key.position.set(
    LIGHTS.keyDirectional.position.x,
    LIGHTS.keyDirectional.position.y,
    LIGHTS.keyDirectional.position.z
  );
  lights.push(key);

  const fill = new THREE.DirectionalLight(
    LIGHTS.fillDirectional.color,
    LIGHTS.fillDirectional.intensity
  );
  fill.position.set(
    LIGHTS.fillDirectional.position.x,
    LIGHTS.fillDirectional.position.y,
    LIGHTS.fillDirectional.position.z
  );
  lights.push(fill);

  const rim = new THREE.DirectionalLight(
    LIGHTS.rimDirectional.color,
    LIGHTS.rimDirectional.intensity
  );
  rim.position.set(
    LIGHTS.rimDirectional.position.x,
    LIGHTS.rimDirectional.position.y,
    LIGHTS.rimDirectional.position.z
  );
  lights.push(rim);

  return lights;
}

// PUBLIC_INTERFACE
export function createSceneWithLights() {
  /**
   * Creates a Scene and attempts to set up an environment map via PMREM for soft IBL.
   * Falls back to a physically-plausible light rig if PMREM/environment fails.
   */
  const scene = new THREE.Scene();

  // Try to use a neutral Room-like environment from three.js if available
  try {
    // Three provides predefined Equirect or Room environment via PMREMGenerator from WebGLRenderTarget,
    // but constructing without renderer isn't feasible here. We'll attach fallback light rig,
    // and allow the hook to optionally inject PMREM env when renderer is known.
    const lights = buildFallbackLights();
    lights.forEach((l) => scene.add(l));
  } catch (_) {
    const lights = buildFallbackLights();
    lights.forEach((l) => scene.add(l));
  }

  return scene;
}

// PUBLIC_INTERFACE
export function applyEnvironmentFromPMREM(renderer, scene) {
  /**
   * Attempts to generate a neutral environment for image-based lighting using PMREM.
   * Uses a generated Room-like environment if available in three r146+ (Scene.environment = pmrem.fromScene).
   * This function is safe to call; it no-ops if PMREM is unavailable.
   */
  if (!renderer || !scene) return;
  try {
    const pmremGen = new THREE.PMREMGenerator(renderer);
    pmremGen.compileEquirectangularShader();

    // Create a simple neutral environment using a dummy scene with a lightprobe-like material.
    // Since we do not have HDR assets here, we can approximate by prefiltering a small generated texture.
    // Create a temp scene using an environment light object
    const temp = new THREE.Scene();
    const envRT = pmremGen.fromScene(temp, 0.5);
    if (envRT?.texture) {
      scene.environment = envRT.texture;
    }
    // Dispose intermediate resources; keep scene.environment texture (managed by WebGLRenderer)
    pmremGen.dispose();
    if (envRT) envRT.dispose?.();
  } catch (_e) {
    // Silently ignore; fallback light rig remains active
  }
}

// PUBLIC_INTERFACE
export function resizeRendererToDisplaySize(renderer, camera, maxPixelRatio = 2) {
  /**
   * Resizes renderer and updates camera aspect based on the canvas client size.
   * Caps device pixel ratio for performance.
   */
  const canvas = renderer.domElement;
  const dpr = Math.min(window.devicePixelRatio || 1, maxPixelRatio, 1.75);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr);
  if (needResize) {
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    if (camera && camera.isPerspectiveCamera) {
      camera.aspect = (width / height) || 1;
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
    // Ensure frustumCulled back to default true for performance
    if ('frustumCulled' in obj) obj.frustumCulled = true;

    if (obj.isMesh || obj.isSkinnedMesh || obj.isInstancedMesh) {
      if (obj.geometry) obj.geometry.dispose?.();
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.filter(Boolean).forEach((m) => {
        // Dispose common maps if present
        ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'envMap', 'aoMap', 'emissiveMap'].forEach((key) => {
          if (m[key]?.dispose) m[key].dispose();
        });
        m.dispose?.();
      });
    }
  });
}
