import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { FALLBACK_GEO } from './constants';

// PUBLIC_INTERFACE
export async function loadAirpodsModel(url, { dracoPath = '/draco/' } = {}) {
  /**
   * Attempts to load a GLTF/GLB model with DRACO and meshopt support.
   * Returns a Group/Scene if successful, otherwise returns a graceful fallback mesh.
   *
   * - url: string to model path (e.g., '/assets/airpods-max.glb')
   * - dracoPath: path to Draco decoder files; ensure available in public if used.
   */
  try {
    const loader = new GLTFLoader();

    // DRACO support
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' }); // wasm could be used if assets provided
    dracoLoader.setDecoderPath(dracoPath);
    loader.setDRACOLoader(dracoLoader);

    // Meshopt support
    if (MeshoptDecoder) {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }

    const gltf = await loader.loadAsync(url);
    // Ensure color space for textures
    gltf.scene.traverse((obj) => {
      if (obj.isMesh && obj.material && obj.material.map) {
        // three r152+ uses colorSpace
        if (obj.material.map.colorSpace) obj.material.map.colorSpace = THREE.SRGBColorSpace;
        else if (obj.material.map.encoding) obj.material.map.encoding = THREE.sRGBEncoding; // older fallback
      }
    });
    return gltf.scene || gltf.scenes?.[0] || gltf;
  } catch (err) {
    // Graceful fallback: simple placeholder geometry with neutral material
    console.warn('[loadAirpodsModel] Failed to load model, using fallback geometry:', err?.message || err);
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
