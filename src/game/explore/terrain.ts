const CRATERS: [number, number, number, number][] = [[60, 40, 18, 3], [-70, 30, 14, 2.4], [20, -85, 22, 3.4], [-40, -70, 12, 2], [90, -30, 16, 2.6]];
/** Drivable terrain height for rover mode. Flat near the lander, rolling hills and craters beyond. */
export function hr(x: number, z: number): number {
  const r = Math.hypot(x, z), b = Math.min(1, Math.max(0, (r - 14) / 26)), s = b * b * (3 - 2 * b);
  let h = 2.2 * Math.sin(x * 0.045) * Math.cos(z * 0.04) + 1.1 * Math.sin(x * 0.13 + z * 0.09) * Math.cos(z * 0.11) + 0.35 * Math.sin(x * 0.4) * Math.sin(z * 0.37);
  for (const c of CRATERS) { const u = Math.hypot(x - c[0], z - c[1]) / c[2]; if (u < 1.6) h += c[3] * (0.35 * Math.exp(-Math.pow((u - 1.05) * 3.5, 2)) - (u < 1 ? 1 - u * u : 0)); }
  return h * s;
}

export interface Surface { id: "regolith" | "sand" | "rock" | "slope"; label: string; speed: number; grip: number; bump: number; dust: number }
const sn = (x: number, z: number) => 0.5 + 0.25 * Math.sin(x * 0.083 + 1.7) * Math.cos(z * 0.071) + 0.25 * Math.sin(x * 0.031 + z * 0.047 + 2.1);
/** What the ground is made of at (x,z). Changes rover speed, grip, shaking and dust. SIMULATED terrain classes. */
export function surfaceAt(x: number, z: number, moon = false): Surface {
  const g = Math.hypot(hr(x + 1, z) - hr(x - 1, z), hr(x, z + 1) - hr(x, z - 1)) / 2, n = sn(x, z);
  if (g > 0.42) return { id: "slope", label: "STEEP SLOPE", speed: 0.6, grip: 0.65, bump: 0.5, dust: 0.7 };
  if (n > 0.66) return { id: "sand", label: moon ? "DEEP REGOLITH" : "LOOSE SAND", speed: 0.72, grip: 0.62, bump: 0.2, dust: 1.5 };
  if (n < 0.3) return { id: "rock", label: "ROCKY GROUND", speed: 0.88, grip: 0.95, bump: 1, dust: 0.3 };
  return { id: "regolith", label: moon ? "PACKED REGOLITH" : "PACKED SOIL", speed: 1, grip: 1, bump: 0.25, dust: 0.6 };
}
export const slopeDeg = (x: number, z: number, h: number) => { const a = hr(x + Math.sin(h) * 1.4, z + Math.cos(h) * 1.4) - hr(x - Math.sin(h) * 1.4, z - Math.cos(h) * 1.4); return (Math.atan2(a, 2.8) * 180) / Math.PI; };
