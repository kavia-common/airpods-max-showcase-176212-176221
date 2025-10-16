# AirPods Max Scrollytelling Web Frontend

This single‑page React app delivers a Three.js + GSAP scrollytelling experience styled with the Ocean Professional theme. A fixed 3D canvas stays pinned behind text sections that advance animations as you scroll, with accessibility and performance optimizations applied.

## Quick start

1. Install and run:
   - cd web_frontend
   - npm install
   - npm start

2. Open the preview:
   - The dev server auto‑starts on http://localhost:3000 (port 3000).

3. Run tests:
   - CI=true npm test -- --watchAll=false

## Add the 3D model and optional DRACO decoders

The app will render a graceful fallback object if the model is missing, but to see the full product experience:

- Place the GLB file at:
  - web_frontend/public/models/airpods-max/airpods-max.glb

- Optional: add DRACO decoder files for compressed models at:
  - web_frontend/public/draco/
  Typical files include:
  - draco_decoder.js
  - draco_wasm_wrapper.js
  - draco_decoder.wasm

The loader resolves paths as follows:
- Model URL defaults to /models/airpods-max/airpods-max.glb unless overridden.
- DRACO path defaults to /draco/ and should end with a trailing slash.

## Environment variables

Copy .env.example to .env in web_frontend to override defaults if needed.

- REACT_APP_MODEL_BASE_URL
  Absolute or relative URL to the GLB. Default: /models/airpods-max/airpods-max.glb.
- REACT_APP_DRACO_PATH
  Directory path for DRACO decoder files. Default: /draco/. Ensure it ends with a slash.

These values are read at build time by create‑react‑app and used by src/three/loadModel.js.

## Verify scroll‑driven animations

- Start the dev server and scroll the page. The canvas stays pinned while sections progress.
- Labels defined in sections (intro, design, performance, timing, features, cta) are wired to the GSAP master timeline to drive camera moves and part transforms.
- If prefers‑reduced‑motion is enabled at the OS/browser level, heavy 3D timelines and pinning are disabled and content fades in gently instead.

## Performance notes

- Device Pixel Ratio cap: The renderer caps DPR to reduce overdraw on HiDPI screens for a smooth experience (see MAX_PIXEL_RATIO in src/three/constants.js).
- Render loop pause: The app pauses the RAF when the tab is hidden and resumes on return.
- Frustum culling and cleanup: Geometry and textures are disposed on unmount to prevent leaks.

## Development tips

- Theme: The Ocean Professional theme lives in src/theme.css and is applied globally via CSS variables with modern, minimalist styling.
- Model parts: The timeline uses safe fallbacks if named sub‑objects are not found. You can extend window.__threeAirpodsApi.getModelParts() in src/components/ThreeCanvas.jsx to return specific nodes (e.g., headband, cups) for more granular animations.
- Testing: Unit tests mock heavy WebGL and GSAP modules to keep CI fast. Use CI=true npm test -- --watchAll=false to run in non‑interactive mode.
- Draco: If you host DRACO decoders on a CDN, point REACT_APP_DRACO_PATH to that directory URL and include a trailing slash.

## Troubleshooting

- Missing model or 404s: Confirm the GLB is at public/models/airpods-max/airpods-max.glb or adjust REACT_APP_MODEL_BASE_URL.
- DRACO decode errors: Ensure public/draco/ contains the decoder files and that REACT_APP_DRACO_PATH ends with a slash.
- Reduced motion: If animations are not pinning or playing, check your OS/browser prefers‑reduced‑motion setting.
