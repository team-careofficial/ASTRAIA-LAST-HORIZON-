import { useSyncExternalStore } from "react";
import type { World } from "@/types/world";
import type { Explore } from "@/game/explore/store";
import { MISSIONS } from "@/data/world/missions";
import { NOTE_TEXT } from "@/data/knowledge/entries";

export interface FieldNote { id: string; title: string; text: string }
interface G { open: boolean; expanded: boolean; notes: FieldNote[]; last: string | null }
const KEY = "astraia-notes-v1";
let state: G = { open: false, expanded: false, notes: [], last: null };
const ls = new Set<() => void>(); const set = (p: Partial<G>) => { state = { ...state, ...p }; ls.forEach(l => l()); };
let t: ReturnType<typeof setTimeout> | undefined;
export const guide = {
  get: () => state, subscribe: (l: () => void) => { ls.add(l); return () => { ls.delete(l); }; },
  hydrate: () => { try { const r = localStorage.getItem(KEY); if (r) set({ notes: JSON.parse(r) }); } catch { /* ignore */ } },
  toggle: () => set({ open: !state.open }), setOpen: (open: boolean) => set({ open }), expand: (expanded: boolean) => set({ expanded }),
  note: (id: string) => {
    const n = NOTE_TEXT[id]; if (!n || state.notes.some(x => x.id === id)) return;
    const notes = [...state.notes, { id, ...n }]; set({ notes, last: `FIELD NOTE #${notes.length}: ${n.title}` });
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch { /* ignore */ }
    clearTimeout(t); t = setTimeout(() => set({ last: null }), 4000);
  },
};
export function useGuide<T>(sel: (s: G) => T): T { return useSyncExternalStore(guide.subscribe, () => sel(state), () => sel(state)); }

const STEP: Record<string, string> = { power: "power-systems", solar: "power-systems", feed: "power-systems", load: "power-systems", hab: "astronaut-life", o2: "astronaut-life", "3-crew": "astronaut-life", comms: "comms-delay", report: "comms-delay", ant: "comms-delay", noise: "comms-delay", "4-fix": "comms-delay", status: "comms-delay", relay: "comms-delay", fc: "mars-storm", "2-tele": "science-sampling", sensor: "science-sampling", sample: "science-sampling", interp: "science-sampling", "3-rover": "rover-ops", "5-tele": "rover-ops", bat: "rover-ops", "5-crew": "astronaut-eva", diag: "rover-ops", "5-fix": "rover-ops" };
/** Picks the manual entry that matches what the player is doing right now. */
export function contextEntry(w: World, e: Explore): string {
  const moon = w.destination === "moon";
  if (w.screen === "design") return "basics-tradeoffs";
  if (w.screen === "flight") return "orbit-basics";
  if (w.screen === "rover") { if (e.battery < 20) return "power-systems"; if (e.link < 25 || e.queue > 0) return "comms-delay"; if (e.near !== null && e.nearDist < 8) return "science-sampling"; if (e.dust > 40) return moon ? "moon-dust" : "mars-storm"; return moon ? "moon-env" : "mars-env"; }
  if (w.screen === "play") {
    const m = MISSIONS[w.mission], st = m.steps[Math.min(w.step, m.steps.length - 1)];
    if (w.dialog?.emg) return `emergency-${w.dialog.emg}`;
    if (w.r.oxygen < 25) return "emergency-air"; if (w.r.power < 15) return "emergency-power"; if (w.r.comms < 20) return "emergency-comms"; if (w.storm > 0.2) return "mars-storm";
    return STEP[`${m.id}-${st.id}`] ?? STEP[st.id] ?? "basics-mission";
  }
  return "basics-mission";
}
