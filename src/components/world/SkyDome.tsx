import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface SkyState { top: THREE.Color; hor: THREE.Color; sun: THREE.Vector3; glow: number }
export const makeSky = (): SkyState => ({ top: new THREE.Color("#8a5a48"), hor: new THREE.Color("#d9a074"), sun: new THREE.Vector3(0.5, 0.4, -0.3), glow: 1 });
const VERT = "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const FRAG = "varying vec3 vP; uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSun; uniform float uGlow; void main(){ float h = clamp(vP.y, 0.0, 1.0); vec3 c = mix(uHor, uTop, pow(h, 0.5)); float s = max(dot(normalize(vP), normalize(uSun)), 0.0); c += vec3(1.0, 0.72, 0.45) * pow(s, 28.0) * uGlow + vec3(1.0, 0.6, 0.35) * pow(s, 5.0) * 0.28 * uGlow; gl_FragColor = vec4(c, 1.0); }";
/** Gradient sky dome that follows the camera. Mutate `sky` each frame to animate. */
export default function SkyDome({ sky }: { sky: SkyState }) {
  const g = useRef<THREE.Mesh>(null);
  const u = useMemo(() => ({ uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3() }, uGlow: { value: 1 } }), []);
  useFrame(({ camera }) => { u.uTop.value.copy(sky.top); u.uHor.value.copy(sky.hor); u.uSun.value.copy(sky.sun); u.uGlow.value = sky.glow; g.current?.position.copy(camera.position); });
  return <mesh ref={g} frustumCulled={false} renderOrder={-10}><sphereGeometry args={[500, 32, 16]} /><shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={u} side={THREE.BackSide} depthWrite={false} fog={false} /></mesh>;
}
