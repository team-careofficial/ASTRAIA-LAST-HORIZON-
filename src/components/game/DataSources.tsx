import { ExternalLink } from "lucide-react";
import { game } from "@/game/engine/store";
import { Shell } from "./Pages";
import { LAUNCHERS, INSTRUMENTS, PROPELLANTS, TARGETS, PERSEVERANCE, AGENCY_REFS, SIM_PROV, BUDGET_M, type Prov, type ProvKind } from "@/data/real/missionData";
import { MARS_SOLAR } from "@/data/real/solar";
import { SOURCES } from "@/data/knowledge/sources";
import { transferChecks, perseveranceMassGap } from "@/compute/validate";

const KIND: Record<ProvKind, { label: string; cls: string; desc: string }> = {
  nasa: { label: "NASA", cls: "text-[#53CBB8] border-[#53CBB8]", desc: "Printed on a NASA page" },
  derived: { label: "DERIVED", cls: "text-[#7FD6E8] border-[#7FD6E8]", desc: "We computed it from NASA values" },
  agency: { label: "OTHER AGENCY", cls: "text-[#B9A6FF] border-[#B9A6FF]", desc: "Printed by another space agency" },
  textbook: { label: "TEXTBOOK", cls: "text-[#DBA671] border-[#DBA671]", desc: "Standard engineering value, cross-checked where noted" },
  unverified: { label: "UNVERIFIED", cls: "text-[#FD4E54] border-[#FD4E54] border-dashed", desc: "Source still to be confirmed" },
  sim: { label: "SIM", cls: "text-white/60 border-white/40 border-dotted", desc: "Game balance, not a real value" },
};
type Row = { name: string; value: string; prov: Prov };
const nf = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 3 });
const GROUPS: { title: string; rows: Row[] }[] = [
  { title: "Launchers (capacity to low Earth orbit)", rows: LAUNCHERS.map(l => ({ name: l.name, value: `${nf(l.leoKg)} kg`, prov: l.prov })) },
  { title: "Instruments (mass)", rows: INSTRUMENTS.map(i => ({ name: i.name, value: `${nf(i.massKg)} kg`, prov: i.prov })) },
  { title: "Propellants (specific impulse)", rows: PROPELLANTS.map(p => ({ name: p.name, value: `${p.isp} s`, prov: p.prov })) },
  { title: "Transfer targets (delta-v the craft must supply)", rows: TARGETS.map(t => ({ name: t.name, value: `${nf(t.dvMs)} m/s`, prov: t.prov })) },
  { title: "Perseverance reference", rows: [["Rover mass", PERSEVERANCE.roverKg, "kg"], ["Launch stack", PERSEVERANCE.launchKg, "kg"], ["Seven instruments", PERSEVERANCE.instrumentsKg, "kg"], ["MMRTG power", PERSEVERANCE.mmrtgW, "W"]].map(([n, d, u]) => ({ name: n as string, value: `${nf((d as { v: number }).v)} ${u}`, prov: (d as { prov: Prov }).prov })) },
  { title: "Mars sunlight (greenhouse power)", rows: [{ name: "Irradiance at perihelion", value: `${MARS_SOLAR.irradiance.perihelion} W/m²`, prov: MARS_SOLAR.irradiance.prov }, { name: "Irradiance, mean", value: `${MARS_SOLAR.irradiance.mean} W/m²`, prov: { ...MARS_SOLAR.irradiance.prov, kind: "nasa", note: "This is the one irradiance value NASA prints on the sheet." } }, { name: "Irradiance at aphelion", value: `${MARS_SOLAR.irradiance.aphelion} W/m²`, prov: MARS_SOLAR.irradiance.prov }, { name: "Dust optical depth (clear to global storm)", value: `${MARS_SOLAR.tau.clear} to ${MARS_SOLAR.tau.global}`, prov: MARS_SOLAR.tau.prov }, { name: "Panel efficiency and dust loss", value: `${Math.round(MARS_SOLAR.panel.efficiency * 100)}% and ${MARS_SOLAR.panel.dustLossPerSol * 100}% per sol`, prov: MARS_SOLAR.panel.prov }] },
  { title: "Other space agencies", rows: AGENCY_REFS.map(a => ({ name: a.name, value: a.value, prov: a.prov })) },
  { title: "Game balance", rows: [{ name: "Mission budget and all costs", value: `${BUDGET_M} M$ budget`, prov: SIM_PROV }] },
];
const ALL = GROUPS.flatMap(g => g.rows);
const COUNTS = (Object.keys(KIND) as ProvKind[]).map(k => ({ k, n: ALL.filter(r => r.prov.kind === k).length }));
const LINKS = Array.from(new Map(ALL.filter(r => r.prov.url).map(r => [r.prov.url!, { url: r.prov.url!, name: r.prov.dataset.replace(/ \(.*/, ""), kind: r.prov.kind, retrieved: r.prov.retrieved }])).values());
const Tag = ({ k }: { k: ProvKind }) => <span title={KIND[k].desc} className={`shrink-0 border px-1.5 py-px font-data text-[9px] tracking-wider ${KIND[k].cls}`}>{KIND[k].label}</span>;

export default function DataSources() {
  const checks = transferChecks(), gap = perseveranceMassGap();
  const nasaN = COUNTS.filter(c => c.k === "nasa" || c.k === "derived").reduce((a, c) => a + c.n, 0);
  return (
    <Shell title="DATA & SOURCES" sub="EVERY NUMBER HAS A RECEIPT" onBack={() => game.go("menu")}>
      <p className="mb-5 max-w-3xl text-[15px] leading-snug text-white/80">ASTRAIA uses NASA published data for launcher capacity, instrument masses, the Perseverance reference and Mars and Moon facts. <b className="text-white">{nasaN} of {ALL.length}</b> values below are printed by NASA or computed by us directly from NASA values. Anything else carries its own tag, so nothing looks more certain than it is.</p>
      <div className="stagger mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{COUNTS.map(c => <div key={c.k} className="gp p-3"><b className="font-display text-2xl">{c.n}</b><div className="mt-1.5"><Tag k={c.k} /></div><p className="mt-1.5 text-[11.5px] leading-tight text-white/55">{KIND[c.k].desc}</p></div>)}</div>

      <h2 className="mb-2 font-ui text-sm font-bold tracking-[0.2em] text-[#e8a45a]">VALIDATION · DO OUR HARD NUMBERS HOLD UP?</h2>
      <div className="mb-6 grid gap-3 md:grid-cols-2">{checks.map(c => (
        <div key={c.id} className="gp p-4"><div className="flex items-baseline justify-between gap-3"><h3 className="text-[15px] font-semibold">{c.label}</h3><Tag k="derived" /></div>
          <p className="mt-2 font-data text-[13px] text-white/85">Re-derived from orbit mechanics: <b>{nf(c.derivedMs)} m/s</b></p>
          <p className="font-data text-[13px] text-white/85">Game uses: <b>{nf(c.gameMs)} m/s</b> <span className="text-white/55">(+{c.pct.toFixed(1)}% margin)</span></p>
          <p className="mt-2 text-[12.5px] leading-snug text-white/60">Burn from a 400 km parking orbit. The game value is slightly higher, so a design that passes here has real room to spare.{c.id === "mars" ? " Orbit sizes come from the NASA Earth and Mars fact sheets." : " Moon distance comes from the NASA Moon fact sheet."}</p></div>))}
        <div className="gp p-4 md:col-span-2"><h3 className="text-[15px] font-semibold">Perseverance instrument mass: we show a gap instead of hiding it</h3><p className="mt-2 text-[13px] leading-snug text-white/70">JPL states the seven instruments weigh <b>{gap.statedKg} kg</b>. Adding the per-instrument NASA figures gives <b>{nf(gap.sumKg)} kg</b>, a difference of {nf(gap.gapKg)} kg. Both numbers appear in the Mission Report.</p></div>
      </div>

      <h2 className="mb-2 font-ui text-sm font-bold tracking-[0.2em] text-[#e8a45a]">SOURCE PAGES</h2>
      <div className="mb-6 grid gap-2 md:grid-cols-2">{[...LINKS, ...Object.values(SOURCES).map(s => ({ url: s.url, name: s.name, kind: "nasa" as ProvKind, retrieved: s.retrieved }))].map(l => (
        <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="gp group flex items-center justify-between gap-3 p-3 transition-colors hover:border-[#e8a45a]"><span className="min-w-0"><span className="block truncate text-[13.5px]">{l.name}</span><span className="block font-data text-[10px] tracking-widest text-white/45">{l.retrieved ? `READ ${l.retrieved}` : "LINK"}</span></span><ExternalLink size={15} className="shrink-0 text-[#e8a45a]" /></a>))}</div>

      <h2 className="mb-2 font-ui text-sm font-bold tracking-[0.2em] text-[#e8a45a]">ALL VALUES</h2>
      <div className="space-y-2">{GROUPS.map((g, gi) => (
        <details key={g.title} open={gi === 0} className="gp group"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-[14px] font-semibold"><span>{g.title}</span><span className="font-data text-[10px] tracking-widest text-white/45">{g.rows.length}</span></summary>
          <div className="divide-y divide-white/10 border-t border-white/10">{g.rows.map(r => (
            <div key={r.name} className="px-3 py-2.5 text-[13px]"><div className="flex items-baseline justify-between gap-3"><span>{r.name}</span><span className="flex items-center gap-2 font-data text-[12px]">{r.value}<Tag k={r.prov.kind} /></span></div>
              <p className="mt-1 text-[11.5px] leading-snug text-white/50">{r.prov.dataset}{r.prov.note ? ` · ${r.prov.note}` : ""}{r.prov.url && <> · <a href={r.prov.url} target="_blank" rel="noreferrer" className="underline decoration-[#e8a45a]/60 underline-offset-2 hover:text-[#e8a45a]">source</a></>}</p>
              {r.prov.xcheck && <p className="mt-1 text-[11.5px] leading-snug text-[#7FD6E8]">NASA cross-check: {r.prov.xcheck.text} · <a href={r.prov.xcheck.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">source</a></p>}</div>))}</div></details>))}</div>
      <p className="mt-6 max-w-3xl text-[12.5px] leading-snug text-white/50">Honest limits: ASTRAIA does not pull a live NASA feed. Mars and Moon facts are copied from the NASA NSSDC fact sheets (Mars sheet updated 19 May 2025, Moon sheet 11 January 2024). Cost and budget are game balance, not real prices.</p>
    </Shell>
  );
}
