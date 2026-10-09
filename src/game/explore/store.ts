import { useSyncExternalStore } from "react";
import { clamp } from "@/game/simulation/world";
import { sfx } from "@/lib/utils/audio";
import { hr } from "./terrain";
import { game } from "@/game/engine/store";
import { guide } from "@/game/guide/store";
import { designMods } from "@/data/design/options";

export type PoiKind = "rock" | "ice" | "layered" | "biosig";
export interface Poi { id: number; kind: PoiKind; x: number; z: number }
export const POI_INFO: Record<PoiKind, { name: string; value: number; color: string; text: string }> = {
  rock: { name: "Basalt outcrop", value: 5, color: "#c9b8a6", text: "Basalt is volcanic rock. It records the planet's igneous history." },
  ice: { name: "Subsurface ice", value: 8, color: "#8fd3ff", text: "Water ice is a key resource and shows where water may remain." },
  layered: { name: "Layered clay outcrop", value: 10, color: "#e8a24a", text: "Clays form in water, so layers like this can mark an ancient habitable place." },
  biosig: { name: "Ambiguous organic signal", value: 15, color: "#b98cff", text: "This could have non-biological causes. Only a returned sample could confirm it." },
};
const MOON_INFO: Record<PoiKind, { name: string; text: string }> = {
  rock: { name: "Highland rock", text: "Pale highland rock is part of the Moon's ancient crust." },
  ice: { name: "Shadowed-crater ice", text: "Ice can survive in permanently shadowed craters. It is a future source of water and fuel." },
  layered: { name: "Impact melt layer", text: "Impact melt layers help scientists date craters and the Moon's history." },
  biosig: { name: "Solar-wind volatiles", text: "Gases from the solar wind are trapped in the soil. They record the Sun's history." },
};
export const poiInfo = (k: PoiKind, moon: boolean) => ({ ...POI_INFO[k], ...(moon ? MOON_INFO[k] : {}) });
export const BASE: [number, number] = [-28, -20];
export const LANDER: [number, number] = [0, -8];
export const POIS: Poi[] = (() => {
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, kinds: PoiKind[] = ["rock", "rock", "rock", "rock", "rock", "ice", "ice", "ice", "ice", "layered", "layered", "layered", "layered", "biosig", "biosig", "biosig"];
  return kinds.map((kind, id) => { const a = rnd() * 6.283, r = 30 + rnd() * 100; return { id, kind, x: Math.cos(a) * r, z: Math.sin(a) * r }; });
})();
/** Runtime values read every frame by 3D code. Not reactive. */
export const rt = { hour: 10, x: 0, z: -6 };
const n = (x: number, z: number, k: number) => 0.5 + 0.5 * Math.sin(x * 0.07 * k + 1.3) * Math.cos(z * 0.06 * k + 0.7);
/** Simulated instrument values (not real NASA measurements). */
export function sensors(x: number, z: number, hour: number, moon = false) {
  const day = Math.sin((2 * Math.PI * (hour - 9)) / 24), t = -63 + 38 * day;
  let ice = 4 + 8 * n(x, z, 3); for (const p of POIS) if (p.kind === "ice") ice = Math.max(ice, 95 * Math.exp(-Math.hypot(x - p.x, z - p.z) / 18));
  if (moon) { const tm = -26 + 146 * day; return { air: { p: 0, t: tm, wind: 0, tau: 0.05 + 0.03 * n(x, z, 1) }, soil: { gt: tm, fe: 5 + 3 * n(x, z, 2), perc: 0, hyd: 0.1 + ice * 0.05 }, ice, rad: 1.3 + 0.2 * n(x, z, 5) }; }
  return { rad: 0.67 + 0.1 * n(x, z, 5), air: { p: 620 + 35 * Math.sin((2 * Math.PI * (hour - 4)) / 24) - hr(x, z) * 6, t, wind: 3 + 2.5 * n(x, z, 2), tau: 0.45 + 0.25 * n(x, z, 1) },
    soil: { gt: t + (day > 0 ? 9 : -4), fe: 13 + 6 * n(x, z, 2), perc: 0.3 + 0.5 * n(x, z, 4), hyd: 1.5 + ice * 0.08 }, ice };
}
export const linkAt = (x: number, z: number) => clamp(100 - Math.max(0, Math.hypot(x - BASE[0], z - BASE[1]) - 35) * 0.55 + Math.max(0, hr(x, z)) * 3);

