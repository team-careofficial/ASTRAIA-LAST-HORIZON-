/**
 * Deterministic design-closure maths. No randomness, no model, no network.
 * Rocket equation:  dv = Isp * g0 * ln(m0 / mf)
 */
import { BUDGET_M, BUS_COST_M, COST_M, G0, INSTRUMENTS, LAUNCHERS, PROPELLANTS, TARGETS } from "../data/real/missionData";

export interface DesignInput {
  launcher: string; target: string; propellant: string;
  busDryKg: number;        // structure, power, comms, tanks (empty)
  propellantKg: number;
  instruments: string[];   // ids from INSTRUMENTS
}
export interface Closure {
  wetKg: number; capacityKg: number; massMarginPct: number;
  dvAvailMs: number; dvRequiredMs: number; dvMarginPct: number;
  closes: boolean; failures: string[];
  /** ids of every datum used, so the UI can open a receipt for each */
  used: { launcher: string; target: string; propellant: string; instruments: string[] };
}
const find = <T extends { id: string }>(xs: T[], id: string): T => {
  const r = xs.find(x => x.id === id);
  if (!r) throw new Error(`unknown id: ${id}`);
  return r;
};

export function evaluate(d: DesignInput): Closure {
  const L = find(LAUNCHERS, d.launcher), T = find(TARGETS, d.target), P = find(PROPELLANTS, d.propellant);
  const inst = d.instruments.map(id => find(INSTRUMENTS, id));
  const dry = d.busDryKg + inst.reduce((s, i) => s + i.massKg, 0);
  const wet = dry + d.propellantKg;
  const dvAvail = d.propellantKg > 0 ? P.isp * G0 * Math.log(wet / dry) : 0;
  const massMargin = (L.leoKg - wet) / L.leoKg * 100;
  const dvMargin = (dvAvail - T.dvMs) / T.dvMs * 100;
  const failures: string[] = [];
  if (wet > L.leoKg) failures.push(`${L.name} cannot lift ${wet.toFixed(0)} kg (limit ${L.leoKg} kg).`);
  if (dvAvail < T.dvMs) failures.push(`Delta-v ${dvAvail.toFixed(0)} m/s is short of the ${T.dvMs} m/s needed for ${T.name}.`);
  return { wetKg: wet, capacityKg: L.leoKg, massMarginPct: massMargin, dvAvailMs: dvAvail, dvRequiredMs: T.dvMs, dvMarginPct: dvMargin,
    closes: failures.length === 0, failures, used: { launcher: L.id, target: T.id, propellant: P.id, instruments: inst.map(i => i.id) } };
}

/** Largest extra payload mass (kg) the design can still absorb with the SAME propellant load. */
export function spareInstrumentKg(d: DesignInput): number {
  let lo = 0, hi = 5000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const c = evaluate({ ...d, busDryKg: d.busDryKg + mid });
    if (c.closes) lo = mid; else hi = mid;
  }
  return lo;
}

/** Game-balance cost in M$ (SIM, see missionData). */
export function costM(d: DesignInput): number {
  return COST_M[d.launcher] + BUS_COST_M + d.instruments.reduce((s, id) => s + COST_M[id], 0);
}
export const budgetM = BUDGET_M;
