/** Canvas launch / failure / transfer animation for the Mission Closure screen. Returns a cancel function. */
import type { Closure } from "@/compute/closure";

export interface FlyText { transfer: string; target: string; ms: string; verdict: string }
export function runFly(cv: HTMLCanvasElement, res: Closure, capOver: boolean, tx: FlyText, mars: boolean): () => void {
  const c = cv.getContext("2d");
  if (!c) return () => {};
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = window.innerWidth, H = window.innerHeight;
  cv.width = W * dpr; cv.height = H * dpr; c.scale(dpr, dpr);
  type P = { x: number; y: number; vx: number; vy: number; life: number; k: "flame" | "steam" | "foil" };
  type Piece = { x: number; y: number; vx: number; vy: number; a: number; va: number; w: number; h: number; col: string };
  let parts: P[] = [], pieces: Piece[] | null = null, broke = false, last = 0, raf = 0, stopped = false;
  const t0 = performance.now(), groundY = H * 0.78, padX = W * 0.5, failing = !res.closes && !capOver;
  const spawn = (x: number, y: number, n: number, k: P["k"]) => { for (let i = 0; i < n; i++) parts.push({ x: x + (Math.random() - .5) * 10, y, vx: (Math.random() - .5) * (k === "steam" ? 90 : 30), vy: (k === "steam" ? -20 : 90) + Math.random() * 120, life: 1, k }); };
  const bg = (top: boolean) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top ? "#0d1117" : "#15212c"); g.addColorStop(.7, top ? "#1a1410" : "#6a3a22"); g.addColorStop(1, "#25130B"); c.fillStyle = g; c.fillRect(0, 0, W, H); };
  const rocket = (x: number, y: number, shake: number) => { c.save(); c.translate(x + shake, y); c.fillStyle = "#e9dcc4"; c.fillRect(-9, -90, 18, 90); c.fillStyle = "#944921"; c.fillRect(-9, -90, 18, 12); c.beginPath(); c.moveTo(-9, -90); c.lineTo(0, -112); c.lineTo(9, -90); c.fill(); c.fillStyle = "#4B2515"; c.fillRect(-12, -14, 24, 14); c.restore(); };
  const transfer = (u: number) => {
    bg(true); const ex = W * .2, ey = H * .6, x2 = W * .8, y2 = H * .35, cx = W * .45, cy = H * .12;
    c.fillStyle = "#2b5b78"; c.beginPath(); c.arc(ex, ey, 34, 0, 7); c.fill();
    c.fillStyle = mars ? "#944921" : "#9a9a9a"; c.beginPath(); c.arc(x2, y2, 20, 0, 7); c.fill();
    c.setLineDash([6, 8]); c.strokeStyle = "#7FD6E8"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ex, ey); c.quadraticCurveTo(cx, cy, x2, y2); c.stroke(); c.setLineDash([]);
    const k = Math.min(1, u / 5), px = (1 - k) * (1 - k) * ex + 2 * (1 - k) * k * cx + k * k * x2, py = (1 - k) * (1 - k) * ey + 2 * (1 - k) * k * cy + k * k * y2;
    c.fillStyle = "#DBA671"; c.beginPath(); c.arc(px, py, 5, 0, 7); c.fill();
    c.fillStyle = "#9A755E"; c.font = "500 12px monospace"; c.fillText(`${tx.transfer} · ${tx.target} · ${tx.ms}`, W * .2, H * .12);
  };
  const frame = (now: number) => {
    if (stopped) return;
    const s = (now - t0) / 1000, slow = failing ? 0.35 : 1, ss = s * slow;
    c.clearRect(0, 0, W, H);
    if (res.closes && s > 5) { transfer(s - 5); if (s < 11) raf = requestAnimationFrame(frame); return; }
    bg(false); c.fillStyle = "#25130B"; c.fillRect(0, groundY, W, H - groundY); c.fillStyle = "#4B2515"; c.fillRect(padX - 50, groundY - 4, 100, 6);
    let y = groundY - 4, shake = 0;
    if (capOver) { shake = s > 1 ? Math.sin(s * 60) * Math.min(3, (s - 1) * 2) : 0; if (s > 1) { spawn(padX, groundY, 3, "steam"); spawn(padX, groundY - 2, 3, "flame"); } }
    else { const lift = Math.max(0, ss - 1); y = groundY - 4 - 0.5 * 90 * lift * lift; if (ss > 0.8) { spawn(padX, Math.min(groundY - 2, y), 4, "flame"); if (y > groundY - 120) spawn(padX, groundY, 3, "steam"); } }
    if (failing && !broke && ss > 2.1) {
      broke = true; const bx = padX, by = y - 40;
      pieces = [0, 1, 2, 3].map(i => ({ x: bx, y: by + (i - 1.5) * 18, vx: (i - 1.5) * 26, vy: -20 + Math.random() * 20, a: 0, va: (Math.random() - .5) * 2, w: 18, h: 22, col: i === 0 ? "#DBA671" : "#e9dcc4" }));
      for (let i = 0; i < 40; i++) parts.push({ x: bx, y: by, vx: (Math.random() - .5) * 160, vy: (Math.random() - .5) * 160, life: 1, k: "foil" });
    }
    const dt = Math.min(.05, (now - last) / 1000 || .016); last = now; const sdt = dt * slow;
    parts = parts.filter(p => p.life > 0);
    parts.forEach(p => {
      p.x += p.vx * sdt; p.y += p.vy * sdt; p.life -= sdt * (p.k === "foil" ? .25 : p.k === "steam" ? .5 : 1.4); const al = Math.max(0, p.life);
      c.fillStyle = p.k === "flame" ? `rgba(255,${(150 + 80 * al) | 0},60,${al})` : p.k === "steam" ? `rgba(233,220,196,${al * .35})` : `rgba(219,166,113,${al})`;
      const r = p.k === "steam" ? 10 + (1 - al) * 18 : p.k === "foil" ? 2.5 : 4 + al * 5; c.beginPath(); c.arc(p.x, p.y, r, 0, 7); c.fill();
    });
    if (pieces) {
      pieces.forEach(p => { p.x += p.vx * sdt; p.y += p.vy * sdt; p.vy += 10 * sdt; p.a += p.va * sdt; c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = p.col; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore(); });
      const bp = pieces[0], lx = bp.x + 70, ly = bp.y - 80;
      c.strokeStyle = "#DBA671"; c.lineWidth = 1; c.beginPath(); c.moveTo(bp.x + 8, bp.y - 6); c.lineTo(lx, ly); c.lineTo(lx + 230, ly); c.stroke();
      c.fillStyle = "#e9dcc4"; c.font = "500 14px monospace"; c.fillText(tx.verdict, lx + 6, ly - 6);
    } else rocket(padX, y, shake);
    if (!res.closes && s > 12) return;
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => { stopped = true; cancelAnimationFrame(raf); };
}
