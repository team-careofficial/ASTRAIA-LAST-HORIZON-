import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ENTRIES, SECTIONS } from "@/data/knowledge/entries";
import { game } from "@/game/engine/store";
import { guide, useGuide } from "@/game/guide/store";
import { Shell } from "@/components/game/Pages";
import { Eyebrow } from "@/components/ui/kit";
import Facts from "./Facts";
import Why from "./Why";

export default function Manual() {
  const [id, setId] = useState(ENTRIES[0].id), [tab, setTab] = useState<"manual" | "notes">("manual"), [q, setQ] = useState(""), notes = useGuide(s => s.notes);
  const en = ENTRIES.find(e => e.id === id) ?? ENTRIES[0], list = useMemo(() => ENTRIES.filter(e => !q.trim() || (e.title + e.short + e.section).toLowerCase().includes(q.trim().toLowerCase())), [q]);
  return (
    <Shell title="MISSION MANUAL" sub="SPACECRAFT OPERATIONS HANDBOOK" onBack={() => game.go("menu")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">{(["manual", "notes"] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`border px-4 py-1.5 font-data text-[11px] tracking-[0.2em] transition-colors ${tab === t ? "border-[#e8a45a] bg-[#e8a45a]/10 text-[#e8a45a]" : "border-white/15 text-white/60 hover:border-white/40"}`}>{t === "manual" ? "MANUAL" : `FIELD NOTES (${notes.length})`}</button>)}</div>
        <div className="flex items-center gap-3 font-data text-[10.5px] tracking-widest text-white/55"><span className="tag tag-real">REAL</span>NASA fact<span className="tag tag-concept">CONCEPT</span>science idea<span className="tag tag-sim">SIMULATED</span>game value</div>
      </div>
      {tab === "manual" ? <div className="grid gap-5 md:grid-cols-[280px_1fr]">
        <nav className="gp max-h-[68vh] overflow-auto p-4" aria-label="Manual sections">
          <label className="mb-4 flex items-center gap-2 border-b border-white/15 pb-2"><Search size={14} className="text-white/40" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search the manual" className="w-full bg-transparent text-[14px] outline-none placeholder:text-white/30" /></label>
          {SECTIONS.map(s => { const items = list.filter(e => e.section === s); return items.length === 0 ? null : <div key={s} className="mb-4"><h2 className="mb-1 font-data text-[10px] tracking-[0.28em] text-white/40">{s}</h2>{items.map(e => <button key={e.id} onClick={() => setId(e.id)} className={`block w-full border-l-2 px-3 py-1.5 text-left text-[14.5px] transition-all ${id === e.id ? "border-[#e8a45a] bg-[#e8a45a]/10 text-[#e8a45a]" : "border-transparent text-white/75 hover:border-white/30 hover:text-white"}`}>{e.title}</button>)}</div>; })}
          {list.length === 0 && <p className="text-sm text-white/50">Nothing matches.</p>}
        </nav>
        <article key={en.id} className="gp screen-in p-6"><Eyebrow>{en.section}</Eyebrow><h2 className="mt-2 font-display text-lg tracking-[0.1em]">{en.title}</h2>
          <p className="mt-4 text-[16px] leading-snug text-white/90">{en.short}</p><p className="mt-3 text-[14.5px] leading-relaxed text-white/65">{en.detail}</p><Facts facts={en.facts} />
          <div className="mt-5 border-l-2 border-[#e8a45a] bg-[#e8a45a]/[0.06] p-3 text-[14px]"><span className="font-data text-[10.5px] tracking-widest text-[#e8a45a]">WHY DOES THIS MATTER?</span><Why text={en.why} /></div>
          <p className="mt-5 text-[11.5px] leading-snug text-white/35">REAL values are read from the linked NASA page. CONCEPT is a general scientific idea. SIMULATED is an ASTRAIA game value and never NASA data.</p></article></div>
        : <div className="gp p-5">{notes.length === 0 ? <p className="text-sm text-white/60">No field notes yet. They are logged as you play.</p> : <ul className="stagger space-y-4">{notes.map((n, i) => <li key={n.id} className="border-l border-white/15 pl-4"><p className="font-data text-[11px] tracking-[0.2em] text-[#e8a45a]">FIELD NOTE #{i + 1} · {n.title.toUpperCase()}</p><p className="mt-1 text-[14.5px] text-white/80">{n.text}</p></li>)}</ul>}</div>}
    </Shell>
  );
}
export { guide };
