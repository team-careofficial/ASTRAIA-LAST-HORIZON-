import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import SkyDome, { makeSky } from "./SkyDome";
import { Cable, Dish, Equipment, Habitat, LampPost, Lander, Metal, RoverRig, SolarField } from "./Props";
import { DecalPool, DustFx, Ground, Horizon, RockField, SceneEnv, SunGlow, fbm } from "./kit";
import { MISSIONS } from "@/data/world/missions";
import { game, useGame } from "@/game/engine/store";
import { EMG_STATIONS } from "@/data/knowledge/emergencies";
import { ROVER_HOME, ROVER_STRANDED, SENSOR, STATIONS } from "@/data/world/layout";

export const height = (x: number, z: number) => {
  const k = Math.min(1, Math.max(0, (Math.hypot(x, z) - 28) / 40)), s = k * k * (3 - 2 * k);
  return s * (Math.sin(x * 0.06) * Math.cos(z * 0.05) * 7 + Math.sin(x * 0.17 + z * 0.13) * 1.4 + 9 + fbm(x * 0.08, z * 0.08, 3) * 3);
};
const AVOID: [number, number, number][] = [[14, 0, 9], [-10, -8, 6], [9, -8, 6], [0, -15, 3], [6, 9, 4], [0, 6, 7], [-13, 4, 3], [3, -7, 3]];
function Terrain({ low }: { low: boolean }) {
  useEffect(() => { game.markReady("terrain"); }, []);
  return <><Ground size={260} seg={low ? 100 : 150} height={height} /><Horizon radius={240} color="#7a4630" /></>;
}
function Rocks({ low }: { low: boolean }) { return <RockField count={low ? 90 : 240} seed={7} rMin={12} rMax={110} height={height} avoid={AVOID} shadows={!low} />; }
function HabitatSite() {
  const on = useGame(s => s.r.power >= 20);
  return <group position={[14, 0, 0]}><Habitat rotY={-0.5} scale={0.8} annex={false} lit={on} /><Equipment position={[-1, 0, 7]} rotY={0.6} /></group>;
}
function Structures() {
  const mi = useGame(s => s.mission), p = mi === 4 ? ROVER_STRANDED : ROVER_HOME;
  return (<>
    <HabitatSite />
    <group position={[-10, 0, -8]}><Lander scale={0.9} rotY={0.5} /></group>
    <SolarField position={[6, 0, -8]} cols={3} rows={1} rotY={0} />
    <Dish position={[0, 0, -15]} h={10} aim={[0.9, 0.55]} />
    <group position={[p[0], 0, p[1]]} rotation={[0, 0.6, mi === 4 ? 0.2 : 0]}><RoverRig /></group>
    <LampPost position={[4, 0, 3]} /><LampPost position={[-6, 0, 10]} /><LampPost position={[10, 0, 8]} />
    <Cable pts={[[8, 0.05, -6], [4, 0.05, -11], [0.5, 0.05, -14.2]]} /><Cable pts={[[12, 0.05, -3], [9, 0.05, -6], [7, 0.05, -7.4]]} color="#2a1c16" /><Cable pts={[[-8, 0.05, -6], [-4, 0.05, -11], [-0.8, 0.05, -14.6]]} /><Cable pts={[[11, 0.05, 1.5], [6, 0.05, 3], [4, 0.05, 3.2]]} />
  </>);
}
function Marker() {
  const step = useGame(s => s.step), mi = useGame(s => s.mission), screen = useGame(s => s.screen), er = useGame(s => s.emgRun), m = useRef<THREE.Mesh>(null);
  const stn = er ? EMG_STATIONS[er.id][er.idx] : null, it = stn ? { pos: stn.pos, radius: stn.radius } : screen === "play" ? MISSIONS[mi].steps[step] : undefined;
  useFrame(s => { if (m.current) m.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * (er ? 6 : 3)) * 0.12); });
  if (!it) return null;
  const col = er ? "#e5533a" : "#e8a24a";
  return <group position={[it.pos[0], 0, it.pos[1]]}><mesh ref={m} position={[0, 0.06, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[it.radius - 0.35, it.radius, 48]} /><meshBasicMaterial color={col} transparent opacity={0.7} /></mesh>
    <mesh position={[0, 5, 0]}><cylinderGeometry args={[0.08, 0.08, 10, 6]} /><meshBasicMaterial color={col} transparent opacity={0.35} /></mesh></group>;
}
/** Alarm light inside the base while an emergency is active. */
function Alarm() {
  const er = useGame(s => s.emgRun), l = useRef<THREE.PointLight>(null);
  useFrame(s => { if (l.current) l.current.intensity = er ? 14 * (0.5 + 0.5 * Math.sin(s.clock.elapsedTime * 6)) : 0; });
  return <pointLight ref={l} position={[12, 4.5, 3]} color="#ff3a20" distance={22} intensity={0} />;
}
function SensorProp() {
  const m = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(s => { if (m.current) m.current.color.setRGB(1, 0.7, 0.2).multiplyScalar(Math.sin(s.clock.elapsedTime * 7) > 0 ? 1 : 0.25); });
  return <group position={[SENSOR[0], 0, SENSOR[1]]}><mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[0.8, 1, 0.8]} /><Metal c="#6d6a65" /></mesh><mesh position={[0, 2, 0]}><cylinderGeometry args={[0.04, 0.04, 2.4]} /><Metal /></mesh><mesh position={[0, 3.3, 0]}><sphereGeometry args={[0.12, 8, 8]} /><meshBasicMaterial ref={m} color="#ffb340" /></mesh></group>;
}
function Stations() {
  const mi = useGame(s => s.mission);
  return <>{STATIONS.map(s => <group key={s.id} position={[s.pos[0], 0, s.pos[1]]}>
    <mesh position={[0, 0.6, 0]} castShadow><boxGeometry args={[1.6, 1.2, 1]} /><Metal c="#7d7a74" /></mesh>
    <mesh position={[0, 0.95, 0.52]}><boxGeometry args={[1.1, 0.5, 0.04]} /><meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={1.2} /></mesh>
    <mesh position={[0.6, 1.7, 0]}><cylinderGeometry args={[0.03, 0.03, 1]} /><Metal /></mesh></group>)}{mi === 1 && <SensorProp />}</>;
}
/** Storm reaction: sky, fog and sunlight ease toward a dark dusty state as game.storm rises. */
function Atmosphere({ sun }: { sun: React.RefObject<THREE.DirectionalLight> }) {
  const { scene } = useThree(), c1 = useMemo(() => new THREE.Color("#c27a4b"), []), c2 = useMemo(() => new THREE.Color("#3f2018"), []), cur = useMemo(() => new THREE.Color(), []), sm = useRef(0);
  useFrame((_, dt) => {
    sm.current += (game.get().storm - sm.current) * Math.min(1, dt * 0.8); const s = sm.current; cur.copy(c1).lerp(c2, s);
    if (scene.background instanceof THREE.Color) scene.background.copy(cur);
    if (scene.fog instanceof THREE.Fog) { scene.fog.color.copy(cur); scene.fog.near = 35 - 28 * s; scene.fog.far = 120 - 80 * s; }
    if (sun.current) sun.current.intensity = 2.4 - 1.6 * s;
  });
  return null;
}
function MissionSky() {
  const sky = useMemo(() => makeSky(), []), c = useMemo(() => ({ h1: new THREE.Color("#d9a074"), h2: new THREE.Color("#4a2a20"), t1: new THREE.Color("#8a5a58"), t2: new THREE.Color("#2a1612") }), []), sm = useRef(0);
  useFrame((_, dt) => { sm.current += (game.get().storm - sm.current) * Math.min(1, dt * 0.8); const s = sm.current; sky.hor.copy(c.h1).lerp(c.h2, s); sky.top.copy(c.t1).lerp(c.t2, s); sky.glow = 1 - 0.85 * s; sky.sun.set(0.5, 0.3, -0.6); });
  return <SkyDome sky={sky} />;
}
export default function MarsWorld({ quality }: { quality: string }) {
  const sun = useRef<THREE.DirectionalLight>(null), stormy = useGame(s => s.storm > 0.2), sh = quality !== "low", map = quality === "ultra" ? 2048 : quality === "high" ? 1024 : 512, low = quality === "low";
  return (
    <>
      <color attach="background" args={["#c27a4b"]} /><fog attach="fog" args={["#c27a4b", 35, 120]} /><Atmosphere sun={sun} />
      <hemisphereLight args={["#ffd7b0", "#5a2a1a", 0.7]} />
      <directionalLight ref={sun} position={[30, 18, -20]} intensity={2.4} color="#ffd9a8" castShadow={sh} shadow-mapSize={[map, map]} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-camera-far={90} />
      <mesh position={[60, 16, -95]}><sphereGeometry args={[6, 16, 16]} /><meshBasicMaterial color="#fff0d0" toneMapped={false} fog={false} /></mesh>
      <MissionSky /><SceneEnv intensity={0.75} /><SunGlow position={[170, 36, -250]} size={200} /><Terrain low={low} /><Rocks low={low} /><Structures /><Stations /><Marker /><Alarm /><DecalPool kind="foot" max={300} w={0.14} l={0.32} opacity={0.5} /><DustFx max={low ? 40 : 100} size={1.1} />
      <Sparkles count={low ? 60 : 140} scale={[44, 9, 44]} position={[0, 4, 0]} size={2.2} speed={0.45} opacity={0.45} color="#ffd2a6" />
      {stormy && <Sparkles count={low ? 200 : 500} scale={[60, 10, 60]} position={[0, 4, 0]} size={5} speed={2.5} opacity={0.6} color="#e8a373" />}
    </>
  );
}
