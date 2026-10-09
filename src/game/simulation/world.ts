import type { Res } from "@/types/world";
export const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n * 10) / 10));
/** Deterministic rules. Solar -> power -> temperature -> stress/health. Storm cuts solar and comms. */
export function tick(r: Res, minutes: number, storm: number, k: { commsK?: number; cons?: number; genK?: number; stormK?: number; thermalK?: number; stressK?: number } = {}) {
  const cons = k.cons ?? 1;
  const h = minutes / 60, solar = 1 - 0.7 * storm * (k.stormK ?? 1);
  const out = { ...r }; out.power = clamp(r.power + (3.4 * (k.genK ?? 1) * solar - 3.0) * h * 4);
  const target = out.power >= 35 ? 21 : 21 - (35 - out.power) * 0.5 * (k.thermalK ?? 1);
  out.temp = Math.round((r.temp + (target - r.temp) * Math.min(1, h * 0.5)) * 10) / 10;
  out.oxygen = clamp(r.oxygen - (0.3 + (out.power < 20 ? 0.4 : 0)) * h * 4 * cons); out.water = clamp(r.water - 0.25 * h * 4 * cons); out.food = clamp(r.food - 0.15 * h * 4 * cons);
  out.comms = clamp(r.comms - (4 * storm * (k.commsK ?? 1) + (out.power < 25 ? 1.5 : 0)) * h);
  out.habitat = clamp(r.habitat - (out.temp < 0 ? 0.5 * h : 0)); out.minutes = r.minutes + minutes;
  const dStress = (k.stressK ?? 1) * ((out.power < 35 ? 2 : 0) + (out.temp < 10 ? 1.5 : 0) + (out.oxygen < 30 ? 2 : 0) - (out.power >= 35 && out.temp >= 10 ? 0.5 : 0)) * h;
  const dHealth = -((out.oxygen < 20 ? 3 : 0) + (out.temp < 5 ? 0.8 : 0)) * h;
  return { r: out, dStress, dFatigue: 1.2 * h, dHealth };
}
