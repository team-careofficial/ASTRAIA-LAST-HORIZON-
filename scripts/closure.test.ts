import { evaluate, spareInstrumentKg, costM, budgetM } from "../src/compute/closure";
import { INSTRUMENTS } from "../src/data/real/missionData";
let fail = 0; const ok = (c: boolean, m: string) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };

// Rocket equation by hand: Isp 320, mf 1000, m0 2718.28 -> dv = 320*9.80665*ln(e) = 3138 m/s
const near = evaluate({ launcher: "atlas5", target: "mars", propellant: "bipro", busDryKg: 1000, propellantKg: 1718.28, instruments: [] });
ok(Math.abs(near.dvAvailMs - 320 * 9.80665) < 1, "rocket equation matches hand calc");

// Killer demo: tune the bus so Mars closes with a thin margin, then add one instrument.
const base = { launcher: "atlas5", target: "mars", propellant: "bipro", propellantKg: 6000, busDryKg: 0, instruments: ["mastcamz", "meda"] };
let lo = 1000, hi = 6000;
for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (evaluate({ ...base, busDryKg: m }).closes ? (lo = m) : (hi = m)); }
const edge = { ...base, busDryKg: lo - 2 };             // about 2 kg shy of the edge
const a = evaluate(edge);
ok(a.closes && a.dvMarginPct >= 0 && a.dvMarginPct < 1, `edge design closes, dv margin ${a.dvMarginPct.toFixed(3)} %`);
const b = evaluate({ ...edge, instruments: [...edge.instruments, "moxie"] });   // +17.1 kg
ok(!b.closes && b.dvMarginPct < 0, `adding MOXIE (+${INSTRUMENTS.find(i => i.id === "moxie")!.massKg} kg) breaks it: ${b.failures.join(" ")}`);
const c = evaluate(edge);
ok(c.closes, "removing it closes again (deterministic)");
ok(JSON.stringify(evaluate(edge)) === JSON.stringify(evaluate(edge)), "same input, same output");
ok(spareInstrumentKg(edge) >= 0 && spareInstrumentKg(edge) < 17.1, `spare payload at the edge = ${spareInstrumentKg(edge).toFixed(1)} kg`);
// mass limit path
const heavy = evaluate({ ...base, launcher: "antares", busDryKg: 3000 }); // 9,000 kg wet vs 8,000 kg limit
ok(!heavy.closes && heavy.failures[0].includes("cannot lift"), "small launcher fails on mass");
ok(costM({ ...edge }) === 130 + 120 + 12 + 15, "cost = launcher + bus + instruments (SIM)");
ok(costM({ ...edge, instruments: INSTRUMENTS.map(i => i.id) }) > budgetM, "all seven instruments blow the budget");
process.exit(fail ? 1 : 0);
