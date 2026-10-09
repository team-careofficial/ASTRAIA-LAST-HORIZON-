ASTRAIA real 3D models (optional)
Put GLB files here and ASTRAIA uses them automatically. If a file is missing, the built-in procedural model is used.

  astronaut.glb   Rigged astronaut with animation clips named like Idle, Walk, Run
  rover.glb       Rover facing +Z (forward)
  spaceship.glb   Spacecraft facing +Z (nose forward)
  habitat.glb     Surface habitat, origin on the ground at its centre
  lander.glb      Lander, origin on the ground under its centre

If a model is too big, too small or turned the wrong way, change MODEL_CFG in src/components/world/Models.tsx
(scale, rotY, y). Free public-domain NASA models are available from NASA's 3D Resources library.
Keep each file small (under about 10 MB, Draco or Meshopt compressed) for smooth browser play.
