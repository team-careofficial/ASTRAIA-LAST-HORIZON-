import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Glb, MODEL_CFG, useAsset } from "./Models";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import { Dish, Habitat, Lander as LanderModel, RoverRig, SolarField, LampPost, Equipment, type RoverRefs } from "./Props";
import { DecalPool, DustFx, EarthBall, Ground, Horizon, RockField, SceneEnv, SunGlow, decals, dustFx } from "./kit";
import * as THREE from "three";
import { hr, surfaceAt, slopeDeg } from "@/game/explore/terrain";
import { designMods } from "@/data/design/options";
import { BASE, LANDER, POIS, ex, linkAt, poiInfo, rt, sensors, useEx } from "@/game/explore/store";
import { game } from "@/game/engine/store";
import { fun } from "@/game/fun/store";
import { clamp } from "@/game/simulation/world";
import { cam } from "./camera";
import SkyDome, { makeSky } from "./SkyDome";

const C = (h: string) => new THREE.Color(h);
const isMoon = () => game.get().destination === "moon";
function Earth() {
  const m = useRef<THREE.Group>(null);
  useFrame(({ camera }) => { m.current?.position.copy(camera.position).add(new THREE.Vector3(-140, 80, -230)); });
  return <group ref={m}><EarthBall position={[0, 0, 0]} r={12} /></group>;
}
const DAY_T = C("#9c6a52"), DAY_H = C("#e0a678"), DUSK_T = C("#3a3358"), DUSK_H = C("#e0693a"), NIGHT_T = C("#04050c"), NIGHT_H = C("#14121e");
const Metal = ({ c = "#9a968f" }: { c?: string }) => <meshStandardMaterial color={c} roughness={0.5} metalness={0.45} />;

