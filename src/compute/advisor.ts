/**
 * Mission Advisor. It never states the answer. It reads the numbers and asks the question a flight director would ask,
 * so the player decides. Rule-based and deterministic: same design, same hints. No model, no network.
 */
import type { Closure, DesignInput } from "./closure";
import { INSTRUMENTS, PROPELLANTS } from "../data/real/missionData";
export interface Hint { id: string; text: string }
export function adviseClosure(d: DesignInput, c: Closure): Hint[] {
  const h: Hint[] = [];
  if (c.wetKg > c.capacityKg) h.push({ id: "cap", text: `The launcher can lift ${Math.round(c.capacityKg)} kg and this craft is ${Math.round(c.wetKg)} kg. Is it cheaper to change the rocket or to cut mass?` });
  if (c.dvAvailMs < c.dvRequiredMs) h.push({ id: "dv", text: `Delta-v is ${Math.round(c.dvRequiredMs - c.dvAvailMs)} m/s short. In dv = Isp x g0 x ln(m0/mf), which term can you change most easily?` });
  if (c.closes && c.dvMarginPct < 0.5) h.push({ id: "thin", text: `The margin is only ${c.dvMarginPct.toFixed(2)}%. What happens if one part turns out 1 kg heavier than planned?` });
  const lowIsp = PROPELLANTS.slice().sort((a, b) => a.isp - b.isp)[0];
  if (d.propellant === lowIsp.id && !c.closes) h.push({ id: "isp", text: `${lowIsp.name} has the lowest Isp on offer. What would a higher Isp do to delta-v for the same mass?` });
  const heavy = d.instruments.map(id => INSTRUMENTS.find(i => i.id === id)!).sort((a, b) => b.massKg - a.massKg)[0];
  if (heavy && !c.closes) h.push({ id: "heavy", text: `${heavy.name} is your heaviest instrument at ${heavy.massKg} kg. Is its science worth that mass for this goal?` });
  if (c.closes && c.massMarginPct > 60) h.push({ id: "spare", text: "You have a lot of unused launcher capacity. Could you spend it on propellant for more delta-v margin?" });
  if (c.closes && c.dvMarginPct >= 0.5) h.push({ id: "lean", text: "It closes with a safe margin. Can you reach the same result with less mass?" });
  return h.slice(0, 3);
}
export interface Debrief { score: number; efficiency: number; accuracy: number; teamwork: number; mistakes: { text: string; ask: string }[]; coaching: string[] }
const cl = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
/** Smart debrief from the final simulation numbers (all 0 to 100 except score). */
export function debrief(i: { score: number; science: number; decision: number; resources: number; engineering: number; crewAlive: number; morale: number; stress: number; log: { choice: string; tag: string }[] }): Debrief {
  const teamwork = cl((i.crewAlive / 4) * 50 + i.morale * 0.3 + (100 - i.stress) * 0.2), accuracy = cl(i.decision * 0.6 + i.science * 0.4);
  const mistakes = i.log.filter(l => l.tag === "FAILURE" || l.tag === "RISK").slice(0, 5).map(l => ({ text: l.choice, ask: l.tag === "FAILURE" ? "What did this cost you, and what was the safer option?" : "This was risky. Which number should have warned you first?" }));
  const coaching: string[] = [];
  if (i.resources < 50) coaching.push("Resources ran thin. Which one fell first, and when could you have spent less?");
  if (i.science < 50) coaching.push("Science output was low. Did your instruments match the question you set at the start?");
  if (teamwork < 50) coaching.push("Crew morale or stress suffered. What would you change in the schedule?");
  if (i.engineering < 50) coaching.push("Engineering margins were thin. Which design choice left you with no spare capacity?");
  if (coaching.length === 0) coaching.push("Strong run. Try a harder destination, or the same one with a smaller budget.");
  return { score: i.score, efficiency: cl(i.resources * 0.6 + i.engineering * 0.4), accuracy, teamwork, mistakes, coaching };
}
