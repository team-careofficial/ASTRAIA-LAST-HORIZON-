import type { World } from "@/types/world";
import { MISSIONS } from "@/data/world/missions";
import { evaluate } from "@/data/design/options";
const cl = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
/** Ending and score come from the final simulation state, never from a single choice. */
export function buildReport(w: World, found: number, roverScience: number) {
  const h = w.history, n = Math.max(1, h.length), succ = h.filter(p => p.tag === "SUCCESS").length, part = h.filter(p => p.tag === "PARTIAL").length, risk = h.filter(p => p.tag === "RISK").length, fail = h.filter(p => p.tag === "FAILURE").length;
  const done = Object.keys(w.completed).length, alive = w.crew.filter(c => c.health > 5).length, r = w.r, e = evaluate(w.design, w.destination);
  const science = cl(r.science + found * 5 + roverScience * 0.4), decision = cl(((succ + part * 0.5) / n) * 100), res = cl((r.oxygen + r.power + r.water + r.food + r.fuel) / 5), eng = cl(100 - fail * 12 - risk * 4 + (r.habitat - 90));
  const score = Math.round(science * 40 + decision * 30 + res * 20 + eng * 20 + alive * 500 + Math.max(0, e.budget - e.cost) * 5 + done * 300);
  let ending = "PARTIAL SUCCESS";
  if (alive === 0) ending = "CATASTROPHIC FAILURE"; else if (res < 25) ending = "RESOURCE COLLAPSE"; else if (r.comms < 20) ending = "LOST COMMUNICATION"; else if (done < 2) ending = "MISSION ABORT";
  else if (science >= 85 && decision >= 80 && alive === 4 && done === MISSIONS.length) ending = "PERFECT MISSION"; else if (science >= 85) ending = "SCIENTIFIC BREAKTHROUGH"; else if (science >= 60) ending = "SCIENCE SUCCESS"; else if (alive === 4 && done >= 3) ending = "CREW SURVIVAL";
  const status = alive === 0 || ending === "MISSION ABORT" || ending === "RESOURCE COLLAPSE" ? "FAILED" : done === MISSIONS.length ? "SUCCESS" : "IN PROGRESS";
  return { ending, status, crew: `${alive} / 4`, science, resources: res, engineering: eng, decision, score, discoveries: found + w.discoveredCount, critical: fail + risk, done, total: MISSIONS.length, timeline: h };
}
