# Product Requirements Document (PRD) & Technical Brief

**Project Title:** Isaac Sánchez — Interactive WebGL & Creative Engineering Portfolio  
**Reference Benchmark:** [Belen Jones Portfolio](https://www.belenjones.com/)  
**Document Version:** 1.0.0  
**Target Environment:** Modern Desktop & Laptop Browsers (Chrome, Safari, Edge, Firefox with WebGL 2.0 support)  
**Author / Subject:** Isaac Andrey Sánchez Delgado (Systems Architecture & Creative Computing)

---

## 1. Executive Summary & Vision

The objective of this project is to develop an editorial brutalist, high-performance interactive portfolio web application for **Isaac Sánchez**, a Systems Engineer and Creative Developer based in Heredia, Costa Rica.

Taking architectural inspiration from the spatial minimalism and kinetic interactivity of *Belen Jones*, the site combines a monumental typographic index with an interactive, translucent 3D WebGL cube that dynamically reflects active projects and artist states through camera choreography, shader textures, and GSAP background transitions.

---

## 2. Core Personas & User Goals

- **Creative Directors & Design Agencies:** Evaluating technical fluency in WebGL, Three.js, GSAP transitions, and micro-interactions.
- **Engineering Leads & CTOs:** Assessing systems engineering capabilities (cloud architectures, database telemetry, containerization, microservices).
- **General Visitors & Peers:** Experiencing a smooth, zero-latency editorial portfolio with engaging tactile controls.

---

## 3. Information Architecture & Key Components

### 3.1 Global Header (Top Chrome)
- **Top Pill Navigation Bar:**
  - Left Pill: `ISAAC SÁNCHEZ` (Brand indicator / Home reset).
  - Right Segmented Pill Container:
    - `PROJECTS` (Active state / Anchor trigger).
    - `ABOUT` (Triggers floating glass/brutalist overlay modal).
    - `CONTACT` (Triggers mailto direct action: `isaac.sanchez@engineer.cr`).

### 3.2 Main Stage (Interactive Viewport)
- **Layout Model:** Fixed viewport layout (`100vw x 100vh`, `overflow: hidden`) optimized for 13–16" laptop screens (1366×768 to 1920×1080) with zero clipping.
- **Left-Aligned Typographic Index:**
  - Scaled via responsive fluid typography (`clamp(2.2rem, 4.2vw, 3.5rem)`).
  - Outline text rendering (`-webkit-text-stroke: 1.8px; color: transparent`) in idle state.
  - Solid dark/active fill on mouse hover or arrow navigation.
  - **Active Roster:**
    1. `BAD BUNNY.`
    2. `MICHAEL JACKSON.`
    3. `A$AP ROCKY.`
    4. `THE NEIGHBOURHOOD.`
    5. `AVICII.`
    6. `BRENT FAIYAZ.`
    7. `SADE.`

### 3.3 Three.js WebGL Interactive 3D Canvas
- **Positioning:** Floating canvas anchored centrally, offset subtly to the right (`x: +0.85`) to create visual counterweight to the left typography index.
- **Volume & Materiality:**
  - Hollow, translucent box geometry (`BoxGeometry(1.45, 1.45, 1.45)`) utilizing `THREE.DoubleSide` standard materials with transmission/translucency.
  - Outer brutalist wireframe cage (`BoxGeometry(1.6, 1.6, 1.6)`).
  - Inner glowing core octahedron (`OctahedronGeometry(0.56)`) reacting to active theme accent colors.
- **Dynamic Asset & Texture Mapping:**
  - In default/procedural states: Procedural 2D canvas textures rendering real-time audio blueprints, spectrograms, and monospace telemetry.
  - When `MICHAEL JACKSON.` is active: Maps the iconic red leather jacket visual archive (`michaeljackson.jpg`) directly across the cube's faces while smoothly reorienting the cube to face the viewer directly.
- **Kinetic Physics & User Input:**
  - Freeform pointer drag rotation with exponential inertia damping.
  - Spacebar hold acceleration boost (`4.5x` rotational velocity multiplier).
  - Subtle floating oscillation on the Y-axis (`sin(t * 1.5) * 0.04`).

### 3.4 Dynamic Atmospheric Background (GSAP)
- Smooth cross-fade color and gradient transitions linked to active item selection:
  - **BAD BUNNY.:** Soft pastel blue/cyan gradient (`#73A9AD` → `#eef5f5`).
  - **MICHAEL JACKSON.:** Deep crimson/noir state cross-fading with warm vertical texture blur (`fondo.jpg`).
  - **BRENT FAIYAZ.:** Pastel pink & sky blue gradient (`#FFB6C1` → `#87CEEB`).
  - **A$AP ROCKY.:** Monochromatic noir with testing amber-yellow accents (`#1c1c1c` → `#473d0a`).
  - **THE NEIGHBOURHOOD.:** Californian noir silver & slate (`#1a1e24` → `#2c333d`).
  - **AVICII.:** Anthemic cobalt & neon cyan (`#09203f` → `#00d2ff`).
  - **SADE.:** Warm vintage soul cognac & brushed gold (`#1f140e` → `#5a3c22`).

### 3.5 Floating Badges & Assistive UI
- **Contextual Project Badge:** Floating pill `[ VIEW ARTIST: <TITLE> ]` with pulsing accent dot.
- **Control Prompt Pill:** Bottom-centered pill `• PRESS SPACE OR DRAG TO ROTATE CUBE` with dynamic keypress visual feedback.

### 3.6 Global Footer (Bottom Chrome)
- **Left:** Monospace metadata `SYSTEM ARCHITECTURE & CREATIVE COMPUTING © 2025`.
- **Right:** Localized live 24-hour CST clock `HEREDIA, COSTA RICA — CST [HH:MM:SS]`.

### 3.7 About Overlay Modal
- Floating card with rounded corners displaying:
  - Profile: Isaac Andrey Sánchez Delgado.
  - Role: Systems Engineering & Creative Computing.
  - Specializations: Oracle/PostgreSQL database engineering, Azure Cloud orchestration, microservices architecture, and GLSL/WebGL graphics.
  - Action Links: `E-MAIL`, `LINKEDIN`, `GITHUB`.

---

## 4. Technical Stack & Implementation Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Structure** | Semantic HTML5 & Modern CSS3 | Strict DOM hierarchy, accessible navigation, layout clamping |
| **Styling** | Tailwind CSS + Custom CSS Variables | Fluid typography, typography outline strokes, brutalist borders |
| **3D Engine** | Three.js (r125+) | WebGL renderer, perspective camera, mesh grouping, lighting |
| **Animation** | GSAP (GreenSock) | Smooth easing on cube reorientation, background cross-fades |
| **Asset Pipeline** | TextureLoader + Dynamic Canvas Buffers | Instantaneous texture mapping and runtime UI rendering |
| **State Handling** | Vanilla JavaScript (ES6+ Closures) | Pointer inertia physics, active index synchronization, live clock |

---

## 5. Non-Functional & Performance Requirements

1. **Frame Rate:** Target constant 60 FPS on standard integrated GPUs (Intel Iris Xe / Apple Silicon M-series).
2. **Viewport Responsiveness:** Flawless rendering without horizontal or vertical scrollbars between `1280x720` and `2560x1440`.
3. **Memory Management:** Textures and procedural canvas buffers must call `.dispose()` upon switching projects to avoid WebGL context leakage.
4. **Graceful Fallback:** If WebGL fails or hardware acceleration is disabled, fallback cleanly to high-contrast static artwork and outline typography.

---

## 6. Milestones & Future Roadmap

- [x] **Phase 1:** Layout replication, pill navigation, and brutalist typography hierarchy.
- [x] **Phase 2:** Three.js translucent hollow cube setup with drag physics and spacebar booster.
- [x] **Phase 3:** Dynamic asset mapping (`michaeljackson.jpg` and `fondo.jpg`) with GSAP color morphing.
- [x] **Phase 4:** Laptop viewport optimization (1366×768 to 1920×1080 clearance) and artist roster customization.
- [ ] **Phase 5:** Sound design integration (tactile UI clicks and subtle ambient frequency hum on cube interaction).
- [ ] **Phase 6:** Expanded project deep-dive drawer pages with interactive case studies.
