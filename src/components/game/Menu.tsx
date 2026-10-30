import type { ReactNode } from "react";
import { Archive, BookOpen, Clapperboard, FlaskConical, Gauge, Play, Plus, Settings, Rocket } from "lucide-react";
import { sfx } from "@/lib/utils/audio";
import { game, useGame } from "@/game/engine/store";
import { MISSIONS } from "@/data/world/missions";
import Welcome from "./Welcome";

/** Lobby-style home: player badge and stats on top, one big PLAY button, a row of clearly named tiles. */
const Tile = ({ i, Icon, title, sub, badge, onClick }: { i: number; Icon: typeof Play; title: string; sub: string; badge?: string; onClick: () => void }) => (
  <button onMouseEnter={() => sfx("hover")} onClick={() => { sfx("click"); onClick(); }} style={{ animationDelay: `${0.5 + i * 0.07}s` }}
    className="lb-tile lb-in group relative flex min-h-[104px] flex-col justify-between overflow-hidden border border-white/15 bg-black/45 p-3.5 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#e8a45a] hover:bg-black/60 sm:min-h-[128px] sm:p-4">
    <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-[#e8a45a] transition-transform duration-300 group-hover:scale-x-100" />
    <div className="flex items-start justify-between"><Icon size={26} strokeWidth={1.5} className="text-[#e8a45a] transition-transform duration-300 group-hover:scale-110" />{badge && <em className="not-italic bg-[#e8a45a] px-1.5 py-px font-data text-[9px] tracking-widest text-black">{badge}</em>}</div>
    <div><p className="font-ui text-[15px] font-bold leading-tight tracking-[0.12em] sm:text-[17px]">{title}</p><p className="mt-0.5 font-data text-[10px] tracking-[0.16em] text-white/50">{sub}</p></div>
  </button>
);
const Chip = ({ children, label }: { children: ReactNode; label: string }) => (
  <div className="flex items-center gap-2 border border-white/15 bg-black/45 px-3 py-1.5 backdrop-blur-md"><span className="font-data text-[9.5px] tracking-[0.2em] text-white/45">{label}</span><b className="font-data text-[13px] text-white">{children}</b></div>
);
export default function Menu() {
  const seen = useGame(s => s.settings.seenIntro), hasRun = useGame(s => s.hasRun), committed = useGame(s => s.committed), lvl = useGame(s => s.level), xp = useGame(s => s.xp), dest = useGame(s => s.destination), done = useGame(s => Object.keys(s.completed).length);
  const canContinue = hasRun || committed, total = MISSIONS.length, into = xp % 150;
  const playLabel = canContinue ? "CONTINUE MISSION" : "START MISSION";
  const play = () => (hasRun ? game.continueGame() : committed ? game.go("modes") : game.go("destination"));
  return (
    <div className="screen-in fixed inset-0 z-40 overflow-y-auto overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/55" /><div className="pointer-events-none fixed inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
      <div className="relative mx-auto flex min-h-full max-w-[1500px] flex-col justify-between gap-6 px-4 py-4 sm:px-8 sm:py-6">
        {/* top bar: player and shortcuts */}
        <header className="lb-in flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: ".1s" }}>
          <div className="flex items-center gap-3 border border-white/15 bg-black/50 py-2 pl-2 pr-5 backdrop-blur-md">
            <div className="grid h-12 w-12 shrink-0 place-items-center border-2 border-[#e8a45a] bg-gradient-to-b from-[#652E15] to-[#25130B] font-display text-xl text-[#e8a45a]" style={{ clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>{lvl}</div>
            <div className="w-40 sm:w-52"><p className="font-ui text-[15px] font-bold tracking-[0.18em]">ENGINEER</p>
              <div className="mt-1 h-[6px] bg-white/15"><div className="h-full bg-[#e8a45a] transition-all duration-700" style={{ width: `${Math.max(4, (into / 150) * 100)}%` }} /></div>
              <p className="mt-1 font-data text-[9.5px] tracking-[0.18em] text-white/45">LEVEL {lvl} · {xp} XP</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip label="MISSIONS">{done} / {total}</Chip><Chip label="TARGET">{dest.toUpperCase()}</Chip>
            <button aria-label="Settings" onClick={() => { sfx("click"); game.go("settings"); }} className="grid h-10 w-10 place-items-center border border-white/15 bg-black/50 backdrop-blur-md transition-colors hover:border-[#e8a45a] hover:text-[#e8a45a]"><Settings size={18} /></button>
          </div>
        </header>
        {/* hero: wordmark and the one big button */}
        <section className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="lb-in font-data text-[10.5px] tracking-[0.4em] text-[#e8a45a]" style={{ animationDelay: ".2s" }}>NASA SPACE APPS 2026 · SPACE MISSION DESIGN</p>
            <h1 className="lb-in mt-2 font-display text-[clamp(2.8rem,9vw,6.2rem)] leading-[0.95] tracking-[0.14em]" style={{ animationDelay: ".3s", textShadow: "0 6px 50px rgba(0,0,0,.7)" }}>ASTRAIA</h1>
            <div className="lb-in mt-2 flex items-center gap-4" style={{ animationDelay: ".4s" }}><i className="h-px w-12 bg-[#e8a45a]" /><p className="font-ui text-sm font-semibold tracking-[0.6em] text-white/85 sm:text-lg sm:tracking-[0.75em]">LAST HORIZON</p></div>
            <p className="lb-in mt-3 max-w-md text-[14px] leading-snug text-white/70" style={{ animationDelay: ".45s" }}>Design a real Moon or Mars mission. Does it close? Every number has a receipt.</p>
          </div>
          <button onMouseEnter={() => sfx("hover")} onClick={() => { sfx("click"); play(); }} className="lb-play lb-in group relative flex w-full items-center justify-center gap-4 bg-[#e8a45a] px-10 py-5 font-ui text-xl font-extrabold tracking-[0.22em] text-black shadow-[0_0_40px_rgba(232,164,90,.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#f2b878] hover:shadow-[0_0_60px_rgba(232,164,90,.6)] md:w-auto md:min-w-[320px] md:text-2xl" style={{ animationDelay: ".6s", clipPath: "polygon(18px 0,100% 0,calc(100% - 18px) 100%,0 100%)" }}>
            {canContinue ? <Play size={26} fill="currentColor" /> : <Rocket size={26} />}{playLabel}</button>
        </section>
        {/* tiles */}
        <nav aria-label="Main menu" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
          <Tile i={0} Icon={Plus} title="NEW MISSION" sub="DESIGN · LAUNCH" onClick={() => game.go("destination")} />
          <Tile i={1} Icon={Gauge} title="MISSION CLOSURE" sub="REAL NASA NUMBERS" badge="NEW" onClick={() => game.go("closure")} />
          <Tile i={2} Icon={Archive} title="ARCHIVE" sub="PAST MISSIONS" onClick={() => game.go("archive")} />
          <Tile i={3} Icon={FlaskConical} title="SCIENCE" sub="REAL vs SIMULATED" onClick={() => game.go("science")} />
          <Tile i={4} Icon={BookOpen} title="MANUAL" sub="HOW IT WORKS" onClick={() => game.go("manual")} />
        </nav>
        <footer className="lb-in flex flex-wrap items-center justify-between gap-3 font-data text-[10px] tracking-[0.2em] text-white/45" style={{ animationDelay: "1s" }}>
          <button onClick={game.startDemo} className="flex items-center gap-2 transition-colors hover:text-[#e8a45a]"><Clapperboard size={13} />QUICK DEMO</button>
          <span>TEAM OMNITRIX · SIMULATED DATA IS ALWAYS LABELLED</span>
        </footer>
      </div>
      {!seen && <Welcome />}
    </div>
  );
}
