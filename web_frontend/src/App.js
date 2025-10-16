import React, { useEffect } from 'react';
import './App.css';
import './index.css';
import { registerGsapPlugins } from './utils/gsapSetup';
import ThreeCanvas from './components/ThreeCanvas';
import SectionsContainer from './components/Sections/SectionsContainer';

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application with fixed Three.js canvas pinned behind overlay content.
   * Integrates sections stack for scrollytelling chapters.
   */
  useEffect(() => {
    registerGsapPlugins();
  }, []);

  return (
    <div className="App">
      {/* Fixed full-viewport canvas layer */}
      <div className="canvas-layer" aria-hidden="true">
        {/* Model path is optional; fallback geometry will render if not present */}
        <ThreeCanvas modelUrl="/assets/airpods-max.glb" />
      </div>

      {/* Overlay sections stacked above canvas */}
      <SectionsContainer />
    </div>
  );
}

export default App;
