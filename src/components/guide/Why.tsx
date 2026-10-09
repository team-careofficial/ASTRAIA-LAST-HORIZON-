import { useState } from "react";
export default function Why({ text }: { text: string }) {
  const [o, setO] = useState(false);
  return <span><button onClick={() => setO(!o)} aria-expanded={o} className="pointer-events-auto ml-1.5 border border-white/25 px-1 font-data text-[9px] tracking-widest text-[#e8a45a] transition-colors hover:border-[#e8a45a]">WHY?</button>{o && <span className="fade-in mt-1 block text-[12px] normal-case leading-snug tracking-normal text-white/75">{text}</span>}</span>;
}
