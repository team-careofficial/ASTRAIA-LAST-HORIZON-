import { useEffect, useRef, useState } from "react";
import { game } from "@/game/engine/store";
import { initAudio, sfx } from "@/lib/utils/audio";
import { getMarsDataProvider } from "@/lib/nasa/provider";

/** Short, clean intro on the same photo as the home screen, so nothing "changes" when the menu appears.
 *  One tap is needed because browsers only allow sound after a tap. */
export default function Boot() {
  const [phase, setPhase] = useState<"idle" | "load" | "leave">("idle"), [pct, setPct] = useState(0), timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const start = () => {
    if (phase !== "idle") return;
    initAudio(); game.audioReady(); sfx("notify"); setPhase("load");
    game.markReady("missions"); getMarsDataProvider().getSnapshot().catch(() => null).finally(() => game.markReady("telemetry"));
    let p = 0; const tick = () => {
      p = Math.min(100, p + 10 + Math.random() * 14); setPct(p);
      if (p < 100) timers.current.push(setTimeout(tick, 110));
      else timers.current.push(setTimeout(() => { setPhase("leave"); timers.current.push(setTimeout(() => game.go("menu"), 650)); }, 220));
    };
    tick();
  };
  return (
    <div className={`fixed inset-0 z-50 grid place-items-center overflow-hidden text-center transition-opacity duration-[650ms] ${phase === "leave" ? "pointer-events-none opacity-0" : ""}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,.55),rgba(0,0,0,.2)_70%)]" />
      <div className="relative px-6">
        <p className="lb-in font-data text-[10px] tracking-[0.4em] text-[#e8a45a]" style={{ animationDelay: ".1s" }}>NASA SPACE APPS 2026</p>
        <h1 className="lb-in mt-2 font-display text-[clamp(2.6rem,10vw,6rem)] leading-none tracking-[0.14em]" style={{ animationDelay: ".25s", textShadow: "0 6px 44px rgba(0,0,0,.7)" }}>ASTRAIA</h1>
        <div className="lb-in mt-3 flex items-center justify-center gap-3" style={{ animationDelay: ".4s" }}><i className="h-px w-10 bg-[#e8a45a]" /><p className="font-ui text-[13px] font-semibold tracking-[0.6em] text-white/85 sm:text-lg sm:tracking-[0.8em]">LAST HORIZON</p><i className="h-px w-10 bg-[#e8a45a]" /></div>
        <div className="mt-9 h-14">
          {phase === "idle" ? <button onClick={start} autoFocus className="lb-in lb-play relative bg-[#e8a45a] px-10 py-3 font-ui text-base font-extrabold tracking-[0.28em] text-black shadow-[0_0_34px_rgba(232,164,90,.4)] [clip-path:polygon(14px_0,100%_0,calc(100%-14px)_100%,0_100%)] transition-transform hover:-translate-y-0.5 active:scale-[.97]" style={{ animationDelay: ".7s" }}>TAP TO START</button>
            : <div className="mx-auto w-56"><div className="h-[3px] rounded-full bg-white/20"><div className="h-full rounded-full bg-[#e8a45a] transition-[width] duration-150" style={{ width: `${pct}%` }} /></div><p className="mt-2 font-data text-[10px] tracking-[0.3em] text-white/60">LOADING MISSION SYSTEMS</p></div>}
        </div>
      </div>
    </div>
  );
}
