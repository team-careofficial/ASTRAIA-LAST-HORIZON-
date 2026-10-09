export interface Source { id: string; name: string; url: string; retrieved: string; description: string }
/** Every "real" fact in the Mission Manual points to one of these. Retrieved by reading the pages on the date shown. */
export const SOURCES: Record<string, Source> = {
  "mars-fs": { id: "mars-fs", name: "NASA NSSDC Mars Fact Sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html", retrieved: "2026-10-08", description: "Bulk, orbital and atmospheric values for Mars." },
  "moon-fs": { id: "moon-fs", name: "NASA NSSDC Moon Fact Sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html", retrieved: "2026-10-08", description: "Bulk values, distance, temperature and surface pressure for the Moon." },
  "jpl-mars": { id: "jpl-mars", name: "NASA/JPL Mars at a Glance (InSight press kit)", url: "https://www.jpl.nasa.gov/news/press_kits/insight/launch/facts/mars-at-a-glance", retrieved: "2026-10-08", description: "Atmosphere composition, gravity and magnetic field summary." },
};
