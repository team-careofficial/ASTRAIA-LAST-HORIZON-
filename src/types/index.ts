export type ResourceKey = "oxygen" | "water" | "food" | "power" | "fuel" | "battery" | "communication";
export interface Resource { current: number; max: number; rate: number; warning: number } // rate = change per hour
export type CrewId = "sarah" | "ben" | "eva" | "liam";
export interface CrewMember {
  id: CrewId; name: string; role: string;
  health: number; fatigue: number; stress: number; morale: number; expertise: string[];
}
export interface Environment { temperature: number; radiation: number; solarStability: number }
export type MissionStatus = "locked" | "active" | "complete" | "failed";
export type GameMode = "solo" | "coop";
export type Destination = "moon" | "mars";
export type Difficulty = "explorer" | "survivor" | "nightmare";
/** The player role is a crew id: eva = Engineer, ben = Scientist, sarah = Medic, liam = Rover Operator. */
export interface GameConfig { mode: GameMode; players: number; destination: Destination; difficulty: Difficulty; role: CrewId }
export type Risk = "LOW" | "MEDIUM" | "HIGH";
export interface Effects {
  resources?: Partial<Record<ResourceKey, number>>;
  habitatIntegrity?: number; roverIntegrity?: number; solarStability?: number;
  scientificProgress?: number; minutes?: number; crewStress?: number; crewFatigue?: number;
  anomaly?: string;
}
export interface Decision {
  id: string; title: string; description: string;
  cost: string; risk: Risk; potential: string;
  requires?: { crewId: CrewId; minHealth: number };
  effects: Effects; consequence: string;
  /** event id, null = complete mission, "stay" = remain on the current event */
  nextEvent: string | null;
}
export interface MissionEvent { id: string; title: string; description: string; decisions: Decision[] }
export interface Mission {
  id: string; code: string; title: string; summary: string;
  playable: boolean; startEvent: string; events: Record<string, MissionEvent>;
}
export interface HistoryEntry { decisionId: string; title: string; missionId: string; at: number }
export interface Delta { label: string; value: number }
export interface DecisionResult { title: string; consequence: string; deltas: Delta[]; key: number }
export interface GameState {
  config: GameConfig;
  resources: Record<ResourceKey, Resource>;
  environment: Environment;
  habitat: { integrity: number };
  rover: { integrity: number };
  crew: CrewMember[];
  mission: { currentId: string; status: MissionStatus; eventId: string };
  missionTime: number; // minutes since landing
  scientificProgress: number;
  decisionHistory: HistoryEntry[];
  discoveredAnomalies: string[];
  lastResult: DecisionResult | null;
}
