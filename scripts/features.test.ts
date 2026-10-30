import { runSol, newGh, GH } from "../src/compute/greenhouse";
import { solarWhPerSol } from "../src/compute/solar";
import { adviseClosure, debrief } from "../src/compute/advisor";
import { evaluate } from "../src/compute/closure";
import { encode, decode, judge, rank, toCsv } from "../src/game/classroom/challenge";
let fail = 0; const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const clear = solarWhPerSol({ irradiance: 586.2, tau: 0.5 }), storm = solarWhPerSol({ irradiance: 586.2, tau: 5 });
ok(clear > 30000 && clear < 60000, `clear-sky array makes ${Math.round(clear)} Wh/sol`); ok(storm < clear * 0.05, "a global dust storm cuts solar energy by more than 95%");
ok(solarWhPerSol({ irradiance: 586.2, tau: 0.5 }) === clear, "solar energy is deterministic");
const ctl = { lightHours: 12, tempC: 22, waterL: 12 };
let s = newGh(); for (let i = 0; i < 5; i++) s = runSol(s, ctl, { irradiance: 586.2, tau: 0.5 }).state;
ok(s.foodKg > 3 && s.health >= 100, `clear sky grows food (${s.foodKg.toFixed(1)} kg in 5 sols)`);
let t = newGh(); let last = runSol(t, ctl, { irradiance: 586.2, tau: 5 }); for (let i = 0; i < 10; i++) { last = runSol(t, ctl, { irradiance: 586.2, tau: 5 }); t = last.state; }
ok(t.foodKg < s.foodKg * 2 && last.sol.powerFrac < 1, "storm drains the battery and power runs short");
ok(runSol(newGh(), { ...ctl, waterL: 0 }, { irradiance: 586.2, tau: 0.5 }).sol.yieldKg === 0, "no water, no food");
const d = { launcher: "atlas5", target: "mars", propellant: "hydrazine", busDryKg: 4000, propellantKg: 3000, instruments: ["moxie", "supercam"] };
const c = evaluate(d), hints = adviseClosure(d, c);
ok(!c.closes && hints.length > 0 && hints.every(h => h.text.includes("?") || h.text.includes("short")), "advisor gives hints for a failing design");
ok(hints.every(h => !/you should|must (remove|add)/i.test(h.text)), "advisor does not give the answer");
ok(JSON.stringify(adviseClosure(d, c)) === JSON.stringify(hints), "advisor is deterministic");
const db = debrief({ score: 1000, science: 40, decision: 50, resources: 30, engineering: 45, crewAlive: 3, morale: 40, stress: 70, log: [{ choice: "Skipped repair", tag: "FAILURE" }, { choice: "Rested", tag: "SUCCESS" }] });
ok(db.mistakes.length === 1 && db.coaching.length >= 3 && db.teamwork < 60, "debrief finds the mistake and coaches");
const ch = { v: 1 as const, name: "Class 9B", target: "mars", launcher: "atlas5", propellant: "bipro", bus: 2764, budgetM: 400, minInstruments: 2 };
ok(JSON.stringify(decode(encode(ch))) === JSON.stringify(ch), "challenge code round-trips"); ok(decode("not a code") === null && decode(encode({ ...ch, bus: 99999 })) === null, "bad codes are rejected");
const a = judge(ch, 6000, ["mastcamz", "meda"], "A"), b = judge(ch, 6000, ["mastcamz"], "B"), z = judge(ch, 6000, ["mastcamz", "meda", "supercam", "moxie"], "Z");
ok(b.reason.includes("needs 2"), "too few instruments is flagged"); ok(!z.ok, "overloaded design is not a winner");
const r = rank([z, b, a]); ok(r[0].name === "A" || (!a.ok && r[0].ok === false), "valid designs rank before invalid ones");
ok(toCsv(ch, r).startsWith("rank,team"), "CSV export has a header");
if (fail) { console.log(fail + " failed"); process.exit(1); }
