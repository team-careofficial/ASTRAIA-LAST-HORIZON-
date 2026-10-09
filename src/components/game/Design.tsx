import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, ChevronLeft, Rocket } from "lucide-react";
import { game, useGame } from "@/game/engine/store";
import { preview } from "@/game/engine/preview";
import * as D from "@/data/design/options";
import Btn from "@/components/ui/Btn";
import { Eyebrow, KindTag, Meter, Pips } from "@/components/ui/kit";
import { Shell } from "./Pages";

/* ---------- 01 DESTINATION SELECT ---------- */
const DEST = {
  moon: { name: "THE MOON", tag: "Near-Earth lunar expedition", art: "radial-gradient(circle at 32% 30%, #d9d9dc 0, #8c8c92 40%, #3a3a40 78%, #131316)", glow: "rgba(220,220,235,.25)",
    rows: [["Distance", "384,400 km", "real"], ["Mission duration", "About 3 days each way", "real"], ["Gravity", "1.62 m/s² (about 1/6 of Earth)", "real"], ["Comms delay", "About 1.3 s one way", "real"]] as [string, string, D.Kind][],
    difficulty: 3, science: 4, hazards: ["Vacuum", "Abrasive dust", "Radiation", "Two-week night"], blurb: "A black sky, a bright Earth and hard shadows. Close to home, but unforgiving: no air, no wind and a long cold night.", diffNote: "Close but airless" },
  mars: { name: "MARS", tag: "Long-duration deep space expedition", art: "radial-gradient(circle at 32% 30%, #f0a070 0, #c0602c 38%, #6a2412 75%, #1c0907)", glow: "rgba(235,120,60,.3)",
    rows: [["Distance", "About 55 to 400 million km", "real"], ["Mission duration", "About 6 to 9 months each way", "real"], ["Gravity", "About 3.7 m/s²", "real"], ["Comms delay", "About 3 to 22 minutes one way", "real"]] as [string, string, D.Kind][],
    difficulty: 5, science: 5, hazards: ["Dust storms", "Thin CO₂ air", "Radiation", "Deep cold"], blurb: "A thin pink sky, dust storms and a message that takes minutes to reach home. Every decision must stand on its own.", diffNote: "Far and isolated" },
} as const;
export function Destination() {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const hover = (k: D.Dest | null) => { clearTimeout(timer.current); timer.current = setTimeout(() => preview.set(k), 220); };
  useEffect(() => () => { clearTimeout(timer.current); preview.set(null); }, []);
  return (
    <Shell title="SELECT DESTINATION" sub="MISSION PLANNING · STEP 1" onBack={() => game.go("menu")} >
      <p className="mb-5 max-w-2xl text-[15px] text-white/70">Where are we going? The Moon is near and airless. Mars is far, with thin air and long silence. The background shows the world you are hovering over.</p>
      <div className="stagger grid gap-5 md:grid-cols-2">{(["moon", "mars"] as const).map(k => { const d = DEST[k]; return (
        <article key={k} onMouseEnter={() => hover(k)} onMouseLeave={() => hover(null)} onFocus={() => hover(k)} onBlur={() => hover(null)} className="gp group flex flex-col overflow-hidden transition-transform duration-500 hover:-translate-y-1">
          <div className="relative flex h-44 items-center justify-between overflow-hidden px-6" style={{ background: `linear-gradient(100deg, rgba(8,9,11,.9), transparent 70%)` }}>
            <div><Eyebrow>{d.tag.toUpperCase()}</Eyebrow><h2 className="mt-2 font-display text-2xl tracking-[0.22em]">{d.name}</h2><p className="mt-2 max-w-[18rem] text-[13px] leading-snug text-white/65">{d.blurb}</p></div>
            <div className="absolute -right-10 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full transition-transform duration-[1200ms] group-hover:scale-110 group-hover:-rotate-6" style={{ background: d.art, boxShadow: `0 0 60px ${d.glow}, inset -24px -12px 40px rgba(0,0,0,.7)` }} />
          </div>
          <dl className="space-y-[7px] border-t border-white/10 p-5 text-[13.5px]">
            {d.rows.map(([a, b, kind]) => <div key={a} className="flex items-baseline justify-between gap-4"><dt className="text-white/50">{a}</dt><dd className="flex items-center gap-2 text-right font-data text-[12px]">{b}<KindTag kind={kind} /></dd></div>)}
            <div className="flex items-center justify-between"><dt className="text-white/50">Difficulty</dt><dd className="flex items-center gap-2 font-data text-[12px]"><Pips n={d.difficulty} bad={d.difficulty > 4} />{d.diffNote}<KindTag kind="sim" /></dd></div>
            <div className="flex items-center justify-between"><dt className="text-white/50">Science potential</dt><dd className="flex items-center gap-2"><Pips n={d.science} /><KindTag kind="sim" /></dd></div>
            <div className="flex flex-wrap gap-1.5 pt-1">{d.hazards.map(h => <span key={h} className="border border-[#e5533a]/50 px-2 py-[1px] font-data text-[10.5px] tracking-widest text-[#e5533a]/90">{h.toUpperCase()}</span>)}</div>
          </dl>
          <div className="mt-auto p-5 pt-0"><Btn main className="w-full justify-between" onClick={() => game.setDestination(k)}>SELECT {d.name}<ChevronRight size={16} /></Btn></div>
        </article>); })}</div>
      <p className="mt-4 font-data text-[10.5px] tracking-widest text-white/40">REAL = NASA fact-sheet value · SIMULATED = ASTRAIA game rating, not a NASA measurement</p>
    </Shell>
  );
}

