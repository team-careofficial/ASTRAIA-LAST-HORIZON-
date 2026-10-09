import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

/* ---------- deterministic noise ---------- */
const fr = (n: number) => n - Math.floor(n);
const h2 = (x: number, z: number) => fr(Math.sin(x * 127.1 + z * 311.7) * 43758.5453);
export const vnoise = (x: number, z: number) => {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  return h2(xi, zi) * (1 - u) * (1 - v) + h2(xi + 1, zi) * u * (1 - v) + h2(xi, zi + 1) * (1 - u) * v + h2(xi + 1, zi + 1) * u * v;
};
export const fbm = (x: number, z: number, o = 4) => { let a = 0.5, s = 0, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; };
export const rng = (seed: number) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

/* ---------- procedural surface texture (no image files needed) ---------- */
export function useGroundTexture(moon: boolean, repeat = 24) {
  return useMemo(() => {
    if (typeof document === "undefined") return { map: null, bump: null };
    const N = 256, c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d")!, im = g.createImageData(N, N), b = document.createElement("canvas"); b.width = b.height = N;
    const bg = b.getContext("2d")!, bi = bg.createImageData(N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const u = x / 16, v = y / 16, n = fbm(u, v, 5), f = fbm(u * 5, v * 5, 3), sp = h2(x, y) > 0.985 ? 0.35 : 0, i = (y * N + x) * 4, k = 0.55 + n * 0.6 + (f - 0.5) * 0.35 - sp;
      const base = moon ? [215, 215, 220] : [230, 205, 185];
      im.data[i] = Math.min(255, base[0] * k); im.data[i + 1] = Math.min(255, base[1] * k); im.data[i + 2] = Math.min(255, base[2] * k); im.data[i + 3] = 255;
      const hv = Math.min(255, (n * 0.6 + f * 0.4 + (h2(x, y) - 0.5) * 0.12) * 255); bi.data[i] = bi.data[i + 1] = bi.data[i + 2] = hv; bi.data[i + 3] = 255;
    }
    g.putImageData(im, 0, 0); bg.putImageData(bi, 0, 0);
    const mk = (cv: HTMLCanvasElement, srgb: boolean) => { const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 4; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
    return { map: mk(c, true), bump: mk(b, false) };
  }, [moon, repeat]);
}

/** Smooth, textured ground. `height` decides the shape; colours vary with noise, slope and elevation. */
export function Ground({ size = 360, seg = 160, height, moon = false, receive = true, bumpScale = 1.4 }: { size?: number; seg?: number; height: (x: number, z: number) => number; moon?: boolean; receive?: boolean; bumpScale?: number }) {
  const tex = useGroundTexture(moon, size / 14);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) p.setY(i, height(p.getX(i), p.getZ(i)));
    g.computeVertexNormals(); const nrm = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = p.getY(i), n = fbm(x * 0.05, z * 0.05, 3), sl = 1 - nrm.getY(i), r = Math.hypot(x, z);
      if (moon) c.setHSL(0.6, 0.03, 0.3 + 0.22 * n - sl * 0.5 + y * 0.012);
      else c.setHSL(0.047 + 0.012 * n, 0.5 + 0.1 * n, 0.3 + 0.2 * n - sl * 0.55 + y * 0.01 - Math.min(0.1, r * 0.0003));
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3)); return g;
  }, [size, seg, height, moon]);
  return <mesh geometry={geo} receiveShadow={receive}><meshStandardMaterial vertexColors map={tex.map} bumpMap={tex.bump} bumpScale={bumpScale} roughness={moon ? 0.97 : 0.93} metalness={0} /></mesh>;
}

/* ---------- natural-looking rocks: noisy icosahedra, three shape variants, instanced ---------- */
function rockGeo(seed: number) {
  const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position, r = rng(seed), sx = 0.8 + r() * 0.5, sz = 0.7 + r() * 0.5;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = vnoise(x * 2 + seed, z * 2 + y) * 0.55 + vnoise(x * 5, y * 5 + z * 3) * 0.25 + 0.55;
    p.setXYZ(i, x * n * sx, Math.max(y * n * 0.75, -0.25), z * n * sz);
  }
  g.computeVertexNormals(); return g;
}
export function RockField({ count = 200, seed = 5, rMin = 10, rMax = 150, size = 1, height, color = "#6e3420", avoid = [], moon = false, shadows = true }: { count?: number; seed?: number; rMin?: number; rMax?: number; size?: number; height: (x: number, z: number) => number; color?: string; avoid?: [number, number, number][]; moon?: boolean; shadows?: boolean }) {
  const refs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)];
  const geos = useMemo(() => [rockGeo(seed + 1), rockGeo(seed + 7), rockGeo(seed + 13)], [seed]);
  const per = Math.ceil(count / 3);
  useLayoutEffect(() => {
    const r = rng(seed), o = new THREE.Object3D(), col = new THREE.Color();
    refs.forEach(ref => {
      const m = ref.current; if (!m) return; let k = 0;
      for (let tries = 0; k < per && tries < per * 6; tries++) {
        const a = r() * 6.283, d = rMin + Math.sqrt(r()) * (rMax - rMin), x = Math.cos(a) * d, z = Math.sin(a) * d;
        if (avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue;
        const big = r() < 0.12, sc = (big ? 1.6 + r() * 2.2 : 0.18 + Math.pow(r(), 2) * 1.3) * size;
        o.position.set(x, height(x, z) + sc * 0.12, z); o.scale.set(sc * (0.8 + r() * 0.5), sc * (0.6 + r() * 0.5), sc * (0.8 + r() * 0.5)); o.rotation.set((r() - 0.5) * 0.4, r() * 6.28, (r() - 0.5) * 0.4); o.updateMatrix(); m.setMatrixAt(k, o.matrix);
        col.set(color).offsetHSL(0, (r() - 0.5) * 0.08, (r() - 0.5) * 0.12); m.setColorAt(k, col); k++;
      }
      m.count = k; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });
  }, [seed, rMin, rMax, size, height, color, avoid, per]); // eslint-disable-line react-hooks/exhaustive-deps
  return <>{geos.map((g, i) => <instancedMesh key={i} ref={refs[i]} args={[g, undefined, per]} castShadow={shadows} receiveShadow><meshStandardMaterial flatShading roughness={moon ? 0.95 : 0.9} metalness={0.02} /></instancedMesh>)}</>;
}

