import { useEffect, useRef } from "react";
import type { Screen } from "@/types/world";

/** Photographic backdrop for menu-type screens: slow camera drift, drifting dust, warm light shafts, grain. CSS and one small canvas. */
const SCENES = {
  mars: { src: "/images/scenes/mars-key.jpg", blur: 0, dim: 0.28 },
  hangar: { src: "/images/scenes/hangar.jpg", blur: 5, dim: 0.5 },
  control: { src: "/images/scenes/control.jpg", blur: 4, dim: 0.45 },
} as const;
export type SceneId = keyof typeof SCENES;
export const SCENE_FOR: Partial<Record<Screen, SceneId>> = {
  menu: "mars", archive: "mars", science: "mars", settings: "mars", modes: "mars", fun: "mars", manual: "mars", credits: "mars", destination: "mars",
  design: "hangar", closure: "control", report: "control",
};

function Dust() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current, c = cv?.getContext("2d");
    if (!cv || !c || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let W = 0, H = 0, raf = 0;
    const size = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    size(); window.addEventListener("resize", size);
    const P = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: 0.5 + Math.random() * 1.8, s: 0.02 + Math.random() * 0.07, a: 0.1 + Math.random() * 0.35 }));
    const loop = () => {
      c.clearRect(0, 0, W, H);
      for (const p of P) { p.x += p.s * 0.004; p.y -= p.s * 0.0015; if (p.x > 1) p.x = 0; if (p.y < 0) p.y = 1; c.fillStyle = `rgba(255,200,140,${p.a})`; c.beginPath(); c.arc(p.x * W, p.y * H, p.r, 0, 7); c.fill(); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

export default function Backdrop({ scene }: { scene: SceneId }) {
  const s = SCENES[scene];
  return (
    <div className="bd-root pointer-events-none fixed inset-0 z-30 overflow-hidden bg-black" aria-hidden="true">
      <div key={scene} className="bd-fade absolute inset-0">
        <div className="bd-img absolute -inset-[6%]" style={{ backgroundImage: `url(${s.src})`, filter: s.blur ? `blur(${s.blur}px) saturate(1.05)` : undefined }} />
        <div className="absolute inset-0" style={{ background: `rgba(8,6,5,${s.dim})` }} />
        <div className="bd-shafts absolute inset-0" />
      </div>
      <Dust /><div className="vignette" /><div className="grain" />
    </div>
  );
}
