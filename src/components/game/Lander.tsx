import { useEffect, useRef, useState } from "react";
import { fun, useFun } from "@/game/fun/store";
import Btn from "@/components/ui/Btn";
import Confetti from "@/components/ui/Confetti";
import { sfx } from "@/lib/utils/audio";

const W = 640, H = 400, MW = 160; // 160 m wide world, 4 px per metre
const K = W / MW;
type World = "moon" | "mars";
const G: Record<World, number> = { moon: 1.62, mars: 3.71 };
const XP: Record<World, number> = { moon: 15, mars: 25 };
interface Sim { x: number; y: number; vx: number; vy: number; a: number; fuel: number; thrust: boolean; state: "fly" | "won" | "lost"; msg: string; pad: [number, number]; ground: number[]; t: number }
function makeSim(): Sim {
  const pad0 = 30 + Math.random() * 90, pw = 18, ground: number[] = [];
  for (let i = 0; i <= MW; i++) { const base = 22 + 9 * Math.sin(i * 0.11 + pad0) + 5 * Math.sin(i * 0.31); ground.push(base); }
  const py = ground[Math.round(pad0)] ?? 24;
  for (let i = 0; i <= MW; i++) if (i >= pad0 - 2 && i <= pad0 + pw + 2) ground[i] = py;
  return { x: 15 + Math.random() * 20, y: 95, vx: 5 + Math.random() * 3, vy: 0, a: 0, fuel: 100, thrust: false, state: "fly", msg: "", pad: [pad0, pad0 + pw], ground, t: 0 };
}
const groundAt = (s: Sim, x: number) => { const i = Math.max(0, Math.min(MW - 1, Math.floor(x))), f = x - i; return s.ground[i] * (1 - f) + s.ground[i + 1] * f; };

