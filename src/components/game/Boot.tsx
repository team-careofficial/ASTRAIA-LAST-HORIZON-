import { useEffect, useRef, useState } from "react";
import { game } from "@/game/engine/store";
import { initAudio, sfx } from "@/lib/utils/audio";
import { getMarsDataProvider } from "@/lib/nasa/provider";
import { intro } from "@/game/engine/intro";

/** Intro in three beats, like a mobile shooter: 1) team logo on black, 2) splash art with a thin loading line and the game logo,
 *  3) tap, a warm flash, and the lobby slides in. The splash is the same photo as the lobby, so nothing jumps.
 *  One tap is needed because browsers only allow sound after a tap. */
export default function Boot() {
  const [phase, setPhase] = useState<"brand" | "splash" | "flash">("brand"), [pct, setPct] = useState(0), [ready, setReady] = useState(false), timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (f: () => void, ms: number) => { timers.current.push(setTimeout(f, ms)); };
  useEffect(() => {
    later(() => setPhase("splash"), 1700);
    game.markReady("missions"); getMarsDataProvider().getSnapshot().catch(() => null).finally(() => game.markReady("telemetry"));
    let p = 0; const tick = () => { p = Math.min(100, p + 3 + Math.random() * 7); setPct(p); if (p < 100) later(tick, 90); else later(() => setReady(true), 250); };
    later(tick, 1900);
    return () => timers.current.forEach(clearTimeout);
  }, []);
  const start = () => {
    if (!ready || phase !== "splash") return;
    initAudio(); game.audioReady(); sfx("notify"); setPhase("flash");
    later(() => { intro.flash = true; game.go("menu"); }, 170);
  };
  return (
    <>
      <div onClick={start} className={`fixed inset-0 z-50 select-none transition-opacity duration-700 ${ready && phase === "splash" ? "cursor-pointer" : ""}`}>
        {/* beat 1: team logo */}
        <div className={`absolute inset-0 grid place-items-center bg-black transition-opacity duration-[900ms] ${phase === "brand" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <div className="text-center"><p className="lb-in font-display text-[clamp(1.4rem,5vw,2.4rem)] tracking-[0.5em]" style={{ animationDelay: ".15s" }}>OMNITRIX</p><p className="lb-in mt-2 font-data text-[10px] tracking-[0.5em] text-[#e8a45a]" style={{ animationDelay: ".5s" }}>TEAM PRESENTS</p></div>
        </div>
        {/* beat 2: splash */}
        <div className={`absolute inset-0 transition-opacity duration-[900ms] ${phase === "brand" ? "opacity-0" : "opacity-100"}`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(0,0,0,.45),rgba(0,0,0,.05)_70%)]" /><div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] text-right leading-none">
            <p className="font-display text-[clamp(1.6rem,5vw,3rem)] tracking-[0.2em]" style={{ textShadow: "0 4px 24px rgba(0,0,0,.75)" }}>ASTRAIA</p><p className="mt-1.5 font-ui text-[11px] font-semibold tracking-[0.6em] text-[#e8a45a] sm:text-sm">LAST HORIZON</p></div>
          <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1.25rem,env(safe-area-inset-left))] w-[min(46vw,22rem)]">
            {ready ? <p className="font-ui text-[15px] font-bold tracking-[0.3em] text-white" style={{ animation: "tap-blink 1.4s ease-in-out infinite" }}>TAP TO START</p>
              : <><p className="mb-1.5 font-data text-[9.5px] tracking-[0.3em] text-white/70">LOADING {Math.round(pct)}%</p><div className="h-[3px] bg-white/20"><div className="h-full bg-[#ffc14d] shadow-[0_0_10px_#ffc14d] transition-[width] duration-100" style={{ width: `${pct}%` }} /></div></>}
          </div>
        </div>
      </div>
      {phase === "flash" && <div className="flash" />}
    </>
  );
}
