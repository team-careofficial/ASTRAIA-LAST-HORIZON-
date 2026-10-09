import { useState } from "react";
import { Play, ListChecks, Gamepad2, Settings, RotateCcw, LogOut } from "lucide-react";
import { game, useGame } from "@/game/engine/store";
import { MISSIONS } from "@/data/world/missions";
import Btn from "@/components/ui/Btn";
import { SettingsPanel } from "./Pages";

export default function Pause() {
  const panel = useGame(s => s.pausePanel), mi = useGame(s => s.mission), step = useGame(s => s.step), m = MISSIONS[mi];
  return (
    <div className="fade-in fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Paused">
      <div className="w-full max-w-md"><h1 className="mb-4 font-display text-xl tracking-[0.3em]">PAUSED</h1>
        {!panel ? <nav className="flex flex-col gap-2">
          <Btn main icon={<Play size={16} />} onClick={game.togglePause}>RESUME</Btn>
          <Btn icon={<ListChecks size={16} />} onClick={() => game.setPausePanel("objectives")}>MISSION OBJECTIVES</Btn>
          <Btn icon={<Gamepad2 size={16} />} onClick={() => game.setPausePanel("controls")}>CONTROLS</Btn>
          <Btn icon={<Settings size={16} />} onClick={() => game.setPausePanel("settings")}>SETTINGS</Btn>
          <Btn icon={<RotateCcw size={16} />} onClick={game.restart}>RESTART MISSION</Btn>
          <Btn icon={<LogOut size={16} />} onClick={game.quit}>QUIT TO MENU</Btn></nav> : <>
          {panel === "objectives" && <div className="gp p-4"><h2 className="mb-2 font-data text-xs tracking-widest text-[#e8a45a]">MISSION {m.id} · {m.title}</h2><ul className="space-y-1 text-sm">{m.steps.map((s, i) => <li key={s.id} className={i < step ? "text-white/45" : ""}>{i < step ? "✓" : i === step ? "▸" : "○"} {s.objective}</li>)}</ul></div>}
          {panel === "controls" && <div className="gp p-4 text-sm leading-7">WASD / Arrows: move · Shift: run · E: interact<br />1 Eva · 2 Sarah · 3 Ben · 4 Liam · Tab: next crew<br />Drag: camera · Wheel: zoom · Esc: pause</div>}
          {panel === "settings" && <SettingsPanel />}
          <div className="mt-3"><Btn onClick={() => game.setPausePanel(null)}>BACK</Btn></div></>}
      </div>
    </div>
  );
}
export function ModePause() {
  const [panel, setPanel] = useState<null | "controls" | "settings">(null);
  return (
    <div className="fade-in fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Paused"><div className="w-full max-w-md"><h1 className="mb-4 font-display text-xl tracking-[0.3em]">PAUSED</h1>
      {!panel ? <nav className="flex flex-col gap-2"><Btn main icon={<Play size={16} />} onClick={game.togglePause}>RESUME</Btn><Btn icon={<Gamepad2 size={16} />} onClick={() => setPanel("controls")}>CONTROLS</Btn>
        <Btn icon={<Settings size={16} />} onClick={() => setPanel("settings")}>SETTINGS</Btn><Btn icon={<LogOut size={16} />} onClick={() => game.go("modes")}>QUIT TO MODES</Btn></nav> : <>
        {panel === "controls" ? <div className="gp p-4 text-sm leading-7">Rover: WASD drive · Shift boost · Space brake · F solar wings · E hold to scan · T transmit · L lights · V view · C brush<br />Flight: W/S thrust · A/D yaw · R/F pitch · Q/E roll · Shift boost · Space brake · X assist · V view<br />Drag: camera · Wheel: zoom · Esc: pause</div> : <SettingsPanel />}
        <div className="mt-3"><Btn onClick={() => setPanel(null)}>BACK</Btn></div></>}</div></div>
  );
}
