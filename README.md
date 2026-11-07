# ASTRAIA: LAST HORIZON

**NASA Space Apps Challenge 2026, Bangladesh · Challenge 13: Space Mission Design Game**
Team OMNITRIX (Team C.A.R.E). Live game: https://astraia-last-horizon.vercel.app/

A browser game where you design a Moon or Mars mission, check whether it really closes with real NASA numbers, then drive, walk and fly it. It runs on phones and laptops, in English and Bangla (Closure screen).

## Team
| Member | Role |
| --- | --- |
| Debojit Saha Jit | Frontend Developer: interface, visuals, player experience |
| Sabit Islam Efty | Backend Developer: architecture and supporting systems |
| Shafayet Biswas | Researcher and Game Designer |

## The problem
Mission design is hard to learn because the numbers (launch capacity, instrument mass, delta-v) are scattered and rarely tested against each other. Students guess, and nothing tells them why a design fails.

## What the game does
- **Closure** (the core): pick a launcher, target and engine, add real Perseverance instruments, and the rocket equation says whether the mission closes. You predict first; the game shows the result and the smallest fix. Every value has a receipt (dataset, NASA page, date read).
- **Judge Demo**: a 90-second guided run (build, close, predict, fail, fix, launch) with the NASA data named on screen.
- **Missions, Rover and Flight** modes: walk the Mars base, drive a rover (terrain, dust, power) and fly a spacecraft. Touch controls on phones.
- **Greenhouse**: grow food on Mars with real sunlight, dust storms and power limits.
- **Classroom**: a teacher shares a challenge by link; teams compete for the lightest valid design.
- **Data & Sources** screen: counts of real, derived, other-agency, textbook, unverified and simulated values, the source links, and validation checks.

## NASA data used
All listed in [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) and inside the game (Lobby > DATA).
- NASA Launch Services Program fact sheet (launcher capacity to LEO)
- NASA Perseverance science instruments page and JPL Mars 2020 launch quick facts (instrument and rover masses, power)
- NASA NSSDC Mars and Moon fact sheets (orbits, gravity, pressure, solar irradiance)
- NASA NTRS reports 20180005485 and 20120003308 as independent cross-checks of engine Isp and Mars delta-v
- Other agency: ISRO Mars Orbiter Mission spacecraft mass (PSLV-C25 launch publication)

## Honesty about data
No live NASA feed is used. Values are copied from the pages above with the date they were read. Each is tagged NASA, DERIVED, OTHER AGENCY, TEXTBOOK, UNVERIFIED or SIM (game balance). `src/compute/validate.ts` re-derives the Moon and Mars burns from a 400 km parking orbit and the tests check the game values stay slightly above them. Cost and budget are game balance, not real prices. See `docs/AI_USE.md` for how AI was used.

## Run it
```
npm install
npm run dev      # http://localhost:3000
npm run build
bash scripts/run-tests.sh   # deterministic rule-engine tests
```
Everything runs in the browser: no server routes, no database. Progress is saved in localStorage.

## Tech
Next.js 14, TypeScript, React Three Fiber, Tailwind CSS. The closure engine is plain TypeScript (`src/compute`) with no randomness, so the same design always gives the same answer.

## Licence and credits
Apache-2.0 (see `LICENSE`). Third-party assets and fonts: `docs/CREDITS.md`. NASA does not endorse this project.
