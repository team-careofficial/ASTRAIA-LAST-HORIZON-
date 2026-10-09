import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Glb, MODEL_CFG, useAsset } from "./Models";
import * as THREE from "three";

export const Metal = ({ c = "#b9b4aa", r = 0.5, m = 0.5 }: { c?: string; r?: number; m?: number }) => <meshStandardMaterial color={c} roughness={r} metalness={m} />;

/** Photovoltaic cell texture drawn on a canvas. */
export function usePanelTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas"); c.width = 128; c.height = 64; const g = c.getContext("2d")!;
    g.fillStyle = "#0e1a33"; g.fillRect(0, 0, 128, 64); g.strokeStyle = "#3d5a8c"; g.lineWidth = 1;
    for (let x = 0; x <= 128; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 64); g.stroke(); } for (let y = 0; y <= 64; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(128, y); g.stroke(); }
    g.strokeStyle = "rgba(160,190,230,.25)"; for (let x = 8; x < 128; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 64); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }, []);
}
export function SolarPanel({ w = 2.4, l = 1.5, tilt = -0.7 }: { w?: number; l?: number; tilt?: number }) {
  const t = usePanelTexture();
  return <group rotation-x={tilt}><mesh castShadow receiveShadow><boxGeometry args={[w, 0.06, l]} /><meshStandardMaterial color="#9aa3b4" roughness={0.4} metalness={0.6} /></mesh>
    <mesh position-y={0.036}><planeGeometry args={[w - 0.1, l - 0.1]} /><meshStandardMaterial map={t} color="#cfd8ff" roughness={0.18} metalness={0.8} /></mesh></group>;
}
export function SolarField({ position = [0, 0, 0] as [number, number, number], cols = 4, rows = 2, rotY = 0 }: { position?: [number, number, number]; cols?: number; rows?: number; rotY?: number }) {
  return <group position={position} rotation-y={rotY}>{Array.from({ length: cols * rows }, (_, i) => { const c = i % cols, r = Math.floor(i / cols); return (
    <group key={i} position={[(c - (cols - 1) / 2) * 2.7, 0, r * 3.1]}>
      {[-0.9, 0.9].map(x => <mesh key={x} position={[x, 0.45, 0.3]} castShadow><cylinderGeometry args={[0.05, 0.06, 0.9, 6]} /><Metal c="#6d6a65" /></mesh>)}
      <group position={[0, 1.15, 0]}><SolarPanel /></group></group>); })}</group>;
}
/** Cable that sags between two points. */
export function Cable({ pts, color = "#1c1a19", r = 0.035, sag = 0.25 }: { pts: [number, number, number][]; color?: string; r?: number; sag?: number }) {
  const geo = useMemo(() => { const v = pts.map(p => new THREE.Vector3(...p)), mid: THREE.Vector3[] = []; for (let i = 0; i < v.length - 1; i++) { mid.push(v[i]); const m = v[i].clone().lerp(v[i + 1], 0.5); m.y = Math.max(0.04, m.y - sag); mid.push(m); } mid.push(v[v.length - 1]); return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(mid), 32, r, 5, false); }, [pts, r, sag]);
  return <mesh geometry={geo} castShadow><meshStandardMaterial color={color} roughness={0.7} /></mesh>;
}
export function Dish({ position = [0, 0, 0] as [number, number, number], h = 7, aim = [0.9, 0.5] as [number, number], blink = true }: { position?: [number, number, number]; h?: number; aim?: [number, number]; blink?: boolean }) {
  const l = useRef<THREE.MeshBasicMaterial>(null), d = useRef<THREE.Group>(null);
  useFrame(s => { if (l.current && blink) l.current.color.setRGB(1, 0.12, 0.05).multiplyScalar(Math.sin(s.clock.elapsedTime * 3) > 0.3 ? 1 : 0.12); if (d.current) d.current.rotation.y = aim[0] + Math.sin(s.clock.elapsedTime * 0.15) * 0.08; });
  return (
    <group position={position}>
      <mesh position-y={0.25} castShadow><cylinderGeometry args={[0.9, 1.1, 0.5, 10]} /><Metal c="#7d7a74" /></mesh>
      <mesh position-y={h / 2} castShadow><cylinderGeometry args={[0.1, 0.22, h, 8]} /><Metal c="#c9c5bc" /></mesh>
      {[1.5, 3, 4.5, 6].filter(y => y < h).map((y, i) => <mesh key={y} position-y={y} rotation-y={i}><boxGeometry args={[0.9 - y * 0.05, 0.05, 0.05]} /><Metal c="#9a968f" /></mesh>)}
      <group ref={d} position-y={h}><group rotation-x={-aim[1]} position-y={0.2}>
        <mesh castShadow><sphereGeometry args={[1.3, 24, 10, 0, 6.283, 0, 1.0]} /><meshStandardMaterial color="#e6e1d6" roughness={0.35} metalness={0.5} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.03, 0.03, 1.1, 6]} /><Metal c="#6d6a65" /></mesh><mesh position={[0, 1.5, 0]}><boxGeometry args={[0.22, 0.18, 0.22]} /><Metal c="#2a2826" /></mesh></group></group>
      <mesh position-y={h + 0.9}><sphereGeometry args={[0.12, 8, 8]} /><meshBasicMaterial ref={l} color="#ff2a10" toneMapped={false} /></mesh>
    </group>
  );
}
/** Pressurised habitat: ribbed main module, airlock, secondary module, windows, tunnel, lights. powerRef lets lights dim in a power crisis. */
export function Habitat({ position = [0, 0, 0] as [number, number, number], rotY = 0, scale = 1, glow = 1.4, lit = true, annex = true }: { position?: [number, number, number]; rotY?: number; scale?: number; glow?: number; lit?: boolean; annex?: boolean }) {
  const win = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffd9a0", emissive: "#ffb35c", emissiveIntensity: glow }), [glow]);
  useEffect(() => { win.emissiveIntensity = lit ? glow : 0.15; }, [win, glow, lit]);
  const glb = useAsset("/models/habitat.glb");
  return (
    <group position={position} rotation-y={rotY} scale={scale}>
      {glb && <Suspense fallback={null}><Glb url="/models/habitat.glb" {...MODEL_CFG.habitat} /></Suspense>}
      <group visible={!glb}>
      <mesh position={[0, 0.12, 0]} receiveShadow><cylinderGeometry args={[7.2, 7.6, 0.24, 36]} /><Metal c="#5a5651" r={0.9} m={0.1} /></mesh>
      <mesh position={[0, 2.2, 0]} rotation-z={Math.PI / 2} castShadow receiveShadow><cylinderGeometry args={[2.2, 2.2, 8, 32]} /><Metal c="#d4cfc4" r={0.45} m={0.35} /></mesh>
      {[-3, -1, 1, 3].map(x => <mesh key={x} position={[x, 2.2, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[2.25, 2.25, 0.12, 32]} /><Metal c="#8c877e" /></mesh>)}
      {[-4, 4].map(x => <mesh key={x} position={[x, 2.2, 0]} castShadow><sphereGeometry args={[2.2, 24, 14]} /><Metal c="#d4cfc4" r={0.45} m={0.35} /></mesh>)}
      {[-2.5, 0, 2.5].map(x => <mesh key={x} position={[x, 2.9, 2.12]} rotation-x={0.25}><boxGeometry args={[0.9, 0.42, 0.06]} /><primitive object={win} attach="material" /></mesh>)}
      <mesh position={[0, 1.0, 2.7]} castShadow><boxGeometry args={[1.5, 2, 1.2]} /><Metal c="#9a968f" /></mesh>
      <mesh position={[0, 1.0, 3.32]}><boxGeometry args={[0.9, 1.5, 0.05]} /><Metal c="#3a3835" m={0.2} /></mesh>
      <mesh position={[0, 2.25, 3.0]}><boxGeometry args={[0.3, 0.12, 0.3]} /><meshStandardMaterial color="#fff2d0" emissive="#ffe0a0" emissiveIntensity={lit ? 2.5 : 0.2} /></mesh>
      {annex && <><mesh position={[7.4, 1.2, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.55, 0.55, 3.4, 16]} /><Metal c="#8c877e" /></mesh>
      <mesh position={[10.6, 1.4, 0]} rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[1.5, 1.5, 3.6, 24]} /><Metal c="#cfc9bd" r={0.5} m={0.3} /></mesh>
      <mesh position={[10.6, 1.4, 1.52]}><boxGeometry args={[0.7, 0.34, 0.04]} /><primitive object={win} attach="material" /></mesh></>}
      <mesh position={[-1.2, 4.6, -1]} rotation-y={0.4}><cylinderGeometry args={[0.05, 0.05, 1.4]} /><Metal c="#c9c5bc" /></mesh>
      {[-5.8, -3, 0, 3, 5.8].map((x, i) => <mesh key={i} position={[x, 0.32, -2.8]} scale={[1.2, 0.5, 0.7]} castShadow><boxGeometry args={[1, 1, 1]} /><Metal c="#6b6760" r={0.9} m={0.1} /></mesh>)}
      </group>
    </group>
  );
}
export function Lander({ position = [0, 0, 0] as [number, number, number], scale = 1, rotY = 0 }: { position?: [number, number, number]; scale?: number; rotY?: number }) {
  const glb = useAsset("/models/lander.glb");
  return (
    <group position={position} scale={scale} rotation-y={rotY}>
      {glb && <Suspense fallback={null}><Glb url="/models/lander.glb" {...MODEL_CFG.lander} /></Suspense>}
      <group visible={!glb}>
      <mesh position={[0, 2.9, 0]} castShadow><cylinderGeometry args={[1.9, 2.2, 3.4, 8]} /><Metal c="#d8d3c8" r={0.4} m={0.5} /></mesh>
      <mesh position={[0, 4.9, 0]} castShadow><cylinderGeometry args={[1.5, 1.9, 0.8, 8]} /><Metal c="#c2a45a" r={0.35} m={0.7} /></mesh>
      <mesh position={[0, 5.9, 0]} castShadow><coneGeometry args={[1.5, 1.4, 8]} /><Metal c="#aaa59b" /></mesh>
      <mesh position={[0, 1.0, 0]}><cylinderGeometry args={[0.75, 0.95, 1.0, 14]} /><Metal c="#2a2826" r={0.4} m={0.7} /></mesh>
      {[0.78, 2.35, 3.93, 5.5].map(a => <group key={a} rotation-y={-a}>
        <mesh position={[2.2, 1.0, 0]} rotation-z={0.62} castShadow><cylinderGeometry args={[0.09, 0.11, 2.8, 8]} /><Metal c="#7a7670" /></mesh>
        <mesh position={[3.0, 0.1, 0]} castShadow><cylinderGeometry args={[0.55, 0.65, 0.18, 14]} /><Metal c="#8a857d" r={0.7} /></mesh>
        <mesh position={[1.5, 2.2, 0]} rotation-z={-0.2}><boxGeometry args={[1.6, 0.06, 0.06]} /><Metal c="#6d6a65" /></mesh></group>)}
      <mesh position={[0, 3.2, 1.95]} rotation-x={-0.1}><boxGeometry args={[1.0, 1.6, 0.06]} /><Metal c="#2a2826" /></mesh>
      <mesh position={[0, 1.5, 3.7]} rotation-x={-0.47} castShadow><boxGeometry args={[1.5, 0.1, 4]} /><Metal c="#5f5c57" r={0.6} m={0.4} /></mesh>
      </group>
    </group>
  );
}
/** Work-area clutter placed with intent: crates, gas bottles, tripod camera, weather mast, sample cases, tool rack. */
export function Equipment({ position = [0, 0, 0] as [number, number, number], rotY = 0 }: { position?: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation-y={rotY}>
      {[[0, 0.35, 0, 1.1, 0.7, 0.8, "#6e6a5e"], [1.2, 0.25, 0.15, 0.8, 0.5, 0.7, "#8a6a3a"], [0.3, 0.9, 0.05, 0.7, 0.4, 0.6, "#6e6a5e"], [-1.4, 0.3, 0.3, 0.9, 0.6, 0.6, "#5a6068"]].map(([x, y, z, a, b, c, col], i) => <mesh key={i} position={[x as number, y as number, z as number]} rotation-y={i * 0.4} castShadow receiveShadow><boxGeometry args={[a as number, b as number, c as number]} /><Metal c={col as string} r={0.7} m={0.2} /></mesh>)}
      {[0, 1, 2].map(i => <mesh key={i} position={[2.4 + i * 0.32, 0.55, -0.4]} castShadow><cylinderGeometry args={[0.13, 0.13, 1.1, 10]} /><Metal c={["#d4cfc4", "#c8552b", "#9bb8d4"][i]} r={0.4} m={0.5} /></mesh>)}
      <group position={[-3, 0, 1]}>{[[0.5, 0], [-0.4, 0.4], [-0.4, -0.4]].map(([x, z], i) => <mesh key={i} position={[x / 2, 0.55, z / 2]} rotation={[z * 0.3, 0, -x * 0.3]}><cylinderGeometry args={[0.025, 0.025, 1.2]} /><Metal c="#2a2826" /></mesh>)}
        <mesh position={[0, 1.2, 0]}><boxGeometry args={[0.35, 0.22, 0.3]} /><Metal c="#2a2826" /></mesh><mesh position={[0, 1.2, 0.17]}><cylinderGeometry args={[0.07, 0.07, 0.12]} /><meshStandardMaterial color="#111" roughness={0.1} metalness={0.9} /></mesh></group>
      <group position={[4.5, 0, 1.5]}><mesh position-y={1.6} castShadow><cylinderGeometry args={[0.03, 0.03, 3.2]} /><Metal c="#c9c5bc" /></mesh>
        {[2.4, 3].map((y, i) => <mesh key={y} position-y={y} rotation-y={i * 1.2}><boxGeometry args={[0.8, 0.03, 0.03]} /><Metal c="#c9c5bc" /></mesh>)}<mesh position={[0, 3.2, 0]}><sphereGeometry args={[0.1, 8, 8]} /><Metal c="#e8a45a" /></mesh></group>
      <mesh position={[-1.2, 0.17, 1.6]} rotation-y={0.5} castShadow><boxGeometry args={[0.8, 0.3, 0.5]} /><Metal c="#bdb7aa" /></mesh>
    </group>
  );
}
export function LampPost({ position = [0, 0, 0] as [number, number, number], on = true }: { position?: [number, number, number]; on?: boolean }) {
  return <group position={position}><mesh position-y={1.5} castShadow><cylinderGeometry args={[0.04, 0.06, 3, 6]} /><Metal c="#6d6a65" /></mesh><mesh position={[0, 3.05, 0]}><boxGeometry args={[0.5, 0.1, 0.25]} /><meshStandardMaterial color="#fff2d0" emissive="#ffe0a0" emissiveIntensity={on ? 2.2 : 0} /></mesh></group>;
}
export type RoverRefs = { wheels: MutableRefObject<(THREE.Mesh | null)[]>; wl: MutableRefObject<THREE.Group | null>; wr: MutableRefObject<THREE.Group | null>; arm: MutableRefObject<THREE.Group | null>; mast: MutableRefObject<THREE.Group | null> };
/** Six-wheel rover with rocker-bogie hint, solar wings, mast camera and sampling arm. Moving parts are exposed through refs. */
export function RoverRig({ refs }: { refs?: RoverRefs }) {
  const panel = usePanelTexture();
  return (
    <group>
      <mesh position={[0, 0.95, 0]} castShadow><boxGeometry args={[1.5, 0.5, 2.3]} /><Metal c="#d8d3c8" r={0.45} m={0.35} /></mesh>
      <mesh position={[0, 0.95, 0]}><boxGeometry args={[1.56, 0.07, 1.1]} /><meshStandardMaterial color="#c8552b" roughness={0.5} metalness={0.2} /></mesh>
      <mesh position={[0, 1.24, 0.15]} castShadow><boxGeometry args={[1.35, 0.07, 1.7]} /><meshStandardMaterial map={panel} color="#cfd8ff" roughness={0.2} metalness={0.8} /></mesh>
      <mesh position={[0, 0.72, -1.1]}><boxGeometry args={[0.7, 0.35, 0.4]} /><Metal c="#3a3835" /></mesh>
      <group ref={el => { if (refs) refs.wl.current = el; }} position={[-0.7, 1.24, 0.15]}><mesh position={[-0.7, 0, 0]}><boxGeometry args={[1.4, 0.04, 1.7]} /><meshStandardMaterial map={panel} color="#cfd8ff" roughness={0.2} metalness={0.8} /></mesh></group>
      <group ref={el => { if (refs) refs.wr.current = el; }} position={[0.7, 1.24, 0.15]}><mesh position={[0.7, 0, 0]}><boxGeometry args={[1.4, 0.04, 1.7]} /><meshStandardMaterial map={panel} color="#cfd8ff" roughness={0.2} metalness={0.8} /></mesh></group>
      <group ref={el => { if (refs) refs.mast.current = el; }} position={[0.45, 1.25, 0.95]}><mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.04, 0.04, 1]} /><Metal c="#9a968f" /></mesh>
        <mesh position={[0, 1.08, 0.05]}><boxGeometry args={[0.5, 0.2, 0.25]} /><Metal c="#2b2d33" /></mesh>{[-0.14, 0.14].map(x => <mesh key={x} position={[x, 1.08, 0.19]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.05, 0.05, 0.06]} /><meshStandardMaterial color="#0a0a0c" roughness={0.1} metalness={0.9} /></mesh>)}</group>
      <group ref={el => { if (refs) refs.arm.current = el; }} position={[0, 0.8, 1.15]}><mesh position={[0, 0, 0.5]}><boxGeometry args={[0.1, 0.1, 1]} /><Metal c="#9a968f" /></mesh><mesh position={[0, -0.05, 1.05]}><cylinderGeometry args={[0.1, 0.06, 0.25]} /><Metal c="#2b2d33" /></mesh></group>
      <mesh position={[-0.5, 1.5, -0.85]} rotation={[-0.9, 0.3, 0]}><sphereGeometry args={[0.32, 14, 8, 0, 6.283, 0, 1.3]} /><meshStandardMaterial color="#e6e1d6" side={THREE.DoubleSide} roughness={0.4} metalness={0.4} /></mesh>
      {[-1, 1].map(s => <group key={s}>
        <mesh position={[s * 0.9, 0.62, 0]} rotation-z={0.12 * s}><boxGeometry args={[0.05, 0.05, 2.2]} /><Metal c="#9a968f" /></mesh>
        {[-0.95, 0, 0.95].map((z, zi) => <group key={z}><mesh position={[s * 0.92, 0.5, z]} rotation-z={0.5 * s}><boxGeometry args={[0.04, 0.3, 0.04]} /><Metal c="#6d6a65" /></mesh>
          <mesh ref={el => { if (refs) refs.wheels.current[(s === 1 ? 3 : 0) + zi] = el; }} position={[s * 1.0, 0.36, z]} rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.36, 0.36, 0.3, 18]} /><meshStandardMaterial color="#2a2a2e" roughness={0.9} metalness={0.2} /></mesh>
          <mesh position={[s * 1.17, 0.36, z]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.2, 0.2, 0.04, 12]} /><Metal c="#9a968f" /></mesh></group>)}</group>)}
    </group>
  );
}
