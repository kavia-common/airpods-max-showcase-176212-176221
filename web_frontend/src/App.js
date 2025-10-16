import React, { useEffect } from 'react';
import './App.css';
import './index.css';
import { registerGsapPlugins } from './utils/gsapSetup';
import ThreeCanvas from './components/ThreeCanvas';

// PUBLIC_INTERFACE
function App() {
  // Initialize GSAP plugins once
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

      {/* Overlay sections that scroll over the fixed canvas */}
      <main className="sections">
        <section className="hero section">
          <div className="container">
            <span className="badge">Ocean Professional</span>
            <h1 className="headline">AirPods Max Showcase</h1>
            <p className="sub">
              A premium, scroll-driven experience featuring a high-fidelity 3D product reveal powered by Three.js and GSAP ScrollTrigger.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-primary">Get Started</button>
              <a className="btn" href="https://greensock.com/scrolltrigger/" target="_blank" rel="noreferrer">GSAP Docs</a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="card container">
            <h2>Scrollytelling Ready</h2>
            <p>
              The layout is prepared with a fixed canvas background and scrollable overlay sections.
              Animations and 3D content will be integrated in subsequent steps.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="card container">
            <h2>Ocean Professional Theme</h2>
            <p>
              This app uses a modern theme with a subtle gradient background, blue and amber accents, and crisp typography.
            </p>
          </div>
        </section>

        <div className="spacer-xxl" />
      </main>
    </div>
  );
}

export default App;
