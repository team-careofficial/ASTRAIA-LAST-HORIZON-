import { useMemo, useState } from "react";
import { Sprout, Play, RotateCcw } from "lucide-react";
import { game } from "@/game/engine/store";
import { runSol, newGh, GH, type GhSol, type GhState } from "@/compute/greenhouse";
import { solarWhPerSol } from "@/compute/solar";
import { MARS_SOLAR as S } from "@/data/real/solar";
import { Shell } from "./Pages";
import Btn from "@/components/ui/Btn";
import { Eyebrow, KindTag } from "@/components/ui/kit";

/** Mars greenhouse: water, light, temperature and power make food. Solar numbers are TEXTBOOK (see data/real/solar.ts); crop yields are SIM. */
const SKY: { id: string; name: string; tau: number }[] = [{ id: "clear", name: "Clear", tau: S.tau.clear }, { id: "hazy", name: "Hazy", tau: S.tau.hazy }, { id: "regional", name: "Regional storm", tau: S.tau.regional }, { id: "global", name: "Global storm", tau: S.tau.global }];
const Bar = ({ label, v, max, text, bad }: { label: string; v: number; max: number; text: string; bad?: boolean }) => (
  <div><div className="flex justify-between font-data text-[10.5px] tracking-widest"><span className="text-white/55">{label}</span><span className={bad ? "text-[#FD4E54]" : "text-white"}>{text}</span></div>
    <div className="mt-1 h-[6px] bg-white/10"><div className="h-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, (v / max) * 100))}%`, background: bad ? "#FD4E54" : "#e8a45a" }} /></div></div>
);
export default function Greenhouse() {
  const [sky, setSky] = useState("clear"), [c, setC] = useState({ lightHours: 12, tempC: 22, waterL: 12 }), [st, setSt] = useState<GhState>(newGh()), [last, setLast] = useState<GhSol | null>(null), [log, setLog] = useState<string[]>([]);
  const tau = SKY.find(x => x.id === sky)!.tau, env = { irradiance: S.irradiance.mean, tau };
  const solar = useMemo(() => solarWhPerSol({ ...env, dustCover: st.dustCover }), [tau, st.dustCover]);
  const step = (n: number) => { let s = st, l = last; const lines: string[] = []; for (let i = 0; i < n; i++) { const r = runSol(s, c, env); s = r.state; l = r.sol; lines.push(`Sol ${s.sol}: +${r.sol.yieldKg.toFixed(2)} kg · ${r.sol.note}`); } setSt(s); setLast(l); setLog(x => [...lines.reverse(), ...x].slice(0, 12)); };
  const avg = st.sol ? st.foodKg / st.sol : 0, pct = Math.round((avg / GH.targetKg) * 100);
  const Slider = (k: keyof typeof c, label: string, min: number, max: number, step: number, unit: string) => (
    <label className="block"><span className="flex justify-between font-data text-[10.5px] tracking-[0.2em] text-[#e8a45a]"><span>{label}</span><b className="text-white">{c[k]} {unit}</b></span>
      <input type="range" min={min} max={max} step={step} value={c[k]} onChange={e => setC({ ...c, [k]: +e.target.value })} className="mt-1 w-full accent-[#944921]" /></label>);
  return (
    <Shell title="MARS GREENHOUSE" sub="WATER · LIGHT · TEMPERATURE · POWER → FOOD" onBack={() => game.go("menu")}>
      <p className="mb-5 max-w-2xl text-[14.5px] text-white/70">Food needs light, warmth and water, and all three need power. Sunlight on Mars shrinks fast when dust fills the sky. Keep the crop growing through a storm.</p>
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <section className="gp space-y-4 p-4">
          <div><Eyebrow>SKY</Eyebrow><div className="mt-2 flex flex-wrap gap-1.5">{SKY.map(o => <button key={o.id} aria-pressed={sky === o.id} onClick={() => setSky(o.id)} className={`border px-2.5 py-1 font-data text-[11.5px] ${sky === o.id ? "border-[#e8a45a] bg-[#e8a45a] text-black" : "border-white/25 text-white/80 hover:border-[#e8a45a]"}`}>{o.name}</button>)}</div>
            <p className="mt-2 font-data text-[10.5px] text-white/45">Dust optical depth τ = {tau} <KindTag kind="sim" /></p></div>
          {Slider("lightHours", "LIGHT HOURS", 0, 16, 1, "h")}{Slider("tempC", "TEMPERATURE", 5, 35, 1, "°C")}{Slider("waterL", "WATER", 0, 20, 1, "L")}
          <div className="flex gap-2"><Btn main icon={<Play size={14} />} onClick={() => step(1)}>1 SOL</Btn><Btn onClick={() => step(5)}>5 SOLS</Btn><Btn icon={<RotateCcw size={14} />} onClick={() => { setSt(newGh()); setLast(null); setLog([]); }}>RESET</Btn></div>
        </section>
        <section className="space-y-4">
          <div className="gp grid gap-4 p-4 sm:grid-cols-2">
            <Bar label="SOLAR ENERGY TODAY" v={solar} max={50000} text={`${(solar / 1000).toFixed(1)} kWh`} bad={solar < 8000} />
            <Bar label="BATTERY" v={st.batteryWh} max={GH.batteryWh} text={`${(st.batteryWh / 1000).toFixed(1)} / ${GH.batteryWh / 1000} kWh`} bad={st.batteryWh < 8000} />
            <Bar label="POWER DEMAND" v={last?.demandWh ?? 0} max={50000} text={`${((last?.demandWh ?? 0) / 1000).toFixed(1)} kWh`} />
            <Bar label="CROP HEALTH" v={st.health} max={100} text={`${st.health}%`} bad={st.health < 40} />
            <Bar label="LIGHT" v={(last?.lightEff ?? 0) * 100} max={100} text={`${Math.round((last?.lightEff ?? 0) * 100)}%`} /><Bar label="TEMPERATURE FIT" v={(last?.tempEff ?? 0) * 100} max={100} text={`${Math.round((last?.tempEff ?? 0) * 100)}%`} />
            <Bar label="WATER FIT" v={(last?.waterEff ?? 0) * 100} max={100} text={`${Math.round((last?.waterEff ?? 0) * 100)}%`} /><Bar label="FOOD TARGET" v={pct} max={100} text={`${pct}% of ${GH.targetKg} kg/sol`} bad={st.sol > 2 && pct < 50} />
          </div>
          <div className="gp p-4"><div className="flex items-center justify-between"><Eyebrow>HARVEST · SOL {st.sol}</Eyebrow><span className="flex items-center gap-2 font-data text-lg text-[#e8a45a]"><Sprout size={18} />{st.foodKg.toFixed(1)} kg</span></div>
            <ul className="mt-3 max-h-48 space-y-1 overflow-auto font-data text-[12px] text-white/70">{log.length === 0 ? <li className="text-white/40">Run a sol to start.</li> : log.map((l, i) => <li key={i}>{l}</li>)}</ul></div>
          <p className="font-data text-[10.5px] leading-relaxed text-white/45">Solar irradiance {S.irradiance.mean} W/m² (mean) <KindTag kind="sim" /> is a TEXTBOOK value pending a check against the NASA Mars Fact Sheet. Crop yield and heater loss are game balance (SIM). Nothing here is random.</p>
        </section>
      </div>
    </Shell>
  );
}
