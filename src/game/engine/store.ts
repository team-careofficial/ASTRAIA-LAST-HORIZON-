import { useSyncExternalStore } from "react";
import type { CrewStat, Effects, HistoryEntry, Res, Screen, Settings, World } from "@/types/world";
import { CREW3D, FLAG_NOTES, MISSIONS } from "@/data/world/missions";
import { clamp, tick } from "@/game/simulation/world";
import { setMix, sfx, stormLevel } from "@/lib/utils/audio";
import { EMERGENCIES, EMG_STATIONS } from "@/data/knowledge/emergencies";
import { guide } from "@/game/guide/store";
import { DEFAULT_DESIGN, designMods, type Design, type Dest } from "@/data/design/options";

export function recommendQuality(): Settings["quality"] {
  const n = typeof navigator === "undefined" ? 4 : navigator.hardwareConcurrency || 4;
  return n >= 12 ? "ultra" : n >= 8 ? "high" : n >= 4 ? "medium" : "low";
}

const SAVE = "astraia-save-v2", SET = "astraia-settings-v2";
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  del: (k: string) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};
const freshRes = (): Res => ({ oxygen: 82, water: 74, food: 88, power: 68, fuel: 61, battery: 80, temp: 21, comms: 78, habitat: 96, rover: 100, science: 0, minutes: 0 });
const freshCrew = (): CrewStat[] => [[97, 22, 16, 79], [98, 12, 14, 82], [96, 18, 10, 88], [95, 15, 12, 85]].map(([health, fatigue, stress, morale]) => ({ health, fatigue, stress, morale }));
export const DEFAULT_SETTINGS: Settings = { quality: "high", master: 0.8, music: 0.6, sfx: 0.8, muted: false, sens: 1, invert: false, reducedMotion: false, colorSafe: false, uiScale: 1, dev: false, seenIntro: false, guided: true };
const KEYS = ["power", "oxygen", "water", "food", "fuel", "battery", "comms", "habitat", "rover", "science"] as const;

let carry: { r: Res; crew: CrewStat[] } | null = null, applied: string[] = [];
let startSnap: { r: Res; crew: CrewStat[]; flags: string[]; applied: string[] } | null = null;
let state: World = {
  screen: "boot", paused: false, pausePanel: null, mission: 0, step: 0, selected: 0, nearby: false, dist: 99, dialog: null, toast: null, active: 0,
  r: freshRes(), crew: freshCrew(), bonus: 0, xp: 0, level: 1, gain: 0, failed: false, completed: {}, flags: [], history: [], notes: [], storm: 0,
  destination: "mars", design: DEFAULT_DESIGN, committed: false, demo: false, discoveredCount: 0,
  emgRun: null, settings: DEFAULT_SETTINGS, ready: {}, hasRun: false, hasSave: false,
};
const listeners = new Set<() => void>();
const set = (p: Partial<World>) => { state = { ...state, ...p }; listeners.forEach(l => l()); };
let toastTimer: ReturnType<typeof setTimeout> | undefined;
const toast = (t: string) => { set({ toast: t }); clearTimeout(toastTimer); toastTimer = setTimeout(() => set({ toast: null }), 2800); };
const avg = (c: CrewStat[], k: keyof CrewStat) => Math.round(c.reduce((a, x) => a + x[k], 0) / c.length);
const stormFor = (m: number, step: number) => (m === 2 ? 0.3 + 0.12 * step : 0);
let queuedEmg: string | null = null; const emgSeen = new Set<string>();
const queue = (id: string) => { if (!emgSeen.has(id) && !queuedEmg) { emgSeen.add(id); queuedEmg = id; } };
const nodesOf = (d: { emg?: string }) => (d.emg ? EMERGENCIES[d.emg].nodes : MISSIONS[state.mission].steps[state.step].nodes);

