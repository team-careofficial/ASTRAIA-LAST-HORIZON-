import { useEffect, useMemo, useRef, useState } from "react";
import { Rocket, Undo2, Receipt } from "lucide-react";
import { game } from "@/game/engine/store";
import { evaluate, spareInstrumentKg, costM, budgetM, type DesignInput } from "@/compute/closure";
import { INSTRUMENTS, LAUNCHERS, PROPELLANTS, TARGETS, PERSEVERANCE, SIM_PROV, type Prov } from "@/data/real/missionData";
import { STR, type Lang } from "@/data/closure/strings";
import { runFly } from "./closureFly";
import { Shell } from "./Pages";
import Btn from "@/components/ui/Btn";
import { Eyebrow } from "@/components/ui/kit";

/** Mission Closure: the real-number check. Rocket equation, NASA-sourced masses, a receipt for every value. */
const EDGE = { launcher: "atlas5", target: "mars", propellant: "bipro", bus: 2764, load: 6000, inst: ["mastcamz", "meda", "supercam"] };
type St = typeof EDGE;
const KC: Record<Prov["kind"], string> = { nasa: "text-[#53CBB8] border-[#53CBB8]", derived: "text-[#7FD6E8] border-[#7FD6E8]", textbook: "text-[#DBA671] border-[#DBA671]", unverified: "text-[#FD4E54] border-[#FD4E54] border-dashed", sim: "text-white/50 border-white/40 border-dotted" };
const SLOTS = INSTRUMENTS.map((_, i) => 215 + i * 44);

