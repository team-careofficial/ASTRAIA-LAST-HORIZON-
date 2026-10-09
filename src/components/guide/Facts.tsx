import { SOURCES } from "@/data/knowledge/sources";
import type { Fact } from "@/data/knowledge/entries";
const BADGE = { real: ["REAL · NASA", "tag-real"], concept: ["CONCEPT", "tag-concept"], sim: ["SIMULATED", "tag-sim"] } as const;
export default function Facts({ facts }: { facts: Fact[] }) {
  return <ul className="mt-3 space-y-2.5">{facts.map((f, i) => { const s = f.source ? SOURCES[f.source] : null, b = BADGE[f.kind];
    return <li key={i} className="text-[13px] leading-snug"><span className={`tag mr-2 ${b[1]}`}>{b[0]}</span><span className="text-white/55">{f.label}: </span>{f.value}
      {s && <a href={s.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-[11px] text-[#9bb8d4] underline underline-offset-2">{s.name}, retrieved {s.retrieved}</a>}</li>; })}</ul>;
}
