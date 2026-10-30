/**
 * Solar power on Mars. Every value here is TEXTBOOK until it is checked against the NASA page named in `note`.
 * The greenhouse and the power check use these numbers; nothing is random.
 */
import type { Prov } from "./missionData";
const FACT = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html";
export const MARS_SOLAR = {
  /** W/m2 above the atmosphere. NASA Mars Fact Sheet lists perihelion, mean and aphelion values. */
  irradiance: { perihelion: 717, mean: 586.2, aphelion: 493, prov: { kind: "textbook", dataset: "NASA GSFC Mars Fact Sheet (solar irradiance)", url: FACT, note: "Re-check these three numbers on the fact sheet before the demo, then change kind to nasa." } as Prov },
  /** Optical depth tau. Clear sky is about 0.5, a regional storm about 2 to 3, a global storm 5 or more. */
  tau: { clear: 0.5, hazy: 1.2, regional: 2.5, global: 5, prov: { kind: "textbook", dataset: "typical Mars dust optical depth", note: "Find a NASA/NTRS citation (Opportunity 2018 global storm saw tau above 10)." } as Prov },
  /** Fraction of the day the Sun is up, averaged: equivalent full-sun hours = sol length / pi at the equator. */
  solHours: 24.66,
  panel: { areaM2: 60, efficiency: 0.28, dustLossPerSol: 0.002, prov: { kind: "textbook", dataset: "triple-junction cell efficiency, ~0.2%/sol dust deposit", note: "Panel area is a game design choice (SIM). Efficiency and dust loss are typical values." } as Prov },
};
