import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Lang } from "@/data/closure/strings";

/** Guided auto-run of the Closure screen for the judging video: build, close, get greedy, fail, fix, launch.
 *  It only presses the same controls a player can press; it never changes a number. */
export interface DemoAct { reset: () => void; add: (id: string) => void; ask: (id: string) => void; answer: (yes: boolean) => void; undo: () => void; fly: () => void; closeFly: () => void; receipt: (id: string | false) => void; margin: () => string }
type Step = { ms: number; en: string; bn: string; run?: (a: DemoAct) => void };
const STEPS: Step[] = [
  { ms: 4800, en: "ASTRAIA Closure asks one question: can a Mars mission really close, using real NASA numbers?", bn: "ASTRAIA Closure একটাই প্রশ্ন করে: নাসার আসল সংখ্যা দিয়ে একটা মঙ্গল মিশন কি সত্যিই মেলে?", run: a => a.reset() },
  { ms: 4200, en: "Launcher: Atlas V, capacity from the NASA Launch Services fact sheet. Target: Mars. Engine: bipropellant.", bn: "লঞ্চার Atlas V, ক্ষমতা নাসার Launch Services ফ্যাক্টশিট থেকে। গন্তব্য মঙ্গল। ইঞ্জিন bipropellant।" },
  { ms: 3000, en: "Add Mastcam-Z. Every instrument uses its real NASA mass.", bn: "Mastcam-Z যোগ করি। প্রতিটি যন্ত্রের ওজন নাসার আসল ওজন।", run: a => a.add("mastcamz") },
  { ms: 2400, en: "Add MEDA, the weather station.", bn: "MEDA আবহাওয়া স্টেশন যোগ করি।", run: a => a.add("meda") },
  { ms: 2400, en: "Add SuperCam.", bn: "SuperCam যোগ করি।", run: a => a.add("supercam") },
  { ms: 5200, en: "The ledger compares launch mass with Atlas V capacity, and delta-v with what Mars needs. It closes, with a thin margin.", bn: "খাতায় উৎক্ষেপণ ভর আর Atlas V ক্ষমতা মেলানো হয়, আর delta-v মেলানো হয় মঙ্গলের প্রয়োজনের সাথে। মেলে, তবে মার্জিন খুব কম।" },
  { ms: 5200, en: "Every number has a receipt: dataset, NASA page, date read. Real, derived or textbook is always labelled.", bn: "প্রতিটি সংখ্যার রসিদ আছে: ডেটাসেট, নাসার পেজ, পড়ার তারিখ। আসল, হিসাব করা বা পাঠ্যবই সব লেবেল করা।", run: a => a.receipt("atlas5") },
  { ms: 3600, en: "Now we get greedy and add MOXIE. First we must predict: will it still close?", bn: "এবার লোভ করে MOXIE যোগ করি। আগে অনুমান করতে হবে: তবুও কি মিলবে?", run: a => { a.receipt(false); a.ask("moxie"); } },
  { ms: 5600, en: "We guess yes. The engine says otherwise: the mission no longer closes.", bn: "আমরা অনুমান করি হ্যাঁ। ইঞ্জিন বলছে না: মিশন আর মেলে না।", run: a => a.answer(true) },
  { ms: 4600, en: "The repair tag names the smallest fix. Here we remove MOXIE.", bn: "মেরামত ট্যাগ সবচেয়ে ছোট সমাধান বলে দেয়। এখানে MOXIE সরাই।", run: a => a.undo() },
  { ms: 3200, en: "Closed again. Now we launch it.", bn: "আবার মিলেছে। এবার উৎক্ষেপণ করি।" },
  { ms: 9500, en: "", bn: "", run: a => a.fly() },
  { ms: 400, en: "", bn: "", run: a => a.closeFly() },
];
const END = {
  en: ["Data used", "NASA: Launch Services fact sheet, Perseverance instruments, JPL Mars 2020 quick facts, NSSDC Mars and Moon fact sheets.", "Cross-checks: NASA NTRS reports and ISRO's Mars Orbiter Mission publication.", "Honest limits: no live feed, cost is game balance. See Data & Sources."],
  bn: ["ব্যবহৃত ডেটা", "নাসা: Launch Services ফ্যাক্টশিট, Perseverance যন্ত্র, JPL Mars 2020 তথ্য, NSSDC মঙ্গল ও চাঁদের ফ্যাক্টশিট।", "ক্রস-চেক: নাসা NTRS রিপোর্ট ও ISRO-র Mars Orbiter Mission প্রকাশনা।", "সীমা: লাইভ ফিড নেই, খরচ গেম ব্যালান্স। Data & Sources দেখুন।"],
};

export default function JudgeDemo({ act, lang, onExit }: { act: React.MutableRefObject<DemoAct>; lang: Lang; onExit: () => void }) {
  const [i, setI] = useState(0), [end, setEnd] = useState(false), timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (end) return;
    const s = STEPS[i]; s.run?.(act.current);
    timer.current = setTimeout(() => { if (i + 1 < STEPS.length) setI(i + 1); else setEnd(true); }, s.ms);
    return () => clearTimeout(timer.current);
  }, [i, end, act]);
  const s = STEPS[i], cap = lang === "bn" ? s.bn : s.en, e = END[lang === "bn" ? "bn" : "en"];
  const skip = () => { clearTimeout(timer.current); act.current.closeFly(); act.current.receipt(false); setEnd(true); };
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
      {end ? (
        <div className="pointer-events-auto w-[min(640px,100%)] border-l-4 border-[#e8a45a] bg-black/85 p-5 backdrop-blur">
          <h3 className="font-display text-base tracking-[0.2em] text-[#e8a45a]">{e[0].toUpperCase()}</h3>
          {e.slice(1).map(x => <p key={x} className="mt-2 text-[14px] leading-snug text-white/85">{x}</p>)}
          <div className="mt-4 flex gap-2"><button className="gbtn gbtn-main !px-4 !py-1.5 !text-[12px]" onClick={() => { setEnd(false); setI(0); }}>{lang === "bn" ? "আবার চালাও" : "REPLAY"}</button><button className="gbtn !px-4 !py-1.5 !text-[12px]" onClick={onExit}>{lang === "bn" ? "বন্ধ" : "DONE"}</button></div>
        </div>
      ) : cap ? (
        <div className="pointer-events-auto w-[min(720px,100%)] border-l-4 border-[#e8a45a] bg-black/80 px-4 py-3 backdrop-blur">
          <div className="flex items-start gap-3"><p key={i} className="lb-in flex-1 text-[15px] leading-snug text-white">{cap}</p><button aria-label="Skip demo" onClick={skip} className="grid h-7 w-7 shrink-0 place-items-center border border-white/30 text-white/70"><X size={14} /></button></div>
          <div className="mt-2 h-[2px] bg-white/15"><div className="h-full bg-[#ffc14d] transition-[width] duration-500" style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} /></div>
        </div>
      ) : null}
    </div>
  );
}
