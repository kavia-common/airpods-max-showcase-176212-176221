import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createRenderer, createCamera, createSceneWithLights, resizeRendererToDisplaySize, disposeSceneResources } from './sceneSetup';
import { MAX_PIXEL_RATIO } from './constants';
import { loadAirpodsModel } from './loadModel';

// PUBLIC_INTERFACE
export function useThreeAirpods({ canvasRef, modelUrl = null } = {}) {
  /**
   * React hook to create and manage a Three.js renderer, scene, and camera on a fixed canvas.
   * - Sets up lights, camera
   * - Loads model with graceful fallback
   * - Handles resize with DPR cap
   * - Runs requestAnimationFrame loop and cleans up on unmount
   */
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const rafRef = useRef(0);
  const [isReady, setIsReady] = useState(false);

  const init = useCallback(async () => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    // Create renderer
    const renderer = createRenderer({ canvas });
    rendererRef.current = renderer;

    // Scene and camera
    const scene = createSceneWithLights();
    sceneRef.current = scene;

    // Initial camera with aspect from canvas
    const rect = canvas.getBoundingClientRect();
    const camera = createCamera({ aspect: (rect.width || 1) / (rect.height || 1) });
    cameraRef.current = camera;

    // Optional: load the AirPods model if a URL is provided; else fallback mesh for demo
    let modelRoot = null;
    try {
      modelRoot = await loadAirpodsModel(modelUrl || '/assets/airpods-max.glb');
    } catch (_e) {
      // loader already returns fallback if fails
    }
    if (modelRoot) {
      scene.add(modelRoot);
    }

    // Initial size
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    renderer.setSize(rect.width || canvas.clientWidth, rect.height || canvas.clientHeight, false);

    setIsReady(true);

    // Start RAF
    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();

      // Tiny idle rotation for fallback demo if model name matches
      const target = modelRoot;
      if (target && (target.name === 'FallbackObject' || target.userData?.fallback)) {
        target.rotation.y += delta * 0.2;
      }

      renderer.render(scene, camera);
      rafRef.current = window.requestAnimationFrame(animate);
    };
    rafRef.current = window.requestAnimationFrame(animate);
  }, [canvasRef, modelUrl]);

  const handleResize = useCallback(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!renderer || !camera) return;
    resizeRendererToDisplaySize(renderer, camera, MAX_PIXEL_RATIO);
  }, []);

  useEffect(() => {
    init();

    // Resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      // Dispose resources
      const scene = sceneRef.current;
      if (scene) {
        disposeSceneResources(scene);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      // Clear refs
      rendererRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [init]);

  return {
    isReady,
    renderer: rendererRef.current,
    camera: cameraRef.current,
    scene: sceneRef.current,
    requestRender: () => {
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      if (renderer && camera && scene) renderer.render(scene, camera);
    },
  };
}