/* ---------- decals: footprints and wheel tracks, pooled so nothing is allocated while playing ---------- */
type Kind = "track" | "foot";
const UP = new THREE.Vector3(0, 1, 0);
const pools: Partial<Record<Kind, (x: number, y: number, z: number, yaw: number, tilt?: [number, number]) => void>> = {};
export const decals = { push: (k: Kind, x: number, y: number, z: number, yaw: number, tilt?: [number, number]) => pools[k]?.(x, y, z, yaw, tilt) };
export function DecalPool({ kind, max = 600, w, l, color = "#1d0e08", opacity = 0.42 }: { kind: Kind; max?: number; w: number; l: number; color?: string; opacity?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null), i = useRef(0), o = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => { const m = ref.current!; o.scale.setScalar(0); o.updateMatrix(); for (let k = 0; k < max; k++) m.setMatrixAt(k, o.matrix); m.instanceMatrix.needsUpdate = true; }, [max, o]);
  useEffect(() => {
    pools[kind] = (x, y, z, yaw, tilt) => { const m = ref.current; if (!m) return; o.position.set(x, y + 0.03, z); o.rotation.set(-Math.PI / 2 + (tilt?.[0] ?? 0), 0, 0); o.rotateOnWorldAxis(UP, yaw); o.scale.set(1, 1, 1); o.updateMatrix(); m.setMatrixAt(i.current, o.matrix); i.current = (i.current + 1) % max; m.instanceMatrix.needsUpdate = true; };
    return () => { delete pools[kind]; };
  }, [kind, max, o]);
  return <instancedMesh ref={ref} args={[undefined, undefined, max]} frustumCulled={false} renderOrder={2}><planeGeometry args={[w, l]} /><meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} polygonOffset polygonOffsetFactor={-2} /></instancedMesh>;
}

/* ---------- soft sun glow billboard (additive, no texture file) ---------- */
export function useGlowTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!, gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,244,220,1)"); gr.addColorStop(0.18, "rgba(255,200,140,.55)"); gr.addColorStop(0.5, "rgba(255,150,90,.12)"); gr.addColorStop(1, "rgba(255,120,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
}
export function SunGlow({ position, size = 90, color = "#ffc489" }: { position: [number, number, number]; size?: number; color?: string }) {
  const t = useGlowTexture(); if (!t) return null;
  return <sprite position={position} scale={[size, size, 1]} renderOrder={-4}><spriteMaterial map={t} color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} /></sprite>;
}
/** A ring of distant mesas and ridges, seen through haze. Cheap silhouettes that give the horizon depth. */
export function Horizon({ radius = 230, color = "#6d3a28", count = 22, seed = 3, moon = false, fogged = true }: { radius?: number; color?: string; count?: number; seed?: number; moon?: boolean; fogged?: boolean }) {
  const items = useMemo(() => { const r = rng(seed); return Array.from({ length: count }, (_, i) => { const a = (i / count) * 6.283 + r() * 0.2; return { a, d: radius * (0.9 + r() * 0.25), w: 30 + r() * 70, h: 10 + r() * (moon ? 26 : 38), mesa: !moon && r() < 0.45 }; }); }, [count, radius, seed, moon]);
  return <>{items.map((m, i) => <mesh key={i} position={[Math.cos(m.a) * m.d, m.h * 0.35, Math.sin(m.a) * m.d]} rotation-y={-m.a} scale={[m.w, m.h, m.w * 0.8]}>
    {m.mesa ? <cylinderGeometry args={[0.55, 1, 1, 7]} /> : <coneGeometry args={[0.8, 1, 6]} />}<meshStandardMaterial color={color} roughness={1} flatShading fog={fogged} /></mesh>)}</>;
}

