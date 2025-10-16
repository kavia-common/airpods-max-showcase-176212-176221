import React, { useEffect, useRef } from 'react';
import { useThreeAirpods } from '../three/useThreeAirpods';

// PUBLIC_INTERFACE
export default function ThreeCanvas({ modelUrl }) {
  /**
   * Fixed, full-viewport canvas that hosts the Three.js renderer and scene.
   * Pointer events are disabled to allow overlay interactions.
   * Exposes an imperative API on window.__threeAirpodsApi for GSAP timelines to control.
   */
  const canvasRef = useRef(null);
  const api = useThreeAirpods({ canvasRef, modelUrl });

  // Expose minimal imperative API for animations to use without tight coupling.
  useEffect(() => {
    const handle = {
      get camera() {
        return api.camera;
      },
      get scene() {
        return api.scene;
      },
      // Optional getter for model parts, could be wired later when model parsing is available
      getModelParts: () => {
        // In a real app, locate named sub-objects like 'Headband', 'Cup_L', 'Cup_R', 'Frame' etc.
        // For now, try to find a single root object if present.
        const root = api.scene?.children?.find?.((c) => c.name && c.name.toLowerCase().includes('airpods')) || api.scene?.children?.[0] || null;
        return {
          root,
        };
      },
      requestRender: api.requestRender,
    };

    // Attach to window (safe overwrite)
    window.__threeAirpodsApi = handle;

    return () => {
      if (window.__threeAirpodsApi === handle) {
        try {
          delete window.__threeAirpodsApi;
        } catch (_e) {
          window.__threeAirpodsApi = undefined;
        }
      }
    };
  }, [api]);

  // Style ensures canvas fills its parent (which should be a fixed full-viewport wrapper)
  const style = {
    width: '100%',
    height: '100%',
    display: 'block',
  };

  return <canvas ref={canvasRef} style={style} aria-hidden="true" />;
}
