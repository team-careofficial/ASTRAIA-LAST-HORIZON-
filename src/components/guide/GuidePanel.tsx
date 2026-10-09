import { useEffect } from "react";
import { BookOpen, X } from "lucide-react";
import { guide, useGuide, contextEntry } from "@/game/guide/store";
import { game, useGame } from "@/game/engine/store";
import { useEx } from "@/game/explore/store";
import { ENTRY } from "@/data/knowledge/entries";
import Facts from "./Facts";
import Why from "./Why";

export default function GuideHost() {
  const screen = useGame(s => s.screen), open = useGuide(s => s.open), last = useGuide(s => s.last), show = ["play", "rover", "flight", "design"].includes(screen);
  useEffect(() => { const f = (e: KeyboardEvent) => { if (e.code === "KeyH" && !(e.target instanceof HTMLInputElement)) guide.toggle(); }; window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, []);
  if (!show) return null;
  const btn = screen === "design" ? "bottom-4 right-4" : "right-4 top-3";
  return <>
    <button onClick={guide.toggle} aria-pressed={open} className={`gp fixed z-50 flex items-center gap-2 px-3 py-1.5 font-data text-[10.5px] tracking-[0.2em] transition-colors hover:!border-[#e8a45a] ${open ? "!border-[#e8a45a] text-[#e8a45a]" : ""} ${btn}`}><BookOpen size={13} />? GUIDE <span className="text-white/35">[H]</span></button>
    {last && <div className="gp fade-in fixed left-1/2 top-3 z-50 -translate-x-1/2 px-3 py-1 font-data text-[10.5px] tracking-[0.2em] text-[#e8a45a]">{last}</div>}{open && <Panel />}</>;
}
function Panel() {
  const w = useGame(s => s), e = useEx(s => s), ex = useGuide(s => s.expanded), en = ENTRY[contextEntry(w, e)] ?? ENTRY["basics-mission"], pos = w.screen === "design" ? "bottom-16 right-4" : w.screen === "play" ? "left-4 top-[17rem]" : "right-4 top-14";
  return (
    <aside className={`gp screen-in fixed z-50 p-4 ${pos} ${ex ? "max-h-[62vh] w-[26rem] overflow-auto" : "w-80"}`} aria-label="Mission guide">
      <div className="mb-2 flex items-center justify-between font-data text-[10px] tracking-[0.25em] text-[#e8a45a]"><span>? MISSION GUIDE · {en.section}</span><button onClick={guide.toggle} aria-label="Close guide" className="text-white/50 hover:text-white"><X size={14} /></button></div>
      <h3 className="font-display text-[12px] tracking-[0.12em]">{en.title}</h3><p className="mt-2 text-[14px] leading-snug text-white/85">{en.short}</p>
      {ex && <><p className="mt-3 text-[13px] leading-snug text-white/65">{en.detail}</p><Facts facts={en.facts} /><p className="mt-3 text-[13px] text-[#e8a45a]">Why it matters:<Why text={en.why} /></p></>}
      <button onClick={() => guide.expand(!ex)} className="mt-3 font-data text-[10px] tracking-[0.2em] text-[#9bb8d4] underline-offset-4 hover:underline">{ex ? "COLLAPSE" : "LEARN MORE"}</button>
    </aside>
  );
}
export { game };
