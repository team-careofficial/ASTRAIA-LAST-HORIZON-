import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Lock, Check, Target, Truck, Rocket } from "lucide-react";
import { ex } from "@/game/explore/store";
import { game, useGame, recommendQuality } from "@/game/engine/store";
import { MISSIONS, WIP } from "@/data/world/missions";
import { SCIENCE } from "@/data/world/science";
import { getMarsDataProvider, type MarsSnapshot } from "@/lib/nasa/provider";
import Btn from "@/components/ui/Btn";
import { Eyebrow } from "@/components/ui/kit";
import type { Settings } from "@/types/world";
import * as D from "@/data/design/options";

export const Shell = ({ title, sub, onBack, children, flat }: { title: string; sub?: string; onBack: () => void; children: ReactNode; flat?: boolean }) => (
  <div className="screen-in fixed inset-0 z-40 overflow-auto">
    <div className={`pointer-events-none fixed inset-0 ${flat ? "bg-black/70" : "bg-gradient-to-r from-[#08090b]/95 via-[#08090b]/70 to-[#08090b]/25"}`} /><div className="vignette fixed" />
    <div className="relative mx-auto max-w-6xl px-5 pb-28 pt-6 sm:px-10">
      <header className="mb-7 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div><Eyebrow>{sub ?? "ASTRAIA · LAST HORIZON"}</Eyebrow><h1 className="mt-1 font-display text-lg tracking-[0.3em] sm:text-xl">{title}</h1></div>
        <Btn icon={<ArrowLeft size={15} />} onClick={onBack}>BACK</Btn>
      </header>{children}</div></div>
);
export function Archive() {
  const sel = useGame(s => s.selected), done = useGame(s => s.completed), lvl = useGame(s => s.level), xp = useGame(s => s.xp), m = MISSIONS[Math.min(sel, 4)], c = done[m.id], open = game.unlocked(sel);
  return (
    <Shell title="MISSION ARCHIVE" sub="CAMPAIGN · MARS" onBack={() => game.go(game.get().committed ? "modes" : "menu")}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="gp p-4"><div className="mb-1 h-[2px] bg-white/10"><div className="bar-fill h-full bg-[#e8a45a]" style={{ width: `${(Object.keys(done).length / MISSIONS.length) * 100}%` }} /></div><div className="mb-3 mt-3 flex items-center justify-between"><p className="font-data text-xs tracking-widest text-[#e8a45a]">LEVEL {lvl} · {xp} XP · {Object.keys(done).length}/{MISSIONS.length} COMPLETE</p><Btn onClick={() => game.go("report")} className="!px-3 !py-1 !text-xs">MISSION REPORT</Btn></div><ul className="space-y-1">
          {MISSIONS.map((x, i) => { const un = game.unlocked(i); return <li key={x.id}><button onClick={() => game.select(i)} className={`flex w-full items-center justify-between border px-4 py-3 text-left text-[15px] transition-all hover:border-[#e8a45a] ${sel === i ? "border-[#e8a45a] bg-[#e8a45a]/10" : "border-white/10"}`}>
            <span>{String(x.id).padStart(2, "0")} {x.title}</span><span className="flex items-center gap-1 font-data text-[11px] text-white/60">{done[x.id] ? <><Check size={13} /> COMPLETED</> : un ? "AVAILABLE" : <><Lock size={13} /> LOCKED</>}</span></button></li>; })}
          {WIP.map(([n, t]) => <li key={n} className="flex items-center justify-between border border-white/5 px-3 py-2 text-sm opacity-45"><span>{n} {t}</span><span className="flex items-center gap-1 font-data text-[11px]"><Lock size={13} /> WORK IN PROGRESS</span></li>)}</ul></div>
        <div className="gp p-4"><h2 className="font-display text-lg tracking-widest">MISSION {String(m.id).padStart(2, "0")} · {m.title}</h2><p className="my-3 text-sm text-white/80">{m.brief}</p>
          {c ? <div className="mb-3 text-sm"><p className="font-data text-xs tracking-widest text-[#e8a45a]">BEST: {c.rating} · +{c.xp} XP · SCIENCE {c.science}% · CREW STRESS {c.stress}%</p>
            <ul className="mt-2 space-y-1 text-xs text-white/70">{c.picks.map((p, i) => <li key={i}>[{p.tag}] {p.choice}</li>)}</ul></div> : null}
          <Btn main disabled={!open} onClick={() => game.brief(sel)}>{c ? "REPLAY MISSION" : open ? "PLAY MISSION" : "LOCKED: FINISH THE PREVIOUS MISSION"}</Btn></div>
      </div>
    </Shell>
  );
}
export function Science() {
  const [d, setD] = useState<MarsSnapshot | null>(null);
  useEffect(() => { getMarsDataProvider().getSnapshot().then(setD).catch(() => null); }, []);
  return (
    <Shell title="SCIENCE" sub="WHAT IS REAL · WHAT IS SIMULATED" onBack={() => game.go("menu")}>
      <div className="stagger grid gap-4 sm:grid-cols-2">{SCIENCE.map(s => <div key={s.title} className="gp p-4"><h2 className="font-display text-[13px] tracking-[0.18em] text-[#e8a45a]">{s.title}</h2>
        <p className="mt-2 text-sm"><span className="tag tag-sim mr-2">GAME EFFECT</span>{s.effect}</p><p className="mt-2 text-sm text-white/80"><span className="tag tag-concept mr-2">REAL SCIENCE</span>{s.science}</p></div>)}</div>
      {d && <p className="mt-4 font-data text-xs tracking-widest text-white/50">DATA SOURCE: {d.source === "mock" ? "SIMULATED REFERENCE VALUES, NOT LIVE NASA DATA" : "NASA"} · AVG {d.avgSurfaceTempC} °C · {d.surfacePressurePa} Pa · {d.gravityMs2} m/s²</p>}
    </Shell>
  );
}
const Slider = ({ label, k, min = 0, max = 1, step = 0.05 }: { label: string; k: keyof Settings; min?: number; max?: number; step?: number }) => {
  const v = useGame(s => s.settings[k]) as number;
  return <label className="flex items-center justify-between gap-4 py-2 text-sm"><span>{label}</span><input type="range" min={min} max={max} step={step} value={v} onChange={e => game.setSetting({ [k]: Number(e.target.value) })} className="w-44 accent-[#e8a45a]" /></label>;
};
const Toggle = ({ label, k }: { label: string; k: keyof Settings }) => {
  const v = useGame(s => s.settings[k]) as boolean;
  return <label className="flex items-center justify-between py-2 text-sm"><span>{label}</span><input type="checkbox" checked={v} onChange={e => game.setSetting({ [k]: e.target.checked })} className="h-4 w-4 accent-[#e8a45a]" /></label>;
};
export function SettingsPanel() {
  const [tab, setTab] = useState("Graphics"), q = useGame(s => s.settings.quality), [confirm, setConfirm] = useState(false);
  return (
    <div className="gp p-4"><div className="mb-3 flex flex-wrap gap-1">{["Graphics", "Audio", "Gameplay", "Accessibility", "Controls", "Save"].map(t => <button key={t} onClick={() => setTab(t)} className={`border px-3 py-1 font-data text-xs tracking-widest ${tab === t ? "border-[#e8a45a] text-[#e8a45a]" : "border-white/15"}`}>{t.toUpperCase()}</button>)}</div>
      {tab === "Graphics" && <div><div className="flex flex-wrap gap-2 py-2">{(["ultra", "high", "medium", "low"] as const).map(x => <Btn key={x} main={q === x} onClick={() => game.setSetting({ quality: x })}>{x.toUpperCase()}</Btn>)}<Btn onClick={() => game.setSetting({ quality: recommendQuality() })}>AUTO-DETECT</Btn></div><p className="text-xs text-white/50">Low removes shadows and cuts particles for more FPS.</p><Toggle label="Show FPS (developer)" k="dev" /></div>}
      {tab === "Audio" && <div><Slider label="Master volume" k="master" /><Slider label="Music" k="music" /><Slider label="Effects" k="sfx" /><Toggle label="Mute all" k="muted" /></div>}
      {tab === "Gameplay" && <div><Slider label="Camera sensitivity" k="sens" min={0.3} max={2} /><Toggle label="Invert camera Y" k="invert" /></div>}
      {tab === "Accessibility" && <div><Toggle label="Reduced motion" k="reducedMotion" /><Toggle label="Color-independent warnings (adds symbols)" k="colorSafe" /><Slider label="UI scale" k="uiScale" min={0.8} max={1.3} step={0.05} /></div>}
      {tab === "Controls" && <ul className="space-y-1 text-sm text-white/80"><li>WASD / Arrow keys: move (Left/Right arrows also turn the camera)</li><li>Shift: run · E: interact · Esc: pause</li><li>1 Eva · 2 Sarah · 3 Ben · 4 Liam · Tab: next crew</li><li>Mouse drag: rotate camera · Wheel: zoom</li><li>Rover: WASD drive · Shift boost · Space brake · F solar wings · E hold to scan · T transmit · L lights · V cockpit view · C brush panels</li><li>Flight: W/S thrust · A/D yaw · R/F pitch · Q/E roll · Shift boost · Space brake · X assist · V cockpit view</li></ul>}
      {tab === "Save" && <div className="py-2">{confirm ? <div className="flex gap-2"><Btn onClick={() => { game.resetSave(); setConfirm(false); }} main>CONFIRM RESET</Btn><Btn onClick={() => setConfirm(false)}>CANCEL</Btn></div> : <Btn onClick={() => setConfirm(true)}>RESET SAVE</Btn>}</div>}
    </div>
  );
}
export const SettingsPage = () => <Shell title="SETTINGS" onBack={() => game.go("menu")}><SettingsPanel /></Shell>;
export function Briefing() {
  const mi = useGame(s => s.mission), notes = useGame(s => s.notes), m = MISSIONS[mi];
  return (
    <Shell title={`MISSION ${String(m.id).padStart(2, "0")} · ${m.title}`} onBack={() => game.go("archive")}>
      <div className="gp max-w-2xl p-5"><h2 className="font-display text-sm tracking-widest text-[#e8a45a]">BRIEFING</h2><p className="my-3">{m.brief}</p>
        <h3 className="font-data text-xs tracking-widest text-white/50">OBJECTIVES</h3><ol className="my-2 space-y-1 text-sm">{m.steps.map((s, i) => <li key={s.id}>○ {s.objective}</li>)}</ol>
        {notes.length > 0 && <><h3 className="mt-3 font-data text-xs tracking-widest text-white/50">CARRYOVER FROM YOUR DECISIONS</h3><ul className="my-2 list-disc pl-5 text-sm text-[#e8a45a]">{notes.map(n => <li key={n}>{n}</li>)}</ul></>}
        <Btn main onClick={game.start}>START MISSION</Btn></div>
    </Shell>
  );
}
export function Modes() {
  const dest = useGame(s => s.destination), moon = dest === "moon", e = D.evaluate(useGame(s => s.design), dest);
  const sky = moon ? "linear-gradient(180deg,#020203 0%,#0b0b0e 55%,#3a3a40 56%,#6a6a70 100%)" : "linear-gradient(180deg,#5a3a38 0%,#c98a62 52%,#7a3a22 53%,#3a1810 100%)";
  const cards = [
    { n: "01", title: "MISSIONS", Icon: Target, desc: moon ? "Moon campaign missions are in the next update. Mars missions play on Mars." : "Walk the crew around the base. Diagnose problems, decide, and live with the consequences.", tags: ["ON FOOT", "DECISIONS", "EMERGENCIES"], go: () => game.go("archive"), off: moon },
    { n: "02", title: "ROVER EXPEDITION", Icon: Truck, desc: `Deploy the rover and drive it on the ${moon ? "Moon" : "Mars"}. Monitor the environment, scan science targets, and report to Earth.`, tags: ["DRIVING", "SCIENCE", "POWER"], go: () => { ex.reset(); game.go("rover"); }, off: false },
    { n: "03", title: "SPACECRAFT FLIGHT", Icon: Rocket, desc: `Fly a spacecraft around the ${moon ? "Moon" : "Mars"}, pass through the orbit gates, and manage fuel.`, tags: ["FLIGHT", "FUEL", "ORBIT"], go: () => { ex.resetFlight(); game.go("flight"); }, off: false },
  ];
  return (
    <Shell title={`${dest.toUpperCase()} · CHOOSE YOUR MODE`} sub="FREE PLAY · ANY MODE, ANY TIME" onBack={() => game.go("menu")}>
      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14.5px] text-white/65"><span>Your mission design sets power, comms, fuel and science in every mode.</span><span className="font-data text-[11px] tracking-widest text-white/45">RISK {e.risk}/100 · SCIENCE {e.science.toFixed(0)}% · COMMS {e.comms}%</span><Btn onClick={game.redesign} className="!px-3 !py-1 !text-[11px]">REDESIGN</Btn><Btn onClick={() => game.go("report")} className="!px-3 !py-1 !text-[11px]">MISSION REPORT</Btn></div>
      <div className="stagger grid gap-5 md:grid-cols-3">{cards.map(({ n, title, Icon, desc, tags, go, off }) => (
        <button key={title} disabled={off} onClick={go} className="gp group relative flex flex-col overflow-hidden p-0 text-left transition-all duration-500 hover:-translate-y-1.5 disabled:opacity-45 disabled:hover:translate-y-0">
          <div className="relative flex h-44 items-end p-4" style={{ background: sky }}><div className="absolute inset-0 bg-gradient-to-t from-[#101114] via-transparent to-transparent" /><span className="absolute left-4 top-3 font-data text-[10.5px] tracking-[0.3em] text-white/60">MODE {n}</span>
            <Icon size={46} strokeWidth={1.2} className="relative text-white/90 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1" /></div>
          <div className="flex flex-1 flex-col p-5"><h2 className="font-display text-[13px] tracking-[0.2em]">{title}</h2><p className="mt-2 min-h-[4.5rem] text-[14px] leading-snug text-white/65">{desc}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{tags.map(t => <span key={t} className="border border-white/15 px-1.5 py-[1px] font-data text-[10px] tracking-widest text-white/55">{t}</span>)}</div>
            <span className="mt-4 font-data text-[11px] tracking-[0.25em] text-[#e8a45a] transition-transform group-hover:translate-x-1">{off ? "NEXT UPDATE" : "PLAY ▸"}</span></div></button>))}</div>
    </Shell>
  );
}
