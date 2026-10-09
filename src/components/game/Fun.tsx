import { useEffect, useState } from "react";
import { Brain, Rocket, Lightbulb, Trophy, Star, Moon } from "lucide-react";
import { Shell } from "./Pages";
import Quiz from "./Quiz";
import Lander from "./Lander";
import Btn from "@/components/ui/Btn";
import { game, useGame } from "@/game/engine/store";
import { fun, useFun } from "@/game/fun/store";
import { FACTS, factOfDay, rankOf } from "@/data/fun/content";
import { KindTag } from "@/components/ui/kit";

type Tab = "home" | "quiz" | "lander" | "facts";
export default function Fun() {
  const [tab, setTab] = useState<Tab>("home"), [fi, setFi] = useState(0);
  const lvl = useGame(s => s.level), xp = useGame(s => s.xp), done = useGame(s => Object.keys(s.completed).length);
  const f = useFun(s => s);
  useEffect(() => { fun.load(); }, []);
  const rank = rankOf(lvl), toNext = 150 - (xp % 150);
  const today = factOfDay();
  const badges = [
    { id: "pilot", n: "Rookie Pilot", d: "Reach level 2", ok: lvl >= 2, i: "🚀" },
    { id: "moon", n: "Moon Lander", d: "Land softly on the Moon", ok: f.landed.moon > 0, i: "🌙" },
    { id: "mars", n: "Mars Lander", d: "Land softly on Mars", ok: f.landed.mars > 0, i: "🔴" },
    { id: "quiz", n: "Quiz Whiz", d: "Score 5+ in any quiz", ok: Object.values(f.quizBest).some(v => v >= 5), i: "🧠" },
    { id: "brain", n: "Brainiac", d: "Perfect hard quiz", ok: (f.quizBest.hard ?? 0) >= 6, i: "🏆" },
    { id: "star", n: "Star Collector", d: "Collect 10 rover Star Shards", ok: f.shards >= 10, i: "⭐" },
    { id: "mission", n: "Mission Complete", d: "Finish a campaign mission", ok: done > 0, i: "✅" },
  ];
  const tabs: { id: Tab; l: string; I: typeof Brain }[] = [{ id: "home", l: "HOME", I: Star }, { id: "quiz", l: "SPACE QUIZ", I: Brain }, { id: "lander", l: "LANDER", I: Rocket }, { id: "facts", l: "FACTS", I: Lightbulb }];
  return (
    <Shell title="FUN ZONE" sub="GAMES · QUIZ · BADGES" onBack={() => game.go("menu")}>
      <div role="tablist" className="mb-5 flex flex-wrap gap-2">{tabs.map(t => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`gp flex items-center gap-2 px-4 py-2 font-data text-[11px] tracking-[0.2em] transition-colors hover:!border-[#e8a45a] ${tab === t.id ? "!border-[#e8a45a] text-[#e8a45a]" : "text-white/70"}`}><t.I size={14} />{t.l}</button>)}</div>
      {tab === "home" && <div className="space-y-5">
        <div className="gp flex flex-wrap items-center gap-5 p-5">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-[#e8a45a] font-display text-xl text-[#e8a45a]">{lvl}</div>
          <div className="min-w-[10rem] flex-1"><p className="font-display text-sm tracking-[0.2em]">{rank.toUpperCase()}</p><p className="font-data text-[11px] text-white/55">{xp} XP · {toNext} XP to next level</p>
            <div className="mt-2 h-1.5 bg-white/10"><div className="h-full bg-[#e8a45a]" style={{ width: `${((xp % 150) / 150) * 100}%` }} /></div></div>
          <label className="font-data text-[10.5px] tracking-widest text-white/55">CALLSIGN<input value={f.callsign} onChange={e => fun.setCallsign(e.target.value)} placeholder="Your name" maxLength={14} className="mt-1 block w-40 border border-white/20 bg-black/40 px-2 py-1.5 text-[14px] normal-case tracking-normal text-white outline-none focus:border-[#e8a45a]" /></label>
        </div>
        {f.callsign && <p className="text-[15px]">Welcome, Commander <b className="text-[#e8a45a]">{f.callsign}</b>! Pick a game below.</p>}
        <div className="grid gap-3 sm:grid-cols-3">
          {[{ t: "quiz" as Tab, I: Brain, n: "Space Quiz", d: "6 questions, 3 levels. Learn real facts and earn XP." }, { t: "lander" as Tab, I: Rocket, n: "Lander Challenge", d: "Land softly on the Moon or Mars. Gravity is different!" }, { t: "facts" as Tab, I: Lightbulb, n: "Space Facts", d: "Amazing true facts to share with friends." }].map(c => (
            <button key={c.n} onClick={() => setTab(c.t)} className="gp p-5 text-left transition-colors hover:!border-[#e8a45a]"><c.I size={22} className="text-[#e8a45a]" /><p className="mt-3 font-display text-[13px] tracking-[0.2em]">{c.n.toUpperCase()}</p><p className="mt-1 text-[14px] text-white/65">{c.d}</p></button>))}
        </div>
        <div className="gp p-5"><p className="flex items-center gap-2 font-data text-[10.5px] tracking-[0.25em] text-[#e8a45a]"><Lightbulb size={13} />FACT OF THE DAY <KindTag kind="real" /></p><p className="mt-2 font-semibold">{today.t}</p><p className="mt-1 text-[14px] text-white/75">{today.text}</p></div>
        <div className="gp p-5"><p className="mb-3 flex items-center gap-2 font-data text-[10.5px] tracking-[0.25em] text-[#e8a45a]"><Trophy size={13} />BADGES · {badges.filter(b => b.ok).length}/{badges.length}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{badges.map(b => <div key={b.id} className={`border border-white/10 p-3 text-center ${b.ok ? "bg-[#e8a45a]/10" : "opacity-40 grayscale"}`}><p className="text-2xl">{b.i}</p><p className="mt-1 text-[13px] font-semibold">{b.n}</p><p className="text-[11.5px] text-white/55">{b.d}</p></div>)}</div>
          <p className="mt-3 flex items-center gap-2 text-[12.5px] text-white/50"><Moon size={12} />Tip: in Rover mode, collect glowing ★ Star Shards — each gives a little battery. Total collected: {f.shards}.</p></div>
      </div>}
      {tab === "quiz" && <Quiz />}
      {tab === "lander" && <Lander />}
      {tab === "facts" && <div className="mx-auto max-w-xl text-center">
        <div className="gp p-6"><p className="font-data text-[10.5px] tracking-[0.25em] text-[#e8a45a]">FACT {fi + 1} / {FACTS.length} <KindTag kind="real" /></p><h3 className="mt-3 text-xl font-semibold">{FACTS[fi].t}</h3><p className="mt-2 text-[15px] leading-relaxed text-white/80">{FACTS[fi].text}</p></div>
        <div className="mt-4 flex justify-center gap-2"><Btn onClick={() => setFi((fi + FACTS.length - 1) % FACTS.length)}>◀ PREV</Btn><Btn main onClick={() => setFi((fi + 1) % FACTS.length)}>NEXT ▶</Btn></div></div>}
    </Shell>
  );
}
