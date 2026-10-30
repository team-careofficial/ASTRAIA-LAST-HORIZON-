import type { ReactNode } from "react";
import { Archive, BookOpen, Clapperboard, FlaskConical, Gauge, Play, Settings, Rocket, Sprout, Users, ChevronRight } from "lucide-react";
import { sfx } from "@/lib/utils/audio";
import { game, useGame } from "@/game/engine/store";
import { MISSIONS } from "@/data/world/missions";
import { CREW3D } from "@/data/world/missions";
import Avatar from "@/components/ui/Avatar";
import Welcome from "./Welcome";
import { intro } from "@/game/engine/intro";
import { useState } from "react";

/** Lobby home, laid out like a mobile shooter lobby: profile top-left, logo and settings top-right, a short button stack on the left,
 *  the squad on the right edge, tabs bottom-left, mode plate and one big START bottom-right. The astronaut photo stays in the middle. */
const SideBtn = ({ i, Icon, label, dot, onClick }: { i: number; Icon: typeof Play; label: string; dot?: boolean; onClick: () => void }) => (
  <button onMouseEnter={() => sfx("hover")} onClick={() => { sfx("click"); onClick(); }} style={{ animationDelay: `${0.35 + i * 0.07}s` }}
    className="lob-l lob-btn group relative flex w-[8.6rem] items-center gap-2.5 px-3 py-2 text-left sm:w-40 sm:py-2.5">
    <Icon size={16} strokeWidth={1.8} className="shrink-0 text-[#e8a45a] transition-transform duration-300 group-hover:scale-110" />
    <span className="font-ui text-[12.5px] font-bold tracking-[0.12em] sm:text-[13.5px]">{label}</span>
    {dot && <i className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[#e5533a] shadow-[0_0_6px_#e5533a]" />}
  </button>
);
const Tab = ({ Icon, label, onClick }: { Icon: typeof Play; label: string; onClick: () => void }) => (
  <button onClick={() => { sfx("click"); onClick(); }} className="lob-tab group flex items-center gap-2 px-3.5 py-2.5 font-ui text-[11.5px] font-bold tracking-[0.16em] text-white/70 transition-colors hover:text-[#e8a45a] sm:px-5 sm:text-[12.5px]"><Icon size={15} />{label}</button>
);
export default function Menu() {
  const seen = useGame(s => s.settings.seenIntro), hasRun = useGame(s => s.hasRun), committed = useGame(s => s.committed), lvl = useGame(s => s.level), xp = useGame(s => s.xp), dest = useGame(s => s.destination), done = useGame(s => Object.keys(s.completed).length);
  const [fl] = useState(() => { const f = intro.flash; intro.flash = false; return f; });
  const canContinue = hasRun || committed, total = MISSIONS.length, into = xp % 150;
  const play = () => (hasRun ? game.continueGame() : committed ? game.go("modes") : game.go("destination"));
  const Pill = ({ children }: { children: ReactNode }) => <span className="rounded-sm bg-black/45 px-2 py-0.5 font-data text-[10px] tracking-[0.12em] text-white/85">{children}</span>;
  return (
    <div className="fixed inset-0 z-40 select-none overflow-hidden" style={{ paddingTop: "env(safe-area-inset-top)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/40" /><div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/25" />
      {/* top-left: player */}
      <div className="lob-t absolute left-2 top-2 flex items-center gap-2 sm:left-4 sm:top-3" style={{ animationDelay: ".1s" }}>
        <div className="lob-plate flex items-center gap-2.5 py-1.5 pl-1.5 pr-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center border-2 border-[#e8a45a] bg-gradient-to-b from-[#652E15] to-[#25130B] font-display text-sm text-[#e8a45a]" style={{ clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>{lvl}</div>
          <div className="w-24 sm:w-36"><p className="font-ui text-[12px] font-bold tracking-[0.16em]">ENGINEER</p>
            <div className="mt-1 h-[3px] rounded-full bg-white/15"><div className="h-full rounded-full bg-[#e8a45a] transition-all duration-700" style={{ width: `${Math.max(5, (into / 150) * 100)}%` }} /></div></div>
        </div>
        <div className="hidden items-center gap-1.5 sm:flex"><Pill>MISSIONS {done}/{total}</Pill><Pill>XP {xp}</Pill></div>
      </div>
      {/* top-right: logo and settings */}
      <div className="lob-t absolute right-2 top-2 flex items-center gap-3 sm:right-4 sm:top-3" style={{ animationDelay: ".15s" }}>
        <div className="text-right leading-none"><p className="font-display text-[15px] tracking-[0.22em] sm:text-[18px]" style={{ textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>ASTRAIA</p><p className="mt-1 font-ui text-[8.5px] font-semibold tracking-[0.5em] text-[#e8a45a]">LAST HORIZON</p></div>
        <button aria-label="Settings" onClick={() => { sfx("click"); game.go("settings"); }} className="lob-btn grid h-9 w-9 place-items-center transition-colors hover:text-[#e8a45a]"><Settings size={17} /></button>
      </div>
      {/* left: short button stack */}
      <nav aria-label="Main menu" className="absolute left-2 top-16 flex flex-col gap-1.5 sm:left-4 sm:top-[4.6rem]">
        <SideBtn i={0} Icon={Gauge} label="CLOSURE" dot onClick={() => game.go("closure")} />
        <SideBtn i={1} Icon={Sprout} label="GREENHOUSE" dot onClick={() => game.go("greenhouse")} />
        <SideBtn i={2} Icon={Users} label="CLASSROOM" dot onClick={() => game.go("classroom")} />
        <SideBtn i={3} Icon={Clapperboard} label="QUICK DEMO" onClick={game.startDemo} />
      </nav>
      {/* right edge: the squad */}
      <div className="absolute right-2 top-16 flex flex-col gap-2 sm:right-4 sm:top-[4.6rem]">
        {CREW3D.map((c, i) => <div key={c.id} className="lob-r flex items-center justify-end gap-2" style={{ animationDelay: `${0.35 + i * 0.07}s` }}>
          <span className="hidden text-right lg:block"><span className="block font-ui text-[11.5px] font-bold tracking-[0.1em]">{c.name.toUpperCase()}</span><span className="block font-data text-[8.5px] tracking-[0.14em] text-white/55">{c.role.toUpperCase()}</span></span>
          <span className="lob-ava grid h-9 w-9 place-items-center overflow-hidden rounded-full sm:h-10 sm:w-10"><Avatar id={c.id} size={34} /></span></div>)}
      </div>
      {/* bottom-left: tabs */}
      <div className="lob-b lob-tabs absolute bottom-2 left-2 flex sm:bottom-3 sm:left-4" style={{ animationDelay: ".45s" }}>
        <Tab Icon={Archive} label="ARCHIVE" onClick={() => game.go("archive")} /><Tab Icon={FlaskConical} label="SCIENCE" onClick={() => game.go("science")} /><Tab Icon={BookOpen} label="MANUAL" onClick={() => game.go("manual")} />
      </div>
      {/* bottom-right: mode plate and START */}
      <div className="absolute bottom-2 right-2 flex w-[15rem] flex-col items-stretch gap-1.5 sm:bottom-3 sm:right-4 sm:w-[19rem]">
        <button onMouseEnter={() => sfx("hover")} onClick={() => { sfx("click"); game.go("modeselect"); }} style={{ animationDelay: ".5s" }} className="lob-b lob-btn group flex items-center gap-3 px-3 py-2 text-left">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-[#e8a45a]/15 text-[#e8a45a]"><Rocket size={18} /></span>
          <span className="min-w-0 flex-1"><span className="block font-data text-[8.5px] tracking-[0.2em] text-white/50">MODE</span><span className="block truncate font-ui text-[14px] font-bold tracking-[0.12em]">{dest.toUpperCase()} MISSION</span></span>
          <ChevronRight size={18} className="text-[#e8a45a] transition-transform group-hover:translate-x-1" />
        </button>
        <button onMouseEnter={() => sfx("hover")} onClick={() => { sfx("click"); play(); }} style={{ animationDelay: ".6s" }} className="lob-pop lob-start group relative flex h-12 items-center justify-center gap-3 font-ui text-[22px] font-extrabold tracking-[0.2em] text-black sm:h-14 sm:text-[26px]">
          {canContinue ? <><Play size={20} fill="currentColor" />CONTINUE</> : "START"}</button>
      </div>
      {fl && <div className="flash2" />}
      {!seen && <Welcome />}
    </div>
  );
}
