import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import MarsWorld from "./MarsWorld";
import CrewSystem from "./CrewSystem";
import RoverScene from "./RoverScene";
import FlightScene from "./FlightScene";
import MenuScene from "./MenuScene";
import { cam } from "./camera";
import { game, useGame } from "@/game/engine/store";
import { usePreview } from "@/game/engine/preview";

const MENU_SCREENS = ["boot", "menu", "archive", "science", "settings", "manual", "destination", "design", "launch", "report", "modes", "fun"];
export default function GameCanvas() {
  const q = useGame(s => s.settings.quality), screen = useGame(s => s.screen), dest = useGame(s => s.destination), pv = usePreview();
  const mode = screen === "rover" ? "rover" : screen === "flight" ? "flight" : MENU_SCREENS.includes(screen) ? "menu" : "world", moon = (pv ?? dest) === "moon";
  return (
    <div className="absolute inset-0" onPointerMove={e => { if (e.buttons & 1 && (game.get().screen === "play" || game.get().screen === "rover") && !game.get().paused) { const st = game.get().settings, k = st.sens; cam.yaw -= e.movementX * 0.005 * k; cam.pitch = Math.min(1, Math.max(0.12, cam.pitch + e.movementY * 0.003 * k * (st.invert ? -1 : 1))); } }}
      onWheel={e => { cam.dist = Math.min(14, Math.max(4, cam.dist + e.deltaY * 0.005)); }}>
      <Canvas key={`${q}-${mode}-${mode === "menu" ? moon : ""}`} shadows={q !== "low"} dpr={q === "ultra" ? [1, 2] : q === "high" ? [1, 1.75] : q === "medium" ? [1, 1.25] : 1} camera={{ fov: mode === "menu" ? 42 : 50, position: [0, 6, 24], near: 0.2, far: 3000 }} gl={{ antialias: q === "high" || q === "ultra", powerPreference: "high-performance" }}>
        <Suspense fallback={null}>{mode === "rover" ? <RoverScene quality={q} /> : mode === "flight" ? <FlightScene /> : mode === "menu" ? <MenuScene quality={q} moon={moon} /> : <><MarsWorld quality={q} /><CrewSystem /></>}</Suspense>
      </Canvas>
      {mode === "menu" && <div key={String(moon)} className="wipe" />}
    </div>
  );
}
