import { Archive, BookOpen, FlaskConical, Play, Plus, Settings, Clapperboard, Gamepad2 } from "lucide-react";
import { sfx } from "@/lib/utils/audio";
import { game, useGame } from "@/game/engine/store";
import Welcome from "./Welcome";

const Item = ({ i, Icon, label, hint, onClick, main, disabled, badge }: { i: number; Icon: typeof Play; label: string; hint: string; onClick: () => void; main?: boolean; disabled?: boolean; badge?: string }) => (
  <button disabled={disabled} onMouseEnter={() => !disabled && sfx("hover")} onClick={() => { sfx("click"); onClick(); }} className={`mi ${main ? "mi-main" : ""} disabled:opacity-35`} style={{ animationDelay: `${1.1 + i * 0.07}s` }}>
    <Icon size={18} strokeWidth={1.75} />{label}{badge && <em className="not-italic rounded-sm bg-[#e8a45a] px-1.5 py-px font-data text-[9px] tracking-widest text-black">{badge}</em>}<small>{hint}</small></button>
);
export default function Menu() {
  const seen = useGame(s => s.settings.seenIntro), hasRun = useGame(s => s.hasRun), committed = useGame(s => s.committed), lvl = useGame(s => s.level), xp = useGame(s => s.xp), dest = useGame(s => s.destination), q = useGame(s => s.settings.quality);
  const canContinue = hasRun || committed;
  return (
    <div className="screen-in fixed inset-0 z-40 overflow-y-auto overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-r from-[#08090b]/85 via-[#08090b]/35 to-transparent" /><div className="vignette" /><div className="grain" />
      <div className="relative flex min-h-full flex-col justify-between gap-5 px-6 py-6 sm:px-14 sm:py-8">
        <header className="shrink-0">
          <div className="flex items-center gap-3 font-data text-[10.5px] tracking-[0.4em] text-[#e8a45a]" style={{ animation: "fadeIn 1s .3s both" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="9" /><path d="M12 1v6M12 17v6M1 12h6M17 12h6" /><circle cx="12" cy="12" r="2.2" fill="currentColor" /></svg>NASA SPACE APPS · TEAM OMNITRIX</div>
          <h1 className="mt-[clamp(.5rem,2vh,1.25rem)] font-display text-[clamp(2.2rem,8vh,4.2rem)] leading-none tracking-[0.2em]" style={{ animation: "logoForm 2.4s .5s var(--ease) both", textShadow: "0 4px 40px rgba(0,0,0,.6)" }}>ASTRAIA</h1>
          <div className="mt-2 flex items-center gap-4" style={{ animation: "fadeIn 1.2s 1.2s both" }}><i className="h-px w-10 bg-[#e8a45a] sm:w-14" /><p className="font-ui text-sm font-semibold tracking-[0.6em] text-white/85 sm:text-lg sm:tracking-[0.75em]">LAST HORIZON</p></div>
          <p className="mt-2 font-data text-[10.5px] tracking-[0.22em] text-white/45" style={{ animation: "fadeIn 1.2s 1.5s both" }}>DESIGN · LAUNCH · EXPLORE · SURVIVE</p>
        </header>
        <nav aria-label="Main menu" className="flex w-full max-w-[21rem] shrink-0 flex-col gap-[clamp(.2rem,.8vh,.4rem)]">
          <Item i={0} Icon={Play} label="CONTINUE MISSION" hint={hasRun ? "RESUME RUN" : committed ? "MODES" : "NO SAVE"} main={canContinue} disabled={!canContinue} onClick={() => (hasRun ? game.continueGame() : game.go("modes"))} />
          <Item i={1} Icon={Plus} label="NEW MISSION" hint="DESIGN" main={!canContinue} onClick={() => game.go("destination")} />
          <Item i={2} Icon={Gamepad2} label="FUN ZONE" hint="GAMES · QUIZ" badge="NEW" onClick={() => game.go("fun")} />
          <Item i={3} Icon={Archive} label="MISSION ARCHIVE" hint="MISSIONS" onClick={() => game.go("archive")} />
          <Item i={4} Icon={BookOpen} label="MISSION MANUAL" hint="GUIDE" onClick={() => game.go("manual")} />
          <Item i={5} Icon={FlaskConical} label="SCIENCE" hint="REAL vs SIM" onClick={() => game.go("science")} />
          <Item i={6} Icon={Settings} label="SETTINGS" hint="GRAPHICS" onClick={() => game.go("settings")} />
          <button onClick={game.startDemo} className="mt-1 flex items-center gap-2 self-start pl-4 font-data text-[10.5px] tracking-[0.25em] text-white/50 transition-colors hover:text-[#e8a45a]" style={{ animation: "fadeIn 1s 1.9s both" }}><Clapperboard size={13} />QUICK DEMO</button>
        </nav>
        <footer className="flex shrink-0 flex-wrap items-end justify-between gap-x-6 gap-y-2 font-data text-[10.5px] tracking-[0.22em] text-white/45" style={{ animation: "fadeIn 1s 2s both" }}>
          <div className="space-y-1"><p><span className="text-[#8fbf8a]">●</span> SYSTEMS NOMINAL · {dest.toUpperCase()}</p><p>PILOT LEVEL {lvl} · {xp} XP</p></div>
          <div className="hidden text-right md:block"><p>GRAPHICS {q.toUpperCase()}</p><p className="text-white/30">SIMULATED DATA IS LABELLED</p></div>
        </footer>
      </div>
      {!seen && <Welcome />}
    </div>
  );
}
