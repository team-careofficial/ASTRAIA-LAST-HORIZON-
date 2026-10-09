import { useEffect, useRef, useState } from "react";
export function useAnimatedNumber(target: number, ms = 600): number {
  const [v, setV] = useState(target); const from = useRef(target);
  useEffect(() => {
    const start = performance.now(), a = from.current; let raf = 0;
    const step = (t: number) => { const p = Math.min(1, (t - start) / ms); const n = a + (target - a) * p; from.current = n; setV(n); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
