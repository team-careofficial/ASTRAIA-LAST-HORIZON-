import type { ReactNode } from "react";
import { Archive, BookOpen, Clapperboard, FlaskConical, Gauge, Play, Plus, Settings, Rocket, Sprout, Users } from "lucide-react";
import { sfx } from "@/lib/utils/audio";
import { game, useGame } from "@/game/engine/store";
import { MISSIONS } from "@/data/world/missions";
import Welcome from "./Welcome";

/** Lobby-style home: player badge on top, wordmark and one big PLAY button on the left, four clear cards below. The astronaut on the right stays free. */
const SHORT = "[@media(max-height:520px)]";
const Tile = ({ i, Icon, title, sub, badge, onClick }: { i: number; Icon: typeof Play; title: string; sub: string; badge?: string; onClick: () => void }) => (
  <button onMouseEnter={() => sfx("hover")} onClick={() => { sfx("click"); onClick(); }} style={{ animationDelay: `${0.45 + i * 0.07}s` }}
    className={`lb-tile lb-in group relative flex items-center gap-3 overflow-hidden rounded-[6px] border border-white/12 bg-black/40 px-3 py-3 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e8a45a]/80 hover:bg-black/55 active:scale-[.98] sm:px-4 sm:py-4 ${SHORT}:py-2`}>
    <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[#e8a45a] transition-transform duration-300 group-hover:scale-x-100" />
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[6px] bg-[#e8a45a]/12 text-[#e8a45a] transition-colors group-hover:bg-[#e8a45a] group-hover:text-black sm:h-11 sm:w-11"><Icon size={20} strokeWidth={1.7} /></span>
    <span className="min-w-0"><span className="block truncate font-ui text-[13px] font-bold leading-tight tracking-[0.1em] sm:text-[15px]">{title}</span><span className={`mt-0.5 block truncate font-data text-[9.5px] tracking-[0.14em] text-white/50 ${SHORT}:hidden`}>{sub}</span></span>
    {badge && <em className="absolute right-2 top-2 not-italic rounded-sm bg-[#e8a45a] px-1.5 py-px font-data text-[8.5px] tracking-widest text-black">{badge}</em>}
  </button>
);
const Chip = ({ children, label }: { children: ReactNode; label: string }) => (
  <div className="flex items-center gap-2 rounded-full border border-white/12 bg-black/40 px-3 py-1.5 backdrop-blur-md"><span className="font-data text-[9px] tracking-[0.2em] text-white/45">{label}</span><b className="font-data text-[12px] text-white">{children}</b></div>
);
export default function Menu() {
  const seen = useGame(s => s.settings.seenIntro), hasRun = useGame(s => s.hasRun), committed = useGame(s => s.committed), lvl = useGame(s => s.level), xp = useGame(s => s.xp), dest = useGame(s => s.destination), done = useGame(s => Object.keys(s.completed).length);
  const canContinue = hasRun || committed, total = MISSIONS.length, into = xp % 150;
  const playLabel = canContinue ? "CONTINUE" : "START MISSION";
  const play = () => (hasRun ? game.continueGame() : committed ? game.go("modes") : game.go("destination"));
  return (
    <div className="screen-in fixed inset-0 z-40 overflow-y-auto overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35" /><div className="pointer-events-none fixed inset-0 bg-gradient-to-r from-black/65 via-black/10 to-transparent" />
      <div className="relative mx-auto flex min-h-full max-w-[1500px] flex-col justify-between gap-4 px-4 pb-3 pt-3 sm:px-8 sm:pb-5 sm:pt-5" style={{ paddingLeft: "max(1rem, env(safe-area-inset-left))", paddingRight: "max(1rem, env(safe-area-inset-right))" }}>
        <header className="lb-in flex items-center justify-between gap-3" style={{ animationDelay: ".1s" }}>
          <div className="flex items-center gap-3 rounded-full border border-white/12 bg-black/40 py-1.5 pl-1.5 pr-5 backdrop-blur-md">
            <div className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[#e8a45a] bg-gradient-to-b from-[#652E15] to-[#25130B] font-display text-base text-[#e8a45a]" style={{ clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>{lvl}</div>
            <div className="w-28 sm:w-44"><p className="font-ui text-[13px] font-bold tracking-[0.18em]">ENGINEER</p>
              <div className="mt-1 h-[4px] rounded-full bg-white/15"><div className="h-full rounded-full bg-[#e8a45a] transition-all duration-700" style={{ width: `${Math.max(4, (into / 150) * 100)}%` }} /></div>
              <p className="mt-1 font-data text-[9px] tracking-[0.18em] text-white/45">LEVEL {lvl} · {xp} XP</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:contents"><Chip label="MISSIONS">{done} / {total}</Chip><Chip label="TARGET">{dest.toUpperCase()}</Chip></span>
            <button aria-label="Settings" onClick={() => { sfx("click"); game.go("settings"); }} className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-black/40 backdrop-blur-md transition-colors hover:border-[#e8a45a] hover:text-[#e8a45a]"><Settings size={17} /></button>
          </div>
        </header>
        <section className="max-w-[640px]">
          <p className="lb-in font-data text-[10px] tracking-[0.34em] text-[#e8a45a]" style={{ animationDelay: ".2s" }}>NASA SPACE APPS 2026 · MISSION DESIGN</p>
          <h1 className={`lb-in mt-1.5 font-display text-[clamp(2.4rem,7.5vw,5.4rem)] leading-[0.95] tracking-[0.12em] ${SHORT}:text-[2.5rem]`} style={{ animationDelay: ".3s", textShadow: "0 6px 40px rgba(0,0,0,.65)" }}>ASTRAIA</h1>
          <div className="lb-in mt-2 flex items-center gap-3" style={{ animationDelay: ".4s" }}><i className="h-px w-10 bg-[#e8a45a]" /><p className="font-ui text-[13px] font-semibold tracking-[0.55em] text-white/85 sm:text-base sm:tracking-[0.7em]">LAST HORIZON</p></div>
          <p className={`lb-in mt-3 max-w-sm text-[14px] leading-snug text-white/70 ${SHORT}:hidden`} style={{ animationDelay: ".45s" }}>Design a real Moon or Mars mission. Does it close? Every number has a receipt.</p>
          <div className="lb-in mt-4 flex flex-wrap items-center gap-3 sm:mt-5" style={{ animationDelay: ".55s" }}>
            <button onMouseEnter={() => sfx("hover")} onClick={() => { sfx("click"); play(); }} className="lb-play group relative flex items-center gap-3 bg-[#e8a45a] py-3 pl-7 pr-12 font-ui text-[17px] font-extrabold tracking-[0.2em] text-black shadow-[0_0_34px_rgba(232,164,90,.35)] transition-all duration-300 [clip-path:polygon(0_0,100%_0,calc(100%-18px)_100%,0_100%)] hover:-translate-y-0.5 hover:bg-[#f2b878] active:scale-[.98] sm:py-4 sm:text-xl">
              {canContinue ? <Play size={22} fill="currentColor" /> : <Rocket size={22} />}{playLabel}</button>
            <button onClick={game.startDemo} className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2.5 font-data text-[10.5px] tracking-[0.2em] text-white/70 backdrop-blur-md transition-colors hover:border-[#e8a45a] hover:text-[#e8a45a]"><Clapperboard size={13} />QUICK DEMO</button>
          </div>
        </section>
        <div className="max-w-[980px]">
          <nav aria-label="Main menu" className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 [@media(max-height:520px)]:grid-cols-4">
            <Tile i={0} Icon={Plus} title="NEW MISSION" sub="DESIGN · LAUNCH" onClick={() => game.go("destination")} />
            <Tile i={1} Icon={Gauge} title="CLOSURE" sub="REAL NASA NUMBERS" badge="NEW" onClick={() => game.go("closure")} />
            <Tile i={2} Icon={Sprout} title="GREENHOUSE" sub="SUN · DUST · FOOD" badge="NEW" onClick={() => game.go("greenhouse")} />
            <Tile i={3} Icon={Users} title="CLASSROOM" sub="TEACHER · TEAMS" badge="NEW" onClick={() => game.go("classroom")} />
          </nav>
          <footer className="lb-in mt-2 flex flex-wrap items-center gap-x-1 font-data text-[10px] tracking-[0.2em] text-white/55" style={{ animationDelay: ".9s" }}>
            {([["ARCHIVE", Archive, "archive"], ["SCIENCE", FlaskConical, "science"], ["MANUAL", BookOpen, "manual"]] as const).map(([t, I, to]) =>
              <button key={t} onClick={() => { sfx("click"); game.go(to); }} className="flex items-center gap-2 rounded-full px-3 py-2 transition-colors hover:bg-black/40 hover:text-[#e8a45a] active:bg-black/60"><I size={13} />{t}</button>)}
            <span className="ml-auto hidden lg:inline">TEAM OMNITRIX · SIMULATED DATA IS ALWAYS LABELLED</span>
          </footer>
        </div>
      </div>
      {!seen && <Welcome />}
    </div>
  );
}
