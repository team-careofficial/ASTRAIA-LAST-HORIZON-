import { game } from "@/game/engine/store";
import { guide } from "@/game/guide/store";
import { Hint } from "@/components/ui/KeyCap";
import Btn from "@/components/ui/Btn";
export default function Welcome() {
  const done = (guided: boolean) => { game.setSetting({ seenIntro: true, guided }); guide.setOpen(guided); };
  return (
    <div className="fade-in fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Welcome"><div className="gp w-full max-w-lg p-6">
      <h1 className="font-display text-xl tracking-[0.2em]">WELCOME, MISSION SPECIALIST</h1>
      <p className="mt-2 text-sm text-white/75">Design a mission, launch, then explore. Your choices have consequences, and the Mission Guide explains why.</p>
      <div className="my-4 grid gap-2"><Hint keys={["W", "A", "S", "D"]} label="MOVE / DRIVE" /><Hint keys={["Shift"]} label="RUN / BOOST" /><Hint keys={["E"]} label="INTERACT / SCAN" /><Hint keys={["Tab"]} label="SWITCH CREW" /><Hint keys={["Esc"]} label="PAUSE" /><Hint keys={["H"]} label="MISSION GUIDE" /></div>
      <div className="flex flex-wrap gap-2"><Btn main onClick={() => done(true)}>GUIDED EXPERIENCE</Btn><Btn onClick={() => done(false)}>STANDARD EXPERIENCE</Btn></div></div></div>
  );
}