/** Procedural image-based lighting: gives metal, glass and visors something to reflect. No network, no HDR file. */
export function SceneEnv({ moon = false, intensity = 1 }: { moon?: boolean; intensity?: number }) {
  const k = intensity;
  return <Environment resolution={64} frames={1}>
    <Lightformer form="rect" intensity={(moon ? 5 : 3.2) * k} color={moon ? "#fff6ea" : "#ffd2a0"} position={[-6, 4, -5]} scale={[10, 4, 1]} />
    <Lightformer form="rect" intensity={(moon ? 0.2 : 1.1) * k} color={moon ? "#8aa6d0" : "#e8a070"} position={[5, 2, 4]} scale={[10, 3, 1]} />
    <Lightformer form="ring" intensity={(moon ? 0.6 : 0.8) * k} color="#9bb8d4" position={[0, 7, 0]} scale={4} rotation-x={Math.PI / 2} />
    <Lightformer form="rect" intensity={0.5 * k} color={moon ? "#303038" : "#6a3a28"} position={[0, -3, 0]} scale={[20, 6, 1]} rotation-x={Math.PI / 2} />
  </Environment>;
}

/** Earth as seen from the Moon: blue ocean, noisy white cloud, painted on a canvas. */
export function EarthBall({ position, r = 9 }: { position: [number, number, number]; r?: number }) {
  const t = useMemo(() => {
    if (typeof document === "undefined") return null;
    const W = 256, H = 128, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d")!, im = g.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, land = fbm(x / 28, y / 28, 4) > 0.56, cl = fbm(x / 14 + 9, y / 10 + 3, 4), polar = Math.abs(y - H / 2) > H * 0.43;
      let R = 20, G = 60, B = 130; if (land) { R = 70; G = 110; B = 60; } const w = Math.max(polar ? 1 : 0, (cl - 0.5) * 2.4); R += (240 - R) * w; G += (244 - G) * w; B += (250 - B) * w;
      im.data[i] = R; im.data[i + 1] = G; im.data[i + 2] = B; im.data[i + 3] = 255;
    }
    g.putImageData(im, 0, 0); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
  }, []);
  const ref = useRef<THREE.Mesh>(null);
  useLayoutEffect(() => { if (ref.current) ref.current.rotation.set(0.3, 2.2, 0.2); }, []);
  return <mesh ref={ref} position={position} renderOrder={-5}><sphereGeometry args={[r, 40, 28]} /><meshStandardMaterial map={t} emissiveMap={t} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.8} fog={false} /></mesh>;
}

/* ---------- pooled dust puffs kicked up by wheels or boots ---------- */
let emitFn: ((x: number, y: number, z: number, vx: number, vz: number, n: number, spread?: number) => void) | null = null;
export const dustFx = { emit: (x: number, y: number, z: number, vx: number, vz: number, n: number, spread = 0.6) => emitFn?.(x, y, z, vx, vz, n, spread) };
export function DustFx({ max = 220, color = "#c89a74", size = 1.6 }: { max?: number; color?: string; size?: number }) {
  const ref = useRef<THREE.Points>(null), st = useMemo(() => ({ pos: new Float32Array(max * 3), vel: new Float32Array(max * 3), life: new Float32Array(max), i: 0 }), [max]), tex = useGlowTexture();
  useEffect(() => {
    emitFn = (x, y, z, vx, vz, n, spread = 0.6) => { for (let k = 0; k < n; k++) { const i = st.i; st.i = (st.i + 1) % max; st.pos.set([x + (Math.random() - 0.5) * spread, y + 0.1, z + (Math.random() - 0.5) * spread], i * 3); st.vel.set([vx * 0.25 + (Math.random() - 0.5) * 0.8, 0.5 + Math.random() * 0.9, vz * 0.25 + (Math.random() - 0.5) * 0.8], i * 3); st.life[i] = 1; } };
    return () => { emitFn = null; };
  }, [max, st]);
  useFrame((_, dt) => {
    const g = ref.current; if (!g) return; const p = g.geometry.attributes.position as THREE.BufferAttribute, sz = g.geometry.attributes.aSize as THREE.BufferAttribute | undefined;
    for (let i = 0; i < max; i++) { if (st.life[i] > 0) { st.life[i] -= dt * 0.55; st.pos[i * 3] += st.vel[i * 3] * dt; st.pos[i * 3 + 1] += st.vel[i * 3 + 1] * dt; st.pos[i * 3 + 2] += st.vel[i * 3 + 2] * dt; st.vel[i * 3 + 1] *= 0.97; if (sz) sz.setX(i, st.life[i] > 0 ? size * (1.6 - st.life[i]) : 0); } else { st.pos[i * 3 + 1] = -999; } }
    p.needsUpdate = true; if (sz) sz.needsUpdate = true;
  });
  return <points ref={ref} frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" array={st.pos} count={max} itemSize={3} /></bufferGeometry>
    <pointsMaterial map={tex ?? undefined} color={color} size={size * 0.9} sizeAttenuation transparent opacity={0.32} depthWrite={false} blending={THREE.NormalBlending} /></points>;
}
