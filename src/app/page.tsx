"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { game, useGame } from "@/game/engine/store";
import Boot from "@/components/game/Boot";
import Menu from "@/components/game/Menu";
import Hud from "@/components/game/Hud";
import Pause, { ModePause } from "@/components/game/Pause";
import GuideHost from "@/components/guide/GuidePanel";
import Manual from "@/components/guide/Manual";
import { guide } from "@/game/guide/store";
import { RoverHud, FlightHud } from "@/components/game/ModeHuds";
import Result from "@/components/game/Result";
import { Destination, Design, Launch } from "@/components/game/Design";
import Fun from "@/components/game/Fun";
import { Report } from "@/components/game/Report";
import { Archive, Science, SettingsPage, Modes, Briefing } from "@/components/game/Pages";

const GameCanvas = dynamic(() => import("@/components/world/GameCanvas"), { ssr: false });
export default function Page() {
  const screen = useGame(s => s.screen), paused = useGame(s => s.paused), scale = useGame(s => s.settings.uiScale);
  useEffect(() => { game.hydrate(); guide.hydrate(); }, []);
  return (
    <main className="fixed inset-0 overflow-hidden bg-black" style={{ zoom: scale }}>
      <GameCanvas />
      {screen === "boot" && <Boot />}{screen === "menu" && <Menu />}{screen === "archive" && <Archive />}{screen === "science" && <Science />}
      {screen === "settings" && <SettingsPage />}{screen === "modes" && <Modes />}{screen === "fun" && <Fun />}{screen === "manual" && <Manual />}<GuideHost />{screen === "destination" && <Destination />}{screen === "design" && <Design />}{screen === "launch" && <Launch />}{screen === "report" && <Report />}{screen === "rover" && <RoverHud />}{screen === "flight" && <FlightHud />}{(screen === "rover" || screen === "flight") && paused && <ModePause />}{screen === "briefing" && <Briefing />}
      {screen === "play" && <Hud />}{screen === "play" && paused && <Pause />}{screen === "result" && <Result />}
    </main>
  );
}