const AVOID: [number, number, number][] = [[BASE[0], BASE[1], 11], [LANDER[0], LANDER[1], 7], [0, 6, 6]];
function Terrain({ low }: { low: boolean }) { return <><Ground size={360} seg={low ? 120 : 180} height={hr} moon={isMoon()} /><Horizon radius={290} moon={isMoon()} color={isMoon() ? "#3a3a40" : "#7a4630"} /></>; }
function Rocks({ low }: { low: boolean }) { return <RockField count={low ? 160 : 420} seed={5} rMin={9} rMax={165} height={hr} color={isMoon() ? "#5a5a60" : "#6e3420"} avoid={AVOID} moon={isMoon()} shadows={!low} />; }
function Pois() {
  const found = useEx(s => s.found), refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(s => refs.current.forEach((g, i) => { if (g) { g.rotation.y = s.clock.elapsedTime * 1.2; g.position.y = hr(POIS[i].x, POIS[i].z) + 1.6 + Math.sin(s.clock.elapsedTime * 2 + i) * 0.15; } }));
  return <>{POIS.map((p, i) => { const done = found.includes(i), col = done ? poiInfo(p.kind, false).color : "#ffd27a"; return (
    <group key={p.id}><group ref={el => { refs.current[i] = el; }} position={[p.x, 2, p.z]}><mesh><octahedronGeometry args={[0.35]} /><meshBasicMaterial color={col} wireframe={done} /></mesh></group>
      <mesh position={[p.x, hr(p.x, p.z) + 4, p.z]}><cylinderGeometry args={[0.04, 0.04, 8]} /><meshBasicMaterial color={col} transparent opacity={done ? 0.12 : 0.4} /></mesh></group>); })}</>;
}
function Base() {
  const y = hr(BASE[0], BASE[1]), ly = hr(LANDER[0], LANDER[1]);
  return (<>
    <group position={[BASE[0], y, BASE[1]]}><Habitat rotY={0.3} scale={0.85} annex={false} /><Equipment position={[2, 0, 8]} rotY={0.2} /><LampPost position={[-6, 0, 5]} /><LampPost position={[6, 0, 6]} /></group>
    <Dish position={[BASE[0] + 9, hr(BASE[0] + 9, BASE[1] + 3), BASE[1] + 3]} h={9} aim={[1.2, 0.6]} />
    <SolarField position={[BASE[0] + 1, hr(BASE[0] + 1, BASE[1] + 14), BASE[1] + 14]} cols={3} rows={2} rotY={0.2} />
    <group position={[LANDER[0], ly, LANDER[1]]}><LanderModel /></group>
  </>);
}
function Lighting({ sky }: { sky: ReturnType<typeof makeSky> }) {
  const sun = useRef<THREE.DirectionalLight>(null), hemi = useRef<THREE.HemisphereLight>(null), stars = useRef<THREE.Group>(null), { scene } = useThree();
  useEffect(() => { if (sun.current) scene.add(sun.current.target); scene.fog = isMoon() ? null : new THREE.Fog("#d9a074", 50, 260); return () => { scene.fog = null; }; }, [scene]);
  useFrame(() => {
    const a = (Math.PI * (rt.hour - 6)) / 12, el = Math.sin(a), d = Math.max(0, el), dusk = el > -0.25 ? 1 - Math.min(1, Math.abs(el) * 3.5) : 0;
    sky.sun.set(-Math.cos(a) * 0.95, Math.max(el, -0.15), -0.35).normalize();
    sky.top.copy(NIGHT_T).lerp(DAY_T, Math.min(1, d * 2)).lerp(DUSK_T, dusk * 0.6); sky.hor.copy(NIGHT_H).lerp(DAY_H, Math.min(1, d * 2)).lerp(DUSK_H, dusk * 0.7); sky.glow = Math.min(1, d * 3);
    if (isMoon()) { sky.top.set("#000000"); sky.hor.set("#050507"); sky.glow = 0; }
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(sky.hor);
    if (sun.current) { sun.current.position.set(rt.x + sky.sun.x * 70, sky.sun.y * 70 + 5, rt.z + sky.sun.z * 70); sun.current.target.position.set(rt.x, 0, rt.z); sun.current.target.updateMatrixWorld(); sun.current.intensity = (isMoon() ? 3.6 : 2.8) * Math.pow(d, 0.6); sun.current.color.setRGB(1, 0.78 + 0.15 * d, 0.6 + 0.3 * d); }
    if (hemi.current) hemi.current.intensity = isMoon() ? 0.06 + 0.06 * d : 0.14 + 0.55 * d;
    if (stars.current) stars.current.visible = isMoon() || el < 0.1;
  });
  return <><directionalLight ref={sun} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} shadow-camera-far={160} />
    <hemisphereLight ref={hemi} args={["#ffd7b0", "#4a2418", 0.6]} /><group ref={stars}><Stars radius={420} depth={40} count={2500} factor={5} fade /></group></>;
}
const SHARDS = (() => { let a = 77; const rnd = () => (a = (a * 16807) % 2147483647) / 2147483647; const out: [number, number][] = []; while (out.length < 36) { const ang = rnd() * Math.PI * 2, d = 8 + rnd() * 85, x = Math.cos(ang) * d, z = Math.sin(ang) * d; if (Math.hypot(x - LANDER[0], z - LANDER[1]) > 5 && Math.hypot(x - BASE[0], z - BASE[1]) > 8) out.push([x, z]); } return out; })();
function Shards() {
  const refs = useRef<(THREE.Group | null)[]>([]), got = useRef<boolean[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    SHARDS.forEach(([x, z], i) => {
      const m = refs.current[i]; if (!m || got.current[i]) return;
      m.rotation.y = t * 1.6 + i; m.position.y = hr(x, z) + 1.1 + Math.sin(t * 2 + i) * 0.15;
      if (Math.hypot(rt.x - x, rt.z - z) < 2.2) { got.current[i] = true; m.visible = false; const e = ex.get(); ex.patch({ shards: e.shards + 1, battery: clamp(e.battery + 3) }); fun.addShards(1); ex.say(`★ Star Shard ${e.shards + 1}! +3% battery`); }
    });
  });
  return <>{SHARDS.map(([x, z], i) => <group key={i} ref={el => { refs.current[i] = el; }} position={[x, 1.2, z]}><mesh><octahedronGeometry args={[0.35, 0]} /><meshStandardMaterial color="#ffd36b" emissive="#ffb300" emissiveIntensity={1.6} roughness={0.3} /></mesh></group>)}</>;
}
function Rover() {
  const g = useRef<THREE.Group>(null), body = useRef<THREE.Group>(null), wheels = useRef<(THREE.Mesh | null)[]>([]), wl = useRef<THREE.Group | null>(null), wr = useRef<THREE.Group | null>(null), arm = useRef<THREE.Group | null>(null), mast = useRef<THREE.Group | null>(null), lamp = useRef<THREE.PointLight>(null);
  const keys = useRef<Record<string, boolean>>({}), s = useRef({ x: 0, z: -6, h: 0, v: 0, spin: 0, wing: 1.45, t: 0, acc: 0, scan: 0, dBat: 0, dust: 0, warned: false, trk: 0, shake: 0, fov: 50 }), glb = useAsset("/models/rover.glb"), { camera } = useThree(), tmp = useMemo(() => new THREE.Vector3(), []);
  const refs: RoverRefs = useMemo(() => ({ wheels, wl, wr, arm, mast }), []);
  useEffect(() => {
    ex.reset(); cam.yaw = 0; cam.dist = 8; const dm0 = designMods(game.get().design, game.get().destination); ex.patch({ battery: Math.min(100, 70 + dm0.reserve * 0.9 + dm0.roverBat), ...sensors(0, -6, 10, isMoon()) });
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true; const st = ex.get();
      if (e.code === "Escape") game.togglePause();
      if (game.get().paused || st.phase !== "drive") return;
      if (e.code === "KeyF") { ex.patch({ panels: !st.panels }); ex.say(st.panels ? "Solar wings stowed." : "Solar wings deployed. Charging in sunlight."); }
      if (e.code === "KeyL") ex.patch({ lights: !st.lights });
      if (e.code === "KeyV") ex.patch({ cockpit: !st.cockpit });
      if (e.code === "KeyC") { s.current.dust = Math.max(0, s.current.dust - 50); ex.patch({ battery: clamp(st.battery - 1), dust: s.current.dust }); ex.say(game.get().destination === "moon" ? "Panels brushed. Lunar dust is abrasive and clings by static charge." : "Panels brushed. On Mars, wind sometimes cleans panels too."); }
      if (e.code === "KeyT") ex.transmit();
    };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);
  useFrame((st, raw) => {
    const dt = Math.min(raw, 0.05), r = s.current, e = ex.get(), k = keys.current, dm = designMods(game.get().design, game.get().destination), moon = isMoon();
    if (game.get().paused) return;
    r.t += dt; rt.hour = (rt.hour + (dt * 2) / 60) % 24;
    const f = [Math.sin(r.h), Math.cos(r.h)], sf = surfaceAt(r.x, r.z, moon);
    if (e.phase === "deploy") { const u = Math.min(1, r.t / 6), q = u * u * (3 - 2 * u); r.z = -6 + 12 * q; r.v = u < 1 ? 2.2 : 0; if (u >= 1) ex.patch({ phase: "drive" }); }
    else {
      const th = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0), steer = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0), boost = (k.ShiftLeft || k.ShiftRight) && e.battery > 8;
      const grade = (hr(r.x + f[0] * 1.3, r.z + f[1] * 1.3) - hr(r.x - f[0] * 1.3, r.z - f[1] * 1.3)) / 2.6, climb = r.v > 0 ? 1 - Math.min(0.55, Math.max(0, grade - 0.12) * 2.2) : 1;
      const max = e.battery > 0.5 ? (boost ? 11 : 6) * sf.speed * dm.roverSpeed * climb : 0;
      r.v += (th * max - r.v) * Math.min(1, dt * (k.Space ? 5 : th ? 1.6 * (0.6 + 0.4 * sf.grip) : 0.8)); r.h += steer * Math.min(1, Math.abs(r.v) / 2) * dt * (0.55 + 0.35 * sf.grip) * (r.v < -0.1 ? -1 : 1);
      r.x += Math.sin(r.h) * r.v * dt; r.z += Math.cos(r.h) * r.v * dt;
      for (const [cx, cz, cr] of [[BASE[0], BASE[1], 6.5], [LANDER[0], LANDER[1], 4.4], [BASE[0] + 9, BASE[1] + 3, 1.6]]) { const dx = r.x - cx, dz = r.z - cz, d = Math.hypot(dx, dz); if (d < cr + 1.4 && d > 0) { r.x = cx + (dx / d) * (cr + 1.4); r.z = cz + (dz / d) * (cr + 1.4); r.v *= 0.5; } }
      const rr = Math.hypot(r.x, r.z); if (rr > 150) { r.x *= 150 / rr; r.z *= 150 / rr; r.v *= 0.7; }
      let ni = -1, nd = 1e9; for (const p of POIS) { const d = Math.hypot(p.x - r.x, p.z - r.z); if (d < nd && !e.found.includes(p.id)) { nd = d; ni = p.id; } }
      if (k.KeyE && ni >= 0 && nd < 7 && Math.abs(r.v) < 1.5 && e.battery > 3) { r.scan += dt / 3; if (r.scan >= 1) { r.scan = 0; ex.finishScan(ni); } } else r.scan = 0;
      r.acc += dt;
      const sunEl = Math.sin((Math.PI * (rt.hour - 6)) / 12), charge = (e.panels ? 1 : 0.25) * Math.max(0, sunEl) * 0.8, drain = 0.03 + Math.abs(r.v) * 0.012 * (1.4 - 0.4 * sf.grip) + (boost ? 0.25 : 0) + (e.lights ? 0.06 : 0) + (sunEl < 0 ? (moon ? 0.12 : 0.05) : 0) + (r.scan > 0 ? 0.1 : 0) + Math.max(0, grade) * Math.abs(r.v) * 0.04;
      r.dBat += (charge * (1 - r.dust / 150) - drain * dm.drainK) * dt; r.dust = Math.min(100, r.dust + (moon ? 0.05 : 0.015) * Math.abs(r.v) * dt * sf.dust);
      if (e.battery < 15 && !r.warned) { r.warned = true; ex.say("Low battery. Deploy solar wings (F), brush the panels (C) and stop in sunlight."); } if (e.battery > 25) r.warned = false;
      if (r.acc > 0.2) { r.acc = 0; const sn = sensors(r.x, r.z, rt.hour, moon); ex.patch({ ...sn, speed: Math.abs(r.v) * 3.6, x: r.x, z: r.z, heading: r.h, hour: rt.hour, link: clamp(linkAt(r.x, r.z) + dm.relDelta * 0.5), near: ni >= 0 ? ni : null, nearDist: nd, scan: r.scan, temp: e.battery > 10 ? 20 : sn.air.t, battery: clamp(ex.get().battery + r.dBat), dust: r.dust, net: (r.dBat / 0.2) * 60, surf: sf.label, grip: sf.grip, pitch: slopeDeg(r.x, r.z, r.h), hazard: sf.id === "slope" ? "STEEP SLOPE: SLOW DOWN" : sf.id === "sand" && Math.abs(r.v) > 5 ? "WHEEL SLIP RISK" : null }); r.dBat = 0; }
    }
    rt.x = r.x; rt.z = r.z; const y = hr(r.x, r.z), hF = hr(r.x + f[0] * 1.3, r.z + f[1] * 1.3), hB = hr(r.x - f[0] * 1.3, r.z - f[1] * 1.3), hR = hr(r.x + f[1] * 1.1, r.z - f[0] * 1.1), hL = hr(r.x - f[1] * 1.1, r.z + f[0] * 1.1);
    const bumpy = sf.bump * Math.min(1, Math.abs(r.v) / 6); r.shake += (bumpy - r.shake) * Math.min(1, dt * 6);
    if (g.current) { g.current.position.set(r.x, y + 0.04 + Math.sin(r.t * 38) * 0.012 * r.shake, r.z); g.current.rotation.set(-Math.atan2(hF - hB, 2.6) + Math.sin(r.t * 23) * 0.012 * r.shake, r.h, Math.atan2(hR - hL, 2.2) + Math.sin(r.t * 31) * 0.012 * r.shake, "YXZ"); }
    r.spin += (r.v * dt) / 0.38 * (1 + (1 - sf.grip) * 0.7); wheels.current.forEach(w => { if (w) w.rotation.x = r.spin; });
    r.wing += ((e.panels ? 0 : 1.45) - r.wing) * Math.min(1, dt * 2.5); if (wl.current && wr.current) { wl.current.rotation.z = -r.wing; wr.current.rotation.z = r.wing; }
    if (arm.current) arm.current.rotation.x = r.scan > 0 ? -0.6 - Math.sin(r.t * 6) * 0.2 : 0.5; if (mast.current) mast.current.rotation.y = r.scan > 0 ? Math.sin(r.t * 2) * 0.8 : 0;
    if (lamp.current) lamp.current.intensity = e.lights ? 7 : 0; if (body.current) body.current.visible = !e.cockpit;
    if (Math.abs(r.v) > 0.4 && e.phase === "drive") {
      r.trk += Math.abs(r.v) * dt; if (r.trk > 0.55) { r.trk = 0; [-1, 1].forEach(sd => decals.push("track", r.x + f[1] * 1.0 * sd, hr(r.x + f[1] * sd, r.z - f[0] * sd), r.z - f[0] * 1.0 * sd, r.h)); }
      if (Math.random() < Math.min(1, Math.abs(r.v) * sf.dust * dt * 3)) dustFx.emit(r.x - f[0] * 1.2, y, r.z - f[1] * 1.2, -f[0] * r.v, -f[1] * r.v, 1 + Math.round(sf.dust * (Math.abs(r.v) > 6 ? 2 : 1)));
    }
    const cp = camera as THREE.PerspectiveCamera, wantFov = e.cockpit ? 68 : 50 + Math.min(10, Math.abs(r.v) * 0.9); r.fov += (wantFov - r.fov) * Math.min(1, dt * 3); if (Math.abs(cp.fov - r.fov) > 0.05) { cp.fov = r.fov; cp.updateProjectionMatrix(); }
    if (e.phase === "deploy") { const a = -0.9 + r.t * 0.2; tmp.set(Math.sin(a) * 15, y + 5, -2 + Math.cos(a) * 15); camera.position.lerp(tmp, 1 - Math.exp(-3 * dt)); camera.lookAt(0, 1.5, r.z * 0.6 - 2); }
    else if (e.cockpit) {
      const pit = -Math.atan2(hF - hB, 2.6); tmp.set(r.x + f[0] * 0.55, y + 1.55 + Math.sin(r.t * 38) * 0.01 * r.shake, r.z + f[1] * 0.55); camera.position.copy(tmp);
      camera.lookAt(r.x + f[0] * 20 - Math.sin(r.h + cam.yaw) * 0, y + 1.5 + Math.tan(pit) * 6 - 0.4, r.z + f[1] * 20); camera.rotateZ(-Math.atan2(hR - hL, 2.2) * 0.6);
    }
    else { const yaw = r.h + Math.PI + cam.yaw, cpt = Math.cos(cam.pitch), d = cam.dist + 1 + Math.min(2, Math.abs(r.v) * 0.12); if (Math.abs(r.v) > 1) cam.yaw *= 1 - Math.min(1, dt * 0.8);
      tmp.set(r.x + Math.sin(yaw) * d * cpt, y + 1.5 + Math.sin(cam.pitch) * d + Math.sin(r.t * 31) * 0.02 * r.shake, r.z + Math.cos(yaw) * d * cpt); tmp.y = Math.max(tmp.y, hr(tmp.x, tmp.z) + 0.8);
      camera.position.lerp(tmp, 1 - Math.exp(-6 * dt)); camera.lookAt(r.x, y + 1, r.z); }
    void st;
  });
  return (
    <group ref={g}>
      <group ref={body}><group visible={!glb}><RoverRig refs={refs} /></group>{glb && <Suspense fallback={null}><Glb url="/models/rover.glb" {...MODEL_CFG.rover} /></Suspense>}</group>
      <pointLight ref={lamp} position={[0, 1, 1.8]} color="#fff2d0" distance={18} intensity={0} />
    </group>
  );
}
export default function RoverScene({ quality }: { quality: string }) {
  const sky = useMemo(() => makeSky(), []), low = quality === "low", moon = isMoon();
  useEffect(() => { game.markReady("terrain"); }, []);
  return (<><SkyDome sky={sky} /><SceneEnv moon={moon} intensity={moon ? 0.45 : 0.7} /><Lighting sky={sky} /><Terrain low={low} /><Rocks low={low} /><Pois /><Base /><Shards />
    <DecalPool kind="track" max={500} w={0.3} l={0.6} opacity={moon ? 0.5 : 0.38} /><DustFx max={low ? 90 : 220} color={moon ? "#a8a8ae" : "#c89a74"} size={moon ? 1.2 : 1.7} />
    {!moon && <><SunGlow position={[-120, 28, -170]} size={150} /><Sparkles count={low ? 50 : 130} scale={[60, 8, 60]} position={[0, 3, 0]} size={2} speed={0.4} opacity={0.4} color="#ffd2a6" /></>}{moon && <Earth />}<Rover /></>);
}
