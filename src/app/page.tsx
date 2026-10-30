"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { game, useGame } from "@/game/engine/store";
import Boot from "@/components/game/Boot";
import Menu from "@/components/game/Menu";
import ModeSelect from "@/components/game/ModeSelect";
import Hud from "@/components/game/Hud";
import Pause, { ModePause } from "@/components/game/Pause";
import GuideHost from "@/components/guide/GuidePanel";
import Manual from "@/components/guide/Manual";
import { guide } from "@/game/guide/store";
import { RoverHud, FlightHud } from "@/components/game/ModeHuds";
import Result from "@/components/game/Result";
import { Destination, Design, Launch } from "@/components/game/Design";
import Closure from "@/components/game/Closure";
import Greenhouse from "@/components/game/Greenhouse";
import Classroom from "@/components/game/Classroom";
import TouchControls from "@/components/game/TouchControls";
import Backdrop, { SCENE_FOR } from "@/components/game/Backdrop";
import { Report } from "@/components/game/Report";
import { Archive, Science, SettingsPage, Modes, Briefing } from "@/components/game/Pages";

const GameCanvas = dynamic(() => import("@/components/world/GameCanvas"), { ssr: false });
export default function Page() {
  const screen = useGame(s => s.screen), paused = useGame(s => s.paused), scale = useGame(s => s.settings.uiScale), failed = useGame(s => s.failed);
  const [joinCode, setJoinCode] = useState<string | undefined>();
  useEffect(() => { game.hydrate(); guide.hydrate(); const m = window.location.hash.match(/^#c=(.+)$/); if (m) { setJoinCode(m[1]); game.go("classroom"); } }, []);
  return (
    <main className="fixed inset-0 overflow-hidden bg-black" style={{ zoom: scale }}>
      <GameCanvas />{(screen === "result" ? (failed ? "failure" : "mars") : SCENE_FOR[screen]) && <Backdrop scene={(screen === "result" ? (failed ? "failure" : "mars") : SCENE_FOR[screen])!} />}
      {screen === "boot" && <Boot />}{screen === "menu" && <Menu />}{screen === "modeselect" && <ModeSelect />}{screen === "archive" && <Archive />}{screen === "science" && <Science />}
      {screen === "settings" && <SettingsPage />}{screen === "modes" && <Modes />}{screen === "closure" && <Closure />}{screen === "greenhouse" && <Greenhouse />}{screen === "classroom" && <Classroom initialCode={joinCode} />}{screen === "manual" && <Manual />}<GuideHost />{screen === "destination" && <Destination />}{screen === "design" && <Design />}{screen === "launch" && <Launch />}{screen === "report" && <Report />}{screen === "rover" && <RoverHud />}{screen === "flight" && <FlightHud />}{(screen === "rover" || screen === "flight") && paused && <ModePause />}{screen === "briefing" && <Briefing />}
      {screen === "play" && <Hud />}{screen === "play" && paused && <Pause />}{screen === "result" && <Result />}
      <TouchControls />{(screen === "play" || screen === "rover" || screen === "flight") && <div className="rotate-hint" aria-hidden><span>⟳</span><p>Turn your phone sideways to play</p></div>}
    </main>
  );
}
