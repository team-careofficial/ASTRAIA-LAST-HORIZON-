import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Sun, Radio, Gauge, Navigation } from "lucide-react";
import { useEx, ex, POIS, POI_INFO, BASE, LANDER } from "@/game/explore/store";
import { Hint } from "@/components/ui/KeyCap";
import { Fps } from "./Hud";
import { useGame } from "@/game/engine/store";

const fmt = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")}`;
const Row = ({ l, v, warn }: { l: string; v: string; warn?: boolean }) => <div className="flex justify-between gap-6 text-[12px]"><span className="text-white/50">{l}</span><span className={`font-data ${warn ? "text-[#e8a45a]" : ""}`}>{v}</span></div>;
const Bar = ({ v, c = "#9bb8d4" }: { v: number; c?: string }) => <div className="h-[3px] bg-white/12"><div className="bar-fill h-full" style={{ width: `${Math.max(0, Math.min(100, v))}%`, background: c }} /></div>;
const Lbl = ({ children }: { children: React.ReactNode }) => <span className="font-data text-[9.5px] tracking-[0.2em] text-white/45">{children}</span>;
function Minimap() {
  const e = useEx(s => s), s = Math.sin(e.heading), c = Math.cos(e.heading), pt = (x: number, z: number) => { const dx = x - e.x, dz = z - e.z; return [(dx * c - dz * s) * 0.5, -(dx * s + dz * c) * 0.5] as const; };
  return <svg width="116" height="116" viewBox="-58 -58 116 116" className="rounded-full bg-black/45 ring-1 ring-white/15 backdrop-blur"><clipPath id="mm"><circle r="56" /></clipPath><g clipPath="url(#mm)">
    <circle r="38" fill="none" stroke="rgba(255,255,255,.1)" /><circle r="19" fill="none" stroke="rgba(255,255,255,.07)" /><path d="M-56 0H56M0 -56V56" stroke="rgba(255,255,255,.06)" />
    {POIS.map(p => { const [x, y] = pt(p.x, p.z), d = e.found.includes(p.id); return <rect key={p.id} x={x - 2.8} y={y - 2.8} width="5.6" height="5.6" transform={`rotate(45 ${x} ${y})`} fill={d ? "none" : "#e8a45a"} stroke={d ? POI_INFO[p.kind].color : "none"} />; })}
    {[BASE, LANDER].map((b, i) => { const [x, y] = pt(b[0], b[1]); return <rect key={i} x={x - 2.5} y={y - 2.5} width="5" height="5" fill={i ? "#aaa" : "#9bb8d4"} />; })}</g>
    <path d="M0 -6 L4.5 5 L0 2.5 L-4.5 5Z" fill="#ece8df" /><text x="0" y="-46" textAnchor="middle" fill="#8f8c85" fontSize="7" fontFamily="var(--font-mono)">N</text></svg>;
}
function Cockpit() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-[11vh] bg-gradient-to-b from-[#050506] via-[#0b0b0d]/95 to-transparent" style={{ clipPath: "polygon(0 0,100% 0,100% 55%,78% 100%,22% 100%,0 55%)" }} />
      <div className="absolute inset-y-0 left-0 w-[13vw] bg-gradient-to-r from-[#050506] to-transparent" style={{ clipPath: "polygon(0 0,70% 0,100% 100%,0 100%)" }} /><div className="absolute inset-y-0 right-0 w-[13vw] bg-gradient-to-l from-[#050506] to-transparent" style={{ clipPath: "polygon(30% 0,100% 0,100% 100%,0 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[24vh] bg-gradient-to-t from-[#050506] via-[#101114]/95 to-transparent" style={{ clipPath: "polygon(0 100%,0 40%,20% 18%,80% 18%,100% 40%,100% 100%)" }} />
      <div className="absolute left-[11vw] top-[8vh] h-[70vh] w-[2px] origin-top rotate-[8deg] bg-gradient-to-b from-[#0b0b0d] to-transparent" /><div className="absolute right-[11vw] top-[8vh] h-[70vh] w-[2px] origin-top -rotate-[8deg] bg-gradient-to-b from-[#0b0b0d] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,.05),transparent_45%)]" />
    </div>
  );
}
export function RoverHud() {
  const e = useEx(s => s), dev = useGame(s => s.settings.dev), moon = useGame(s => s.destination === "moon"), bars = [20, 45, 70, 90].filter(t => e.link >= t).length, near = e.near !== null && e.nearDist < 7;
  const nx = e.near !== null ? POIS[e.near] : null, brg = nx ? Math.atan2(nx.x - e.x, nx.z - e.z) - e.heading : 0, all = e.found.length === POIS.length;
  const objective = e.phase === "deploy" ? "Rover deploying from the lander" : e.queue > 0 && (all || e.link >= 25) ? `Send ${e.queue} finding${e.queue > 1 ? "s" : ""} to Earth` : nx ? (near ? "Stop and hold E to scan the target" : "Drive to the nearest science target") : "All targets scanned. Send your data home";
  const bat = e.battery, lowB = bat < 15;
  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      {e.cockpit && <Cockpit />}
      {/* TOP: objective + distance */}
      <div className="hud-in absolute left-1/2 top-4 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="gp flex items-center gap-4 py-2 pl-4 pr-5">
          {nx && e.phase === "drive" ? <Navigation size={20} className="text-[#e8a45a] transition-transform duration-300" style={{ transform: `rotate(${(brg * 180) / Math.PI}deg)` }} /> : <Gauge size={20} className="text-[#e8a45a]" />}
          <div><p className="font-data text-[9.5px] tracking-[0.28em] text-[#e8a45a]">OBJECTIVE · {e.found.length}/{POIS.length} TARGETS · ★ {e.shards}</p><p className="text-[15px] leading-tight">{objective}</p></div>
          {nx && e.phase === "drive" && <div className="border-l border-white/15 pl-4 text-right"><Lbl>DISTANCE</Lbl><p className="font-data text-lg leading-none">{e.nearDist < 1000 ? e.nearDist.toFixed(0) : (e.nearDist / 1000).toFixed(1)}<span className="ml-1 text-[10px] text-white/50">{e.nearDist < 1000 ? "m" : "km"}</span></p></div>}
        </div>
        {e.hazard && <div className="fade-in gp !border-[#e8a45a] px-4 py-1 font-data text-[11px] tracking-[0.2em] text-[#e8a45a]">⚠ {e.hazard}</div>}
      </div>
      <div className="hud-in absolute left-4 top-4 font-data text-[10.5px] tracking-[0.2em] text-white/55"><p className="text-white/80">ROVER EXPEDITION · {moon ? "MOON" : "MARS"}</p><p>LOCAL TIME {fmt(e.hour)} · SCIENCE {e.science}</p></div>
      {e.phase === "deploy" && <div className="fade-in absolute inset-x-0 top-1/4 text-center font-display text-lg tracking-[0.4em] text-white/85">DEPLOYING ROVER</div>}
      {/* RIGHT: environment, collapsed to a strip */}
      <div className="hud-in pointer-events-auto absolute right-4 top-14 w-56">
        <button onClick={() => ex.patch({ env: !e.env })} aria-expanded={e.env} className="gp flex w-full items-center justify-between px-3 py-2 text-left"><span><Lbl>ENVIRONMENT · SIM</Lbl><span className="mt-1 flex gap-3 font-data text-[12px]"><span>{e.air.t.toFixed(0)}°C</span>{!moon && <span>{e.air.wind.toFixed(0)} m/s</span>}<span>τ {e.air.tau.toFixed(2)}</span></span></span>{e.env ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
        {e.env && <div className="gp fade-in mt-1 space-y-2 p-3">
          <div><Lbl>{moon ? "EXOSPHERE" : "AIR"}</Lbl><Row l="Pressure" v={moon ? "~0 Pa" : `${e.air.p.toFixed(0)} Pa`} /><Row l="Temperature" v={`${e.air.t.toFixed(0)} °C`} />{!moon && <Row l="Wind" v={`${e.air.wind.toFixed(1)} m/s`} />}<Row l={moon ? "Dust charge" : "Dust opacity"} v={e.air.tau.toFixed(2)} /><Row l="Radiation" v={`${e.rad.toFixed(2)} mSv/day`} /></div>
          <div><Lbl>SOIL</Lbl><Row l="Ground temp" v={`${e.soil.gt.toFixed(0)} °C`} /><Row l="Iron oxide" v={`${e.soil.fe.toFixed(1)}%`} />{!moon && <Row l="Perchlorate" v={`${e.soil.perc.toFixed(2)} wt%`} />}<Row l="Moisture" v={`${e.soil.hyd.toFixed(1)}%`} /></div>
          <div><div className="flex justify-between"><Lbl>SUBSURFACE ICE</Lbl><span className="font-data text-[11px]">{e.ice.toFixed(0)}%</span></div><Bar v={e.ice} c="#9bb8d4" /></div></div>}
      </div>
      {/* CENTER: scan + toast */}
      <div className="absolute bottom-44 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        {near && <div className="gp fade-in w-64 p-2 text-center"><div className="font-data text-[11px] tracking-[0.2em] text-[#e8a45a]">{e.scan > 0 ? "SCANNING…" : "HOLD [E] · SCAN TARGET (STOP FIRST)"}</div><Bar v={e.scan * 100} c="#e8a45a" /></div>}
        {e.toast && <div key={e.toast} className="gp toast-in absolute bottom-0 left-1/2 -translate-x-1/2 w-max max-w-md px-4 py-2 text-center text-[14px]" >{e.toast}</div>}
      </div>
      {/* BOTTOM: battery / power / comms / speed */}
      <div className="hud-in absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
        <div className="gp flex items-stretch divide-x divide-white/10">
          <div className="w-28 p-3"><Lbl>SPEED</Lbl><p className="font-data text-3xl leading-none">{e.speed.toFixed(0)}<span className="ml-1 text-[10px] text-white/50">KM/H</span></p><p className="mt-1 truncate font-data text-[9.5px] tracking-widest text-white/50">{e.surf}</p></div>
          <div className="w-40 p-3"><div className="flex justify-between"><Lbl>BATTERY</Lbl><span className={`font-data text-[12px] ${lowB ? "pulse-warn text-[#e5533a]" : ""}`}>{lowB ? "⚠ " : ""}{bat.toFixed(0)}%</span></div><Bar v={bat} c={lowB ? "#e5533a" : "#9bb8d4"} />
            <div className="mt-2 flex items-center justify-between font-data text-[10.5px]"><span className="flex items-center gap-1 text-white/55"><Sun size={12} />{e.panels ? "WINGS OUT" : "WINGS IN"}</span><span className={e.net >= 0 ? "text-[#8fbf8a]" : "text-[#e8a45a]"}>{e.net >= 0 ? "+" : ""}{e.net.toFixed(1)}%/min</span></div>
            <div className="mt-1 flex justify-between font-data text-[10.5px] text-white/55"><span>PANEL DUST</span><span>{e.dust.toFixed(0)}%</span></div></div>
          <div className="w-40 p-3"><div className="flex justify-between"><Lbl>COMMS</Lbl><span className="font-data text-[12px]">{e.link.toFixed(0)}%</span></div>
            <div className="my-1 flex items-end gap-1">{[1, 2, 3, 4].map(b => <span key={b} className="w-3 transition-colors" style={{ height: 5 + b * 4, background: b <= bars ? "#9bb8d4" : "rgba(255,255,255,.14)" }} />)}<Radio size={12} className="ml-auto text-white/40" /></div>
            <div className="flex justify-between font-data text-[10.5px] text-white/55"><span>QUEUE {e.queue} · SENT {e.sent}</span></div>
            <button onClick={ex.transmit} className="gbtn pointer-events-auto mt-2 w-full !px-2 !py-1 !text-[11px]">TRANSMIT [T]</button></div>
        </div>
        <div className="hidden flex-1 justify-center lg:flex"><div className="gp flex flex-wrap justify-center gap-x-3 gap-y-1 px-3 py-2"><Hint keys={["W", "A", "S", "D"]} label="DRIVE" /><Hint keys={["Shift"]} label="BOOST" /><Hint keys={["Space"]} label="BRAKE" /><Hint keys={["F"]} label="SOLAR" /><Hint keys={["E"]} label="SCAN" /><Hint keys={["T"]} label="SEND" /><Hint keys={["V"]} label="VIEW" /><Hint keys={["L"]} label="LIGHTS" /><Hint keys={["C"]} label="BRUSH" /></div></div>
        <div className="flex flex-col items-end gap-2">{e.reply && <p className="gp fade-in max-w-[14rem] p-2 text-[12px] text-[#e8a45a]">{e.reply}</p>}<Minimap /></div>
      </div>
      {dev && <Fps />}
    </div>
  );
}
function MissionClock() {
  const t0 = useRef(Date.now()), [t, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT(Math.floor((Date.now() - t0.current) / 1000)), 1000); return () => clearInterval(i); }, []);
  return <>{String(Math.floor(t / 60)).padStart(2, "0")}:{String(t % 60).padStart(2, "0")}</>;
}
export function FlightHud() {
  const f = useEx(s => s.fl), toast = useEx(s => s.toast), dev = useGame(s => s.settings.dev), r = useGame(s => s.r), moon = useGame(s => s.destination === "moon"), low = f.alt < 15, lowF = f.fuel < 20;
  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-[10vh] bg-gradient-to-b from-[#050506] to-transparent" /><div className="absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-[#050506] via-[#0c0d10]/95 to-transparent" style={{ clipPath: "polygon(0 100%,0 55%,22% 30%,78% 30%,100% 55%,100% 100%)" }} />
        <div className="absolute inset-y-0 left-0 w-[9vw] bg-gradient-to-r from-[#050506]/90 to-transparent" /><div className="absolute inset-y-0 right-0 w-[9vw] bg-gradient-to-l from-[#050506]/90 to-transparent" /></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><svg width="84" height="84" viewBox="-42 -42 84 84" className="opacity-80"><circle r="20" fill="none" stroke="#ece8df" strokeWidth="1" strokeOpacity=".6" /><path d="M-34 0H-24M24 0H34M0 -34V-24M0 24V34" stroke="#e8a45a" strokeWidth="1.5" /><circle r="1.6" fill="#e8a45a" /></svg></div>
      <div className="hud-in absolute left-1/2 top-4 -translate-x-1/2 text-center"><div className="gp px-5 py-2"><p className="font-data text-[9.5px] tracking-[0.28em] text-[#e8a45a]">ORBIT GATES · {moon ? "LUNAR" : "MARS"} ORBIT</p><p className="font-data text-lg">GATE {f.gate + 1} / 8 <span className="text-white/40">·</span> LAPS {f.laps}</p></div></div>
      <div className="hud-in absolute left-4 top-4 font-data text-[10.5px] tracking-[0.2em] text-white/55"><p className="text-white/80">SPACECRAFT FLIGHT</p><p>MISSION TIME T+<MissionClock /></p></div>
      <div className="absolute inset-x-0 bottom-3 flex items-end justify-center gap-3 px-4">
        <div className="gp w-52 space-y-2 p-3"><Lbl>NAVIGATION</Lbl><Row l="Velocity" v={`${(f.speed * 1.05).toFixed(2)} km/s`} /><Row l="Altitude" v={`${f.alt.toFixed(0)} km`} warn={low} />{low && <p className="font-data text-[10.5px] text-[#e5533a]">⚠ LOW ORBIT: {moon ? "SURFACE" : "ATMOSPHERE"}</p>}
          <svg viewBox="-30 -30 60 60" className="mx-auto h-16 w-16"><circle r="22" fill="none" stroke="rgba(255,255,255,.18)" strokeDasharray="2 3" />{Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * 6.283 - 1.57; return <rect key={i} x={Math.cos(a) * 22 - 2} y={Math.sin(a) * 22 - 2} width="4" height="4" fill={i === f.gate ? "#e8a45a" : i < f.gate ? "#8f8c85" : "none"} stroke="#9bb8d4" strokeWidth=".8" />; })}<circle r="3" fill={moon ? "#8c8c92" : "#c0602c"} /></svg><Lbl>TRAJECTORY</Lbl></div>
        <div className="gp w-60 space-y-2 p-3"><div className="flex justify-between"><Lbl>FUEL</Lbl><span className={`font-data text-[12px] ${lowF ? "pulse-warn text-[#e5533a]" : ""}`}>{f.fuel.toFixed(0)}%</span></div><Bar v={f.fuel} c={lowF ? "#e5533a" : "#9bb8d4"} />
          <div className="flex justify-between"><Lbl>POWER</Lbl><span className="font-data text-[12px]">{r.power.toFixed(0)}%</span></div><Bar v={r.power} /><div className="flex justify-between"><Lbl>COMMS</Lbl><span className="font-data text-[12px]">{r.comms.toFixed(0)}%</span></div><Bar v={r.comms} />
          <Row l="Flight assist" v={f.assist ? "ON" : "OFF"} /></div>
        <div className="gp hidden w-52 space-y-1 p-3 md:block"><Lbl>SPACECRAFT STATUS</Lbl>{[["Engines", lowF ? "LOW FUEL" : "NOMINAL", lowF], ["Guidance", f.assist ? "ASSIST ON" : "MANUAL", false], ["Life support", r.oxygen < 25 ? "WARNING" : "NOMINAL", r.oxygen < 25], ["Link", r.comms < 30 ? "DEGRADED" : "LOCKED", r.comms < 30]].map(([k, v, w]) => <div key={k as string} className="flex justify-between text-[12px]"><span className="text-white/50">{k}</span><span className={`font-data ${w ? "text-[#e5533a]" : "text-[#8fbf8a]"}`}>● {v}</span></div>)}</div>
      </div>
      <div className="absolute bottom-[8.5rem] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">{toast && <div key={toast} className="gp fade-in px-4 py-2 text-sm">{toast}</div>}
        <div className="gp hidden flex-wrap justify-center gap-x-3 gap-y-1 px-3 py-2 md:flex"><Hint keys={["W", "S"]} label="THRUST" /><Hint keys={["A", "D"]} label="YAW" /><Hint keys={["R", "F"]} label="PITCH" /><Hint keys={["Q", "E"]} label="ROLL" /><Hint keys={["Shift"]} label="BOOST" /><Hint keys={["Space"]} label="BRAKE" /><Hint keys={["X"]} label="ASSIST" /><Hint keys={["V"]} label="VIEW" /></div></div>
      {dev && <Fps />}
    </div>
  );
}
