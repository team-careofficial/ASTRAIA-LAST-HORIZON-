import { useEffect, useState } from "react";
import { sfx } from "@/lib/utils/audio";
import { EMERGENCIES, EMG_STATIONS } from "@/data/knowledge/emergencies";
import { game, useGame } from "@/game/engine/store";
import { CREW3D, MISSIONS } from "@/data/world/missions";
import Avatar from "@/components/ui/Avatar";

const TAGS = { SUCCESS: ["✓", "text-[#8fbf8a]"], PARTIAL: ["◐", "text-[#9bb8d4]"], RISK: ["!", "text-[#e8a45a]"], FAILURE: ["✕", "text-[#e5533a]"] } as const;
const Chip = ({ l, v, unit = "%", low = 30 }: { l: string; v: number; unit?: string; low?: number }) => {
  const bad = v < low;
  return <div className="w-[60px]"><div className="flex justify-between font-data text-[10px] tracking-wider text-white/55"><span>{l}</span><span className={bad ? "pulse-warn text-[#e5533a]" : "text-white"}>{bad ? "⚠" : ""}{Math.round(v)}{unit}</span></div>
    <div className="h-[2px] bg-white/12"><div className={`bar-fill h-full ${bad ? "bg-[#e5533a]" : "bg-[#9bb8d4]"}`} style={{ width: `${Math.min(100, v)}%` }} /></div></div>;
};
const Mini = ({ l, v, bad }: { l: string; v: number; bad?: boolean }) => <div className="flex items-center gap-1 font-data text-[10px] text-white/55"><span className="w-12">{l}</span><div className="h-[2px] flex-1 bg-white/12"><div className={`bar-fill h-full ${bad ? (v > 60 ? "bg-[#e5533a]" : "bg-[#e8a45a]") : v < 40 ? "bg-[#e5533a]" : "bg-[#9bb8d4]"}`} style={{ width: `${v}%` }} /></div></div>;
export function Fps() {
  const [f, setF] = useState(0);
  useEffect(() => { let n = 0, t = performance.now(), id = 0; const loop = (now: number) => { n++; if (now - t >= 1000) { setF(n); n = 0; t = now; } id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); return () => cancelAnimationFrame(id); }, []);
  return <div className="gp absolute bottom-2 right-2 px-2 py-1 font-data text-[11px]">{f} FPS</div>;
}
export default function Hud() {
  const s = useGame(x => x), [more, setMore] = useState(false), m = MISSIONS[s.mission], st = m.steps[Math.min(s.step, m.steps.length - 1)], crew = CREW3D[s.active], c = s.crew[s.active], r = s.r;
  const need = CREW3D.find(x => x.id === st.role)!, d = s.dialog, node = d ? (game.nodes() ?? {})[d.nodeId] : null, emergency = r.oxygen < 25 || r.power < 15, glitch = r.comms < 30, er = s.emgRun, ES = er ? EMG_STATIONS[er.id] : null, stn = ES && er ? ES[er.idx] : null;
  useEffect(() => { if (!er) return; const i = setInterval(() => sfx("warn"), 3000); return () => clearInterval(i); }, [er]);
  const prompt = s.dialog || s.paused ? null : er && stn ? (s.nearby ? `${stn.verb}` : `Go to the ${stn.name}`) : s.nearby ? (crew.id === st.role ? st.name : `Switch to ${need.name} (key ${CREW3D.indexOf(need) + 1})`) : null;
  const canAct = s.nearby && (er || crew.id === st.role);
  return (
    <div className={`pointer-events-none fixed inset-0 z-30 select-none ${glitch ? "glitch" : ""}`}>
      {(emergency || er) && <div className="emergency absolute inset-0" />}
      <div className={`gp hud-in absolute left-4 top-4 w-80 p-3 ${er ? "!border-[#e5533a]" : ""}`}>
        {er && ES ? <>
          <div className="pulse-warn font-data text-[11px] tracking-[0.25em] text-[#e5533a]">⚠ ALARM · {EMERGENCIES[er.id].title}</div>
          <ol className="mt-2 space-y-1 text-[13.5px]">{ES.map((x, i) => <li key={x.verb} className={i < er.idx ? "text-white/40" : i === er.idx ? "text-white" : "text-white/35"}><span className="inline-block w-4 text-[#e5533a]">{i < er.idx ? "✓" : i === er.idx ? "▸" : "○"}</span>{x.verb} <span className="text-white/45">· {x.name}</span></li>)}</ol>
          <p className="mt-2 font-data text-[10.5px] tracking-widest text-[#e8a45a]">▸ {s.dist} m · {stn?.name}</p><p className="mt-1 text-[11.5px] text-white/45">Power, air or link keeps dropping until you finish.</p></> : <>
          <div className="font-data text-[10.5px] tracking-[0.25em] text-[#e8a45a]">MISSION {String(m.id).padStart(2, "0")} · {m.title}</div>
          <ul className="mt-2 space-y-1 text-[13.5px]">{m.steps.map((x, i) => <li key={x.id} className={i < s.step ? "text-white/40" : i === s.step ? "text-white" : "text-white/30"}><span key={i < s.step ? "d" : "t"} className={`inline-block w-4 ${i < s.step ? "pop text-[#8fbf8a]" : "text-[#e8a45a]"}`}>{i < s.step ? "✓" : i === s.step ? "▸" : "○"}</span>{x.objective}</li>)}</ul>
          {!d && <p className="mt-2 font-data text-[10.5px] tracking-widest text-[#e8a45a]">▸ {s.dist} m · {need.name}</p>}</>}
      </div>
      <div className="hud-in absolute right-4 top-14 flex flex-col items-end gap-1">
        <div className="gp flex flex-wrap justify-end gap-x-3 gap-y-2 p-3" style={{ maxWidth: more ? 400 : 290 }}>
          <Chip l="O2" v={r.oxygen} low={25} /><Chip l="PWR" v={r.power} low={20} /><Chip l="BAT" v={r.battery} /><Chip l="COMMS" v={r.comms} />
          {more && <><Chip l="H2O" v={r.water} /><Chip l="FOOD" v={r.food} /><Chip l="FUEL" v={r.fuel} /><Chip l="HAB" v={r.habitat} /><Chip l="TEMP" v={r.temp} unit="°" low={10} /></>}
          <div className="w-full text-right font-data text-[10px] tracking-widest text-white/50">T+{String(Math.floor(r.minutes / 60)).padStart(2, "0")}:{String(r.minutes % 60).padStart(2, "0")} · SCI {Math.round(r.science)}%{glitch ? " · ⚠ COMMS" : ""}{s.storm > 0.2 ? " · ⚠ STORM" : ""}</div></div>
        <button onClick={() => setMore(!more)} className="pointer-events-auto font-data text-[10px] tracking-[0.2em] text-white/45 hover:text-[#e8a45a]">{more ? "LESS ▴" : "ALL SYSTEMS ▾"}</button>
      </div>
      {prompt && <div key={prompt} className="gp fade-in absolute bottom-40 left-1/2 flex -translate-x-1/2 items-center gap-3 px-5 py-2 text-[15px]">{canAct && <kbd className="keycap">E</kbd>}<span className={`font-ui font-semibold tracking-[0.12em] ${er ? "text-[#e5533a]" : "text-[#e8a45a]"}`}>{prompt.toUpperCase()}</span></div>}
      {s.toast && <div key={s.toast} className="gp toast-in absolute bottom-52 left-1/2 -translate-x-1/2 w-max max-w-md px-5 py-2 text-center text-[14px]">{s.toast}</div>}
      <div className="hud-in absolute bottom-4 left-1/2 flex -translate-x-1/2 items-end gap-2">
        {CREW3D.map((x, i) => <button key={x.id} onClick={() => game.setActive(i)} aria-pressed={i === s.active} aria-label={`${x.name}, ${x.role}, key ${i + 1}`} className={`gp pointer-events-auto flex w-36 flex-col gap-1 px-2 py-2 text-left transition-all duration-300 ${i === s.active ? "!border-[#e8a45a] -translate-y-1.5" : "opacity-65 hover:opacity-100"}`}>
          <span className="flex items-center gap-2"><Avatar id={x.id} size={30} /><span><span className="block font-data text-[10.5px] tracking-widest">{i + 1} · {x.name}{s.crew[i].stress > 60 || s.crew[i].health < 40 ? " ⚠" : ""}</span><span className="block text-[11px] text-white/50">{x.role}</span></span></span>
          {i === s.active && <div className="fade-in space-y-[2px]"><Mini l="HEALTH" v={c.health} /><Mini l="FATIGUE" v={c.fatigue} bad /><Mini l="STRESS" v={c.stress} bad /><Mini l="MORALE" v={c.morale} /></div>}</button>)}
      </div>
      <p className="absolute bottom-4 left-4 hidden font-data text-[10px] leading-5 tracking-widest text-white/40 xl:block">WASD MOVE · SHIFT RUN · E INTERACT<br />DRAG/←→ CAMERA · 1-4/TAB CREW · ESC PAUSE</p>
      {s.settings.dev && <Fps />}
      {d && node && <div className="pointer-events-auto absolute inset-0 grid place-items-center bg-black/55 p-4 backdrop-blur-[2px]">
        <div className={`gp screen-in w-full max-w-xl p-6 ${d.emg ? "!border-[#e5533a]" : ""}`} role="dialog" aria-modal="true" aria-label={node.title}>
          <h2 className={`font-data text-[11px] tracking-[0.28em] ${d.emg ? "text-[#e5533a]" : "text-[#e8a45a]"}`}>{node.title}</h2><p className="my-4 text-[16.5px] leading-snug">{node.body}</p>
          {d.result && d.tag ? <><p className={`font-data text-[11px] tracking-[0.2em] ${TAGS[d.tag][1]}`}>{TAGS[d.tag][0]} {d.tag.replace("PARTIAL", "PARTIAL SUCCESS")}</p>
            <p className="fade-in mt-2 border-l-2 border-[#e8a45a] bg-white/[0.04] p-3 text-[14.5px]">{d.result}</p><button autoFocus className="gbtn gbtn-main mt-5" onClick={game.next}>CONTINUE</button></> :
            <div className="space-y-2">{node.choices.map((ch, i) => <button key={ch.id} disabled={d.disabled.includes(ch.id)} onClick={() => game.choose(ch.id)} className="gbtn flex w-full items-start gap-3 !normal-case !tracking-wide text-left disabled:opacity-35"><b className="font-data text-[#e8a45a]">{"ABCD"[i]}</b><span className="text-[15px] font-medium">{ch.label}{ch.hint && <span className="ml-2 text-xs text-white/50">{ch.hint}</span>}</span></button>)}</div>}
        </div></div>}
    </div>
  );
}
