# Archero Playable Ad Room - Project Instructions

## Core Objective
Create a highly performant, 3D playable ad room that replicates the core "move-and-stop" gameplay loop of Archero.

## Technical Requirements
- **Language:** TypeScript (Strict mode enabled).
- **Engine:** Three.js (Native).
- **Bundler:** Vite.
- **Architecture:** Class-based, following the `Experience` pattern established in the boilerplate.
- **Performance:** Optimized for mobile web (low poly models, efficient texture usage, minimal draw calls).

## Gameplay Loop
1. **Move:** Character follows joystick/mouse input.
2. **Stop:** Character automatically targets and shoots the nearest enemy when stationary.
3. **Environment:** Static room with boundaries.

## Development Standards
- Use TypeScript for all new logic.
- Maintain the `Experience` singleton pattern for global access to resources (Sizes, Time, Resources, Camera, Renderer).
- All assets should be managed through the `Resources` utility.
- Keep the build lightweight for fast loading in ad networks.