export default function Closure() {
  const [lang, setLang] = useState<Lang>("en"), [st, setSt] = useState<St>(EDGE), [predict, setPredict] = useState(true);
  const [score, setScore] = useState({ r: 0, t: 0 }), [banner, setBanner] = useState<{ q?: string; ask?: { id: string; after: string[] }; msg?: string; good?: boolean } | null>(null);
  const [drawer, setDrawer] = useState<string | null | false>(false), [flying, setFlying] = useState(false), [flip, setFlip] = useState(false);
  const cv = useRef<HTMLCanvasElement>(null), stop = useRef<() => void>(() => {}), seen = useRef<Record<string, 1>>({});
  const t = (k: string, p?: Record<string, string>) => { let s = STR[lang][k] ?? STR.en[k] ?? k; if (p) for (const n in p) s = s.split(`{${n}}`).join(p[n]); return s; };
  const nf = (n: number, d = 0) => n.toLocaleString(lang === "bn" ? "bn-BD" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const sg = (n: number, d = 0) => (n >= 0 ? "+" : "−") + nf(Math.abs(n), d);
  const toIn = (s: St, inst = s.inst): DesignInput => ({ launcher: s.launcher, target: s.target, propellant: s.propellant, busDryKg: s.bus, propellantKg: s.load, instruments: inst });
  const res = useMemo(() => evaluate(toIn(st)), [st]);
  const dvM = res.dvAvailMs - res.dvRequiredMs, capOver = res.wetKg > res.capacityKg, cost = costM(toIn(st));
  const L = LAUNCHERS.find(x => x.id === st.launcher)!, T = TARGETS.find(x => x.id === st.target)!, P = PROPELLANTS.find(x => x.id === st.propellant)!;
  const set = (p: Partial<St>) => setSt(s => ({ ...s, ...p }));

  const toggle = (id: string) => {
    if (banner?.ask) return;
    if (st.inst.includes(id)) return set({ inst: st.inst.filter(x => x !== id) });
    const after = [...st.inst, id];
    if (!predict) return set({ inst: after });
    const it = INSTRUMENTS.find(x => x.id === id)!;
    setBanner({ q: t("predict_q", { name: it.name, kg: nf(it.massKg, 1) }), ask: { id, after } });
  };
  const answer = (yes: boolean) => {
    if (!banner?.ask) return;
    const after = banner.ask.after, r = evaluate(toIn(st, after)), right = yes === r.closes;
    setScore(s => ({ r: s.r + (right ? 1 : 0), t: s.t + 1 })); set({ inst: after });
    const m = r.closes ? t("p_after_ok", { m: nf(r.dvAvailMs - r.dvRequiredMs, 1) }) : r.wetKg > r.capacityKg ? t("p_after_mass", { m: nf(r.wetKg - r.capacityKg) }) : t("p_after_bad", { m: nf(r.dvRequiredMs - r.dvAvailMs, 1) });
    setBanner({ msg: (right ? t("p_right") : t("p_wrong")) + " " + m, good: right }); setTimeout(() => setBanner(b => (b && !b.ask ? null : b)), 5000);
  };
  const removeLast = () => { if (!st.inst.length) return; setFlip(true); setTimeout(() => { setSt(s => ({ ...s, inst: s.inst.slice(0, -1) })); setFlip(false); }, 260); };

  const fix = (): string => {
    const c = st.inst.map(id => INSTRUMENTS.find(x => x.id === id)!).filter(it => evaluate(toIn(st, st.inst.filter(x => x !== it.id))).closes).sort((a, b) => a.massKg - b.massKg);
    if (c.length) return t("tag_fix_remove", { name: c[0].name, kg: nf(c[0].massKg, 1) });
    if (capOver) { const b = LAUNCHERS.filter(l => l.leoKg >= res.wetKg).sort((a, z) => a.leoKg - z.leoKg)[0]; if (b) return t("tag_fix_launcher", { name: b.name, kg: nf(b.leoKg) }); }
    let lo = 0, hi = st.bus; for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (evaluate(toIn({ ...st, bus: st.bus - mid })).closes) hi = mid; else lo = mid; }
    return t("tag_fix_bus", { kg: nf(Math.ceil(hi / 10) * 10) });
  };
  const spare = res.closes ? spareInstrumentKg(toIn(st)) : 0;

  const fly = () => {
    setFlying(true);
    setTimeout(() => {
      if (!cv.current) return;
      stop.current();
      stop.current = runFly(cv.current, res, capOver, { transfer: t("transfer"), target: T.name, ms: `Δv ${nf(res.dvAvailMs)} ${t("ms")}`, verdict: verdict() }, st.target === "mars");
    }, 30);
  };
  const verdict = () => (res.closes ? t("fly_ok", { m: nf(dvM, 1) }) : capOver ? t("fly_mass", { m: nf(res.wetKg - res.capacityKg) }) : t("fly_dv", { m: nf(-dvM, 1) }));
  const closeFly = () => { stop.current(); setFlying(false); };
  useEffect(() => () => stop.current(), []);

  const Badge = (prov: Prov, id: string) => <button type="button" title={t(`k_${prov.kind}_d`)} onClick={e => { e.stopPropagation(); setDrawer(id); }} className={`border px-1.5 text-[9px] tracking-wider ${KC[prov.kind]}`}>{t(`k_${prov.kind}`)}</button>;
  const needle = (f: number) => ({ transform: `rotate(${-90 + Math.max(0, Math.min(1, f)) * 180}deg)`, transformOrigin: "80px 90px", transition: "transform 1.1s cubic-bezier(.3,1.6,.45,.9)" });
  const pol = (f: number, r = 60) => { const a = Math.PI * (1 - f); return [80 + r * Math.cos(a), 90 - r * Math.sin(a)]; };
  const Dial = ({ f, red, ticks }: { f: number; red: number; ticks: [number, string][] }): JSX.Element => { const [rx, ry] = pol(red); return (
    <svg viewBox="0 0 160 110" aria-hidden="true"><path d="M20 90 A60 60 0 0 1 140 90" fill="none" stroke="#4B2515" strokeWidth="10" />
      <path d={`M20 90 A60 60 0 0 1 ${rx} ${ry}`} fill="none" stroke="#FD4E54" strokeWidth="10" opacity=".8" /><path d={`M${rx} ${ry} A60 60 0 0 1 140 90`} fill="none" stroke="#53CBB8" strokeWidth="10" opacity=".75" />
      {ticks.map(([tf, l]) => { const a = pol(tf, 52), b = pol(tf, 68), c = pol(tf, 78); return <g key={l}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#DBA671" /><text x={c[0]} y={c[1] + 3} textAnchor="middle" fontSize="8" fill="#9A755E">{l}</text></g>; })}
      <g style={needle(f)}><line x1="80" y1="90" x2="80" y2="40" stroke="#e9dcc4" strokeWidth="2" strokeLinecap="round" /></g><circle cx="80" cy="90" r="5" fill="#DBA671" /></svg>); };

  const present = INSTRUMENTS.map((it, i) => ({ it, i })).filter(p => st.inst.includes(p.it.id));
  const lvl = Math.max(0, Math.min(1, st.load / 15000)), r = 36, hh = 2 * r * lvl;
  const mine = st.inst.reduce((s, id) => s + INSTRUMENTS.find(x => x.id === id)!.massKg, 0);
  const chips = (list: { id: string; name: string }[], key: "launcher" | "target" | "propellant") => <div className="flex flex-wrap gap-1.5">{list.map(o => <button key={o.id} aria-pressed={st[key] === o.id} onClick={() => set({ [key]: o.id } as Partial<St>)} className={`border px-2.5 py-1 font-data text-[11.5px] transition-colors ${st[key] === o.id ? "border-[#e8a45a] bg-[#e8a45a] text-black" : "border-white/25 text-white/80 hover:border-[#e8a45a]"}`}>{o.name}</button>)}</div>;
  const row = (a: string, b: string, bad?: boolean, badge?: JSX.Element) => <tr className="border-b border-white/10"><td className="py-1.5 text-white/55">{a}</td><td className={`py-1.5 text-right font-data ${bad ? "text-[#FD4E54]" : ""}`}>{b}{badge && <span className="ml-2">{badge}</span>}</td></tr>;
  const seenNow = seen.current; const fresh = (id: string) => !seenNow[id]; present.forEach(p => { seenNow[p.it.id] = 1; });
  const allProv = [...LAUNCHERS, ...INSTRUMENTS, ...PROPELLANTS, ...TARGETS].map(x => ({ id: x.id, name: x.name, prov: x.prov, val: "leoKg" in x ? `${nf(x.leoKg)} kg to LEO` : "massKg" in x ? `${nf(x.massKg, 3)} kg` : "isp" in x ? `Isp ${x.isp} s` : `${nf(x.dvMs)} m/s` }))
    .concat([{ id: "sim", name: "Cost and budget", prov: SIM_PROV, val: "game balance" }, { id: "perseverance", name: "Perseverance reference", prov: PERSEVERANCE.roverKg.prov, val: "1,025 kg rover · 59 kg instruments · MMRTG 110 W" }]);

  return (
    <Shell title={t("brand")} sub="REAL NUMBERS · EVERY VALUE HAS A RECEIPT" onBack={() => game.go("menu")}>
      <div className="mb-4 flex flex-wrap items-center gap-2 font-data text-[10.5px] tracking-widest">
        <span className="border border-dashed border-white/40 px-2 py-0.5 text-white/55">{t("data_badge")}</span>
        <button onClick={() => setSt(EDGE)} className="gbtn !px-3 !py-1 !text-[11px] gbtn-main">{t("demo")}</button>
        <button onClick={() => { setSt({ ...EDGE, bus: 3000, inst: [] }); setScore({ r: 0, t: 0 }); seen.current = {}; }} className="gbtn !px-3 !py-1 !text-[11px]">{t("reset")}</button>
        <button onClick={() => setDrawer(null)} className="gbtn !px-3 !py-1 !text-[11px]"><Receipt size={12} className="mr-1 inline" />{t("receipts")}</button>
        <span className="ml-auto flex">{(["en", "bn"] as const).map(l => <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)} className={`border border-white/30 px-2.5 py-1 ${lang === l ? "bg-[#e8a45a] text-black" : "text-white/70"}`}>{l === "en" ? "EN" : "বাংলা"}</button>)}</span>
      </div>
      <div className="grid gap-5 lg:grid-cols-[290px_1fr]">
        <section className="gp space-y-4 p-4" aria-label="Design controls">
          <div><Eyebrow>{t("launcher")}</Eyebrow><div className="mt-2">{chips(LAUNCHERS, "launcher")}</div></div>
          <div><Eyebrow>{t("target")}</Eyebrow><div className="mt-2">{chips(TARGETS, "target")}</div></div>
          <div><Eyebrow>{t("propellant")}</Eyebrow><div className="mt-2">{chips(PROPELLANTS, "propellant")}</div></div>
          <label className="block"><span className="flex justify-between font-data text-[10.5px] tracking-[0.2em] text-[#e8a45a]"><span>{t("bus")}</span><b className="text-white">{nf(st.bus)} {t("kg")}</b></span><input type="range" min={500} max={8000} step={10} value={st.bus} onChange={e => set({ bus: +e.target.value })} className="mt-1 w-full accent-[#944921]" /></label>
          <label className="block"><span className="flex justify-between font-data text-[10.5px] tracking-[0.2em] text-[#e8a45a]"><span>{t("load")}</span><b className="text-white">{nf(st.load)} {t("kg")}</b></span><input type="range" min={0} max={15000} step={50} value={st.load} onChange={e => set({ load: +e.target.value })} className="mt-1 w-full accent-[#944921]" /></label>
          <div>
            <div className="flex items-center justify-between"><Eyebrow>{t("instruments")}</Eyebrow><button aria-pressed={predict} onClick={() => setPredict(!predict)} className="font-data text-[10px] tracking-widest text-white/55">{t("predict")} · <b className={predict ? "text-[#53CBB8]" : ""}>{predict ? t("predict_on") : t("predict_off")}</b></button></div>
            <div className="mt-2 space-y-px">{INSTRUMENTS.map(it => { const on = st.inst.includes(it.id); return (
              <button key={it.id} aria-pressed={on} onClick={() => toggle(it.id)} className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-white/10 px-2 py-1.5 text-left text-[13px] transition-colors ${on ? "bg-[#944921]/45 text-white" : "bg-black/20 hover:bg-white/5"}`}>
                <span>{it.name}</span><span className="font-data text-[11px] text-white/55">{nf(it.massKg, 1)} {t("kg")}</span>{Badge(it.prov, it.id)}</button>); })}</div>
          </div>
        </section>
        <section className="min-w-0 space-y-5">
          <div className="gp relative overflow-hidden">
            {banner && <div role="status" className={`absolute inset-x-3 top-3 z-10 flex flex-wrap items-center gap-3 border-l-4 bg-[#e9dcc4] px-4 py-2.5 text-[13px] text-[#2a1a10] shadow-xl ${banner.ask ? "border-[#944921]" : banner.good ? "border-[#53CBB8]" : "border-[#FD4E54]"}`}>
              <p className="min-w-[200px] flex-1 font-medium">{banner.q ?? banner.msg}</p>
              {banner.ask && <><button onClick={() => answer(true)} className="bg-[#2a1a10] px-5 py-1.5 tracking-widest text-[#e9dcc4]">{t("yes")}</button><button onClick={() => answer(false)} className="bg-[#652E15] px-5 py-1.5 tracking-widest text-[#e9dcc4]">{t("no")}</button></>}</div>}
            <svg viewBox="0 0 900 460" role="img" aria-label="Wireframe spacecraft with instrument labels" className="block w-full bg-gradient-to-b from-[#0e1820]/85 to-[#14100c]/75">
              <defs><clipPath id="cl-t1"><circle cx="315" cy="282" r="36" /></clipPath><clipPath id="cl-t2"><circle cx="405" cy="282" r="36" /></clipPath></defs>
              <g fill="none" stroke="#7FD6E8" strokeWidth="1.2" className="cl-wire">
                <rect pathLength="1" x="200" y="210" width="320" height="14" /><polygon pathLength="1" points="230,224 490,224 450,330 270,330" />
                <circle pathLength="1" cx="315" cy="282" r="36" /><circle pathLength="1" cx="405" cy="282" r="36" /><polygon pathLength="1" points="345,330 375,330 398,386 322,386" />
                <path pathLength="1" d="M270 330 L212 402 H190 M450 330 L508 402 H530" /><path pathLength="1" d="M300 224 V250 M420 224 V250 M360 224 V330" /></g>
              <g fill="rgba(219,166,113,.5)"><rect x="270" y={282 + r - hh} width="90" height={hh} clipPath="url(#cl-t1)" style={{ transition: "all .6s cubic-bezier(.3,1.4,.5,1)" }} /><rect x="360" y={282 + r - hh} width="90" height={hh} clipPath="url(#cl-t2)" style={{ transition: "all .6s cubic-bezier(.3,1.4,.5,1)" }} /></g>
              {present.map((p, n) => { const cx = SLOTS[p.i], h = Math.min(52, 14 + p.it.massKg * 1.6), top = 210 - h, ly = 150 - (present.length - 1 - n) * 22, nw = fresh(p.it.id); return (
                <g key={p.it.id}>
                  <rect className={nw ? "cl-drop" : ""} x={cx - 15} y={top} width="30" height={h} fill="rgba(127,214,232,.12)" stroke="#DBA671" strokeWidth="1.2" />
                  <path className={nw ? "cl-lead" : ""} pathLength="1" d={`M${cx} ${top} V${ly} H584`} fill="none" stroke="#DBA671" strokeWidth=".9" strokeDasharray={nw ? undefined : "1"} />
                  <g tabIndex={0} role="button" aria-label={p.it.name} className="cursor-pointer" transform={`translate(590 ${ly + 4})`} onClick={() => setDrawer(p.it.id)} onKeyDown={e => { if (e.key === "Enter") setDrawer(p.it.id); }}>
                    <text fill="#e9dcc4" fontSize="11" fontFamily="monospace">{p.it.name.toUpperCase()}  {nf(p.it.massKg, 1)} {t("kg")}  <tspan fill="#9A755E" fontSize="8.5">[{t(`k_${p.it.prov.kind}`)}]</tspan></text></g>
                </g>); })}
              <text x="360" y="425" textAnchor="middle" fill="#9A755E" fontSize="10" fontFamily="monospace" letterSpacing="1.2">{P.name.toUpperCase()} · {nf(st.load)} {t("kg")} · {nf(Math.round(lvl * 100))}% {t("fill")}</text>
            </svg>
            <p className="px-4 pb-3 pt-2 font-data text-[11px] text-white/45">{t("pad_note")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.1fr]">
            <figure className="gp m-0 p-2 text-center">{Dial({ f: 0.5 + Math.max(-1, Math.min(1, res.dvMarginPct / 10)) * 0.5, red: 0.5, ticks: [[0, "−10"], [0.5, "0"], [1, "+10"]] })}<figcaption className="font-data text-[10.5px] tracking-widest text-white/55">{t("dial_dv")}<b className="block text-[15px] tracking-normal text-white">{sg(dvM, 1)} {t("ms")} ({sg(res.dvMarginPct, 2)}%)</b></figcaption></figure>
            <figure className="gp m-0 p-2 text-center">{Dial({ f: res.massMarginPct < 0 ? 0 : res.massMarginPct / 100, red: 0.02, ticks: [[0, "0"], [0.5, "50"], [1, "100"]] })}<figcaption className="font-data text-[10.5px] tracking-widest text-white/55">{t("dial_mass")}<b className="block text-[15px] tracking-normal text-white">{sg(res.massMarginPct, 1)}%</b></figcaption></figure>
            <div className="flex flex-col items-center justify-center gap-3">
              <span key={String(res.closes)} className={`cl-stamp inline-block -rotate-[5deg] border-[3px] px-4 py-1 text-center font-display text-2xl tracking-[0.14em] ${res.closes ? "border-[#53CBB8] text-[#53CBB8]" : "border-[#FD4E54] text-[#FD4E54]"}`}>{t(res.closes ? "closes" : "fails")}</span>
              <div className="flex items-center gap-3 font-data text-[10.5px] tracking-widest text-white/60"><button disabled={!st.inst.length} onClick={removeLast} aria-label={t("remove")} className="relative h-[26px] w-[54px] rounded-full border-2 border-[#9A755E] bg-[#1d120b] disabled:opacity-40"><span className="absolute top-[2px] h-[18px] w-[18px] rounded-full transition-all duration-300" style={{ left: flip ? 29 : 3, background: flip ? "#FD4E54" : "#DBA671" }} /></button>{st.inst.length ? t("remove") : t("remove_none")}</div>
            </div>
          </div>
          <div className="relative bg-[#e9dcc4] py-3 pl-6 pr-4 text-[#2a1a10]" style={{ clipPath: "polygon(0 0,100% 0,100% 100%,14px 100%,0 calc(100% - 14px))" }}>
            <span className="absolute left-2 top-3 h-2 w-2 rounded-full bg-[#25130B]" /><h3 className="font-display text-sm tracking-[0.24em] text-[#652E15]">{t("tag_title")}</h3>
            <p className="text-[13.5px]">{res.closes ? t("tag_ok", { kg: nf(spare, 1) }) : fix()}</p></div>
          <div className="flex flex-wrap items-center gap-4"><Btn main icon={<Rocket size={16} />} onClick={fly}>{t("fly")}</Btn><span className="font-data text-[11px] tracking-widest text-white/50">{t("score")} <b className="text-white">{score.t ? `${nf(score.r)} / ${nf(score.t)}` : "—"}</b></span></div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="gp p-4"><Eyebrow>{t("ledger")}</Eyebrow><table className="mt-2 w-full text-[13px]"><tbody>
              {row(t("row_wet"), `${nf(res.wetKg)} ${t("kg")}`, capOver)}{row(`${t("row_cap")} · ${L.name}`, `${nf(res.capacityKg)} ${t("kg")}`, false, Badge(L.prov, L.id))}
              {row(`${t("row_dv")} · Isp ${P.isp} s`, `${nf(res.dvAvailMs)} ${t("ms")}`, dvM < 0, Badge(P.prov, P.id))}{row(`${t("row_req")} · ${T.name}`, `${nf(res.dvRequiredMs)} ${t("ms")}`, false, Badge(T.prov, T.id))}
              {row(t("row_cost"), `${nf(cost)} ${t("unit_musd")}`, cost > budgetM, <Badge prov={SIM_PROV} id="sim" />)}{row(t("row_budget"), `${nf(budgetM)} ${t("unit_musd")}`)}</tbody></table>
              <p className="mt-2 text-[11.5px] text-white/50">{cost > budgetM ? t("over_budget") : t("in_budget")}</p></div>
            <div className="gp p-4"><Eyebrow>{t("report")}</Eyebrow><table className="mt-2 w-full text-[12.5px]"><thead><tr className="text-left font-data text-[10px] tracking-widest text-[#e8a45a]"><th></th><th>{t("rep_you")}</th><th className="text-right">{t("rep_real")}</th></tr></thead><tbody>
              {[[t("rep_launcher"), L.name, PERSEVERANCE.launcher], [t("rep_instr"), `${nf(mine, 1)} ${t("kg")}`, `59 (JPL) / 51.8 (Σ) ${t("kg")}`], [t("rep_count"), nf(st.inst.length), "7"], [t("rep_wet"), `${nf(res.wetKg)} ${t("kg")}`, t("rep_na")], [t("rep_power"), t("rep_nm"), `MMRTG ${PERSEVERANCE.mmrtgW.v} W`]].map(([a, b, c]) => <tr key={a} className="border-b border-white/10 align-top"><td className="py-1.5 text-white/55">{a}</td><td className="py-1.5">{b}</td><td className="py-1.5 text-right">{c}</td></tr>)}</tbody></table>
              <p className="mt-2 text-[11px] leading-snug text-white/45">{t("rep_note1")}</p><p className="mt-1 text-[11px] leading-snug text-white/45">{t("rep_note2")}</p></div>
          </div>
        </section>
      </div>
      {drawer !== false && <aside className="fixed inset-y-0 right-0 z-50 w-[min(440px,100%)] overflow-auto border-l-2 border-[#944921] bg-[#1a0f08] p-5" aria-label="Receipts">
        <div className="flex items-center justify-between"><h2 className="font-display text-base tracking-[0.2em]">{t("drawer_title")}</h2><button onClick={() => setDrawer(false)} className="gbtn !px-3 !py-1 !text-[11px]">{t("close")}</button></div>
        <div className="my-3 space-y-1 text-[11px] text-white/55">{(["nasa", "derived", "textbook", "unverified", "sim"] as const).map(k => <p key={k}>{t(`k_${k}`)} — {t(`k_${k}_d`)}</p>)}</div>
        {allProv.map(x => <div key={x.id} className={`border-t border-white/15 py-2.5 ${x.id === drawer ? "bg-[#944921]/30" : ""}`}><h4 className="flex justify-between gap-2 text-[14px]"><span>{x.name} · {x.val}</span><span className={`h-fit border px-1.5 text-[9px] ${KC[x.prov.kind]}`}>{t(`k_${x.prov.kind}`)}</span></h4>
          <p className="text-[11.5px] text-white/55">{t("dataset")}: {x.prov.dataset}</p>{x.prov.retrieved && <p className="text-[11.5px] text-white/55">{t("retrieved")}: {x.prov.retrieved}</p>}{x.prov.note && <p className="text-[11.5px] text-white/55">{t("note")}: {x.prov.note}</p>}
          {x.prov.url && <a href={x.prov.url} target="_blank" rel="noopener noreferrer" className="text-[11.5px] text-[#7FD6E8] underline">{t("open_src")}</a>}</div>)}
      </aside>}
      {flying && <div className="fixed inset-0 z-[60] bg-[#0b0604]"><canvas ref={cv} className="block h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-t from-black/85 to-transparent px-6 py-5"><p className={`font-display text-xl tracking-[0.14em] ${res.closes ? "text-[#53CBB8]" : "text-[#FD4E54]"}`}>{verdict()}</p><Btn main icon={<Undo2 size={15} />} onClick={closeFly}>{t("fly_close")}</Btn></div></div>}
    </Shell>
  );
}
