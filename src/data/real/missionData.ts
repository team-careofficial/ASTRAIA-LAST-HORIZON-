/**
 * Real numbers for the Mission Design closure engine.
 * Every entry carries `prov`: where it came from and how sure we are.
 *  - "nasa"     : value stated on a NASA page (url + retrieved date)
 *  - "derived"  : computed by us from NASA values (formula in note)
 *  - "textbook" : standard engineering figure, NOT yet checked against a NASA/NTRS page
 *  - "agency"   : stated by another space agency (for example ISRO), with its own document as the source
 *  - "unverified": needs a source before the demo; the UI must show it as such
 */
export type ProvKind = "nasa" | "derived" | "agency" | "textbook" | "unverified" | "sim";
/** xcheck = an independent number found later that we compare against (it does not change the game value). */
export interface Prov { kind: ProvKind; dataset: string; url?: string; retrieved?: string; note?: string; xcheck?: { text: string; url: string } }

export interface Launcher { id: string; name: string; leoKg: number; prov: Prov }
export interface Instrument { id: string; name: string; massKg: number; powerW?: number; prov: Prov }
export interface Propellant { id: string; name: string; isp: number; prov: Prov }
export interface Target { id: string; name: string; dvMs: number; prov: Prov }

const LSP = "NASA Launch Services Program fact sheet";
const LSP_URL = "https://www.nasa.gov/wp-content/uploads/2023/12/launch-services-program-fact-sheet.pdf";
const P20 = "Mars 2020 Perseverance science instruments";
const P20_URL = "https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/";

/** Capacity to LEO. NASA's fact sheet gives no Mars figure, so closure is computed from LEO + the craft's own delta-v. */
export const LAUNCHERS: Launcher[] = [
  { id: "antares", name: "Antares", leoKg: 8000, prov: { kind: "nasa", dataset: LSP, url: LSP_URL, retrieved: "2026-10-30" } },
  { id: "atlas5", name: "Atlas V", leoKg: 18850, prov: { kind: "nasa", dataset: LSP, url: LSP_URL, retrieved: "2026-10-30" } },
  { id: "vulcan", name: "Vulcan Centaur", leoKg: 27200, prov: { kind: "nasa", dataset: LSP, url: LSP_URL, retrieved: "2026-10-30" } },
  { id: "newglenn", name: "New Glenn", leoKg: 45000, prov: { kind: "nasa", dataset: LSP, url: LSP_URL, retrieved: "2026-10-30" } },
  { id: "fh", name: "Falcon Heavy", leoKg: 64000, prov: { kind: "unverified", dataset: LSP, url: LSP_URL, retrieved: "2026-10-30", note: "Fact sheet says 'about 64 t' without naming the orbit; confirm it is LEO (expendable) before showing as REAL." } },
];

/** Masses are the sums of the parts NASA lists for each instrument. */
export const INSTRUMENTS: Instrument[] = [
  { id: "mastcamz", name: "Mastcam-Z camera", massKg: 4, prov: { kind: "nasa", dataset: P20, url: P20_URL, retrieved: "2026-10-30" } },
  { id: "supercam", name: "SuperCam", massKg: 10.6, prov: { kind: "derived", dataset: P20, url: P20_URL, retrieved: "2026-10-30", note: "5.6 mast head + 4.8 body spectrometers + 0.2 calibration targets" } },
  { id: "sherloc", name: "SHERLOC", massKg: 4.72, prov: { kind: "derived", dataset: P20, url: P20_URL, retrieved: "2026-10-30", note: "3.11 turret + 1.61 body" } },
  { id: "pixl", name: "PIXL", massKg: 6.915, prov: { kind: "derived", dataset: P20, url: P20_URL, retrieved: "2026-10-30", note: "4.3 sensor head + 2.6 electronics + 0.015 target" } },
  { id: "meda", name: "MEDA weather station", massKg: 5.5, prov: { kind: "nasa", dataset: P20, url: P20_URL, retrieved: "2026-10-30" } },
  { id: "moxie", name: "MOXIE oxygen experiment", massKg: 17.1, prov: { kind: "nasa", dataset: P20, url: P20_URL, retrieved: "2026-10-30" } },
  { id: "rimfax", name: "RIMFAX radar", massKg: 3, prov: { kind: "nasa", dataset: P20, url: P20_URL, retrieved: "2026-10-30", note: "NASA: 'less than 3 kg'" } },
];

/**
 * Reference facts for the Mission Report. NOTE: the JPL press kit says the seven instruments weigh 59 kg,
 * but the per-instrument figures above sum to ~53 kg. We show both and say so rather than hide the gap.
 */
