import { useEffect, useState } from "react";
import { X, Lock } from "lucide-react";
import { sfx } from "@/lib/utils/audio";
import { game, useGame } from "@/game/engine/store";
import { ex } from "@/game/explore/store";

type Tab = "mission" | "play" | "lab";
type Card = { id: string; tab: Tab; title: string; sub: string; img: string; pos?: string; desc: string; tags: string[]; badge?: string; off?: string; run: () => void };

/** Mode select, like a shooter's mode screen: tabs on top, a row of big cards, one START. Pick a card, then START. */
export default function ModeSelect() {
  const dest = useGame(s => s.destination);
  const CARDS: Card[] = [
    { id: "mars", tab: "mission", title: "MARS", sub: "DESIGN · LAUNCH · LAND", img: "/images/scenes/mars-key.jpg", pos: "80% 30%", desc: "Design a Mars mission with real NASA numbers, then launch and live with the result.", tags: ["DESIGN", "REAL DATA", "LONG SILENCE"], run: () => game.setDestination("mars") },
    { id: "moon", tab: "mission", title: "MOON", sub: "DESIGN · LAUNCH · LAND", img: "/images/scenes/moon.jpg", pos: "50% 62%", desc: "Near and airless. Shorter trip, harsh light, and almost no margin for error.", tags: ["DESIGN", "AIRLESS", "SOUTH POLE"], run: () => game.setDestination("moon") },
    { id: "demo", tab: "mission", title: "QUICK DEMO", sub: "2 MINUTES", img: "/images/scenes/control.jpg", desc: "A ready-made Mars mission, so you can see everything fast.", tags: ["FAST", "GUIDED"], run: () => game.startDemo() },
    { id: "missions", tab: "play", title: "MISSIONS", sub: "ON FOOT · DECISIONS", img: "/images/scenes/mars-key.jpg", pos: "12% 80%", desc: "Walk the crew around the base. Diagnose problems, decide, and live with the consequences.", tags: ["CREW", "EMERGENCIES"], off: dest === "moon" ? "Mars only for now" : undefined, run: () => game.go("archive") },
    { id: "rover", tab: "play", title: "ROVER", sub: "DRIVE · SCAN · REPORT", img: "/images/scenes/storm.jpg", desc: "Deploy the rover, watch the environment, scan science targets and report to Earth.", tags: ["DRIVING", "SCIENCE", "POWER"], run: () => { ex.reset(); game.go("rover"); } },
    { id: "flight", tab: "play", title: "FLIGHT", sub: "ORBIT GATES · FUEL", img: "/images/scenes/launch.jpg", desc: "Fly a spacecraft through the orbit gates and manage your fuel.", tags: ["FLIGHT", "FUEL", "ORBIT"], run: () => { ex.resetFlight(); game.go("flight"); } },
    { id: "closure", tab: "lab", title: "CLOSURE", sub: "REAL NASA NUMBERS", img: "/images/scenes/control.jpg", pos: "50% 40%", badge: "NEW", desc: "Predict first, then see if your mission really closes. Every number has a receipt.", tags: ["Δv", "MASS", "RECEIPTS"], run: () => game.go("closure") },
    { id: "greenhouse", tab: "lab", title: "GREENHOUSE", sub: "SUN · DUST · FOOD", img: "/images/scenes/hangar.jpg", badge: "NEW", desc: "Grow food on Mars. Sunlight, dust storms and power decide the harvest.", tags: ["SOLAR", "DUST", "FOOD"], run: () => game.go("greenhouse") },
    { id: "classroom", tab: "lab", title: "CLASSROOM", sub: "TEACHER · TEAMS", img: "/images/scenes/map.jpg", badge: "NEW", desc: "A teacher sets a challenge, teams compete for the lightest valid design.", tags: ["TEACHER", "TEAMS", "CSV"], run: () => game.go("classroom") },
  ];
  const [tab, setTab] = useState<Tab>("mission"), [sel, setSel] = useState<string>(dest);
  const list = CARDS.filter(c => c.tab === tab), cur = list.find(c => c.id === sel) ?? list[0];
  const pick = (t: Tab) => { sfx("click"); setTab(t); setSel(t === "mission" ? dest : CARDS.find(c => c.tab === t)!.id); };
  const back = () => { sfx("click"); game.go("menu"); };
  useEffect(() => { const f = (e: KeyboardEvent) => { if (e.code === "Escape") game.go("menu"); }; window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, []);
  const go = () => { if (cur.off) return; sfx("click"); cur.run(); };
  return (
    <div className="fade-in fixed inset-0 z-40 select-none overflow-hidden bg-black/55 backdrop-blur-[3px]" style={{ paddingTop: "env(safe-area-inset-top)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,140,40,.14),transparent_65%)]" />
      <header className="lob-t relative flex items-center justify-center px-3 pt-2" role="tablist">
        {([["mission", "MISSION MODE"], ["play", "FREE PLAY"], ["lab", "LAB"]] as const).map(([t, l]) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => pick(t)} className="ms-tab">{l}</button>)}
        <button aria-label="Close" onClick={back} className="lob-btn absolute right-2 top-2 grid h-9 w-9 place-items-center hover:text-[#ffc14d] sm:right-4"><X size={18} /></button>
      </header>
      <div key={tab} className="absolute inset-x-0 top-[3.4rem] bottom-[5.6rem] flex items-center sm:bottom-[6.4rem]">
        <div className="no-scrollbar flex w-full snap-x items-center justify-center gap-3 overflow-x-auto px-6 py-4 max-sm:justify-start">
          {list.map((c, i) => (
            <button key={c.id} aria-pressed={cur.id === c.id} onClick={() => { sfx("click"); setSel(c.id); }} onDoubleClick={go} style={{ animationDelay: `${i * 0.07}s` }} className="ms-card lob-b">
              <img src={c.img} alt="" draggable={false} style={{ objectPosition: c.pos ?? "center" }} />
              {c.badge && <em className="absolute right-2 top-2 z-10 rounded-sm bg-[#ffc14d] px-1.5 py-px font-data text-[8.5px] not-italic tracking-widest text-black">{c.badge}</em>}
              {c.off && <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-sm bg-black/70 px-1.5 py-0.5 font-data text-[8.5px] tracking-widest text-white/70"><Lock size={10} />{c.off.toUpperCase()}</span>}
              <span className="absolute inset-x-0 bottom-0 z-10 p-3"><span className="block font-display text-[15px] tracking-[0.16em] sm:text-[17px]">{c.title}</span><span className="mt-1 block font-data text-[9px] tracking-[0.16em] text-[#ffc14d]">{c.sub}</span></span>
            </button>))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-2 flex items-end justify-between gap-3 px-3 sm:bottom-4 sm:px-6">
        <div key={cur.id} className="fade-in min-w-0 max-w-[26rem]"><p className="font-ui text-[13px] leading-snug text-white/80 sm:text-[14.5px]">{cur.off ? cur.off : cur.desc}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">{cur.tags.map(t => <span key={t} className="rounded-sm border border-white/15 bg-black/40 px-1.5 py-px font-data text-[9px] tracking-[0.14em] text-white/65">{t}</span>)}</div></div>
        <button onClick={go} disabled={!!cur.off} className="lob-start lob-pop relative h-12 w-44 shrink-0 font-ui text-[22px] font-extrabold tracking-[0.2em] text-black disabled:opacity-40 sm:h-14 sm:w-56 sm:text-[26px]">START</button>
      </div>
    </div>
  );
}