function applyDom() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("rm", state.settings.reducedMotion);
  document.documentElement.classList.toggle("cs", state.settings.colorSafe);
}
function persist(withRun: boolean) {
  const run = withRun && state.screen === "play" ? { mission: state.mission, step: state.step, r: state.r, crew: state.crew, bonus: state.bonus, startSnap } : null;
  ls.set(SAVE, JSON.stringify({ xp: state.xp, level: state.level, completed: state.completed, flags: state.flags, history: state.history, applied, carry, run, destination: state.destination, design: state.design, committed: state.committed }));
  set({ hasSave: true, hasRun: !!run });
}
function applyFx(fx: Effects = {}) {
  const mods = designMods(state.design, state.destination), old = state.r, crew = state.crew.map(c => ({ ...c })), r = { ...old };
  const min = Math.round((fx.minutes ?? 0) * (crew[state.active].fatigue > 70 ? 1.3 : 1));
  KEYS.forEach(k => { const v = fx[k]; if (v) r[k] = clamp(r[k] + (k === "science" ? v * mods.sci : v)); });
  crew.forEach((c, i) => { c.stress = clamp(c.stress + (fx.stress ?? 0)); c.fatigue = clamp(c.fatigue + (fx.fatigue ?? 0) + (i === state.active ? 3 : 0)); c.health = clamp(c.health + (fx.health ?? 0)); });
  const t = tick(r, min, state.storm, mods);
  crew.forEach(c => { c.stress = clamp(c.stress + t.dStress); c.fatigue = clamp(c.fatigue + t.dFatigue); c.health = clamp(c.health + t.dHealth); c.morale = clamp(c.morale + (c.stress > 60 ? -3 : c.stress < 30 ? 1 : 0)); });
  const em = (x: Res) => x.oxygen < 25 || x.power < 15;
  if (!em(old) && em(t.r)) { sfx("warn"); toast("EMERGENCY: life support or power is critical."); queue(t.r.oxygen < 25 ? "oxygen" : "power"); }
  else if (old.comms >= 30 && t.r.comms < 30) { sfx("static"); toast("COMMUNICATION DEGRADED: Earth assistance unavailable."); queue("comms"); }
  set({ r: t.r, crew, bonus: state.bonus + (fx.bonus ?? 0), flags: fx.flag && !state.flags.includes(fx.flag) ? [...state.flags, fx.flag] : state.flags });
  if (state.storm > 0.2) guide.note("dust-storm"); if (t.r.comms < 30) guide.note("comms-low");
}
function finish(success: boolean) {
  const m = MISSIONS[state.mission], picks = state.history.filter(h => h.m === m.id);
  const ratio = picks.filter(p => p.tag === "SUCCESS").length / Math.max(1, picks.length);
  const rating = !success ? "FAILED" : ratio >= 0.7 ? "EXCELLENT" : ratio >= 0.4 ? "GOOD" : "SURVIVED";
  const gain = success ? 80 + Math.max(0, state.bonus) + Math.round((100 - avg(state.crew, "stress")) / 5) : 0, xp = state.xp + gain, prev = state.completed[m.id];
  const completed = success && (!prev || gain > prev.xp) ? { ...state.completed, [m.id]: { xp: gain, rating, science: state.r.science, stress: avg(state.crew, "stress"), picks } } : state.completed;
  if (success) carry = { r: state.r, crew: state.crew };
  set({ emgRun: null, dialog: null, gain, xp, level: Math.floor(xp / 150) + 1, completed, failed: !success, screen: success && state.demo ? "report" : "result", storm: 0 });
  sfx(success ? "ok" : "fail"); stormLevel(0); persist(false); if (success) guide.note(`mission-${m.id}`);
}

