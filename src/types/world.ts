import type { CrewId } from "@/types";
import type { Design, Dest } from "@/data/design/options";
export type Tag = "SUCCESS" | "PARTIAL" | "RISK" | "FAILURE";
export interface Effects { power?: number; oxygen?: number; water?: number; food?: number; fuel?: number; battery?: number; comms?: number; habitat?: number; rover?: number; science?: number; minutes?: number; stress?: number; fatigue?: number; health?: number; bonus?: number; flag?: string }
export interface Choice { id: string; label: string; hint?: string; tag: Tag; effects?: Effects; result: string; next: string; gate?: { comms: number; result: string } }
export interface DialogNode { id: string; title: string; body: string; choices: Choice[] }
export interface Step { id: string; name: string; role: CrewId; pos: [number, number]; radius: number; objective: string; start: string; nodes: Record<string, DialogNode> }
export interface Mission { id: number; title: string; brief: string; steps: Step[] }
export interface Res { oxygen: number; water: number; food: number; power: number; fuel: number; battery: number; temp: number; comms: number; habitat: number; rover: number; science: number; minutes: number }
export interface CrewStat { health: number; fatigue: number; stress: number; morale: number }
export interface DialogState { nodeId: string; result: string | null; tag: Tag | null; pending: string | null; disabled: string[]; emg?: string }
export interface HistoryEntry { m: number; s: number; choice: string; tag: Tag; t: number }
export interface Completed { xp: number; rating: string; science: number; stress: number; picks: HistoryEntry[] }
export interface Settings { quality: "ultra" | "high" | "medium" | "low"; master: number; music: number; sfx: number; muted: boolean; sens: number; invert: boolean; reducedMotion: boolean; colorSafe: boolean; uiScale: number; dev: boolean; seenIntro: boolean; guided: boolean }
export interface EmgRun { id: string; node: string; idx: number }
export type Screen = "boot" | "menu" | "archive" | "science" | "settings" | "credits" | "destination" | "design" | "launch" | "report" | "manual" | "modes" | "fun" | "rover" | "flight" | "briefing" | "play" | "result";
export interface World {
  screen: Screen; paused: boolean; pausePanel: null | "objectives" | "controls" | "settings"; mission: number; step: number; selected: number;
  nearby: boolean; dist: number; dialog: DialogState | null; toast: string | null; active: number;
  r: Res; crew: CrewStat[]; bonus: number; xp: number; level: number; gain: number; failed: boolean;
  completed: Record<number, Completed>; flags: string[]; history: HistoryEntry[]; notes: string[]; storm: number;
  destination: Dest; design: Design; committed: boolean; demo: boolean; discoveredCount: number;
  emgRun: EmgRun | null;
  settings: Settings; ready: Record<string, boolean>; hasRun: boolean; hasSave: boolean;
}