/* ---------- 02+ MISSION DESIGN: guided 8-step flow ---------- */
const INTRO = [
  "Start with the question you want answered. Your instruments should match it. Matching instruments give extra science.",
  "Confirm where you are going. This changes how much mass the rocket can lift, your budget and the dangers you will face.",
  "The spacecraft carries everything to the surface. Bigger means more fuel and power, but also more mass and cost. Propulsion decides your fuel margin.",
  "The rocket must lift your total mass. Too small and you cannot launch. Too big and you spend the budget on empty capacity.",
  "Instruments create science, but each adds mass, cost and power draw. The rover lets you explore in Rover mode.",
  "These systems keep everything alive and in contact. They rarely look exciting, and they are what decide whether the mission survives.",
  "People need air, water and food. More crew and longer stays mean more science, and more that can go wrong.",
  "Check everything. Fix anything marked red. When the numbers are safe, launch.",
];
function OptCard({ o, on, onPick, rec, multi }: { o: D.Opt; on: boolean; onPick: () => void; rec?: boolean; multi?: boolean }) {
  const [why, setWhy] = useState(false), [more, setMore] = useState(false), fx = D.effectLines(o);
  return (
    <div className={`gp group relative flex flex-col p-4 transition-all duration-300 ${on ? "!border-[#e8a45a] bg-[#e8a45a]/[0.06]" : "hover:-translate-y-0.5 hover:!border-white/30"}`}>
      {on && <span className="pop absolute right-3 top-3 grid h-5 w-5 place-items-center bg-[#e8a45a] text-black"><Check size={13} strokeWidth={3} /></span>}
      <div className="flex items-start gap-2 pr-7"><h4 className="font-ui text-[16.5px] font-semibold leading-tight tracking-wide">{o.name}</h4>{rec && <span className="tag tag-concept mt-[3px] shrink-0">MATCHES GOAL</span>}</div>
      <p className="mt-1 text-[13.5px] leading-snug text-white/60">{o.desc}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">{fx.length === 0 ? <li className="font-data text-[10.5px] tracking-widest text-white/40">BASELINE</li> : fx.map((f, i) => <li key={i} className={`border px-1.5 py-[1px] font-data text-[10.5px] tracking-wider ${f.good ? "border-[#8fbf8a]/45 text-[#8fbf8a]" : "border-[#e5533a]/45 text-[#e5533a]"}`}>{f.t}</li>)}</ul>
      {why && <p className="fade-in mt-3 border-l-2 border-[#e8a45a] pl-3 text-[13px] leading-snug text-white/80">{o.why}</p>}
      {more && <p className="fade-in mt-3 border-l-2 border-[#9bb8d4] pl-3 text-[13px] leading-snug text-white/70"><span className="mr-2"><KindTag kind={o.kind} /></span>{o.learn}</p>}
      <div className="mt-4 flex items-center gap-2">
        <button onClick={onPick} aria-pressed={on} className={`gbtn !px-4 !py-1.5 !text-[12px] ${on ? "gbtn-main" : ""}`}>{on ? (multi ? "REMOVE" : "SELECTED") : multi ? "ADD" : "SELECT"}</button>
        <button onClick={() => setWhy(!why)} aria-expanded={why} className={`font-data text-[10.5px] tracking-widest ${why ? "text-[#e8a45a]" : "text-white/50 hover:text-[#e8a45a]"}`}>WHY?</button>
        <button onClick={() => setMore(!more)} aria-expanded={more} className={`font-data text-[10.5px] tracking-widest ${more ? "text-[#9bb8d4]" : "text-white/50 hover:text-[#9bb8d4]"}`}>LEARN MORE</button>
      </div>
    </div>
  );
}
const num = (n: number, u: string, dec = 1, goodNeg = true) => (Math.abs(n) < 0.005 ? null : { t: `${n > 0 ? "+" : ""}${n.toFixed(dec)}${u}`, good: goodNeg ? n < 0 : n > 0 });
export function Design() {
  const d = useGame(s => s.design), dest = useGame(s => s.destination), [step, setStep] = useState(0), [max, setMax] = useState(0), [dl, setDl] = useState<Record<string, { t: string; good: boolean } | null>>({}), tm = useRef<ReturnType<typeof setTimeout>>();
  const e = D.evaluate(d, dest), S = D.STEPS[step], ob = D.OBJECTIVES.find(o => o.id === d.objective)!;
  const go = (i: number) => { setStep(i); setMax(m => Math.max(m, i)); };
  const change = (p: Partial<D.Design>) => {
    const a = D.evaluate(d, dest), b = D.evaluate({ ...d, ...p }, dest);
    setDl({ mass: num(b.mass - a.mass, " t"), cost: num(b.cost - a.cost, " M$", 0), power: num(b.powerMargin - a.powerMargin, " kW", 1, false), fuel: num(b.fuelMargin - a.fuelMargin, "%", 0, false), sci: num(b.science - a.science, "%", 0, false), comms: num(b.comms - a.comms, "%", 0, false), risk: num(b.risk - a.risk, "", 0) });
    clearTimeout(tm.current); tm.current = setTimeout(() => setDl({}), 3500); game.setDesign(p);
  };
  useEffect(() => () => clearTimeout(tm.current), []);
  const summary = (key: string) => { const g = D.GROUPS[key]; return g.multi ? d.payload.map(id => D.PAYLOADS.find(p => p.id === id)?.name).filter(Boolean).join(", ") || "None" : g.opts.find(o => o.id === d[g.key as keyof D.Design])?.name ?? ""; };
  return (
    <Shell title="MISSION DESIGN" sub={`${dest.toUpperCase()} EXPEDITION · STEP ${S.n} OF 08`} onBack={() => (step > 0 ? go(step - 1) : game.go("destination"))}>
      <nav aria-label="Design progress" className="relative mb-7 hidden sm:block">
        <div className="absolute left-0 right-0 top-[15px] h-px bg-white/15" /><div className="bar-fill absolute left-0 top-[15px] h-px bg-[#e8a45a]" style={{ width: `${(step / 7) * 100}%` }} />
        <ol className="relative grid grid-cols-8">{D.STEPS.map((s, i) => { const done = i < step, cur = i === step, reach = i <= max; return (
          <li key={s.id} className="flex flex-col items-center"><button disabled={!reach} onClick={() => go(i)} aria-current={cur ? "step" : undefined} className={`grid h-[31px] w-[31px] place-items-center border font-data text-[11px] transition-all duration-300 ${cur ? "scale-110 border-[#e8a45a] bg-[#e8a45a] text-black" : done ? "border-[#e8a45a] bg-[#08090b] text-[#e8a45a]" : "border-white/25 bg-[#08090b] text-white/40"} ${reach ? "cursor-pointer hover:border-[#e8a45a]" : "cursor-not-allowed"}`}>{done ? <Check size={14} strokeWidth={3} /> : s.n}</button>
            <span className={`mt-2 text-center font-data text-[9.5px] tracking-[0.14em] ${cur ? "text-white" : "text-white/40"}`}>{s.title}</span></li>); })}</ol>
      </nav>
      <p className="mb-4 font-data text-[11px] tracking-widest text-white/60 sm:hidden">STEP {S.n} / 08 · {S.title}</p>
      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        <section key={S.id} className="screen-in min-w-0">
          <Eyebrow>{S.n} · {S.title}</Eyebrow><p className="mb-5 mt-2 max-w-2xl text-[15px] leading-snug text-white/70">{INTRO[step]}</p>
          {S.id === "destination" && <div className="grid gap-4 sm:grid-cols-2">{(["moon", "mars"] as const).map(k => <button key={k} onClick={() => { game.setDest(k); }} aria-pressed={dest === k} className={`gp p-5 text-left transition-all ${dest === k ? "!border-[#e8a45a] bg-[#e8a45a]/[0.06]" : "hover:-translate-y-0.5"}`}>
            <div className="flex items-center gap-4"><span className="h-14 w-14 shrink-0 rounded-full" style={{ background: DEST[k].art, boxShadow: `0 0 28px ${DEST[k].glow}` }} /><div><h4 className="font-display text-sm tracking-[0.2em]">{DEST[k].name}</h4><p className="text-[13px] text-white/60">{DEST[k].rows[0][1]} · {DEST[k].rows[3][1]} delay</p></div></div>
            <p className="mt-3 text-[13.5px] text-white/70">{DEST[k].blurb}</p><p className="mt-2 font-data text-[10.5px] tracking-widest text-white/45">ROCKET CAPACITY WITH HEAVY LIFT: {D.LAUNCHERS[1].cap![k]} t · BUDGET {D.BUDGET[k]} M$</p></button>)}</div>}
          {S.id === "review" ? (
            <div className="space-y-2">
              {D.STEPS.slice(0, 7).map((s, i) => <div key={s.id} className="gp-flat flex items-start justify-between gap-4 px-4 py-3"><div><p className="font-data text-[10.5px] tracking-[0.2em] text-white/45">{s.n} {s.title}</p>
                <p className="mt-1 text-[14.5px]">{s.id === "destination" ? DEST[dest].name : s.groups.map(g => `${D.GROUPS[g].title}: ${summary(g)}`).join("  ·  ")}</p></div><button onClick={() => go(i)} className="shrink-0 font-data text-[10.5px] tracking-widest text-[#e8a45a] hover:underline">CHANGE</button></div>)}
              {e.warnings.map(w => <p key={w} className="border-l-2 border-[#e5533a] bg-[#e5533a]/10 px-3 py-2 text-[14px] text-[#ff9a86]">⚠ {w}</p>)}
              {e.warnings.length === 0 && <p className="border-l-2 border-[#8fbf8a] bg-[#8fbf8a]/10 px-3 py-2 text-[14px] text-[#b7dcb3]">All checks passed. Your design can launch.</p>}
            </div>
          ) : S.groups.map(gk => { const g = D.GROUPS[gk], cur = d[g.key as keyof D.Design]; return (
            <fieldset key={gk} className="mb-7"><legend className="mb-1 flex items-baseline gap-3"><span className="font-display text-[12px] tracking-[0.22em]">{g.title.toUpperCase()}</span><span className="text-[13px] text-white/45">{g.help}</span></legend>
              <div className="stagger mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{g.opts.map(o => { const on = g.multi ? d.payload.includes(o.id) : cur === o.id;
                return <OptCard key={o.id} o={o} on={on} multi={g.multi} rec={gk === "payload" && ob.wants!.includes(o.id)} onPick={() => change(g.multi ? { payload: on ? d.payload.filter(x => x !== o.id) : [...d.payload, o.id] } : ({ [g.key]: o.id } as unknown as Partial<D.Design>))} />; })}</div></fieldset>); })}
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <Btn icon={<ChevronLeft size={16} />} onClick={() => (step > 0 ? go(step - 1) : game.go("destination"))}>{step > 0 ? D.STEPS[step - 1].title : "DESTINATION"}</Btn>
            {step < 7 ? <Btn main onClick={() => go(step + 1)}>{D.STEPS[step + 1].title}<ChevronRight size={16} /></Btn> : <Btn main disabled={!e.valid} icon={<Rocket size={16} />} onClick={game.commit}>LAUNCH MISSION</Btn>}
          </div>
        </section>
        <aside className="gp h-fit space-y-3.5 p-4 lg:sticky lg:top-4" aria-label="Mission readout">
          <div className="flex items-center justify-between"><Eyebrow>MISSION READOUT</Eyebrow><span className="font-data text-[10px] tracking-widest text-white/40">LIVE</span></div>
          <Meter label="MASS" value={e.mass} max={e.cap} text={`${e.mass.toFixed(1)} / ${e.cap} t`} bad={e.mass > e.cap} delta={dl.mass?.t} good={dl.mass?.good} why="Every kilogram needs propellant to lift and land, and that propellant has mass too. A heavier ship needs a bigger rocket." />
          <Meter label="COST" value={e.cost} max={e.budget} text={`${e.cost.toFixed(0)} / ${e.budget} M$`} bad={e.cost > e.budget} delta={dl.cost?.t} good={dl.cost?.good} why="Rocket, spacecraft and instruments all cost money. Over budget means you cannot launch." />
          <Meter label="POWER MARGIN" value={e.powerMargin + 1} max={4} text={`${e.powerMargin.toFixed(1)} kW`} bad={e.powerMargin < 0.2} delta={dl.power?.t} good={dl.power?.good} why="Power generated minus power used. If it is too small the battery drains and the mission cannot run." />
          <Meter label="FUEL MARGIN" value={e.fuelMargin} max={125} text={`${e.fuelMargin.toFixed(0)}%`} bad={e.fuelMargin < 35} delta={dl.fuel?.t} good={dl.fuel?.good} why="Spare propellant for landing and manoeuvres. Heavy ships eat into this margin." />
          <Meter label="SCIENCE" value={e.science} max={110} text={`${e.science.toFixed(0)}%`} delta={dl.sci?.t} good={dl.sci?.good} why="More matching instruments, crew and time give more science, but add mass, power and cost." />
          <Meter label="COMMUNICATION" value={e.comms} max={100} text={`${e.comms}%`} bad={e.comms < 60} delta={dl.comms?.t} good={dl.comms?.good} why="Better antennas keep contact with Earth, but weigh more and use power." />
          <Meter label="RISK" value={e.risk} max={100} text={`${e.risk} / 100 ${e.risk < 35 ? "LOW" : e.risk < 60 ? "MEDIUM" : "HIGH"}`} bad={e.risk >= 60} delta={dl.risk?.t} good={dl.risk?.good} why="A combined score: thin margins, a tight rocket, weak comms or power, and long stays all raise it. It increases stress and trouble in the game." />
          {e.warnings.slice(0, step === 7 ? 0 : 2).map(w => <p key={w} className="text-[12.5px] text-[#ff9a86]">⚠ {w}</p>)}
          <p className="border-t border-white/10 pt-3 text-[11.5px] leading-snug text-white/45">These numbers set your starting power, battery, comms, fuel, science and supply use in every mode. SIMULATED values.</p>
        </aside>
      </div>
    </Shell>
  );
}