export const game = {
  get: () => state,
  addXp: (n: number) => { const xp = state.xp + n; set({ xp, level: Math.floor(xp / 150) + 1 }); if (!state.hasRun) persist(false); },
  subscribe: (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; },
  hydrate: () => {
    try {
      const s = ls.get(SET); set({ settings: { ...DEFAULT_SETTINGS, quality: recommendQuality(), ...(s ? JSON.parse(s) : {}) } });
      const raw = ls.get(SAVE);
      if (raw) { const d = JSON.parse(raw); carry = d.carry ?? null; applied = d.applied ?? []; set({ destination: d.destination ?? "mars", design: { ...DEFAULT_DESIGN, ...(d.design ?? {}) }, committed: !!d.committed, xp: d.xp ?? 0, level: d.level ?? 1, completed: d.completed ?? {}, flags: d.flags ?? [], history: d.history ?? [], hasSave: true, hasRun: !!d.run }); if (d.run) (state as World & { _run?: unknown })._run = d.run; }
    } catch { /* corrupt save: start fresh */ }
    applyDom();
  },
  setSetting: (p: Partial<Settings>) => { const settings = { ...state.settings, ...p }; set({ settings }); ls.set(SET, JSON.stringify(settings)); setMix(settings); applyDom(); },
  audioReady: () => setMix(state.settings),
  go: (s: Screen) => set({ screen: s, paused: false, pausePanel: null }),
  markReady: (k: string) => { if (!state.ready[k]) set({ ready: { ...state.ready, [k]: true } }); },
  unlocked: (i: number) => i >= 0 && i < MISSIONS.length,
  select: (i: number) => set({ selected: i }),
  brief: (i: number) => {
    if (!game.unlocked(i)) return;
    const c = carry && i > 0 ? carry : null, base = freshRes(); let r: Res = base, crew = freshCrew(); const notes: string[] = [];
    if (c) { r = { ...c.r, minutes: 0, temp: 21, power: Math.max(c.r.power, 50), oxygen: Math.max(c.r.oxygen, 60), water: Math.max(c.r.water, 50), food: Math.max(c.r.food, 50), battery: Math.max(c.r.battery, 50), fuel: Math.max(c.r.fuel, 40), comms: Math.max(c.r.comms, 50) };
      crew = c.crew.map(x => ({ health: Math.max(x.health, 80), fatigue: Math.round(x.fatigue * 0.3), stress: Math.round(x.stress * 0.5), morale: x.morale })); }
    if (!c) { const m = designMods(state.design, state.destination); r = { ...r, battery: clamp(m.battery), power: clamp(m.power), comms: clamp(m.comms), fuel: clamp(m.fuel) }; }
    applied = state.flags.filter(f => applied.includes(f));
    state.flags.forEach(f => { const n = FLAG_NOTES[f]; if (n && !applied.includes(f) && i > 0) { applied.push(f); notes.push(n.text);
      Object.entries(n.fx).forEach(([k, v]) => { if (k === "fatigue") crew = crew.map(x => ({ ...x, fatigue: clamp(x.fatigue + (v ?? 0)) })); else r = { ...r, [k]: clamp((r as unknown as Record<string, number>)[k] + (v ?? 0)) }; }); } });
    queuedEmg = null; emgSeen.clear(); startSnap = { r, crew, flags: state.flags, applied: [...applied] };
    set({ emgRun: null, mission: i, selected: i, step: 0, r, crew, notes, bonus: 0, dialog: null, screen: "briefing", history: state.history.filter(h => h.m !== MISSIONS[i].id) });
  },
  start: () => { set({ screen: "play", paused: false, step: 0, storm: stormFor(state.mission, 0), active: 0, failed: false }); stormLevel(state.storm); sfx("notify"); persist(true); },
  newGame: () => { ls.del(SAVE); carry = null; applied = []; set({ xp: 0, level: 1, completed: {}, flags: [], history: [], hasSave: false, hasRun: false }); game.brief(0); },
  resetSave: () => { ls.del(SAVE); carry = null; applied = []; set({ xp: 0, level: 1, completed: {}, flags: [], history: [], hasSave: false, hasRun: false, screen: "menu" }); toast("Save reset."); },
  continueGame: () => {
    const run = (state as World & { _run?: { mission: number; step: number; r: Res; crew: CrewStat[]; bonus: number; startSnap: typeof startSnap } })._run;
    if (!run) return game.go("archive");
    startSnap = run.startSnap;
    set({ mission: run.mission, step: run.step, r: run.r, crew: run.crew, bonus: run.bonus, screen: "play", paused: false, dialog: null, storm: stormFor(run.mission, run.step), failed: false });
    stormLevel(state.storm);
  },
  restart: () => { if (!startSnap) return; queuedEmg = null; emgSeen.clear(); set({ emgRun: null, r: startSnap.r, crew: startSnap.crew, flags: startSnap.flags, step: 0, bonus: 0, dialog: null, paused: false, pausePanel: null, history: state.history.filter(h => h.m !== MISSIONS[state.mission].id), storm: stormFor(state.mission, 0) }); stormLevel(state.storm); },
  nodes: () => (state.dialog ? nodesOf(state.dialog) : null),
  setDestination: (d: Dest) => set({ destination: d, screen: "design" }),
  setDest: (d: Dest) => set({ destination: d }),
  setDesign: (p: Partial<Design>) => set({ design: { ...state.design, ...p } }),
  commit: () => { set({ committed: true, demo: false, screen: "launch" }); persist(false); },
  redesign: () => set({ screen: "destination" }),
  startDemo: () => { set({ destination: "mars", design: DEFAULT_DESIGN, committed: true, demo: true }); game.brief(2); },
  togglePause: () => { if (state.screen === "play" || state.screen === "rover" || state.screen === "flight") set({ paused: !state.paused, pausePanel: null }); },
  setPausePanel: (p: World["pausePanel"]) => set({ pausePanel: p }),
  quit: () => { persist(true); set({ emgRun: null, screen: "menu", paused: false, pausePanel: null, dialog: null }); stormLevel(0); },
  setActive: (i: number) => { if (state.screen === "play" && !state.dialog && !state.paused && i !== state.active) { set({ active: i }); sfx("click"); } },
  cycle: () => game.setActive((state.active + 1) % CREW3D.length),
  emgPenalty: () => { const er = state.emgRun; if (!er || state.dialog || state.paused) return; const r = { ...state.r }; if (er.id === "power") r.power = clamp(r.power - 1); else if (er.id === "oxygen") r.oxygen = clamp(r.oxygen - 1.2); else r.comms = clamp(r.comms - 0.8); set({ r }); if (r.oxygen <= 0) finish(false); },
  setNear: (dist: number, nearby: boolean) => { if (dist !== state.dist || nearby !== state.nearby) set({ dist, nearby }); },
  interact: () => {
    if (state.dialog || state.paused || state.screen !== "play" || !state.nearby) return;
    if (state.emgRun) { const er = state.emgRun; sfx("click"); return set({ dialog: { nodeId: er.node, result: null, tag: null, pending: null, disabled: [], emg: er.id } }); }
    const st = MISSIONS[state.mission].steps[state.step], c = CREW3D[state.active];
    if (c.id !== st.role) { const need = CREW3D.find(x => x.id === st.role)!; return toast(`Switch to ${need.name} (${need.role}) for this task.`); }
    if (state.crew[state.active].health < 30) return toast(`${c.name} is too hurt for this. Switch crew.`);
    sfx("click"); set({ dialog: { nodeId: st.start, result: null, tag: null, pending: null, disabled: [] } });
  },
  choose: (cid: string) => {
    const d = state.dialog; if (!d || d.result) return;
    const ch = nodesOf(d)[d.nodeId].choices.find(c => c.id === cid)!;
    const gated = !!ch.gate && state.r.comms < ch.gate.comms, tag = gated ? "FAILURE" : ch.tag;
    applyFx(gated ? { minutes: ch.effects?.minutes } : ch.effects);
    const entry: HistoryEntry = { m: MISSIONS[state.mission].id, s: state.step, choice: ch.label, tag, t: state.r.minutes };
    set({ history: [...state.history, entry], dialog: { ...d, result: gated ? ch.gate!.result : ch.result, tag, pending: ch.next, disabled: ch.next === "retry" ? [...d.disabled, cid] : d.disabled } });
    sfx(tag === "SUCCESS" ? "ok" : tag === "PARTIAL" ? "notify" : "fail");
    if (state.r.oxygen <= 0 || avg(state.crew, "health") <= 5) finish(false);
  },
  next: () => {
    const d = state.dialog; if (!d || !d.pending) return;
    if (d.pending === "retry") return set({ dialog: { ...d, result: null, tag: null, pending: null } });
    if (d.emg && d.pending !== "done") { const nx = (state.emgRun?.idx ?? 0) + 1; set({ dialog: null, emgRun: { id: d.emg, node: d.pending, idx: nx } }); sfx("notify"); return toast(`NEXT: ${EMG_STATIONS[d.emg][nx].verb}. Go to the ${EMG_STATIONS[d.emg][nx].name}.`); }
    if (d.pending !== "done") return set({ dialog: { ...d, nodeId: d.pending, result: null, tag: null, pending: null } });
    if (d.emg) { guide.note(`emg-${d.emg}`); sfx("ok"); set({ dialog: null, emgRun: null }); return toast(`${EMERGENCIES[d.emg].title} resolved. Systems verified.`); }
    const step = state.step + 1;
    if (step >= MISSIONS[state.mission].steps.length) return finish(true);
    set({ dialog: null, step, storm: stormFor(state.mission, step) }); stormLevel(state.storm); sfx("notify"); persist(true);
    if (queuedEmg) { const id = queuedEmg; queuedEmg = null; set({ emgRun: { id, node: "n1", idx: 0 } }); sfx("warn"); toast(`ALARM: ${EMERGENCIES[id].title}. Go to the ${EMG_STATIONS[id][0].name}.`); }
  },
};
export function useGame<T>(sel: (s: World) => T): T { return useSyncExternalStore(game.subscribe, () => sel(state), () => sel(state)); }