export default function Lander() {
  const [world, setWorld] = useState<World>("moon"), [hud, setHud] = useState({ vy: 0, vx: 0, fuel: 100, a: 0 }), [res, setRes] = useState<null | { ok: boolean; msg: string; score: number }>(null), [round, setRound] = useState(0);
  const cv = useRef<HTMLCanvasElement>(null), keys = useRef({ l: false, r: false, t: false }), best = useFun(s => s.best), landed = useFun(s => s.landed);
  useEffect(() => {
    const c = cv.current; if (!c) return; const g = c.getContext("2d"); if (!g) return;
    const s = makeSim(); setRes(null);
    const stars = Array.from({ length: 60 }, () => [Math.random() * W, Math.random() * H * 0.8, Math.random() * 1.5 + 0.3]);
    const col = world === "moon" ? { sky: "#06070b", gr: "#8a8a90", gr2: "#4a4a50" } : { sky: "#1a0d09", gr: "#b0603c", gr2: "#5a2a18" };
    let raf = 0, last = performance.now(), acc = 0;
    const kd = (e: KeyboardEvent, v: boolean) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.current.l = v; else if (e.code === "ArrowRight" || e.code === "KeyD") keys.current.r = v;
      else if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") { keys.current.t = v; if (e.code === "Space") e.preventDefault(); }
    };
    const dn = (e: KeyboardEvent) => kd(e, true), up = (e: KeyboardEvent) => kd(e, false);
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    const finish = () => {
      const ok = Math.abs(s.vy) < 4 && Math.abs(s.vx) < 3 && Math.abs(s.a) < 0.3 && s.x > s.pad[0] && s.x < s.pad[1];
      s.state = ok ? "won" : "lost";
      if (ok) { const score = Math.round(100 + s.fuel * 3 + (4 - Math.abs(s.vy)) * 25 + (3 - Math.abs(s.vx)) * 10); s.msg = "Soft landing!"; fun.landed(world, score); fun.xp(XP[world]); sfx("ok"); setRes({ ok, msg: `Soft landing on ${world === "moon" ? "the Moon" : "Mars"}! +${XP[world]} XP`, score }); }
      else { const why = s.x <= s.pad[0] || s.x >= s.pad[1] ? "You missed the landing pad." : Math.abs(s.vy) >= 4 ? "Too fast! Keep vertical speed under 4 m/s." : Math.abs(s.vx) >= 3 ? "Too much sideways speed (under 3 m/s)." : "Tilted too much — land upright."; sfx("fail"); setRes({ ok, msg: why, score: 0 }); }
    };
    const step = (dt: number) => {
      const k = keys.current; s.t += dt;
      if (k.l) s.a -= 1.9 * dt; if (k.r) s.a += 1.9 * dt;
      s.a = Math.max(-1.2, Math.min(1.2, s.a));
      s.thrust = k.t && s.fuel > 0;
      let ax = 0, ay = -G[world];
      if (s.thrust) { ax += Math.sin(s.a) * 8.5; ay += Math.cos(s.a) * 8.5; s.fuel = Math.max(0, s.fuel - 9 * dt); }
      s.vx += ax * dt; s.vy += ay * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.x < 0 || s.x > MW) { s.x = Math.max(0, Math.min(MW, s.x)); s.vx = 0; }
      if (s.y > 110) { s.y = 110; s.vy = Math.min(0, s.vy); }
      if (s.y <= groundAt(s, s.x) + 1.6) { s.y = groundAt(s, s.x) + 1.6; finish(); }
    };
    const draw = () => {
      g.fillStyle = col.sky; g.fillRect(0, 0, W, H);
      g.fillStyle = "#fff"; for (const [x, y, r] of stars) { g.globalAlpha = 0.4 + r / 3; g.fillRect(x, y, r, r); } g.globalAlpha = 1;
      g.beginPath(); g.moveTo(0, H); for (let i = 0; i <= MW; i++) g.lineTo(i * K, H - s.ground[i] * K); g.lineTo(W, H); g.closePath();
      const gr = g.createLinearGradient(0, H - 150, 0, H); gr.addColorStop(0, col.gr); gr.addColorStop(1, col.gr2); g.fillStyle = gr; g.fill();
      const py = H - groundAt(s, s.pad[0] + 1) * K; g.fillStyle = "#8fbf8a"; g.fillRect(s.pad[0] * K, py - 3, (s.pad[1] - s.pad[0]) * K, 5);
      g.fillStyle = "#f2e6c9"; g.font = "bold 11px monospace"; g.fillText("LAND HERE", s.pad[0] * K + 12, py - 10);
      if (s.state !== "lost") {
        g.save(); g.translate(s.x * K, H - s.y * K); g.rotate(s.a);
        if (s.thrust) { g.fillStyle = "#ffb347"; g.beginPath(); g.moveTo(-5, 8); g.lineTo(0, 16 + Math.random() * 14); g.lineTo(5, 8); g.fill(); }
        g.strokeStyle = "#c8c8d0"; g.lineWidth = 2; g.beginPath(); g.moveTo(-9, 12); g.lineTo(-6, 4); g.moveTo(9, 12); g.lineTo(6, 4); g.stroke();
        g.fillStyle = "#e8e2d0"; g.fillRect(-8, -6, 16, 11); g.fillStyle = "#e8a45a"; g.beginPath(); g.arc(0, -8, 6, Math.PI, 0); g.fill();
        g.restore();
      } else { g.fillStyle = "#e5533a"; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; g.fillRect(s.x * K + Math.cos(a) * 14, H - s.y * K + Math.sin(a) * 14, 4, 4); } }
    };
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; acc += dt;
      if (s.state === "fly") step(dt);
      draw();
      if (acc > 0.1) { acc = 0; setHud({ vy: s.vy, vx: s.vx, fuel: s.fuel, a: s.a }); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); keys.current = { l: false, r: false, t: false }; };
  }, [world, round]);
  const hold = (k: "l" | "r" | "t") => ({ onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); keys.current[k] = true; }, onPointerUp: () => { keys.current[k] = false; }, onPointerLeave: () => { keys.current[k] = false; }, onPointerCancel: () => { keys.current[k] = false; } });
  const safeV = Math.abs(hud.vy) < 4, safeH = Math.abs(hud.vx) < 3;
  return (
    <div>
      {res?.ok && <Confetti />}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["moon", "mars"] as World[]).map(w => <Btn key={w} main={world === w} onClick={() => setWorld(w)}>{w === "moon" ? "MOON · g 1.62" : "MARS · g 3.71"}</Btn>)}
        <span className="ml-auto font-data text-[10.5px] tracking-widest text-white/50">BEST {best[world]} · LANDINGS {landed[world]}</span>
      </div>
      <div className="relative mx-auto max-w-3xl">
        <canvas ref={cv} width={W} height={H} className="gp w-full" style={{ touchAction: "none" }} aria-label="Lander game" />
        <div className="gp pointer-events-none absolute left-2 top-2 p-2 font-data text-[11px] leading-5">
          <p className={safeV ? "text-[#8fbf8a]" : "text-[#e5533a]"}>V-SPEED {Math.abs(hud.vy).toFixed(1)} m/s</p>
          <p className={safeH ? "text-[#8fbf8a]" : "text-[#e5533a]"}>H-SPEED {Math.abs(hud.vx).toFixed(1)} m/s</p>
          <p>FUEL {hud.fuel.toFixed(0)}%</p>
        </div>
        {res && <div className="fade-in absolute inset-0 grid place-items-center bg-black/55"><div className="gp max-w-xs p-5 text-center">
          <p className={`font-display text-sm tracking-[0.2em] ${res.ok ? "text-[#8fbf8a]" : "text-[#e5533a]"}`}>{res.ok ? "TOUCHDOWN!" : "CRASHED"}</p>
          <p className="mt-2 text-[15px]">{res.msg}</p>{res.ok && <p className="mt-1 font-data text-[12px] text-[#e8a45a]">SCORE {res.score}</p>}
          <div className="mt-4"><Btn main onClick={() => setRound(r => r + 1)}>{res.ok ? "PLAY AGAIN" : "TRY AGAIN"}</Btn></div></div></div>}
      </div>
      <div className="mx-auto mt-3 flex max-w-3xl items-center justify-center gap-3 select-none">
        <button className="gbtn !px-6 !py-4 text-lg" aria-label="Rotate left" {...hold("l")}>◀</button>
        <button className="gbtn gbtn-main !px-8 !py-4 text-lg" aria-label="Thrust" {...hold("t")}>▲ THRUST</button>
        <button className="gbtn !px-6 !py-4 text-lg" aria-label="Rotate right" {...hold("r")}>▶</button>
      </div>
      <p className="mx-auto mt-3 max-w-3xl text-center text-[13px] text-white/60">Keys: ← → or A D to tilt · ↑ / W / Space to fire the engine. Land on the green pad, slowly (under 4 m/s down, 3 m/s sideways) and upright. Mars gravity is stronger than the Moon, so the same engine has to work harder. <span className="font-data text-[#9bb8d4]">[SIMULATED GAME]</span></p>
    </div>
  );
}
