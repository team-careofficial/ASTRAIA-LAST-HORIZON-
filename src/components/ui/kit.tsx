import { useState, type ReactNode } from "react";
import type { Kind } from "@/data/design/options";

const KC: Record<Kind, [string, string]> = { real: ["REAL", "tag-real"], concept: ["CONCEPT", "tag-concept"], sim: ["SIMULATED", "tag-sim"] };
export const KindTag = ({ kind }: { kind: Kind }) => <span className={`tag ${KC[kind][1]}`}>{KC[kind][0]}</span>;

/** Thin telemetry bar. `invert` means a low value is good (e.g. risk). */
export function Meter({ label, value, max, text, bad, why, delta, good = true }: { label: string; value: number; max: number; text: string; bad?: boolean; why?: string; delta?: string; good?: boolean }) {
  const [o, setO] = useState(false), pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 font-data text-[10.5px] tracking-[0.16em] text-white/55">
        <span className="flex items-center gap-1">{label}{why && <button onClick={() => setO(!o)} aria-expanded={o} className="rounded-sm border border-white/20 px-1 text-[8.5px] text-[#e8a45a] hover:border-[#e8a45a]">WHY?</button>}</span>
        <span className="flex items-baseline gap-2">{delta && <span key={delta} className={`count-in text-[10px] ${good ? "text-[#8fbf8a]" : "text-[#e5533a]"}`}>{delta}</span>}<span className={`text-[12px] tracking-normal ${bad ? "text-[#e5533a]" : "text-white"}`}>{text}</span></span>
      </div>
      <div className="mt-1 h-[3px] bg-white/10"><div className={`bar-fill h-full ${bad ? "bg-[#e5533a]" : "bg-[#9bb8d4]"}`} style={{ width: `${pct}%` }} /></div>
      {o && why && <p className="fade-in mt-1 text-[12px] leading-snug text-white/70">{why}</p>}
    </div>
  );
}
export const Eyebrow = ({ children }: { children: ReactNode }) => <p className="font-data text-[10.5px] tracking-[0.3em] text-[#e8a45a]">{children}</p>;
export const Pips = ({ n, of = 5, bad }: { n: number; of?: number; bad?: boolean }) => <span className="inline-flex gap-[3px] align-middle">{Array.from({ length: of }, (_, i) => <i key={i} className={`h-[9px] w-[9px] ${i < n ? (bad ? "bg-[#e5533a]" : "bg-[#e8a45a]") : "bg-white/15"}`} />)}</span>;