export const PERSEVERANCE = {
  roverKg: { v: 1025, prov: { kind: "nasa", dataset: "Mars 2020 launch quick facts", url: "https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/quick_facts/", retrieved: "2026-10-30" } as Prov },
  launchKg: { v: 531000, prov: { kind: "nasa", dataset: "Mars 2020 launch quick facts", url: "https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/quick_facts/", retrieved: "2026-10-30", note: "whole stack incl. rocket" } as Prov },
  instrumentsKg: { v: 59, prov: { kind: "nasa", dataset: "Mars 2020 launch quick facts", url: "https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/quick_facts/", retrieved: "2026-10-30" } as Prov },
  mmrtgW: { v: 110, prov: { kind: "nasa", dataset: "Mars 2020 launch quick facts", url: "https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/quick_facts/", retrieved: "2026-10-30" } as Prov },
  launcher: "Atlas V 541",
};

/** Typical engine performance. Not yet checked against a NASA page: shown as TEXTBOOK in the receipts drawer. */
export const PROPELLANTS: Propellant[] = [
  { id: "hydrazine", name: "Hydrazine monopropellant", isp: 220, prov: { kind: "textbook", dataset: "typical monoprop Isp", note: "Game value 220 s. NASA cross-check below is higher, so the game is conservative.", xcheck: { text: "NASA NTRS In-Space Chemical Propulsion Roadmap: spacecraft RCS near 228 s, lander engines 238 s", url: "https://ntrs.nasa.gov/api/citations/20180005485/downloads/20180005485.pdf" } } },
  { id: "bipro", name: "Storable bipropellant", isp: 320, prov: { kind: "textbook", dataset: "typical NTO/MMH Isp", note: "Game value 320 s. NASA cross-check is for NTO/hydrazine, a close relative, so the game is slightly conservative.", xcheck: { text: "NASA NTRS In-Space Chemical Propulsion Roadmap: 326 s for a 450 N planetary main engine (NTO/hydrazine)", url: "https://ntrs.nasa.gov/api/citations/20180005485/downloads/20180005485.pdf" } } },
  { id: "lox_ch4", name: "Methane / liquid oxygen", isp: 360, prov: { kind: "textbook", dataset: "typical LOX/CH4 Isp", note: "No NASA figure found yet for LOX/methane. Still textbook." } },
];

/** Delta-v the CRAFT must supply after LEO release (transfer only; landing/insertion budget added separately). */
export const TARGETS: Target[] = [
  { id: "moon", name: "Moon transfer (TLI)", dvMs: 3130, prov: { kind: "textbook", dataset: "LEO->TLI delta-v", note: "We re-computed this from orbital mechanics (see Validation): 3,082 m/s for a 400 km parking orbit. The game uses 3,130 m/s, about 1.6% higher, so it keeps a small margin." } },
  { id: "mars", name: "Mars transfer (TMI)", dvMs: 3600, prov: { kind: "textbook", dataset: "LEO->TMI delta-v", note: "We re-computed this from NASA orbit data (see Validation): 3,569 m/s for a 400 km parking orbit. The game uses 3,600 m/s, about 0.9% higher.", xcheck: { text: "NASA NTRS ESAS-derived Earth Departure Stage study sizes for a maximum TMI delta-v of 4 km/s (a heavier, human-class case)", url: "https://ntrs.nasa.gov/api/citations/20120003308/downloads/20120003308.pdf" } } },
];
/** Reference mission from another agency, so the game does not rest on NASA numbers alone. */
export const AGENCY_REFS: { id: string; name: string; value: string; prov: Prov }[] = [
  { id: "isro-mom", name: "ISRO Mars Orbiter Mission spacecraft", value: "1,337 kg", prov: { kind: "agency", dataset: "ISRO PSLV-C25 launch publication", url: "https://new1.isro.gov.in/media_isro/pdf/Missions/PSLVC25/publication_PSLVC25.pdf", retrieved: "2026-11-07", note: "Spacecraft mass as printed by ISRO. The same page says PSLV can lift 1,750 kg class satellites to a 600 km sun-synchronous orbit." } },
];
export const G0 = 9.80665; // standard gravity, m/s^2 (exact by definition)

/** Budget is a GAME-BALANCE value, not a real price. Shown as SIM in the receipts drawer. */
export const SIM_PROV: Prov = { kind: "sim", dataset: "ASTRAIA game balance", note: "Not a real cost. Chosen so budget is a third constraint players can hit." };
export const COST_M: Record<string, number> = {
  antares: 80, atlas5: 130, vulcan: 150, newglenn: 200, fh: 150,
  mastcamz: 12, supercam: 40, sherloc: 30, pixl: 30, meda: 15, moxie: 45, rimfax: 18,
};
export const BUS_COST_M = 120;
export const BUDGET_M = 400;
