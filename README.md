# ASTRAIA: LAST HORIZON

A Moon and Mars mission design and exploration game for the NASA Space Apps Challenge (Team C.A.R.E).

```
npm install
npm run dev      # http://localhost:3000
npm run build
```

## What is in the game
- **Cinematic main menu** over a live 3D outpost (habitat, rover, two astronauts, lander, dish, solar field, wheel tracks, footprints). The Moon version appears when you hover or choose the Moon.
- **Destination Select**: Moon vs Mars, with distance, duration, gravity, comms delay, difficulty, hazards and science potential. Each value is tagged REAL (NASA fact sheet) or SIMULATED (game rating).
- **Mission Design in 8 steps**: Objective, Destination, Spacecraft, Launch Vehicle, Payload, Systems, Crew, Review. Every option shows its effect, WHY? and LEARN MORE. The readout shows Mass, Cost, Power margin, Fuel margin, Science, Communication and Risk live.
- **Design really changes gameplay**: starting battery, power, comms, fuel, science multiplier, supply use, storm resilience, cold protection, stress and rover range all come from `src/data/design/options.ts` (`designMods`).
- **Three modes**: Missions on foot (Mars campaign, 5 missions), Rover Expedition, Spacecraft Flight.
- **Rover**: third-person and cockpit view (V), terrain types (packed soil, loose sand, rocky ground, steep slope) that change speed, grip, shaking and dust, wheel tracks, dust plume, battery/solar/comms, science scanner, Earth uplink.
- **Physical emergencies**: an alarm sends the crew to real stations in the base (inspect, repair, verify). Power, air or the link keep dropping until the procedure is finished.
- **Mission Manual and contextual Guide** with REAL / CONCEPT / SIMULATED labels and Field Notes.
- **Animated Mission Debrief** with ending, score, science, engineering, resources, decisions, discoveries, critical events and timeline.
- **Graphics**: Low / Medium / High / Ultra and Auto-detect. Procedural models and textures need no downloads.

## Honesty about data
The game does not use live NASA data sets. Facts labelled REAL come from NASA fact sheets listed in `src/data/knowledge/sources.ts`. Everything else is a labelled simulation.

## Real 3D models (optional)
Drop GLB files into `public/models/` (see the README there): `astronaut.glb`, `rover.glb`, `spaceship.glb`, `habitat.glb`, `lander.glb`. Missing files fall back to the built-in procedural models, so the game never breaks.

## Design system
Fonts: Michroma (display), Barlow Semi Condensed (UI), JetBrains Mono (telemetry). Palette: graphite, warm Mars, lunar gray, off-white, amber and a restrained technical blue. Tokens are in `src/app/globals.css`.
