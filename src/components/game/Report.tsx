import { useEffect, useState } from "react";
import { game, useGame } from "@/game/engine/store";
import { useEx } from "@/game/explore/store";
import { buildReport } from "@/game/engine/report";
import { MISSIONS } from "@/data/world/missions";
import Btn from "@/components/ui/Btn";
import { Eyebrow } from "@/components/ui/kit";
import { Shell } from "./Pages";

const END_TEXT: Record<string, string> = {
  "PERFECT MISSION": "Every objective met, every crew member home safe. This is how mission control hopes every mission will go.",
  "SCIENTIFIC BREAKTHROUGH": "The data you sent back will keep scientists busy for years. The risks paid off.",
  "SCIENCE SUCCESS": "You met your science goals and kept the base running. A solid result.",
  "CREW SURVIVAL": "The crew survived, and that matters most. The science was modest, but the lessons are valuable.",
  "PARTIAL SUCCESS": "Some goals were met and some were lost. Mission control will study this carefully.",
  "MISSION ABORT": "Too little was completed. The mission ends early, and engineers will review what went wrong.",
  "RESOURCE COLLAPSE": "Air, water, power or food ran too low. Careful margins at the design stage might have changed this.",
  "LOST COMMUNICATION": "Contact with Earth was lost. Without a link, the crew had to act alone.",
  "CATASTROPHIC FAILURE": "The crew did not survive. Every real mission is planned so this does not happen.",
};
function useCount(to: number, delay: number, on: boolean, ms = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!on) return; let raf = 0, t0 = 0; const id = setTimeout(() => { const f = (t: number) => { if (!t0) t0 = t; const u = Math.min(1, (t - t0) / ms); setV(to * (1 - Math.pow(1 - u, 3))); if (u < 1) raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); }, delay);
    return () => { clearTimeout(id); cancelAnimationFrame(raf); };
  }, [to, delay, on, ms]);
  return v;
}
function Ring({ label, pct, delay, on, tone = "#9bb8d4" }: { label: string; pct: number; delay: number; on: boolean; tone?: string }) {
  const v = useCount(pct, delay, on), C = 2 * Math.PI * 34;
  return (
    <div className="gp flex items-center gap-4 p-4" style={{ animation: on ? `fadeIn .6s ${delay}ms var(--ease) both` : undefined, opacity: on ? undefined : 0 }}>
      <svg width="76" height="76" viewBox="0 0 80 80" aria-hidden><circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="4" /><circle cx="40" cy="40" r="34" fill="none" stroke={tone} strokeWidth="4" strokeLinecap="butt" strokeDasharray={C} strokeDashoffset={C * (1 - v / 100)} transform="rotate(-90 40 40)" />
        <text x="40" y="45" textAnchor="middle" fill="#ece8df" fontSize="17" fontFamily="var(--font-mono)">{Math.round(v)}</text></svg>
      <div><p className="font-data text-[10.5px] tracking-[0.2em] text-white/55">{label}</p><p className="text-[12.5px] text-white/40">{v >= 75 ? "Excellent" : v >= 50 ? "Good" : v >= 25 ? "Weak" : "Poor"}</p></div>
    </div>
  );
}
const Stat = ({ label, value, delay, on }: { label: string; value: string; delay: number; on: boolean }) => <div className="gp p-4" style={{ animation: on ? `fadeIn .6s ${delay}ms var(--ease) both` : undefined, opacity: on ? undefined : 0 }}><p className="font-data text-[10.5px] tracking-[0.2em] text-white/55">{label}</p><p className="mt-1 font-data text-2xl">{value}</p></div>;
export function Report() {
  const w = useGame(s => s), found = useEx(s => s.found.length), sci = useEx(s => s.science), r = buildReport(w, found, sci), [on, setOn] = useState(false), [skip, setSkip] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 900); return () => clearTimeout(t); }, []);
  const score = useCount(r.score, 2400, on, 2200), good = r.status === "SUCCESS", bad = r.status === "FAILED";
  return (
    <Shell title="MISSION DEBRIEF" sub={`${w.destination.toUpperCase()} EXPEDITION · REPORT`} onBack={() => game.go(w.demo ? "menu" : "archive")} flat>
      <div>
        <section className="gp relative overflow-hidden p-6">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div><Eyebrow>MISSION STATUS</Eyebrow>
              <p className={`mt-2 font-data text-sm tracking-[0.3em] ${good ? "text-[#8fbf8a]" : bad ? "text-[#e5533a]" : "text-[#e8a45a]"}`} style={{ animation: "fadeIn .8s .2s both" }}>● {r.status}</p>
              <h2 className="mt-3 font-display text-2xl tracking-[0.12em] sm:text-4xl" style={{ animation: "logoForm 2s .5s var(--ease) both" }}>{r.ending}</h2>
              <p className="mt-3 max-w-xl text-[15px] leading-snug text-white/70" style={{ animation: "fadeIn 1s 1.4s both" }}>{END_TEXT[r.ending]}</p></div>
            <div className="text-right"><p className="font-data text-[10.5px] tracking-[0.3em] text-white/50">TOTAL SCORE</p><p className="font-data text-5xl text-[#e8a45a]">{Math.round(score).toLocaleString()}</p></div>
          </div>
        </section>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="CREW SURVIVAL" value={r.crew} delay={1400} on={on} />
          <Ring label="SCIENCE" pct={r.science} delay={1600} on={on} />
          <Ring label="ENGINEERING" pct={r.engineering} delay={1800} on={on} />
          <Ring label="RESOURCE MANAGEMENT" pct={r.resources} delay={2000} on={on} tone="#e8a45a" />
          <Ring label="DECISION QUALITY" pct={r.decision} delay={2200} on={on} tone="#e8a45a" />
          <Stat label="DISCOVERIES" value={`${r.discoveries}`} delay={2400} on={on} />
          <Stat label="CRITICAL EVENTS" value={`${r.critical}`} delay={2600} on={on} />
          <Stat label="MISSIONS COMPLETE" value={`${r.done} / ${r.total}`} delay={2800} on={on} />
        </div>
        <section className="gp mt-4 p-5" style={{ animation: on ? "fadeIn .7s 3000ms both" : undefined, opacity: on ? undefined : 0 }}>
          <Eyebrow>MISSION TIMELINE</Eyebrow>
          <ol className="relative mt-4 max-h-64 space-y-3 overflow-auto border-l border-white/15 pl-5 text-[14px]">{r.timeline.length === 0 ? <li className="text-white/50">No decisions logged yet. Play a mission first.</li> : r.timeline.map((p, i) => (
            <li key={i} className="relative" style={{ animation: on ? `fadeIn .5s ${3200 + i * 120}ms both` : undefined }}><i className={`absolute -left-[26px] top-[7px] h-2 w-2 ${p.tag === "SUCCESS" ? "bg-[#8fbf8a]" : p.tag === "FAILURE" ? "bg-[#e5533a]" : p.tag === "RISK" ? "bg-[#e8a45a]" : "bg-[#9bb8d4]"}`} />
              <span className="font-data text-[11px] text-white/45">T+{Math.floor(p.t / 60)}h · {MISSIONS.find(m => m.id === p.m)?.title}</span><br />{p.choice} <span className="font-data text-[10.5px] tracking-widest text-white/45">[{p.tag}]</span></li>))}</ol>
        </section>
      </div>
      <div className="mt-5 flex gap-2"><Btn main onClick={() => game.go("menu")}>MENU</Btn><Btn onClick={() => game.go("modes")}>BACK TO MODES</Btn></div>
    </Shell>
  );
}
