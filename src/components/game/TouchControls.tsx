"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/engine/store";

// Touch layer: a virtual stick plus a few big buttons. It does not change any game logic.
// It sends the same keyboard events the game already listens for, so every scene works unchanged.
const fire = (type: "keydown" | "keyup", code: string) => window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
const tap = (code: string) => { fire("keydown", code); setTimeout(() => fire("keyup", code), 60); };

export function useCoarse() {
  const [c, setC] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(pointer: coarse)"), on = () => setC(m.matches || "ontouchstart" in window && window.innerWidth < 1100);
    on(); m.addEventListener("change", on); return () => m.removeEventListener("change", on);
  }, []);
  return c;
}

/** Small or touch screen: the game shows its slim HUD. */
export function useCompact() {
  const [c, setC] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(pointer: coarse), (max-height: 520px)"), on = () => setC(m.matches);
    on(); m.addEventListener("change", on); return () => m.removeEventListener("change", on);
  }, []);
  return c;
}
function Stick({ mode }: { mode: "walk" | "drive" | "fly" }) {
  const base = useRef<HTMLDivElement>(null), held = useRef(new Set<string>()), [knob, setKnob] = useState({ x: 0, y: 0 }), id = useRef<number | null>(null);
  const R = 46;
  const set = (code: string, on: boolean) => { const h = held.current; if (on && !h.has(code)) { h.add(code); fire("keydown", code); } if (!on && h.has(code)) { h.delete(code); fire("keyup", code); } };
  const release = () => { id.current = null; setKnob({ x: 0, y: 0 }); [...held.current].forEach(c => set(c, false)); };
  const move = (e: React.PointerEvent) => {
    if (id.current !== e.pointerId || !base.current) return;
    const r = base.current.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy) || 1, k = Math.min(1, R / d); dx *= k; dy *= k; setKnob({ x: dx, y: dy });
    const nx = dx / R, ny = dy / R, T = 0.34;
    set("KeyW", ny < -T); set("KeyS", ny > T); set("KeyA", nx < -T); set("KeyD", nx > T);
    if (mode === "walk") set("ShiftLeft", Math.hypot(nx, ny) > 0.92);
  };
  useEffect(() => () => release(), []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={base} className="tc-stick pointer-events-auto" onPointerDown={e => { id.current = e.pointerId; (e.target as HTMLElement).setPointerCapture(e.pointerId); move(e); }} onPointerMove={move} onPointerUp={release} onPointerCancel={release} onContextMenu={e => e.preventDefault()}>
      <div className="tc-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}
// Button that holds a key while pressed (boost, brake) or taps it once.
function B({ label, code, hold, cls = "", sub }: { label: string; code: string; hold?: boolean; cls?: string; sub?: string }) {
  const [on, setOn] = useState(false);
  return <button aria-label={sub ?? label} className={`tc-btn pointer-events-auto ${on ? "tc-on" : ""} ${cls}`}
    onPointerDown={e => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId); setOn(true); hold ? fire("keydown", code) : tap(code); }}
    onPointerUp={() => { setOn(false); if (hold) fire("keyup", code); }} onPointerCancel={() => { setOn(false); if (hold) fire("keyup", code); }} onContextMenu={e => e.preventDefault()}>
    <b>{label}</b>{sub && <i>{sub}</i>}</button>;
}

export default function TouchControls() {
  const coarse = useCoarse(), screen = useGame(s => s.screen), paused = useGame(s => s.paused), dialog = useGame(s => s.dialog), nearby = useGame(s => s.nearby);
  if (!coarse || !(screen === "play" || screen === "rover" || screen === "flight")) return null;
  const mode = screen === "play" ? "walk" : screen === "rover" ? "drive" : "fly";
  return (
    <div className="tc-root pointer-events-none fixed inset-0 z-40 select-none" style={{ touchAction: "none" }}>
      <button aria-label="Pause" className="tc-pause pointer-events-auto" onClick={() => tap("Escape")}>❚❚</button>
      {!paused && !(mode === "walk" && dialog) && <>
        <div className="tc-left"><Stick mode={mode} /></div>
        <div className="tc-right">
          {mode === "walk" && <>
            <B label="E" code="KeyE" cls={nearby ? "tc-hot tc-big" : "tc-big"} sub="ACT" />
            
          </>}
          {mode === "drive" && <>
            <B label="E" code="KeyE" hold cls="tc-big tc-hot" sub="SCAN" />
            <B label="⚡" code="ShiftLeft" hold sub="BOOST" /><B label="■" code="Space" hold sub="BRAKE" />
            <B label="T" code="KeyT" sub="SEND" cls="tc-sm" /><B label="F" code="KeyF" sub="WINGS" cls="tc-sm" /><B label="L" code="KeyL" sub="LIGHT" cls="tc-sm" /><B label="V" code="KeyV" sub="CAM" cls="tc-sm" /><B label="C" code="KeyC" sub="CLEAN" cls="tc-sm" />
          </>}
          {mode === "fly" && <>
            <B label="▲" code="KeyR" hold sub="PITCH" /><B label="▼" code="KeyF" hold sub="PITCH" />
            <B label="↶" code="KeyQ" hold sub="ROLL" /><B label="↷" code="KeyE" hold sub="ROLL" />
            <B label="■" code="Space" hold sub="BRAKE" /><B label="V" code="KeyV" sub="CAM" cls="tc-sm" /><B label="X" code="KeyX" sub="ASSIST" cls="tc-sm" />
          </>}
        </div>
      </>}
    </div>
  );
}
