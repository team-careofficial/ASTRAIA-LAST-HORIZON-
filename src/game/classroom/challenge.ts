/** Classroom challenges: a teacher encodes a mission in a code or link; students play it; results rank by least resource use. No backend. */
import { evaluate, costM, type DesignInput } from "../../compute/closure";
import { INSTRUMENTS, LAUNCHERS, PROPELLANTS, TARGETS } from "../../data/real/missionData";
export interface Challenge { v: 1; name: string; target: string; launcher: string; propellant: string; bus: number; budgetM: number; minInstruments: number }
export interface Entry { name: string; wetKg: number; costM: number; dvMarginPct: number; massMarginPct: number; instruments: string[]; ok: boolean; reason: string; at: number }
export const SAFE_DV_PCT = 1, SAFE_MASS_PCT = 5;
const b64 = (s: string) => (typeof btoa === "function" ? btoa(unescape(encodeURIComponent(s))) : Buffer.from(s, "utf8").toString("base64"));
const unb64 = (s: string) => (typeof atob === "function" ? decodeURIComponent(escape(atob(s))) : Buffer.from(s, "base64").toString("utf8"));
export const encode = (c: Challenge): string => b64(JSON.stringify(c)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
export function decode(code: string): Challenge | null {
  try {
    const raw = code.trim().replace(/-/g, "+").replace(/_/g, "/"), c = JSON.parse(unb64(raw + "=".repeat((4 - (raw.length % 4)) % 4)));
    const ok = c && c.v === 1 && typeof c.name === "string" && TARGETS.some(t => t.id === c.target) && LAUNCHERS.some(l => l.id === c.launcher) && PROPELLANTS.some(p => p.id === c.propellant)
      && Number.isFinite(c.bus) && c.bus >= 500 && c.bus <= 8000 && Number.isFinite(c.budgetM) && c.budgetM > 0 && Number.isInteger(c.minInstruments) && c.minInstruments >= 0 && c.minInstruments <= INSTRUMENTS.length;
    return ok ? { v: 1, name: c.name.slice(0, 40), target: c.target, launcher: c.launcher, propellant: c.propellant, bus: c.bus, budgetM: c.budgetM, minInstruments: c.minInstruments } : null;
  } catch { return null; }
}
/** Judge one student design against the rules. "Safe" stands in for a safe crew: a closing design with real spare margin. */
export function judge(c: Challenge, load: number, instruments: string[], name: string): Entry {
  const d: DesignInput = { launcher: c.launcher, target: c.target, propellant: c.propellant, busDryKg: c.bus, propellantKg: load, instruments }, r = evaluate(d), cost = costM(d);
  let reason = "";
  if (!r.closes) reason = "does not close"; else if (cost > c.budgetM) reason = "over budget"; else if (instruments.length < c.minInstruments) reason = `needs ${c.minInstruments} instruments`;
  else if (r.dvMarginPct < SAFE_DV_PCT || r.massMarginPct < SAFE_MASS_PCT) reason = "margin too thin to call it safe";
  return { name: name.trim().slice(0, 20) || "Team", wetKg: Math.round(r.wetKg), costM: cost, dvMarginPct: +r.dvMarginPct.toFixed(2), massMarginPct: +r.massMarginPct.toFixed(1), instruments, ok: reason === "", reason, at: 0 };
}
/** Winners first: valid designs by lowest launch mass, then lowest cost. Invalid ones follow. */
export const rank = (es: Entry[]): Entry[] => es.slice().sort((a, b) => Number(b.ok) - Number(a.ok) || a.wetKg - b.wetKg || a.costM - b.costM);
export const toCsv = (c: Challenge, es: Entry[]): string => ["rank,team,valid,launch_mass_kg,cost_musd(sim),dv_margin_pct,mass_margin_pct,instruments,note", ...rank(es).map((e, i) => [i + 1, `"${e.name.replace(/"/g, "'")}"`, e.ok ? "yes" : "no", e.wetKg, e.costM, e.dvMarginPct, e.massMarginPct, `"${e.instruments.join(" ")}"`, `"${e.reason}"`].join(","))].join("\n") + `\n# challenge: ${c.name}\n`;
// ---- storage and the active challenge (browser only; every access is guarded) ----
const KEY = "astraia-class-v1";
let active: Challenge | null = null;
let last: Challenge | null = null;
export const lastLoaded = () => last;
export const setLastLoaded = (c: Challenge | null) => { last = c; };
export const activeChallenge = () => active;
export const setActiveChallenge = (c: Challenge | null) => { active = c; };
const all = (): Record<string, Entry[]> => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
export const entriesFor = (c: Challenge): Entry[] => all()[encode(c)] ?? [];
export function saveEntry(c: Challenge, e: Entry) { try { const a = all(), k = encode(c); a[k] = [...(a[k] ?? []), { ...e, at: Date.now() }].slice(-200); localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* storage blocked */ } }
