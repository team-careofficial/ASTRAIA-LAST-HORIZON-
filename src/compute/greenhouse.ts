/**
 * Mars greenhouse: water, light, temperature and power make food. Deterministic.
 * Physics inputs (insolation, dust) come from data/real/solar.ts. Crop yields and the heat loss figure are SIM (game balance).
 */
import { solarWhPerSol } from "./solar";
export interface GhControls { lightHours: number; tempC: number; waterL: number }
export interface GhEnv { irradiance: number; tau: number }
export interface GhState { sol: number; batteryWh: number; dustCover: number; foodKg: number; health: number }
export interface GhSol { solarWh: number; demandWh: number; usedWh: number; powerFrac: number; lightEff: number; tempEff: number; waterEff: number; yieldKg: number; note: string }
export const GH = { cropM2: 10, ledWPerM2: 100, heatUA: 4, outsideC: -60, batteryWh: 60000, targetKg: 1.2, maxYield: 1.8, waterIdealL: 12, optTempC: 22 } as const;
export const newGh = (): GhState => ({ sol: 0, batteryWh: GH.batteryWh * 0.5, dustCover: 0, foodKg: 0, health: 100 });
export function runSol(s: GhState, c: GhControls, e: GhEnv): { state: GhState; sol: GhSol } {
  const solarWh = solarWhPerSol({ irradiance: e.irradiance, tau: e.tau, dustCover: s.dustCover });
  const heatWh = Math.max(0, GH.heatUA * (c.tempC - GH.outsideC) * 24.66), lightWh = GH.cropM2 * GH.ledWPerM2 * c.lightHours, pumpWh = 300;
  const demand = heatWh + lightWh + pumpWh, available = solarWh + s.batteryWh;
  const frac = demand === 0 ? 1 : Math.min(1, available / demand), used = demand * frac;
  const battery = Math.min(GH.batteryWh, Math.max(0, s.batteryWh + solarWh - used));
  // heater has priority: when power is short the lights dim first
  const heatFrac = Math.min(1, available / Math.max(1, heatWh + pumpWh)), lightAvail = Math.max(0, available - (heatWh + pumpWh));
  const lightEff = lightWh === 0 ? 0 : Math.min(1, lightAvail / lightWh) * Math.min(1, c.lightHours / 12);
  const effTemp = c.tempC - (1 - heatFrac) * 30, tempEff = Math.max(0, 1 - Math.pow((effTemp - GH.optTempC) / 10, 2));
  const waterEff = c.waterL <= 0 ? 0 : c.waterL > 16 ? 0.8 : Math.min(1, c.waterL / GH.waterIdealL);
  const yieldKg = GH.maxYield * lightEff * tempEff * waterEff;
  const health = Math.max(0, Math.min(100, s.health + (tempEff < 0.3 ? -12 : tempEff > 0.8 && waterEff > 0.7 ? 3 : -2)));
  const note = frac < 1 ? "Not enough power: lights dimmed." : tempEff < 0.5 ? "Temperature is far from the crop's best range." : waterEff < 0.6 ? "The crop is short of water." : lightEff < 0.6 ? "Not enough light hours." : "Growing well.";
  return { state: { sol: s.sol + 1, batteryWh: battery, dustCover: Math.min(0.6, s.dustCover + 0.002), foodKg: s.foodKg + yieldKg, health }, sol: { solarWh, demandWh: demand, usedWh: used, powerFrac: frac, lightEff, tempEff, waterEff, yieldKg, note } };
}
