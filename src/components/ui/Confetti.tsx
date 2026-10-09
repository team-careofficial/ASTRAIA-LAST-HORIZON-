import { useMemo } from "react";
const COLORS = ["#e8a45a", "#9bb8d4", "#8fbf8a", "#e5533a", "#f2e6c9", "#c77dff"];
export default function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => ({ i, left: Math.random() * 100, dx: (Math.random() - 0.5) * 240, d: 2.4 + Math.random() * 2.2, delay: Math.random() * 0.8, c: COLORS[i % COLORS.length] })), [count]);
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">{pieces.map(p => <i key={p.i} className="confetti-piece" style={{ left: `${p.left}%`, background: p.c, animationDuration: `${p.d}s`, animationDelay: `${p.delay}s`, ["--dx" as string]: `${p.dx}px` }} />)}</div>;
}
