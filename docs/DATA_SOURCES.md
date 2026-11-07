# Data sources (last checked 2026-11-07)
Every value lives in `src/data/real/missionData.ts` and `src/data/real/solar.ts` with `prov` (kind, dataset, url, retrieved, note).
The same list is shown inside the game on the **Data & Sources** screen (Lobby > DATA).

## NASA pages
- NASA Launch Services Program fact sheet: https://www.nasa.gov/wp-content/uploads/2023/12/launch-services-program-fact-sheet.pdf (launcher capacity to LEO)
- NASA Perseverance science instruments: https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/ (instrument masses)
- JPL Mars 2020 launch quick facts: https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/quick_facts/ (rover mass, launch stack, MMRTG power)
- NASA NSSDC Mars Fact Sheet (updated 19 May 2025): https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html (orbit, gravity, pressure, mean solar irradiance 586.2 W/m2)
- NASA NSSDC Moon Fact Sheet (updated 11 Jan 2024): https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html (distance, gravity)

## Cross-checks (do not change game values)
- NTRS 20180005485: hydrazine RCS about 228 s, NTO/N2H4 bipropellant about 326 s, compared with the 220 s and 320 s used in the game.
- NTRS 20120003308 (ESAS): about 4 km/s maximum Earth-departure delta-v for Mars, compared with the 3,600 m/s used.
- `src/compute/validate.ts` re-derives the Moon (about 3,082 m/s) and Mars (about 3,569 m/s) burns from a 400 km parking orbit with the vis-viva equation. `scripts/features.test.ts` asserts the game values keep a small positive margin over them.

## Other space agency
- ISRO Mars Orbiter Mission spacecraft, 1,337 kg: https://new1.isro.gov.in/media_isro/pdf/Missions/PSLVC25/publication_PSLVC25.pdf (kind OTHER AGENCY)

## Solar power (greenhouse)
- Mean irradiance 586.2 W/m2 is printed on the NASA Mars Fact Sheet. Perihelion 713.2 and aphelion 490.2 W/m2 are DERIVED by us from the printed orbit distances (inverse square). An earlier version of this file wrongly said the sheet lists 717 and 493; that was corrected on 2026-11-07.
- Dust optical depth, panel efficiency and dust deposition: TEXTBOOK, NTRS citation still to add.
- Panel area, battery size, crop yield and heater loss: SIM (game balance).

## Honest limits
- No live NASA feed is used. `src/lib/nasa/provider.ts` returns a saved snapshot of the Mars Fact Sheet and says so in its label.
- Falcon Heavy capacity is still UNVERIFIED. LOX/CH4 specific impulse has no NASA figure found yet.
- Status keys: NASA, DERIVED, OTHER AGENCY, TEXTBOOK (standard value, no NASA page matched yet), UNVERIFIED (needs a source), SIM (game balance).
