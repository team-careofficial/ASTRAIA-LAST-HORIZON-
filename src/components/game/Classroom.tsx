import { useEffect, useState } from "react";
import { Copy, Download } from "lucide-react";
import { game } from "@/game/engine/store";
import { LAUNCHERS, PROPELLANTS, TARGETS } from "@/data/real/missionData";
import { encode, decode, entriesFor, rank, toCsv, setActiveChallenge, lastLoaded, setLastLoaded, type Challenge } from "@/game/classroom/challenge";
import { Shell } from "./Pages";
import Btn from "@/components/ui/Btn";
import { Eyebrow } from "@/components/ui/kit";

/** Teacher makes a mission code; students play it in Mission Closure; the board ranks by least launch mass. Everything stays in the browser. */
const DEF: Challenge = { v: 1, name: "Class mission", target: "mars", launcher: "atlas5", propellant: "bipro", bus: 2764, budgetM: 400, minInstruments: 3 };
const Chips = ({ list, v, on }: { list: { id: string; name: string }[]; v: string; on: (id: string) => void }) => <div className="mt-2 flex flex-wrap gap-1.5">{list.map(o => <button key={o.id} aria-pressed={v === o.id} onClick={() => on(o.id)} className={`border px-2.5 py-1 font-data text-[11.5px] ${v === o.id ? "border-[#e8a45a] bg-[#e8a45a] text-black" : "border-white/25 text-white/80 hover:border-[#e8a45a]"}`}>{o.name}</button>)}</div>;
export default function Classroom({ initialCode }: { initialCode?: string }) {
  const [tab, setTab] = useState<"teacher" | "student" | "board">(() => (lastLoaded() && !initialCode ? "board" : "student")), [c, setC] = useState<Challenge>(DEF), [code, setCode] = useState(initialCode ?? ""), [loaded, setLoaded] = useState<Challenge | null>(lastLoaded), [err, setErr] = useState(""), [copied, setCopied] = useState(false);
  const made = encode(c), link = typeof window !== "undefined" ? `${window.location.origin}/#c=${made}` : "";
  const load = (s: string) => { const ch = decode(s.replace(/^.*#c=/, "")); if (!ch) { setErr("That code is not valid."); setLoaded(null); } else { setErr(""); setLoaded(ch); setLastLoaded(ch); } };
  useEffect(() => { if (initialCode) load(initialCode); }, [initialCode]);
  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ } };
  const board = loaded ? rank(entriesFor(loaded)) : [];
  const csv = () => { if (!loaded) return; const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([toCsv(loaded, board)], { type: "text/csv" })); a.download = "astraia-class-results.csv"; a.click(); };
  const play = () => { if (loaded) { setActiveChallenge(loaded); game.go("closure"); } };
  return (
    <Shell title="CLASSROOM CHALLENGE" sub="TEACHER SETS THE MISSION · TEAMS COMPETE" onBack={() => game.go("menu")}>
      <div className="mb-5 flex gap-1.5">{(["student", "teacher", "board"] as const).map(t => <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)} className={`border px-4 py-1.5 font-data text-[11.5px] tracking-widest ${tab === t ? "border-[#e8a45a] bg-[#e8a45a] text-black" : "border-white/25 text-white/75"}`}>{t === "student" ? "STUDENT" : t === "teacher" ? "TEACHER" : "LEADERBOARD"}</button>)}</div>
      {tab === "teacher" && <div className="grid gap-5 lg:grid-cols-2"><section className="gp space-y-4 p-4">
        <label className="block"><Eyebrow>MISSION NAME</Eyebrow><input value={c.name} maxLength={40} onChange={e => setC({ ...c, name: e.target.value })} className="mt-2 w-full border border-white/25 bg-black/40 px-3 py-2 text-[14px]" /></label>
        <div><Eyebrow>DESTINATION</Eyebrow><Chips list={TARGETS} v={c.target} on={id => setC({ ...c, target: id })} /></div><div><Eyebrow>LAUNCH VEHICLE</Eyebrow><Chips list={LAUNCHERS} v={c.launcher} on={id => setC({ ...c, launcher: id })} /></div><div><Eyebrow>PROPELLANT</Eyebrow><Chips list={PROPELLANTS} v={c.propellant} on={id => setC({ ...c, propellant: id })} /></div>
        <label className="block font-data text-[10.5px] tracking-[0.2em] text-[#e8a45a]">BUS DRY MASS · <b className="text-white">{c.bus} kg</b><input type="range" min={500} max={8000} step={10} value={c.bus} onChange={e => setC({ ...c, bus: +e.target.value })} className="mt-1 w-full accent-[#944921]" /></label>
        <label className="block font-data text-[10.5px] tracking-[0.2em] text-[#e8a45a]">BUDGET CAP (game value) · <b className="text-white">{c.budgetM} M$</b><input type="range" min={150} max={600} step={10} value={c.budgetM} onChange={e => setC({ ...c, budgetM: +e.target.value })} className="mt-1 w-full accent-[#944921]" /></label>
        <label className="block font-data text-[10.5px] tracking-[0.2em] text-[#e8a45a]">MINIMUM INSTRUMENTS · <b className="text-white">{c.minInstruments}</b><input type="range" min={0} max={7} step={1} value={c.minInstruments} onChange={e => setC({ ...c, minInstruments: +e.target.value })} className="mt-1 w-full accent-[#944921]" /></label></section>
        <section className="gp space-y-3 p-4"><Eyebrow>SHARE WITH YOUR CLASS</Eyebrow><p className="text-[13.5px] text-white/70">Give students this code or link. It holds the whole mission, so nothing is uploaded.</p>
          <textarea readOnly value={made} className="h-24 w-full break-all border border-white/25 bg-black/40 p-2 font-data text-[12px]" /><div className="flex flex-wrap gap-2"><Btn main icon={<Copy size={14} />} onClick={() => copy(made)}>{copied ? "COPIED" : "COPY CODE"}</Btn><Btn onClick={() => copy(link)}>COPY LINK</Btn></div>
          <p className="font-data text-[11px] leading-relaxed text-white/50">Rules: the design must close, stay under budget, carry the minimum instruments and keep a safe margin. The team with the lowest launch mass wins. A tie goes to the lower cost.</p></section></div>}
      {tab === "student" && <section className="gp max-w-2xl space-y-3 p-4"><Eyebrow>MISSION CODE</Eyebrow><textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste the code or link from your teacher" className="h-20 w-full border border-white/25 bg-black/40 p-2 font-data text-[12px]" />
        <Btn main onClick={() => load(code)}>LOAD MISSION</Btn>{err && <p className="text-[#FD4E54]">{err}</p>}
        {loaded && <div className="space-y-2 border-t border-white/15 pt-3"><h3 className="font-display text-lg tracking-[0.18em]">{loaded.name}</h3>
          <p className="text-[13.5px] text-white/75">Reach {TARGETS.find(t => t.id === loaded.target)!.name} with {LAUNCHERS.find(l => l.id === loaded.launcher)!.name}. Budget {loaded.budgetM} M$. At least {loaded.minInstruments} instruments. Close with a safe margin using the least launch mass.</p><Btn main onClick={play}>PLAY THIS MISSION</Btn></div>}</section>}
      {tab === "board" && <section className="gp p-4">{!loaded ? <p className="text-white/60">Load a mission code in the STUDENT tab to see its results.</p> : <>
        <div className="mb-3 flex items-center justify-between"><Eyebrow>{loaded.name.toUpperCase()}</Eyebrow><Btn icon={<Download size={14} />} onClick={csv}>EXPORT CSV</Btn></div>
        <table className="w-full text-[13px]"><thead><tr className="text-left font-data text-[10px] tracking-widest text-[#e8a45a]"><th>#</th><th>TEAM</th><th>RESULT</th><th className="text-right">LAUNCH MASS</th><th className="text-right">COST (SIM)</th><th className="text-right">Δv MARGIN</th></tr></thead>
          <tbody>{board.length === 0 && <tr><td colSpan={6} className="py-3 text-white/50">No results yet on this device.</td></tr>}{board.map((e, i) => <tr key={i} className="border-t border-white/10"><td className="py-1.5">{i + 1}</td><td>{e.name}</td><td className={e.ok ? "text-[#53CBB8]" : "text-[#FD4E54]"}>{e.ok ? "VALID" : e.reason}</td><td className="text-right font-data">{e.wetKg.toLocaleString()} kg</td><td className="text-right font-data">{e.costM}</td><td className="text-right font-data">{e.dvMarginPct}%</td></tr>)}</tbody></table>
        <p className="mt-3 font-data text-[10.5px] text-white/45">Results are stored in this browser. For a shared class board, collect the CSV from each device.</p></>}</section>}
    </Shell>
  );
}
