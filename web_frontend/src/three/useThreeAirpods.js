import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createRenderer, createCamera, createSceneWithLights, resizeRendererToDisplaySize, disposeSceneResources, applyEnvironmentFromPMREM } from './sceneSetup';
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
   * - Pauses RAF when document is hidden (visibilitychange)
   */
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const rafRef = useRef(0);
  const [isReady, setIsReady] = useState(false);

  const startRAF = useCallback((scene, camera, renderer, modelRoot) => {
    if (!renderer || !camera || !scene) return;
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
  }, []);

  const stopRAF = useCallback(() => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

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
      // Ensure frustum culling is enabled for performance
      modelRoot.traverse?.((obj) => {
        if ('frustumCulled' in obj) obj.frustumCulled = true;
      });
      scene.add(modelRoot);
    }

    // Apply environment IBL if PMREM available; keep existing lights as fallback
    applyEnvironmentFromPMREM(renderer, scene);

    // Initial size with DPR cap
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(rect.width || canvas.clientWidth, rect.height || canvas.clientHeight, false);

    setIsReady(true);

    startRAF(scene, camera, renderer, modelRoot);
  }, [canvasRef, modelUrl, startRAF]);

  const handleResize = useCallback(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!renderer || !camera) return;
    resizeRendererToDisplaySize(renderer, camera, Math.min(MAX_PIXEL_RATIO, 1.75));
  }, []);

  useEffect(() => {
    init();

    // Resize listener
    window.addEventListener('resize', handleResize);

    // Pause RAF when tab/document is hidden for perf
    const onVisibility = () => {
      if (document.hidden) {
        stopRAF();
      } else {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        // trigger a render immediately on resume and restart RAF
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
          startRAF(scene, camera, renderer, scene?.children?.[0]);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', handleResize);
      stopRAF();

      // Dispose resources
      const scene = sceneRef.current;
      if (scene) {
        disposeSceneResources(scene);
        scene.environment = null;
        // Remove all children to allow GC
        while (scene.children.length) {
          scene.remove(scene.children[0]);
        }
      }
      if (rendererRef.current) {
        // dispose renderer and its internal render lists/RTs
        try {
          rendererRef.current.renderLists?.dispose?.();
        } catch (_) {}
        rendererRef.current.dispose();
      }
      // Clear refs
      rendererRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [init, handleResize, stopRAF, startRAF]);

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
