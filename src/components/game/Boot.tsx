import { useEffect, useState } from "react";
import { game, useGame } from "@/game/engine/store";
import { initAudio, sfx } from "@/lib/utils/audio";
import { getMarsDataProvider } from "@/lib/nasa/provider";

const LINES = ["FLIGHT SYSTEMS", "NAVIGATION / GUIDANCE", "LIFE SUPPORT", "COMMS RELAY", "TERRAIN & MODELS"];
const TASKS: [string, string][] = [["terrain", "Terrain"], ["crew", "Models"], ["telemetry", "Telemetry"], ["missions", "Mission data"]];
export default function Boot() {
  const [run, setRun] = useState(false), [n, setN] = useState(0), [logo, setLogo] = useState(false), [timeUp, setTimeUp] = useState(false), [leaving, setLeaving] = useState(false);
  const leave = () => { if (leaving) return; setLeaving(true); setTimeout(() => game.go("menu"), 1300); };
  const ready = useGame(s => s.ready), done = TASKS.filter(([k]) => ready[k]).length, pct = Math.round((done / TASKS.length) * 100);
  useEffect(() => {
    if (!run) return;
    game.markReady("missions"); getMarsDataProvider().getSnapshot().catch(() => null).finally(() => game.markReady("telemetry"));
    sfx("static");
    const t = LINES.map((_, i) => setTimeout(() => { setN(i + 1); sfx("notify"); }, 600 * (i + 1)));
    t.push(setTimeout(() => setLogo(true), 3800), setTimeout(() => setTimeUp(true), 7600));
    return () => t.forEach(clearTimeout);
  }, [run]);
  useEffect(() => { if (timeUp && pct === 100) leave(); }); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={`fixed inset-0 z-50 grid place-items-center overflow-hidden bg-black text-center transition-opacity duration-[1300ms] ${leaving ? "pointer-events-none opacity-0" : ""}`}>
      <div className="stars" /><div className="stars2" /><div className="vignette" />
      <div className="planet transition-opacity duration-[3000ms]" style={{ top: "auto", bottom: "-52vmin", right: "-12%", opacity: logo ? 0.85 : 0 }} />
      {!run ? <div className="fade-in"><h1 className="mb-8 font-display text-3xl tracking-[0.3em] sm:text-5xl">ASTRAIA</h1><button onClick={() => { initAudio(); game.audioReady(); setRun(true); }} className="gbtn gbtn-main" autoFocus>INITIALIZE SYSTEMS</button><p className="mt-5 font-data text-[10.5px] tracking-[0.3em] text-white/35">SOUND ON RECOMMENDED</p></div> : <>
        <div className={`w-72 text-left font-data text-[11.5px] leading-7 tracking-[0.2em] text-white/70 transition-opacity duration-1000 ${logo ? "opacity-0" : ""}`}>{LINES.slice(0, n).map(l => <div key={l} className="fade-line flex justify-between"><span>{l}</span><span className="text-[#8fbf8a]">ONLINE</span></div>)}</div>
        {logo && <h1 className="logo-form absolute font-display text-5xl sm:text-7xl">ASTRAIA<span className="mt-4 block font-ui text-sm font-semibold tracking-[0.9em] text-white/75 sm:text-lg">LAST HORIZON</span></h1>}
        <div className="absolute bottom-8 left-1/2 w-72 -translate-x-1/2 text-left font-data text-[10.5px] tracking-widest text-white/55">
          <div className="mb-1 flex justify-between"><span>LOADING MISSION SYSTEMS</span><span>{pct}%</span></div>
          <div className="h-[2px] bg-white/15"><div className="h-full bg-[#e8a45a] transition-all duration-500" style={{ width: `${pct}%` }} /></div>
          <div className="mt-2 grid grid-cols-2 gap-x-4">{TASKS.map(([k, l]) => <span key={k} className={ready[k] ? "text-white" : ""}>{ready[k] ? "✓" : "○"} {l}</span>)}</div></div>
        <button onClick={leave} className="absolute right-6 top-6 font-data text-[11px] tracking-widest text-white/40 hover:text-white">SKIP ▸</button></>}
    </div>
  );
}
