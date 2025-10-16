import React, { useRef } from 'react';
import { useThreeAirpods } from '../three/useThreeAirpods';

// PUBLIC_INTERFACE
export default function ThreeCanvas({ modelUrl }) {
  /**
   * Fixed, full-viewport canvas that hosts the Three.js renderer and scene.
   * Pointer events are disabled to allow overlay interactions.
   */
  const canvasRef = useRef(null);
  useThreeAirpods({ canvasRef, modelUrl });

  // Style ensures canvas fills its parent (which should be a fixed full-viewport wrapper)
  const style = {
    width: '100%',
    height: '100%',
    display: 'block',
  };

  return <canvas ref={canvasRef} style={style} aria-hidden="true" />;
}
