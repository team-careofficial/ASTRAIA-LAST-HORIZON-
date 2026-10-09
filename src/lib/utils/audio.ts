let ctx: AudioContext | null = null; let master: GainNode | null = null, musicG: GainNode | null = null, sfxG: GainNode | null = null, stormG: GainNode | null = null, noise: AudioBuffer | null = null;
export interface Mix { master: number; music: number; sfx: number; muted: boolean }
export function initAudio(): void {
  if (ctx || typeof window === "undefined") return;
  try {
    ctx = new AudioContext(); master = ctx.createGain(); musicG = ctx.createGain(); sfxG = ctx.createGain(); stormG = ctx.createGain(); stormG.gain.value = 0;
    musicG.connect(master); sfxG.connect(master); master.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 320; lp.connect(musicG);
    ([[55, "sawtooth", 0.02], [82.5, "sine", 0.05], [110.4, "sine", 0.04]] as const).forEach(([f, t, g]) => { const o = ctx!.createOscillator(), gn = ctx!.createGain(); o.type = t; o.frequency.value = f; gn.gain.value = g; o.connect(gn); gn.connect(lp); o.start(); });
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true; const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 500; src.connect(f); f.connect(stormG); stormG.connect(sfxG); src.start();
    setMix({ master: 0.8, music: 0.6, sfx: 0.8, muted: false });
  } catch { ctx = null; }
}
export function setMix(m: Mix): void { if (!master || !musicG || !sfxG) return; master.gain.value = m.muted ? 0 : m.master * 0.35; musicG.gain.value = m.music; sfxG.gain.value = m.sfx; }
export function stormLevel(l: number): void { if (stormG) stormG.gain.value = l * 0.5; }
type K = "click" | "hover" | "ok" | "warn" | "notify" | "static" | "fail";
export function sfx(k: K): void {
  if (!ctx || !sfxG) return;
  try {
    const t = ctx.currentTime;
    if (k === "static" && noise) { const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(); s.buffer = noise; f.type = "highpass"; f.frequency.value = 2000; g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4); s.connect(f); f.connect(g); g.connect(sfxG); s.start(); s.stop(t + 0.4); return; }
    const [f, d, v] = { click: [700, 0.06, 0.15], hover: [1100, 0.03, 0.05], ok: [820, 0.15, 0.15], warn: [260, 0.35, 0.2], notify: [980, 0.12, 0.15], fail: [200, 0.25, 0.18] }[k as Exclude<K, "static">];
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d); o.connect(g); g.connect(sfxG); o.start(); o.stop(t + d);
  } catch { /* audio is optional */ }
}
