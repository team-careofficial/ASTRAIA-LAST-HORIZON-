import { useSyncExternalStore } from "react";
import { game } from "@/game/engine/store";
export interface FunState { best: { moon: number; mars: number }; landed: { moon: number; mars: number }; quizBest: Record<string, number>; quizPlays: number; shards: number; callsign: string }
const KEY = "astraia-fun-v1";
const init = (): FunState => ({ best: { moon: 0, mars: 0 }, landed: { moon: 0, mars: 0 }, quizBest: {}, quizPlays: 0, shards: 0, callsign: "" });
let state: FunState = init();
const ls = new Set<() => void>();
let loaded = false;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked */ } };
const set = (p: Partial<FunState>) => { state = { ...state, ...p }; save(); ls.forEach(l => l()); };
export const fun = {
  get: () => state,
  subscribe: (l: () => void) => { ls.add(l); return () => { ls.delete(l); }; },
  load: () => { if (loaded) return; loaded = true; try { const r = localStorage.getItem(KEY); if (r) { state = { ...init(), ...JSON.parse(r) }; ls.forEach(l => l()); } } catch { /* ignore */ } },
  setCallsign: (callsign: string) => set({ callsign: callsign.slice(0, 14) }),
  quizDone: (level: string, score: number) => set({ quizPlays: state.quizPlays + 1, quizBest: { ...state.quizBest, [level]: Math.max(state.quizBest[level] ?? 0, score) } }),
  landed: (world: "moon" | "mars", score: number) => set({ landed: { ...state.landed, [world]: state.landed[world] + 1 }, best: { ...state.best, [world]: Math.max(state.best[world], score) } }),
  addShards: (n: number) => { if (n > 0) set({ shards: state.shards + n }); },
  xp: (n: number) => game.addXp(n),
};
export function useFun<T>(sel: (s: FunState) => T): T { return useSyncExternalStore(fun.subscribe, () => sel(state), () => sel(state)); }
