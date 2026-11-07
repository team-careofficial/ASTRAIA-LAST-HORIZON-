/**
 * Solar power on Mars. The mean irradiance is stated by NASA; perihelion and aphelion are derived from it (see below).
 * The greenhouse and the power check use these numbers; nothing is random.
 */
import type { Prov } from "./missionData";
const FACT = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html";
export const MARS_SOLAR = {
  /** W/m2 above the atmosphere. The NASA Mars Fact Sheet prints ONE value, 586.2 (mean). Perihelion and aphelion are our own
   *  numbers: S_earth(1361.0, from the same sheet) divided by (distance / 1 AU) squared, using the sheet's perihelion 206.650 and
   *  aphelion 249.261 million km. An earlier version of this file wrongly claimed the sheet lists 717 and 493. */
  irradiance: { perihelion: 713.2, mean: 586.2, aphelion: 490.2, prov: { kind: "derived", dataset: "NASA GSFC Mars Fact Sheet (mean irradiance 586.2 W/m2; perihelion and aphelion computed from its distances)", url: FACT, retrieved: "2026-11-07", note: "Mean is stated by NASA. Perihelion 713.2 = 1361.0 / (206.650/149.598)^2. Aphelion 490.2 = 1361.0 / (249.261/149.598)^2." } as Prov },
  /** Optical depth tau. Clear sky is about 0.5, a regional storm about 2 to 3, a global storm 5 or more. */
  tau: { clear: 0.5, hazy: 1.2, regional: 2.5, global: 5, prov: { kind: "textbook", dataset: "typical Mars dust optical depth", note: "Find a NASA/NTRS citation (Opportunity 2018 global storm saw tau above 10)." } as Prov },
  /** Fraction of the day the Sun is up, averaged: equivalent full-sun hours = sol length / pi at the equator. */
  solHours: 24.66,
  panel: { areaM2: 60, efficiency: 0.28, dustLossPerSol: 0.002, prov: { kind: "textbook", dataset: "triple-junction cell efficiency, ~0.2%/sol dust deposit", note: "Panel area is a game design choice (SIM). Efficiency and dust loss are typical values." } as Prov },
};
