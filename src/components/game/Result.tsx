import { game, useGame } from "@/game/engine/store";
import { MISSIONS } from "@/data/world/missions";
import Btn from "@/components/ui/Btn";
import Confetti from "@/components/ui/Confetti";

export default function Result() {
  const s = useGame(x => x), m = MISSIONS[s.mission], c = s.completed[m.id], next = MISSIONS[s.mission + 1], r = s.r;
  const rows: [string, string][] = [["Oxygen", `${Math.round(r.oxygen)}%`], ["Power", `${Math.round(r.power)}%`], ["Comms", `${Math.round(r.comms)}%`], ["Habitat", `${Math.round(r.habitat)}%`], ["Science", `${Math.round(r.science)}%`], ["Crew health", `${Math.round(s.crew.reduce((a, x) => a + x.health, 0) / 4)}%`], ["Crew stress", `${Math.round(s.crew.reduce((a, x) => a + x.stress, 0) / 4)}%`], ["Mission time", `${Math.floor(r.minutes / 60)}h ${r.minutes % 60}m`]];
  const picks = s.history.filter(h => h.m === m.id);
  return (
    <div className="fade-in fixed inset-0 z-40 grid place-items-center overflow-auto bg-black/70 p-4">{!s.failed && <Confetti />}<div className="gp w-full max-w-xl p-6">
      <h1 className={`font-display text-2xl tracking-[0.2em] ${s.failed ? "text-[#e5533a]" : ""}`}>{s.failed ? "MISSION FAILED" : "MISSION COMPLETE"}</h1>
      <p className="font-data text-xs tracking-widest text-[#e8a45a]">MISSION {String(m.id).padStart(2, "0")} · {m.title}{c && !s.failed ? ` · ${c.rating}` : ""}</p>
      <dl className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{rows.map(([k, v]) => <div key={k}><dt className="font-data text-[10px] tracking-widest text-white/50">{k.toUpperCase()}</dt><dd className="text-lg">{v}</dd></div>)}</dl>
      <ul className="mb-3 max-h-28 space-y-1 overflow-auto text-xs text-white/70">{picks.map((p, i) => <li key={i}>[{p.tag}] {p.choice}</li>)}</ul>
      {s.failed ? <p className="mb-4 text-sm text-white/80">The crew could not keep life support running. Review your decisions and try again.</p> : <p className="mb-4 text-sm text-white/80">+{s.gain} XP · Level {s.level}. {next ? `Mission ${String(next.id).padStart(2, "0")} · ${next.title} is unlocked.` : "Missions 06 to 10 are work in progress."}</p>}
      <div className="flex flex-wrap gap-2">
        {s.failed ? <Btn main onClick={() => game.brief(s.mission)}>RETRY MISSION</Btn> : next && <Btn main onClick={() => game.brief(s.mission + 1)}>NEXT MISSION</Btn>}
        <Btn onClick={() => game.go("archive")}>ARCHIVE</Btn><Btn onClick={() => game.go("menu")}>MENU</Btn></div></div></div>
  );
}