/* ---------- LAUNCH SEQUENCE ---------- */
const PHASES: [number, string][] = [[-5, "COUNTDOWN"], [0, "LIFTOFF"], [3, "MAX-Q"], [5, "STAGE SEPARATION"], [7, "ORBIT INSERTION"], [9, "TRANSIT"], [11, "ARRIVAL"]];
export function Launch() {
  const dest = useGame(s => s.destination), [t, setT] = useState(-5);
  useEffect(() => { const i = setInterval(() => setT(x => +(x + 0.1).toFixed(1)), 100), end = setTimeout(() => game.go("modes"), 14500); return () => { clearInterval(i); clearTimeout(end); }; }, []);
  const phase = [...PHASES].reverse().find(p => t >= p[0])![1], alt = t < 0 ? 0 : Math.min(400, t * t * 4.2), vel = t < 0 ? 0 : Math.min(7.8, t * 0.95) + (t > 9 ? (t - 9) * 1.6 : 0);
  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-black" style={{ animation: t > 0 && t < 5 ? "none" : undefined }}>
      <div className="stars" /><div className="stars2" />
      <div className="exhaust" style={{ opacity: t < 0 ? 0 : t < 7 ? 1 : 0, transition: "opacity 2s" }} />
      <div className="absolute inset-0 grid place-items-center text-center"><div key={phase} className="count-in">
        <p className="font-data text-[11px] tracking-[0.5em] text-white/50">{dest.toUpperCase()} EXPEDITION</p>
        <div className="mt-3 font-display text-4xl tracking-[0.3em] sm:text-6xl">{t < 0 ? `T-${Math.ceil(-t)}` : phase}</div></div></div>
      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/60 px-6 py-4">
        <ol className="mx-auto mb-3 flex max-w-4xl justify-between font-data text-[10px] tracking-[0.15em]">{PHASES.slice(1).map(([at, n]) => <li key={n} className={t >= at ? "text-[#e8a45a]" : "text-white/30"}>{t >= at ? "●" : "○"} {n}</li>)}</ol>
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 font-data text-[12px]"><span className="text-white/50">ALTITUDE <b className="ml-2 text-white">{alt.toFixed(0)} km</b></span><span className="text-white/50">VELOCITY <b className="ml-2 text-white">{vel.toFixed(1)} km/s</b></span><span className="text-right text-white/50">T{t < 0 ? "-" : "+"}{Math.abs(t).toFixed(1)} s <span className="tag tag-sim ml-2">SIMULATED</span></span></div>
        <div className="mx-auto mt-3 h-[2px] max-w-4xl bg-white/10"><div className="h-full bg-[#e8a45a]" style={{ width: `${((t + 5) / 16) * 100}%` }} /></div></div>
      <button onClick={() => game.go("modes")} className="absolute right-6 top-6 font-data text-[11px] tracking-widest text-white/50 hover:text-white">SKIP ▸</button>
    </div>
  );
}
