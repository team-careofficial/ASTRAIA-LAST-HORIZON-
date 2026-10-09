import { Suspense, useRef } from "react";
import { GlbAstronaut, useAsset } from "./Models";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

const SUIT = "#e2ded5", DARK = "#33312f";
/** Procedural EVA astronaut. If /models/astronaut.glb exists it is used instead (idle / walk / run clips blend by speed). */
export default function Astronaut({ color, speed, acting }: { color: string; speed: { current: number }; acting: { current: number } }) {
  const lL = useRef<Group>(null), lR = useRef<Group>(null), aL = useRef<Group>(null), aR = useRef<Group>(null), body = useRef<Group>(null), head = useRef<Group>(null), ph = useRef(0), ok = useAsset("/models/astronaut.glb");
  useFrame((st, dt) => {
    const v = speed.current, amp = Math.min(1, v / 3), t = st.clock.elapsedTime; ph.current += dt * (3 + v * 1.6);
    const s = Math.sin(ph.current) * amp;
    if (lL.current && lR.current && aL.current && aR.current && body.current) {
      lL.current.rotation.x = s * 0.8; lR.current.rotation.x = -s * 0.8; aL.current.rotation.x = -s * 0.7; aR.current.rotation.x = s * 0.7 - acting.current * 2.2;
      aL.current.rotation.z = -0.08 - Math.sin(t * 1.4) * 0.02 * (1 - amp); aR.current.rotation.z = 0.08 + Math.sin(t * 1.4 + 1) * 0.02 * (1 - amp);
      body.current.position.y = Math.abs(Math.cos(ph.current)) * 0.06 * amp + Math.sin(t * 1.6) * 0.01; body.current.rotation.z = s * 0.04;
      if (head.current) { head.current.rotation.y = Math.sin(t * 0.5) * 0.25 * (1 - amp); head.current.rotation.x = Math.sin(t * 0.8) * 0.04; }
    }
  });
  const suit = <meshStandardMaterial color={SUIT} roughness={0.7} metalness={0.05} />, dark = <meshStandardMaterial color={DARK} roughness={0.85} />;
  return (
    <><group visible={!ok}><group ref={body}>
      {[[-0.14, lL], [0.14, lR]].map(([x, r]) => (
        <group key={x as number} ref={r as React.RefObject<Group>} position={[x as number, 0.9, 0]}>
          <mesh castShadow position={[0, -0.22, 0]}><capsuleGeometry args={[0.1, 0.32, 4, 10]} />{suit}</mesh>
          <mesh castShadow position={[0, -0.58, 0]}><capsuleGeometry args={[0.085, 0.3, 4, 10]} />{suit}</mesh>
          <mesh position={[0, -0.4, 0.07]}><sphereGeometry args={[0.1, 8, 8]} />{dark}</mesh>
          <mesh castShadow position={[0, -0.86, 0.05]}><boxGeometry args={[0.18, 0.12, 0.3]} />{dark}</mesh>
        </group>))}
      <mesh castShadow position={[0, 1.27, 0]}><capsuleGeometry args={[0.27, 0.34, 6, 14]} />{suit}</mesh>
      <mesh position={[0, 0.95, 0]} scale={[1, 1, 0.8]}><cylinderGeometry args={[0.27, 0.25, 0.1, 14]} />{dark}</mesh>
      <mesh castShadow position={[0, 1.3, -0.28]}><boxGeometry args={[0.46, 0.62, 0.2]} /><meshStandardMaterial color="#cfcac0" roughness={0.55} metalness={0.3} /></mesh>
      <mesh position={[0, 1.62, -0.3]}><boxGeometry args={[0.3, 0.1, 0.16]} />{dark}</mesh>
      <mesh position={[0, 1.34, 0.26]}><boxGeometry args={[0.24, 0.16, 0.04]} /><meshStandardMaterial color="#3a3a3e" roughness={0.5} metalness={0.4} /></mesh>
      <mesh position={[0, 1.34, 0.285]}><boxGeometry args={[0.14, 0.05, 0.01]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} /></mesh>
      <mesh position={[-0.2, 1.45, 0.22]}><boxGeometry args={[0.1, 0.06, 0.02]} /><meshStandardMaterial color={color} /></mesh>
      <group ref={head} position={[0, 1.78, 0]}>
        <mesh castShadow><sphereGeometry args={[0.26, 24, 18]} />{suit}</mesh>
        <mesh position={[0, 0.0, 0.1]} scale={[1, 0.82, 0.78]}><sphereGeometry args={[0.215, 24, 18]} /><meshStandardMaterial color="#b88a3c" roughness={0.08} metalness={1} envMapIntensity={1.6} /></mesh>
        <mesh position={[0, -0.2, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.2, 0.04, 8, 18]} />{dark}</mesh>
      </group>
      {[[-0.38, aL], [0.38, aR]].map(([x, r]) => (
        <group key={x as number} ref={r as React.RefObject<Group>} position={[x as number, 1.5, 0]}>
          <mesh castShadow position={[0, -0.18, 0]}><capsuleGeometry args={[0.085, 0.26, 4, 10]} />{suit}</mesh>
          <mesh castShadow position={[0, -0.5, 0.02]}><capsuleGeometry args={[0.075, 0.22, 4, 10]} />{suit}</mesh>
          <mesh position={[0, -0.72, 0.02]}><sphereGeometry args={[0.09, 10, 10]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
        </group>))}
    </group></group>{ok && <Suspense fallback={null}><GlbAstronaut url="/models/astronaut.glb" speed={speed} /></Suspense>}</>
  );
}
