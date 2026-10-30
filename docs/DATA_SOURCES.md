# Data sources (retrieved 2026-10-30)
Every value lives in `src/data/real/missionData.ts` with `prov` (kind, dataset, url, retrieved, note).
- NASA Launch Services Program fact sheet: https://www.nasa.gov/wp-content/uploads/2023/12/launch-services-program-fact-sheet.pdf (launcher capacity to LEO)
- NASA Perseverance science instruments: https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/ (instrument masses)
- JPL Mars 2020 launch quick facts: https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/quick_facts/ (rover mass, launch stack, MMRTG power)
Status keys: REAL, DERIVED, TEXTBOOK (no NASA page matched yet), UNVERIFIED (needs a source), SIM (game balance).
To add: NTRS sources for delta-v and specific impulse; an ESA, ISRO or JAXA figure.

## Solar power (greenhouse): src/data/real/solar.ts
- Mars solar irradiance (perihelion 717, mean 586.2, aphelion 493 W/m2): NASA GSFC Mars Fact Sheet, https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html. Marked TEXTBOOK until the team re-checks the three numbers on that page.
- Dust optical depth values, panel efficiency and dust deposition: typical values, TEXTBOOK. NTRS citation still to add.
- Panel area, battery size, crop yield and heater loss: SIM (game balance).