export interface Flight { speed: number; alt: number; fuel: number; gate: number; assist: boolean; msg: string | null; laps: number }
export interface Explore {
  phase: "deploy" | "drive"; hour: number; battery: number; temp: number; speed: number; link: number; queue: number; sent: number; science: number; panels: boolean; lights: boolean;
  scan: number; near: number | null; nearDist: number; found: number[]; log: string[]; reply: string | null; toast: string | null; x: number; z: number; heading: number;
  air: { p: number; t: number; wind: number; tau: number }; soil: { gt: number; fe: number; perc: number; hyd: number }; ice: number; rad: number; dust: number; fl: Flight; surf: string; grip: number; pitch: number; cockpit: boolean; hazard: string | null; net: number; env: boolean; shards: number;
}
const initFlight = (): Flight => ({ speed: 0, alt: 40, fuel: 100, gate: 0, assist: true, msg: null, laps: 0 });
const init = (): Explore => ({ phase: "deploy", hour: 10, battery: 92, temp: 20, speed: 0, link: 90, queue: 0, sent: 0, science: 0, panels: false, lights: false, scan: 0, near: null, nearDist: 999, found: [], log: [], reply: null, toast: null, x: 0, z: -6, heading: 0, dust: 0, surf: "PACKED SOIL", grip: 1, pitch: 0, cockpit: false, hazard: null, net: 0, env: false, shards: 0, ...sensors(0, -6, 10), fl: initFlight() });
let state = init(); const ls = new Set<() => void>(); let tt: ReturnType<typeof setTimeout> | undefined;
const set = (p: Partial<Explore>) => { state = { ...state, ...p }; ls.forEach(l => l()); };
export const ex = {
  get: () => state, subscribe: (l: () => void) => { ls.add(l); return () => { ls.delete(l); }; }, patch: set,
  reset: () => { rt.hour = 10; rt.x = 0; rt.z = -6; set(init()); },
  resetFlight: () => set({ fl: initFlight() }),
  say: (m: string) => { set({ toast: m }); clearTimeout(tt); tt = setTimeout(() => set({ toast: null }), 3200); },
  finishScan: (id: number) => {
    const p = POIS[id], moon = game.get().destination === "moon", i = { ...poiInfo(p.kind, moon), value: Math.round(POI_INFO[p.kind].value * designMods(game.get().design, game.get().destination).sci) };
    set({ found: [...state.found, id], queue: state.queue + 1, science: state.science + i.value, scan: 0, log: [`${i.name}: ${i.text}`, ...state.log].slice(0, 12), battery: clamp(state.battery - 3) });
    sfx("ok"); guide.note("sample"); ex.say(`${i.name} found. ${i.text}`);
  },
  transmit: () => {
    const s = state; if (s.phase !== "drive") return;
    if (s.queue <= 0) return ex.say("Nothing to send. Scan a target first.");
    if (s.link < 25) return ex.say("Link too weak. Drive closer to base or onto higher ground.");
    if (s.battery < 5) return ex.say("Not enough power to transmit.");
    const k = s.queue; set({ queue: 0, sent: s.sent + k, battery: clamp(s.battery - 2), reply: "Uplink sent. Waiting for Earth..." }); sfx("notify"); guide.note("uplink");
    setTimeout(() => set({ reply: `EARTH: ${k} finding${k > 1 ? "s" : ""} received. (Simulated reply. A real round trip takes 6 to 44 minutes.)` }), game.get().destination === "moon" ? 2000 : 6000);
    setTimeout(() => { if (state.reply?.startsWith("EARTH")) set({ reply: null }); }, 15000);
  },
};
export function useEx<T>(sel: (s: Explore) => T): T { return useSyncExternalStore(ex.subscribe, () => sel(state), () => sel(state)); }
