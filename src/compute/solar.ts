import { MARS_SOLAR as S } from "../data/real/solar";
/** Energy one solar array makes in one sol (Wh). Beer-Lambert style: peak power x exp(-tau), averaged over the day by 1/pi. */
export function solarWhPerSol(o: { irradiance: number; tau: number; areaM2?: number; efficiency?: number; dustCover?: number }): number {
  const A = o.areaM2 ?? S.panel.areaM2, eta = o.efficiency ?? S.panel.efficiency, clean = 1 - Math.min(1, Math.max(0, o.dustCover ?? 0));
  const peakW = A * eta * o.irradiance * Math.exp(-o.tau) * clean;
  return peakW * (S.solHours / Math.PI);
}
