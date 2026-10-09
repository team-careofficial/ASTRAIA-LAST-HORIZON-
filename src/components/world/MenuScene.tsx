import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import SkyDome, { makeSky } from "./SkyDome";
import Astronaut from "./Astronaut";
import { Cable, Dish, Equipment, Habitat, LampPost, Lander, RoverRig, SolarField } from "./Props";
import { DecalPool, EarthBall, Ground, Horizon, RockField, SceneEnv, SunGlow, decals, fbm } from "./kit";
import { game } from "@/game/engine/store";

/** Cinematic backdrop for every menu screen. A little Mars (or Moon) outpost with a slow, breathing camera. */
export const menuHeight = (moon: boolean) => (x: number, z: number) => {
  const r = Math.hypot(x, z), k = Math.min(1, Math.max(0, (r - 26) / 40)), s = k * k * (3 - 2 * k);
  const dunes = Math.sin(x * 0.07 + fbm(x * 0.03, z * 0.03, 2) * 4) * 1.6 + Math.cos(z * 0.05 + 1) * 1.2 + fbm(x * 0.12, z * 0.12, 3) * 1.2;
  const rim = Math.max(0, r - 90) * (moon ? 0.16 : 0.1);
  const crater = moon ? -5 * Math.exp(-Math.pow(Math.hypot(x + 30, z + 60) / 22, 2)) + 1.4 * Math.exp(-Math.pow((Math.hypot(x + 30, z + 60) - 24) / 4, 2)) : 0;
  return s * (dunes * (moon ? 0.8 : 1)) + rim + crater * s;
};
const AVOID: [number, number, number][] = [[10, -6, 15], [-1.5, 5.5, 4], [-12, -8, 6], [3, 3, 5]];
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function Rig() {
  const { camera } = useThree(), pointer = useMemo(() => ({ x: 0, y: 0 }), []), t0 = useRef(-1), look = useMemo(() => new THREE.Vector3(), []), pos = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => { const f = (e: PointerEvent) => { pointer.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.y = -((e.clientY / window.innerHeight) * 2 - 1); }; window.addEventListener("pointermove", f); return () => window.removeEventListener("pointermove", f); }, [pointer]);
  useFrame((s, dt) => {
    if (t0.current < 0) t0.current = s.clock.elapsedTime;
    const t = s.clock.elapsedTime, u = easeOut(Math.min(1, (t - t0.current) / 6)), sw = Math.sin(t * 0.18);
    pos.set(-7 + sw * 1.4 + pointer.x * 0.9 - (1 - u) * 14, 1.9 + Math.sin(t * 0.23) * 0.12 + pointer.y * 0.3 + (1 - u) * 2.5, 15 + (1 - u) * 16);
    look.set(4 + sw * 0.6 + pointer.x * 0.5, 2.3 + pointer.y * 0.2, 0);
    camera.position.lerp(pos, 1 - Math.exp(-3 * dt)); camera.lookAt(look);
  });
  return null;
}
function Footprints({ h }: { h: (x: number, z: number) => number }) {
  useEffect(() => {
    const id = setTimeout(() => {
      for (let i = 0; i < 18; i++) { const u = i / 17, x = 7.6 - u * 5.4 + Math.sin(i) * 0.1, z = 1.2 + u * 3.2, side = i % 2 ? 0.18 : -0.18; decals.push("foot", x + side * 0.5, h(x, z), z + side * 0.2, Math.atan2(-5.4, 3.2) + 0.1); }
      for (let i = 0; i < 40; i++) { const z = 5.5 + i * 0.7, x = -1.5 - i * 0.5; [-0.9, 0.9].forEach(o => decals.push("track", x + o * 0.8, h(x, z), z + o * 0.4, Math.atan2(-0.5, 0.7) - 1.57)); }
    }, 60);
    return () => clearTimeout(id);
  }, [h]);
  return null;
}
export default function MenuScene({ quality, moon }: { quality: string; moon: boolean }) {
  const h = useMemo(() => menuHeight(moon), [moon]), sky = useMemo(() => makeSky(), []), low = quality === "low", sh = !low, map = quality === "ultra" ? 2048 : quality === "high" ? 1024 : 512;
  const sun = useRef<THREE.DirectionalLight>(null), { scene } = useThree(), fog = moon ? "#050507" : "#c58a62";
  useEffect(() => { game.markReady("terrain"); game.markReady("crew"); }, []);
  useEffect(() => { if (sun.current) scene.add(sun.current.target); }, [scene]);
  useMemo(() => {
    if (moon) { sky.top.set("#000000"); sky.hor.set("#07070a"); sky.glow = 0; } else { sky.top.set("#7c5a52"); sky.hor.set("#e2a77a"); sky.glow = 1; sky.sun.set(-0.7, 0.16, -0.6); }
  }, [moon, sky]);
  const y = (x: number, z: number) => h(x, z);
  return (
    <>
      <color attach="background" args={[fog]} />{moon ? null : <fog attach="fog" args={[fog, 24, 190]} />}
      <SkyDome sky={sky} /><SceneEnv moon={moon} intensity={moon ? 0.5 : 0.8} />
      <hemisphereLight args={moon ? ["#8fa0c0", "#202024", 0.09] : ["#ffcfa0", "#5a2a1a", 0.55]} />
      <directionalLight ref={sun} position={moon ? [-34, 16, 24] : [-36, 15, -26]} intensity={moon ? 4.6 : 3.1} color={moon ? "#fff8ee" : "#ffc994"} castShadow={sh} shadow-mapSize={[map, map]} shadow-camera-left={-34} shadow-camera-right={34} shadow-camera-top={30} shadow-camera-bottom={-20} shadow-camera-far={120} shadow-bias={-0.0004} />
      {moon ? <><Stars radius={300} depth={50} count={low ? 1500 : 4000} factor={5} fade /><EarthBall position={[70, 42, -150]} r={11} /></> : <SunGlow position={[-110, 26, -150]} size={170} />}
      <Ground size={420} seg={low ? 110 : 170} height={h} moon={moon} />
      <Horizon radius={250} moon={moon} color={moon ? "#3a3a40" : "#7a4630"} />
      <RockField count={low ? 120 : 340} seed={moon ? 21 : 9} rMin={6} rMax={170} height={h} color={moon ? "#55555b" : "#6e3420"} avoid={AVOID} moon={moon} shadows={sh} />
      <group>
        <group position={[10, y(10, -6), -6]}><Habitat rotY={-0.5} /></group>
        <Equipment position={[3, y(3, 3), 3]} rotY={0.4} />
        <group position={[-1.5, y(-1.5, 5.5) + 0.02, 5.5]} rotation-y={0.9}><RoverRig /></group>
        <group position={[1.9, y(1.9, 4.6), 4.6]} rotation-y={-1.1}><Astronaut color="#e8a45a" speed={{ current: 0 }} acting={{ current: 0 }} /></group>
        <group position={[-6.4, y(-6.4, 3.2), 3.2]} rotation-y={0.9}><Astronaut color="#9bb8d4" speed={{ current: 0 }} acting={{ current: 0 }} /></group>
        <Lander position={[-12, y(-12, -8), -8]} rotY={0.5} />
        <Dish position={[3, y(3, -15), -15]} h={7} aim={[0.9, 0.5]} />
        <SolarField position={[-5, y(-5, -22), -22]} cols={4} rows={2} rotY={0.15} />
        <LampPost position={[6, y(6, 2), 2]} /><LampPost position={[-4, y(-4, 8), 8]} />
        <Cable pts={[[7, 0.05, -3], [4, 0.05, -9], [3, 0.05, -14.5]]} /><Cable pts={[[4, 0.05, -7], [-2, 0.05, -14], [-5, 0.1, -20.5]]} color="#2a1c16" /><Cable pts={[[6.5, 0.05, -2.5], [4, 0.05, 1.5], [3, 0.05, 3]]} />
      </group>
      <DecalPool kind="foot" max={80} w={0.13} l={0.3} opacity={0.5} /><DecalPool kind="track" max={160} w={0.26} l={0.55} opacity={0.4} /><Footprints h={h} />
      <Sparkles count={low ? 50 : moon ? 80 : 190} scale={[60, 8, 50]} position={[4, 3.5, 0]} size={moon ? 1.2 : 2.4} speed={moon ? 0.08 : 0.55} opacity={moon ? 0.25 : 0.5} color={moon ? "#d8d8de" : "#ffcfa0"} noise={moon ? 0.2 : 1.2} />
      <Rig />
    </>
  );
}
