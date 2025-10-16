import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { FALLBACK_GEO } from './constants';

// Resolve env-based defaults once at module load.
// CRA exposes env vars prefixed with REACT_APP_ on process.env at build time.
const DEFAULT_MODEL_URL = '/models/airpods-max/airpods-max.glb';
const ENV_MODEL_BASE = process?.env?.REACT_APP_MODEL_BASE_URL;
const RESOLVED_MODEL_URL = ENV_MODEL_BASE || DEFAULT_MODEL_URL;

const DEFAULT_DRACO_PATH = '/draco/';
const ENV_DRACO_PATH = process?.env?.REACT_APP_DRACO_PATH;
const RESOLVED_DRACO_PATH = (ENV_DRACO_PATH || DEFAULT_DRACO_PATH);

/**
 * PUBLIC_INTERFACE
 * Resolves the effective model URL to use, preferring the explicit url argument,
 * then REACT_APP_MODEL_BASE_URL, then the default path.
 */
// PUBLIC_INTERFACE
export function resolveModelUrl(url) {
  /** Returns a usable model URL string based on inputs and env defaults. */
  if (typeof url === 'string' && url.trim().length > 0) return url;
  return RESOLVED_MODEL_URL;
}

/**
 * PUBLIC_INTERFACE
 * Resolves the DRACO decoder path, preferring the explicit option, then env var,
 * then default '/draco/'.
 */
// PUBLIC_INTERFACE
export function resolveDracoPath(dracoPath) {
  /** Returns a usable Draco decoder path (must end with slash for loader). */
  const candidate = dracoPath || RESOLVED_DRACO_PATH;
  // Normalize to trailing slash as GLTFLoader expects a directory path
  return candidate.endsWith('/') ? candidate : `${candidate}/`;
}

// PUBLIC_INTERFACE
export async function loadAirpodsModel(url, { dracoPath } = {}) {
  /**
   * Attempts to load a GLTF/GLB model with DRACO and meshopt support.
   * Returns a Group/Scene if successful, otherwise returns a graceful fallback mesh.
   *
   * - url: string to model path (e.g., '/models/airpods-max/airpods-max.glb')
   * - dracoPath: path to Draco decoder files; ensure available in public if used.
   *
   * Env vars:
   * - REACT_APP_MODEL_BASE_URL (string) optional
   * - REACT_APP_DRACO_PATH (string) optional
   */
  const effectiveUrl = resolveModelUrl(url);
  const effectiveDracoPath = resolveDracoPath(dracoPath);

  try {
    const loader = new GLTFLoader();

    // DRACO support
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' }); // wasm can be used if assets provided
    dracoLoader.setDecoderPath(effectiveDracoPath);
    loader.setDRACOLoader(dracoLoader);

    // Meshopt support
    if (MeshoptDecoder) {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }

    const gltf = await loader.loadAsync(effectiveUrl);
    // Ensure color space for textures
    if (gltf.scene?.traverse) {
      gltf.scene.traverse((obj) => {
        if (obj.isMesh && obj.material && obj.material.map) {
          // three r152+ uses colorSpace
          if (obj.material.map.colorSpace) obj.material.map.colorSpace = THREE.SRGBColorSpace;
          else if (obj.material.map.encoding) obj.material.map.encoding = THREE.sRGBEncoding; // older fallback
        }
      });
    }
    return gltf.scene || gltf.scenes?.[0] || gltf;
  } catch (err) {
    // Graceful fallback: simple placeholder geometry with neutral material
    console.warn('[loadAirpodsModel] Failed to load model, using fallback geometry:', err?.message || err, {
      attemptedUrl: effectiveUrl,
      dracoPath: effectiveDracoPath,
    });
    return createFallbackMesh();
  }
}

// PUBLIC_INTERFACE
export function createFallbackMesh() {
  /**
   * Creates a simple, centered fallback mesh to avoid runtime errors when model is missing.
   * This ensures a visible object for render loop and prevents null references.
   */
  const geometry = new THREE.TorusKnotGeometry(0.5, 0.18, 120, 24);
  const material = new THREE.MeshStandardMaterial({
    color: FALLBACK_GEO.color,
    metalness: FALLBACK_GEO.metalness,
    roughness: FALLBACK_GEO.roughness,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = false;
  mesh.receiveShadow = false;

  const group = new THREE.Group();
  group.name = 'FallbackObject';
  group.add(mesh);

  return group;
}
