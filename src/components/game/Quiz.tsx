import { useMemo, useState } from "react";
import { QUIZ, type Level, type Q } from "@/data/fun/content";
import { fun, useFun } from "@/game/fun/store";
import Btn from "@/components/ui/Btn";
import Confetti from "@/components/ui/Confetti";
import { sfx } from "@/lib/utils/audio";

const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
interface PQ { q: string; opts: { t: string; ok: boolean }[]; why: string }
const prep = (q: Q): PQ => ({ q: q.q, why: q.why, opts: shuffle(q.a.map((t, i) => ({ t, ok: i === q.c }))) });
const LV: { id: Level; label: string; hint: string }[] = [{ id: "easy", label: "EASY", hint: "Great for kids" }, { id: "medium", label: "MEDIUM", hint: "Space fans" }, { id: "hard", label: "HARD", hint: "Mission experts" }];

export default function Quiz() {
  const [level, setLevel] = useState<Level | null>(null), [i, setI] = useState(0), [pick, setPick] = useState<number | null>(null), [score, setScore] = useState(0), [streak, setStreak] = useState(0), [done, setDone] = useState(false), [seed, setSeed] = useState(0);
  const qs = useMemo(() => (level ? shuffle<Q>(QUIZ[level]).slice(0, 6).map(prep) : []), [level, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const bests = useFun(s => s.quizBest);
  if (!level) return (
    <div className="grid gap-3 sm:grid-cols-3">{LV.map(l => <button key={l.id} onClick={() => { sfx("click"); setLevel(l.id); setI(0); setScore(0); setStreak(0); setPick(null); setDone(false); setSeed(s => s + 1); }} className="gp p-5 text-left transition-colors hover:!border-[#e8a45a]">
      <p className="font-display text-sm tracking-[0.25em] text-[#e8a45a]">{l.label}</p><p className="mt-2 text-[15px]">{l.hint}</p><p className="mt-3 font-data text-[10.5px] tracking-widest text-white/50">BEST {bests[l.id] ?? 0} / 6 · 6 QUESTIONS</p></button>)}</div>
  );
  if (done) { const perfect = score === qs.length; return (
    <div className="gp mx-auto max-w-md p-6 text-center">{score >= 4 && <Confetti />}
      <p className="font-display text-sm tracking-[0.25em] text-[#e8a45a]">{perfect ? "PERFECT SCORE!" : score >= 4 ? "GREAT JOB!" : "GOOD TRY!"}</p>
      <p className="mt-3 font-data text-5xl">{score}<span className="text-xl text-white/40"> / {qs.length}</span></p>
      <p className="mt-2 text-[14px] text-white/65">+{score * 5 + (perfect ? 15 : 0) + 5} XP earned</p>
      <div className="mt-5 flex justify-center gap-2"><Btn main onClick={() => { setSeed(s => s + 1); setI(0); setScore(0); setStreak(0); setPick(null); setDone(false); }}>PLAY AGAIN</Btn><Btn onClick={() => setLevel(null)}>CHANGE LEVEL</Btn></div></div>); }
  const q = qs[i]; if (!q) return null;
  const answer = (n: number) => {
    if (pick !== null) return; setPick(n); const ok = q.opts[n].ok;
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); sfx("ok"); } else { setStreak(0); sfx("fail"); }
  };
  const next = () => {
    if (i + 1 >= qs.length) { const fin = score; fun.quizDone(level, fin); fun.xp(fin * 5 + (fin === qs.length ? 15 : 0) + 5); setDone(true); }
    else { setI(i + 1); setPick(null); }
  };
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between font-data text-[10.5px] tracking-[0.25em] text-white/55"><span>QUESTION {i + 1} / {qs.length}</span><span>{streak >= 2 ? `🔥 STREAK ${streak}` : `SCORE ${score}`}</span></div>
      <div className="mb-4 h-1 bg-white/10"><div className="h-full bg-[#e8a45a] transition-all" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <h3 className="text-[clamp(1.05rem,2.6vw,1.4rem)] font-semibold leading-snug">{q.q}</h3>
      <div className="mt-4 grid gap-2">{q.opts.map((o, n) => {
        const show = pick !== null, sel = pick === n, cls = show ? (o.ok ? "!border-[#8fbf8a] bg-[#8fbf8a]/15" : sel ? "!border-[#e5533a] bg-[#e5533a]/15" : "opacity-50") : "hover:!border-[#e8a45a]";
        return <button key={n} onClick={() => answer(n)} disabled={show} className={`gp px-4 py-3 text-left text-[15px] transition-colors ${cls}`}><span className="mr-3 font-data text-[#e8a45a]">{"ABCD"[n]}</span>{o.t}{show && o.ok && <span className="float-right">✓</span>}{show && sel && !o.ok && <span className="float-right">✗</span>}</button>; })}</div>
      {pick !== null && <div className="fade-in mt-4 gp p-4"><p className="font-data text-[10.5px] tracking-[0.2em] text-[#8fbf8a]">DID YOU KNOW? · REAL</p><p className="mt-1 text-[14px] text-white/80">{q.why}</p><div className="mt-3"><Btn main onClick={next}>{i + 1 >= qs.length ? "SEE RESULT" : "NEXT"}</Btn></div></div>}
    </div>
  );
}
