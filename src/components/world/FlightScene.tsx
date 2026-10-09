import { Suspense, useEffect, useMemo, useRef } from "react";
import { Glb, MODEL_CFG, useAsset } from "./Models";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EarthBall, SceneEnv, fbm, useGroundTexture } from "./kit";
import { SolarPanel } from "./Props";
import * as THREE from "three";
import { ex } from "@/game/explore/store";
import { designMods } from "@/data/design/options";
import { game } from "@/game/engine/store";
import { sfx } from "@/lib/utils/audio";

const GATES = 8, P = { R: 100, O: 140, GM: 1500, moon: false, fuelK: 1 };
const gateAngle = (k: number) => ((k + 1) * Math.PI) / (GATES / 2);
const ATM_V = "varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }";
const ATM_F = "varying vec3 vN; varying vec3 vV; uniform vec3 uC; uniform float uK; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6); gl_FragColor = vec4(uC, f * uK); }";
function Mars() {
  const tex = useGroundTexture(P.moon, 7), u = useMemo(() => ({ uC: { value: new THREE.Color("#ff9560") }, uK: { value: 1.1 } }), []);
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(P.R, 128, 96), p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).normalize(); const n = fbm(v.x * 4 + 9, v.y * 4 + v.z * 3, 5), big = fbm(v.x * 1.4 + 3, v.z * 1.4 + v.y, 3);
      if (P.moon) c.setHSL(0.6, 0.03, 0.2 + 0.2 * n + (big > 0.55 ? -0.07 : 0)); else { c.setHSL(0.045 + 0.014 * big, 0.5 + 0.12 * n, 0.2 + 0.22 * n + (big > 0.58 ? -0.06 : 0.02)); if (Math.abs(v.y) > 0.93) c.set("#e8e4dc"); }
      col.set([c.r, c.g, c.b], i * 3);
      if (P.moon) { const cr = Math.max(0, 1 - Math.abs(fbm(v.x * 9, v.y * 9 + v.z * 7, 2) - 0.5) * 9); const k = 1 - cr * 0.012; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k); }
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
  }, []);
  return <group><mesh geometry={geo}><meshStandardMaterial vertexColors map={tex.map} bumpMap={tex.bump} bumpScale={P.moon ? 2.5 : 1.5} roughness={1} /></mesh>
    {!P.moon && <mesh><sphereGeometry args={[P.R + 7, 64, 48]} /><shaderMaterial vertexShader={ATM_V} fragmentShader={ATM_F} uniforms={u} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>}</group>;
}
function Ship() {
  const fp = useRef(false), body = useRef<THREE.Group>(null), g = useRef<THREE.Group>(null), flame = useRef<THREE.Mesh>(null), keys = useRef<Record<string, boolean>>({}), gates = useRef<(THREE.Mesh | null)[]>([]), glb = useAsset("/models/spaceship.glb");
  const S = useRef({ pos: new THREE.Vector3(P.O, 0, 0), vel: new THREE.Vector3(0, 0, Math.sqrt(P.GM / P.O)), q: new THREE.Quaternion(), gate: 0, assist: true, fuel: 100, acc: 0, t0: 0, msg: 0 });
  const tmp = useMemo(() => ({ f: new THREE.Vector3(), u: new THREE.Vector3(), c: new THREE.Vector3(), dq: new THREE.Quaternion(), e: new THREE.Euler(), cq: new THREE.Quaternion() }), []);
  useEffect(() => {
    ex.resetFlight(); const s = S.current; s.q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 1));
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; if (e.code === "Escape") game.togglePause(); if (e.code === "KeyV") { fp.current = !fp.current; ex.say(fp.current ? "Cockpit view." : "Chase view."); } if (e.code === "KeyX") { s.assist = !s.assist; ex.say(s.assist ? "Flight assist ON." : "Flight assist OFF."); } };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);
  useFrame(({ camera, clock }, raw) => {
    const dt = Math.min(raw, 0.05), s = S.current, k = keys.current, t = tmp; if (game.get().paused || !g.current) return;
    const pit = (k.ArrowUp || k.KeyR ? 1 : 0) - (k.ArrowDown || k.KeyF ? 1 : 0), yaw = (k.KeyA || k.ArrowLeft ? 1 : 0) - (k.KeyD || k.ArrowRight ? 1 : 0), roll = (k.KeyQ ? 1 : 0) - (k.KeyE ? 1 : 0), thr = (k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0) * 0.5;
    t.dq.setFromEuler(t.e.set(-pit * dt * 1.1, yaw * dt * 1.1, roll * dt * 1.5)); s.q.multiply(t.dq).normalize();
    t.f.set(0, 0, 1).applyQuaternion(s.q); const boost = k.ShiftLeft || k.ShiftRight, on = thr !== 0 && s.fuel > 0;
    if (on) { s.vel.addScaledVector(t.f, thr * (boost ? 9 : 4) * dt); s.fuel = Math.max(0, s.fuel - (boost ? 6 : 2) * Math.abs(thr) * dt * P.fuelK); } else s.fuel = Math.min(100, s.fuel + 0.5 * dt);
    const r = s.pos.length(); s.vel.addScaledVector(s.pos, (-P.GM / (r * r * r)) * dt); if (k.Space) s.vel.multiplyScalar(1 - dt * 1.5);
    s.pos.addScaledVector(s.vel, dt);
    if (s.pos.length() < P.R + 1.5) { s.pos.set(P.O, 0, 0); s.vel.set(0, 0, Math.sqrt(P.GM / P.O)); s.q.identity(); ex.say("Atmospheric entry! The ship was reset to orbit."); sfx("fail"); }
    const ga = gateAngle(s.gate % GATES), gp = t.c.set(Math.cos(ga) * P.O, 0, Math.sin(ga) * P.O);
    if (s.pos.distanceTo(gp) < (P.moon ? 6 : 9)) { s.gate++; sfx("ok"); if (s.gate % GATES === 0) ex.say("Full orbit complete! Gates reset."); else ex.say(`Gate ${s.gate % GATES} of ${GATES} passed.`); }
    g.current.position.copy(s.pos); g.current.quaternion.copy(s.q); if (body.current) body.current.visible = !glb && !fp.current; if (flame.current) flame.current.scale.set(1, 1, on ? 1.5 + Math.sin(clock.elapsedTime * 40) * 0.4 : 0.05);
    gates.current.forEach((m, i) => { if (m) (m.material as THREE.MeshBasicMaterial).opacity = i === s.gate % GATES ? 0.95 : 0.25; });
    t.u.set(0, 1, 0).applyQuaternion(s.q); if (fp.current) t.c.copy(s.pos).addScaledVector(t.f, 1.2).addScaledVector(t.u, 0.45); else t.c.copy(s.pos).addScaledVector(t.f, -9).addScaledVector(t.u, 2.6); camera.position.lerp(t.c, 1 - Math.exp(-(fp.current ? 14 : 6) * dt)); camera.up.lerp(t.u, 1 - Math.exp(-4 * dt)); camera.lookAt(s.pos.x + t.f.x * 8, s.pos.y + t.f.y * 8, s.pos.z + t.f.z * 8);
    s.acc += dt; if (s.acc > 0.1) { s.acc = 0; ex.patch({ fl: { ...ex.get().fl, speed: s.vel.length(), alt: s.pos.length() - P.R, fuel: s.fuel, gate: s.gate % GATES, assist: s.assist, laps: Math.floor(s.gate / GATES), msg: null } }); }
  });
  return (<>
    <group ref={g}>
      <group ref={body} visible={!glb}>
      <mesh position={[0, 0, 1.6]} rotation-x={Math.PI / 2} castShadow><coneGeometry args={[0.85, 1.7, 20]} /><meshStandardMaterial color="#d8d3c8" metalness={0.5} roughness={0.35} /></mesh>
      <mesh position={[0, 0, 0.55]} rotation-x={Math.PI / 2} castShadow><cylinderGeometry args={[0.85, 0.85, 0.5, 20]} /><meshStandardMaterial color="#c2a45a" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0, -0.9]} rotation-x={Math.PI / 2} castShadow><cylinderGeometry args={[0.85, 0.85, 2.3, 20]} /><meshStandardMaterial color="#e6e1d6" metalness={0.45} roughness={0.4} /></mesh>
      <mesh position={[0, 0, -2.2]} rotation-x={Math.PI / 2}><coneGeometry args={[0.45, 0.8, 14, 1, true]} /><meshStandardMaterial color="#2a2826" metalness={0.8} roughness={0.35} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0.42, 1.2]}><sphereGeometry args={[0.22, 12, 8]} /><meshStandardMaterial color="#10161f" metalness={0.95} roughness={0.08} /></mesh>
      {[-1, 1].map(x => <group key={x}><mesh position={[x * 1.0, 0, -0.9]}><boxGeometry args={[0.3, 0.05, 0.05]} /><meshStandardMaterial color="#9aa0aa" metalness={0.6} roughness={0.4} /></mesh><group position={[x * 2.1, 0, -0.9]}><SolarPanel w={1.9} l={1.1} tilt={0} /></group></group>)}
      <mesh position={[0, 0.9, -0.2]}><cylinderGeometry args={[0.02, 0.02, 0.8]} /><meshStandardMaterial color="#c9c5bc" /></mesh>
      </group>{glb && <Suspense fallback={null}><Glb url="/models/spaceship.glb" {...MODEL_CFG.ship} /></Suspense>}
      <mesh ref={flame} visible={true} position={[0, 0, -2.7]} rotation-x={-Math.PI / 2}><coneGeometry args={[0.5, 1.8, 12]} /><meshBasicMaterial color="#e8a45a" transparent opacity={0.85} /></mesh>
    </group>
    {Array.from({ length: GATES }, (_, i) => { const a = gateAngle(i), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)));
      return <mesh key={i} ref={el => { gates.current[i] = el; }} position={[Math.cos(a) * P.O, 0, Math.sin(a) * P.O]} quaternion={q}><torusGeometry args={[P.moon ? 5 : 8, 0.25, 8, 40]} /><meshBasicMaterial color="#e8a45a" transparent opacity={0.25} /></mesh>; })}
  </>);
}
export default function FlightScene() {
  const moon = game.get().destination === "moon"; Object.assign(P, moon ? { R: 34, O: 62, GM: 620, moon: true } : { R: 100, O: 140, GM: 1500, moon: false }); P.fuelK = 62 / Math.max(20, designMods(game.get().design, game.get().destination).fuelMargin);
  useEffect(() => { game.markReady("terrain"); }, []);
  return (<><color attach="background" args={["#02030a"]} /><ambientLight intensity={0.12} /><directionalLight position={[3000, 500, 1000]} intensity={3.2} color="#fff0d8" />
    <Stars radius={1800} depth={60} count={5000} factor={7} fade speed={0.4} />
    <EarthBall position={P.moon ? [350, 70, -450] : [1500, 300, -2000]} r={P.moon ? 22 : 40} /><SceneEnv moon intensity={0.35} />
    <mesh position={[3000, 500, 1000]}><sphereGeometry args={[90, 24, 16]} /><meshBasicMaterial color="#fff2d0" toneMapped={false} /></mesh>
    <Mars /><Ship /></>);
}
